"""
Development settings — SQLite database, in-memory channel layer.
"""

import hashlib

from .base import *  # noqa: F403

DEBUG = True

# RFC 7518 recommends >= 32 byte HMAC keys for HS256 JWT signing.
if len(SECRET_KEY) < 32:  # noqa: F405
    SIMPLE_JWT = {  # noqa: F405
        **SIMPLE_JWT,
        "SIGNING_KEY": hashlib.sha256(
            f"{SECRET_KEY}-dawasa-jwt-signing".encode(),
        ).hexdigest(),
    }

# Allow LAN devices (Expo on physical phones) to reach the API in local dev.
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "10.0.2.2", "[::1]", "*"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://192\.168\.\d+\.\d+:\d+$",
    r"^http://10\.\d+\.\d+\.\d+:\d+$",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "apps.complaints.otp_service": {
            "handlers": ["console"],
            "level": "INFO",
        },
    },
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}
