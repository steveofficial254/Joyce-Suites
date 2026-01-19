from datetime import datetime, timezone
from sqlalchemy_serializer import SerializerMixin
from .base import BaseModel, db

class BookingInquiry(BaseModel, SerializerMixin):
    __tablename__ = "booking_inquiries"

    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    house_type = db.Column(db.String(50), nullable=True)
    occupancy = db.Column(db.String(50), nullable=True)
    move_in_date = db.Column(db.String(50), nullable=True)
    message = db.Column(db.Text, nullable=True)
    subject = db.Column(db.String(200), default="BOOKING REQUEST")
    
    status = db.Column(db.String(20), default="pending", nullable=False)
    is_paid = db.Column(db.Boolean, default=False, nullable=False)
    paid_at = db.Column(db.DateTime(timezone=True), nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    room_id = db.Column(db.Integer, db.ForeignKey("properties.id"), nullable=True)

    room = db.relationship("Property", foreign_keys=[room_id])
    approver = db.relationship("User", foreign_keys=[approved_by])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "house_type": self.house_type,
            "occupancy": self.occupancy,
            "move_in_date": self.move_in_date,
            "message": self.message,
            "subject": self.subject,
            "status": self.status,
            "is_paid": self.is_paid,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "room_id": self.room_id,
            "room_name": self.room.name if self.room else None
        }

    def __repr__(self):
        return f"<BookingInquiry {self.id} - {self.name} - {self.status}>"
