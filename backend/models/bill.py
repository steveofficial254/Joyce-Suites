from datetime import date
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db

BILL_STATUSES = ("unpaid", "paid", "overdue")


class Bill(BaseModel, SerializerMixin):
    __tablename__ = "bills"

    lease_id = db.Column(db.Integer, db.ForeignKey("leases.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="unpaid", nullable=False)

    lease = db.relationship("Lease", back_populates="bills")

    serialize_rules = ("-lease.bills",)

    @validates("amount")
    def validate_amount(self, key, value):
        if value <= 0:
            raise ValueError("Bill amount must be greater than 0")
        return value

    @validates("status")
    def validate_status(self, key, value):
        if value not in BILL_STATUSES:
            raise ValueError(f"Invalid status: {value}. Must be one of {BILL_STATUSES}")
        return value

    def pay(self):
        """Mark bill as paid"""
        self.status = "paid"
        self.save()

    def is_overdue(self):
        """Check if bill is overdue"""
        return self.status == "unpaid" and self.due_date < date.today()

    def total_with_penalty(self, penalty_rate=0.05):
        """Calculate total amount with penalty if overdue"""
        if self.is_overdue():
            return round(self.amount * (1 + penalty_rate), 2)
        return self.amount

    def __repr__(self):
        return f"<Bill {self.id} - {self.status} - KES {self.amount}>"
