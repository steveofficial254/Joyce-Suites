 Ddevelop
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float)
    phone = db.Column(db.String(20))

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(20))
    price = db.Column(db.Float)
=======
from .base import db, BaseModel
from .user import User, USER_ROLES
from .property import Property, PROPERTY_TYPES, PROPERTY_STATUSES
from .lease import Lease, LEASE_STATUSES
from .bill import Bill, BILL_STATUSES
from .payment import Payment, PAYMENT_STATUSES
from .maintenance import MaintenanceRequest, MAINTENANCE_STATUSES, MAINTENANCE_PRIORITIES
from .message import Message
from .notification import Notification, NOTIFICATION_TYPES
from .reset_password import ResetPassword
from .vacate_notice import VacateNotice, VACATE_STATUSES
from .property_image import PropertyImage

__all__ = [
    # Database
    'db',
    'BaseModel',
    
    # Models
    'User',
    'Property',
    'Lease',
    'Bill',
    'Payment',
    'MaintenanceRequest',
    'Message',
    'Notification',
    'ResetPassword',
    'VacateNotice',
    'PropertyImage',
    
    # Constants
    'USER_ROLES',
    'PROPERTY_TYPES',
    'PROPERTY_STATUSES',
    'LEASE_STATUSES',
    'BILL_STATUSES',
    'PAYMENT_STATUSES',
    'MAINTENANCE_STATUSES',
    'MAINTENANCE_PRIORITIES',
    'NOTIFICATION_TYPES',
    'VACATE_STATUSES',
]
main
