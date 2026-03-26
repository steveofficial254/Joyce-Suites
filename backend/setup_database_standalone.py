#!/usr/bin/env python3
"""
Standalone Database Setup Script
This sets up the database completely independently of the app configuration
"""

import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_standalone_app(db_url):
    """Create a minimal Flask app for database operations"""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'temp-secret-key'
    
    db = SQLAlchemy(app)
    
    # Import all models
    from models.base import db as base_db
    from models.user import User
    from models.property import Property
    from models.payment import Payment
    from models.lease import Lease
    from models.maintenance import MaintenanceRequest
    from models.vacate_notice import VacateNotice
    from models.bill import Bill
    from models.message import Message
    from models.notification import Notification
    from models.property_image import PropertyImage
    from models.reset_password import ResetPassword
    from models.booking_inquiry import BookingInquiry
    
    return app, db

def setup_database_standalone(db_url):
    """Setup database completely standalone"""
    print(f"🚀 Starting Standalone Database Setup...")
    print(f"📡 Database URL: {db_url}")
    
    # Test raw connection first
    print("\n🔍 Step 1: Testing raw database connection...")
    try:
        if db_url.startswith('postgresql://'):
            import psycopg2
            conn = psycopg2.connect(db_url)
            print("✅ PostgreSQL raw connection successful!")
            conn.close()
        elif db_url.startswith('sqlite://'):
            import sqlite3
            db_path = db_url.replace('sqlite:///', '')
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            conn = sqlite3.connect(db_path)
            print("✅ SQLite raw connection successful!")
            conn.close()
        else:
            print("❌ Unsupported database type")
            return False
            
    except Exception as e:
        print(f"❌ Raw database connection failed: {e}")
        return False
    
    # Create standalone app and setup database
    print("\n🔄 Step 2: Creating standalone Flask app...")
    try:
        app, db = create_standalone_app(db_url)
        
        with app.app_context():
            print("✅ Standalone app created!")
            
            # Create tables
            print("\n📋 Step 3: Creating database tables...")
            db.create_all()
            print("✅ Database tables created!")
            
            # Seed data
            print("\n🌱 Step 4: Seeding database...")
            
            # Temporarily override environment variable for seed_rooms
            original_db_url = os.environ.get('DATABASE_URL')
            os.environ['DATABASE_URL'] = db_url
            
            try:
                # Import and run seed_rooms which will use our database URL
                from seed_rooms import seed_rooms
                seed_rooms()
                print("✅ Database seeded successfully!")
            finally:
                # Restore original database URL
                if original_db_url:
                    os.environ['DATABASE_URL'] = original_db_url
                elif 'DATABASE_URL' in os.environ:
                    del os.environ['DATABASE_URL']
            
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
                print("\n📋 Default Login Credentials:")
                print("   👤 Admin: admin@joycesuites.com / Admin@123456")
                print("   👤 Caretaker: caretaker@joycesuites.com / Caretaker123!")
                print("   👤 Landlord: joyce@joycesuites.com / Password@123")
                return True
            else:
                print("⚠️ Database appears to be empty")
                return False
                
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Use provided database URL or environment variable
    if len(sys.argv) > 1:
        db_url = sys.argv[1]
    else:
        db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        print("❌ No database URL provided")
        print("Usage: python setup_database_standalone.py <database_url>")
        sys.exit(1)
    
    success = setup_database_standalone(db_url)
    sys.exit(0 if success else 1)
