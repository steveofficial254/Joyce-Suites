
from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from enum import Enum
from routes.auth_routes import token_required
from services.contract_service import ContractService
from services.report_service import ReportService


# Blueprint initialization
tenant_bp = Blueprint("tenant", __name__, url_prefix="/api/tenant")


class PaymentStatus(Enum):
    """Enumeration for payment statuses."""
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"


class NotificationStatus(Enum):
    """Enumeration for notification read status."""
    READ = "read"
    UNREAD = "unread"


def tenant_required(f):
    """
    Decorator to require tenant role and valid token.
    
    This decorator:
    1. Applies token_required to validate the JWT token
    2. Checks that the user role is 'tenant'
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
        
        # Check if user is a tenant
        if not hasattr(request, "user_role") or request.user_role != "tenant":
            return jsonify({
                "success": False,
                "error": "Forbidden: Tenant access required"
            }), 403
        
        # Token is valid and user is a tenant, call the route handler
        return f(*args, **kwargs)
    
    return decorated


# Mock databases (replace with SQLAlchemy models in production)
tenant_profiles_db = {
    1: {
        "tenant_id": 1,
        "user_id": 1,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+254712345678",
        "id_number": "12345678",
        "occupation": "Software Engineer",
        "emergency_contact": "Jane Doe",
        "emergency_phone": "+254712345679",
        "room_id": 101,
        "room_number": "101",
        "floor": 1,
        "created_at": "2024-06-15T10:00:00",
        "updated_at": "2024-06-15T10:00:00"
    },
    2: {
        "tenant_id": 2,
        "user_id": 2,
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+254723456789",
        "id_number": "87654321",
        "occupation": "Accountant",
        "emergency_contact": "John Smith",
        "emergency_phone": "+254723456788",
        "room_id": 102,
        "room_number": "102",
        "floor": 1,
        "created_at": "2024-09-01T10:00:00",
        "updated_at": "2024-09-01T10:00:00"
    }
}

tenant_payments_db = {
    1: {
        "payment_id": "PAY001",
        "tenant_id": 1,
        "amount": 25000.00,
        "status": PaymentStatus.PAID.value,
        "payment_method": "mpesa",
        "transaction_ref": "MPS123456789",
        "payment_date": "2025-01-05T14:30:00",
        "due_date": "2025-01-01",
        "month": "January 2025"
    },
    2: {
        "payment_id": "PAY002",
        "tenant_id": 1,
        "amount": 25000.00,
        "status": PaymentStatus.OVERDUE.value,
        "payment_method": None,
        "transaction_ref": None,
        "payment_date": None,
        "due_date": "2025-02-01",
        "month": "February 2025"
    },
    3: {
        "payment_id": "PAY003",
        "tenant_id": 2,
        "amount": 22000.00,
        "status": PaymentStatus.PENDING.value,
        "payment_method": None,
        "transaction_ref": None,
        "payment_date": None,
        "due_date": "2025-02-01",
        "month": "February 2025"
    }
}

tenant_maintenance_requests_db = {
    1: {
        "request_id": 1,
        "tenant_id": 1,
        "room_id": 101,
        "title": "Leaking tap in bathroom",
        "description": "Water is leaking from the bathroom tap constantly",
        "status": "in_progress",
        "priority": "high",
        "category": "plumbing",
        "created_at": "2025-01-20T10:30:00",
        "updated_at": "2025-01-20T15:00:00",
        "assigned_to": "John Kariuki",
        "completion_date": None,
        "notes": "Started work on the issue"
    },
    2: {
        "request_id": 2,
        "tenant_id": 1,
        "room_id": 101,
        "title": "Broken door handle",
        "description": "The bedroom door handle is broken and won't open",
        "status": "completed",
        "priority": "medium",
        "category": "carpentry",
        "created_at": "2025-01-15T09:00:00",
        "updated_at": "2025-01-18T16:30:00",
        "assigned_to": "Mary Njeri",
        "completion_date": "2025-01-18T16:30:00",
        "notes": "Door handle replaced successfully"
    }
}

tenant_leases_db = {
    1: {
        "contract_id": "CNT001",
        "tenant_id": 1,
        "room_id": 101,
        "start_date": "2024-06-15",
        "end_date": "2025-06-15",
        "rent_amount": 25000.00,
        "status": "active",
        "deposit_amount": 25000.00,
        "terms": "12-month lease agreement",
        "created_at": "2024-06-15T10:00:00",
        "updated_at": "2024-06-15T10:00:00"
    },
    2: {
        "contract_id": "CNT002",
        "tenant_id": 2,
        "room_id": 102,
        "start_date": "2024-09-01",
        "end_date": "2025-09-01",
        "rent_amount": 22000.00,
        "status": "active",
        "deposit_amount": 22000.00,
        "terms": "12-month lease agreement",
        "created_at": "2024-09-01T10:00:00",
        "updated_at": "2024-09-01T10:00:00"
    }
}

tenant_notifications_db = {
    1: {
        "notification_id": 1,
        "tenant_id": 1,
        "type": "rent_reminder",
        "title": "Rent Payment Reminder",
        "message": "Your rent for February 2025 is due on 2025-02-01",
        "created_at": "2025-01-25T08:00:00",
        "read": False
    },
    2: {
        "notification_id": 2,
        "tenant_id": 1,
        "type": "maintenance_update",
        "title": "Maintenance Update",
        "message": "Your maintenance request for leaking tap has been assigned",
        "created_at": "2025-01-20T14:30:00",
        "read": True
    },
    3: {
        "notification_id": 3,
        "tenant_id": 1,
        "type": "general_notice",
        "title": "Building Notice",
        "message": "Water will be shut down for maintenance on 2025-02-05 from 9am-3pm",
        "created_at": "2025-01-18T10:00:00",
        "read": True
    },
    4: {
        "notification_id": 4,
        "tenant_id": 2,
        "type": "rent_reminder",
        "title": "Rent Payment Reminder",
        "message": "Your rent for February 2025 is due on 2025-02-01",
        "created_at": "2025-01-25T08:00:00",
        "read": False
    }
}


def get_tenant_by_user_id(user_id: int) -> Optional[Dict[str, Any]]:
    """
    Get tenant profile by user ID.
    
    Args:
        user_id: User ID from JWT token
    
    Returns:
        Tenant profile or None if not found
    """
    for tenant in tenant_profiles_db.values():
        if tenant["user_id"] == user_id:
            return tenant
    return None


def validate_profile_update(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate profile update data.
    
    Args:
        data: Profile data to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate phone if provided
    if "phone" in data:
        import re
        if not re.match(r"^(\+254|0)[1-9]\d{8}$", data["phone"]):
            return False, "Invalid phone number format"
    
    # Validate emergency contact phone if provided
    if "emergency_phone" in data and data["emergency_phone"]:
        import re
        if not re.match(r"^(\+254|0)[1-9]\d{8}$", data["emergency_phone"]):
            return False, "Invalid emergency contact phone format"
    
    return True, None


def validate_maintenance_request(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate maintenance request data.
    
    Args:
        data: Maintenance request data to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["title", "description"]
    missing = [f for f in required_fields if not data.get(f)]
    
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    
    if len(data["title"]) < 3:
        return False, "Title must be at least 3 characters long"
    
    if len(data["description"]) < 10:
        return False, "Description must be at least 10 characters long"
    
    return True, None


# ==================== DASHBOARD ROUTES ====================

@tenant_bp.route("/dashboard", methods=["GET"])
@tenant_required
def get_dashboard():
    """
    Get tenant dashboard with summary information.
    
    Returns:
        JSON response with dashboard data
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        tenant_id = tenant["tenant_id"]
        
        # Get payment statistics
        tenant_payments = [p for p in tenant_payments_db.values() if p["tenant_id"] == tenant_id]
        total_paid = sum(p["amount"] for p in tenant_payments if p["status"] == PaymentStatus.PAID.value)
        pending_amount = sum(p["amount"] for p in tenant_payments if p["status"] in [PaymentStatus.PENDING.value, PaymentStatus.OVERDUE.value])
        overdue_payments = [p for p in tenant_payments if p["status"] == PaymentStatus.OVERDUE.value]
        
        # Get lease information
        lease = tenant_leases_db.get(tenant_id)
        
        # Get maintenance requests
        maintenance_requests = [m for m in tenant_maintenance_requests_db.values() if m["tenant_id"] == tenant_id]
        pending_maintenance = [m for m in maintenance_requests if m["status"] != "completed"]
        
        # Get unread notifications
        notifications = [n for n in tenant_notifications_db.values() if n["tenant_id"] == tenant_id]
        unread_notifications = [n for n in notifications if not n["read"]]
        
        dashboard = {
            "success": True,
            "dashboard": {
                "welcome": f"Welcome back, {tenant['full_name']}!",
                "room_info": {
                    "room_number": tenant["room_number"],
                    "floor": tenant["floor"],
                    "monthly_rent": lease["rent_amount"] if lease else 0
                },
                "payment_summary": {
                    "total_paid": float(total_paid),
                    "pending_amount": float(pending_amount),
                    "overdue_payments": len(overdue_payments),
                    "next_due_date": lease["end_date"] if lease else None
                },
                "maintenance_summary": {
                    "total_requests": len(maintenance_requests),
                    "pending_requests": len(pending_maintenance),
                    "completed_requests": len([m for m in maintenance_requests if m["status"] == "completed"])
                },
                "notifications": {
                    "unread_count": len(unread_notifications),
                    "total_notifications": len(notifications)
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        }
        
        return jsonify(dashboard), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve dashboard: {str(e)}"
        }), 500


# ==================== PROFILE ROUTES ====================

@tenant_bp.route("/profile", methods=["GET"])
@tenant_required
def get_profile():
    """
    Get tenant's profile information.
    
    Returns:
        JSON response with profile data
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        return jsonify({
            "success": True,
            "profile": tenant
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve profile: {str(e)}"
        }), 500


@tenant_bp.route("/profile/update", methods=["PUT"])
@tenant_required
def update_profile():
    """
    Update tenant's profile information.
    
    Request body:
    {
        "phone": "+254712345678",
        "occupation": "Senior Engineer",
        "emergency_contact": "Jane Doe",
        "emergency_phone": "+254712345679"
    }
    
    Returns:
        JSON response with updated profile
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        data = request.get_json()
        
        # Validate update data
        is_valid, error_msg = validate_profile_update(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Update allowed fields (tenant cannot change name, email, or ID)
        allowed_fields = ["phone", "occupation", "emergency_contact", "emergency_phone"]
        
        for field in allowed_fields:
            if field in data and data[field]:
                tenant[field] = data[field].strip() if isinstance(data[field], str) else data[field]
        
        tenant["updated_at"] = datetime.utcnow().isoformat()
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "profile": tenant
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to update profile: {str(e)}"
        }), 500


# ==================== PAYMENT ROUTES ====================

@tenant_bp.route("/payments", methods=["GET"])
@tenant_required
def get_payments():
    """
    Get tenant's payment history with pagination.
    
    Query parameters:
        page: Page number (default: 1)
        per_page: Items per page (default: 10)
        status: Filter by status (paid, pending, overdue)
    
    Returns:
        JSON response with payment history
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        status_filter = request.args.get("status", None)
        
        if page < 1 or per_page < 1:
            return jsonify({
                "success": False,
                "error": "Page and per_page must be positive integers"
            }), 400
        
        # Get tenant's payments
        tenant_id = tenant["tenant_id"]
        payments = [p for p in tenant_payments_db.values() if p["tenant_id"] == tenant_id]
        
        # Filter by status if provided
        if status_filter:
            payments = [p for p in payments if p["status"] == status_filter]
        
        # Sort by date (newest first)
        payments.sort(key=lambda x: x["due_date"], reverse=True)
        
        total_payments = len(payments)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_payments = payments[start:end]
        
        total_pages = (total_payments + per_page - 1) // per_page
        
        # Calculate summary
        total_paid = sum(p["amount"] for p in payments if p["status"] == PaymentStatus.PAID.value)
        total_pending = sum(p["amount"] for p in payments if p["status"] in [PaymentStatus.PENDING.value, PaymentStatus.OVERDUE.value])
        
        return jsonify({
            "success": True,
            "payments": paginated_payments,
            "summary": {
                "total_paid": float(total_paid),
                "total_pending": float(total_pending),
                "total_transactions": total_payments
            },
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_payments,
                "total_pages": total_pages
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve payments: {str(e)}"
        }), 500


@tenant_bp.route("/payments/mpesa", methods=["POST"])
@tenant_required
def initiate_mpesa_payment():
    """
    Initiate M-Pesa STK push for rent payment.
    
    Request body:
    {
        "amount": 25000,
        "phone": "+254712345678",
        "payment_month": "February 2025"
    }
    
    Returns:
        JSON response with payment initiation status
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get("amount") or not data.get("phone"):
            return jsonify({
                "success": False,
                "error": "Amount and phone number are required"
            }), 400
        
        try:
            amount = float(data["amount"])
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "Invalid amount"
            }), 400
        
        if amount <= 0:
            return jsonify({
                "success": False,
                "error": "Amount must be greater than zero"
            }), 400
        
        # Get tenant lease for reference
        lease = tenant_leases_db.get(tenant["tenant_id"])
        
        if not lease:
            return jsonify({
                "success": False,
                "error": "No active lease found"
            }), 404
        
        # Use payment service to initiate M-Pesa STK push
        # In production, this would call actual M-Pesa API
        result = {
            "success": True,
            "message": "M-Pesa payment initiated",
            "stk_push": {
                "checkout_request_id": f"ws_CO_{datetime.utcnow().timestamp()}",
                "response_code": "0",
                "response_description": "Success. Request accepted for processing",
                "customer_message": "Enter your M-Pesa PIN to complete this transaction"
            },
            "payment_details": {
                "amount": amount,
                "phone": data["phone"],
                "tenant_id": tenant["tenant_id"],
                "room_id": tenant["room_id"],
                "payment_month": data.get("payment_month", "Current Month"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to initiate payment: {str(e)}"
        }), 500


# ==================== MAINTENANCE ROUTES ====================

@tenant_bp.route("/maintenance/request", methods=["POST"])
@tenant_required
def submit_maintenance_request():
    """
    Submit a new maintenance request.
    
    Request body:
    {
        "title": "Leaking tap",
        "description": "The bathroom tap is leaking constantly",
        "category": "plumbing",
        "priority": "high"
    }
    
    Returns:
        JSON response with created request
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        data = request.get_json()
        
        # Validate maintenance request
        is_valid, error_msg = validate_maintenance_request(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Generate request ID
        request_id = max(tenant_maintenance_requests_db.keys()) + 1 if tenant_maintenance_requests_db else 1
        
        maintenance_request = {
            "request_id": request_id,
            "tenant_id": tenant["tenant_id"],
            "room_id": tenant["room_id"],
            "title": data["title"].strip(),
            "description": data["description"].strip(),
            "status": "pending",
            "priority": data.get("priority", "medium").lower(),
            "category": data.get("category", "general").lower(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "assigned_to": None,
            "completion_date": None,
            "notes": ""
        }
        
        tenant_maintenance_requests_db[request_id] = maintenance_request
        
        return jsonify({
            "success": True,
            "message": "Maintenance request submitted successfully",
            "request": maintenance_request
        }), 201
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to submit maintenance request: {str(e)}"
        }), 500


@tenant_bp.route("/maintenance", methods=["GET"])
@tenant_required
def get_maintenance_requests():
    """
    Get tenant's maintenance requests.
    
    Query parameters:
        status: Filter by status (pending, in_progress, completed, cancelled)
    
    Returns:
        JSON response with maintenance requests
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        status_filter = request.args.get("status", None)
        tenant_id = tenant["tenant_id"]
        
        # Get tenant's maintenance requests
        requests = [r for r in tenant_maintenance_requests_db.values() if r["tenant_id"] == tenant_id]
        
        # Filter by status if provided
        if status_filter:
            requests = [r for r in requests if r["status"] == status_filter]
        
        # Sort by creation date (newest first)
        requests.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Categorize requests
        pending = [r for r in requests if r["status"] == "pending"]
        in_progress = [r for r in requests if r["status"] == "in_progress"]
        completed = [r for r in requests if r["status"] == "completed"]
        
        return jsonify({
            "success": True,
            "maintenance_requests": requests,
            "summary": {
                "total_requests": len(requests),
                "pending": len(pending),
                "in_progress": len(in_progress),
                "completed": len(completed)
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve maintenance requests: {str(e)}"
        }), 500


# ==================== LEASE ROUTES ====================

@tenant_bp.route("/lease", methods=["GET"])
@tenant_required
def get_lease():
    """
    Get tenant's lease contract information.
    
    Returns:
        JSON response with lease details
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        lease = tenant_leases_db.get(tenant["tenant_id"])
        
        if not lease:
            return jsonify({
                "success": False,
                "error": "No lease contract found"
            }), 404
        
        # Calculate lease duration and remaining days
        start_date = datetime.fromisoformat(lease["start_date"])
        end_date = datetime.fromisoformat(lease["end_date"])
        today = datetime.now()
        
        total_days = (end_date - start_date).days
        remaining_days = (end_date - today).days
        elapsed_days = (today - start_date).days
        
        lease_info = {
            **lease,
            "lease_duration": {
                "total_days": total_days,
                "elapsed_days": elapsed_days,
                "remaining_days": remaining_days,
                "percentage_completed": round((elapsed_days / total_days * 100) if total_days > 0 else 0, 2)
            }
        }
        
        return jsonify({
            "success": True,
            "lease": lease_info
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve lease: {str(e)}"
        }), 500


# ==================== NOTIFICATION ROUTES ====================

@tenant_bp.route("/notifications", methods=["GET"])
@tenant_required
def get_notifications():
    """
    Get tenant's notifications with pagination.
    
    Query parameters:
        page: Page number (default: 1)
        per_page: Items per page (default: 10)
        read: Filter by read status (true, false)
    
    Returns:
        JSON response with notifications
    """
    try:
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        read_filter = request.args.get("read", None)
        
        if page < 1 or per_page < 1:
            return jsonify({
                "success": False,
                "error": "Page and per_page must be positive integers"
            }), 400
        
        tenant_id = tenant["tenant_id"]
        
        # Get tenant's notifications
        notifications = [n for n in tenant_notifications_db.values() if n["tenant_id"] == tenant_id]
        
        # Filter by read status if provided
        if read_filter is not None:
            read_status = read_filter.lower() == "true"
            notifications = [n for n in notifications if n["read"] == read_status]
        
        # Sort by creation date (newest first)
        notifications.sort(key=lambda x: x["created_at"], reverse=True)
        
        total_notifications = len(notifications)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_notifications = notifications[start:end]
        
        total_pages = (total_notifications + per_page - 1) // per_page
        unread_count = len([n for n in notifications if not n["read"]])
        
        return jsonify({
            "success": True,
            "notifications": paginated_notifications,
            "summary": {
                "total_notifications": total_notifications,
                "unread_count": unread_count,
                "read_count": total_notifications - unread_count
            },
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_notifications,
                "total_pages": total_pages
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve notifications: {str(e)}"
        }), 500


@tenant_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@tenant_required
def mark_notification_read(notification_id: int):
    """
    Mark a notification as read.
    
    URL parameters:
        notification_id: ID of notification to mark as read
    
    Returns:
        JSON response confirming update
    """
    try:
        # Step 1: Retrieve the current tenant profile
        tenant = get_tenant_by_user_id(request.user_id)
        
        if not tenant:
            # Handle case where authenticated user doesn't have a tenant profile
            return jsonify({
                "success": False,
                "error": "Tenant profile not found"
            }), 404
            
        current_tenant_id = tenant["tenant_id"]

        # Step 2: Retrieve the specific notification
        notification = tenant_notifications_db.get(notification_id)
        
        if not notification:
            return jsonify({
                "success": False,
                "error": "Notification not found"
            }), 404
        
        # Step 3: Verify notification belongs to the current tenant (Authorization check)
        # We use the pre-fetched current_tenant_id for a cleaner and more stable comparison.
        if notification["tenant_id"] != current_tenant_id:
            return jsonify({
                "success": False,
                "error": "Unauthorized: Cannot access this notification"
            }), 403
        
        # Step 4: Mark as read
        notification["read"] = True
        
        return jsonify({
            "success": True,
            "message": "Notification marked as read",
            "notification": notification
        }), 200
    
    except Exception as e:
        # Generic error handling
        return jsonify({
            "success": False,
            "error": f"Failed to update notification: {str(e)}"
        }), 500

# ==================== LOGOUT ROUTE ====================

@tenant_bp.route("/logout", methods=["POST"])
@tenant_required
def logout():
    """
    Log out tenant by blacklisting their token.
    
    Returns:
        JSON response confirming logout
    """
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.split(" ")[1] if " " in auth_header else None
        
        if token:
            # In production, add token to blacklist in a service
            # blacklist_service.add_token(token)
            pass
        
        tenant = get_tenant_by_user_id(request.user_id)
        
        return jsonify({
            "success": True,
            "message": f"Logged out successfully. Goodbye, {tenant['full_name'] if tenant else 'User'}!"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Logout failed: {str(e)}"
        }), 500
=======
from flask import Blueprint, jsonify, request

# Create the tenant blueprint
tenant_bp = Blueprint('tenant_bp', __name__)

# Example: Get all tenants
@tenant_bp.route('/tenants', methods=['GET'])
def get_tenants():
    tenants = [
        {"id": 1, "name": "Alice", "room_number": "A1", "phone": "0711111111"},
        {"id": 2, "name": "Bob", "room_number": "B2", "phone": "0722222222"}
    ]
    return jsonify(tenants), 200

# Example: Add a tenant
@tenant_bp.route('/tenants', methods=['POST'])
def add_tenant():
    data = request.get_json()
    name = data.get('name')
    room_number = data.get('room_number')
    phone = data.get('phone')

    if not name or not room_number or not phone:
        return jsonify({"error": "All fields are required"}), 400

    new_tenant = {
        "id": 3,
        "name": name,
        "room_number": room_number,
        "phone": phone
    }
    return jsonify({"message": "Tenant added successfully", "tenant": new_tenant}), 201
>>>>>>> main
