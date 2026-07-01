import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class StaffUser(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("supervisor", "Supervisor"),
        ("field_officer", "Field Officer"),
        ("viewer", "Viewer"),
    ]

    ASSIGNABLE_ROLES = ("field_officer", "supervisor")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="viewer")

    @classmethod
    def assignable_staff(cls):
        """Staff who can be assigned complaints (operators / field team)."""
        return cls.objects.filter(is_active=True, role__in=cls.ASSIGNABLE_ROLES)

    def can_assign_complaints(self) -> bool:
        return self.role in ("admin", "supervisor")

    def can_update_complaint(self, complaint) -> bool:
        if self.role in ("admin", "supervisor"):
            return True
        if self.role == "field_officer":
            return complaint.assigned_to_id == self.id
        return False

    class Meta:
        verbose_name = "staff user"
        verbose_name_plural = "staff users"
