"""Project package — PyMySQL shim when MySQL backend is used."""

import os

if os.environ.get("USE_MYSQL", "").lower() in ("1", "true", "yes"):
    try:
        import pymysql

        pymysql.install_as_MySQLdb()
    except ImportError:
        pass
