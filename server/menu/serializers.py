from rest_framework import serializers

from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class MenuItemSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = MenuItem

        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "category_name",
            "created_at",
            "updated_at",
        ]