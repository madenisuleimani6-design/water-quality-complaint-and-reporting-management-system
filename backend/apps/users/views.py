from rest_framework import mixins, viewsets

from apps.complaints.permissions import IsSupervisorOrAbove

from .models import StaffUser
from .serializers import StaffUserSerializer


class StaffUserViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = StaffUser.objects.filter(is_active=True).order_by("username")
    serializer_class = StaffUserSerializer
    permission_classes = [IsSupervisorOrAbove]
