from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .serializers import (
    AdminResetPasswordSerializer,
    ChangePasswordSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.

    Main Admin (superuser):
        - Can create users
        - Can update users
        - Can delete users
        - Can manage managers/staff
        - Can reset any user's password

    Manager / Staff (is_staff but not superuser):
        - Can view users
        - Can create/update users
        - Cannot delete users
        - Cannot reset another user's password

    All authenticated users:
        - Can view/update their own profile via /me/
        - Can change their own password via /change-password/
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
        User creation/update is restricted to staff (IsAdminUser).
        Deletion is restricted further to superusers only.
        """

        if self.action == "destroy":
            return [IsAuthenticated()]

        if self.action in [
            "create",
            "update",
            "partial_update",
        ]:
            return [IsAdminUser()]

        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        """
        Only superusers may delete a user.
        """

        if not request.user.is_superuser:
            raise PermissionDenied(
                "Only a superuser can delete users."
            )

        return super().destroy(request, *args, **kwargs)

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
        Change the currently authenticated user's own password.
        Requires the current password.
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

    @action(
        detail=True,
        methods=["post"],
        url_path="reset-password",
        permission_classes=[IsAuthenticated],
    )
    def reset_password(self, request, pk=None):
        """
        Superuser resets another user's password.
        Does not require the target user's old password.
        """

        if not request.user.is_superuser:
            raise PermissionDenied(
                "Only a superuser can reset another user's password."
            )

        target_user = self.get_object()

        serializer = AdminResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_user.set_password(
            serializer.validated_data["new_password"]
        )

        target_user.save()

        return Response(
            {"detail": "Password reset successfully."},
            status=status.HTTP_200_OK,
        )