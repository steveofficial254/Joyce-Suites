from datetime import datetime, timezone
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db


class Message(BaseModel, SerializerMixin):
    __tablename__ = "messages"

    user_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = db.relationship(
        "User", 
        back_populates="messages",
        foreign_keys=[user_public_id]
    )
    replies = db.relationship(
        "Message",
        backref=db.backref("parent", remote_side="Message.id"),
        cascade="all, delete-orphan"
    )

    serialize_rules = (
        "-user.messages",
        "-replies.parent"
    )

    @validates('content')
    def validate_content(self, key, value):
        if not value or not value.strip():
            raise ValueError("Message content cannot be empty")
        if len(value) > 5000:
            raise ValueError("Message content cannot exceed 5000 characters")
        return value.strip()

    def __repr__(self):
        return f"<Message {self.id} by {self.user_public_id}>"