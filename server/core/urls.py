from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# --- REST FRAMEWORK IMPORTS ---
from rest_framework.decorators import api_view
from rest_framework.response import Response

# --- DRF SPECTACULAR IMPORTS ---
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


# ============================================================
# MASTER API ROOT VIEW
# ============================================================

@api_view(["GET"])
def master_api_root(request):
    """
    Master API directory for Restaurant Management System.
    This provides clickable links to all available API modules.
    """

    return Response({
        "1. User / Authentication API": request.build_absolute_uri("/api/users/"),
        "2. Menu API": request.build_absolute_uri("/api/menu/"),
    })


# ============================================================
# URL PATTERNS
# ============================================================

urlpatterns = [

    # --- DJANGO ADMIN ---
    path("admin/", admin.site.urls),


    # --- ROOT PATHS ---
    path("", master_api_root, name="master-api-root"),
    path("api/", master_api_root, name="api-root"),


    # --- SWAGGER / OPENAPI DOCUMENTATION ---

    # OpenAPI schema
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    # Interactive Swagger UI
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),


    # --- MODULAR APP ROUTES ---

    # User / Authentication API
    path(
        "api/users/",
        include("user.urls"),
    ),

    # Menu API (Categories + Menu Items)
    path(
        "api/menu/",
        include("menu.urls"),
    ),


    # --- JWT TOKEN AUTHENTICATION ---

    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]


# ============================================================
# MEDIA FILES
# ============================================================

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )