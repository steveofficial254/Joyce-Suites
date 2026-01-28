from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from .base import db, BaseModel
import enum


class RentStatus(enum.Enum):
    UNPAID = "unpaid"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    OVERDUE = "overdue"


class DepositStatus(enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class RentRecord(BaseModel):
    __tablename__ = 'rent_records'

    tenant_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    property_id = Column(Integer, ForeignKey('properties.id'), nullable=False)
    lease_id = Column(Integer, ForeignKey('leases.id'), nullable=False)
    
    # Rent details
    due_date = Column(DateTime, nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0.00)
    balance = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(RentStatus), default=RentStatus.UNPAID, nullable=False)
    
    # Payment tracking
    paid_by_caretaker_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Month and year for tracking
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    
    # Auto-calculation flags
    is_auto_calculated = Column(Boolean, default=True)
    last_calculated = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship('User', foreign_keys=[tenant_id], backref='rent_records')
    property = relationship('Property', backref='rent_records')
    lease = relationship('Lease', backref='rent_records')
    paid_by_caretaker = relationship('User', foreign_keys=[paid_by_caretaker_id])
    
    def calculate_balance(self):
        """Calculate remaining balance"""
        amount_due = float(self.amount_due) if self.amount_due is not None else 0.0
        amount_paid = float(self.amount_paid) if self.amount_paid is not None else 0.0
        self.balance = amount_due - amount_paid
        
        # Auto-update status based on balance
        if self.balance <= 0:
            self.status = RentStatus.PAID
            self.amount_paid = self.amount_due
            self.balance = 0
        elif amount_paid > 0:
            self.status = RentStatus.PARTIALLY_PAID
        else:
            self.status = RentStatus.UNPAID
            
        # Check if overdue
        now = datetime.now(timezone.utc)
        due_date = self.due_date
        if isinstance(due_date, datetime) and due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)
            
        if due_date < now and self.status != RentStatus.PAID:
            self.status = RentStatus.OVERDUE
            
        self.last_calculated = datetime.now(timezone.utc)
    
    def mark_payment(self, amount_paid, caretaker_id, payment_method=None, payment_reference=None, notes=None):
        """Mark payment by caretaker"""
        self.amount_paid = float(amount_paid)
        self.paid_by_caretaker_id = caretaker_id
        self.payment_date = datetime.now(timezone.utc)
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
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'amount_due': float(self.amount_due),
            'amount_paid': float(self.amount_paid),
            'balance': float(self.balance),
            'status': self.status.value,
            'paid_by_caretaker_id': self.paid_by_caretaker_id,
            'paid_by_caretaker_name': self.paid_by_caretaker.full_name if self.paid_by_caretaker else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'notes': self.notes,
            'month': self.month,
            'year': self.year,
            'is_auto_calculated': self.is_auto_calculated,
            'last_calculated': self.last_calculated.isoformat() if self.last_calculated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class DepositRecord(BaseModel):
    __tablename__ = 'deposit_records'

    tenant_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    property_id = Column(Integer, ForeignKey('properties.id'), nullable=False)
    lease_id = Column(Integer, ForeignKey('leases.id'), nullable=False)
    
    # Deposit details
    amount_required = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0.00)
    balance = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(DepositStatus), default=DepositStatus.UNPAID, nullable=False)
    
    # Payment tracking
    paid_by_caretaker_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Refund tracking
    refund_amount = Column(Numeric(10, 2), default=0.00)
    refund_date = Column(DateTime, nullable=True)
    refund_method = Column(String(50), nullable=True)
    refund_reference = Column(String(100), nullable=True)
    refund_notes = Column(Text, nullable=True)
    refunded_by_admin_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Notification tracking
    payment_notification_sent = Column(Boolean, default=False)
    last_notification_date = Column(DateTime, nullable=True)
    
    # Auto-calculation flags
    is_auto_calculated = Column(Boolean, default=True)
    last_calculated = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship('User', foreign_keys=[tenant_id], backref='deposit_records')
    property = relationship('Property', backref='deposit_records')
    lease = relationship('Lease', backref='deposit_records')
    paid_by_caretaker = relationship('User', foreign_keys=[paid_by_caretaker_id])
    refunded_by_admin = relationship('User', foreign_keys=[refunded_by_admin_id])
    
    def calculate_balance(self):
        """Calculate remaining deposit balance and update status"""
        amount_required = float(self.amount_required) if self.amount_required is not None else 0.0
        amount_paid = float(self.amount_paid) if self.amount_paid is not None else 0.0
        refund_amount = float(self.refund_amount) if self.refund_amount is not None else 0.0
        self.balance = amount_required - amount_paid + refund_amount
        
        # Auto-update status
        if amount_paid >= amount_required and refund_amount == 0:
            self.status = DepositStatus.PAID
        elif refund_amount > 0:
            if refund_amount >= amount_paid:
                self.status = DepositStatus.REFUNDED
            else:
                self.status = DepositStatus.PARTIALLY_REFUNDED
        else:
            self.status = DepositStatus.UNPAID
        
        self.last_calculated = datetime.now(timezone.utc)
    
    def mark_payment_notification_sent(self):
        """Mark payment notification as sent"""
        self.payment_notification_sent = True
        self.last_notification_date = datetime.now(timezone.utc)
    
    @staticmethod
    def create_deposit_record(tenant, property_obj, lease, amount_required, caretaker_id=None):
        """Create a deposit record for a tenant"""
        deposit_record = DepositRecord(
            tenant_id=tenant.id,
            property_id=property_obj.id,
            lease_id=lease.id,
            amount_required=amount_required,
            balance=amount_required,
            status=DepositStatus.UNPAID
        )
        
        return deposit_record
    
    def mark_payment(self, amount_paid, caretaker_id, payment_method=None, payment_reference=None, notes=None):
        """Mark deposit payment by caretaker"""
        self.amount_paid = float(amount_paid)
        self.paid_by_caretaker_id = caretaker_id
        self.payment_date = datetime.now(timezone.utc)
        self.payment_method = payment_method
        self.payment_reference = payment_reference
        self.notes = notes
        self.calculate_balance()
    
    def mark_refund(self, refund_amount, admin_id, refund_method=None, refund_reference=None, refund_notes=None):
        """Mark deposit refund by admin"""
        self.refund_amount = float(refund_amount)
        self.refunded_by_admin_id = admin_id
        self.refund_date = datetime.now(timezone.utc)
        self.refund_method = refund_method
        self.refund_reference = refund_reference
        self.refund_notes = refund_notes
        self.calculate_balance()
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'tenant_name': self.tenant.full_name if self.tenant else None,
            'property_id': self.property_id,
            'property_name': self.property.name if self.property else None,
            'lease_id': self.lease_id,
            'amount_required': float(self.amount_required),
            'amount_paid': float(self.amount_paid),
            'balance': float(self.balance),
            'status': self.status.value,
            'paid_by_caretaker_id': self.paid_by_caretaker_id,
            'paid_by_caretaker_name': self.paid_by_caretaker.full_name if self.paid_by_caretaker else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'notes': self.notes,
            'refund_amount': float(self.refund_amount),
            'refund_date': self.refund_date.isoformat() if self.refund_date else None,
            'refund_method': self.refund_method,
            'refund_reference': self.refund_reference,
            'refund_notes': self.refund_notes,
            'refunded_by_admin_id': self.refunded_by_admin_id,
            'refunded_by_admin_name': self.refunded_by_admin.full_name if self.refunded_by_admin else None,
            'payment_notification_sent': self.payment_notification_sent,
            'last_notification_date': self.last_notification_date.isoformat() if self.last_notification_date else None,
            'is_auto_calculated': self.is_auto_calculated,
            'last_calculated': self.last_calculated.isoformat() if self.last_calculated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
