#!/usr/bin/env python3
"""
Production Database Setup with Migrations
This script runs proper Flask-Migrate migrations and seeds the database
"""

import os
import sys
from flask import Flask
from flask_migrate import upgrade as migrate_upgrade
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database_with_migrations(db_url):
    """Setup database using Flask-Migrate migrations"""
    print(f"🚀 Starting Database Setup with Migrations...")
    print(f"📡 Database URL: {db_url}")
    
    # Test raw connection first
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
    
    # Set environment variable for migrations
    os.environ['DATABASE_URL'] = db_url
    
    # Create Flask app for migrations
    print("\n🔄 Step 2: Setting up Flask app for migrations...")
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Use the same db instance from models.base
    from models.base import db
    db.init_app(app)
    
    # Initialize Flask-Migrate
    from flask_migrate import Migrate
    migrate = Migrate(app, db)
    
    with app.app_context():
        # Run migrations
        print("\n📋 Step 3: Running database migrations...")
        try:
            migrate_upgrade()
            print("✅ Database migrations completed successfully!")
        except Exception as e:
            print(f"⚠️ Migration issue: {e}")
            print("🔄 Trying to create tables manually as fallback...")
            try:
                db.create_all()
                print("✅ Tables created manually as fallback!")
            except Exception as e2:
                print(f"❌ Manual table creation failed: {e2}")
                return False
        
        # Seed data
        print("\n🌱 Step 4: Seeding database...")
        try:
            # Import models
            from models.user import User
            from models.property import Property
            
            # Clear existing data
            print("🗑️ Clearing existing data...")
            Property.query.delete()
            User.query.delete()
            db.session.commit()
            print("✅ Existing data cleared")
            
            # Create users
            print("👥 Creating users...")
            
            # Admin
            admin = User(
                email='admin@joycesuites.com',
                username='admin',
                first_name='System',
                last_name='Administrator',
                phone_number='+254700000001',
                role='admin',
                national_id=99999999,
                is_active=True
            )
            admin.password = os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin@123456')
            db.session.add(admin)
            
            # Joyce Muthoni
            joyce = User(
                email='joyce@joycesuites.com',
                username='joyce_muthoni',
                first_name='Joyce',
                last_name='Muthoni',
                phone_number='0729175330',
                role='landlord',
                national_id=66183870,
                is_active=True
            )
            joyce.password = os.getenv('DEFAULT_LANDLORD_PASSWORD', 'Password@123')
            db.session.add(joyce)
            
            # Lawrence Mathea
            lawrence = User(
                email='lawrence@joycesuites.com',
                username='lawrence_mathea',
                first_name='Lawrence',
                last_name='Mathea',
                phone_number='+254722870077',
                role='landlord',
                national_id=10000011,
                is_active=True
            )
            lawrence.password = os.getenv('DEFAULT_LANDLORD_PASSWORD', 'Password@123')
            db.session.add(lawrence)
            
            # Caretaker
            caretaker = User(
                email='caretaker@joycesuites.com',
                username='caretaker',
                first_name='Caretaker',
                last_name='User',
                phone_number='+254700000002',
                role='caretaker',
                national_id=88888888,
                is_active=True
            )
            caretaker.password = os.getenv('DEFAULT_CARETAKER_PASSWORD', 'Caretaker123!')
            db.session.add(caretaker)
            
            db.session.commit()
            print("✅ Users created successfully!")
            
            # Create rooms
            print("🏠 Creating rooms...")
            
            rooms_data = [
                # Joyce Muthoni's rooms
                {'room': 1, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 2, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 3, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 4, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 5, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 6, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 7, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 8, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 9, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 10, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                
                # Lawrence Mathea's rooms
                {'room': 11, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 12, 'type': 'bedsitter', 'rent': 5500, 'deposit': 5900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 13, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 14, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 15, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 16, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 17, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 18, 'type': 'one_bedroom', 'rent': 7000, 'deposit': 7400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 19, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 20, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 21, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 22, 'type': 'bedsitter', 'rent': 5500, 'deposit': 5900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 23, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 24, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 25, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 26, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
            ]
            
            for room_data in rooms_data:
                status = 'occupied' if room_data['room'] in [25, 26] else 'vacant'
                
                new_room = Property(
                    name=f"Room {room_data['room']}",
                    property_type=room_data['type'],
                    rent_amount=room_data['rent'],
                    deposit_amount=room_data['deposit'],
                    description=f"{room_data['type'].replace('_', ' ').title()} - KSh {room_data['rent']}/month",
                    landlord_id=room_data['landlord'].id,
                    status=status,
                    paybill_number=room_data['paybill'],
                    account_number=room_data['account']
                )
                db.session.add(new_room)
            
            db.session.commit()
            print(f"✅ Created {len(rooms_data)} rooms successfully!")
            
        except Exception as e:
            print(f"❌ Seeding failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        # Verify
        print("\n🔍 Step 5: Verifying setup...")
        try:
            user_count = User.query.count()
            property_count = Property.query.count()
            
            print(f"✅ Setup complete!")
            print(f"   👥 Users: {user_count}")
            print(f"   🏠 Properties: {property_count}")
            
            if user_count > 0 and property_count > 0:
                print("\n🎉 Database setup completed successfully!")
                print("\n📋 Default Login Credentials:")
                print(f"   👤 Admin: admin@joycesuites.com / {os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin@123456')}")
                print(f"   👤 Caretaker: caretaker@joycesuites.com / {os.getenv('DEFAULT_CARETAKER_PASSWORD', 'Caretaker123!')}")
                print(f"   👤 Landlord: joyce@joycesuites.com / {os.getenv('DEFAULT_LANDLORD_PASSWORD', 'Password@123')}")
                return True
            else:
                print("⚠️ Database appears to be empty")
                return False
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        db_url = sys.argv[1]
    else:
        db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        print("❌ No database URL provided")
        print("Usage: python migration_database_setup.py <database_url>")
        sys.exit(1)
    
    success = setup_database_with_migrations(db_url)
    sys.exit(0 if success else 1)
