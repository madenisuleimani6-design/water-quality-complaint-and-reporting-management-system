from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = (
            "id",
            "month",
            "total_complaints",
            "hotspot_count",
            "resolution_rate",
            "generated_at",
            "download_url",
        )

    def get_download_url(self, obj):
        request = self.context.get("request")
        if not request or not obj.pdf_file:
            return None
        return request.build_absolute_uri(
            f"/api/reports/{obj.id}/download/",
        )


class ReportGenerateSerializer(serializers.Serializer):
    year = serializers.IntegerField(min_value=2000, max_value=2100)
    month = serializers.IntegerField(min_value=1, max_value=12)
