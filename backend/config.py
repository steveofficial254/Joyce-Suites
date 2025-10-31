import os
<<<<<<< HEAD
from datetime import timedelta
=======
 Ddevelop
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("PORT", 5000))

    # Database (SQLite by default)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///joyce_suites.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

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

    # Mpesa endpoints (sandbox)
    AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

>>>>>>> main

class Config:
    """Base configuration"""
    
    # Read from .env, but have a fallback PostgreSQL connection
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SQLALCHEMY_DATABASE_URI",
        "postgresql://joyce_user:joyce_password_123@localhost:5432/joyce_suites"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
<<<<<<< HEAD
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    }
    
    SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
    JSON_SORT_KEYS = False
    
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24
    
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True

config_name = os.getenv("FLASK_ENV", "development")
config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
Config = config_map.get(config_name, DevelopmentConfig)
=======
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_very_secret_key'
 main
>>>>>>> main
