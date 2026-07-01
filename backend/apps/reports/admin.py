from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from apps.complaints.models import Complaint
from apps.reports.generator import generate_monthly_report

from .models import Report


def generate_report_action(modeladmin, request, queryset):
    from datetime import date

    today = date.today()
    if today.month == 1:
        year, month = today.year - 1, 12
    else:
        year, month = today.year, today.month - 1
    report = generate_monthly_report(year, month, generated_by=request.user)
    modeladmin.message_user(
        request,
        f"Generated report for {report.month.strftime('%B %Y')}.",
    )


generate_report_action.short_description = "Generate report for previous month"


@admin.register(Report)
class ReportAdmin(ModelAdmin):
    list_display = (
        "month",
        "total_complaints",
        "hotspot_count",
        "resolution_rate",
        "generated_at",
        "download_link",
    )
    list_filter = ("month", "generated_at")
    readonly_fields = ("generated_at",)
    actions = [generate_report_action]

    @admin.display(description="PDF")
    def download_link(self, obj: Report):
        if not obj.pdf_file:
            return "-"
        return format_html('<a href="{}">Download</a>', obj.pdf_file.url)
