from rest_framework import generics
from rest_framework.response import Response

from .citizen_auth import CitizenJWTAuthentication, IsCitizenAuthenticated, phone_match_candidates
from .models import CitizenMessage
from .serializers import (
    CitizenMessageCreateSerializer,
    CitizenMessageResponseSerializer,
    CitizenMessageSerializer,
)


class CitizenMessageListCreateView(generics.ListCreateAPIView):
    authentication_classes = [CitizenJWTAuthentication]
    permission_classes = [IsCitizenAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CitizenMessageCreateSerializer
        return CitizenMessageSerializer

    def get_queryset(self):
        citizen = self.request.citizen
        phones = phone_match_candidates(citizen.phone)
        return CitizenMessage.objects.filter(phone__in=phones)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        return Response(
            CitizenMessageResponseSerializer(message).data,
            status=201,
        )
