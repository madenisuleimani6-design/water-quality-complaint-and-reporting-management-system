import json

from django.contrib import admin
from django.utils import timezone

from apps.complaints.models import Complaint


def _patch_admin_index():
    original_index = admin.site.index

    def custom_index(request, extra_context=None):
        extra_context = extra_context or {}
        now = timezone.now()
        month_qs = Complaint.objects.filter(
            submitted_at__year=now.year,
            submitted_at__month=now.month,
        )
        extra_context.update(
            {
                "stats": {
                    "total_month": month_qs.count(),
                    "new": month_qs.filter(
                        status=Complaint.STATUS_NEW,
                        assigned_to__isnull=True,
                    ).count(),
                    "in_progress": month_qs.filter(
                        status__in=[
                            Complaint.STATUS_ASSIGNED,
                            Complaint.STATUS_INVESTIGATING,
                        ],
                    ).count(),
                    "resolved": month_qs.filter(status=Complaint.STATUS_RESOLVED).count(),
                },
                "new_complaints": Complaint.objects.filter(
                    status=Complaint.STATUS_NEW,
                    assigned_to__isnull=True,
                ).select_related("assigned_to")[:8],
                "recent_complaints": Complaint.objects.select_related(
                    "assigned_to",
                )[:10],
            },
        )
        return original_index(request, extra_context)

    admin.site.index = custom_index


_patch_admin_index()
