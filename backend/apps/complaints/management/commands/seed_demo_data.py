"""
Seed mock staff (roles) and sample complaints for dashboard demo.
Usage: python manage.py seed_demo_data
"""

from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from PIL import Image, ImageDraw

from apps.complaints.models import CitizenAccount, CitizenMessage, Complaint, ComplaintLog
from apps.users.models import StaffUser

MOCK_COMPLAINTS = [
    {
        "area_name": "Kinondoni",
        "latitude": -6.7924,
        "longitude": 39.2083,
        "note": "Water appears brown and has an unusual smell near the main road.",
        "phone": "0712345678",
        "status": Complaint.STATUS_NEW,
    },
    {
        "area_name": "Temeke",
        "latitude": -6.8498,
        "longitude": 39.2695,
        "note": "Low water pressure for three days; muddy residue in tap water.",
        "phone": "0755123456",
        "status": Complaint.STATUS_NEW,
    },
    {
        "area_name": "Ilala",
        "latitude": -6.8235,
        "longitude": 39.2695,
        "note": "Burst pipe suspected. Standing water with oily film.",
        "phone": "0788111222",
        "status": Complaint.STATUS_ASSIGNED,
        "assign_to": "officer_mwamba",
    },
    {
        "area_name": "Ubungo",
        "latitude": -6.7697,
        "longitude": 39.2083,
        "note": "Residents reporting chlorine taste is unusually strong.",
        "phone": "0766778899",
        "status": Complaint.STATUS_INVESTIGATING,
        "assign_to": "officer_kassim",
    },
    {
        "area_name": "Kigamboni",
        "latitude": -6.8833,
        "longitude": 39.4167,
        "note": "Sewage smell near water kiosk; children reported stomach issues.",
        "phone": "0711998877",
        "status": Complaint.STATUS_INVESTIGATING,
        "assign_to": "officer_mwamba",
    },
    {
        "area_name": "Mikocheni",
        "latitude": -6.7489,
        "longitude": 39.2456,
        "note": "Clear water but sand particles visible after settling.",
        "phone": "0744332211",
        "status": Complaint.STATUS_RESOLVED,
        "assign_to": "officer_kassim",
    },
    {
        "area_name": "Sinza",
        "latitude": -6.7789,
        "longitude": 39.2189,
        "note": "Night-time discolouration in apartment block supply.",
        "phone": "0733221100",
        "status": Complaint.STATUS_NEW,
    },
    {
        "area_name": "Mbagala",
        "latitude": -6.9167,
        "longitude": 39.2833,
        "note": "Tanker delivery water looks yellow; residents want testing.",
        "phone": "0722113344",
        "status": Complaint.STATUS_ASSIGNED,
        "assign_to": "supervisor_nyoni",
    },
]

MOCK_CITIZEN = {
    "phone": "+255712345678",
    "full_name": "Amina Hassan",
    "email": "amina.hassan@example.com",
    "area": "Kinondoni, Dar es Salaam",
    "latitude": -6.7924,
    "longitude": 39.2083,
}

MOCK_CITIZEN_COMPLAINTS = [
    {
        "area_name": "Kinondoni",
        "latitude": -6.7924,
        "longitude": 39.2083,
        "note": "Tap water is brown in the morning. Smell like rust near Block C.",
        "status": Complaint.STATUS_NEW,
    },
    {
        "area_name": "Mikocheni",
        "latitude": -6.7489,
        "longitude": 39.2456,
        "note": "Low pressure for two days. Neighbours report similar issues.",
        "status": Complaint.STATUS_ASSIGNED,
        "assign_to": "officer_mwamba",
    },
    {
        "area_name": "Sinza",
        "latitude": -6.7789,
        "longitude": 39.2189,
        "note": "White particles visible after water settles in a glass.",
        "status": Complaint.STATUS_INVESTIGATING,
        "assign_to": "officer_kassim",
    },
    {
        "area_name": "Ubungo",
        "latitude": -6.7697,
        "longitude": 39.2083,
        "note": "Strong chlorine taste near the market water point.",
        "status": Complaint.STATUS_RESOLVED,
        "assign_to": "officer_kassim",
    },
]

MOCK_CITIZEN_MESSAGES = [
    "Hello, I submitted a report about brown water in Kinondoni. Any update?",
    "The pressure improved yesterday but discolouration returned this morning.",
]

STAFF_USERS = [
    {
        "username": "supervisor_nyoni",
        "email": "nyoni@dawasa.go.tz",
        "role": "supervisor",
        "first_name": "Asha",
        "last_name": "Nyoni",
    },
    {
        "username": "officer_mwamba",
        "email": "mwamba@dawasa.go.tz",
        "role": "field_officer",
        "first_name": "Juma",
        "last_name": "Mwamba",
    },
    {
        "username": "officer_kassim",
        "email": "kassim@dawasa.go.tz",
        "role": "field_officer",
        "first_name": "Fatma",
        "last_name": "Kassim",
    },
    {
        "username": "viewer_hassan",
        "email": "hassan@dawasa.go.tz",
        "role": "viewer",
        "first_name": "Omar",
        "last_name": "Hassan",
    },
]


def make_placeholder_photo(label: str, color: tuple[int, int, int]) -> ContentFile:
    image = Image.new("RGB", (400, 300), color=color)
    draw = ImageDraw.Draw(image)
    draw.rectangle((20, 20, 380, 280), outline=(255, 255, 255), width=3)
    draw.text((40, 130), label[:28], fill=(255, 255, 255))
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue(), name=f"{label.replace(' ', '_').lower()}.jpg")


class Command(BaseCommand):
    help = "Seed demo staff users and mock water quality complaints"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing demo complaints before seeding",
        )
        parser.add_argument(
            "--citizen-only",
            action="store_true",
            help="Seed only the mock citizen account and their data",
        )

    def _seed_mock_citizen(self, staff_map: dict[str, StaffUser]) -> None:
        citizen, created = CitizenAccount.objects.update_or_create(
            phone=MOCK_CITIZEN["phone"],
            defaults={
                "full_name": MOCK_CITIZEN["full_name"],
                "email": MOCK_CITIZEN["email"],
                "area": MOCK_CITIZEN["area"],
                "latitude": MOCK_CITIZEN["latitude"],
                "longitude": MOCK_CITIZEN["longitude"],
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created citizen: {citizen.full_name}"))
        else:
            self.stdout.write(f"Updated citizen: {citizen.full_name}")

        colors = [
            (0, 122, 255),
            (79, 172, 254),
            (37, 99, 235),
            (14, 165, 233),
        ]
        complaint_count = 0

        for index, entry in enumerate(MOCK_CITIZEN_COMPLAINTS):
            data = entry.copy()
            if Complaint.objects.filter(
                phone=MOCK_CITIZEN["phone"],
                area_name=data["area_name"],
                note=data["note"],
            ).exists():
                continue

            assign_username = data.pop("assign_to", None)
            assignee = staff_map.get(assign_username) if assign_username else None
            status = data.pop("status")

            complaint = Complaint(
                **data,
                phone=MOCK_CITIZEN["phone"],
                reporter_name=MOCK_CITIZEN["full_name"],
                status=status,
                assigned_to=assignee,
            )
            complaint.photo.save(
                f"citizen_demo_{index}.jpg",
                make_placeholder_photo(
                    f"{data['area_name']} report",
                    colors[index % len(colors)],
                ),
                save=False,
            )
            complaint.save()

            ComplaintLog.objects.create(
                complaint=complaint,
                action="Complaint received from citizen app",
                performed_by=None,
                note="Seeded for mock citizen demo",
            )
            if assignee:
                ComplaintLog.objects.create(
                    complaint=complaint,
                    action=f"Assigned to {assignee.get_full_name() or assignee.username}",
                    performed_by=staff_map.get("supervisor_nyoni"),
                )
            complaint_count += 1

        message_count = 0
        for body in MOCK_CITIZEN_MESSAGES:
            if CitizenMessage.objects.filter(
                phone=MOCK_CITIZEN["phone"],
                body=body,
            ).exists():
                continue
            CitizenMessage.objects.create(
                body=body,
                phone=MOCK_CITIZEN["phone"],
                full_name=MOCK_CITIZEN["full_name"],
                email=MOCK_CITIZEN["email"],
                area=MOCK_CITIZEN["area"],
            )
            message_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Mock citizen ready: {MOCK_CITIZEN['full_name']} "
                f"({MOCK_CITIZEN['phone']} / 0712345678) — "
                f"{complaint_count} complaint(s), {message_count} message(s). "
                f"Login via OTP; code prints in this terminal when OTP_MOCK_MODE=true.",
            ),
        )

    def handle(self, *args, **options):
        staff_map: dict[str, StaffUser] = {}
        for entry in STAFF_USERS:
            user, created = StaffUser.objects.get_or_create(
                username=entry["username"],
                defaults={
                    "email": entry["email"],
                    "role": entry["role"],
                    "first_name": entry["first_name"],
                    "last_name": entry["last_name"],
                    "is_staff": True,
                },
            )
            if created:
                user.set_password("demo12345")
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created staff: {user.username}"))
            else:
                self.stdout.write(f"Staff exists: {user.username}")
            staff_map[user.username] = user

        if options["citizen_only"]:
            self._seed_mock_citizen(staff_map)
            return

        if options["clear"]:
            deleted, _ = Complaint.objects.filter(
                phone__in=[c["phone"] for c in MOCK_COMPLAINTS],
            ).delete()
            self.stdout.write(f"Cleared {deleted} existing demo complaint(s)")

        colors = [
            (0, 122, 255),
            (79, 172, 254),
            (15, 23, 42),
            (37, 99, 235),
            (14, 165, 233),
        ]
        created_count = 0

        for index, entry in enumerate(MOCK_COMPLAINTS):
            data = entry.copy()
            if Complaint.objects.filter(phone=data["phone"], area_name=data["area_name"]).exists():
                continue

            assign_username = data.pop("assign_to", None)
            assignee = staff_map.get(assign_username) if assign_username else None
            status = data.pop("status")

            complaint = Complaint(
                **data,
                status=status,
                assigned_to=assignee,
            )
            complaint.photo.save(
                f"demo_{index}.jpg",
                make_placeholder_photo(data["area_name"], colors[index % len(colors)]),
                save=False,
            )
            complaint.save()

            ComplaintLog.objects.create(
                complaint=complaint,
                action="Demo complaint received from citizen app",
                performed_by=None,
                note="Seeded for dashboard demonstration",
            )
            if assignee:
                ComplaintLog.objects.create(
                    complaint=complaint,
                    action=f"Assigned to {assignee.get_full_name() or assignee.username}",
                    performed_by=staff_map.get("supervisor_nyoni"),
                )

            created_count += 1

        self._seed_mock_citizen(staff_map)

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created_count} complaint(s). "
                f"Staff demo password: demo12345",
            ),
        )
