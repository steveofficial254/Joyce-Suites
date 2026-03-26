#!/usr/bin/env python3
"""
Database Setup Script for Joyce Suites
This script will:
1. Update database schema with migrations
2. Seed the database with rooms and users
3. Verify database is fully operational
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Complete database setup process"""
    print("🚀 Starting Joyce Suites Database Setup...")
    
    # Check database connection
    print("\n📡 Step 1: Checking database connection...")
    try:
        from app import create_app, db
        app = create_app()
        
        with app.app_context():
            # Test database connection
            db.engine.execute("SELECT 1")
            print("✅ Database connection successful!")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n💡 Please check your DATABASE_URL in .env file")
        return False
    
    # Run migrations
    print("\n🔄 Step 2: Running database migrations...")
    try:
        from flask_migrate import upgrade as migrate_upgrade
        migrate_upgrade()
        print("✅ Database migrations completed!")
        
    except Exception as e:
        print(f"⚠️ Migration issue (trying manual table creation): {e}")
        try:
            # Fallback to manual table creation
            db.create_all()
            print("✅ Tables created manually!")
        except Exception as e2:
            print(f"❌ Table creation failed: {e2}")
            return False
    
    # Seed database
    print("\n🌱 Step 3: Seeding database with rooms and users...")
    try:
        from seed_rooms import seed_rooms
        seed_rooms()
        print("✅ Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        return False
    
    # Verify setup
    print("\n🔍 Step 4: Verifying database setup...")
    try:
        from models.user import User
        from models.property import Property
        
        user_count = User.query.count()
        property_count = Property.query.count()
        
        print(f"✅ Database verification complete!")
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
        print(f"❌ Database verification failed: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)
