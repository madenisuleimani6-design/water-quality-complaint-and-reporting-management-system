from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from apps.users.models import StaffUser

from .models import CitizenAccount, CitizenMessage, Complaint, ComplaintLog
from .phone_utils import is_valid_tz_phone, normalize_tz_phone

MAX_PHOTO_SIZE = 5 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/jpg"}
COORDINATE_QUANTIZE = Decimal("0.000001")


def normalize_coordinate(value) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value)).quantize(COORDINATE_QUANTIZE, rounding=ROUND_HALF_UP)


def build_complaint_photo_url(photo, request) -> str | None:
    if not photo:
        return None
    url = photo.url
    if request is not None:
        return request.build_absolute_uri(url)
    return url


class ComplaintSummarySerializer(serializers.ModelSerializer):
    areaName = serializers.CharField(source="area_name", read_only=True)
    submittedAt = serializers.DateTimeField(source="submitted_at", read_only=True)
    photoUrl = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = ("id", "status", "areaName", "submittedAt", "note", "photoUrl")

    def get_photoUrl(self, obj: Complaint) -> str | None:
        return build_complaint_photo_url(obj.photo, self.context.get("request"))


class CitizenComplaintDetailSerializer(serializers.ModelSerializer):
    areaName = serializers.CharField(source="area_name", read_only=True)
    submittedAt = serializers.DateTimeField(source="submitted_at", read_only=True)
    photoUrl = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = (
            "id",
            "status",
            "areaName",
            "submittedAt",
            "note",
            "photoUrl",
            "latitude",
            "longitude",
        )

    def get_photoUrl(self, obj: Complaint) -> str | None:
        return build_complaint_photo_url(obj.photo, self.context.get("request"))


class ComplaintCreateSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    reporterName = serializers.CharField(
        source="reporter_name",
        required=False,
        allow_blank=True,
        max_length=255,
    )

    class Meta:
        model = Complaint
        fields = (
            "photo",
            "latitude",
            "longitude",
            "note",
            "phone",
            "area_name",
            "reporterName",
        )

    def validate_photo(self, photo):
        if photo.size > MAX_PHOTO_SIZE:
            raise serializers.ValidationError("Photo must be 5 MB or smaller.")
        content_type = getattr(photo, "content_type", "") or ""
        if content_type and content_type not in ALLOWED_PHOTO_TYPES:
            raise serializers.ValidationError("Photo must be JPEG or PNG.")
        return photo

    def validate_latitude(self, value):
        if value is None:
            return value
        if value < -90 or value > 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return round(value, 6)

    def validate_longitude(self, value):
        if value is None:
            return value
        if value < -180 or value > 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return round(value, 6)

    def validate_phone(self, value):
        if not value or not str(value).strip():
            return ""
        if not is_valid_tz_phone(value):
            raise serializers.ValidationError("Enter a valid Tanzania mobile number.")
        return normalize_tz_phone(value)

    def create(self, validated_data):
        return Complaint.objects.create(**validated_data)


class ComplaintLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(
        source="performed_by.username",
        read_only=True,
        default=None,
    )

    class Meta:
        model = ComplaintLog
        fields = ("id", "action", "note", "performed_by_name", "timestamp")
        read_only_fields = fields


class ComplaintDetailSerializer(serializers.ModelSerializer):
    logs = ComplaintLogSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
        default=None,
    )

    class Meta:
        model = Complaint
        fields = (
            "id",
            "photo",
            "latitude",
            "longitude",
            "area_name",
            "note",
            "phone",
            "status",
            "assigned_to",
            "assigned_to_name",
            "submitted_at",
            "updated_at",
            "logs",
        )
        read_only_fields = (
            "id",
            "photo",
            "latitude",
            "longitude",
            "area_name",
            "note",
            "phone",
            "submitted_at",
            "updated_at",
            "logs",
            "assigned_to_name",
        )


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ("status", "assigned_to")

    def validate_assigned_to(self, value):
        if value is not None and not StaffUser.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Invalid staff user.")
        return value


class ComplaintNoteSerializer(serializers.Serializer):
    note = serializers.CharField(max_length=2000)


class CitizenMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=5000)

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        citizen = self.context["request"].citizen
        return CitizenMessage.objects.create(
            body=validated_data["message"],
            phone=citizen.phone,
            full_name=citizen.full_name,
            email=citizen.email or "",
            area=citizen.area or "",
            status=CitizenMessage.STATUS_SENT,
        )


class CitizenMessageSerializer(serializers.ModelSerializer):
    message = serializers.CharField(source="body", read_only=True)
    sentAt = serializers.DateTimeField(source="submitted_at", read_only=True)
    adminReply = serializers.CharField(source="admin_reply", read_only=True)
    adminRepliedAt = serializers.DateTimeField(
        source="admin_replied_at",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = CitizenMessage
        fields = (
            "id",
            "message",
            "sentAt",
            "status",
            "adminReply",
            "adminRepliedAt",
        )


class CitizenMessageResponseSerializer(CitizenMessageSerializer):
    pass


class CitizenAccountSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    secondaryPhone = serializers.CharField(
        source="secondary_phone",
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = CitizenAccount
        fields = (
            "id",
            "phone",
            "fullName",
            "secondaryPhone",
            "email",
            "area",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class CitizenRegisterSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=255)
    area = serializers.CharField(max_length=255, required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)

    def validate_fullName(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name is required.")
        return value.strip()

    def validate_area(self, value):
        if not value:
            return ""
        return value.strip()[:255]

    def validate_latitude(self, value):
        return normalize_coordinate(value)

    def validate_longitude(self, value):
        return normalize_coordinate(value)

    def create(self, validated_data):
        phone = self.context["phone"]
        if CitizenAccount.objects.filter(phone=phone).exists():
            raise serializers.ValidationError(
                {"phone": "This phone number is already registered."},
            )
        return CitizenAccount.objects.create(
            phone=phone,
            full_name=validated_data["fullName"],
            area=validated_data.get("area", ""),
            latitude=validated_data.get("latitude"),
            longitude=validated_data.get("longitude"),
        )


class OtpSendSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)

    def validate_phone(self, value):
        if not is_valid_tz_phone(value):
            raise serializers.ValidationError("Enter a valid Tanzania mobile number.")
        return normalize_tz_phone(value)


class OtpVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    sessionId = serializers.UUIDField()
    code = serializers.CharField(min_length=4, max_length=4)

    def validate_phone(self, value):
        if not is_valid_tz_phone(value):
            raise serializers.ValidationError("Enter a valid Tanzania mobile number.")
        return normalize_tz_phone(value)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Code must be numeric.")
        return value


class CitizenLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    fullName = serializers.CharField(max_length=255)

    def validate_phone(self, value):
        if not is_valid_tz_phone(value):
            raise serializers.ValidationError("Enter a valid Tanzania mobile number.")
        return normalize_tz_phone(value)

    def validate_fullName(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name is required.")
        return value.strip()


class CitizenProfilePatchSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=255, required=False, allow_blank=True)
    secondaryPhone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    area = serializers.CharField(max_length=255, required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    newPhone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_newPhone(self, value):
        if not value:
            return value
        if not is_valid_tz_phone(value):
            raise serializers.ValidationError("Enter a valid Tanzania mobile number.")
        return normalize_tz_phone(value)

    def validate_secondaryPhone(self, value):
        if value and not is_valid_tz_phone(value):
            raise serializers.ValidationError("Enter a valid Tanzania mobile number.")
        return normalize_tz_phone(value) if value else ""

    def validate_area(self, value):
        if not value:
            return ""
        return value.strip()[:255]

    def validate_latitude(self, value):
        return normalize_coordinate(value)

    def validate_longitude(self, value):
        return normalize_coordinate(value)

    def update_account(self, account: CitizenAccount) -> CitizenAccount:
        new_phone = self.validated_data.get("newPhone")
        if new_phone and new_phone != account.phone:
            if (
                CitizenAccount.objects.filter(phone=new_phone)
                .exclude(pk=account.pk)
                .exists()
            ):
                raise serializers.ValidationError(
                    {"newPhone": ["This phone number is already registered."]},
                )
            account.phone = new_phone

        if self.validated_data.get("fullName") is not None:
            account.full_name = self.validated_data["fullName"].strip()
        if "secondaryPhone" in self.validated_data:
            account.secondary_phone = self.validated_data["secondaryPhone"]
        if "email" in self.validated_data:
            account.email = self.validated_data.get("email", "")
        if "area" in self.validated_data:
            account.area = self.validated_data.get("area", "")
        if "latitude" in self.validated_data:
            account.latitude = self.validated_data.get("latitude")
        if "longitude" in self.validated_data:
            account.longitude = self.validated_data.get("longitude")
        account.save()
        return account


# Legacy alias for tests importing CitizenProfileUpdateSerializer
CitizenProfileUpdateSerializer = CitizenProfilePatchSerializer
