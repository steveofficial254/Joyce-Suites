from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from .base import db, BaseModel
import enum


class WaterBillStatus(enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    OVERDUE = "overdue"


class WaterBill(BaseModel):
    __tablename__ = 'water_bills'

    tenant_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    property_id = Column(Integer, ForeignKey('properties.id'), nullable=False)
    lease_id = Column(Integer, ForeignKey('leases.id'), nullable=False)
    
    # Water bill details
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    reading_date = Column(DateTime, nullable=False)
    previous_reading = Column(Numeric(10, 2), nullable=False)
    current_reading = Column(Numeric(10, 2), nullable=False)
    units_consumed = Column(Numeric(10, 2), nullable=False)
    unit_rate = Column(Numeric(10, 2), nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0.00)
    balance = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(WaterBillStatus), default=WaterBillStatus.UNPAID, nullable=False)
    
    # Payment tracking
    paid_by_caretaker_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Due date (typically 15th of following month)
    due_date = Column(DateTime, nullable=False)
    
    # Auto-calculation flags
    is_auto_calculated = Column(Boolean, default=True)
    last_calculated = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship('User', foreign_keys=[tenant_id], backref='water_bills')
    property = relationship('Property', backref='water_bills')
    lease = relationship('Lease', backref='water_bills')
    paid_by_caretaker = relationship('User', foreign_keys=[paid_by_caretaker_id])
    
    def calculate_amount(self):
        """Calculate water bill amount based on consumption"""
        self.units_consumed = float(self.current_reading) - float(self.previous_reading)
        self.amount_due = float(self.units_consumed) * float(self.unit_rate)
        self.calculate_balance()
    
    def calculate_balance(self):
        """Calculate remaining balance"""
        self.balance = float(self.amount_due) - float(self.amount_paid)
        
        # Auto-update status based on balance
        if self.balance <= 0:
            self.status = WaterBillStatus.PAID
            self.amount_paid = self.amount_due
            self.balance = 0
        elif float(self.amount_paid) > 0:
            self.status = WaterBillStatus.PARTIALLY_PAID
        else:
            self.status = WaterBillStatus.UNPAID
            
        # Check if overdue
        if self.due_date < datetime.utcnow() and self.status != WaterBillStatus.PAID:
            self.status = WaterBillStatus.OVERDUE
            
        self.last_calculated = datetime.utcnow()
    
    def mark_payment(self, amount_paid, caretaker_id, payment_method=None, payment_reference=None, notes=None):
        """Mark payment by caretaker"""
        self.amount_paid = float(amount_paid)
        self.paid_by_caretaker_id = caretaker_id
        self.payment_date = datetime.utcnow()
        self.payment_method = payment_method
        self.payment_reference = payment_reference
        self.notes = notes
        self.calculate_balance()
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'tenant_name': self.tenant.full_name if self.tenant else None,
            'property_id': self.property_id,
            'property_name': self.property.name if self.property else None,
            'lease_id': self.lease_id,
            'month': self.month,
            'year': self.year,
            'reading_date': self.reading_date.isoformat() if self.reading_date else None,
            'previous_reading': float(self.previous_reading),
            'current_reading': float(self.current_reading),
            'units_consumed': float(self.units_consumed),
            'unit_rate': float(self.unit_rate),
            'amount_due': float(self.amount_due),
            'amount_paid': float(self.amount_paid),
            'balance': float(self.balance),
            'status': self.status.value,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid_by_caretaker_id': self.paid_by_caretaker_id,
            'paid_by_caretaker_name': self.paid_by_caretaker.full_name if self.paid_by_caretaker else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'notes': self.notes,
            'is_auto_calculated': self.is_auto_calculated,
            'last_calculated': self.last_calculated.isoformat() if self.last_calculated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
