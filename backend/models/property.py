from sqlalchemy import Enum
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

PROPERTY_TYPES = ( "bedsitter", "one_bedroom")
PROPERTY_STATUSES = ("vacant", "occupied", "under_maintenance")


class Property(BaseModel, SerializerMixin):
    __tablename__ = 'properties'

    name = db.Column(db.String(100), nullable=False)
    property_type = db.Column(Enum(*PROPERTY_TYPES, name='property_type_enum'), nullable=False)
    description = db.Column(db.Text)
    rent_amount = db.Column(db.Float, nullable=False)
    deposit_amount = db.Column(db.Float, nullable=False, default=0)  # Add this line
    landlord_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(Enum(*PROPERTY_STATUSES, name='property_status_enum'), default='vacant', nullable=False)
    paybill_number = db.Column(db.String(20), nullable=True)  # Add this line
    account_number = db.Column(db.String(50), nullable=True)  # Add this line

    # Relationships
    landlord = db.relationship('User', back_populates='properties', foreign_keys=[landlord_id])
    leases = db.relationship('Lease', back_populates='property', cascade='all, delete-orphan')
    images = db.relationship('PropertyImage', back_populates='property', cascade='all, delete-orphan')
    maintenance_requests = db.relationship('MaintenanceRequest', back_populates='property', cascade='all, delete-orphan')

    serialize_rules = (
        '-landlord.properties',
        '-leases.property',
        '-images.property',
        '-maintenance_requests.property'
    )

    @validates("rent_amount")
    def validate_rent(self, key, rent):
        if rent <= 0:
            raise ValueError("Rent amount must be greater than 0")
        return rent

    @validates("deposit_amount")
    def validate_deposit(self, key, deposit):
        if deposit < 0:
            raise ValueError("Deposit amount cannot be negative")
        return deposit

    @validates("status")
    def validate_status(self, key, value):
        if value not in PROPERTY_STATUSES:
            raise ValueError(f"Invalid status: {value}. Must be one of {PROPERTY_STATUSES}")
        return value

    def __repr__(self):
        return f"<Property {self.id} - {self.name} - {self.status}>"