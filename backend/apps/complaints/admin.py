
from django.conf import settings
from django.contrib import admin, messages
from django.shortcuts import redirect, render
from django.urls import path, reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline

from apps.complaints.context import reset_performed_by, set_performed_by
from apps.users.models import StaffUser

from .mapbox_utils import mapbox_token_status
from .models import CitizenAccount, CitizenMessage, Complaint, ComplaintLog

STATUS_MAP_COLORS = {
    Complaint.STATUS_NEW: "#dc2626",
    Complaint.STATUS_ASSIGNED: "#ca8a04",
    Complaint.STATUS_INVESTIGATING: "#007AFF",
    Complaint.STATUS_RESOLVED: "#16a34a",
}


def _mapbox_admin_context():
    token = settings.MAPBOX_TOKEN
    return {
        "mapbox_token": token,
        "mapbox_token_status": mapbox_token_status(token),
    }


class ComplaintLogInline(TabularInline):
    model = ComplaintLog
    extra = 0
    readonly_fields = ("action", "performed_by", "note", "timestamp")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Complaint)
class ComplaintAdmin(ModelAdmin):
    list_display = (
        "photo_thumbnail",
        "location_display",
        "reporter_name",
        "phone",
        "submitted_at",
        "status_badge",
        "assigned_to_display",
        "assign_action",
    )
    list_filter = ("status", "submitted_at", "assigned_to")
    search_fields = ("area_name", "note", "id", "phone", "reporter_name")
    readonly_fields = ("submitted_at", "updated_at", "photo_preview", "map_embed")
    inlines = [ComplaintLogInline]
    actions = ["assign_to_staff"]
    change_form_template = "admin/complaints/complaint_change_form.html"

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "photo",
                    "photo_preview",
                    "latitude",
                    "longitude",
                    "map_embed",
                    "area_name",
                    "reporter_name",
                    "phone",
                    "note",
                ),
            },
        ),
        (
            "Assignment & workflow",
            {
                "description": (
                    "Supervisors and admins can assign field officers. "
                    "Assigning staff automatically sets status to Assigned."
                ),
                "fields": ("status", "assigned_to", "submitted_at", "updated_at"),
            },
        ),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "map/",
                self.admin_site.admin_view(self.map_view),
                name="complaints_complaint_map",
            ),
        ]
        return custom + urls

    def has_change_permission(self, request, obj=None):
        if not request.user.is_authenticated:
            return False
        role = getattr(request.user, "role", "viewer")
        if role == "viewer":
            return False
        if obj is None:
            return role in ("admin", "supervisor", "field_officer")
        return request.user.can_update_complaint(obj) or request.user.can_assign_complaints()

    def has_delete_permission(self, request, obj=None):
        return getattr(request.user, "role", None) == "admin"

    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        role = getattr(request.user, "role", "viewer")
        if role == "field_officer":
            readonly.extend(["assigned_to"])
        if role == "viewer":
            readonly.extend(["status", "assigned_to", "photo"])
        return readonly

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "assigned_to":
            kwargs["queryset"] = StaffUser.assignable_staff().order_by("username")
            kwargs["help_text"] = (
                "Only field officers and supervisors can be assigned complaints."
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        role = getattr(request.user, "role", "viewer")
        if change and "assigned_to" in form.changed_data:
            if not request.user.can_assign_complaints():
                messages.error(request, "Only supervisors can reassign complaints.")
                return
            if obj.assigned_to and obj.status == Complaint.STATUS_NEW:
                obj.status = Complaint.STATUS_ASSIGNED

        if change and "status" in form.changed_data and role == "field_officer":
            if obj.assigned_to_id != request.user.id:
                messages.error(request, "You can only update complaints assigned to you.")
                return

        token = set_performed_by(request.user)
        try:
            super().save_model(request, obj, form, change)
        finally:
            reset_performed_by(token)

    @admin.action(description="Assign selected to staff / operator")
    def assign_to_staff(self, request, queryset):
        if not request.user.can_assign_complaints():
            self.message_user(
                request,
                "Only supervisors and admins can assign complaints.",
                level=messages.ERROR,
            )
            return

        selected = request.POST.getlist("_selected_action")
        if "apply" in request.POST and request.POST.get("staff_id"):
            staff = StaffUser.assignable_staff().filter(pk=request.POST["staff_id"]).first()
            if not staff:
                self.message_user(request, "Invalid staff member.", level=messages.ERROR)
                return redirect(request.get_full_path())

            token = set_performed_by(request.user)
            try:
                updated = 0
                for complaint in queryset:
                    complaint.assigned_to = staff
                    complaint.status = Complaint.STATUS_ASSIGNED
                    complaint.save()
                    updated += 1
            finally:
                reset_performed_by(token)

            self.message_user(
                request,
                f"Assigned {updated} complaint(s) to {staff.get_full_name() or staff.username}.",
            )
            return redirect("admin:complaints_complaint_changelist")

        return render(
            request,
            "admin/complaints/assign_staff.html",
            {
                **self.admin_site.each_context(request),
                "complaints": queryset,
                "assignable_staff": StaffUser.assignable_staff(),
                "title": "Assign complaints",
            },
        )

    def _complaint_map_features(self, complaints):
        features = []
        for complaint in complaints:
            if complaint.latitude is None or complaint.longitude is None:
                continue
            assigned = ""
            if complaint.assigned_to:
                assigned = (
                    complaint.assigned_to.get_full_name()
                    or complaint.assigned_to.username
                )
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [complaint.longitude, complaint.latitude],
                    },
                    "properties": {
                        "id": str(complaint.id),
                        "status": complaint.status,
                        "statusLabel": complaint.get_status_display(),
                        "label": complaint.area_name or "Unknown area",
                        "phone": complaint.phone or "No phone",
                        "assigned": assigned or "Unassigned",
                        "note": (complaint.note[:120] + "...") if len(complaint.note) > 120 else complaint.note,
                        "submitted": complaint.submitted_at.strftime("%d %b %Y, %H:%M"),
                        "lat": f"{complaint.latitude:.6f}",
                        "lng": f"{complaint.longitude:.6f}",
                        "color": STATUS_MAP_COLORS.get(complaint.status, "#64748b"),
                        "url": reverse(
                            "admin:complaints_complaint_change",
                            args=[complaint.id],
                        ),
                    },
                },
            )
        return features

    def change_view(self, request, object_id, form_url="", extra_context=None):
        extra_context = extra_context or {}
        extra_context.update(_mapbox_admin_context())
        return super().change_view(request, object_id, form_url, extra_context)

    def map_view(self, request):
        complaints = (
            Complaint.objects.exclude(
                latitude__isnull=True,
                longitude__isnull=True,
            )
            .select_related("assigned_to")
            .order_by("-submitted_at")
        )
        features = self._complaint_map_features(complaints)
        status_counts = {
            status: complaints.filter(status=status).count()
            for status, _ in Complaint.STATUS_CHOICES
        }
        complaints_list = [
            {
                "id": props["id"],
                "label": props["label"],
                "status": props["status"],
                "status_label": props["statusLabel"],
                "color": props["color"],
            }
            for props in (f["properties"] for f in features)
        ]
        context = {
            **self.admin_site.each_context(request),
            **_mapbox_admin_context(),
            "title": "Complaint Map",
            "geojson": {"type": "FeatureCollection", "features": features},
            "complaint_count": len(features),
            "complaints_list": complaints_list,
            "status_counts": status_counts,
            "opts": self.model._meta,
        }
        return render(request, "admin/complaints/map.html", context)

    @admin.display(description="Photo")
    def photo_thumbnail(self, obj: Complaint):
        if not obj.photo:
            return "-"
        return format_html(
            '<img src="{}" width="48" height="48" style="object-fit:cover;border-radius:4px;" />',
            obj.photo.url,
        )

    @admin.display(description="Preview")
    def photo_preview(self, obj: Complaint):
        if not obj.photo:
            return "-"
        return format_html(
            '<img src="{}" style="max-width:480px;border-radius:8px;" />',
            obj.photo.url,
        )

    @admin.display(description="Map")
    def map_embed(self, obj: Complaint):
        if obj.latitude is None or obj.longitude is None:
            return "No coordinates"
        return format_html(
            '<div id="complaint-map" data-lat="{}" data-lng="{}"></div>',
            obj.latitude,
            obj.longitude,
        )

    @admin.display(description="Location")
    def location_display(self, obj: Complaint):
        if obj.area_name:
            return obj.area_name
        if obj.latitude is not None and obj.longitude is not None:
            return f"{obj.latitude:.5f}, {obj.longitude:.5f}"
        return "Location unavailable"

    @admin.display(description="Assigned to")
    def assigned_to_display(self, obj: Complaint):
        if not obj.assigned_to:
            return mark_safe('<span style="color:#dc2626;">Unassigned</span>')
        return f"{obj.assigned_to.get_full_name() or obj.assigned_to.username} ({obj.assigned_to.get_role_display()})"

    @admin.display(description="")
    def assign_action(self, obj: Complaint):
        if obj.status == Complaint.STATUS_NEW and not obj.assigned_to:
            url = reverse("admin:complaints_complaint_change", args=[obj.id])
            return format_html(
                '<a href="{}" style="color:#007AFF;font-weight:600;">Assign</a>',
                url,
            )
        return "-"

    @admin.display(description="Status")
    def status_badge(self, obj: Complaint):
        colors = {
            Complaint.STATUS_NEW: "#dc2626",
            Complaint.STATUS_ASSIGNED: "#ca8a04",
            Complaint.STATUS_INVESTIGATING: "#007AFF",
            Complaint.STATUS_RESOLVED: "#16a34a",
        }
        color = colors.get(obj.status, "#64748b")
        return format_html(
            '<span style="color:{};font-weight:600;">{}</span>',
            color,
            obj.get_status_display(),
        )


@admin.register(ComplaintLog)
class ComplaintLogAdmin(ModelAdmin):
    list_display = ("complaint", "action", "performed_by", "timestamp")
    list_filter = ("timestamp",)
    readonly_fields = ("complaint", "action", "performed_by", "note", "timestamp")


@admin.register(CitizenAccount)
class CitizenAccountAdmin(ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "area",
        "location_display",
        "created_at",
    )
    list_filter = ("area", "created_at")
    search_fields = ("full_name", "phone", "email", "area")
    readonly_fields = ("created_at", "updated_at", "map_embed")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "full_name",
                    "phone",
                    "secondary_phone",
                    "email",
                    "area",
                    "latitude",
                    "longitude",
                    "map_embed",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "map/",
                self.admin_site.admin_view(self.map_view),
                name="complaints_citizenaccount_map",
            ),
        ]
        return custom + urls

    def _citizen_map_features(self, citizens):
        features = []
        for citizen in citizens:
            if citizen.latitude is None or citizen.longitude is None:
                continue
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [citizen.longitude, citizen.latitude],
                    },
                    "properties": {
                        "id": str(citizen.id),
                        "status": "registered",
                        "statusLabel": "Registered",
                        "label": citizen.area or citizen.full_name,
                        "phone": citizen.phone,
                        "assigned": citizen.full_name,
                        "note": citizen.email or "",
                        "submitted": citizen.created_at.strftime("%d %b %Y, %H:%M"),
                        "lat": f"{citizen.latitude:.6f}",
                        "lng": f"{citizen.longitude:.6f}",
                        "color": "#007AFF",
                        "url": reverse(
                            "admin:complaints_citizenaccount_change",
                            args=[citizen.id],
                        ),
                    },
                },
            )
        return features

    def map_view(self, request):
        citizens = (
            CitizenAccount.objects.exclude(
                latitude__isnull=True,
                longitude__isnull=True,
            )
            .order_by("-created_at")
        )
        features = self._citizen_map_features(citizens)
        citizens_list = [
            {
                "id": props["id"],
                "label": props["label"],
                "status": props["status"],
                "status_label": props["statusLabel"],
                "color": props["color"],
            }
            for props in (f["properties"] for f in features)
        ]
        context = {
            **self.admin_site.each_context(request),
            **_mapbox_admin_context(),
            "title": "Registered Citizens Map",
            "geojson": {"type": "FeatureCollection", "features": features},
            "citizen_count": len(features),
            "citizens_list": citizens_list,
            "opts": self.model._meta,
        }
        return render(request, "admin/complaints/citizens_map.html", context)

    @admin.display(description="Location")
    def location_display(self, obj: CitizenAccount):
        if obj.area:
            return obj.area
        if obj.latitude is not None and obj.longitude is not None:
            return f"{obj.latitude:.5f}, {obj.longitude:.5f}"
        return "Location unavailable"

    @admin.display(description="Map")
    def map_embed(self, obj: CitizenAccount):
        if obj.latitude is None or obj.longitude is None:
            return "No coordinates"
        return format_html(
            '<div id="complaint-map" data-lat="{}" data-lng="{}"></div>',
            obj.latitude,
            obj.longitude,
        )


@admin.register(CitizenMessage)
class CitizenMessageAdmin(ModelAdmin):
    list_display = (
        "phone",
        "full_name",
        "area",
        "body_preview",
        "reply_preview",
        "status",
        "submitted_at",
        "admin_replied_at",
    )
    list_filter = ("status", "submitted_at", "admin_replied_at")
    search_fields = ("phone", "full_name", "body", "email", "admin_reply")
    readonly_fields = (
        "body",
        "phone",
        "full_name",
        "email",
        "area",
        "status",
        "submitted_at",
        "admin_replied_at",
        "admin_replied_by",
    )
    fieldsets = (
        (
            "Citizen message",
            {
                "fields": (
                    "body",
                    "phone",
                    "full_name",
                    "email",
                    "area",
                    "status",
                    "submitted_at",
                ),
            },
        ),
        (
            "DAWASA reply",
            {
                "description": (
                    "Add or update a reply. Citizens see this in the Messages tab of the app."
                ),
                "fields": ("admin_reply", "admin_replied_at", "admin_replied_by"),
            },
        ),
    )

    @admin.display(description="Message")
    def body_preview(self, obj: CitizenMessage):
        return obj.body[:80] + ("…" if len(obj.body) > 80 else "")

    @admin.display(description="Reply", boolean=True)
    def reply_preview(self, obj: CitizenMessage):
        return bool((obj.admin_reply or "").strip())

    def save_model(self, request, obj, form, change):
        reply_text = (obj.admin_reply or "").strip()
        if reply_text:
            obj.admin_reply = reply_text
            if not obj.admin_replied_at:
                from django.utils import timezone

                obj.admin_replied_at = timezone.now()
                if isinstance(request.user, StaffUser):
                    obj.admin_replied_by = request.user
        else:
            obj.admin_replied_at = None
            obj.admin_replied_by = None
        super().save_model(request, obj, form, change)

    def has_add_permission(self, request):
        return False
