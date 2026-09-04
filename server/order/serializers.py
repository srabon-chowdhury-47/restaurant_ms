from decimal import Decimal

from rest_framework import serializers

from customer.serializers import CustomerSerializer
from menu.models import MenuItem
from table.serializers import TableSerializer
from user.serializers import UserSerializer

from .models import Order, OrderItem


class OrderItemWriteSerializer(serializers.Serializer):
    """
    Used only for accepting incoming order-item data on create/update.
    unit_price is never accepted from the client — it's always taken
    from MenuItem.price at the time the item is added.
    """

    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):

    menu_item_name = serializers.CharField(
        source="menu_item.name",
        read_only=True,
    )

    line_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "menu_item",
            "menu_item_name",
            "quantity",
            "unit_price",
            "line_total",
        ]

        read_only_fields = [
            "id",
            "menu_item_name",
            "unit_price",
            "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    """
    Read serializer with nested items and expanded customer/table/staff.
    """

    items = OrderItemSerializer(many=True, read_only=True)

    customer_detail = CustomerSerializer(source="customer", read_only=True)
    table_detail = TableSerializer(source="table", read_only=True)
    received_by_detail = UserSerializer(source="received_by", read_only=True)

    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    discount_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    total = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "customer_detail",
            "table",
            "table_detail",
            "received_by",
            "received_by_detail",
            "status",
            "payment_status",
            "payment_method",
            "payment_reference",
            "discount_type",
            "discount_value",
            "notes",
            "items",
            "subtotal",
            "discount_amount",
            "total",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "received_by",
            "items",
            "subtotal",
            "discount_amount",
            "total",
            "created_at",
            "updated_at",
        ]


class OrderCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Write serializer. Accepts a nested list of items on create/update,
    stamps received_by from whichever authenticated user performs the
    write (creation OR a later edit), and snapshots unit_price from the
    menu item's current price whenever an item is (re)created.
    """

    items = OrderItemWriteSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "table",
            "status",
            "payment_status",
            "payment_method",
            "payment_reference",
            "discount_type",
            "discount_value",
            "notes",
            "items",
        ]

        read_only_fields = ["id"]

    def validate_discount_value(self, value):
        discount_type = self.initial_data.get("discount_type", Order.DiscountType.NONE)

        if discount_type == Order.DiscountType.PERCENT and value > 100:
            raise serializers.ValidationError(
                "Percentage discount cannot exceed 100."
            )

        return value

    def validate_items(self, value):
        if self.instance is None and not value:
            raise serializers.ValidationError(
                "An order must have at least one item."
            )
        return value

    def validate(self, attrs):
        payment_method = attrs.get(
            "payment_method",
            getattr(self.instance, "payment_method", None) or Order.PaymentMethod.CASH,
        )
        payment_reference = attrs.get(
            "payment_reference",
            getattr(self.instance, "payment_reference", None),
        )

        mfs_methods = {
            Order.PaymentMethod.BKASH,
            Order.PaymentMethod.NAGAD,
            Order.PaymentMethod.ROCKET,
        }

        if payment_method in mfs_methods and not payment_reference:
            raise serializers.ValidationError(
                {"payment_reference": "Enter the sender's MFS number."}
            )

        if payment_method == Order.PaymentMethod.CARD and not payment_reference:
            raise serializers.ValidationError(
                {"payment_reference": "Enter the last 4 digits of the card."}
            )

        if payment_method == Order.PaymentMethod.CARD and payment_reference:
            if not (payment_reference.isdigit() and len(payment_reference) == 4):
                raise serializers.ValidationError(
                    {"payment_reference": "Card reference must be exactly 4 digits."}
                )

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = self.context["request"]

        order = Order.objects.create(
            received_by=request.user,
            **validated_data,
        )

        for item_data in items_data:
            menu_item = item_data["menu_item"]
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data["quantity"],
                unit_price=menu_item.price,
            )

        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        request = self.context["request"]

        # Any edit re-stamps received_by to whoever is making the change.
        instance.received_by = request.user

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                menu_item = item_data["menu_item"]
                OrderItem.objects.create(
                    order=instance,
                    menu_item=menu_item,
                    quantity=item_data["quantity"],
                    unit_price=menu_item.price,
                )

        return instance

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data