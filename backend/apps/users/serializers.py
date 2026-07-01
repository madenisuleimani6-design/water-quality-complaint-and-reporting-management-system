from rest_framework import serializers

from .models import StaffUser


class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffUser
        fields = ("id", "username", "email", "role", "first_name", "last_name")
