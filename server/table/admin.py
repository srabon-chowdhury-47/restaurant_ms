from django.contrib import admin

from .models import Table


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "zone",
        "capacity",
        "status",
        "is_active",
        "created_at",
    )

    list_filter = (
        "status",
        "is_active",
        "zone",
    )

    search_fields = (
        "name",
        "zone",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )