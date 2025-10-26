import os
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


class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://user:password@localhost:5432/joyce_suites_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_very_secret_key'
 main
