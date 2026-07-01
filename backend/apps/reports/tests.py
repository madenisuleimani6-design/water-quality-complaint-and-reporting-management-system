from datetime import date, datetime
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.complaints.models import Complaint
from apps.reports.generator import generate_monthly_report
from apps.reports.hotspot import cluster_hotspots, haversine_meters
from apps.reports.models import Report
from apps.users.models import StaffUser


def make_photo():
    buffer = BytesIO()
    Image.new("RGB", (32, 32), color="blue").save(buffer, format="JPEG")
    return SimpleUploadedFile(
        "test.jpg",
        buffer.getvalue(),
        content_type="image/jpeg",
    )


class HotspotTests(TestCase):
    def test_haversine_zero_for_same_point(self):
        self.assertEqual(haversine_meters(-6.79, 39.20, -6.79, 39.20), 0.0)

    def test_cluster_hotspots_minimum_size(self):
        base_lat, base_lng = -6.7924, 39.2083
        complaints = [
            Complaint(
                latitude=base_lat + i * 0.0001,
                longitude=base_lng + i * 0.0001,
                status=Complaint.STATUS_NEW,
            )
            for i in range(3)
        ]
        hotspots = cluster_hotspots(complaints, radius_meters=500, min_cluster_size=3)
        self.assertEqual(len(hotspots), 1)
        self.assertEqual(hotspots[0].complaint_count, 3)


class ReportGeneratorTests(TestCase):
    def test_generate_monthly_report_creates_pdf(self):
        complaint = Complaint(
            photo=make_photo(),
            latitude=-6.7924,
            longitude=39.2083,
            area_name="Kinondoni",
            status=Complaint.STATUS_RESOLVED,
        )
        complaint.save()
        Complaint.objects.filter(pk=complaint.pk).update(
            submitted_at=timezone.make_aware(datetime(2026, 5, 15, 12, 0, 0)),
        )

        report = generate_monthly_report(2026, 5)
        self.assertTrue(report.pdf_file.name.endswith(".pdf"))
        self.assertEqual(report.total_complaints, 1)

        again = generate_monthly_report(2026, 5)
        self.assertEqual(Report.objects.filter(month=date(2026, 5, 1)).count(), 1)
        self.assertEqual(again.id, report.id)


class ReportAPITests(APITestCase):
    def setUp(self):
        self.user = StaffUser.objects.create_user(
            username="admin2",
            password="pass12345",
            role="admin",
        )
        self.report = Report.objects.create(
            month=date(2026, 5, 1),
            pdf_file=SimpleUploadedFile("report.pdf", b"%PDF-1.4", content_type="application/pdf"),
            total_complaints=1,
            hotspot_count=0,
            resolution_rate=100.0,
        )

    def test_list_reports(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("report-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_report(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("report-generate")
        response = self.client.post(url, {"year": 2026, "month": 4}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
