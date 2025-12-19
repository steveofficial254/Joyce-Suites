"""
Caretaker Routes Module

Handles caretaker-specific operations:
- Dashboard overview
- Maintenance request management
- Tenant notifications
- Payment and room monitoring
- Public room listing (no auth)
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


# =========================
# ROLE PROTECTION DECORATOR
# =========================
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


# =========================
# DASHBOARD
# =========================
@caretaker_bp.route("/dashboard", methods=["GET"])
@caretaker_required
def get_dashboard():
    try:
        pending_maintenance = MaintenanceRequest.query.filter_by(status="pending").count()
        in_progress_maintenance = MaintenanceRequest.query.filter_by(status="in_progress").count()
        completed_today = MaintenanceRequest.query.filter(
            MaintenanceRequest.status == "completed",
            MaintenanceRequest.updated_at >= datetime.now().date()
        ).count()

        vacant_properties = Property.query.filter_by(status="vacant").count()
        occupied_properties = Property.query.filter_by(status="occupied").count()

        recent_requests = MaintenanceRequest.query.order_by(
            MaintenanceRequest.created_at.desc()
        ).limit(5).all()

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
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# MAINTENANCE
# =========================
@caretaker_bp.route("/maintenance", methods=["GET"])
@caretaker_required
def get_maintenance_requests():
    try:
        status = request.args.get("status")
        priority = request.args.get("priority")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        query = MaintenanceRequest.query
        if status:
            query = query.filter_by(status=status)
        if priority:
            query = query.filter_by(priority=priority)

        pagination = query.order_by(
            MaintenanceRequest.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "success": True,
            "requests": [r.to_dict() for r in pagination.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/maintenance/<int:req_id>", methods=["PUT"])
@caretaker_required
def update_maintenance_status(req_id):
    try:
        maintenance = MaintenanceRequest.query.get(req_id)
        if not maintenance:
            return jsonify({"success": False, "error": "Request not found"}), 404

        data = request.get_json()
        maintenance.status = data.get("status", maintenance.status)
        maintenance.priority = data.get("priority", maintenance.priority)
        maintenance.assigned_to_id = data.get("assigned_to_id", maintenance.assigned_to_id)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Maintenance request updated",
            "request": maintenance.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# NOTIFICATIONS
# =========================
@caretaker_bp.route("/notifications/send", methods=["POST"])
@caretaker_required
def send_tenant_notification():
    try:
        data = request.get_json()

        for field in ["tenant_id", "title", "message"]:
            if not data.get(field):
                return jsonify({"success": False, "error": f"{field} is required"}), 400

        tenant = User.query.filter_by(id=data["tenant_id"], role="tenant").first()
        if not tenant:
            return jsonify({"success": False, "error": "Tenant not found"}), 404

        notification = Notification(
            user_id=data["tenant_id"],
            title=data["title"],
            message=data["message"],
            notification_type=data.get("type", "general")
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
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# PAYMENTS
# =========================
@caretaker_bp.route("/payments/pending", methods=["GET"])
@caretaker_required
def get_pending_payments():
    try:
        active_leases = Lease.query.filter_by(status="active").all()
        tenants_with_arrears = []

        for lease in active_leases:
            pending = Payment.query.filter_by(
                lease_id=lease.id,
                status="pending"
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
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# ROOMS (PUBLIC — NO AUTH)
# =========================
@caretaker_bp.route("/rooms/public", methods=["GET"])
def get_public_rooms():
    """Public endpoint for tenant registration."""
    try:
        vacant_properties = Property.query.filter_by(status="vacant").all()

        rooms = [{
            "id": prop.id,
            "name": prop.name,
            "type": prop.property_type,
            "rent_amount": prop.rent_amount,
            "description": prop.description
        } for prop in vacant_properties]

        return jsonify({
            "success": True,
            "rooms": rooms,
            "total": len(rooms)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# ROOMS (PROTECTED)
# =========================
@caretaker_bp.route("/rooms/available", methods=["GET"])
@caretaker_required
def get_available_rooms():
    try:
        vacant_properties = Property.query.filter_by(status="vacant").all()

        return jsonify({
            "success": True,
            "available_rooms": [p.to_dict() for p in vacant_properties],
            "total_available": len(vacant_properties)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/rooms/occupied", methods=["GET"])
@caretaker_required
def get_occupied_rooms():
    try:
        occupied_properties = Property.query.filter_by(status="occupied").all()
        rooms = []

        for prop in occupied_properties:
            lease = Lease.query.filter_by(
                property_id=prop.id,
                status="active"
            ).first()

            rooms.append({
                "id": prop.id,
                "name": prop.name,
                "type": prop.property_type,
                "rent_amount": prop.rent_amount,
                "tenant_name": lease.tenant.full_name if lease and lease.tenant else "Unknown",
                "tenant_phone": lease.tenant.phone_number if lease and lease.tenant else None
            })

        return jsonify({
            "success": True,
            "occupied_rooms": rooms,
            "total_occupied": len(rooms)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
