#!/usr/bin/env python3
"""
Direct Database Setup Script
This bypasses app initialization and directly sets up the database
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database_direct():
    """Setup database directly without app initialization"""
    print("🚀 Starting Direct Database Setup...")
    
    # Get database URL from environment or parameter
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not found in environment")
        return False
    
    print(f"📡 Using Database URL: {db_url}")
    
    # Test connection first
    print("\n🔍 Step 1: Testing database connection...")
    try:
        if db_url.startswith('postgresql://'):
            import psycopg2
            conn = psycopg2.connect(db_url)
            print("✅ PostgreSQL connection successful!")
            conn.close()
        elif db_url.startswith('sqlite://'):
            import sqlite3
            db_path = db_url.replace('sqlite:///', '')
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            conn = sqlite3.connect(db_path)
            print("✅ SQLite connection successful!")
            conn.close()
        else:
            print("❌ Unsupported database type")
            return False
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Setup Flask app with database
    print("\n🔄 Step 2: Setting up Flask application...")
    try:
        # Override database URL temporarily
        original_db_url = os.environ.get('DATABASE_URL')
        os.environ['DATABASE_URL'] = db_url
        
        from app import create_app, db
        app = create_app()
        
        with app.app_context():
            print("✅ Flask app initialized!")
            
            # Create tables
            print("\n📋 Step 3: Creating database tables...")
            db.create_all()
            print("✅ Database tables created!")
            
            # Seed data
            print("\n🌱 Step 4: Seeding database...")
            from seed_rooms import seed_rooms
            seed_rooms()
            print("✅ Database seeded successfully!")
            
            # Verify
            print("\n🔍 Step 5: Verifying setup...")
            from models.user import User
            from models.property import Property
            
            user_count = User.query.count()
            property_count = Property.query.count()
            
            print(f"✅ Setup complete!")
            print(f"   👥 Users: {user_count}")
            print(f"   🏠 Properties: {property_count}")
            
            if user_count > 0 and property_count > 0:
                print("\n🎉 Database setup completed successfully!")
                return True
            else:
                print("⚠️ Database appears to be empty")
                return False
                
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False
    finally:
        # Restore original database URL
        if original_db_url:
            os.environ['DATABASE_URL'] = original_db_url

if __name__ == "__main__":
    # Allow passing database URL as argument
    if len(sys.argv) > 1:
        os.environ['DATABASE_URL'] = sys.argv[1]
    
    success = setup_database_direct()
    sys.exit(0 if success else 1)
