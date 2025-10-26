from sqlalchemy import Enum
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

VACATE_STATUSES = ("pending", "approved", "rejected", "completed")


class VacateNotice(BaseModel, SerializerMixin):
    __tablename__ = 'vacate_notices'

    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'), nullable=False)
    vacate_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(Enum(*VACATE_STATUSES, name='vacate_status_enum'), default='pending', nullable=False)
    admin_notes = db.Column(db.Text)

    # Relationships
    lease = db.relationship('Lease', back_populates='vacate_notices')

    serialize_rules = ("-lease.vacate_notices",)

    @validates('status')
    def validate_status(self, key, value):
        if value not in VACATE_STATUSES:
            raise ValueError(f"Invalid status: {value}. Must be one of {VACATE_STATUSES}")
        return value

    def approve(self, notes=None):
        """Approve the vacate notice"""
        self.status = "approved"
        if notes:
            self.admin_notes = notes
        self.save()

    def reject(self, notes=None):
        """Reject the vacate notice"""
        self.status = "rejected"
        if notes:
            self.admin_notes = notes
        self.save()

    def complete(self):
        """Mark vacate notice as completed"""
        self.status = "completed"
        if self.lease:
            self.lease.status = "terminated"
            self.lease.save()
        self.save()

    def __repr__(self):
        return f"<VacateNotice {self.id} - Lease {self.lease_id} - {self.status}>"
