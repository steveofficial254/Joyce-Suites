from datetime import datetime
from sqlalchemy import Enum
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

LEASE_STATUSES = ("active", "terminated", "expired")


class Lease(BaseModel, SerializerMixin):
    __tablename__ = 'leases'

    tenant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    rent_amount = db.Column(db.Float, nullable=False)
    status = db.Column(Enum(*LEASE_STATUSES, name='lease_status_enum'), default='active', nullable=False)
    deposit_amount = db.Column(db.Float, default=0.0)
    
    # Add these missing fields
    signed_by_tenant = db.Column(db.Boolean, default=False)
    signed_at = db.Column(db.DateTime)
    terms_accepted = db.Column(db.Boolean, default=False)
    signature_path = db.Column(db.String(255))
    signature_filename = db.Column(db.String(255))

    # Relationships
    tenant = db.relationship('User', back_populates='leases', foreign_keys=[tenant_id])
    property = db.relationship('Property', back_populates='leases')
    payments = db.relationship('Payment', back_populates='lease', cascade='all, delete-orphan')
    bills = db.relationship('Bill', back_populates='lease', cascade='all, delete-orphan')
    vacate_notices = db.relationship('VacateNotice', back_populates='lease', cascade='all, delete-orphan')

    serialize_rules = (
        '-tenant.leases',
        '-property.leases',
        '-payments.lease',
        '-bills.lease',
        '-vacate_notices.lease',
        '-signature_path',  # Hide sensitive path from serialization
        '-signature_filename'
    )

    @validates("end_date")
    def validate_dates(self, key, end_date):
        if end_date and self.start_date and end_date <= self.start_date:
            raise ValueError("End date must be after start date")
        return end_date

    @validates("rent_amount")
    def validate_rent(self, key, rent):
        if rent <= 0:
            raise ValueError("Rent amount must be greater than 0")
        return rent

    @validates("deposit_amount")
    def validate_deposit(self, key, deposit):
        if deposit and deposit < 0:
            raise ValueError("Deposit amount cannot be negative")
        return deposit

    def is_signed(self):
        """Check if lease is signed by tenant"""
        return bool(self.signed_by_tenant and self.signature_path)

    def is_expired(self):
        if self.end_date and datetime.now().date() > self.end_date:
            return True
        return False

    def duration_days(self):
        if self.end_date and self.start_date:
            return (self.end_date - self.start_date).days
        return 0

    def __repr__(self):
        return f"<Lease {self.id} - {self.status} - Signed: {self.signed_by_tenant}>"