from sqlalchemy import Enum
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

PAYMENT_STATUSES = ("pending", "successful", "failed", "refunded")


class Payment(BaseModel, SerializerMixin):
    __tablename__ = 'payments'

    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    provider_id = db.Column(db.String(120))
    status = db.Column(Enum(*PAYMENT_STATUSES, name='payment_status_enum'), default='pending', nullable=False)
    transaction_id = db.Column(db.String(100), unique=True)

    # Relationships
    lease = db.relationship('Lease', back_populates='payments')
    
    serialize_rules = ("-lease.payments",)

    @validates('amount')
    def validate_amount(self, key, value):
        if value <= 0:
            raise ValueError("Payment amount must be greater than 0")
        return value

    def __repr__(self):
        return f"<Payment {self.id} - {self.status} - KES {self.amount}>"