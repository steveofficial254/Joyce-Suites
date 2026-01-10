from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Room(db.Model):
    __tablename__ = "rooms"
    id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.Integer, unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f"<Room {self.room_number}>"

class Payment(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(20), nullable=True)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    room_number = db.Column(db.Integer, nullable=True)
    account_holder = db.Column(db.String(120), nullable=True)
    status = db.Column(db.String(50), default="pending")
    checkout_request_id = db.Column(db.String(120), unique=True, nullable=True)
    merchant_request_id = db.Column(db.String(120), nullable=True)
    transaction_id = db.Column(db.String(120), nullable=True)
    transaction_date = db.Column(db.String(50), nullable=True)
    payment_method = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Payment {self.id} {self.amount} {self.status}>"
