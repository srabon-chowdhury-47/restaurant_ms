from django.db import models


class Table(models.Model):

    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        OCCUPIED = "OCCUPIED", "Occupied"
        RESERVED = "RESERVED", "Reserved"
        CLEANING = "CLEANING", "Cleaning"

    name = models.CharField(
        max_length=50,
        unique=True,
    )

    zone = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    capacity = models.PositiveIntegerField(
        default=2,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name