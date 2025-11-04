import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    """Base configuration"""
    
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("PORT", 5000))

    # Database (default to PostgreSQL, fallback to SQLite)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SQLALCHEMY_DATABASE_URI",
        "postgresql://joyce_user:joyce_password_123@localhost:5432/joyce_suites"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    }

    SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key")

    # JWT configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Session
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

    # Joyce M-Pesa Credentials
    JOYCE = {
        "CONSUMER_KEY": os.getenv("JOYCE_CONSUMER_KEY"),
        "CONSUMER_SECRET": os.getenv("JOYCE_CONSUMER_SECRET"),
        "BUSINESS_SHORTCODE": os.getenv("JOYCE_BUSINESS_SHORTCODE"),
        "PASSKEY": os.getenv("JOYCE_PASSKEY"),
    }

    # Lawrence M-Pesa Credentials
    LAWRENCE = {
        "CONSUMER_KEY": os.getenv("LAWRENCE_CONSUMER_KEY"),
        "CONSUMER_SECRET": os.getenv("LAWRENCE_CONSUMER_SECRET"),
        "BUSINESS_SHORTCODE": os.getenv("LAWRENCE_BUSINESS_SHORTCODE"),
        "PASSKEY": os.getenv("LAWRENCE_PASSKEY"),
    }

    CALLBACK_URL = os.getenv("CALLBACK_URL")

    # M-Pesa sandbox endpoints
    AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = False


class TestingConfig(BaseConfig):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(BaseConfig):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True


# Select configuration based on environment
config_name = os.getenv("FLASK_ENV", "development")
config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}

Config = config_map.get(config_name, DevelopmentConfig)
