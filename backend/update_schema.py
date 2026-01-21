import os
import sys
from app import app, db

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def update_schema():
    """Update database schema with all model changes"""
    with app.app_context():
        try:
            print("🔄 Starting database schema update...")
            
            # Ensure database directory exists for SQLite
            db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
            if db_uri.startswith('sqlite:///'):
                db_path = db_uri.replace('sqlite:///', '')
                if '/' in db_path:
                    db_dir = os.path.dirname(db_path)
                    if db_dir and not os.path.exists(db_dir):
                        print(f"📁 Creating database directory: {db_dir}")
                        os.makedirs(db_dir, exist_ok=True)
            
            db.create_all()
            
            print("✅ Database schema updated successfully!")
            print("📊 All tables and columns are now in sync with models.")
            
        except Exception as e:
            print(f"❌ Error updating schema: {e}")
            raise

if __name__ == '__main__':
    update_schema()