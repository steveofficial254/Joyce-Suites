from app import create_app
from models.base import db
import os

app = create_app()
with app.app_context():
    print(f"FLASK_ENV: {os.getenv('FLASK_ENV')}")
    print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    try:
        db.session.execute(db.text("SELECT 1"))
        print("Database connection: SUCCESS")
    except Exception as e:
        print(f"Database connection: FAILED - {str(e)}")
