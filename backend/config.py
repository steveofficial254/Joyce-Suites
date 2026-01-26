import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    """Base configuration"""
    
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("PORT", 5000))

    if os.getenv("FLASK_ENV") == "production":
        SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
        if not SQLALCHEMY_DATABASE_URI:
            raise ValueError("❌ SQLALCHEMY_DATABASE_URI must be set in production environment")
    else:
        SQLALCHEMY_DATABASE_URI = os.getenv(
            "SQLALCHEMY_DATABASE_URI",
            "sqlite:///joyce_suites_dev.db"
        )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,      # Verify connections before using
        "pool_recycle": 3600,        # Recycle connections after 1 hour
        "pool_size": 10,             # Number of connections to maintain
        "max_overflow": 20,          # Max connections beyond pool_size
        "pool_timeout": 30           # Timeout for getting connection
    }

    if os.getenv("FLASK_ENV") == "production":
        SECRET_KEY = os.getenv("SECRET_KEY")
        if not SECRET_KEY:
            raise ValueError("❌ SECRET_KEY must be set in production environment")
        JWT_SECRET_KEY = os.getenv("JWT_SECRET")
        if not JWT_SECRET_KEY:
            raise ValueError("❌ JWT_SECRET must be set in production environment")
    else:
        SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-only-not-for-production")
        JWT_SECRET_KEY = os.getenv("JWT_SECRET", "dev-jwt-secret-only-not-for-production")

    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://joyce-suites.vercel.app,https://joyce-suites-jcfw.vercel.app,https://joyce-suites.onrender.com,https://joyce-suites-xdkp.onrender.com").split(",")

    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    
    SESSION_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    USE_CLOUDINARY = os.getenv("USE_CLOUDINARY", "false").lower() == "true"

    JOYCE = {
        "CONSUMER_KEY": os.getenv("JOYCE_CONSUMER_KEY"),
        "CONSUMER_SECRET": os.getenv("JOYCE_CONSUMER_SECRET"),
        "BUSINESS_SHORTCODE": os.getenv("JOYCE_BUSINESS_SHORTCODE"),
        "PASSKEY": os.getenv("JOYCE_PASSKEY"),
    }

    LAWRENCE = {
        "CONSUMER_KEY": os.getenv("LAWRENCE_CONSUMER_KEY"),
        "CONSUMER_SECRET": os.getenv("LAWRENCE_CONSUMER_SECRET"),
        "BUSINESS_SHORTCODE": os.getenv("LAWRENCE_BUSINESS_SHORTCODE"),
        "PASSKEY": os.getenv("LAWRENCE_PASSKEY"),
    }

    CALLBACK_URL = os.getenv("CALLBACK_URL")

    if os.getenv("FLASK_ENV") == "production":
        AUTH_URL = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    else:
        AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = False


class TestingConfig(BaseConfig):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False


class ProductionConfig(BaseConfig):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    
    SECURITY_HEADERS = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block'
    }


config_name = os.getenv("FLASK_ENV", "development")
config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}

Config = config_map.get(config_name, DevelopmentConfig)
