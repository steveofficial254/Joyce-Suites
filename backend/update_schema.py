import os
import sys
from app import app, db

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def update_schema():
    """Update database schema with all model changes"""
    with app.app_context():
        try:
            print("🔄 Starting database schema update...", flush=True)
            
            # Ensure database directory exists for SQLite
            db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
            print(f"📡 Database URI: {db_uri}", flush=True)
            
            if db_uri and db_uri.startswith('sqlite:///'):
                db_path = db_uri.replace('sqlite:///', '')
                
                # Robust absolute path resolution
                if not os.path.isabs(db_path):
                    # Try instance_path first as it's common for SQLite
                    base_dir = app.instance_path if hasattr(app, 'instance_path') else app.root_path
                    db_path = os.path.abspath(os.path.join(base_dir, '..', db_path) if 'instance' in db_path and not base_dir.endswith('instance') else os.path.join(base_dir, db_path))
                
                print(f"📂 Resolved Database Path: {db_path}", flush=True)
                db_dir = os.path.dirname(db_path)
                
                if db_dir:
                    if not os.path.exists(db_dir):
                        print(f"📁 Creating database directory: {db_dir}", flush=True)
                        os.makedirs(db_dir, exist_ok=True)
                    else:
                        print(f"✅ Database directory exists: {db_dir}", flush=True)
                    
                    # Ensure directory is writable
                    if not os.access(db_dir, os.W_OK):
                        print(f"⚠️ Warning: Directory {db_dir} is NOT writable!", flush=True)
            
            # Check if database exists and has data
            from models.property import Property
            from models.user import User
            
            existing_properties = Property.query.count()
            existing_users = User.query.count()
            
            print(f"📊 Existing data - Properties: {existing_properties}, Users: {existing_users}", flush=True)
            
            # Create all tables (this doesn't delete existing data)
            db.create_all()
            print("✅ Database schema updated successfully!", flush=True)
            print("📊 All tables and columns are now in sync with models.", flush=True)
            
            # Only seed if completely empty
            if existing_properties == 0 and existing_users == 0:
                print("🌱 Database is empty. Consider running seed_rooms.py to populate it.", flush=True)
            else:
                print(f"✅ Preserved existing data - {existing_properties} properties, {existing_users} users", flush=True)
            
        except Exception as e:
            print(f"❌ Error updating schema: {e}")
            raise

if __name__ == '__main__':
    update_schema()