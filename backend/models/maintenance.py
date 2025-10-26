from sqlalchemy import Enum
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

MAINTENANCE_STATUSES = ("pending", "in_progress", "completed", "cancelled")
MAINTENANCE_PRIORITIES = ("low", "normal", "high", "urgent")


class MaintenanceRequest(BaseModel, SerializerMixin):
    __tablename__ = 'maintenance_requests'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(Enum(*MAINTENANCE_STATUSES, name='maintenance_status_enum'), default='pending', nullable=False)
    priority = db.Column(db.String(20), default='normal', nullable=False)
    
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    reported_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationships
    property = db.relationship('Property', back_populates='maintenance_requests')
    reported_by = db.relationship('User', foreign_keys=[reported_by_id], back_populates='reported_maintenance')
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], back_populates='assigned_maintenance')

    serialize_rules = (
        '-property.maintenance_requests',
        '-reported_by.reported_maintenance',
        '-assigned_to.assigned_maintenance'
    )

    @validates('assigned_to')
    def validate_assigned_to(self, key, value):
        if value and value.role not in ['caretaker', 'admin']:
            raise ValueError("Maintenance requests can only be assigned to caretakers or admins")
        return value

    @validates('priority')
    def validate_priority(self, key, value):
        if value not in MAINTENANCE_PRIORITIES:
            raise ValueError(f"Invalid priority: {value}. Must be one of {MAINTENANCE_PRIORITIES}")
        return value

    def __repr__(self):
        return f"<MaintenanceRequest {self.id} - {self.status} - {self.priority}>"