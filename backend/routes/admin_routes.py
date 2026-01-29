"""
Admin Routes Module

Handles admin-specific operations:
- Dashboard overview
- Tenant management (CRUD)
- Contract management
- Reports generation
- Vacate notices management
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, or_
import traceback

from models.base import db
from models.user import User
from models.lease import Lease
from models.payment import Payment
from models.maintenance import MaintenanceRequest
from models.property import Property
from models.vacate_notice import VacateNotice
from models.water_bill import WaterBill, WaterBillStatus
from models.rent_deposit import DepositRecord, DepositStatus
from routes.auth_routes import token_required
from utils.finance import calculate_outstanding_balance

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != "admin":
            return jsonify({
                "success": False,
                "error": "Forbidden: Admin access required"
            }), 403
        return f(*args, **kwargs)
    return decorated

@admin_bp.route("/vacate-notices", methods=["OPTIONS"])
@admin_bp.route("/dashboard-stats", methods=["OPTIONS"])
@admin_bp.route("/overview", methods=["OPTIONS"])
@admin_bp.route("/tenants", methods=["OPTIONS"])
@admin_bp.route("/tenant/<int:tenant_id>", methods=["OPTIONS"])
@admin_bp.route("/tenant/create", methods=["OPTIONS"])
@admin_bp.route("/tenant/update/<int:tenant_id>", methods=["OPTIONS"])
@admin_bp.route("/tenant/delete/<int:tenant_id>", methods=["OPTIONS"])
@admin_bp.route("/contracts", methods=["OPTIONS"])
@admin_bp.route("/payments/report", methods=["OPTIONS"])
@admin_bp.route("/occupancy/report", methods=["OPTIONS"])
@admin_bp.route("/properties", methods=["OPTIONS"])
@admin_bp.route("/maintenance", methods=["OPTIONS"])
@admin_bp.route("/financial-summary", methods=["OPTIONS"])
def handle_admin_options(tenant_id=None):
    """Handle CORS preflight for all admin endpoints"""
    return '', 200

@admin_bp.route("/<path:path>", methods=["OPTIONS"])
def handle_all_admin_options(path):
    """Catch-all OPTIONS handler for all admin routes"""
    return '', 200


@admin_bp.route("/dashboard-stats", methods=["GET"])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics for admin"""
    try:
        total_properties = Property.query.count()
        vacant_properties = Property.query.filter_by(status='vacant').count()
        reserved_properties = Property.query.filter_by(status='reserved').count()
        occupied_properties = Property.query.filter_by(status='occupied').count()
        
        total_tenants = User.query.filter_by(role='tenant').count()
        active_tenants = User.query.filter_by(role='tenant', is_active=True).count()
        
        total_payments = Payment.query.count()
        total_payments_amount = db.session.query(func.sum(Payment.amount)).filter_by(status='completed').scalar() or 0
        pending_payments = Payment.query.filter_by(status='pending').count()
        
        pending_maintenance = MaintenanceRequest.query.filter_by(status='pending').count()
        
        pending_vacate_notices = VacateNotice.query.filter_by(status='pending').count()
        approved_vacate_notices = VacateNotice.query.filter_by(status='approved').count()
        
        recent_payments = Payment.query\
            .join(Lease, Payment.lease_id == Lease.id)\
            .join(User, Lease.tenant_id == User.id)\
            .join(Property, Lease.property_id == Property.id)\
            .order_by(Payment.created_at.desc())\
            .limit(5)\
            .all()
        
        recent_payments_data = []
        for payment in recent_payments:
            recent_payments_data.append({
                'id': payment.id,
                'tenant_name': f"{payment.lease.tenant.first_name} {payment.lease.tenant.last_name}" if payment.lease and payment.lease.tenant else "Unknown",
                'property_name': payment.lease.property.name if payment.lease and payment.lease.property else "Unknown",
                'amount': float(payment.amount) if payment.amount else 0,
                'status': payment.status,
                'payment_date': payment.created_at.date().isoformat() if payment.created_at else None,
                'created_at': payment.created_at.isoformat() if payment.created_at else None
            })
        
        recent_notices = VacateNotice.query\
            .join(Lease, VacateNotice.lease_id == Lease.id)\
            .join(User, Lease.tenant_id == User.id)\
            .join(Property, Lease.property_id == Property.id)\
            .order_by(VacateNotice.created_at.desc())\
            .limit(5)\
            .all()
        
        recent_notices_data = []
        for notice in recent_notices:
            lease = notice.lease
            tenant = lease.tenant if lease else None
            property_ = lease.property if lease else None
            
            recent_notices_data.append({
                'id': notice.id,
                'tenant_name': f"{tenant.first_name} {tenant.last_name}" if tenant else "Unknown",
                'property_name': property_.name if property_ else "Unknown",
                'status': notice.status,
                'vacate_date': notice.vacate_date.isoformat() if notice.vacate_date else None,
                'created_at': notice.created_at.isoformat() if notice.created_at else None
            })
        
        return jsonify({
            'success': True,
            'stats': {
                'properties': {
                    'total': total_properties,
                    'vacant': vacant_properties,
                    'reserved': reserved_properties,
                    'occupied': occupied_properties,
                    'occupancy_rate': round((occupied_properties / total_properties * 100), 2) if total_properties > 0 else 0
                },
                'tenants': {
                    'total': total_tenants,
                    'active': active_tenants,
                    'inactive': total_tenants - active_tenants
                },
                'payments': {
                    'total_count': total_payments,
                    'total_amount': float(total_payments_amount),
                    'pending': pending_payments
                },
                'maintenance': {
                    'pending': pending_maintenance
                },
                'vacate_notices': {
                    'pending': pending_vacate_notices,
                    'approved': approved_vacate_notices
                }
            },
            'recent_payments': recent_payments_data,
            'recent_vacate_notices': recent_notices_data
        }), 200
        
    except Exception as e:
        print(f"Error in get_dashboard_stats: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Server Error',
            'message': 'Failed to fetch dashboard statistics'
        }), 500

@admin_bp.route("/overview", methods=["GET"])
@admin_required
def get_admin_overview():
    """Get admin dashboard overview with key statistics."""
    try:
        total_tenants = User.query.filter_by(role='tenant').count()
        
        active_leases = Lease.query.filter_by(status='active').count()
        
        pending_maintenance = MaintenanceRequest.query.filter_by(status='pending').count()
        
        total_revenue = db.session.query(func.sum(Payment.amount))\
            .filter_by(status='completed').scalar() or 0
        
        recent_tenants = User.query.filter_by(role='tenant')\
            .order_by(User.created_at.desc()).limit(5).all()
        
        recent_tenants_list = []
        for tenant in recent_tenants:
            recent_tenants_list.append({
                "id": tenant.id,
                "name": tenant.full_name,
                "email": tenant.email,
                "phone": tenant.phone_number,
                "room_number": tenant.room_number,
                "created_at": tenant.created_at.isoformat() if tenant.created_at else None
            })
        
        return jsonify({
            "success": True,
            "overview": {
                "total_tenants": total_tenants,
                "active_leases": active_leases,
                "pending_maintenance": pending_maintenance,
                "total_revenue": float(total_revenue),
                "recent_tenants": recent_tenants_list
            }
        }), 200

    except Exception as e:
        print(f"Error in get_admin_overview: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Overview error",
            "message": str(e)
        }), 500

@admin_bp.route("/financial-summary", methods=["GET"])
@admin_required
def get_financial_summary():
    """Get financial summary for admin dashboard."""
    try:
        today = datetime.now(timezone.utc).date()
        first_day_of_month = today.replace(day=1)
        last_day_of_month = (first_day_of_month.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        
        monthly_payments = db.session.query(func.sum(Payment.amount))\
            .filter(
                Payment.created_at >= first_day_of_month,
                Payment.created_at <= last_day_of_month,
                Payment.status == 'completed'
            ).scalar() or 0
        
        active_leases = Lease.query.filter_by(status='active').all()
        total_monthly_rent = sum([float(lease.rent_amount or 0) for lease in active_leases])
        
        outstanding_rent = max(0, total_monthly_rent - float(monthly_payments))
        
        deposit_payments = db.session.query(func.sum(Payment.amount))\
            .filter(
                Payment.payment_type == 'deposit',
                Payment.status == 'completed'
            ).scalar() or 0
        
        return jsonify({
            "success": True,
            "financial_summary": {
                "this_month": float(monthly_payments),
                "total_monthly_rent": float(total_monthly_rent),
                "outstanding_rent": float(outstanding_rent),
                "deposits_collected": float(deposit_payments)
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_financial_summary: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Server Error",
            "message": str(e)
        }), 500


@admin_bp.route("/tenants", methods=["GET"])
@admin_required
def get_all_tenants():
    """Get list of all tenants with pagination."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        tenants_query = User.query.filter_by(role='tenant')
        
        pagination = tenants_query.paginate(page=page, per_page=per_page, error_out=False)
        
        tenants_list = []
        for tenant in pagination.items:
            current_lease = Lease.query.filter_by(
                tenant_id=tenant.id, 
                status='active'
            ).first()
            
            tenants_list.append({
                "id": tenant.id,
                "name": tenant.full_name,
                "email": tenant.email,
                "phone": tenant.phone_number,
                "room_number": tenant.room_number,
                "national_id": tenant.national_id,
                "is_active": tenant.is_active,
                "property": current_lease.property.name if current_lease and current_lease.property else None,
                "rent_amount": float(current_lease.rent_amount) if current_lease and current_lease.rent_amount else 0,
                "outstanding_balance": calculate_outstanding_balance(current_lease),
                "created_at": tenant.created_at.isoformat() if tenant.created_at else None
            })
        
        return jsonify({
            "success": True,
            "tenants": tenants_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200

    except Exception as e:
        print(f"Error in get_all_tenants: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to get tenants",
            "message": str(e)
        }), 500

@admin_bp.route("/tenant/<int:tenant_id>", methods=["GET"])
@admin_required
def get_tenant_details(tenant_id):
    """Get details for a specific tenant."""
    try:
        tenant = User.query.filter_by(id=tenant_id, role='tenant').first()
        
        if not tenant:
            return jsonify({"success": False, "error": "Tenant not found"}), 404
        
        lease = Lease.query.filter_by(tenant_id=tenant_id, status='active').first()
        
        payments = []
        if lease:
            payments = Payment.query.filter_by(lease_id=lease.id)\
                .order_by(Payment.created_at.desc()).limit(10).all()
        
        payments_list = []
        for payment in payments:
            payments_list.append({
                'id': payment.id,
                'amount': float(payment.amount) if payment.amount else 0,
                'status': payment.status,
                'payment_type': payment.payment_method,
                'created_at': payment.created_at.isoformat() if payment.created_at else None
            })
        
        maintenance = MaintenanceRequest.query.filter_by(reported_by_id=tenant_id)\
            .order_by(MaintenanceRequest.created_at.desc()).limit(10).all()
        
        maintenance_list = []
        for req in maintenance:
            property_ = db.session.get(Property, req.property_id)
            maintenance_list.append({
                'id': req.id,
                'title': req.title,
                'description': req.description,
                'status': req.status,
                'priority': req.priority,
                'property_name': property_.name if property_ else "Unknown",
                'created_at': req.created_at.isoformat() if req.created_at else None,
                'resolved_at': req.resolved_at.isoformat() if hasattr(req, 'resolved_at') and req.resolved_at else None
            })
        
        vacate_notices = []
        if lease:
            vacate_notices = VacateNotice.query.filter_by(lease_id=lease.id)\
                .order_by(VacateNotice.created_at.desc()).limit(5).all()
        
        notices_list = []
        for notice in vacate_notices:
            lease_obj = notice.lease if hasattr(notice, 'lease') else db.session.get(Lease, notice.lease_id)
            property_ = lease_obj.property if lease_obj else None
            
            notices_list.append({
                'id': notice.id,
                'reason': notice.reason,
                'vacate_date': notice.vacate_date.isoformat() if notice.vacate_date else None,
                'status': notice.status,
                'property_name': property_.name if property_ else "Unknown",
                'created_at': notice.created_at.isoformat() if notice.created_at else None
            })
        
        return jsonify({
            "success": True,
            "tenant": {
                "id": tenant.id,
                "name": tenant.full_name,
                "email": tenant.email,
                "phone": tenant.phone_number,
                "room_number": tenant.room_number,
                "national_id": tenant.national_id,
                "outstanding_balance": calculate_outstanding_balance(lease),
                "is_active": tenant.is_active,
                "created_at": tenant.created_at.isoformat() if tenant.created_at else None,
                "lease": {
                    'id': lease.id if lease else None,
                    'property_name': lease.property.name if lease and lease.property else None,
                    'start_date': lease.start_date.isoformat() if lease and lease.start_date else None,
                    'end_date': lease.end_date.isoformat() if lease and lease.end_date else None,
                    'rent_amount': float(lease.rent_amount) if lease and lease.rent_amount else 0,
                    'status': lease.status if lease else None,
                    'signed_by_tenant': lease.signed_by_tenant if lease and hasattr(lease, 'signed_by_tenant') else False,
                    'signed_at': lease.signed_at.isoformat() if lease and hasattr(lease, 'signed_at') and lease.signed_at else None
                } if lease else None,
                "recent_payments": payments_list,
                "recent_maintenance": maintenance_list,
                "vacate_notices": notices_list,
                "photo_path": tenant.photo_path,
                "id_document_path": tenant.id_document_path
            }
        }), 200

    except Exception as e:
        print(f"Error in get_tenant_details: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to get tenant details",
            "message": str(e)
        }), 500

@admin_bp.route("/tenant/create", methods=["POST"])
@admin_required
def create_tenant():
    """Create a new tenant (admin-initiated)."""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'full_name', 'phone', 'national_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False, 
                    "error": f"{field} is required"
                }), 400
        
        if len(str(data['national_id'])) > 9:
            return jsonify({
                "success": False, 
                "error": "National ID cannot exceed 9 digits"
            }), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                "success": False, 
                "error": "Email already exists"
            }), 409
        
        names = data['full_name'].split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ""
        
        import uuid
        username = f"{data['email'].split('@')[0]}_{str(uuid.uuid4())[:8]}"
        
        new_tenant = User(
            email=data['email'],
            username=username,
            first_name=first_name,
            last_name=last_name,
            phone_number=data['phone'],
            role='tenant',
            national_id=int(data['national_id']),
            room_number=data.get('room_number'),
            is_active=True
        )
        new_tenant.password = data['password']
        
        db.session.add(new_tenant)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Tenant created successfully",
            "tenant": {
                "id": new_tenant.id,
                "name": new_tenant.full_name,
                "email": new_tenant.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error in create_tenant: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to create tenant",
            "message": str(e)
        }), 500

@admin_bp.route("/tenant/update/<int:tenant_id>", methods=["PUT"])
@admin_required
def update_tenant(tenant_id):
    """Update an existing tenant."""
    try:
        tenant = User.query.filter_by(id=tenant_id, role='tenant').first()
        
        if not tenant:
            return jsonify({"success": False, "error": "Tenant not found"}), 404
        
        data = request.get_json()
        
        if 'full_name' in data:
            names = data['full_name'].split(' ', 1)
            tenant.first_name = names[0]
            tenant.last_name = names[1] if len(names) > 1 else ""
        
        if 'phone' in data:
            tenant.phone_number = data['phone']
        
        if 'room_number' in data:
            tenant.room_number = data['room_number']
        
        if 'is_active' in data:
            tenant.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Tenant updated successfully",
            "tenant": {
                "id": tenant.id,
                "name": tenant.full_name,
                "email": tenant.email,
                "phone": tenant.phone_number,
                "room_number": tenant.room_number,
                "is_active": tenant.is_active
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in update_tenant: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to update tenant",
            "message": str(e)
        }), 500

@admin_bp.route("/tenant/delete/<int:tenant_id>", methods=["DELETE"])
@admin_required
def delete_tenant(tenant_id):
    """Delete a tenant."""
    try:
        tenant = User.query.filter_by(id=tenant_id, role='tenant').first()
        
        if not tenant:
            return jsonify({"success": False, "error": "Tenant not found"}), 404
        
        active_lease = Lease.query.filter_by(tenant_id=tenant_id, status='active').first()
        if active_lease:
            try:
                active_lease.status = 'terminated'
                active_lease.end_date = datetime.now(timezone.utc).date()
                
                if active_lease.property_id:
                    prop = db.session.get(Property, active_lease.property_id)
                    if prop:
                        prop.status = 'vacant'
                
                db.session.add(active_lease)
                if active_lease.property_id and prop:
                    db.session.add(prop)
                    
            except Exception as e:
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "error": f"Failed to terminate lease: {str(e)}"
                }), 500
        
        db.session.delete(tenant)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Tenant deleted successfully (Lease terminated, Room vacated)"
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_tenant: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to delete tenant",
            "message": str(e)
        }), 500


@admin_bp.route("/contracts", methods=["GET"])
@admin_required
def get_all_contracts():
    """Get all lease contracts with filtering."""
    try:
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Lease.query
        
        if status:
            query = query.filter_by(status=status)
        
        pagination = query.order_by(Lease.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        contracts = []
        for lease in pagination.items:
            contracts.append({
                "id": lease.id,
                "tenant_name": lease.tenant.full_name if lease.tenant else "Unknown",
                "property_name": lease.property.name if lease.property else "Unknown",
                "start_date": lease.start_date.isoformat() if lease.start_date else None,
                "end_date": lease.end_date.isoformat() if lease.end_date else None,
                "rent_amount": float(lease.rent_amount) if lease.rent_amount else 0,
                "status": lease.status,
                "created_at": lease.created_at.isoformat() if lease.created_at else None
            })
        
        return jsonify({
            "success": True,
            "contracts": contracts,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200

    except Exception as e:
        print(f"Error in get_all_contracts: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to get contracts",
            "message": str(e)
        }), 500


@admin_bp.route("/properties", methods=["GET"])
@admin_required
def get_all_properties():
    """Get all properties with filtering."""
    try:
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Property.query
        
        if status:
            query = query.filter_by(status=status)
        
        pagination = query.order_by(Property.name.asc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        properties = []
        for prop in pagination.items:
            current_tenant = None
            current_lease = None
            
            if prop.current_tenant_id:
                tenant = db.session.get(User, prop.current_tenant_id)
                if tenant:
                    current_tenant = {
                        'id': tenant.id,
                        'name': tenant.full_name,
                        'email': tenant.email,
                        'phone': tenant.phone_number
                    }
                    
                    lease = Lease.query.filter_by(
                        property_id=prop.id,
                        tenant_id=tenant.id,
                        status='active'
                    ).first()
                    
                    if lease:
                        current_lease = {
                            'id': lease.id,
                            'start_date': lease.start_date.isoformat() if lease.start_date else None,
                            'end_date': lease.end_date.isoformat() if lease.end_date else None,
                            'rent_amount': float(lease.rent_amount) if lease.rent_amount else 0
                        }
            
            properties.append({
                "id": prop.id,
                "name": prop.name,
                "type": prop.property_type,
                "rent_amount": float(prop.rent_amount) if prop.rent_amount else 0,
                "deposit_amount": float(prop.deposit_amount) if prop.deposit_amount else 0,
                "status": prop.status,
                "description": prop.description,
                "current_tenant": current_tenant,
                "current_lease": current_lease,
                "created_at": prop.created_at.isoformat() if prop.created_at else None,
                "images": [{"url": img.image_url, "primary": img.is_primary} for img in prop.images]
            })
        
        return jsonify({
            "success": True,
            "properties": properties,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200

    except Exception as e:
        print(f"Error in get_all_properties: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to get properties",
            "message": str(e)
        }), 500


@admin_bp.route("/maintenance", methods=["GET"])
@admin_required
def get_all_maintenance():
    """Get all maintenance requests with filtering."""
    try:
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = MaintenanceRequest.query
        
        if status:
            query = query.filter_by(status=status)
        
        pagination = query.order_by(MaintenanceRequest.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        maintenance_requests = []
        for req in pagination.items:
            reporter = db.session.get(User, req.reported_by_id)
            property_ = db.session.get(Property, req.property_id)
            
            maintenance_requests.append({
                "id": req.id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "priority": req.priority,
                "reporter": {
                    "id": reporter.id if reporter else None,
                    "name": reporter.full_name if reporter else "Unknown",
                    "email": reporter.email if reporter else None
                },
                "property": {
                    "id": property_.id if property_ else None,
                    "name": property_.name if property_ else "Unknown"
                },
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "resolved_at": req.resolved_at.isoformat() if hasattr(req, 'resolved_at') and req.resolved_at else None
            })
        
        return jsonify({
            "success": True,
            "maintenance_requests": maintenance_requests,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200

    except Exception as e:
        print(f"Error in get_all_maintenance: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to get maintenance requests",
            "message": str(e)
        }), 500


@admin_bp.route("/payments/report", methods=["GET"])
@admin_required
def get_payment_report():
    """Generate payment report."""
    try:
        total_payments = Payment.query.count()
        successful_payments = Payment.query.filter(Payment.status.in_(['paid', 'completed'])).count()
        pending_payments = Payment.query.filter(Payment.status.in_(['pending', 'unpaid'])).count()
        failed_payments = Payment.query.filter_by(status='failed').count()
        
        total_amount = db.session.query(func.sum(Payment.amount))\
            .filter(Payment.status.in_(['paid', 'completed'])).scalar() or 0
        
        recent = Payment.query\
            .join(Lease, Payment.lease_id == Lease.id)\
            .join(User, Lease.tenant_id == User.id)\
            .join(Property, Lease.property_id == Property.id)\
            .order_by(Payment.created_at.desc())\
            .limit(20)\
            .all()
        
        recent_payments = []
        for payment in recent:
            recent_payments.append({
                'id': payment.id,
                'tenant_name': f"{payment.lease.tenant.first_name} {payment.lease.tenant.last_name}" if payment.lease and payment.lease.tenant else "Unknown",
                'property_name': payment.lease.property.name if payment.lease and payment.lease.property else "Unknown",
                'amount': float(payment.amount) if payment.amount else 0,
                'status': payment.status,
                'payment_type': payment.payment_method,
                'payment_date': payment.created_at.date().isoformat() if payment.created_at else None,
                'created_at': payment.created_at.isoformat() if payment.created_at else None
            })
        
        monthly_data = []
        for i in range(5, -1, -1):
            month_start = datetime.now(timezone.utc).replace(day=1) - timedelta(days=30*i)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            month_total = db.session.query(func.sum(Payment.amount))\
                .filter(
                    Payment.created_at >= month_start,
                    Payment.created_at <= month_end,
                    Payment.status.in_(['paid', 'completed'])
                ).scalar() or 0
            
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'total': float(month_total)
            })
        
        return jsonify({
            "success": True,
            "report": {
                "total_payments": total_payments,
                "successful": successful_payments,
                "pending": pending_payments,
                "failed": failed_payments,
                "total_amount": float(total_amount),
                "recent_payments": recent_payments,
                "monthly_breakdown": monthly_data
            }
        }), 200

    except Exception as e:
        print(f"Error in get_payment_report: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to generate report",
            "message": str(e)
        }), 500

@admin_bp.route("/occupancy/report", methods=["GET"])
@admin_required
def get_occupancy_report():
    """Generate occupancy report."""
    try:
        total_properties = Property.query.count()
        active_leases = Lease.query.filter_by(status='active').count()
        occupied_properties = active_leases
        vacant_properties = total_properties - occupied_properties
        
        occupancy_rate = (occupied_properties / total_properties * 100) if total_properties > 0 else 0
        
        bedsitter_occupied = Property.query.filter_by(
            property_type='bedsitter',
            status='occupied'
        ).count()
        
        bedsitter_vacant = Property.query.filter_by(
            property_type='bedsitter',
            status='vacant'
        ).count()
        
        one_bedroom_occupied = Property.query.filter_by(
            property_type='one_bedroom',
            status='occupied'
        ).count()
        
        one_bedroom_vacant = Property.query.filter_by(
            property_type='one_bedroom',
            status='vacant'
        ).count()
        
        return jsonify({
            "success": True,
            "report": {
                "total_properties": total_properties,
                "occupied": occupied_properties,
                "reserved": Property.query.filter_by(status='reserved').count(),
                "vacant": vacant_properties,
                "active_leases": active_leases,
                "occupancy_rate": round(occupancy_rate, 2),
                "by_type": {
                    "bedsitter": {
                        "occupied": bedsitter_occupied,
                        "vacant": bedsitter_vacant,
                        "total": bedsitter_occupied + bedsitter_vacant
                    },
                    "one_bedroom": {
                        "occupied": one_bedroom_occupied,
                        "vacant": one_bedroom_vacant,
                        "total": one_bedroom_occupied + one_bedroom_vacant
                    }
                }
            }
        }), 200

    except Exception as e:
        print(f"Error in get_occupancy_report: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": "Failed to generate report",
            "message": str(e)
        }), 500


@admin_bp.route("/vacate-notices", methods=["GET"])
@admin_required
def get_vacate_notices():
    """Get all vacate notices with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)
        status = request.args.get('status', 'all')
        
        query = VacateNotice.query
        
        if status and status != 'all':
            query = query.filter(VacateNotice.status == status)
        
        query = query.order_by(VacateNotice.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        notices = []
        for notice in pagination.items:
            try:
                lease = notice.lease if hasattr(notice, 'lease') else db.session.get(Lease, notice.lease_id)
                
                if not lease:
                    continue
                
                tenant = lease.tenant if lease else None
                property_ = lease.property if lease else None
                
                notices.append({
                    'id': notice.id,
                    'tenant_id': tenant.id if tenant else None,
                    'tenant_name': tenant.full_name if tenant else 'Unknown',
                    'tenant_email': tenant.email if tenant else None,
                    'tenant_phone': tenant.phone_number if tenant else None,
                    'room_number': tenant.room_number if tenant else None,
                    'property_id': property_.id if property_ else None,
                    'property_name': property_.name if property_ else 'Unknown',
                    'property_type': property_.property_type if property_ else None,
                    'rent_amount': float(property_.rent_amount) if property_ and property_.rent_amount else 0,
                    'lease_id': lease.id if lease else None,
                    'reason': notice.reason,
                    'vacate_date': notice.vacate_date.isoformat() if notice.vacate_date else None,
                    'status': notice.status,
                    'admin_notes': notice.admin_notes,
                    'created_at': notice.created_at.isoformat() if notice.created_at else None,
                    'updated_at': notice.updated_at.isoformat() if notice.updated_at else None
                })
            except Exception as item_error:
                print(f"Error processing vacate notice {notice.id}: {str(item_error)}")
                continue
        
        return jsonify({
            'success': True,
            'notices': notices,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'current_page': pagination.page,
                'per_page': pagination.per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_vacate_notices: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Server Error',
            'message': str(e),
            'notices': []  # Return empty array to prevent frontend crash
        }), 500

@admin_bp.route("/vacate-notices/<int:notice_id>", methods=["PUT"])
@admin_required
def update_vacate_notice(notice_id):
    """Update vacate notice status"""
    try:
        data = request.get_json()
        status = data.get('status')
        admin_notes = data.get('admin_notes', '')
        
        if not status or status not in ['approved', 'rejected', 'pending', 'completed']:
            return jsonify({
                'success': False,
                'error': 'Invalid data',
                'message': 'Valid status required (approved/rejected/pending/completed)'
            }), 400
        
        notice = VacateNotice.session.get(notice_id)
        
        old_status = notice.status
        notice.status = status
        notice.admin_notes = admin_notes
        notice.updated_at = datetime.now(timezone.utc)
        
        if status == 'approved' and old_status != 'approved':
            lease = notice.lease if hasattr(notice, 'lease') else db.session.get(Lease, notice.lease_id)
            
            if lease:
                property_ = lease.property
                tenant = lease.tenant
                
                if property_:
                    property_.status = 'vacant'
                    property_.current_tenant_id = None
                
                lease.status = 'terminated'
                lease.end_date = datetime.now(timezone.utc).date()
                if hasattr(lease, 'termination_reason'):
                    lease.termination_reason = 'Tenant vacated'
                
                if tenant:
                    other_active_leases = Lease.query.filter(
                        Lease.tenant_id == tenant.id,
                        Lease.id != lease.id,
                        Lease.status == 'active'
                    ).count()
                    
                    if other_active_leases == 0:
                        tenant.is_active = False
                        tenant.room_number = None
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Vacate notice {status} successfully',
            'notice': {
                'id': notice.id,
                'status': notice.status,
                'admin_notes': notice.admin_notes,
                'updated_at': notice.updated_at.isoformat() if notice.updated_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_vacate_notice: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Server Error',
            'message': str(e)
        }), 500

@admin_bp.route("/vacate-notices/<int:notice_id>", methods=["DELETE"])
@admin_required
def delete_vacate_notice(notice_id):
    """Delete a vacate notice"""
    try:
        notice = VacateNotice.session.get(notice_id)
        
        db.session.delete(notice)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Vacate notice deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_vacate_notice: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Server Error',
            'message': str(e)
        }), 500


# Admin Water Bill Management Routes
@admin_bp.route('/water-bills', methods=['GET'])
@admin_required
def get_all_water_bills():
    """Get all water bills with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        status = request.args.get('status')
        tenant_id = request.args.get('tenant_id', type=int)
        property_id = request.args.get('property_id', type=int)
        
        query = WaterBill.query
        
        # Apply filters
        if month:
            query = query.filter(WaterBill.month == month)
        if year:
            query = query.filter(WaterBill.year == year)
        if status:
            query = query.filter(WaterBill.status == status)
        if tenant_id:
            query = query.filter(WaterBill.tenant_id == tenant_id)
        if property_id:
            query = query.filter(WaterBill.property_id == property_id)
        
        # Order by most recent
        query = query.order_by(WaterBill.year.desc(), WaterBill.month.desc(), WaterBill.created_at.desc())
        
        # Paginate
        water_bills = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'water_bills': [bill.to_dict() for bill in water_bills.items],
            'total': water_bills.total,
            'pages': water_bills.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching water bills: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch water bills: {str(e)}'}), 500

@admin_bp.route('/water-bills/<int:bill_id>', methods=['GET'])
@admin_required
def get_water_bill_details(bill_id):
    """Get detailed water bill information"""
    try:
        water_bill = WaterBill.query.get(bill_id)
        if not water_bill:
            return jsonify({'success': False, 'error': 'Water bill not found'}), 404
        
        return jsonify({
            'success': True,
            'water_bill': water_bill.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching water bill details: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch water bill: {str(e)}'}), 500

@admin_bp.route('/water-bills/<int:bill_id>', methods=['PUT'])
@admin_required
def update_water_bill(bill_id):
    """Update water bill details (admin only)"""
    try:
        water_bill = WaterBill.query.get(bill_id)
        if not water_bill:
            return jsonify({'success': False, 'error': 'Water bill not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'current_reading' in data:
            water_bill.current_reading = data['current_reading']
        if 'previous_reading' in data:
            water_bill.previous_reading = data['previous_reading']
        if 'unit_rate' in data:
            water_bill.unit_rate = data['unit_rate']
        if 'amount_due' in data:
            water_bill.amount_due = data['amount_due']
        if 'notes' in data:
            water_bill.notes = data['notes']
        
        # Recalculate if readings or rate changed
        if 'current_reading' in data or 'previous_reading' in data or 'unit_rate' in data:
            water_bill.calculate_amount()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Water bill updated successfully',
            'water_bill': water_bill.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating water bill: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to update water bill: {str(e)}'}), 500

@admin_bp.route('/water-bills/<int:bill_id>', methods=['DELETE'])
@admin_required
def delete_water_bill(bill_id):
    """Delete a water bill (admin only)"""
    try:
        water_bill = WaterBill.query.get(bill_id)
        if not water_bill:
            return jsonify({'success': False, 'error': 'Water bill not found'}), 404
        
        db.session.delete(water_bill)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Water bill deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting water bill: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to delete water bill: {str(e)}'}), 500

@admin_bp.route('/water-bills/summary', methods=['GET'])
@admin_required
def get_admin_water_bill_summary():
    """Get comprehensive water bill summary for admin dashboard"""
    try:
        month = request.args.get('month', datetime.now().month, type=int)
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Get water bills for the specified month
        water_bills = WaterBill.query.filter_by(month=month, year=year).all()
        
        # Calculate summary statistics
        total_bills = len(water_bills)
        total_amount_due = sum(float(bill.amount_due) for bill in water_bills)
        total_amount_paid = sum(float(bill.amount_paid) for bill in water_bills)
        total_balance = sum(float(bill.balance) for bill in water_bills)
        
        # Status breakdown
        status_counts = {
            'unpaid': len([b for b in water_bills if b.status == WaterBillStatus.UNPAID]),
            'partially_paid': len([b for b in water_bills if b.status == WaterBillStatus.PARTIALLY_PAID]),
            'paid': len([b for b in water_bills if b.status == WaterBillStatus.PAID]),
            'overdue': len([b for b in water_bills if b.status == WaterBillStatus.OVERDUE])
        }
        
        # Property breakdown
        property_breakdown = {}
        for bill in water_bills:
            prop_name = bill.property.name if bill.property else 'Unknown'
            if prop_name not in property_breakdown:
                property_breakdown[prop_name] = {
                    'total_bills': 0,
                    'total_due': 0,
                    'total_paid': 0,
                    'total_balance': 0
                }
            property_breakdown[prop_name]['total_bills'] += 1
            property_breakdown[prop_name]['total_due'] += float(bill.amount_due)
            property_breakdown[prop_name]['total_paid'] += float(bill.amount_paid)
            property_breakdown[prop_name]['total_balance'] += float(bill.balance)
        
        # Monthly trend (last 6 months)
        monthly_trend = []
        for i in range(6):
            trend_month = (month - i - 1) % 12 + 1
            trend_year = year if month - i - 1 > 0 else year - 1
            
            trend_bills = WaterBill.query.filter_by(month=trend_month, year=trend_year).all()
            monthly_trend.append({
                'month': trend_month,
                'year': trend_year,
                'total_bills': len(trend_bills),
                'total_amount': sum(float(bill.amount_due) for bill in trend_bills),
                'collected': sum(float(bill.amount_paid) for bill in trend_bills)
            })
        
        return jsonify({
            'success': True,
            'summary': {
                'month': month,
                'year': year,
                'total_bills': total_bills,
                'total_amount_due': total_amount_due,
                'total_amount_paid': total_amount_paid,
                'total_balance': total_balance,
                'collection_rate': (total_amount_paid / total_amount_due * 100) if total_amount_due > 0 else 0,
                'status_counts': status_counts,
                'property_breakdown': property_breakdown,
                'monthly_trend': monthly_trend[::-1]  # Reverse to show oldest to newest
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting admin water bill summary: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to get summary: {str(e)}'}), 500

@admin_bp.route('/water-bills/export', methods=['GET'])
@admin_required
def export_water_bills():
    """Export water bills to CSV format"""
    try:
        month = request.args.get('month', datetime.now().month, type=int)
        year = request.args.get('year', datetime.now().year, type=int)
        
        water_bills = WaterBill.query.filter_by(month=month, year=year).all()
        
        # Create CSV data
        csv_data = []
        csv_data.append(['Tenant Name', 'Property', 'Month', 'Year', 'Previous Reading', 'Current Reading', 'Units Consumed', 'Unit Rate', 'Amount Due', 'Amount Paid', 'Balance', 'Status', 'Due Date'])
        
        for bill in water_bills:
            csv_data.append([
                bill.tenant.full_name if bill.tenant else 'Unknown',
                bill.property.name if bill.property else 'Unknown',
                bill.month,
                bill.year,
                float(bill.previous_reading),
                float(bill.current_reading),
                float(bill.units_consumed),
                float(bill.unit_rate),
                float(bill.amount_due),
                float(bill.amount_paid),
                float(bill.balance),
                bill.status.value,
                bill.due_date.strftime('%Y-%m-%d') if bill.due_date else ''
            ])
        
        return jsonify({
            'success': True,
            'csv_data': csv_data,
            'filename': f'water_bills_{year}_{month}.csv'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error exporting water bills: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to export water bills: {str(e)}'}), 500


# Admin Deposit Management Routes
@admin_bp.route('/deposits', methods=['GET'])
@admin_required
def get_all_deposits():
    """Get all deposit records with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        tenant_id = request.args.get('tenant_id', type=int)
        property_id = request.args.get('property_id', type=int)
        
        query = DepositRecord.query
        
        # Apply filters
        if status:
            query = query.filter(DepositRecord.status == status)
        if tenant_id:
            query = query.filter(DepositRecord.tenant_id == tenant_id)
        if property_id:
            query = query.filter(DepositRecord.property_id == property_id)
        
        # Order by most recent
        query = query.order_by(DepositRecord.created_at.desc())
        
        # Paginate
        deposits = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'deposits': [deposit.to_dict() for deposit in deposits.items],
            'total': deposits.total,
            'pages': deposits.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching deposits: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch deposits: {str(e)}'}), 500

@admin_bp.route('/deposits/<int:deposit_id>', methods=['GET'])
@admin_required
def get_deposit_details(deposit_id):
    """Get detailed deposit information"""
    try:
        deposit = DepositRecord.query.get(deposit_id)
        if not deposit:
            return jsonify({'success': False, 'error': 'Deposit record not found'}), 404
        
        return jsonify({
            'success': True,
            'deposit': deposit.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching deposit details: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch deposit: {str(e)}'}), 500

@admin_bp.route('/deposits/<int:deposit_id>', methods=['PUT'])
@admin_required
def update_deposit(deposit_id):
    """Update deposit details (admin only)"""
    try:
        deposit = DepositRecord.query.get(deposit_id)
        if not deposit:
            return jsonify({'success': False, 'error': 'Deposit record not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'amount_required' in data:
            deposit.amount_required = data['amount_required']
        if 'amount_paid' in data:
            deposit.amount_paid = data['amount_paid']
        if 'payment_method' in data:
            deposit.payment_method = data['payment_method']
        if 'payment_reference' in data:
            deposit.payment_reference = data['payment_reference']
        if 'notes' in data:
            deposit.notes = data['notes']
        
        # Recalculate balance
        deposit.calculate_balance()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deposit updated successfully',
            'deposit': deposit.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating deposit: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to update deposit: {str(e)}'}), 500

@admin_bp.route('/deposits/<int:deposit_id>', methods=['DELETE'])
@admin_required
def delete_deposit(deposit_id):
    """Delete a deposit record (admin only)"""
    try:
        deposit = DepositRecord.query.get(deposit_id)
        if not deposit:
            return jsonify({'success': False, 'error': 'Deposit record not found'}), 404
        
        db.session.delete(deposit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deposit record deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting deposit: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to delete deposit: {str(e)}'}), 500

@admin_bp.route('/deposits/refund', methods=['POST'])
@admin_required
def process_deposit_refund():
    """Process deposit refund (admin only)"""
    current_user = db.session.get(User, request.user_id)
    try:
        data = request.get_json()
        deposit_id = data.get('deposit_id')
        refund_amount = data.get('refund_amount')
        refund_method = data.get('refund_method')
        refund_reference = data.get('refund_reference')
        refund_notes = data.get('refund_notes')
        send_notification = data.get('send_notification', True)
        
        if not deposit_id or refund_amount is None:
            return jsonify({'success': False, 'error': 'Deposit ID and refund amount are required'}), 400
        
        deposit = DepositRecord.query.get(deposit_id)
        if not deposit:
            return jsonify({'success': False, 'error': 'Deposit record not found'}), 404
        
        # Process refund
        deposit.mark_refund(
            refund_amount=refund_amount,
            admin_id=current_user.id,
            refund_method=refund_method,
            refund_reference=refund_reference,
            refund_notes=refund_notes
        )
        
        # Send notification to tenant
        if send_notification:
            notification = Notification(
                user_id=deposit.tenant_id,
                title="Deposit Refund Processed",
                message=f"Your deposit refund of KES {refund_amount:,.2f} has been processed. Refund method: {refund_method or 'Not specified'}.",
                type="deposit_refund",
                is_read=False
            )
            db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deposit refund processed successfully',
            'deposit': deposit.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error processing deposit refund: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to process refund: {str(e)}'}), 500

@admin_bp.route('/deposits/summary', methods=['GET'])
@admin_required
def get_admin_deposit_summary():
    """Get comprehensive deposit summary for admin dashboard"""
    try:
        # Get all deposit records
        deposits = DepositRecord.query.all()
        
        # Calculate summary statistics
        total_deposits = len(deposits)
        total_amount_required = sum(float(d.amount_required) for d in deposits)
        total_amount_paid = sum(float(d.amount_paid) for d in deposits)
        total_refunded = sum(float(d.refund_amount) for d in deposits)
        total_balance = sum(float(d.balance) for d in deposits)
        
        # Status breakdown
        status_counts = {
            'unpaid': len([d for d in deposits if d.status == DepositStatus.UNPAID]),
            'paid': len([d for d in deposits if d.status == DepositStatus.PAID]),
            'refunded': len([d for d in deposits if d.status == DepositStatus.REFUNDED]),
            'partially_refunded': len([d for d in deposits if d.status == DepositStatus.PARTIALLY_REFUNDED])
        }
        
        # Property breakdown
        property_breakdown = {}
        for deposit in deposits:
            prop_name = deposit.property.name if deposit.property else 'Unknown'
            if prop_name not in property_breakdown:
                property_breakdown[prop_name] = {
                    'total_deposits': 0,
                    'total_required': 0,
                    'total_paid': 0,
                    'total_refunded': 0,
                    'total_balance': 0,
                    'status_counts': {'unpaid': 0, 'paid': 0, 'refunded': 0, 'partially_refunded': 0}
                }
            property_breakdown[prop_name]['total_deposits'] += 1
            property_breakdown[prop_name]['total_required'] += float(deposit.amount_required)
            property_breakdown[prop_name]['total_paid'] += float(deposit.amount_paid)
            property_breakdown[prop_name]['total_refunded'] += float(deposit.refund_amount)
            property_breakdown[prop_name]['total_balance'] += float(deposit.balance)
            property_breakdown[prop_name]['status_counts'][deposit.status.value] += 1
        
        # Monthly trend (last 6 months)
        monthly_trend = []
        now = datetime.now(timezone.utc)
        for i in range(6):
            trend_month = (now.month - i - 1) % 12 + 1
            trend_year = now.year if now.month - i - 1 > 0 else now.year - 1
            
            month_deposits = [d for d in deposits 
                            if d.created_at and d.created_at.month == trend_month and d.created_at.year == trend_year]
            
            monthly_trend.append({
                'month': trend_month,
                'year': trend_year,
                'total_deposits': len(month_deposits),
                'total_amount': sum(float(d.amount_required) for d in month_deposits),
                'collected': sum(float(d.amount_paid) for d in month_deposits),
                'refunded': sum(float(d.refund_amount) for d in month_deposits)
            })
        
        return jsonify({
            'success': True,
            'summary': {
                'total_deposits': total_deposits,
                'total_amount_required': total_amount_required,
                'total_amount_paid': total_amount_paid,
                'total_refunded': total_refunded,
                'total_balance': total_balance,
                'collection_rate': (total_amount_paid / total_amount_required * 100) if total_amount_required > 0 else 0,
                'refund_rate': (total_refunded / total_amount_paid * 100) if total_amount_paid > 0 else 0,
                'status_counts': status_counts,
                'property_breakdown': property_breakdown,
                'monthly_trend': monthly_trend[::-1]  # Reverse to show oldest to newest
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting admin deposit summary: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to get summary: {str(e)}'}), 500

@admin_bp.route('/deposits/export', methods=['GET'])
@admin_required
def export_deposits():
    """Export deposits to CSV format"""
    try:
        status = request.args.get('status')
        
        query = DepositRecord.query
        if status:
            query = query.filter(DepositRecord.status == status)
        
        deposits = query.all()
        
        # Create CSV data
        csv_data = []
        csv_data.append(['Tenant Name', 'Property', 'Amount Required', 'Amount Paid', 'Balance', 'Status', 'Payment Date', 'Payment Method', 'Refund Amount', 'Refund Date', 'Created Date'])
        
        for deposit in deposits:
            csv_data.append([
                deposit.tenant.full_name if deposit.tenant else 'Unknown',
                deposit.property.name if deposit.property else 'Unknown',
                float(deposit.amount_required),
                float(deposit.amount_paid),
                float(deposit.balance),
                deposit.status.value,
                deposit.payment_date.strftime('%Y-%m-%d') if deposit.payment_date else '',
                deposit.payment_method or '',
                float(deposit.refund_amount),
                deposit.refund_date.strftime('%Y-%m-%d') if deposit.refund_date else '',
                deposit.created_at.strftime('%Y-%m-%d') if deposit.created_at else ''
            ])
        
        return jsonify({
            'success': True,
            'csv_data': csv_data,
            'filename': f'deposits_{status or "all"}_{datetime.now().strftime("%Y%m%d")}.csv'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error exporting deposits: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to export deposits: {str(e)}'}), 500