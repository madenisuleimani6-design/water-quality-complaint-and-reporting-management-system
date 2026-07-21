from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.complaints.citizen_auth import issue_citizen_tokens, issue_registration_tokens
from apps.complaints.models import CitizenAccount, CitizenMessage, Complaint, ComplaintLog
from apps.complaints.serializers import build_complaint_photo_url
from apps.users.models import StaffUser


def _registration_auth(phone: str) -> dict:
    tokens = issue_registration_tokens(phone)
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


def _citizen_auth(account: CitizenAccount) -> dict:
    tokens = issue_citizen_tokens(account)
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


def _otp_verify(client, phone: str = "0712345678") -> dict:
    send = client.post(
        reverse("citizen-otp-send"),
        {"phone": phone},
        format="json",
    )
    session_id = send.data["sessionId"]
    code = send.data.get("devCode", "0000")
    return client.post(
        reverse("citizen-otp-verify"),
        {"phone": phone, "sessionId": session_id, "code": code},
        format="json",
    )


def make_test_photo():
    buffer = BytesIO()
    Image.new("RGB", (32, 32), color="red").save(buffer, format="JPEG")
    return SimpleUploadedFile(
        "test.jpg",
        buffer.getvalue(),
        content_type="image/jpeg",
    )


class ComplaintModelTests(TestCase):
    @override_settings(PUBLIC_MEDIA_BASE_URL="https://cdn.example.com")
    def test_photo_url_uses_public_media_base_when_configured(self):
        complaint = Complaint.objects.create(
            photo=make_test_photo(),
            latitude=-6.7924,
            longitude=39.2083,
        )

        self.assertEqual(
            build_complaint_photo_url(complaint.photo, None),
            "https://cdn.example.com/media/complaints/photos/test.jpg",
        )

    def test_create_complaint_with_location(self):
        complaint = Complaint.objects.create(
            photo=make_test_photo(),
            latitude=-6.7924,
            longitude=39.2083,
            area_name="Kinondoni",
            note="Water appears brown",
            phone="0712345678",
        )

        self.assertEqual(complaint.status, Complaint.STATUS_NEW)
        self.assertEqual(complaint.phone, "0712345678")

    def test_status_change_creates_complaint_log(self):
        complaint = Complaint.objects.create(
            photo=make_test_photo(),
            latitude=-6.7924,
            longitude=39.2083,
        )

        complaint.status = Complaint.STATUS_ASSIGNED
        complaint.save()

        logs = ComplaintLog.objects.filter(complaint=complaint)
        self.assertEqual(logs.count(), 1)
        self.assertIn("Assigned", logs.first().action)


class ComplaintAPITests(APITestCase):
    def test_create_complaint_multipart(self):
        url = reverse("complaint-list")
        response = self.client.post(
            url,
            {
                "photo": make_test_photo(),
                "latitude": "-6.7924",
                "longitude": "39.2083",
                "note": "Brown water",
                "phone": "0712345678",
                "reporterName": "Jane Citizen",
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["status"], "new")
        complaint = Complaint.objects.get(pk=response.data["id"])
        self.assertEqual(complaint.reporter_name, "Jane Citizen")

    def test_create_complaint_requires_photo(self):
        url = reverse("complaint-list")
        response = self.client.post(url, {"phone": "0712345678"}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_complaints_by_phone(self):
        Complaint.objects.create(
            photo=make_test_photo(),
            phone="0711111111",
            area_name="A",
        )
        Complaint.objects.create(
            photo=make_test_photo(),
            phone="0722222222",
            area_name="B",
        )
        url = reverse("complaint-list")
        response = self.client.get(url, {"phone": "0711111111"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["areaName"], "A")

    def test_list_complaints_matches_normalized_phone(self):
        Complaint.objects.create(
            photo=make_test_photo(),
            phone="+255711111111",
            area_name="Normalized",
        )
        url = reverse("complaint-list")
        response = self.client.get(url, {"phone": "0711111111"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["areaName"], "Normalized")

    def test_list_complaints_by_phone_with_citizen_jwt(self):
        account = CitizenAccount.objects.create(
            phone="+255712345678",
            full_name="Amina Hassan",
        )
        Complaint.objects.create(
            photo=make_test_photo(),
            phone="+255712345678",
            area_name="Kinondoni",
            reporter_name="Amina Hassan",
        )
        url = reverse("complaint-list")
        response = self.client.get(
            url,
            {"phone": "+255712345678"},
            **_citizen_auth(account),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["areaName"], "Kinondoni")

    def test_otp_login_then_list_complaints(self):
        CitizenAccount.objects.create(phone="+255712345678", full_name="Amina Hassan")
        Complaint.objects.create(
            photo=make_test_photo(),
            phone="+255712345678",
            area_name="Kinondoni",
            note="Brown water",
        )
        verify = _otp_verify(self.client)
        self.assertEqual(verify.status_code, status.HTTP_200_OK)
        access = verify.data["access"]

        response = self.client.get(
            reverse("complaint-list"),
            {"phone": "+255712345678"},
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertIn("photoUrl", response.data["results"][0])

    def test_citizen_retrieve_own_complaint(self):
        account = CitizenAccount.objects.create(
            phone="+255712345678",
            full_name="Amina Hassan",
        )
        complaint = Complaint.objects.create(
            photo=make_test_photo(),
            phone="+255712345678",
            area_name="Kinondoni",
            note="Brown water in tap",
        )
        url = reverse("complaint-detail", kwargs={"pk": complaint.id})
        response = self.client.get(url, **_citizen_auth(account))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["areaName"], "Kinondoni")
        self.assertEqual(response.data["note"], "Brown water in tap")
        self.assertIn("photoUrl", response.data)

    def test_patch_requires_auth(self):
        complaint = Complaint.objects.create(photo=make_test_photo())
        url = reverse("complaint-detail", kwargs={"pk": complaint.id})
        response = self.client.patch(url, {"status": "assigned"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class CitizenAccountAPITests(APITestCase):
    def test_register_citizen(self):
        url = reverse("citizen-register")
        response = self.client.post(
            url,
            {"fullName": "Jane Citizen"},
            format="json",
            **_registration_auth("+255712345678"),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["account"]["fullName"], "Jane Citizen")
        self.assertEqual(response.data["account"]["phone"], "+255712345678")
        self.assertIn("access", response.data)
        self.assertEqual(CitizenAccount.objects.count(), 1)

    def test_register_duplicate_phone_returns_conflict(self):
        CitizenAccount.objects.create(phone="+255712345678", full_name="Jane Citizen")
        url = reverse("citizen-register")
        response = self.client.post(
            url,
            {"fullName": "Other Person"},
            format="json",
            **_registration_auth("+255712345678"),
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_login_with_matching_name_and_phone(self):
        CitizenAccount.objects.create(phone="+255712345678", full_name="Jane Citizen")
        url = reverse("citizen-login")
        response = self.client.post(
            url,
            {"phone": "0712345678", "fullName": "Jane Citizen"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone"], "+255712345678")

    def test_login_with_wrong_name_returns_not_found(self):
        CitizenAccount.objects.create(phone="+255712345678", full_name="Jane Citizen")
        url = reverse("citizen-login")
        response = self.client.post(
            url,
            {"phone": "0712345678", "fullName": "Wrong Name"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_register_citizen_with_location(self):
        url = reverse("citizen-register")
        response = self.client.post(
            url,
            {
                "fullName": "John Citizen",
                "area": "Kinondoni",
                "latitude": "-6.792354",
                "longitude": "39.208328",
            },
            format="json",
            **_registration_auth("+255712345679"),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        account = CitizenAccount.objects.get(phone="+255712345679")
        self.assertEqual(account.area, "Kinondoni")
        self.assertEqual(str(account.latitude), "-6.792354")
        self.assertEqual(str(account.longitude), "39.208328")

    def test_register_rounds_high_precision_coordinates(self):
        url = reverse("citizen-register")
        response = self.client.post(
            url,
            {
                "fullName": "GPS User",
                "latitude": -6.792354123456789,
                "longitude": 39.208328987654321,
            },
            format="json",
            **_registration_auth("+255712345740"),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        account = CitizenAccount.objects.get(phone="+255712345740")
        self.assertEqual(str(account.latitude), "-6.792354")
        self.assertEqual(str(account.longitude), "39.208329")

    def test_get_citizen_profile_me(self):
        account = CitizenAccount.objects.create(
            phone="+255712345678",
            full_name="Jane Citizen",
        )
        url = reverse("citizen-profile-me")
        response = self.client.get(url, **_citizen_auth(account))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["fullName"], "Jane Citizen")

    def test_update_citizen_profile(self):
        account = CitizenAccount.objects.create(
            phone="+255712345678",
            full_name="Jane Citizen",
            area="Kinondoni",
        )
        url = reverse("citizen-profile-me")
        response = self.client.patch(
            url,
            {
                "fullName": "Jane M. Citizen",
                "area": "Temeke",
            },
            format="json",
            **_citizen_auth(account),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        account.refresh_from_db()
        self.assertEqual(account.full_name, "Jane M. Citizen")
        self.assertEqual(account.area, "Temeke")
        self.assertEqual(response.data["secondaryPhone"], "")

    def test_update_citizen_profile_location(self):
        account = CitizenAccount.objects.create(
            phone="+255712345680",
            full_name="Mary Citizen",
        )
        url = reverse("citizen-profile-me")
        response = self.client.patch(
            url,
            {
                "area": "Ubungo",
                "latitude": "-6.800000",
                "longitude": "39.250000",
            },
            format="json",
            **_citizen_auth(account),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        account.refresh_from_db()
        self.assertEqual(account.area, "Ubungo")
        self.assertEqual(str(account.latitude), "-6.800000")
        self.assertEqual(str(account.longitude), "39.250000")

    def test_profile_me_requires_citizen_token(self):
        url = reverse("citizen-profile-me")
        response = self.client.get(url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )


class CitizenOtpAuthTests(APITestCase):
    def test_otp_send_returns_session_and_dev_code(self):
        response = self.client.post(
            reverse("citizen-otp-send"),
            {"phone": "0712345678"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("sessionId", response.data)
        self.assertIn("devCode", response.data)
        self.assertEqual(len(response.data["devCode"]), 4)

    def test_otp_verify_existing_user_returns_account_and_tokens(self):
        CitizenAccount.objects.create(phone="+255712345678", full_name="Jane Citizen")
        response = _otp_verify(self.client)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "existing")
        self.assertEqual(response.data["account"]["fullName"], "Jane Citizen")
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_otp_verify_new_user_returns_registration_token(self):
        response = _otp_verify(self.client, phone="0712345679")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "new")
        self.assertEqual(response.data["phone"], "+255712345679")
        self.assertIn("access", response.data)

    def test_otp_verify_invalid_code(self):
        send = self.client.post(
            reverse("citizen-otp-send"),
            {"phone": "0712345678"},
            format="json",
        )
        response = self.client.post(
            reverse("citizen-otp-verify"),
            {
                "phone": "0712345678",
                "sessionId": send.data["sessionId"],
                "code": "0000",
            },
            format="json",
        )
        if send.data.get("devCode") == "0000":
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        else:
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(response.data["code"], "invalid_code")

    def test_citizen_token_refresh_preserves_auth_kind(self):
        account = CitizenAccount.objects.create(
            phone="+255712345678",
            full_name="Jane Citizen",
        )
        tokens = issue_citizen_tokens(account)
        response = self.client.post(
            reverse("citizen-token-refresh"),
            {"refresh": tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

        me = self.client.get(
            reverse("citizen-profile-me"),
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}",
        )
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["fullName"], "Jane Citizen")


class CitizenMessageAPITests(APITestCase):
    def setUp(self):
        self.account = CitizenAccount.objects.create(
            phone="+255712345678",
            full_name="Jane Citizen",
            email="jane@example.com",
            area="Kinondoni",
        )
        self.access = issue_citizen_tokens(self.account)["access"]

    def test_create_message(self):
        url = reverse("citizen-message-list-create")
        response = self.client.post(
            url,
            {"message": "Hello DAWASA"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {self.access}",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "sent")
        self.assertEqual(CitizenMessage.objects.count(), 1)
        message = CitizenMessage.objects.get()
        self.assertEqual(message.phone, self.account.phone)
        self.assertEqual(message.full_name, "Jane Citizen")

    def test_create_message_requires_auth(self):
        url = reverse("citizen-message-list-create")
        response = self.client.post(
            url,
            {"message": "Hello DAWASA"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_message_requires_body(self):
        url = reverse("citizen-message-list-create")
        response = self.client.post(
            url,
            {"message": ""},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {self.access}",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_messages_includes_admin_reply(self):
        CitizenMessage.objects.create(
            body="Need help with brown water",
            phone=self.account.phone,
            full_name=self.account.full_name,
            status=CitizenMessage.STATUS_SENT,
            admin_reply="We have dispatched a team to your area.",
        )
        url = reverse("citizen-message-list-create")
        response = self.client.get(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.access}",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["message"], "Need help with brown water")
        self.assertEqual(
            response.data[0]["adminReply"],
            "We have dispatched a team to your area.",
        )

