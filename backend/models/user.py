import uuid
from datetime import datetime, timezone
from sqlalchemy import Enum
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

from .base import BaseModel, db

USER_ROLES = ("tenant", "caretaker", "admin", "landlord")


class User(BaseModel, SerializerMixin):
    __tablename__ = "users"

    public_id = db.Column(db.String(50), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    national_id = db.Column(db.Integer, unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(Enum(*USER_ROLES, name="user_role_enum"), nullable=False, default='tenant')
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    photo_path = db.Column(db.String(255), nullable=True)
    id_document_path = db.Column(db.String(255), nullable=True)
    room_number = db.Column(db.String(20), nullable=True)

    # Relationships
    leases = db.relationship(
        "Lease", 
        back_populates="tenant", 
        cascade="all, delete-orphan",
        foreign_keys="Lease.tenant_id"
    )
    properties = db.relationship(
        "Property", 
        back_populates="landlord",
        foreign_keys="Property.landlord_id"
    )
    assigned_maintenance = db.relationship(
        'MaintenanceRequest', 
        foreign_keys='MaintenanceRequest.assigned_to_id',
        back_populates='assigned_to'
    )
    reported_maintenance = db.relationship(
        'MaintenanceRequest', 
        foreign_keys='MaintenanceRequest.reported_by_id',
        back_populates='reported_by'
    )
    messages = db.relationship(
        "Message", 
        back_populates="user",
        foreign_keys="Message.user_public_id"
    )
    notifications = db.relationship('Notification', back_populates='user')
    reset_passwords = db.relationship("ResetPassword", back_populates="user", cascade="all, delete-orphan")

    serialize_rules = (
        "-password_hash",
        "-leases.tenant",
        "-properties.landlord",
        "-assigned_maintenance.assigned_to",
        "-reported_maintenance.reported_by",
        "-messages.user",
        "-notifications.user",
        "-reset_passwords.user"
    )

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @validates('role')
    def validate_role(self, key, value):
        if value not in USER_ROLES:
            raise ValueError(f"Invalid role: {value}. Must be one of {USER_ROLES}")
        return value

    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email or '.' not in email:
            raise ValueError("Invalid email format")
        return email.lower()

    @validates('phone_number')
    def validate_phone(self, key, phone):
        if phone:
            cleaned_phone = ''.join(filter(str.isdigit, phone))
            if len(cleaned_phone) < 10:
                raise ValueError("Phone number must be at least 10 digits")
        return phone

    @validates('national_id')
    def validate_national_id(self, key, national_id):
        if not isinstance(national_id, int):
            raise ValueError("National ID must be an integer")
        if len(str(national_id)) > 8:
            raise ValueError("National ID should not exceed 8 digits")
        if national_id <= 0:
            raise ValueError("National ID must be a positive number")
        return national_id

    def to_dict(self):
        return {
            "public_id": self.public_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "username": self.username,
            "email": self.email,
            "national_id": self.national_id,
            "phone_number": self.phone_number,
            "role": self.role,
            "is_active": self.is_active,
            "photo_path": self.photo_path,
            "id_document_path": self.id_document_path,
            "room_number": self.room_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

    @staticmethod
    def validate_role_static(role):
        return role in USER_ROLES