from datetime import datetime, timezone
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
    
    # Due date (typically 5th of following month)
    due_date = Column(DateTime, nullable=False)
    
    # Notification tracking
    notification_sent_5th = Column(Boolean, default=False)  # Notification on 5th
    notification_sent_overdue = Column(Boolean, default=False)  # Overdue notifications
    last_notification_date = Column(DateTime, nullable=True)
    
    # Auto-calculation flags
    is_auto_calculated = Column(Boolean, default=True)
    last_calculated = Column(DateTime, nullable=True)
    
    # Caretaker who recorded the reading
    recorded_by_caretaker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    tenant = relationship('User', foreign_keys=[tenant_id], backref='water_bills')
    property = relationship('Property', backref='water_bills')
    lease = relationship('Lease', backref='water_bills')
    paid_by_caretaker = relationship('User', foreign_keys=[paid_by_caretaker_id])
    recorded_by_caretaker = relationship('User', foreign_keys=[recorded_by_caretaker_id])
    
    def calculate_amount(self):
        """Calculate water bill amount based on consumption"""
        curr = float(self.current_reading) if self.current_reading is not None else 0.0
        prev = float(self.previous_reading) if self.previous_reading is not None else 0.0
        rate = float(self.unit_rate) if self.unit_rate is not None else 0.0
        
        self.units_consumed = max(0, curr - prev)  # Ensure non-negative consumption
        self.amount_due = self.units_consumed * rate
        self.calculate_balance()
    
    def calculate_balance(self):
        """Calculate remaining balance and update status"""
        due = float(self.amount_due) if self.amount_due is not None else 0.0
        paid = float(self.amount_paid) if self.amount_paid is not None else 0.0
        self.balance = due - paid
        
        # Auto-update status based on balance
        if self.balance <= 0:
            self.status = WaterBillStatus.PAID
            self.amount_paid = self.amount_due
            self.balance = 0
        elif paid > 0:
            self.status = WaterBillStatus.PARTIALLY_PAID
        else:
            self.status = WaterBillStatus.UNPAID
            
        # Check if overdue (after 5th of month)
        now = datetime.now(timezone.utc)
        due_date = self.due_date
        if isinstance(due_date, datetime) and due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)

        if due_date < now and self.status != WaterBillStatus.PAID:
            self.status = WaterBillStatus.OVERDUE
            
        self.last_calculated = datetime.now(timezone.utc)
    
    def should_send_5th_notification(self):
        """Check if 5th day notification should be sent"""
        if self.notification_sent_5th or self.status == WaterBillStatus.PAID:
            return False
        
        now = datetime.now(timezone.utc)
        # Check if it's 5th day or later and same month/year as bill
        if (now.day >= 5 and now.month == self.month and now.year == self.year):
            return True
        return False
    
    def should_send_overdue_notification(self):
        """Check if overdue notification should be sent"""
        if self.notification_sent_overdue or self.status != WaterBillStatus.OVERDUE:
            return False
        
        now = datetime.now(timezone.utc)
        due_date = self.due_date
        if isinstance(due_date, datetime) and due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)
        
        # Send overdue notification if 2 days past due date
        if (now - due_date).days >= 2:
            return True
        return False
    
    def mark_notification_sent(self, notification_type='5th'):
        """Mark notification as sent"""
        if notification_type == '5th':
            self.notification_sent_5th = True
        elif notification_type == 'overdue':
            self.notification_sent_overdue = True
        self.last_notification_date = datetime.now(timezone.utc)
    
    def mark_payment(self, amount_paid, caretaker_id, payment_method=None, payment_reference=None, notes=None):
        """Mark payment by caretaker"""
        self.amount_paid = float(amount_paid)
        self.paid_by_caretaker_id = caretaker_id
        self.payment_date = datetime.now(timezone.utc)
        self.payment_method = payment_method
        self.payment_reference = payment_reference
        self.notes = notes
        self.calculate_balance()
    
    @staticmethod
    def create_monthly_bill(tenant, property, lease, current_reading, previous_reading, unit_rate, caretaker_id, month=None, year=None):
        """Create a monthly water bill for a tenant"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        # Due date is 5th of next month
        if month == 12:
            due_month = 1
            due_year = year + 1
        else:
            due_month = month + 1
            due_year = year
        
        due_date = datetime(due_year, due_month, 5, tzinfo=timezone.utc)
        
        water_bill = WaterBill(
            tenant_id=tenant.id,
            property_id=property.id,
            lease_id=lease.id,
            month=month,
            year=year,
            reading_date=datetime.now(timezone.utc),
            previous_reading=previous_reading,
            current_reading=current_reading,
            unit_rate=unit_rate,
            due_date=due_date,
            recorded_by_caretaker_id=caretaker_id
        )
        
        water_bill.calculate_amount()
        return water_bill
    
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
            'notification_sent_5th': self.notification_sent_5th,
            'notification_sent_overdue': self.notification_sent_overdue,
            'last_notification_date': self.last_notification_date.isoformat() if self.last_notification_date else None,
            'recorded_by_caretaker_id': self.recorded_by_caretaker_id,
            'recorded_by_caretaker_name': self.recorded_by_caretaker.full_name if self.recorded_by_caretaker else None,
            'is_auto_calculated': self.is_auto_calculated,
            'last_calculated': self.last_calculated.isoformat() if self.last_calculated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
