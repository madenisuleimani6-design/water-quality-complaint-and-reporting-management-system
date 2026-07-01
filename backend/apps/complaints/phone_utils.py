import re

TZ_PHONE_PATTERN = re.compile(r"^(\+255|0)[67]\d{8}$")


def is_valid_tz_phone(phone: str) -> bool:
    normalized = phone.replace(" ", "")
    return bool(TZ_PHONE_PATTERN.match(normalized))


def normalize_tz_phone(phone: str) -> str:
    trimmed = phone.replace(" ", "")
    if trimmed.startswith("0"):
        return f"+255{trimmed[1:]}"
    return trimmed
