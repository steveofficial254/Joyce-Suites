"""
Caretaker Routes Module

Handles caretaker-specific operations:
- Dashboard overview
- Maintenance request management
- Tenant notifications
- Payment and room monitoring
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime

from models.base import db
from models.user import User
from models.maintenance import MaintenanceRequest
from models.notification import Notification
from models.payment import Payment
from models.lease import Lease
from models.property import Property
from routes.auth_routes import token_required

caretaker_bp = Blueprint("caretaker", __name__, url_prefix="/api/caretaker")

def caretaker_required(f):
    """Decorator to require caretaker or admin role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role not in ["caretaker", "admin"]:
            return jsonify({
                "success": False,
                "error": "Forbidden: Caretaker access required"
            }), 403
        return f(*args, **kwargs)
    return decorated

@caretaker_bp.route("/dashboard", methods=["GET"])
@caretaker_required
def get_dashboard():
    """Get caretaker dashboard with key statistics."""
    try:
        # Maintenance statistics
        pending_maintenance = MaintenanceRequest.query.filter_by(status='pending').count()
        in_progress_maintenance = MaintenanceRequest.query.filter_by(status='in_progress').count()
        completed_today = MaintenanceRequest.query.filter(
            MaintenanceRequest.status == 'completed',
            MaintenanceRequest.updated_at >= datetime.now().date()
        ).count()
        
        # Property statistics
        vacant_properties = Property.query.filter_by(status='vacant').count()
        occupied_properties = Property.query.filter_by(status='occupied').count()
        
        # Get recent maintenance requests
        recent_requests = MaintenanceRequest.query\
            .order_by(MaintenanceRequest.created_at.desc()).limit(5).all()
        
        return jsonify({
            "success": True,
            "dashboard": {
                "pending_maintenance": pending_maintenance,
                "in_progress_maintenance": in_progress_maintenance,
                "completed_today": completed_today,
                "vacant_properties": vacant_properties,
                "occupied_properties": occupied_properties,
                "recent_requests": [r.to_dict() for r in recent_requests]
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Dashboard error: {str(e)}"}), 500

@caretaker_bp.route("/maintenance", methods=["GET"])
@caretaker_required
def get_maintenance_requests():
    """Get all maintenance requests with filtering."""
    try:
        status = request.args.get('status')
        priority = request.args.get('priority')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = MaintenanceRequest.query
        
        if status:
            query = query.filter_by(status=status)
        if priority:
            query = query.filter_by(priority=priority)
        
        pagination = query.order_by(MaintenanceRequest.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        requests_list = [r.to_dict() for r in pagination.items]
        
        return jsonify({
            "success": True,
            "requests": requests_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get requests: {str(e)}"}), 500

@caretaker_bp.route("/maintenance/<int:req_id>", methods=["PUT"])
@caretaker_required
def update_maintenance_status(req_id):
    """Update maintenance request status."""
    try:
        maintenance_req = MaintenanceRequest.query.get(req_id)
        
        if not maintenance_req:
            return jsonify({"success": False, "error": "Request not found"}), 404
        
        data = request.get_json()
        
        if 'status' in data:
            maintenance_req.status = data['status']
        
        if 'priority' in data:
            maintenance_req.priority = data['priority']
        
        if 'assigned_to_id' in data:
            maintenance_req.assigned_to_id = data['assigned_to_id']
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Maintenance request updated",
            "request": maintenance_req.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to update: {str(e)}"}), 500

@caretaker_bp.route("/notifications/send", methods=["POST"])
@caretaker_required
def send_tenant_notification():
    """Send notification to a tenant."""
    try:
        data = request.get_json()
        
        required = ['tenant_id', 'title', 'message']
        for field in required:
            if not data.get(field):
                return jsonify({"success": False, "error": f"{field} is required"}), 400
        
        # Verify tenant exists
        tenant = User.query.filter_by(id=data['tenant_id'], role='tenant').first()
        if not tenant:
            return jsonify({"success": False, "error": "Tenant not found"}), 404
        
        notification = Notification(
            user_id=data['tenant_id'],
            title=data['title'],
            message=data['message'],
            notification_type=data.get('type', 'general')
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Notification sent",
            "notification": notification.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to send notification: {str(e)}"}), 500

@caretaker_bp.route("/payments/pending", methods=["GET"])
@caretaker_required
def get_pending_payments():
    """Get list of tenants with pending payments."""
    try:
        # Get all active leases
        active_leases = Lease.query.filter_by(status='active').all()
        
        tenants_with_arrears = []
        for lease in active_leases:
            # Get pending payments for this lease
            pending = Payment.query.filter_by(
                lease_id=lease.id,
                status='pending'
            ).count()
            
            if pending > 0:
                tenants_with_arrears.append({
                    "tenant_id": lease.tenant_id,
                    "tenant_name": lease.tenant.full_name if lease.tenant else "Unknown",
                    "room_number": lease.tenant.room_number if lease.tenant else None,
                    "pending_payments": pending,
                    "rent_amount": lease.rent_amount
                })
        
        return jsonify({
            "success": True,
            "tenants_with_arrears": tenants_with_arrears,
            "total_count": len(tenants_with_arrears)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get pending payments: {str(e)}"}), 500

@caretaker_bp.route("/rooms/available", methods=["GET"])
@caretaker_required
def get_available_rooms():
    """Get list of available (vacant) properties."""
    try:
        vacant_properties = Property.query.filter_by(status='vacant').all()
        
        rooms_list = [
            {
                "id": prop.id,
                "name": prop.name,
                "type": prop.property_type,
                "rent_amount": prop.rent_amount,
                "description": prop.description
            } for prop in vacant_properties
        ]
        
        return jsonify({
            "success": True,
            "available_rooms": rooms_list,
            "total_available": len(rooms_list)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get rooms: {str(e)}"}), 500

@caretaker_bp.route("/rooms/occupied", methods=["GET"])
@caretaker_required
def get_occupied_rooms():
    """Get list of occupied properties with tenant info."""
    try:
        occupied_properties = Property.query.filter_by(status='occupied').all()
        
        rooms_list = []
        for prop in occupied_properties:
            # Get active lease for this property
            lease = Lease.query.filter_by(property_id=prop.id, status='active').first()
            
            rooms_list.append({
                "id": prop.id,
                "name": prop.name,
                "type": prop.property_type,
                "rent_amount": prop.rent_amount,
                "tenant_name": lease.tenant.full_name if lease and lease.tenant else "Unknown",
                "tenant_phone": lease.tenant.phone_number if lease and lease.tenant else None
            })
        
        return jsonify({
            "success": True,
            "occupied_rooms": rooms_list,
            "total_occupied": len(rooms_list)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get rooms: {str(e)}"}), 500