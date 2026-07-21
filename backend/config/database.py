from __future__ import annotations

import os
from pathlib import Path

import dj_database_url


def build_databases(base_dir: Path) -> dict:
    """Configure Django database settings for SQLite, PostgreSQL, or MySQL."""
    if os.environ.get("USE_MYSQL", "").lower() in ("1", "true", "yes"):
        return {
            "default": {
                "ENGINE": "django.db.backends.mysql",
                "NAME": os.environ.get("MYSQL_DATABASE", os.environ.get("MYSQL_DB", "dawasa_water_quality")),
                "USER": os.environ.get("MYSQL_USER", "root"),
                "PASSWORD": os.environ.get("MYSQL_PASSWORD", ""),
                "HOST": os.environ.get("MYSQL_HOST", "localhost"),
                "PORT": os.environ.get("MYSQL_PORT", "3306"),
            }
        }

    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        return {
            "default": dj_database_url.parse(
                database_url,
                conn_max_age=600,
                ssl_require=False,
            )
        }

    sqlite_name = os.environ.get("SQLITE_DB_NAME", "db.sqlite3")
    sqlite_path = Path(sqlite_name)
    if not sqlite_path.is_absolute():
        sqlite_path = base_dir / sqlite_path

    return {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": str(sqlite_path),
        }
    }
