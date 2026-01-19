from app import app

with app.app_context():
    from flask import current_app
    import os
    
    print("=== FLASK CONFIGURATION ===")
    db_uri = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
    print(f"Database URI: {db_uri}")
    
    if db_uri.startswith('sqlite:///'):
        db_path = db_uri.replace('sqlite:///', '')
        print(f"Database path: {db_path}")
        print(f"File exists: {os.path.exists(db_path)}")
        
        if os.path.exists(db_path):
            print(f"File size: {os.path.getsize(db_path)} bytes")
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            print(f"Tables in configured DB: {len(tables)}")
            if 'leases' in tables:
                print("✅ 'leases' table FOUND in configured database")
            else:
                print("❌ 'leases' table NOT FOUND in configured database")
    else:
        print("❌ Not using SQLite or URI malformed")
