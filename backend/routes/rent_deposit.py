from flask import Blueprint, request, jsonify, current_app
import traceback
from datetime import datetime, timedelta, timezone
from sqlalchemy import and_, or_
from models.base import db
from models.user import User
from models.property import Property
from models.lease import Lease
from models.rent_deposit import RentRecord, DepositRecord, RentStatus, DepositStatus
from models.water_bill import WaterBill, WaterBillStatus
from models.notification import Notification
from routes.auth_routes import token_required
from functools import wraps

def role_required(allowed_roles):
    """Decorator requiring specific roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.method == 'OPTIONS':
                return f(*args, **kwargs)
                
            if request.user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "error": f"Access denied. Required roles: {', '.join(allowed_roles)}"
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

rent_deposit_bp = Blueprint('rent_deposit', __name__)

# Rent Management Routes
@rent_deposit_bp.route('/rent/records', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_rent_records():
    """Get all rent records with optional filters"""
    current_user = db.session.get(User, request.user_id)
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
def get_tenant_rent_records(tenant_id):
    """Get rent records for a specific tenant"""
    current_user = db.session.get(User, request.user_id)
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
        traceback.print_exc()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500


@rent_deposit_bp.route('/rent/mark-payment', methods=['POST'])
@token_required
@role_required(['caretaker'])
def mark_rent_payment():
    """Mark rent payment by caretaker"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        
        rent_id = data.get('rent_id')
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        
        if not rent_id or not amount_paid:
            return jsonify({'error': 'rent_id and amount_paid are required'}), 400
        
        rent_record = db.session.get(RentRecord, rent_id)
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
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/rent/generate-monthly', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def generate_monthly_rent():
    """Generate rent records for all active tenants for a specific month"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        month = data.get('month')
        year = data.get('year')
        
        if not month or not year:
            return jsonify({'error': 'month and year are required'}), 400
        
        current_app.logger.info(f"DEBUG: Generating rent for {month}/{year}")
        
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
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


# Deposit Management Routes
@rent_deposit_bp.route('/test-debug', methods=['GET'])
def test_debug():
    """Simple test endpoint to debug 500 errors"""
    try:
        return jsonify({
            'success': True,
            'message': 'Debug endpoint working',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@rent_deposit_bp.route('/tenants-with-leases', methods=['GET', 'OPTIONS'])
@token_required
@role_required(['caretaker'])
def get_tenants_with_leases():
    """Get all tenants with active leases for caretaker management"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        current_app.logger.info("Fetching tenants with active leases...")
        
        # Get all tenants with active leases using a more robust query
        active_leases = Lease.query.filter_by(status='active').all()
        current_app.logger.info(f"Found {len(active_leases)} active leases")
        
        tenants_data = []
        for lease in active_leases:
            try:
                # Safely access related objects
                tenant_name = lease.tenant.name if lease.tenant and hasattr(lease.tenant, 'name') else 'Unknown'
                tenant_email = lease.tenant.email if lease.tenant and hasattr(lease.tenant, 'email') else 'Unknown'
                property_name = lease.property.name if lease.property and hasattr(lease.property, 'name') else 'Unknown'
                room_number = lease.tenant.room_number if lease.tenant and hasattr(lease.tenant, 'room_number') else 'Unknown'
                
                tenant_data = {
                    'tenant_id': lease.tenant_id,
                    'tenant_name': tenant_name,
                    'tenant_email': tenant_email,
                    'property_id': lease.property_id,
                    'property_name': property_name,
                    'room_number': room_number,
                    'lease_id': lease.id,
                    'rent_amount': lease.rent_amount or 0,
                    'deposit_amount': lease.deposit_amount or 0
                }
                tenants_data.append(tenant_data)
                current_app.logger.info(f"Added tenant: {tenant_name}, Room: {room_number}")
                
            except Exception as e:
                current_app.logger.error(f"Error processing lease {lease.id}: {str(e)}")
                continue
        
        current_app.logger.info(f"Successfully processed {len(tenants_data)} tenants")
        return jsonify({
            'success': True,
            'tenants': tenants_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching tenants with leases: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/rent/<int:rent_id>/mark-paid', methods=['PUT'])
@token_required
@role_required(['caretaker'])
def mark_rent_paid(rent_id):
    """Mark rent as paid by caretaker"""
    try:
        current_user = db.session.get(User, request.user_id)
        
        rent_record = RentRecord.query.get(rent_id)
        if not rent_record:
            return jsonify({'error': 'Rent record not found'}), 404
            
        # Mark as paid
        rent_record.mark_as_paid(rent_record.amount_due, paid_by_caretaker_id=current_user.id)
        
        # Create notification for tenant
        notification = Notification(
            user_id=rent_record.tenant_id,
            title='Rent Payment Marked as Paid',
            message=f'Your rent payment for {rent_record.month} {rent_record.year} has been marked as paid by the caretaker.',
            notification_type='payment'
        )
        db.session.add(notification)
        
        # Create notification for admin
        admin_users = User.query.filter_by(role='admin').all()
        for admin in admin_users:
            admin_notification = Notification(
                user_id=admin.id,
                title='Rent Payment Marked',
                message=f'Caretaker {current_user.full_name} marked rent for tenant {rent_record.tenant.full_name} as paid.',
                notification_type='payment'
            )
            db.session.add(admin_notification)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rent marked as paid successfully',
            'rent_status': rent_record.status.value
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error marking rent as paid: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/rent/<int:rent_id>/mark-unpaid', methods=['PUT'])
@token_required
@role_required(['caretaker'])
def mark_rent_unpaid(rent_id):
    """Mark rent as unpaid by caretaker"""
    try:
        current_user = db.session.get(User, request.user_id)
        
        rent_record = RentRecord.query.get(rent_id)
        if not rent_record:
            return jsonify({'error': 'Rent record not found'}), 404
            
        # Mark as unpaid
        rent_record.status = RentStatus.UNPAID
        rent_record.amount_paid = 0
        rent_record.balance = rent_record.amount_due
        rent_record.paid_by_caretaker_id = current_user.id
        rent_record.last_calculated = datetime.now(timezone.utc)
        
        # Create notification for tenant
        notification = Notification(
            user_id=rent_record.tenant_id,
            title='Rent Payment Marked as Unpaid',
            message=f'Your rent payment for {rent_record.month} {rent_record.year} has been marked as unpaid by the caretaker.',
            notification_type='payment'
        )
        db.session.add(notification)
        
        # Create notification for admin
        admin_users = User.query.filter_by(role='admin').all()
        for admin in admin_users:
            admin_notification = Notification(
                user_id=admin.id,
                title='Rent Payment Marked Unpaid',
                message=f'Caretaker {current_user.full_name} marked rent for tenant {rent_record.tenant.full_name} as unpaid.',
                notification_type='payment'
            )
            db.session.add(admin_notification)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rent marked as unpaid successfully',
            'rent_status': rent_record.status.value
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error marking rent as unpaid: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/deposit/records', methods=['GET', 'OPTIONS'])
@token_required
@role_required(['admin', 'caretaker'])
def get_deposit_records():
    """Get all deposit records with optional filters"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
        
    current_user = db.session.get(User, request.user_id)
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
def get_tenant_deposit_records(tenant_id):
    """Get deposit records for a specific tenant"""
    current_user = db.session.get(User, request.user_id)
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
        traceback.print_exc()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500


@rent_deposit_bp.route('/deposit/mark-refund', methods=['POST'])
@token_required
@role_required(['admin'])
def mark_deposit_refund():
    """Mark deposit refund by admin"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        
        deposit_id = data.get('deposit_id')
        refund_amount = data.get('refund_amount')
        refund_method = data.get('refund_method')
        refund_reference = data.get('refund_reference')
        refund_notes = data.get('refund_notes')
        
        if not deposit_id or not refund_amount:
            return jsonify({'error': 'deposit_id and refund_amount are required'}), 400
        
        deposit_record = db.session.get(DepositRecord, deposit_id)
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
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/deposit/create', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def create_deposit_record():
    """Create deposit record for a tenant"""
    current_user = db.session.get(User, request.user_id)
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
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


# Dashboard Summary Routes
@rent_deposit_bp.route('/dashboard/summary', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_dashboard_summary():
    """Get dashboard summary for rent and deposits"""
    current_user = db.session.get(User, request.user_id)
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
def get_water_bill_records():
    """Get all water bill records with optional filters"""
    current_user = db.session.get(User, request.user_id)
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        tenant_id = request.args.get('tenant_id', type=int)
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        # Eagerly load tenant and property relationships
        query = WaterBill.query.options(
            db.joinedload(WaterBill.tenant),
            db.joinedload(WaterBill.property),
            db.joinedload(WaterBill.paid_by_caretaker),
            db.joinedload(WaterBill.recorded_by_caretaker)
        )
        
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
        current_app.logger.error(f"Error fetching water bill records: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/water-bill/tenant/<int:tenant_id>', methods=['GET'])
@token_required
def get_tenant_water_bills(tenant_id):
    """Get water bills for a specific tenant"""
    current_user = db.session.get(User, request.user_id)
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
        traceback.print_exc()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500


@rent_deposit_bp.route('/water-bill/create', methods=['POST'])
@token_required
@role_required(['caretaker'])
def create_water_bill():
    """Create water bill for tenant (caretaker simplified version)"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        
        tenant_id = data.get('tenant_id')
        property_id = data.get('property_id')
        month = data.get('month')
        year = data.get('year')
        reading_date = data.get('reading_date')
        previous_reading = data.get('previous_reading')
        current_reading = data.get('current_reading')
        unit_rate = data.get('unit_rate', 50.0)  # Default rate
        
        if not all([tenant_id, property_id, month, year, reading_date, previous_reading, current_reading]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Get tenant's active lease automatically
        active_lease = Lease.query.filter_by(
            tenant_id=tenant_id, 
            status='active'
        ).first()
        
        if not active_lease:
            return jsonify({'error': 'No active lease found for this tenant'}), 400
        
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
            lease_id=active_lease.id,
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
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@rent_deposit_bp.route('/water-bill/bulk-create', methods=['POST'])
@token_required
@role_required(['caretaker'])
def bulk_create_water_bills():
    """Bulk create water bills for all active tenants for a specific month"""
    current_user = db.session.get(User, request.user_id)
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
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


# Automated Checks Route
@rent_deposit_bp.route('/run-checks', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def run_overdue_checks():
    """
    Manually trigger checks for overdue payments (Rent & Water).
    Updates status to 'overdue' and sends notifications.
    Typically run after the 5th of the month.
    """
    current_user = db.session.get(User, request.user_id)
    try:
        from models import Notification
        
        now = datetime.now()
        current_date = now.date()
        
        # 1. Check Overdue Rent
        # Find unpaid/pending rent records where due_date < current_date
        overdue_rent = RentRecord.query.filter(
            and_(
                RentRecord.status.in_([RentStatus.UNPAID, RentStatus.PENDING]),
                RentRecord.due_date < current_date
            )
        ).all()
        
        rent_updates = 0
        rent_notifications = 0
        
        for record in overdue_rent:
            # Update status
            record.status = RentStatus.OVERDUE
            rent_updates += 1
            
            # Check if notification already sent today to avoid spamming
            existing_notif = Notification.query.filter(
                and_(
                    Notification.user_id == record.tenant_id,
                    Notification.type == 'payment_overdue',
                    Notification.created_at >= datetime(now.year, now.month, now.day)
                )
            ).first()
            
            if not existing_notif:
                # Create notification
                notif = Notification(
                    user_id=record.tenant_id,
                    title="Rent Payment Overdue",
                    message=f"Your rent payment of KES {record.balance:,.2f} for {record.month}/{record.year} is overdue. Please pay immediately.",
                    type="payment_overdue",
                    is_read=False
                )
                db.session.add(notif)
                rent_notifications += 1

        # 2. Check Overdue Water Bills
        overdue_water = WaterBill.query.filter(
            and_(
                WaterBill.status.in_([WaterBillStatus.UNPAID, WaterBillStatus.PENDING]),
                WaterBill.due_date < current_date
            )
        ).all()
        
        water_updates = 0
        
        for bill in overdue_water:
            bill.status = WaterBillStatus.OVERDUE
            water_updates += 1
            
            # Check existing notification
            existing_notif = Notification.query.filter(
                and_(
                    Notification.user_id == bill.tenant_id,
                    Notification.type == 'payment_overdue',
                    Notification.message.like('%water bill%'),
                    Notification.created_at >= datetime(now.year, now.month, now.day)
                )
            ).first()
            
            if not existing_notif:
                notif = Notification(
                    user_id=bill.tenant_id,
                    title="Water Bill Overdue",
                    message=f"Your water bill of KES {bill.balance:,.2f} for {bill.month}/{bill.year} is overdue.",
                    type="payment_overdue",
                    is_read=False
                )
                db.session.add(notif)

        db.session.commit()
        
        return jsonify({
            'message': 'Overdue checks completed successfully',
            'summary': {
                'rent_records_updated': rent_updates,
                'rent_notifications_sent': rent_notifications,
                'water_bills_updated': water_updates
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        current_app.logger.error(f"Error in {request.path}: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


# Water Bill Management Routes for Caretakers
@rent_deposit_bp.route('/water-bill/record-readings', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def record_water_readings():
    """Record water readings for all tenants for a specific month"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        month = data.get('month')
        year = data.get('year')
        unit_rate = data.get('unit_rate', 50.0)  # Default rate per unit
        readings = data.get('readings', [])  # List of {tenant_id, current_reading, previous_reading}
        
        if not month or not year:
            return jsonify({'success': False, 'error': 'Month and year are required'}), 400
        
        if not readings:
            return jsonify({'success': False, 'error': 'At least one reading is required'}), 400
        
        created_bills = []
        updated_bills = []
        errors = []
        
        for reading_data in readings:
            try:
                tenant_id = reading_data.get('tenant_id')
                current_reading = reading_data.get('current_reading')
                previous_reading = reading_data.get('previous_reading', 0)
                
                if not tenant_id or current_reading is None:
                    errors.append(f"Invalid reading data for tenant {tenant_id}")
                    continue
                
                # Get tenant's active lease
                active_lease = Lease.query.filter_by(
                    tenant_id=tenant_id, 
                    status='active'
                ).first()
                
                if not active_lease:
                    errors.append(f"No active lease found for tenant {tenant_id}")
                    continue
                
                # Check if water bill already exists for this month/year
                existing_bill = WaterBill.query.filter_by(
                    tenant_id=tenant_id,
                    month=month,
                    year=year
                ).first()
                
                if existing_bill:
                    # Update existing bill
                    existing_bill.current_reading = current_reading
                    existing_bill.previous_reading = previous_reading
                    existing_bill.unit_rate = unit_rate
                    existing_bill.recorded_by_caretaker_id = current_user.id
                    existing_bill.calculate_amount()
                    updated_bills.append(existing_bill)
                else:
                    # Create new water bill
                    water_bill = WaterBill.create_monthly_bill(
                        tenant=active_lease.tenant,
                        property=active_lease.property,
                        lease=active_lease,
                        current_reading=current_reading,
                        previous_reading=previous_reading,
                        unit_rate=unit_rate,
                        caretaker_id=current_user.id,
                        month=month,
                        year=year
                    )
                    db.session.add(water_bill)
                    created_bills.append(water_bill)
                    
            except Exception as e:
                errors.append(f"Error processing reading for tenant {tenant_id}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Processed {len(created_bills + updated_bills)} water bills successfully',
            'created_bills': len(created_bills),
            'updated_bills': len(updated_bills),
            'errors': errors,
            'bills': [bill.to_dict() for bill in created_bills + updated_bills]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error recording water readings: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to record water readings: {str(e)}'}), 500

@rent_deposit_bp.route('/water-bill/tenants-with-readings', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_tenants_for_water_readings():
    """Get all tenants with their properties and last water readings for recording new readings"""
    try:
        month = request.args.get('month', datetime.now().month, type=int)
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Get all tenants with active leases
        active_leases = Lease.query.filter_by(status='active').all()
        
        tenants_data = []
        for lease in active_leases:
            # Get last water bill for previous reading
            last_water_bill = WaterBill.query.filter_by(tenant_id=lease.tenant_id)\
                .order_by(WaterBill.year.desc(), WaterBill.month.desc())\
                .first()
            
            # Check if bill already exists for current month
            current_month_bill = WaterBill.query.filter_by(
                tenant_id=lease.tenant_id,
                month=month,
                year=year
            ).first()
            
            tenants_data.append({
                'tenant_id': lease.tenant_id,
                'tenant_name': lease.tenant.full_name,
                'tenant_email': lease.tenant.email,
                'property_id': lease.property_id,
                'property_name': lease.property.name,
                'lease_id': lease.id,
                'last_reading': float(last_water_bill.current_reading) if last_water_bill else 0,
                'last_month': last_water_bill.month if last_water_bill else None,
                'last_year': last_water_bill.year if last_water_bill else None,
                'current_month_bill_exists': current_month_bill is not None,
                'current_month_bill': current_month_bill.to_dict() if current_month_bill else None
            })
        
        return jsonify({
            'success': True,
            'tenants': tenants_data,
            'month': month,
            'year': year,
            'total_tenants': len(tenants_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching tenants for water readings: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch tenants: {str(e)}'}), 500

@rent_deposit_bp.route('/water-bill/mark-payment', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def mark_water_bill_payment():
    """Mark water bill payment for a tenant"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        bill_id = data.get('bill_id')
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        
        if not bill_id or amount_paid is None:
            return jsonify({'success': False, 'error': 'Bill ID and amount paid are required'}), 400
        
        water_bill = WaterBill.query.get(bill_id)
        if not water_bill:
            return jsonify({'success': False, 'error': 'Water bill not found'}), 404
        
        # Record payment
        water_bill.mark_payment(
            amount_paid=amount_paid,
            caretaker_id=current_user.id,
            payment_method=payment_method,
            payment_reference=payment_reference,
            notes=notes
        )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Water bill payment recorded successfully',
            'water_bill': water_bill.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error marking water bill payment: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to record payment: {str(e)}'}), 500

@rent_deposit_bp.route('/water-bill/send-notifications', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def send_water_bill_notifications():
    """Send notifications for unpaid water bills (5th day and overdue)"""
    try:
        data = request.get_json()
        notification_type = data.get('type', '5th')  # '5th' or 'overdue'
        
        now = datetime.now(timezone.utc)
        notifications_sent = []
        
        if notification_type == '5th':
            # Send 5th day notifications
            water_bills = WaterBill.query.filter(
                and_(
                    WaterBill.status != WaterBillStatus.PAID,
                    WaterBill.notification_sent_5th == False,
                    WaterBill.month == now.month,
                    WaterBill.year == now.year
                )
            ).all()
            
            for bill in water_bills:
                if bill.should_send_5th_notification():
                    # Create notification
                    notification = Notification(
                        user_id=bill.tenant_id,
                        title="Water Bill Due",
                        message=f"Your water bill for {bill.month}/{bill.year} is KES {bill.amount_due:,.2f}. Due date: {bill.due_date.strftime('%B %d, %Y')}. Please pay on time.",
                        type="water_bill_due",
                        is_read=False
                    )
                    db.session.add(notification)
                    bill.mark_notification_sent('5th')
                    notifications_sent.append({
                        'tenant_id': bill.tenant_id,
                        'tenant_name': bill.tenant.full_name,
                        'amount': float(bill.amount_due),
                        'due_date': bill.due_date.isoformat()
                    })
        
        elif notification_type == 'overdue':
            # Send overdue notifications
            water_bills = WaterBill.query.filter(
                and_(
                    WaterBill.status == WaterBillStatus.OVERDUE,
                    WaterBill.notification_sent_overdue == False
                )
            ).all()
            
            for bill in water_bills:
                if bill.should_send_overdue_notification():
                    # Create notification
                    notification = Notification(
                        user_id=bill.tenant_id,
                        title="Water Bill Overdue",
                        message=f"Your water bill of KES {bill.balance:,.2f} for {bill.month}/{bill.year} is overdue. Immediate payment required to avoid service interruption.",
                        type="water_bill_overdue",
                        is_read=False
                    )
                    db.session.add(notification)
                    bill.mark_notification_sent('overdue')
                    notifications_sent.append({
                        'tenant_id': bill.tenant_id,
                        'tenant_name': bill.tenant.full_name,
                        'balance': float(bill.balance),
                        'days_overdue': (now - bill.due_date).days
                    })
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Sent {len(notifications_sent)} water bill notifications',
            'notifications_sent': notifications_sent
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error sending water bill notifications: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to send notifications: {str(e)}'}), 500

@rent_deposit_bp.route('/water-bill/summary', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_water_bill_summary():
    """Get water bill summary for a specific month"""
    try:
        month = request.args.get('month', datetime.now().month, type=int)
        year = request.args.get('year', datetime.now().year, type=int)
        
        water_bills = WaterBill.query.filter_by(month=month, year=year).all()
        
        total_bills = len(water_bills)
        total_amount_due = sum(float(bill.amount_due) for bill in water_bills)
        total_amount_paid = sum(float(bill.amount_paid) for bill in water_bills)
        total_balance = sum(float(bill.balance) for bill in water_bills)
        
        status_counts = {
            'unpaid': len([b for b in water_bills if b.status == WaterBillStatus.UNPAID]),
            'partially_paid': len([b for b in water_bills if b.status == WaterBillStatus.PARTIALLY_PAID]),
            'paid': len([b for b in water_bills if b.status == WaterBillStatus.PAID]),
            'overdue': len([b for b in water_bills if b.status == WaterBillStatus.OVERDUE])
        }
        
        return jsonify({
            'success': True,
            'summary': {
                'month': month,
                'year': year,
                'total_bills': total_bills,
                'total_amount_due': total_amount_due,
                'total_amount_paid': total_amount_paid,
                'total_balance': total_balance,
                'status_counts': status_counts,
                'collection_rate': (total_amount_paid / total_amount_due * 100) if total_amount_due > 0 else 0
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting water bill summary: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to get summary: {str(e)}'}), 500


# Deposit Management Routes for Caretakers
@rent_deposit_bp.route('/deposit/tenants-with-deposits', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_tenants_for_deposits():
    """Get all tenants with their deposit status for management"""
    try:
        # Get all tenants with active leases
        active_leases = Lease.query.filter_by(status='active').all()
        
        tenants_data = []
        for lease in active_leases:
            # Get or create deposit record for this tenant
            deposit_record = DepositRecord.query.filter_by(lease_id=lease.id).first()
            
            if not deposit_record:
                # Create deposit record if it doesn't exist
                deposit_record = DepositRecord.create_deposit_record(
                    tenant=lease.tenant,
                    property_obj=lease.property,
                    lease=lease,
                    amount_required=lease.deposit_amount
                )
                db.session.add(deposit_record)
                db.session.commit()
            
            tenants_data.append({
                'tenant_id': lease.tenant_id,
                'tenant_name': lease.tenant.full_name,
                'tenant_email': lease.tenant.email,
                'property_id': lease.property_id,
                'property_name': lease.property.name,
                'lease_id': lease.id,
                'deposit_record': deposit_record.to_dict()
            })
        
        return jsonify({
            'success': True,
            'tenants': tenants_data,
            'total_tenants': len(tenants_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching tenants for deposits: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch tenants: {str(e)}'}), 500

@rent_deposit_bp.route('/deposit/mark-payment', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def mark_deposit_payment():
    """Mark deposit payment for a tenant"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        deposit_id = data.get('deposit_id')
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        send_notification = data.get('send_notification', True)
        
        if not deposit_id or amount_paid is None:
            return jsonify({'success': False, 'error': 'Deposit ID and amount paid are required'}), 400
        
        deposit_record = DepositRecord.query.get(deposit_id)
        if not deposit_record:
            return jsonify({'success': False, 'error': 'Deposit record not found'}), 404
        
        # Record payment
        deposit_record.mark_payment(
            amount_paid=amount_paid,
            caretaker_id=current_user.id,
            payment_method=payment_method,
            payment_reference=payment_reference,
            notes=notes
        )
        
        # Send notification to tenant if requested and payment is complete
        if send_notification and deposit_record.status == DepositStatus.PAID:
            notification = Notification(
                user_id=deposit_record.tenant_id,
                title="Deposit Payment Confirmed",
                message=f"Your deposit payment of KES {amount_paid:,.2f} has been confirmed. Your deposit status is now PAID.",
                type="deposit_payment",
                is_read=False
            )
            db.session.add(notification)
            deposit_record.mark_payment_notification_sent()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deposit payment recorded successfully',
            'deposit_record': deposit_record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error marking deposit payment: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to record payment: {str(e)}'}), 500

@rent_deposit_bp.route('/deposit/update-status', methods=['POST'])
@token_required
@role_required(['admin', 'caretaker'])
def update_deposit_status():
    """Update deposit status (mark as paid/unpaid)"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        deposit_id = data.get('deposit_id')
        status = data.get('status')  # 'paid' or 'unpaid'
        amount_paid = data.get('amount_paid')
        payment_method = data.get('payment_method')
        payment_reference = data.get('payment_reference')
        notes = data.get('notes')
        send_notification = data.get('send_notification', True)
        
        if not deposit_id or not status:
            return jsonify({'success': False, 'error': 'Deposit ID and status are required'}), 400
        
        if status not in ['paid', 'unpaid']:
            return jsonify({'success': False, 'error': 'Status must be "paid" or "unpaid"'}), 400
        
        deposit_record = DepositRecord.query.get(deposit_id)
        if not deposit_record:
            return jsonify({'success': False, 'error': 'Deposit record not found'}), 404
        
        if status == 'paid':
            # Mark as paid
            if amount_paid is None:
                amount_paid = deposit_record.amount_required
            
            deposit_record.mark_payment(
                amount_paid=amount_paid,
                caretaker_id=current_user.id,
                payment_method=payment_method,
                payment_reference=payment_reference,
                notes=notes
            )
            
            # Send notification
            if send_notification:
                notification = Notification(
                    user_id=deposit_record.tenant_id,
                    title="Deposit Payment Confirmed",
                    message=f"Your deposit payment of KES {amount_paid:,.2f} has been confirmed. Your deposit status is now PAID.",
                    type="deposit_payment",
                    is_read=False
                )
                db.session.add(notification)
                deposit_record.mark_payment_notification_sent()
        
        elif status == 'unpaid':
            # Mark as unpaid
            deposit_record.amount_paid = 0.0
            deposit_record.paid_by_caretaker_id = None
            deposit_record.payment_date = None
            deposit_record.payment_method = None
            deposit_record.payment_reference = None
            deposit_record.notes = notes
            deposit_record.calculate_balance()
            
            # Send notification
            if send_notification:
                notification = Notification(
                    user_id=deposit_record.tenant_id,
                    title="Deposit Status Updated",
                    message="Your deposit status has been updated to UNPAID. Please contact the caretaker for more information.",
                    type="deposit_status",
                    is_read=False
                )
                db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Deposit status updated to {status.upper()} successfully',
            'deposit_record': deposit_record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating deposit status: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to update status: {str(e)}'}), 500

@rent_deposit_bp.route('/deposit/summary', methods=['GET'])
@token_required
@role_required(['admin', 'caretaker'])
def get_deposit_summary():
    """Get deposit summary statistics"""
    try:
        # Get all deposit records
        deposit_records = DepositRecord.query.all()
        
        total_deposits = len(deposit_records)
        total_amount_required = sum(float(record.amount_required) for record in deposit_records)
        total_amount_paid = sum(float(record.amount_paid) for record in deposit_records)
        total_balance = sum(float(record.balance) for record in deposit_records)
        
        status_counts = {
            'unpaid': len([r for r in deposit_records if r.status == DepositStatus.UNPAID]),
            'paid': len([r for r in deposit_records if r.status == DepositStatus.PAID]),
            'refunded': len([r for r in deposit_records if r.status == DepositStatus.REFUNDED]),
            'partially_refunded': len([r for r in deposit_records if r.status == DepositStatus.PARTIALLY_REFUNDED])
        }
        
        # Property breakdown
        property_breakdown = {}
        for record in deposit_records:
            prop_name = record.property.name if record.property else 'Unknown'
            if prop_name not in property_breakdown:
                property_breakdown[prop_name] = {
                    'total_deposits': 0,
                    'total_required': 0,
                    'total_paid': 0,
                    'total_balance': 0,
                    'status_counts': {'unpaid': 0, 'paid': 0, 'refunded': 0, 'partially_refunded': 0}
                }
            property_breakdown[prop_name]['total_deposits'] += 1
            property_breakdown[prop_name]['total_required'] += float(record.amount_required)
            property_breakdown[prop_name]['total_paid'] += float(record.amount_paid)
            property_breakdown[prop_name]['total_balance'] += float(record.balance)
            property_breakdown[prop_name]['status_counts'][record.status.value] += 1
        
        return jsonify({
            'success': True,
            'summary': {
                'total_deposits': total_deposits,
                'total_amount_required': total_amount_required,
                'total_amount_paid': total_amount_paid,
                'total_balance': total_balance,
                'collection_rate': (total_amount_paid / total_amount_required * 100) if total_amount_required > 0 else 0,
                'status_counts': status_counts,
                'property_breakdown': property_breakdown
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting deposit summary: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to get summary: {str(e)}'}), 500
