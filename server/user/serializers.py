from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying user information.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "date_joined",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Manager and Staff users.

    No password-strength validation is applied.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "role",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)

        # Password is hashed before saving.
        # No password-strength validation is performed.
        user.set_password(password)

        user.save()

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating Manager and Staff users.
    """

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing the current user's password.

    No password-strength validation is applied.
    """

    old_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "Current password is incorrect."
            )

        return value