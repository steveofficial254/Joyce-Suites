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
from datetime import datetime, timedelta
from sqlalchemy import func, or_
import traceback

from models.base import db
from models.user import User
from models.lease import Lease
from models.payment import Payment
from models.maintenance import MaintenanceRequest
from models.property import Property
from models.vacate_notice import VacateNotice
from routes.auth_routes import token_required

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

# ========== CORS OPTIONS HANDLERS ==========
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

# Catch-all OPTIONS handler for any other routes
@admin_bp.route("/<path:path>", methods=["OPTIONS"])
def handle_all_admin_options(path):
    """Catch-all OPTIONS handler for all admin routes"""
    return '', 200

# ========== DASHBOARD ENDPOINTS ==========

@admin_bp.route("/dashboard-stats", methods=["GET"])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics for admin"""
    try:
        # Count properties by status
        total_properties = Property.query.count()
        vacant_properties = Property.query.filter_by(status='vacant').count()
        occupied_properties = Property.query.filter_by(status='occupied').count()
        
        # Count tenants
        total_tenants = User.query.filter_by(role='tenant').count()
        active_tenants = User.query.filter_by(role='tenant', is_active=True).count()
        
        # Payment stats
        total_payments = Payment.query.count()
        total_payments_amount = db.session.query(func.sum(Payment.amount)).filter_by(status='completed').scalar() or 0
        pending_payments = Payment.query.filter_by(status='pending').count()
        
        # Maintenance stats
        pending_maintenance = MaintenanceRequest.query.filter_by(status='pending').count()
        
        # Vacate notices stats
        pending_vacate_notices = VacateNotice.query.filter_by(status='pending').count()
        approved_vacate_notices = VacateNotice.query.filter_by(status='approved').count()
        
        # Recent payments (last 5)
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
        
        # Recent vacate notices (last 5)
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
        # Count total tenants
        total_tenants = User.query.filter_by(role='tenant').count()
        
        # Count active leases
        active_leases = Lease.query.filter_by(status='active').count()
        
        # Count pending maintenance requests
        pending_maintenance = MaintenanceRequest.query.filter_by(status='pending').count()
        
        # Calculate total revenue (sum of successful payments)
        total_revenue = db.session.query(func.sum(Payment.amount))\
            .filter_by(status='completed').scalar() or 0
        
        # Get recent tenants (last 5)
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
        # This month's payments
        today = datetime.utcnow().date()
        first_day_of_month = today.replace(day=1)
        last_day_of_month = (first_day_of_month.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        
        monthly_payments = db.session.query(func.sum(Payment.amount))\
            .filter(
                Payment.created_at >= first_day_of_month,
                Payment.created_at <= last_day_of_month,
                Payment.status == 'completed'
            ).scalar() or 0
        
        # Total outstanding (active leases rent - payments this month)
        active_leases = Lease.query.filter_by(status='active').all()
        total_monthly_rent = sum([float(lease.rent_amount or 0) for lease in active_leases])
        
        outstanding_rent = max(0, total_monthly_rent - float(monthly_payments))
        
        # Total deposits collected
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

# ========== TENANT MANAGEMENT ==========

@admin_bp.route("/tenants", methods=["GET"])
@admin_required
def get_all_tenants():
    """Get list of all tenants with pagination."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        tenants_query = User.query.filter_by(role='tenant')
        
        # Pagination
        pagination = tenants_query.paginate(page=page, per_page=per_page, error_out=False)
        
        tenants_list = []
        for tenant in pagination.items:
            # Get current lease
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
        
        # Get tenant's current lease
        lease = Lease.query.filter_by(tenant_id=tenant_id, status='active').first()
        
        # Get payment history
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
        
        # Get maintenance requests
        maintenance = MaintenanceRequest.query.filter_by(reported_by_id=tenant_id)\
            .order_by(MaintenanceRequest.created_at.desc()).limit(10).all()
        
        maintenance_list = []
        for req in maintenance:
            property_ = Property.query.get(req.property_id)
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
        
        # Get vacate notices
        vacate_notices = []
        if lease:
            vacate_notices = VacateNotice.query.filter_by(lease_id=lease.id)\
                .order_by(VacateNotice.created_at.desc()).limit(5).all()
        
        notices_list = []
        for notice in vacate_notices:
            lease_obj = notice.lease if hasattr(notice, 'lease') else Lease.query.get(notice.lease_id)
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
                "vacate_notices": notices_list
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
        
        # Check if email exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                "success": False, 
                "error": "Email already exists"
            }), 409
        
        # Split full name
        names = data['full_name'].split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ""
        
        # Auto-generate username from email
        import uuid
        username = f"{data['email'].split('@')[0]}_{str(uuid.uuid4())[:8]}"
        
        # Create tenant
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
        
        # Update allowed fields
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
        
        # Check for active leases
        active_lease = Lease.query.filter_by(tenant_id=tenant_id, status='active').first()
        if active_lease:
            return jsonify({
                "success": False,
                "error": "Cannot delete tenant with active lease"
            }), 400
        
        db.session.delete(tenant)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Tenant deleted successfully"
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

# ========== CONTRACT MANAGEMENT ==========

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

# ========== PROPERTY MANAGEMENT ==========

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
                tenant = User.query.get(prop.current_tenant_id)
                if tenant:
                    current_tenant = {
                        'id': tenant.id,
                        'name': tenant.full_name,
                        'email': tenant.email,
                        'phone': tenant.phone_number
                    }
                    
                    # Get current lease
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
                "created_at": prop.created_at.isoformat() if prop.created_at else None
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

# ========== MAINTENANCE MANAGEMENT ==========

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
            reporter = User.query.get(req.reported_by_id)
            property_ = Property.query.get(req.property_id)
            
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

# ========== REPORTS ==========

@admin_bp.route("/payments/report", methods=["GET"])
@admin_required
def get_payment_report():
    """Generate payment report."""
    try:
        # Get payment statistics
        total_payments = Payment.query.count()
        successful_payments = Payment.query.filter_by(status='paid').count()
        pending_payments = Payment.query.filter(Payment.status.in_(['pending', 'unpaid'])).count()
        failed_payments = Payment.query.filter_by(status='failed').count()
        
        total_amount = db.session.query(func.sum(Payment.amount))\
            .filter_by(status='paid').scalar() or 0
        
        # Get recent payments
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
        
        # Get monthly breakdown for last 6 months
        monthly_data = []
        for i in range(5, -1, -1):
            month_start = datetime.utcnow().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            month_total = db.session.query(func.sum(Payment.amount))\
                .filter(
                    Payment.created_at >= month_start,
                    Payment.created_at <= month_end,
                    Payment.status == 'paid'
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
        occupied_properties = Property.query.filter_by(status='occupied').count()
        vacant_properties = Property.query.filter_by(status='vacant').count()
        
        active_leases = Lease.query.filter_by(status='active').count()
        
        occupancy_rate = (occupied_properties / total_properties * 100) if total_properties > 0 else 0
        
        # Get occupancy by property type
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

# ========== VACATE NOTICES MANAGEMENT ==========

@admin_bp.route("/vacate-notices", methods=["GET"])
@admin_required
def get_vacate_notices():
    """Get all vacate notices with pagination"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)
        status = request.args.get('status', 'all')
        
        # Build query
        query = VacateNotice.query
        
        # Filter by status
        if status and status != 'all':
            query = query.filter(VacateNotice.status == status)
        
        # Order by latest first
        query = query.order_by(VacateNotice.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        notices = []
        for notice in pagination.items:
            try:
                # Get lease details
                lease = notice.lease if hasattr(notice, 'lease') else Lease.query.get(notice.lease_id)
                
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
        
        notice = VacateNotice.query.get_or_404(notice_id)
        
        # Store old status for comparison
        old_status = notice.status
        notice.status = status
        notice.admin_notes = admin_notes
        notice.updated_at = datetime.utcnow()
        
        # If approved, mark property as vacant and end the lease
        if status == 'approved' and old_status != 'approved':
            lease = notice.lease if hasattr(notice, 'lease') else Lease.query.get(notice.lease_id)
            
            if lease:
                property_ = lease.property
                tenant = lease.tenant
                
                if property_:
                    property_.status = 'vacant'
                    property_.current_tenant_id = None
                
                # End the lease
                lease.status = 'terminated'
                lease.end_date = datetime.utcnow().date()
                if hasattr(lease, 'termination_reason'):
                    lease.termination_reason = 'Tenant vacated'
                
                # Mark tenant as inactive if they have no other active leases
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
        notice = VacateNotice.query.get_or_404(notice_id)
        
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