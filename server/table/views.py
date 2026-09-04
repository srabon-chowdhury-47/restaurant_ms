from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Table
from .serializers import TableSerializer


class TableViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing restaurant tables.
    """

    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]