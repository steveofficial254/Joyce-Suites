from datetime import datetime, timezone
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

NOTIFICATION_TYPES = ("general", "urgent", "maintenance", "payment", "lease", "system", "inquiry")


class Notification(BaseModel, SerializerMixin):
    __tablename__ = "notifications"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default="general", nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    read_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="notifications")

    serialize_rules = (
        "-user.notifications",
        "-user.password_hash"
    )

    @validates('notification_type')
    def validate_notification_type(self, key, value):
        if value not in NOTIFICATION_TYPES:
            raise ValueError(f"Invalid notification type: {value}. Must be one of {NOTIFICATION_TYPES}")
        return value

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.now(timezone.utc)
            self.save()

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user.public_id if self.user else None,
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }

    def __repr__(self):
        return f"<Notification {self.id} - {self.notification_type} - {'Read' if self.is_read else 'Unread'}>"
