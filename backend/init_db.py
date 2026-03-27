#!/usr/bin/env python3
"""
Initialize database from scratch
"""
from app import create_app
from models.base import db
from models.user import User
from models.property import Property
from models.notification import Notification
from models.booking_inquiry import BookingInquiry
from models.maintenance import MaintenanceRequest
from models.payment import Payment
from models.water_bill import WaterBill
from models.rent_deposit import RentRecord, DepositRecord
from models.lease import Lease
from models.vacate_notice import VacateNotice
from seed_rooms import seed_rooms

def init_database():
    """Initialize the database with all tables"""
    app = create_app()
    
    with app.app_context():
        print("Creating all database tables...")
        db.create_all()
        print("Database tables created successfully!")
        
        # Create a default admin user
        print("Creating default admin user...")
        admin = User(
            email='admin@joycesuites.com',
            username='admin',
            first_name='Admin',
            last_name='User',
            phone_number='+254700000000',
            role='admin',
            national_id=12345678,  # 8-digit national_id as required
            is_active=True
        )
        admin.password = 'Admin123!'  # This will be hashed automatically
        
        # Create a default caretaker user
        caretaker = User(
            email='caretaker@joycesuites.com',
            username='caretaker',
            first_name='Caretaker',
            last_name='User',
            phone_number='+254711111111',
            role='caretaker',
            national_id=12345679,  # 8-digit national_id as required
            is_active=True
        )
        caretaker.password = 'Caretaker123!'
        
        # Create a default tenant user
        tenant = User(
            email='tenant@joycesuites.com',
            username='tenant',
            first_name='Tenant',
            last_name='User',
            phone_number='+254722222222',
            role='tenant',
            national_id=12345680,  # 8-digit national_id as required
            is_active=True,
            room_number='101'
        )
        tenant.password = 'Tenant123!'
        
        try:
            db.session.add(admin)
            db.session.add(caretaker)
            db.session.add(tenant)
            db.session.commit()
            print("Default users created successfully!")
            print("\nLogin Credentials:")
            print("Admin: admin@joycesuites.com / Admin123!")
            print("Caretaker: caretaker@joycesuites.com / Caretaker123!")
            print("Tenant: tenant@joycesuites.com / Tenant123!")
        except Exception as e:
            print(f"Error creating users: {e}")
            db.session.rollback()
        
        # Use canonical seed file to avoid sample 3-room deployment state.
        print("Seeding canonical rooms from seed_rooms.py...")
        try:
            seed_rooms()
            print("Canonical rooms seeded successfully.")
        except Exception as e:
            print(f"Error seeding canonical rooms: {e}")
            db.session.rollback()

if __name__ == '__main__':
    init_database()
