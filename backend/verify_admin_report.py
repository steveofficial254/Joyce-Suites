from app import create_app
from models.base import db
from models.payment import Payment
from models.lease import Lease
from models.user import User
from models.property import Property
from sqlalchemy import func
from datetime import datetime, timedelta
import traceback

app = create_app()

with app.app_context():
    print("Running diagnostic on /api/admin/payments/report logic...")
    try:
        # Replicating the logic from get_payment_report
        
        # 1. Stats
        print("Fetching stats...")
        total_payments = Payment.query.count()
        successful_payments = Payment.query.filter_by(status='completed').count()
        pending_payments = Payment.query.filter_by(status='pending').count()
        failed_payments = Payment.query.filter_by(status='failed').count()
        
        total_amount = db.session.query(func.sum(Payment.amount))\
            .filter_by(status='completed').scalar() or 0
            
        print(f"Stats: Total={total_payments}, Success={successful_payments}, Pending={pending_payments}, Failed={failed_payments}, Amount={total_amount}")

        # 2. Recent Payments
        print("Fetching recent payments...")
        recent = Payment.query\
            .join(Lease, Payment.lease_id == Lease.id)\
            .join(User, Lease.tenant_id == User.id)\
            .join(Property, Lease.property_id == Property.id)\
            .order_by(Payment.created_at.desc())\
            .limit(20)\
            .all()
        
        print(f"Found {len(recent)} recent payments")
        
        recent_payments = []
        for payment in recent:
            print(f"Processing payment {payment.id}...")
            # Simulate the dictionary creation
            item = {
                'id': payment.id,
                'tenant_name': f"{payment.lease.tenant.first_name} {payment.lease.tenant.last_name}" if payment.lease and payment.lease.tenant else "Unknown",
                'property_name': payment.lease.property.name if payment.lease and payment.lease.property else "Unknown",
                'amount': float(payment.amount) if payment.amount else 0,
                'status': payment.status,
                'payment_type': payment.payment_type,
                'payment_date': payment.created_at.date().isoformat() if payment.created_at else None,
                'created_at': payment.created_at.isoformat() if payment.created_at else None
            }
            recent_payments.append(item)
            
        print("Recent payments processed successfully.")

        # 3. Monthly Breakdown
        print("Calculating monthly breakdown...")
        monthly_data = []
        for i in range(5, -1, -1):
            month_start = datetime.utcnow().replace(day=1) - timedelta(days=30*i)
            # Logic from the route:
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            print(f"Querying for {month_start.strftime('%b %Y')} ({month_start} to {month_end})")
            
            month_total = db.session.query(func.sum(Payment.amount))\
                .filter(
                    Payment.created_at >= month_start,
                    Payment.created_at <= month_end,
                    Payment.status == 'completed'
                ).scalar() or 0
            
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'total': float(month_total)
            })
            
        print("Monthly breakdown calculated.")
        print("SUCCESS! No error found in the main logic blocks.")

    except Exception as e:
        print("\n!!! CAUGHT EXCEPTION !!!")
        traceback.print_exc()
