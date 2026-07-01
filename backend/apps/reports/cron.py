from datetime import date

from .generator import generate_monthly_report


def generate_monthly_report_job():
    """Run on the 1st of each month for the previous calendar month."""
    today = date.today()
    if today.month == 1:
        year, month = today.year - 1, 12
    else:
        year, month = today.year, today.month - 1
    generate_monthly_report(year, month)
