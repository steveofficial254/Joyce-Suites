"""
Admin Routes Module

Handles admin-specific operations:
- Dashboard overview
- Tenant management (CRUD)
- Contract management
- Reports generation
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
from sqlalchemy import func

from models.base import db
from models.user import User
from models.lease import Lease
from models.payment import Payment
from models.maintenance import MaintenanceRequest
from models.property import Property
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
            .filter_by(status='successful').scalar() or 0
        
        # Get recent tenants (last 5)
        recent_tenants = User.query.filter_by(role='tenant')\
            .order_by(User.created_at.desc()).limit(5).all()
        
        return jsonify({
            "success": True,
            "overview": {
                "total_tenants": total_tenants,
                "active_leases": active_leases,
                "pending_maintenance": pending_maintenance,
                "total_revenue": float(total_revenue),
                "recent_tenants": [
                    {
                        "id": t.id,
                        "name": t.full_name,
                        "email": t.email,
                        "room_number": t.room_number,
                        "created_at": t.created_at.isoformat() if t.created_at else None
                    } for t in recent_tenants
                ]
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Overview error: {str(e)}"}), 500

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
        
        tenants_list = [
            {
                "id": t.id,
                "name": t.full_name,
                "email": t.email,
                "phone": t.phone_number,
                "room_number": t.room_number,
                "national_id": t.national_id,
                "is_active": t.is_active,
                "created_at": t.created_at.isoformat() if t.created_at else None
            } for t in pagination.items
        ]
        
        return jsonify({
            "success": True,
            "tenants": tenants_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get tenants: {str(e)}"}), 500

@admin_bp.route("/tenant/<int:tenant_id>", methods=["GET"])
@admin_required
def get_tenant_details(tenant_id):
    """Get details for a specific tenant."""
    try:
        tenant = User.query.filter_by(id=tenant_id, role='tenant').first()
        
        if not tenant:
            return jsonify({"success": False, "error": "Tenant not found"}), 404
        
        # Get tenant's lease
        lease = Lease.query.filter_by(tenant_id=tenant_id, status='active').first()
        
        # Get payment history
        payments = []
        if lease:
            payments = Payment.query.filter_by(lease_id=lease.id)\
                .order_by(Payment.created_at.desc()).limit(10).all()
        
        # Get maintenance requests
        maintenance = MaintenanceRequest.query.filter_by(reported_by_id=tenant_id)\
            .order_by(MaintenanceRequest.created_at.desc()).limit(10).all()
        
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
                "lease": lease.to_dict() if lease else None,
                "recent_payments": [p.to_dict() for p in payments],
                "recent_maintenance": [m.to_dict() for m in maintenance]
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get tenant: {str(e)}"}), 500

@admin_bp.route("/tenant/create", methods=["POST"])
@admin_required
def create_tenant():
    """Create a new tenant (admin-initiated)."""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'full_name', 'phone', 'national_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "error": f"{field} is required"}), 400
        
        # Check if email exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"success": False, "error": "Email already exists"}), 409
        
        # Split full name
        names = data['full_name'].split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ""
        
        # Auto-generate username from email (required by model but not exposed to user)
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
        return jsonify({"success": False, "error": f"Failed to create tenant: {str(e)}"}), 500

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
        return jsonify({"success": False, "error": f"Failed to update tenant: {str(e)}"}), 500

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
        return jsonify({"success": False, "error": f"Failed to delete tenant: {str(e)}"}), 500

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
        
        contracts = [
            {
                "id": lease.id,
                "tenant_name": lease.tenant.full_name if lease.tenant else "Unknown",
                "property_name": lease.property.name if lease.property else "Unknown",
                "start_date": lease.start_date.isoformat() if lease.start_date else None,
                "end_date": lease.end_date.isoformat() if lease.end_date else None,
                "rent_amount": lease.rent_amount,
                "status": lease.status
            } for lease in pagination.items
        ]
        
        return jsonify({
            "success": True,
            "contracts": contracts,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get contracts: {str(e)}"}), 500

@admin_bp.route("/payments/report", methods=["GET"])
@admin_required
def get_payment_report():
    """Generate payment report."""
    try:
        # Get payment statistics
        total_payments = Payment.query.count()
        successful_payments = Payment.query.filter_by(status='successful').count()
        pending_payments = Payment.query.filter_by(status='pending').count()
        failed_payments = Payment.query.filter_by(status='failed').count()
        
        total_amount = db.session.query(func.sum(Payment.amount))\
            .filter_by(status='successful').scalar() or 0
        
        # Get recent payments
        recent = Payment.query.order_by(Payment.created_at.desc()).limit(20).all()
        
        return jsonify({
            "success": True,
            "report": {
                "total_payments": total_payments,
                "successful": successful_payments,
                "pending": pending_payments,
                "failed": failed_payments,
                "total_amount": float(total_amount),
                "recent_payments": [p.to_dict() for p in recent]
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to generate report: {str(e)}"}), 500

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
        
        return jsonify({
            "success": True,
            "report": {
                "total_properties": total_properties,
                "occupied": occupied_properties,
                "vacant": vacant_properties,
                "active_leases": active_leases,
                "occupancy_rate": round(occupancy_rate, 2)
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to generate report: {str(e)}"}), 500