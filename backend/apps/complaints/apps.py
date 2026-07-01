from django.apps import AppConfig


class ComplaintsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.complaints"
    label = "complaints"

    def ready(self):
        import apps.complaints.signals  # noqa: F401
        import config.admin_dashboard  # noqa: F401
