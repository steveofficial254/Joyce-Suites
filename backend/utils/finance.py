from datetime import datetime
from dateutil.relativedelta import relativedelta
from models.payment import Payment

def calculate_outstanding_balance(lease):
    """
    Calculate the outstanding balance for a given lease.
    Balance is calculated for the current payment period (5th of current month to 5th of next month).
    """
    if not lease:
        return 0.0

    try:
        today = datetime.now()
        # Payment period starts on the 5th of each month
        if today.day < 5:
            current_month_start = (today.replace(day=1) - relativedelta(days=1)).replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        else:
            current_month_start = today.replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        
        next_month_start = current_month_start + relativedelta(months=1)

        # Get all 'paid' payments for this lease in the current period
        payments = Payment.query.filter(
            Payment.lease_id == lease.id,
            Payment.status == 'paid',
            Payment.payment_date >= current_month_start,
            Payment.payment_date < next_month_start
        ).all()

        total_paid = sum(p.amount for p in payments)
        rent_amount = float(lease.rent_amount) if lease.rent_amount else 0.0
        
        # Balance is Rent - Total Paid
        balance = max(0.0, rent_amount - total_paid)
        return balance

    except Exception as e:
        print(f"Error calculating balance: {str(e)}")
        return 0.0
