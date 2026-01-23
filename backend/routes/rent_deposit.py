from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from models import db, RentRecord, DepositRecord, WaterBill, RentStatus, DepositStatus, WaterBillStatus, User, Property, Lease
from utils.auth import token_required, role_required

rent_deposit_bp = Blueprint('rent_deposit', __name__)

# Rent Management Routes
@rent_deposit_bp.route('/rent/records', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_rent_records(current_user):
    """Get all rent records with optional filters"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        tenant_id = request.args.get('tenant_id', type=int)
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        query = RentRecord.query
        
        # Apply filters
        if status:
            query = query.filter(RentRecord.status == status)
        if tenant_id:
            query = query.filter(RentRecord.tenant_id == tenant_id)
        if month:
            query = query.filter(RentRecord.month == month)
        if year:
            query = query.filter(RentRecord.year == year)
        
        # Order by most recent
        query = query.order_by(RentRecord.created_at.desc())
        
        # Paginate
        records = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'records': [record.to_dict() for record in records.items],
            'total': records.total,
            'pages': records.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/rent/tenant/<int:tenant_id>', methods=['GET'])
@token_required
def get_tenant_rent_records(current_user, tenant_id):
    """Get rent records for a specific tenant"""
    try:
        # Check if user is admin, caretaker, or the tenant themselves
        if current_user.role not in ['admin', 'caretaker'] and current_user.id != tenant_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        query = RentRecord.query.filter(RentRecord.tenant_id == tenant_id)
        
        if month and year:
            query = query.filter(
                and_(RentRecord.month == month, RentRecord.year == year)
            )
        
        records = query.order_by(RentRecord.year.desc(), RentRecord.month.desc()).all()
        
        return jsonify({
            'records': [record.to_dict() for record in records]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/rent/mark-payment', methods=['POST'])
@token_required
@role_required(['caretaker'])
def mark_rent_payment(current_user):
    """Mark rent payment by caretaker"""
    try:
        data = request.get_json()
        
        rent_id = data.get('rent_id')
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        
        if not rent_id or not amount_paid:
            return jsonify({'error': 'rent_id and amount_paid are required'}), 400
        
        rent_record = RentRecord.query.get(rent_id)
        if not rent_record:
            return jsonify({'error': 'Rent record not found'}), 404
        
        # Mark payment
        rent_record.mark_payment(
            amount_paid=amount_paid,
            caretaker_id=current_user.id,
            payment_method=payment_method,
            payment_reference=payment_reference,
            notes=notes
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment marked successfully',
            'rent_record': rent_record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/rent/generate-monthly', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def generate_monthly_rent(current_user):
    """Generate rent records for all active tenants for a specific month"""
    try:
        data = request.get_json()
        month = data.get('month')
        year = data.get('year')
        
        if not month or not year:
            return jsonify({'error': 'month and year are required'}), 400
        
        # Get all active leases
        active_leases = Lease.query.filter_by(status='active').all()
        
        generated_records = []
        for lease in active_leases:
            # Check if record already exists
            existing_record = RentRecord.query.filter(
                and_(
                    RentRecord.tenant_id == lease.tenant_id,
                    RentRecord.property_id == lease.property_id,
                    RentRecord.month == month,
                    RentRecord.year == year
                )
            ).first()
            
            if not existing_record:
                # Create new rent record
                due_date = datetime(year, month, 1) + timedelta(days=5)  # Due on 5th of month
                
                rent_record = RentRecord(
                    tenant_id=lease.tenant_id,
                    property_id=lease.property_id,
                    lease_id=lease.id,
                    due_date=due_date,
                    amount_due=lease.rent_amount,
                    balance=lease.rent_amount,
                    month=month,
                    year=year
                )
                
                rent_record.calculate_balance()
                db.session.add(rent_record)
                generated_records.append(rent_record)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Generated {len(generated_records)} rent records',
            'records': [record.to_dict() for record in generated_records]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Deposit Management Routes
@rent_deposit_bp.route('/deposit/records', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_deposit_records(current_user):
    """Get all deposit records with optional filters"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        tenant_id = request.args.get('tenant_id', type=int)
        
        query = DepositRecord.query
        
        # Apply filters
        if status:
            query = query.filter(DepositRecord.status == status)
        if tenant_id:
            query = query.filter(DepositRecord.tenant_id == tenant_id)
        
        # Order by most recent
        query = query.order_by(DepositRecord.created_at.desc())
        
        # Paginate
        records = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'records': [record.to_dict() for record in records.items],
            'total': records.total,
            'pages': records.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/deposit/tenant/<int:tenant_id>', methods=['GET'])
@token_required
def get_tenant_deposit_records(current_user, tenant_id):
    """Get deposit records for a specific tenant"""
    try:
        # Check if user is admin, caretaker, or the tenant themselves
        if current_user.role not in ['admin', 'caretaker'] and current_user.id != tenant_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        records = DepositRecord.query.filter(
            DepositRecord.tenant_id == tenant_id
        ).order_by(DepositRecord.created_at.desc()).all()
        
        return jsonify({
            'records': [record.to_dict() for record in records]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/deposit/mark-payment', methods=['POST'])
@token_required
@role_required(['caretaker'])
def mark_deposit_payment(current_user):
    """Mark deposit payment by caretaker"""
    try:
        data = request.get_json()
        
        deposit_id = data.get('deposit_id')
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        
        if not deposit_id or not amount_paid:
            return jsonify({'error': 'deposit_id and amount_paid are required'}), 400
        
        deposit_record = DepositRecord.query.get(deposit_id)
        if not deposit_record:
            return jsonify({'error': 'Deposit record not found'}), 404
        
        # Mark payment
        deposit_record.mark_payment(
            amount_paid=amount_paid,
            caretaker_id=current_user.id,
            payment_method=payment_method,
            payment_reference=payment_reference,
            notes=notes
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Deposit payment marked successfully',
            'deposit_record': deposit_record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/deposit/mark-refund', methods=['POST'])
@token_required
@role_required(['admin'])
def mark_deposit_refund(current_user):
    """Mark deposit refund by admin"""
    try:
        data = request.get_json()
        
        deposit_id = data.get('deposit_id')
        refund_amount = data.get('refund_amount')
        refund_method = data.get('refund_method')
        refund_reference = data.get('refund_reference')
        refund_notes = data.get('refund_notes')
        
        if not deposit_id or not refund_amount:
            return jsonify({'error': 'deposit_id and refund_amount are required'}), 400
        
        deposit_record = DepositRecord.query.get(deposit_id)
        if not deposit_record:
            return jsonify({'error': 'Deposit record not found'}), 404
        
        # Mark refund
        deposit_record.mark_refund(
            refund_amount=refund_amount,
            admin_id=current_user.id,
            refund_method=refund_method,
            refund_reference=refund_reference,
            refund_notes=refund_notes
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Deposit refund marked successfully',
            'deposit_record': deposit_record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/deposit/create', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def create_deposit_record(current_user):
    """Create deposit record for a tenant"""
    try:
        data = request.get_json()
        
        tenant_id = data.get('tenant_id')
        property_id = data.get('property_id')
        lease_id = data.get('lease_id')
        amount_required = data.get('amount_required')
        
        if not all([tenant_id, property_id, lease_id, amount_required]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if deposit record already exists for this lease
        existing_record = DepositRecord.query.filter(
            and_(
                DepositRecord.tenant_id == tenant_id,
                DepositRecord.property_id == property_id,
                DepositRecord.lease_id == lease_id
            )
        ).first()
        
        if existing_record:
            return jsonify({'error': 'Deposit record already exists for this lease'}), 400
        
        # Create deposit record
        deposit_record = DepositRecord(
            tenant_id=tenant_id,
            property_id=property_id,
            lease_id=lease_id,
            amount_required=amount_required,
            balance=amount_required
        )
        
        deposit_record.calculate_balance()
        db.session.add(deposit_record)
        db.session.commit()
        
        return jsonify({
            'message': 'Deposit record created successfully',
            'deposit_record': deposit_record.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Dashboard Summary Routes
@rent_deposit_bp.route('/dashboard/summary', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_dashboard_summary(current_user):
    """Get dashboard summary for rent and deposits"""
    try:
        # Get current month and year
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        # Rent statistics
        total_rent_records = RentRecord.query.count()
        paid_rent = RentRecord.query.filter_by(status=RentStatus.PAID).count()
        unpaid_rent = RentRecord.query.filter_by(status=RentStatus.UNPAID).count()
        overdue_rent = RentRecord.query.filter_by(status=RentStatus.OVERDUE).count()
        
        # Current month rent
        current_month_rent = RentRecord.query.filter(
            and_(
                RentRecord.month == current_month,
                RentRecord.year == current_year
            )
        ).all()
        
        current_month_paid = len([r for r in current_month_rent if r.status == RentStatus.PAID])
        current_month_unpaid = len([r for r in current_month_rent if r.status != RentStatus.PAID])
        
        # Deposit statistics
        total_deposit_records = DepositRecord.query.count()
        paid_deposits = DepositRecord.query.filter_by(status=DepositStatus.PAID).count()
        unpaid_deposits = DepositRecord.query.filter_by(status=DepositStatus.UNPAID).count()
        refunded_deposits = DepositRecord.query.filter_by(status=DepositStatus.REFUNDED).count()
        
        # Calculate totals
        total_rent_due = sum([float(r.amount_due) for r in current_month_rent])
        total_rent_collected = sum([float(r.amount_paid) for r in current_month_rent])
        
        # Water bill statistics
        current_month_water = WaterBill.query.filter(
            and_(
                WaterBill.month == current_month,
                WaterBill.year == current_year
            )
        ).all()
        
        total_water_records = WaterBill.query.count()
        paid_water = WaterBill.query.filter_by(status=WaterBillStatus.PAID).count()
        unpaid_water = WaterBill.query.filter_by(status=WaterBillStatus.UNPAID).count()
        overdue_water = WaterBill.query.filter_by(status=WaterBillStatus.OVERDUE).count()
        
        current_month_water_paid = len([w for w in current_month_water if w.status == WaterBillStatus.PAID])
        current_month_water_unpaid = len([w for w in current_month_water if w.status != WaterBillStatus.PAID])
        
        total_water_due = sum([float(w.amount_due) for w in current_month_water])
        total_water_collected = sum([float(w.amount_paid) for w in current_month_water])
        
        return jsonify({
            'rent_summary': {
                'total_records': total_rent_records,
                'paid': paid_rent,
                'unpaid': unpaid_rent,
                'overdue': overdue_rent,
                'current_month': {
                    'paid': current_month_paid,
                    'unpaid': current_month_unpaid,
                    'total_due': total_rent_due,
                    'total_collected': total_rent_collected
                }
            },
            'deposit_summary': {
                'total_records': total_deposit_records,
                'paid': paid_deposits,
                'unpaid': unpaid_deposits,
                'refunded': refunded_deposits
            },
            'water_bill_summary': {
                'total_records': total_water_records,
                'paid': paid_water,
                'unpaid': unpaid_water,
                'overdue': overdue_water,
                'current_month': {
                    'paid': current_month_water_paid,
                    'unpaid': current_month_water_unpaid,
                    'total_due': total_water_due,
                    'total_collected': total_water_collected
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Water Bill Management Routes
@rent_deposit_bp.route('/water-bill/records', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_water_bill_records(current_user):
    """Get all water bill records with optional filters"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        tenant_id = request.args.get('tenant_id', type=int)
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        query = WaterBill.query
        
        # Apply filters
        if status:
            query = query.filter(WaterBill.status == status)
        if tenant_id:
            query = query.filter(WaterBill.tenant_id == tenant_id)
        if month:
            query = query.filter(WaterBill.month == month)
        if year:
            query = query.filter(WaterBill.year == year)
        
        # Order by most recent
        query = query.order_by(WaterBill.created_at.desc())
        
        # Paginate
        records = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'records': [record.to_dict() for record in records.items],
            'total': records.total,
            'pages': records.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/water-bill/tenant/<int:tenant_id>', methods=['GET'])
@token_required
def get_tenant_water_bills(current_user, tenant_id):
    """Get water bills for a specific tenant"""
    try:
        # Check if user is admin, caretaker, or the tenant themselves
        if current_user.role not in ['admin', 'caretaker'] and current_user.id != tenant_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        query = WaterBill.query.filter(WaterBill.tenant_id == tenant_id)
        
        if month and year:
            query = query.filter(
                and_(WaterBill.month == month, WaterBill.year == year)
            )
        
        records = query.order_by(WaterBill.year.desc(), WaterBill.month.desc()).all()
        
        return jsonify({
            'records': [record.to_dict() for record in records]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/water-bill/create', methods=['POST'])
@token_required
@role_required(['caretaker'])
def create_water_bill(current_user):
    """Create water bill for tenant"""
    try:
        data = request.get_json()
        
        tenant_id = data.get('tenant_id')
        property_id = data.get('property_id')
        lease_id = data.get('lease_id')
        month = data.get('month')
        year = data.get('year')
        reading_date = data.get('reading_date')
        previous_reading = data.get('previous_reading')
        current_reading = data.get('current_reading')
        unit_rate = data.get('unit_rate', 50.0)  # Default rate
        
        if not all([tenant_id, property_id, lease_id, month, year, reading_date, previous_reading, current_reading]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if water bill already exists for this tenant and month
        existing_bill = WaterBill.query.filter(
            and_(
                WaterBill.tenant_id == tenant_id,
                WaterBill.month == month,
                WaterBill.year == year
            )
        ).first()
        
        if existing_bill:
            return jsonify({'error': 'Water bill already exists for this tenant and month'}), 400
        
        # Create due date (15th of following month)
        if month == 12:
            due_date = datetime(year + 1, 1, 15)
        else:
            due_date = datetime(year, month + 1, 15)
        
        # Create water bill
        water_bill = WaterBill(
            tenant_id=tenant_id,
            property_id=property_id,
            lease_id=lease_id,
            month=month,
            year=year,
            reading_date=datetime.fromisoformat(reading_date),
            previous_reading=previous_reading,
            current_reading=current_reading,
            unit_rate=unit_rate,
            due_date=due_date
        )
        
        water_bill.calculate_amount()
        db.session.add(water_bill)
        db.session.commit()
        
        return jsonify({
            'message': 'Water bill created successfully',
            'water_bill': water_bill.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/water-bill/mark-payment', methods=['POST'])
@token_required
@role_required(['caretaker'])
def mark_water_bill_payment(current_user):
    """Mark water bill payment by caretaker"""
    try:
        data = request.get_json()
        
        water_bill_id = data.get('water_bill_id')
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        
        if not water_bill_id or not amount_paid:
            return jsonify({'error': 'water_bill_id and amount_paid are required'}), 400
        
        water_bill = WaterBill.query.get(water_bill_id)
        if not water_bill:
            return jsonify({'error': 'Water bill not found'}), 404
        
        # Mark payment
        water_bill.mark_payment(
            amount_paid=amount_paid,
            caretaker_id=current_user.id,
            payment_method=payment_method,
            payment_reference=payment_reference,
            notes=notes
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Water bill payment marked successfully',
            'water_bill': water_bill.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/water-bill/bulk-create', methods=['POST'])
@token_required
@role_required(['caretaker'])
def bulk_create_water_bills(current_user):
    """Bulk create water bills for all active tenants for a specific month"""
    try:
        data = request.get_json()
        
        month = data.get('month')
        year = data.get('year')
        reading_date = data.get('reading_date')
        unit_rate = data.get('unit_rate', 50.0)
        bills_data = data.get('bills', [])  # Array of {tenant_id, property_id, lease_id, previous_reading, current_reading}
        
        if not all([month, year, reading_date]) or not bills_data:
            return jsonify({'error': 'month, year, reading_date, and bills data are required'}), 400
        
        created_bills = []
        errors = []
        
        for bill_data in bills_data:
            try:
                tenant_id = bill_data.get('tenant_id')
                property_id = bill_data.get('property_id')
                lease_id = bill_data.get('lease_id')
                previous_reading = bill_data.get('previous_reading')
                current_reading = bill_data.get('current_reading')
                
                if not all([tenant_id, property_id, lease_id, previous_reading, current_reading]):
                    errors.append(f'Invalid data for tenant {tenant_id}')
                    continue
                
                # Check if water bill already exists
                existing_bill = WaterBill.query.filter(
                    and_(
                        WaterBill.tenant_id == tenant_id,
                        WaterBill.month == month,
                        WaterBill.year == year
                    )
                ).first()
                
                if existing_bill:
                    errors.append(f'Water bill already exists for tenant {tenant_id}')
                    continue
                
                # Create due date (15th of following month)
                if month == 12:
                    due_date = datetime(year + 1, 1, 15)
                else:
                    due_date = datetime(year, month + 1, 15)
                
                water_bill = WaterBill(
                    tenant_id=tenant_id,
                    property_id=property_id,
                    lease_id=lease_id,
                    month=month,
                    year=year,
                    reading_date=datetime.fromisoformat(reading_date),
                    previous_reading=previous_reading,
                    current_reading=current_reading,
                    unit_rate=unit_rate,
                    due_date=due_date
                )
                
                water_bill.calculate_amount()
                db.session.add(water_bill)
                created_bills.append(water_bill)
                
            except Exception as e:
                errors.append(f'Error creating bill for tenant {bill_data.get("tenant_id", "unknown")}: {str(e)}')
        
        db.session.commit()
        
        return jsonify({
            'message': f'Created {len(created_bills)} water bills successfully',
            'created_bills': [bill.to_dict() for bill in created_bills],
            'errors': errors
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
