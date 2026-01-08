# backend/models/payment.py
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin
from .base import BaseModel, db

# Define payment status constants
PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'cancelled', 'paid', 'unpaid']

class Payment(BaseModel, SerializerMixin):
    __tablename__ = 'payments'
    
    tenant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    amount_paid = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), nullable=False, default='pending')
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime)
    reference_number = db.Column(db.String(100))
    description = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    # Relationships
    tenant = db.relationship('User', back_populates='payments', foreign_keys=[tenant_id])
    lease = db.relationship('Lease', back_populates='payments', foreign_keys=[lease_id])
    
    serialize_rules = (
        '-tenant.payments',
        '-lease.payments',
    )
    
    def __repr__(self):
        return f'<Payment {self.id}: {self.amount} {self.status}>'
    
    def to_dict(self):
        """Convert payment to dictionary for JSON response"""
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'lease_id': self.lease_id,
            'amount': float(self.amount) if self.amount else 0.0,
            'amount_paid': float(self.amount_paid) if self.amount_paid else 0.0,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'reference_number': self.reference_number,
            'description': self.description,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def mark_as_completed(self, reference_number=None):
        """Mark payment as completed"""
        self.status = 'paid'
        if reference_number:
            self.reference_number = reference_number
        self.payment_date = datetime.utcnow()
        return self
    
    def mark_as_failed(self):
        """Mark payment as failed"""
        self.status = 'failed'
        return self