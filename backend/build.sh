#!/usr/bin/env bash
set -o errexit

export DJANGO_SETTINGS_MODULE=config.settings.production

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput
# Create superuser only when env vars are set and no superuser exists yet (empty DB safety net).
python manage.py createsuperuser --noinput 2>/dev/null || true
