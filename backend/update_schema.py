import os
import sys
from app import app, db

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def update_schema():
    """Update database schema with all model changes"""
    with app.app_context():
        try:
            print("🔄 Starting database schema update...")
            
            db.create_all()
            
            print("✅ Database schema updated successfully!")
            print("📊 All tables and columns are now in sync with models.")
            
        except Exception as e:
            print(f"❌ Error updating schema: {e}")
            raise

if __name__ == '__main__':
    update_schema()