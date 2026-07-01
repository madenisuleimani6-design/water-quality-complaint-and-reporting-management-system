from datetime import timedelta

from django.conf import settings
from rest_framework import authentication, exceptions, serializers
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from .models import CitizenAccount
from .phone_utils import is_valid_tz_phone, normalize_tz_phone

TOKEN_TYPE_CITIZEN = "citizen"
TOKEN_TYPE_REGISTRATION = "registration"
AUTH_KIND_CLAIM = "auth_kind"


class CitizenAccessToken(AccessToken):
    token_type = "access"


class CitizenRefreshToken(RefreshToken):
    access_token_class = CitizenAccessToken

    @classmethod
    def for_citizen(cls, account: CitizenAccount) -> "CitizenRefreshToken":
        token = cls()
        token[AUTH_KIND_CLAIM] = TOKEN_TYPE_CITIZEN
        token["citizen_id"] = str(account.pk)
        token["phone"] = account.phone
        token.access_token[AUTH_KIND_CLAIM] = TOKEN_TYPE_CITIZEN
        token.access_token["citizen_id"] = str(account.pk)
        token.access_token["phone"] = account.phone
        return token


class RegistrationAccessToken(AccessToken):
    token_type = "access"
    lifetime = timedelta(
        minutes=getattr(settings, "CITIZEN_REGISTRATION_TOKEN_LIFETIME_MINUTES", 15),
    )


class RegistrationRefreshToken(RefreshToken):
    access_token_class = RegistrationAccessToken
    lifetime = timedelta(
        minutes=getattr(settings, "CITIZEN_REGISTRATION_TOKEN_LIFETIME_MINUTES", 15),
    )

    @classmethod
    def for_phone(cls, phone: str) -> "RegistrationRefreshToken":
        token = cls()
        token[AUTH_KIND_CLAIM] = TOKEN_TYPE_REGISTRATION
        token["phone"] = phone
        token.access_token[AUTH_KIND_CLAIM] = TOKEN_TYPE_REGISTRATION
        token.access_token["phone"] = phone
        return token


def issue_citizen_tokens(account: CitizenAccount) -> dict:
    refresh = CitizenRefreshToken.for_citizen(account)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def issue_registration_tokens(phone: str) -> dict:
    refresh = RegistrationRefreshToken.for_phone(phone)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def get_token_from_request(request) -> dict | None:
    auth_header = authentication.get_authorization_header(request).split()
    if not auth_header or auth_header[0].lower() != b"bearer":
        return None
    if len(auth_header) == 1:
        raise exceptions.AuthenticationFailed("Invalid authorization header.")
    if len(auth_header) > 2:
        raise exceptions.AuthenticationFailed("Invalid authorization header.")
    try:
        return AccessToken(auth_header[1].decode("utf-8"))
    except TokenError as exc:
        raise exceptions.AuthenticationFailed("Invalid or expired token.") from exc


class CitizenJWTAuthentication(JWTAuthentication):
    """Authenticate citizens via custom token claims; staff via default JWT."""

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None

        payload = validated_token.payload
        token_type = payload.get(AUTH_KIND_CLAIM)
        if token_type == TOKEN_TYPE_CITIZEN:
            citizen_id = validated_token.get("citizen_id")
            try:
                citizen = CitizenAccount.objects.get(pk=citizen_id)
            except CitizenAccount.DoesNotExist as exc:
                raise exceptions.AuthenticationFailed(
                    "Citizen account not found.",
                ) from exc
            request.citizen = citizen
            return (citizen, validated_token)

        if token_type == TOKEN_TYPE_REGISTRATION:
            request.citizen = None
            request.registration_phone = payload.get("phone")
            return (None, validated_token)

        if api_settings.USER_ID_CLAIM in payload:
            return super().authenticate(request)

        # Valid JWT but not a staff token — do not fall through to staff auth.
        return None


class IsCitizenAuthenticated(BasePermission):
    def has_permission(self, request, view):
        auth = getattr(request, "auth", None)
        if auth is None:
            return False
        payload = auth.payload if hasattr(auth, "payload") else auth
        return payload.get(AUTH_KIND_CLAIM) == TOKEN_TYPE_CITIZEN


class IsRegistrationAuthenticated(BasePermission):
    def has_permission(self, request, view):
        auth = getattr(request, "auth", None)
        if auth is None:
            return False
        payload = auth.payload if hasattr(auth, "payload") else auth
        return payload.get(AUTH_KIND_CLAIM) == TOKEN_TYPE_REGISTRATION


def phone_match_candidates(phone: str) -> set[str]:
    candidates = {phone}
    if is_valid_tz_phone(phone):
        normalized = normalize_tz_phone(phone)
        candidates.add(normalized)
        if normalized.startswith("+255"):
            candidates.add(f"0{normalized[4:]}")
    return candidates


class IsCitizenComplaintOwner(BasePermission):
    """Citizen JWT may only read complaints tied to their phone number."""

    def has_permission(self, request, view):
        return IsCitizenAuthenticated().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        citizen = getattr(request, "citizen", None)
        if citizen is None:
            return False
        return obj.phone in phone_match_candidates(citizen.phone)


class CitizenTokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField(read_only=True)

    def validate(self, attrs):
        refresh = CitizenRefreshToken(attrs["refresh"])
        data = {"access": str(refresh.access_token)}

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass
            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()
            data["refresh"] = str(refresh)

        return data
