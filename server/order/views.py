from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderCreateUpdateSerializer, OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing orders.
    """

    queryset = Order.objects.select_related(
        "customer", "table", "received_by"
    ).prefetch_related("items__menu_item").all()

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return OrderCreateUpdateSerializer
        return OrderSerializer