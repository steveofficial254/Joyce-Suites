from app import create_app
from models.base import db
from models.payment import Payment
from models.lease import Lease
from models.property import Property
from sqlalchemy import func

app = create_app()

with app.app_context():
    print("=== DATABASE DIAGNOSTICS ===")
    
    print("\n[Properties]")
    total_props = Property.query.count()
    print(f"Total Properties: {total_props}")
    statuses = db.session.query(Property.status, func.count(Property.status)).group_by(Property.status).all()
    for status, count in statuses:
        print(f"  - {status}: {count}")

    print("\n[Leases]")
    total_leases = Lease.query.count()
    print(f"Total Leases: {total_leases}")
    lease_statuses = db.session.query(Lease.status, func.count(Lease.status)).group_by(Lease.status).all()
    for status, count in lease_statuses:
        print(f"  - {status}: {count}")

    print("\n[Payments]")
    total_payments = Payment.query.count()
    print(f"Total Payments: {total_payments}")
    pay_statuses = db.session.query(Payment.status, func.count(Payment.status)).group_by(Payment.status).all()
    for status, count in pay_statuses:
        print(f"  - {status}: {count}")
        
    print("\n[Revenue Calculation]")
    paid_sum = db.session.query(func.sum(Payment.amount)).filter_by(status='paid').scalar()
    completed_sum = db.session.query(func.sum(Payment.amount)).filter_by(status='completed').scalar()
    print(f"  - Sum where status='paid': {paid_sum}")
    print(f"  - Sum where status='completed': {completed_sum}")

    print("\n=== END DIAGNOSTICS ===")
