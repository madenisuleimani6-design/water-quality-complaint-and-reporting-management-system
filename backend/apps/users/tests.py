from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import StaffUser


class StaffUserAPITests(APITestCase):
    def setUp(self):
        self.supervisor = StaffUser.objects.create_user(
            username="super1",
            password="pass12345",
            role="supervisor",
        )
        StaffUser.objects.create_user(
            username="officer1",
            password="pass12345",
            role="field_officer",
        )

    def test_list_users_requires_supervisor(self):
        url = reverse("staff-user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.supervisor)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["results"]), 1)

    def test_jwt_login(self):
        url = reverse("token_obtain_pair")
        response = self.client.post(
            url,
            {"username": "super1", "password": "pass12345"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
