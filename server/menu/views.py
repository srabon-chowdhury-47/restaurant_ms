from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category, MenuItem
from .serializers import (
    CategorySerializer,
    MenuItemSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing menu categories.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing menu items.
    """

    queryset = MenuItem.objects.select_related(
        "category"
    ).all()

    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]