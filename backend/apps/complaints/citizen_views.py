from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from .citizen_auth import (
    CitizenJWTAuthentication,
    CitizenTokenRefreshSerializer,
    IsCitizenAuthenticated,
    IsRegistrationAuthenticated,
    issue_citizen_tokens,
    issue_registration_tokens,
)
from .models import CitizenAccount
from .otp_service import OtpError, send_otp, verify_otp
from .serializers import (
    CitizenAccountSerializer,
    CitizenLoginSerializer,
    CitizenProfilePatchSerializer,
    CitizenRegisterSerializer,
    OtpSendSerializer,
    OtpVerifySerializer,
)


class CitizenOtpSendView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OtpSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data["phone"]
        try:
            session_id, expires_in, dev_code = send_otp(phone)
        except OtpError as exc:
            return Response(
                {"detail": exc.message, "code": exc.code},
                status=status.HTTP_429_TOO_MANY_REQUESTS
                if exc.code == "cooldown_active"
                else status.HTTP_400_BAD_REQUEST,
            )

        payload = {
            "sessionId": session_id,
            "expiresIn": expires_in,
            "phone": phone,
        }
        if dev_code is not None:
            payload["devCode"] = dev_code
        return Response(payload)


class CitizenOtpVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data["phone"]
        session_id = str(serializer.validated_data["sessionId"])
        code = serializer.validated_data["code"]

        try:
            verify_otp(session_id, phone, code)
        except OtpError as exc:
            status_code = status.HTTP_400_BAD_REQUEST
            if exc.code in ("expired", "invalid_session"):
                status_code = status.HTTP_410_GONE
            elif exc.code == "too_many_attempts":
                status_code = status.HTTP_429_TOO_MANY_REQUESTS
            return Response(
                {"detail": exc.message, "code": exc.code},
                status=status_code,
            )

        account = CitizenAccount.objects.filter(phone=phone).first()
        if account:
            tokens = issue_citizen_tokens(account)
            return Response(
                {
                    "status": "existing",
                    "account": CitizenAccountSerializer(account).data,
                    **tokens,
                },
            )

        tokens = issue_registration_tokens(phone)
        return Response(
            {
                "status": "new",
                "phone": phone,
                **tokens,
            },
        )


class CitizenRegisterView(APIView):
    authentication_classes = [CitizenJWTAuthentication]
    permission_classes = [IsRegistrationAuthenticated]

    def post(self, request):
        phone = getattr(request, "registration_phone", None)
        if not phone:
            return Response(
                {"detail": "Registration token required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = CitizenRegisterSerializer(
            data=request.data,
            context={"phone": phone},
        )
        if not serializer.is_valid():
            phone_errors = serializer.errors.get("phone", [])
            is_duplicate = any(
                "already registered" in str(item) for item in phone_errors
            )
            status_code = (
                status.HTTP_409_CONFLICT if is_duplicate else status.HTTP_400_BAD_REQUEST
            )
            return Response(serializer.errors, status=status_code)

        try:
            account = serializer.save()
        except serializers.ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_409_CONFLICT)

        tokens = issue_citizen_tokens(account)
        return Response(
            {
                "account": CitizenAccountSerializer(account).data,
                **tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class CitizenLoginView(APIView):
    """Legacy name+phone login (deprecated; kept for backward compatibility)."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CitizenLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data["phone"]
        full_name = serializer.validated_data["fullName"]

        try:
            account = CitizenAccount.objects.get(phone=phone, full_name__iexact=full_name)
        except CitizenAccount.DoesNotExist:
            return Response(
                {"detail": "Account not found. Check your name and phone number."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(CitizenAccountSerializer(account).data)


class CitizenProfileMeView(APIView):
    authentication_classes = [CitizenJWTAuthentication]
    permission_classes = [IsCitizenAuthenticated]

    def get(self, request):
        account = request.citizen
        return Response(CitizenAccountSerializer(account).data)

    def patch(self, request):
        account = request.citizen
        serializer = CitizenProfilePatchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = serializer.update_account(account)
        except serializers.ValidationError as exc:
            detail = exc.detail
            is_duplicate = "newPhone" in detail and any(
                "already registered" in str(item) for item in detail["newPhone"]
            )
            status_code = (
                status.HTTP_409_CONFLICT if is_duplicate else status.HTTP_400_BAD_REQUEST
            )
            return Response(detail, status=status_code)

        return Response(CitizenAccountSerializer(account).data)


class CitizenTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    serializer_class = CitizenTokenRefreshSerializer
