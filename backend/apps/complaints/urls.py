from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .message_views import CitizenMessageListCreateView
from .views import ComplaintViewSet

router = DefaultRouter()
router.register(r"", ComplaintViewSet, basename="complaint")

urlpatterns = [
    path("", include(router.urls)),
]

message_urlpatterns = [
    path("", CitizenMessageListCreateView.as_view(), name="citizen-message-list-create"),
]
