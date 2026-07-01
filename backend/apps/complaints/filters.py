import django_filters

from .models import Complaint


class ComplaintFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    assigned_to = django_filters.UUIDFilter(field_name="assigned_to_id")
    area = django_filters.CharFilter(field_name="area_name", lookup_expr="icontains")
    submitted_after = django_filters.DateTimeFilter(
        field_name="submitted_at",
        lookup_expr="gte",
    )
    submitted_before = django_filters.DateTimeFilter(
        field_name="submitted_at",
        lookup_expr="lte",
    )

    class Meta:
        model = Complaint
        fields = ["status", "assigned_to", "area"]
