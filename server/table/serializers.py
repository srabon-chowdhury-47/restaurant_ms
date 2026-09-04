from rest_framework import serializers

from .models import Table


class TableSerializer(serializers.ModelSerializer):

    class Meta:
        model = Table
        fields = [
            "id",
            "name",
            "zone",
            "capacity",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]