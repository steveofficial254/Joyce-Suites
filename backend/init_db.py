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
        
        # Create some sample properties
        print("Creating sample properties...")
        properties = [
            Property(
                name='Room 101',
                property_type='bedsitter',
                rent_amount=8000.0,
                deposit_amount=8000.0,
                status='vacant',
                description='Cozy bedsitter room on ground floor',
                paybill_number='123456',
                account_number='ACC101',
                landlord_id=admin.id  # Use the created admin user as landlord
            ),
            Property(
                name='Room 102',
                property_type='bedsitter',
                rent_amount=8500.0,
                deposit_amount=8500.0,
                status='vacant',
                description='Spacious bedsitter room on first floor',
                paybill_number='123456',
                account_number='ACC102',
                landlord_id=admin.id
            ),
            Property(
                name='Room 201',
                property_type='one_bedroom',
                rent_amount=12000.0,
                deposit_amount=12000.0,
                status='vacant',
                description='One bedroom apartment on second floor',
                paybill_number='123456',
                account_number='ACC201',
                landlord_id=admin.id
            )
        ]
        
        try:
            for prop in properties:
                db.session.add(prop)
            db.session.commit()
            print("Sample properties created successfully!")
        except Exception as e:
            print(f"Error creating properties: {e}")
            db.session.rollback()

if __name__ == '__main__':
    init_database()
