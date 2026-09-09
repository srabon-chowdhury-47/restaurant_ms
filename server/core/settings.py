import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers


# =============================================================================
# BASE CONFIGURATION
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# =============================================================================
# SECURITY
# =============================================================================

# Local fallback is only for development.
# In production, ALWAYS set SECRET_KEY as an environment variable.
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-local-development-only-secret-key-change-this",
)

# Local: DEBUG=True
# Production: set DEBUG=False
DEBUG = os.environ.get("DEBUG", "True").lower() == "true"


# Hosts
#
# Local development:
#   localhost
#   127.0.0.1
#
# Production:
#   Render provides a *.onrender.com hostname
#
# If you later add a custom domain, add it to ALLOWED_HOSTS.
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    ".onrender.com",
]


# =============================================================================
# APPLICATIONS
# =============================================================================

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_spectacular",
    "corsheaders",

    # Local apps
    "user",
    "customer",
    "menu",
    "table",
    "order",
]


# =============================================================================
# CUSTOM USER MODEL
# =============================================================================

AUTH_USER_MODEL = "user.User"


# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
}


# =============================================================================
# MIDDLEWARE
# =============================================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    # Serve static files in production
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =============================================================================
# URL / WSGI
# =============================================================================

ROOT_URLCONF = "core.urls"

WSGI_APPLICATION = "core.wsgi.application"


# =============================================================================
# TEMPLATES
# =============================================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =============================================================================
# DATABASE
# =============================================================================
#
# LOCAL:
#   If DATABASE_URL is not defined, Django uses SQLite.
#
# PRODUCTION:
#   Render provides DATABASE_URL for PostgreSQL.
#
# This means you do NOT need to change this file when moving
# from local development to Render.
#

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# =============================================================================
# PASSWORD VALIDATION
# =============================================================================

AUTH_PASSWORD_VALIDATORS = []


# =============================================================================
# INTERNATIONALIZATION
# =============================================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =============================================================================
# STATIC FILES
# =============================================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# =============================================================================
# MEDIA FILES
# =============================================================================
#
# Local development:
#   server/media/
#
# IMPORTANT:
#   Render's local filesystem is not persistent on the free web service.
#   For permanent production image uploads, use Cloudinary or object storage.
#

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =============================================================================
# EMAIL
# =============================================================================

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# =============================================================================
# CORS
# =============================================================================
#
# Local React/Vite:
#   http://localhost:5173
#
# Production React/Vercel:
#   https://restaurant-ms-six.vercel.app
#

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "https://restaurant-ms-six.vercel.app",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
]


# =============================================================================
# CSRF
# =============================================================================
#
# Needed because the frontend and backend are hosted on different origins.
#

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "https://restaurant-ms-six.vercel.app",
]


# =============================================================================
# JWT
# =============================================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": True,

    "AUTH_HEADER_TYPES": ("Bearer",),
}


# =============================================================================
# PRODUCTION SECURITY
# =============================================================================

# These only become active when DEBUG=False.

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True

    SECURE_CONTENT_TYPE_NOSNIFF = True

    X_FRAME_OPTIONS = "DENY"

    # Render uses HTTPS.
    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True

    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")