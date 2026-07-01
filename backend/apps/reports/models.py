import uuid

from django.db import models


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    month = models.DateField(help_text="First day of the reported month")
    pdf_file = models.FileField(upload_to="reports/")
    total_complaints = models.IntegerField()
    hotspot_count = models.IntegerField()
    resolution_rate = models.FloatField(help_text="Percentage 0–100")
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(
        "users.StaffUser",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="generated_reports",
    )

    class Meta:
        ordering = ["-month"]

    def __str__(self) -> str:
        return f"Report {self.month.strftime('%B %Y')}"
