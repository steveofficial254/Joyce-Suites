# backend/models/tenant.py
from datetime import datetime
from .base import db
from .user import User

class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    room_number = db.Column(db.String(20))
    emergency_contact = db.Column(db.String(100))
    emergency_phone = db.Column(db.String(20))
    id_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='tenant_profile', uselist=False)
    leases = db.relationship('Lease', back_populates='tenant')
    payments = db.relationship('Payment', back_populates='tenant')
    
    def __repr__(self):
        return f'<Tenant {self.id}: {self.user.full_name if self.user else "No User"}>'
    
    def to_dict(self):
        """Convert tenant to dictionary for JSON response"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'room_number': self.room_number,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'id_number': self.id_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }