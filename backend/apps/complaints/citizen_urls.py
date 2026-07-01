from django.urls import path

from .citizen_views import (
    CitizenLoginView,
    CitizenOtpSendView,
    CitizenOtpVerifyView,
    CitizenProfileMeView,
    CitizenRegisterView,
    CitizenTokenRefreshView,
)

urlpatterns = [
    path("otp/send/", CitizenOtpSendView.as_view(), name="citizen-otp-send"),
    path("otp/verify/", CitizenOtpVerifyView.as_view(), name="citizen-otp-verify"),
    path("token/refresh/", CitizenTokenRefreshView.as_view(), name="citizen-token-refresh"),
    path("register/", CitizenRegisterView.as_view(), name="citizen-register"),
    path("login/", CitizenLoginView.as_view(), name="citizen-login"),
    path("me/", CitizenProfileMeView.as_view(), name="citizen-profile-me"),
]
