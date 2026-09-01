from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .serializers import (
    ChangePasswordSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.

    Main Admin:
        - Can create users
        - Can update users
        - Can delete users
        - Can manage managers/staff

    Manager:
        - Can view users
        - Cannot manage users unless permissions are added later

    Staff:
        - Basic authenticated access
    """

    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer

        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer

        return UserSerializer

    def get_permissions(self):
        """
        User creation/update/deletion is currently restricted
        to Django superusers.
        """

        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsAdminUser()]

        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        Create a new Manager or Staff user.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="me",
    )
    def me(self, request):
        """
        Return the currently authenticated user.
        """

        serializer = UserSerializer(request.user)

        return Response(serializer.data)

    @action(
        detail=False,
        methods=["post"],
        url_path="change-password",
    )
    def change_password(self, request):
        """
        Change the currently authenticated user's password.
        """

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        request.user.set_password(
            serializer.validated_data["new_password"]
        )

        request.user.save()

        return Response(
            {"detail": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )