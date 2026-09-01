from django.contrib import admin

from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "category",
        "price",
        "is_available",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "is_available",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
        "category__name",
    )

    list_select_related = (
        "category",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )