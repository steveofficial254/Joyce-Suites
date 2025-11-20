"""
Tenant Routes Module

Handles tenant-specific operations:
- Dashboard overview
- Lease management
- Payment history and processing
- Maintenance requests
- Notifications
"""

from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from datetime import datetime
import os

from models.base import db
from models.user import User
from models.lease import Lease
from models.payment import Payment
from models.maintenance import MaintenanceRequest
from models.notification import Notification
from models.property import Property
from routes.auth_routes import token_required

tenant_bp = Blueprint("tenant", __name__, url_prefix="/api/tenant")

def tenant_required(f):
    """Decorator to require tenant role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != "tenant":
            return jsonify({
                "success": False,
                "error": "Forbidden: Tenant access required"
            }), 403
        return f(*args, **kwargs)
    return decorated

@tenant_bp.route("/dashboard", methods=["GET"])
@tenant_required
def dashboard():
    """Get tenant dashboard overview."""
    try:
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        # Get active lease
        active_lease = Lease.query.filter_by(tenant_id=user.id, status='active').first()
        
        # Get recent payments
        recent_payments = []
        if active_lease:
            payments = Payment.query.filter_by(lease_id=active_lease.id)\
                .order_by(Payment.created_at.desc()).limit(5).all()
            recent_payments = [p.to_dict() for p in payments]

        # Get active maintenance requests
        active_maintenance = MaintenanceRequest.query.filter(
            MaintenanceRequest.reported_by_id == user.id,
            MaintenanceRequest.status.in_(['pending', 'in_progress'])
        ).count()

        # Get unread notifications
        unread_notifications = Notification.query.filter_by(
            user_id=user.id, is_read=False
        ).count()

        return jsonify({
            "success": True,
            "dashboard": {
                "tenant_name": user.full_name,
                "property_name": active_lease.property.name if active_lease and active_lease.property else "No active lease",
                "unit_number": user.room_number or "N/A",
                "lease_status": active_lease.status if active_lease else "None",
                "rent_amount": active_lease.rent_amount if active_lease else 0,
                "outstanding_balance": 0,  # To be implemented with proper billing logic
                "active_maintenance_requests": active_maintenance,
                "unread_notifications": unread_notifications,
                "recent_payments": recent_payments
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Dashboard error: {str(e)}"}), 500

@tenant_bp.route("/lease", methods=["GET"])
@tenant_required
def get_lease_details():
    """Get details of the current lease."""
    try:
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        
        if not lease:
            return jsonify({
                "success": True,
                "message": "No active lease found",
                "lease": None
            }), 200

        return jsonify({
            "success": True,
            "lease": lease.to_dict()
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get lease: {str(e)}"}), 500

@tenant_bp.route("/payments", methods=["GET"])
@tenant_required
def get_payment_history():
    """Get payment history."""
    try:
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        if not lease:
            return jsonify({"success": True, "payments": []}), 200

        payments = Payment.query.filter_by(lease_id=lease.id)\
            .order_by(Payment.created_at.desc()).all()
            
        return jsonify({
            "success": True,
            "payments": [p.to_dict() for p in payments]
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get payments: {str(e)}"}), 500

@tenant_bp.route("/maintenance/request", methods=["POST"])
@tenant_required
def create_maintenance_request():
    """Create a new maintenance request."""
    try:
        data = request.get_json()
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({"success": False, "error": "Title and description are required"}), 400

        # Get active lease to find property
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        if not lease:
            return jsonify({"success": False, "error": "No active lease found. Cannot create request."}), 400

        new_request = MaintenanceRequest(
            title=data['title'],
            description=data['description'],
            priority=data.get('priority', 'normal'),
            property_id=lease.property_id,
            reported_by_id=request.user_id,
            status='pending'
        )
        
        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Maintenance request created successfully",
            "request": new_request.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to create request: {str(e)}"}), 500

@tenant_bp.route("/maintenance", methods=["GET"])
@tenant_required
def get_maintenance_requests():
    """Get all maintenance requests for the tenant."""
    try:
        requests = MaintenanceRequest.query.filter_by(reported_by_id=request.user_id)\
            .order_by(MaintenanceRequest.created_at.desc()).all()
            
        return jsonify({
            "success": True,
            "requests": [r.to_dict() for r in requests]
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get requests: {str(e)}"}), 500

@tenant_bp.route("/notifications", methods=["GET"])
@tenant_required
def get_notifications():
    """Get tenant notifications."""
    try:
        notifications = Notification.query.filter_by(user_id=request.user_id)\
            .order_by(Notification.created_at.desc()).all()
            
        return jsonify({
            "success": True,
            "notifications": [n.to_dict() for n in notifications]
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to get notifications: {str(e)}"}), 500

@tenant_bp.route("/notifications/mark-read/<int:notification_id>", methods=["PUT"])
@tenant_required
def mark_notification_read(notification_id):
    """Mark a notification as read."""
    try:
        notification = Notification.query.filter_by(id=notification_id, user_id=request.user_id).first()
        
        if not notification:
            return jsonify({"success": False, "error": "Notification not found"}), 404
            
        notification.mark_as_read()
        db.session.commit()
        
        return jsonify({"success": True, "message": "Marked as read"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to update notification: {str(e)}"}), 500