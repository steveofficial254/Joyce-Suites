#!/usr/bin/env python3
"""
Create missing database tables
"""

import os
from flask import Flask
from dotenv import load_dotenv

def create_missing_tables():
    """Create missing database tables"""
    load_dotenv()
    
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    from models.base import db
    db.init_app(app)
    
    with app.app_context():
        # Import all models to ensure they're registered
        from models.user import User
        from models.property import Property
        from models.lease import Lease
        from models.payment import Payment
        from models.maintenance import Maintenance
        from models.water_bill import WaterBill
        from models.rent_deposit import RentRecord, DepositRecord
        from models.notification import Notification
        from models.message import Message
        from models.vacate_notice import VacateNotice
        from models.booking_inquiry import BookingInquiry
        from models.reset_password import ResetPassword
        from models.property_image import PropertyImage
        
        # Create all tables
        db.create_all()
        print("✅ All database tables created successfully!")

if __name__ == "__main__":
    create_missing_tables()
