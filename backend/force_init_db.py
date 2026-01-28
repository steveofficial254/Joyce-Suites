from app import create_app
from models.base import db
import os

app = create_app()
with app.app_context():
    print("Creating all tables...")
    try:
        db.create_all()
        print("✅ All tables created successfully.")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
