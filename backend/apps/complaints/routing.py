from django.urls import re_path

from .consumers import ComplaintStatusConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/complaints/(?P<complaint_id>[0-9a-f-]+)/$",
        ComplaintStatusConsumer.as_asgi(),
    ),
]
