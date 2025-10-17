from datetime import datetime, timezone, timedelta
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db


class ResetPassword(BaseModel, SerializerMixin):
    __tablename__ = "reset_passwords"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(100), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="reset_passwords")

    serialize_rules = (
        "-user.reset_passwords",
        "-user.password_hash"
    )

    @classmethod
    def create_reset_token(cls, user_id, token, hours_valid=24):
        """Create a new reset token for a user"""
        expires_at = datetime.now(timezone.utc) + timedelta(hours=hours_valid)
        reset_token = cls(user_id=user_id, token=token, expires_at=expires_at)
        reset_token.save()
        return reset_token
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        now = datetime.now(timezone.utc)
        expires_at = self.expires_at
        
        # Normalize to timezone-aware UTC
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        return not self.used and expires_at > now
    
    def mark_as_used(self):
        """Mark token as used"""
        self.used = True
        self.save()

    def is_expired(self):
        """Check if token is expired"""
        now = datetime.now(timezone.utc)
        expires_at = self.expires_at
        
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        return now > expires_at
    
    @classmethod
    def find_valid_token(cls, token):
        """Find a valid (unused and not expired) reset token"""
        reset_password = cls.query.filter_by(token=token, used=False).first()
        if reset_password and reset_password.is_valid():
            return reset_password
        return None
    
    @classmethod
    def cleanup_expired_tokens(cls):
        """Remove all expired tokens from the database"""
        expired_tokens = cls.query.filter(cls.expires_at < datetime.now(timezone.utc)).all()
        count = len(expired_tokens)
        for token in expired_tokens:
            token.delete()
        return count

    def __repr__(self):
        return f"<ResetPassword user_id={self.user_id}, used={self.used}, expired={self.is_expired()}>"
