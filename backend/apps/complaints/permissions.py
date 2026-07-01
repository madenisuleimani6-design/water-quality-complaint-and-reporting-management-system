from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.users.models import StaffUser

STAFF_ROLES = {"admin", "supervisor", "field_officer", "viewer"}


def _role(user) -> str | None:
    if not user or not user.is_authenticated:
        return None
    return getattr(user, "role", None)


class IsViewerOrAbove(BasePermission):
    """Any authenticated staff user."""

    def has_permission(self, request, view):
        return _role(request.user) in STAFF_ROLES


class IsFieldOfficerOrAbove(BasePermission):
    def has_permission(self, request, view):
        return _role(request.user) in {"admin", "supervisor", "field_officer"}


class IsSupervisorOrAbove(BasePermission):
    def has_permission(self, request, view):
        return _role(request.user) in {"admin", "supervisor"}


class IsAdminOrSupervisor(BasePermission):
    def has_permission(self, request, view):
        return _role(request.user) in {"admin", "supervisor"}


class ComplaintObjectPermission(BasePermission):
    """Read for all staff; write for field officers on assigned complaints; assign for supervisors+."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return IsViewerOrAbove().has_permission(request, view)
        return IsFieldOfficerOrAbove().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        role = _role(request.user)
        if request.method in SAFE_METHODS:
            return role in {"admin", "supervisor", "field_officer", "viewer"}
        if role in {"admin", "supervisor"}:
            return True
        if role == "field_officer":
            return obj.assigned_to_id == request.user.id
        return False
