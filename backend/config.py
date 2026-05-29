import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

_DEV_ORIGINS = (
    "http://127.0.0.1:5173",
    "http://localhost:5173",
)


def _parse_origins(value):
    return [origin.strip() for origin in value.split(",") if origin.strip()]


def _is_production():
    if os.environ.get("FLASK_ENV") == "production":
        return True
    return os.environ.get("RENDER") == "true"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    DATABASE_PATH = os.environ.get(
        "DATABASE_PATH",
        str(BASE_DIR / "instance" / "tasks.db"),
    )
    PERMANENT_SESSION_LIFETIME = timedelta(days=14)

    _cors_env = os.environ.get("CORS_ORIGINS", "")
    CORS_ORIGINS = _parse_origins(_cors_env) if _cors_env else list(_DEV_ORIGINS)

    IS_PRODUCTION = _is_production()
    SESSION_COOKIE_SECURE = IS_PRODUCTION
    SESSION_COOKIE_SAMESITE = "None" if IS_PRODUCTION else "Lax"


def get_config():
    return Config()
