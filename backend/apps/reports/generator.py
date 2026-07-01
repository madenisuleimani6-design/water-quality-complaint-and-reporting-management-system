import io
from datetime import date

from django.core.files.base import ContentFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from apps.complaints.models import Complaint
from apps.reports.models import Report

from .hotspot import cluster_hotspots, complaints_for_month


def resolution_rate(complaints: list[Complaint]) -> float:
    if not complaints:
        return 0.0
    resolved = sum(1 for c in complaints if c.status == Complaint.STATUS_RESOLVED)
    return round(resolved / len(complaints) * 100, 1)


def generate_monthly_report(
    year: int,
    month: int,
    generated_by=None,
) -> Report:
    month_start = date(year, month, 1)
    existing = Report.objects.filter(month=month_start).first()
    if existing:
        return existing

    complaints = complaints_for_month(year, month)
    hotspots = cluster_hotspots(complaints)
    rate = resolution_rate(complaints)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    title = month_start.strftime("%B %Y")
    story.append(Paragraph(f"DAWASA Water Quality Report: {title}", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Total complaints: {len(complaints)}", styles["Normal"]))
    story.append(Paragraph(f"Hotspots identified: {len(hotspots)}", styles["Normal"]))
    story.append(Paragraph(f"Resolution rate: {rate}%", styles["Normal"]))
    story.append(Spacer(1, 18))

    if hotspots:
        story.append(Paragraph("Hotspot Summary", styles["Heading2"]))
        table_data = [["Location", "Lat", "Lng", "Count", "Resolved"]]
        for spot in hotspots:
            label = spot.area_name or f"{spot.latitude:.4f}, {spot.longitude:.4f}"
            table_data.append(
                [
                    label,
                    f"{spot.latitude:.5f}",
                    f"{spot.longitude:.5f}",
                    str(spot.complaint_count),
                    str(spot.resolved_count),
                ]
            )
        table = Table(table_data, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#007AFF")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 18))

    story.append(Paragraph("Complaint Appendix", styles["Heading2"]))
    for complaint in complaints[:50]:
        location = complaint.area_name or f"{complaint.latitude}, {complaint.longitude}"
        story.append(
            Paragraph(
                f"• {complaint.submitted_at:%Y-%m-%d}: {location} ({complaint.get_status_display()})",
                styles["Normal"],
            )
        )

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    filename = f"report_{year}_{month:02d}.pdf"

    report = Report(
        month=month_start,
        total_complaints=len(complaints),
        hotspot_count=len(hotspots),
        resolution_rate=rate,
        generated_by=generated_by,
    )
    report.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)
    return report
