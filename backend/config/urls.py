from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as media_serve
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.complaints.urls import message_urlpatterns

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/complaints/", include("apps.complaints.urls")),
    path("api/citizens/", include("apps.complaints.citizen_urls")),
    path("api/messages/", include(message_urlpatterns)),
    path("api/users/", include("apps.users.urls")),
    path("api/reports/", include("apps.reports.urls")),
]

# Serve uploaded complaint photos in all environments (required for production PWA).
if settings.MEDIA_ROOT:
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            media_serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
