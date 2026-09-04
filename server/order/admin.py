from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("unit_price",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "customer",
        "table",
        "received_by",
        "status",
        "payment_status",
        "payment_method",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "payment_method",
        "created_at",
    )

    search_fields = (
        "customer__name",
        "table__name",
    )

    ordering = ("-created_at",)

    readonly_fields = ("created_at", "updated_at")

    inlines = [OrderItemInline]