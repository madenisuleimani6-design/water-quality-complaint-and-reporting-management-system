"""
Django Unfold theme: DAWASA blue sidebar navigation.
"""

from django.templatetags.static import static
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

DAWASA_BLUE = {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#4FACFE",
    "500": "#007AFF",
    "600": "#0066d6",
    "700": "#0052b3",
    "800": "#003d85",
    "900": "#002952",
    "950": "#001a33",
}


def unfold_callback(request):
    return {
        "SITE_TITLE": _("DAWASA Water Quality"),
        "SITE_HEADER": _("DAWASA Admin"),
        "SITE_SUBHEADER": _("Complaint & reporting dashboard"),
        "SITE_SYMBOL": "water_drop",
        "SHOW_HISTORY": True,
        "SHOW_VIEW_ON_SITE": False,
        "THEME": "light",
        "BORDER_RADIUS": "8px",
        "COLORS": {
            "primary": DAWASA_BLUE,
        },
        "STYLES": [
            lambda _request: static("admin/css/dawasa-admin.css"),
        ],
        "SIDEBAR": {
            "show_search": True,
            "show_all_applications": False,
            "navigation": [
                {
                    "title": _("Dashboard"),
                    "separator": True,
                    "items": [
                        {
                            "title": _("Overview"),
                            "icon": "dashboard",
                            "link": reverse_lazy("admin:index"),
                        },
                    ],
                },
                {
                    "title": _("Complaints"),
                    "collapsible": True,
                    "items": [
                        {
                            "title": _("All complaints"),
                            "icon": "report",
                            "link": reverse_lazy("admin:complaints_complaint_changelist"),
                        },
                        {
                            "title": _("Map view"),
                            "icon": "map",
                            "link": reverse_lazy("admin:complaints_complaint_map"),
                        },
                        {
                            "title": _("Citizen messages"),
                            "icon": "mail",
                            "link": reverse_lazy(
                                "admin:complaints_citizenmessage_changelist",
                            ),
                        },
                    ],
                },
                {
                    "title": _("Citizens"),
                    "collapsible": True,
                    "items": [
                        {
                            "title": _("Registered citizens"),
                            "icon": "person",
                            "link": reverse_lazy(
                                "admin:complaints_citizenaccount_changelist",
                            ),
                        },
                        {
                            "title": _("Citizens map"),
                            "icon": "map",
                            "link": reverse_lazy(
                                "admin:complaints_citizenaccount_map",
                            ),
                        },
                    ],
                },
                {
                    "title": _("Staff & reports"),
                    "collapsible": True,
                    "items": [
                        {
                            "title": _("Staff & roles"),
                            "icon": "group",
                            "link": reverse_lazy("admin:users_staffuser_changelist"),
                        },
                        {
                            "title": _("Monthly reports"),
                            "icon": "analytics",
                            "link": reverse_lazy("admin:reports_report_changelist"),
                        },
                        {
                            "title": _("Audit log"),
                            "icon": "history",
                            "link": reverse_lazy("admin:complaints_complaintlog_changelist"),
                        },
                    ],
                },
            ],
        },
    }
