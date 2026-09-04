from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from customer.models import Customer
from menu.models import MenuItem
from table.models import Table


class Order(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    class PaymentStatus(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PAID = "PAID", "Paid"

    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        BKASH = "BKASH", "bKash"
        NAGAD = "NAGAD", "Nagad"
        ROCKET = "ROCKET", "Rocket"
        CARD = "CARD", "Card"

    class DiscountType(models.TextChoices):
        NONE = "NONE", "No discount"
        PERCENT = "PERCENT", "Percentage"
        FLAT = "FLAT", "Flat amount"

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        related_name="orders",
        blank=True,
        null=True,
        help_text="Leave blank for a walk-in customer.",
    )

    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        related_name="orders",
        blank=True,
        null=True,
        help_text="Leave blank for walk-in / takeaway orders.",
    )

    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orders_received",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
    )

    payment_reference = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="MFS sender number (bKash/Nagad/Rocket) or last 4 digits of card, when applicable.",
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.NONE,
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Percentage (0-100) if discount_type is PERCENT, or a flat currency amount if FLAT.",
    )

    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id}"

    @property
    def subtotal(self):
        return sum(
            (item.line_total for item in self.items.all()),
            Decimal("0.00"),
        )

    @property
    def discount_amount(self):
        subtotal = self.subtotal

        if self.discount_type == self.DiscountType.PERCENT:
            return (subtotal * self.discount_value / Decimal("100")).quantize(
                Decimal("0.01")
            )

        if self.discount_type == self.DiscountType.FLAT:
            return min(self.discount_value, subtotal)

        return Decimal("0.00")

    @property
    def total(self):
        return self.subtotal - self.discount_amount


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Snapshot of the menu item's price when added to the order.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity