"""
Caretaker Routes Module

Handles caretaker operations for Joyce Suites including maintenance request management,
tenant notifications, and room/payment monitoring.

All routes require caretaker role authentication.
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from enum import Enum
from routes.auth_routes import token_required


# Blueprint initialization
caretaker_bp = Blueprint("caretaker", __name__, url_prefix="/api/caretaker")


class MaintenanceStatus(Enum):
    """Enumeration for maintenance request statuses."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MaintenancePriority(Enum):
    """Enumeration for maintenance request priorities."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationType(Enum):
    """Enumeration for notification types."""
    RENT_REMINDER = "rent_reminder"
    MAINTENANCE_UPDATE = "maintenance_update"
    GENERAL_NOTICE = "general_notice"
    EMERGENCY = "emergency"


def caretaker_required(f):
    """
    Decorator to require caretaker role and valid token.
    
    This decorator:
    1. Applies token_required to validate the JWT token
    2. Checks that the user role is 'caretaker' or 'admin'
    3. Ensures request.user_id and request.user_role are set
    
    Args:
        f: Flask route function
    
    Returns:
        Wrapped function
    """
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        # At this point, token_required has already validated the token
        # and set request.user_id and request.user_role
        
        # Check if user is a caretaker or admin
        if not hasattr(request, "user_role") or request.user_role not in ["caretaker", "admin"]:
            return jsonify({
                "success": False,
                "error": "Forbidden: Caretaker access required"
            }), 403
        
        # Token is valid and user is a caretaker/admin, call the route handler
        return f(*args, **kwargs)
    
    return decorated


# Mock databases (replace with SQLAlchemy models in production)
maintenance_requests_db = {
    1: {
        "request_id": 1,
        "room_id": 101,
        "tenant_id": 1,
        "title": "Leaking tap in bathroom",
        "description": "Water is leaking from the bathroom tap",
        "priority": MaintenancePriority.HIGH.value,
        "status": MaintenanceStatus.PENDING.value,
        "category": "plumbing",
        "created_at": "2025-01-20T10:30:00",
        "updated_at": "2025-01-20T10:30:00",
        "assigned_to": None,
        "completion_date": None,
        "notes": ""
    },
    2: {
        "request_id": 2,
        "room_id": 102,
        "tenant_id": 2,
        "title": "Broken light bulb",
        "description": "Bedroom ceiling light is not working",
        "priority": MaintenancePriority.MEDIUM.value,
        "status": MaintenanceStatus.IN_PROGRESS.value,
        "category": "electrical",
        "created_at": "2025-01-19T14:15:00",
        "updated_at": "2025-01-20T09:00:00",
        "assigned_to": "John Kariuki",
        "completion_date": None,
        "notes": "Waiting for spare bulb"
    },
    3: {
        "request_id": 3,
        "room_id": 103,
        "tenant_id": None,
        "title": "General room cleaning",
        "description": "Room 103 needs thorough cleaning before new tenant",
        "priority": MaintenancePriority.LOW.value,
        "status": MaintenanceStatus.COMPLETED.value,
        "category": "cleaning",
        "created_at": "2025-01-18T08:00:00",
        "updated_at": "2025-01-20T16:00:00",
        "assigned_to": "Mary Njeri",
        "completion_date": "2025-01-20T16:00:00",
        "notes": "Completed successfully"
    }
}

notifications_db = {
    1: {
        "notification_id": 1,
        "tenant_id": 1,
        "type": NotificationType.RENT_REMINDER.value,
        "title": "Rent Payment Reminder",
        "message": "Your rent for February 2025 is due on 2025-02-01",
        "created_at": "2025-01-25T08:00:00",
        "read": False
    },
    2: {
        "notification_id": 2,
        "tenant_id": 2,
        "type": NotificationType.MAINTENANCE_UPDATE.value,
        "title": "Maintenance Update",
        "message": "Your maintenance request has been completed",
        "created_at": "2025-01-24T15:30:00",
        "read": True
    }
}

tenants_with_arrears_db = {
    2: {
        "tenant_id": 2,
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+254723456789",
        "room_id": 102,
        "room_number": "102",
        "monthly_rent": 22000.00,
        "outstanding_balance": 44000.00,
        "months_overdue": 2,
        "last_payment_date": "2024-12-05",
        "due_date": "2025-02-01"
    }
}

rooms_db = {
    101: {
        "room_id": 101,
        "room_number": "101",
        "floor": 1,
        "room_type": "single",
        "amenities": ["bed", "wardrobe", "desk"],
        "rent_amount": 25000.00,
        "is_occupied": True,
        "tenant_id": 1,
        "tenant_name": "John Doe",
        "created_at": "2024-01-01T10:00:00"
    },
    102: {
        "room_id": 102,
        "room_number": "102",
        "floor": 1,
        "room_type": "single",
        "amenities": ["bed", "wardrobe", "desk"],
        "rent_amount": 22000.00,
        "is_occupied": True,
        "tenant_id": 2,
        "tenant_name": "Jane Smith",
        "created_at": "2024-01-01T10:00:00"
    },
    103: {
        "room_id": 103,
        "room_number": "103",
        "floor": 1,
        "room_type": "single",
        "amenities": ["bed", "wardrobe", "desk"],
        "rent_amount": 20000.00,
        "is_occupied": False,
        "tenant_id": None,
        "tenant_name": None,
        "created_at": "2024-01-01T10:00:00"
    },
    104: {
        "room_id": 104,
        "room_number": "104",
        "floor": 2,
        "room_type": "single",
        "amenities": ["bed", "wardrobe", "desk"],
        "rent_amount": 25000.00,
        "is_occupied": False,
        "tenant_id": None,
        "tenant_name": None,
        "created_at": "2024-01-01T10:00:00"
    }
}


def validate_maintenance_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate maintenance request data.
    
    Args:
        data: Maintenance request data to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["title", "description", "room_id"]
    missing = [f for f in required_fields if not data.get(f)]
    
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    
    if len(data["title"]) < 3:
        return False, "Title must be at least 3 characters long"
    
    if len(data["description"]) < 10:
        return False, "Description must be at least 10 characters long"
    
    priority = data.get("priority", MaintenancePriority.MEDIUM.value).lower()
    valid_priorities = [p.value for p in MaintenancePriority]
    if priority not in valid_priorities:
        return False, f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
    
    return True, None


def validate_notification_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate notification data.
    
    Args:
        data: Notification data to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["tenant_id", "type", "title", "message"]
    missing = [f for f in required_fields if not data.get(f)]
    
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    
    notification_type = data["type"].lower()
    valid_types = [t.value for t in NotificationType]
    if notification_type not in valid_types:
        return False, f"Invalid notification type. Must be one of: {', '.join(valid_types)}"
    
    if len(data["message"]) < 5:
        return False, "Message must be at least 5 characters long"
    
    return True, None


# ==================== DASHBOARD ROUTES ====================

@caretaker_bp.route("/dashboard", methods=["GET"])
@caretaker_required
def get_dashboard():
    """
    Get caretaker dashboard with key statistics and pending tasks.
    
    Returns:
        JSON response with caretaker stats
    """
    try:
        # Calculate statistics
        pending_maintenance = [m for m in maintenance_requests_db.values() 
                               if m["status"] == MaintenanceStatus.PENDING.value]
        in_progress_maintenance = [m for m in maintenance_requests_db.values() 
                                   if m["status"] == MaintenanceStatus.IN_PROGRESS.value]
        
        total_maintenance = len(maintenance_requests_db)
        total_tenants = 2  # Mock count
        occupied_rooms = len([r for r in rooms_db.values() if r["is_occupied"]])
        available_rooms = len([r for r in rooms_db.values() if not r["is_occupied"]])
        tenants_with_arrears = len(tenants_with_arrears_db)
        
        dashboard_stats = {
            "success": True,
            "dashboard": {
                "total_maintenance_requests": total_maintenance,
                "pending_requests": len(pending_maintenance),
                "in_progress_requests": len(in_progress_maintenance),
                "completed_requests": len([m for m in maintenance_requests_db.values() 
                                          if m["status"] == MaintenanceStatus.COMPLETED.value]),
                "total_tenants": total_tenants,
                "occupied_rooms": occupied_rooms,
                "available_rooms": available_rooms,
                "tenants_with_arrears": tenants_with_arrears,
                "pending_notifications": len([n for n in notifications_db.values() 
                                             if not n["read"]]),
                "generated_at": datetime.utcnow().isoformat(),
                "quick_actions": {
                    "urgent_maintenance": [m for m in pending_maintenance 
                                          if m["priority"] == MaintenancePriority.URGENT.value],
                    "urgent_payments": list(tenants_with_arrears_db.values())[:3]
                }
            }
        }
        
        return jsonify(dashboard_stats), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve dashboard: {str(e)}"
        }), 500


# ==================== MAINTENANCE REQUEST ROUTES ====================

@caretaker_bp.route("/maintenance", methods=["GET"])
@caretaker_required
def get_maintenance_requests():
    """
    Get list of all maintenance requests with filtering and pagination.
    
    Query parameters:
        status: Filter by status (pending, in_progress, completed, cancelled)
        priority: Filter by priority (low, medium, high, urgent)
        page: Page number (default: 1)
        per_page: Items per page (default: 10)
    
    Returns:
        JSON response with maintenance requests
    """
    try:
        status_filter = request.args.get("status", None)
        priority_filter = request.args.get("priority", None)
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        if page < 1 or per_page < 1:
            return jsonify({
                "success": False,
                "error": "Page and per_page must be positive integers"
            }), 400
        
        # Filter requests
        all_requests = list(maintenance_requests_db.values())
        
        if status_filter:
            all_requests = [m for m in all_requests if m["status"] == status_filter]
        
        if priority_filter:
            all_requests = [m for m in all_requests if m["priority"] == priority_filter]
        
        # Sort by creation date (newest first)
        all_requests.sort(key=lambda x: x["created_at"], reverse=True)
        
        total_requests = len(all_requests)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_requests = all_requests[start:end]
        
        total_pages = (total_requests + per_page - 1) // per_page
        
        return jsonify({
            "success": True,
            "maintenance_requests": paginated_requests,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_requests,
                "total_pages": total_pages
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve maintenance requests: {str(e)}"
        }), 500


@caretaker_bp.route("/maintenance/update/<int:req_id>", methods=["POST"])
@caretaker_required
def update_maintenance_status(req_id: int):
    """
    Update maintenance request status and details.
    
    URL parameters:
        req_id: ID of maintenance request
    
    Request body:
    {
        "status": "in_progress",
        "priority": "high",
        "assigned_to": "John Kariuki",
        "notes": "Started work on the issue"
    }
    
    Returns:
        JSON response with updated request
    """
    try:
        maintenance_request = maintenance_requests_db.get(req_id)
        
        if not maintenance_request:
            return jsonify({
                "success": False,
                "error": "Maintenance request not found"
            }), 404
        
        data = request.get_json()
        
        # Validate status if provided
        if "status" in data:
            valid_statuses = [s.value for s in MaintenanceStatus]
            if data["status"] not in valid_statuses:
                return jsonify({
                    "success": False,
                    "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
                }), 400
            maintenance_request["status"] = data["status"]
        
        # Validate priority if provided
        if "priority" in data:
            valid_priorities = [p.value for p in MaintenancePriority]
            if data["priority"] not in valid_priorities:
                return jsonify({
                    "success": False,
                    "error": f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
                }), 400
            maintenance_request["priority"] = data["priority"]
        
        # Update allowed fields
        if "assigned_to" in data:
            maintenance_request["assigned_to"] = data["assigned_to"].strip()
        
        if "notes" in data:
            maintenance_request["notes"] = data["notes"].strip()
        
        # Set completion date if status is completed
        if data.get("status") == MaintenanceStatus.COMPLETED.value:
            maintenance_request["completion_date"] = datetime.utcnow().isoformat()
        
        maintenance_request["updated_at"] = datetime.utcnow().isoformat()
        
        return jsonify({
            "success": True,
            "message": "Maintenance request updated successfully",
            "maintenance_request": maintenance_request
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to update maintenance request: {str(e)}"
        }), 500


# ==================== NOTIFICATION ROUTES ====================

@caretaker_bp.route("/tenant/notify", methods=["POST"])
@caretaker_required
def send_tenant_notification():
    """
    Send notification to a tenant.
    
    Request body:
    {
        "tenant_id": 1,
        "type": "rent_reminder",
        "title": "Rent Payment Reminder",
        "message": "Your rent for March 2025 is due on 2025-03-01"
    }
    
    Returns:
        JSON response with created notification
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        is_valid, error_msg = validate_notification_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Check if tenant exists (mock check)
        tenant_id = data["tenant_id"]
        
        # Generate notification ID
        notification_id = max(notifications_db.keys()) + 1 if notifications_db else 1
        
        notification = {
            "notification_id": notification_id,
            "tenant_id": tenant_id,
            "type": data["type"].lower(),
            "title": data["title"].strip(),
            "message": data["message"].strip(),
            "created_at": datetime.utcnow().isoformat(),
            "read": False
        }
        
        notifications_db[notification_id] = notification
        
        return jsonify({
            "success": True,
            "message": "Notification sent successfully",
            "notification": notification
        }), 201
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to send notification: {str(e)}"
        }), 500


# ==================== PAYMENT MONITORING ROUTES ====================

@caretaker_bp.route("/payments/pending", methods=["GET"])
@caretaker_required
def get_pending_payments():
    """
    Get list of tenants with unpaid or overdue rent.
    
    Query parameters:
        sort_by: Sort by ('balance', 'months_overdue', 'due_date') - default: 'balance'
        order: Sort order ('asc', 'desc') - default: 'desc'
    
    Returns:
        JSON response with tenants having outstanding balances
    """
    try:
        sort_by = request.args.get("sort_by", "balance")
        order = request.args.get("order", "desc").lower()
        
        valid_sort_options = ["balance", "months_overdue", "due_date"]
        if sort_by not in valid_sort_options:
            sort_by = "balance"
        
        if order not in ["asc", "desc"]:
            order = "desc"
        
        # Get all tenants with arrears
        tenants_with_pending = list(tenants_with_arrears_db.values())
        
        # Sort
        if sort_by == "balance":
            tenants_with_pending.sort(
                key=lambda x: x["outstanding_balance"],
                reverse=(order == "desc")
            )
        elif sort_by == "months_overdue":
            tenants_with_pending.sort(
                key=lambda x: x["months_overdue"],
                reverse=(order == "desc")
            )
        elif sort_by == "due_date":
            tenants_with_pending.sort(
                key=lambda x: x["due_date"],
                reverse=(order == "desc")
            )
        
        total_pending_balance = sum(t["outstanding_balance"] for t in tenants_with_pending)
        
        return jsonify({
            "success": True,
            "pending_payments": {
                "count": len(tenants_with_pending),
                "total_balance": total_pending_balance,
                "tenants": tenants_with_pending
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve pending payments: {str(e)}"
        }), 500


# ==================== ROOM MONITORING ROUTES ====================

@caretaker_bp.route("/rooms/available", methods=["GET"])
@caretaker_required
def get_available_rooms():
    """
    Get list of available (unoccupied) rooms.
    
    Query parameters:
        floor: Filter by floor number
        room_type: Filter by room type
    
    Returns:
        JSON response with available rooms
    """
    try:
        floor_filter = request.args.get("floor", None, type=int)
        room_type_filter = request.args.get("room_type", None)
        
        # Get available rooms
        available_rooms = [r for r in rooms_db.values() if not r["is_occupied"]]
        
        # Apply filters
        if floor_filter:
            available_rooms = [r for r in available_rooms if r["floor"] == floor_filter]
        
        if room_type_filter:
            available_rooms = [r for r in available_rooms if r["room_type"] == room_type_filter]
        
        # Sort by room number
        available_rooms.sort(key=lambda x: x["room_number"])
        
        total_available = len(available_rooms)
        total_rooms = len(rooms_db)
        occupancy_rate = ((total_rooms - total_available) / total_rooms * 100) if total_rooms > 0 else 0
        
        return jsonify({
            "success": True,
            "available_rooms": available_rooms,
            "summary": {
                "total_available": total_available,
                "total_rooms": total_rooms,
                "occupancy_rate": round(occupancy_rate, 2)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve available rooms: {str(e)}"
        }), 500


@caretaker_bp.route("/rooms/occupied", methods=["GET"])
@caretaker_required
def get_occupied_rooms():
    """
    Get list of occupied rooms with tenant information.
    
    Query parameters:
        floor: Filter by floor number
        room_type: Filter by room type
    
    Returns:
        JSON response with occupied rooms
    """
    try:
        floor_filter = request.args.get("floor", None, type=int)
        room_type_filter = request.args.get("room_type", None)
        
        # Get occupied rooms
        occupied_rooms = [r for r in rooms_db.values() if r["is_occupied"]]
        
        # Apply filters
        if floor_filter:
            occupied_rooms = [r for r in occupied_rooms if r["floor"] == floor_filter]
        
        if room_type_filter:
            occupied_rooms = [r for r in occupied_rooms if r["room_type"] == room_type_filter]
        
        # Sort by room number
        occupied_rooms.sort(key=lambda x: x["room_number"])
        
        total_occupied = len(occupied_rooms)
        total_rooms = len(rooms_db)
        occupancy_rate = (total_occupied / total_rooms * 100) if total_rooms > 0 else 0
        
        return jsonify({
            "success": True,
            "occupied_rooms": occupied_rooms,
            "summary": {
                "total_occupied": total_occupied,
                "total_rooms": total_rooms,
                "occupancy_rate": round(occupancy_rate, 2)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve occupied rooms: {str(e)}"
        }), 500