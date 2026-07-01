from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .citizen_auth import (
    IsCitizenAuthenticated,
    IsCitizenComplaintOwner,
)
from .context import reset_performed_by, set_performed_by
from .filters import ComplaintFilter
from .models import Complaint, ComplaintLog
from .permissions import (
    ComplaintObjectPermission,
    IsAdminOrSupervisor,
    IsViewerOrAbove,
)
from .phone_utils import is_valid_tz_phone, normalize_tz_phone
from .serializers import (
    CitizenComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintDetailSerializer,
    ComplaintNoteSerializer,
    ComplaintSummarySerializer,
    ComplaintUpdateSerializer,
)


class ComplaintViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Complaint.objects.select_related("assigned_to").prefetch_related("logs")
    filterset_class = ComplaintFilter
    lookup_field = "pk"
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_parser_classes(self):
        if self.action == "create":
            return [MultiPartParser, FormParser]
        return super().get_parser_classes()

    def get_authenticators(self):
        # Public citizen endpoints: ignore Bearer tokens so citizen JWT never
        # triggers 401 from staff JWT authentication on AllowAny routes.
        if self.request.method == "POST":
            return []
        phone = (
            getattr(self.request, "query_params", None) or self.request.GET
        ).get("phone", "")
        if (
            self.request.method == "GET"
            and str(phone).strip()
            and not self.kwargs.get(self.lookup_field)
        ):
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action == "list" and self.request.query_params.get("phone"):
            return [AllowAny()]
        if self.action == "retrieve" and getattr(self.request, "citizen", None):
            return [IsCitizenAuthenticated(), IsCitizenComplaintOwner()]
        if self.action == "notes":
            return [IsViewerOrAbove()]
        return [ComplaintObjectPermission()]

    def get_serializer_class(self):
        if self.action == "create":
            return ComplaintCreateSerializer
        if self.action == "list":
            return ComplaintSummarySerializer
        if self.action == "retrieve" and getattr(self.request, "citizen", None):
            return CitizenComplaintDetailSerializer
        if self.action in ("partial_update", "update"):
            return ComplaintUpdateSerializer
        return ComplaintDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        phone = self.request.query_params.get("phone", "").strip()
        if self.action == "list" and phone:
            return self._filter_by_phone(qs, phone)
        return qs

    @staticmethod
    def _filter_by_phone(queryset, phone: str):
        candidates = {phone}
        if is_valid_tz_phone(phone):
            normalized = normalize_tz_phone(phone)
            candidates.add(normalized)
            if normalized.startswith("+255"):
                candidates.add(f"0{normalized[4:]}")
        return queryset.filter(phone__in=candidates)

    def list(self, request, *args, **kwargs):
        phone = request.query_params.get("phone", "").strip()
        if phone:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            serializer_class = ComplaintSummarySerializer
            if page is not None:
                serializer = serializer_class(
                    page,
                    many=True,
                    context={"request": request},
                )
                return self.get_paginated_response(serializer.data)
            serializer = serializer_class(
                queryset,
                many=True,
                context={"request": request},
            )
            return Response({"results": serializer.data})
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        return Response(
            {"id": str(complaint.id), "status": complaint.status},
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        if not IsAdminOrSupervisor().has_permission(request, self) and "assigned_to" in request.data:
            return Response(
                {"detail": "Only supervisors can reassign complaints."},
                status=status.HTTP_403_FORBIDDEN,
            )
        token = set_performed_by(request.user)
        try:
            return super().partial_update(request, *args, **kwargs)
        finally:
            reset_performed_by(token)

    @action(detail=True, methods=["post"], url_path="notes")
    def notes(self, request, pk=None):
        complaint = self.get_object()
        serializer = ComplaintNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ComplaintLog.objects.create(
            complaint=complaint,
            action="Internal note added",
            performed_by=request.user,
            note=serializer.validated_data["note"],
        )
        return Response({"detail": "Note added."}, status=status.HTTP_201_CREATED)
