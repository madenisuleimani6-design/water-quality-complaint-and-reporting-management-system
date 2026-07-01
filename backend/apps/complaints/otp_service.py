import hashlib
import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import PhoneOtpSession
from .phone_utils import normalize_tz_phone

logger = logging.getLogger(__name__)


class OtpError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _generate_code(length: int) -> str:
    upper = 10**length
    return str(secrets.randbelow(upper)).zfill(length)


def send_sms(phone: str, code: str) -> None:
    """Stub for production SMS integration (Africa's Talking, Twilio, etc.)."""
    if getattr(settings, "OTP_MOCK_MODE", True):
        logger.info("OTP mock SMS to %s: code=%s", phone, code)
        print(
            f"\n{'=' * 56}\n"
            f"  DEV OTP  |  phone: {phone}  |  code: {code}\n"
            f"{'=' * 56}\n",
            flush=True,
        )
        return
    logger.warning("SMS provider not configured; OTP not sent to %s", phone)


def send_otp(phone: str) -> tuple[str, str, int | None]:
    """
    Create OTP session and dispatch SMS.
    Returns (session_id, expires_in_seconds, dev_code_or_none).
    """
    phone = normalize_tz_phone(phone)
    cooldown = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 60)
    ttl = getattr(settings, "OTP_TTL_SECONDS", 300)
    code_length = getattr(settings, "OTP_LENGTH", 4)
    mock_mode = getattr(settings, "OTP_MOCK_MODE", True)

    latest = (
        PhoneOtpSession.objects.filter(phone=phone)
        .order_by("-created_at")
        .first()
    )
    if latest and timezone.now() - latest.created_at < timedelta(seconds=cooldown):
        raise OtpError(
            "cooldown_active",
            "Please wait before requesting another code.",
        )

    code = _generate_code(code_length)
    session = PhoneOtpSession.objects.create(
        phone=phone,
        code_hash=_hash_code(code),
        expires_at=timezone.now() + timedelta(seconds=ttl),
    )

    send_sms(phone, code)
    dev_code = code if mock_mode else None
    return str(session.id), ttl, dev_code


def verify_otp(session_id: str, phone: str, code: str) -> None:
    phone = normalize_tz_phone(phone)
    try:
        session = PhoneOtpSession.objects.get(pk=session_id, phone=phone)
    except PhoneOtpSession.DoesNotExist:
        raise OtpError("invalid_session", "Invalid or expired verification session.")

    if timezone.now() > session.expires_at:
        raise OtpError("expired", "Verification code has expired.")

    max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 5)
    if session.attempts >= max_attempts:
        raise OtpError("too_many_attempts", "Too many failed attempts. Request a new code.")

    if _hash_code(code.strip()) != session.code_hash:
        session.attempts += 1
        session.save(update_fields=["attempts"])
        raise OtpError("invalid_code", "Invalid verification code.")

    session.delete()
