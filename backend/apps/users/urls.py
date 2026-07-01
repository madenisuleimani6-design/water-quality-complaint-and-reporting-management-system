from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import StaffUserViewSet

router = DefaultRouter()
router.register(r"", StaffUserViewSet, basename="staff-user")

urlpatterns = [
    path("", include(router.urls)),
]
