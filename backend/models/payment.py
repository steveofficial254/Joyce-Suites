# backend/models/payment.py - CORRECT PYTHON VERSION
from datetime import datetime
from .base import db

# Define payment status constants
PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'cancelled']

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    reference_number = db.Column(db.String(100))
    description = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = db.relationship('Tenant', back_populates='payments')
    lease = db.relationship('Lease', back_populates='payments')
    
    def __init__(self, tenant_id, amount, status='pending', payment_method=None, 
                 reference_number=None, description=None, lease_id=None):
        self.tenant_id = tenant_id
        self.amount = amount
        self.status = status
        self.payment_method = payment_method
        self.reference_number = reference_number
        self.description = description
        self.lease_id = lease_id
    
    def __repr__(self):
        return f'<Payment {self.id}: {self.amount} {self.status}>'
    
    def to_dict(self):
        """Convert payment to dictionary for JSON response"""
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'lease_id': self.lease_id,
            'amount': self.amount,
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
        self.status = 'completed'
        if reference_number:
            self.reference_number = reference_number
        self.payment_date = datetime.utcnow()
        return self
    
    def mark_as_failed(self):
        """Mark payment as failed"""
        self.status = 'failed'
        return self
    
