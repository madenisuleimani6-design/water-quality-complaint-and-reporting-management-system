from django.http import FileResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.complaints.permissions import IsSupervisorOrAbove, IsViewerOrAbove

from .generator import generate_monthly_report
from .models import Report
from .serializers import ReportGenerateSerializer, ReportSerializer


class ReportViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsViewerOrAbove]

    @action(
        detail=True,
        methods=["get"],
        url_path="download",
        permission_classes=[IsViewerOrAbove],
    )
    def download(self, request, pk=None):
        report = self.get_object()
        if not report.pdf_file:
            return Response(
                {"detail": "PDF not available."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return FileResponse(
            report.pdf_file.open("rb"),
            as_attachment=True,
            filename=report.pdf_file.name.split("/")[-1],
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="generate",
        permission_classes=[IsSupervisorOrAbove],
    )
    def generate(self, request):
        serializer = ReportGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        year = serializer.validated_data["year"]
        month = serializer.validated_data["month"]
        report = generate_monthly_report(
            year,
            month,
            generated_by=request.user if request.user.is_authenticated else None,
        )
        return Response(
            ReportSerializer(report, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
