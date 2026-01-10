from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
from dateutil.relativedelta import relativedelta

from models.base import db
from models.user import User
from models.maintenance import MaintenanceRequest
from models.notification import Notification
from models.payment import Payment
from models.lease import Lease
from models.property import Property
from routes.auth_routes import token_required
from models.vacate_notice import VacateNotice

caretaker_bp = Blueprint("caretaker", __name__, url_prefix="/api/caretaker")


# =========================
# ROLE PROTECTION DECORATOR - MUST BE FIRST
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
# OVERVIEW (NEW - REPLACES DASHBOARD)
# =========================
@caretaker_bp.route("/overview", methods=["GET"])
@caretaker_required
def get_overview():
    """Get caretaker dashboard overview."""
    try:
        pending_maintenance = MaintenanceRequest.query.filter_by(status="pending").count()
        in_progress_maintenance = MaintenanceRequest.query.filter_by(status="in_progress").count()
        completed_today = MaintenanceRequest.query.filter(
            MaintenanceRequest.status == "completed",
            MaintenanceRequest.updated_at >= datetime.now().date()
        ).count()

        # Count based on active leases, not property status
        occupied_properties = Lease.query.filter_by(status="active").count()
        total_properties = Property.query.count()
        vacant_properties = total_properties - occupied_properties

        return jsonify({
            "success": True,
            "overview": {
                "pending_maintenance": pending_maintenance,
                "in_progress_maintenance": in_progress_maintenance,
                "completed_today": completed_today,
                "vacant_properties": vacant_properties,
                "occupied_properties": occupied_properties,
                "total_properties": total_properties
            }
        }), 200

    except Exception as e:
        print(f"Error in get_overview: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# MAINTENANCE - CREATE (NEW)
# =========================
@caretaker_bp.route("/maintenance/create", methods=["POST"])
@caretaker_required
def create_maintenance_request():
    """Create a new maintenance request."""
    try:
        data = request.get_json()

        # Validate required fields
        for field in ["property_id", "title", "description", "priority"]:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400

        # Check if property exists
        prop = Property.query.get(data["property_id"])
        if not prop:
            return jsonify({"success": False, "error": "Property not found"}), 404

        # Create new maintenance request
        maintenance = MaintenanceRequest(
            property_id=data["property_id"],
            title=data["title"],
            description=data["description"],
            priority=data.get("priority", "normal"),
            status="pending"
        )

        db.session.add(maintenance)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Maintenance request created successfully",
            "request": maintenance.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error in create_maintenance_request: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# DASHBOARD (LEGACY - KEPT FOR BACKWARD COMPATIBILITY)
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

        # Count based on active leases, not property status
        occupied_properties = Lease.query.filter_by(status="active").count()
        total_properties = Property.query.count()
        vacant_properties = total_properties - occupied_properties

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
        print(f"Error in get_dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# MAINTENANCE - LIST & UPDATE
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
        print(f"Error in get_maintenance_requests: {str(e)}")
        import traceback
        traceback.print_exc()
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
        print(f"Error in update_maintenance_status: {str(e)}")
        import traceback
        traceback.print_exc()
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
        print(f"Error in send_tenant_notification: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# ROOMS ENDPOINTS - MATCH DASHBOARD EXPECTATIONS
# =========================
@caretaker_bp.route("/rooms/available", methods=["GET"])
@caretaker_required
def get_available_rooms():
    """Get all available (vacant) rooms."""
    try:
        # Get all properties that don't have an active lease
        occupied_property_ids = [lease.property_id for lease in Lease.query.filter_by(status="active").all()]
        
        vacant_properties = Property.query.filter(
            ~Property.id.in_(occupied_property_ids)
        ).all()
        
        rooms = []
        for prop in vacant_properties:
            # Convert Decimal to float
            rent_amount = float(prop.rent_amount) if prop.rent_amount else 0.0
            
            rooms.append({
                "id": prop.id,
                "name": prop.name,
                "property_type": prop.property_type,  # FIXED: was 'type'
                "rent_amount": rent_amount,
                "status": "vacant",
                "description": prop.description
            })

        return jsonify({
            "success": True,
            "available_rooms": rooms,
            "total_available": len(rooms)
        }), 200

    except Exception as e:
        print(f"Error in get_available_rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": str(e)
        }), 500


@caretaker_bp.route("/rooms/occupied", methods=["GET"])
@caretaker_required
def get_occupied_rooms():
    """Get all occupied rooms with tenant info."""
    try:
        # Get all active leases instead of relying on property status
        active_leases = Lease.query.filter_by(status="active").all()
        rooms = []

        for lease in active_leases:
            prop = lease.property
            if not prop:
                continue
            
            # Convert Decimal to float
            rent_amount = float(prop.rent_amount) if prop.rent_amount else 0.0
                
            room_data = {
                "id": prop.id,
                "name": prop.name,
                "property_type": prop.property_type,  # FIXED: was 'type'
                "rent_amount": rent_amount,
                "status": "occupied",
                "description": prop.description,
                "tenant_name": lease.tenant.full_name if lease.tenant else None,
                "tenant_phone": lease.tenant.phone_number if lease.tenant else None,
                "lease_id": lease.id
            }

            rooms.append(room_data)

        return jsonify({
            "success": True,
            "occupied_rooms": rooms,
            "total_occupied": len(rooms)
        }), 200

    except Exception as e:
        print(f"Error in get_occupied_rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@caretaker_bp.route("/rooms/all", methods=["GET"])
@caretaker_required
def get_all_rooms():
    """Get all rooms (both vacant and occupied)."""
    try:
        all_properties = Property.query.all()
        occupied_property_ids = [lease.property_id for lease in Lease.query.filter_by(status="active").all()]
        rooms = []

        for prop in all_properties:
            # Determine actual status based on active leases
            is_occupied = prop.id in occupied_property_ids
            
            # Convert Decimal to float
            rent_amount = float(prop.rent_amount) if prop.rent_amount else 0.0
            
            room_data = {
                "id": prop.id,
                "name": prop.name,
                "property_type": prop.property_type,  # FIXED: was 'type'
                "rent_amount": rent_amount,
                "status": "occupied" if is_occupied else "vacant",
                "description": prop.description,
                "tenant_name": None,
                "tenant_phone": None,
                "lease_id": None
            }

            # If occupied, get tenant info
            if is_occupied:
                lease = Lease.query.filter_by(
                    property_id=prop.id,
                    status="active"
                ).first()
                
                if lease and lease.tenant:
                    room_data["tenant_name"] = lease.tenant.full_name
                    room_data["tenant_phone"] = lease.tenant.phone_number
                    room_data["lease_id"] = lease.id

            rooms.append(room_data)

        return jsonify({
            "success": True,
            "rooms": rooms,
            "total": len(rooms)
        }), 200

    except Exception as e:
        print(f"Error in get_all_rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@caretaker_bp.route("/rooms/public", methods=["GET"])
def get_public_rooms():
    """Public endpoint for tenant registration."""
    try:
        # Get all properties that don't have an active lease
        occupied_property_ids = [lease.property_id for lease in Lease.query.filter_by(status="active").all()]
        
        vacant_properties = Property.query.filter(
            ~Property.id.in_(occupied_property_ids)
        ).all()

        rooms = []
        for prop in vacant_properties:
            # Convert Decimal to float
            rent_amount = float(prop.rent_amount) if prop.rent_amount else 0.0
            
            rooms.append({
                "id": prop.id,
                "name": prop.name,
                "property_type": prop.property_type,  # FIXED: was 'type'
                "rent_amount": rent_amount,
                "description": prop.description
            })

        return jsonify({
            "success": True,
            "rooms": rooms,
            "total": len(rooms)
        }), 200

    except Exception as e:
        print(f"Error in get_public_rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# PAYMENTS - ENHANCED
# =========================
@caretaker_bp.route("/payments/pending", methods=["GET"])
@caretaker_required
def get_pending_payments():
    """Get tenants with pending/unpaid payments (legacy endpoint)."""
    try:
        active_leases = Lease.query.filter_by(status="active").all()
        tenants_with_arrears = []

        for lease in active_leases:
            pending = Payment.query.filter_by(
                lease_id=lease.id,
                status="pending"
            ).count()

            if pending > 0:
                # Convert Decimal to float for JSON serialization
                rent_amount = float(lease.rent_amount) if lease.rent_amount else 0.0
                
                tenants_with_arrears.append({
                    "tenant_id": lease.tenant_id,
                    "tenant_name": lease.tenant.full_name if lease.tenant else "Unknown",
                    "room_number": lease.tenant.room_number if lease.tenant else None,
                    "pending_payments": pending,
                    "rent_amount": rent_amount
                })

        return jsonify({
            "success": True,
            "tenants_with_arrears": tenants_with_arrears,
            "total_count": len(tenants_with_arrears)
        }), 200

    except Exception as e:
        print(f"Error in get_pending_payments: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/payments/all-tenants", methods=["GET"])
@caretaker_required
def get_all_tenants_payment_status():
    """Get all tenants with their current month payment status."""
    try:
        # Get current month start (5th of current month)
        today = datetime.now()
        if today.day < 5:
            # If before 5th, use previous month
            current_month_start = (today.replace(day=1) - relativedelta(days=1)).replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        else:
            current_month_start = today.replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        
        # Next month start
        next_month_start = current_month_start + relativedelta(months=1)
        
        print(f"Payment period: {current_month_start} to {next_month_start}")
        
        # Get all active leases
        active_leases = Lease.query.filter_by(status="active").all()
        print(f"Found {len(active_leases)} active leases")
        
        tenants_data = []

        for lease in active_leases:
            try:
                if not lease.tenant:
                    print(f"Lease {lease.id} has no tenant, skipping")
                    continue
                
                print(f"Processing lease {lease.id} for tenant {lease.tenant.full_name}")
                    
                # Check if payment exists for current month using created_at or payment_date
                current_month_payment = Payment.query.filter(
                    Payment.lease_id == lease.id,
                    Payment.created_at >= current_month_start,
                    Payment.created_at < next_month_start
                ).first()
                
                # If no payment by created_at, try payment_date
                if not current_month_payment:
                    current_month_payment = Payment.query.filter(
                        Payment.lease_id == lease.id,
                        Payment.payment_date >= current_month_start,
                        Payment.payment_date < next_month_start
                    ).first()
                
                # Get last successful payment
                last_payment = Payment.query.filter_by(
                    lease_id=lease.id,
                    status="paid"
                ).order_by(Payment.payment_date.desc()).first()
                
                # Determine if current month is paid
                is_paid = False
                if current_month_payment:
                    is_paid = current_month_payment.status == "paid"
                    print(f"Current month payment found: {current_month_payment.id}, status: {is_paid}")
                else:
                    print(f"No payment found for current month")
                
                # Safely convert rent_amount
                try:
                    rent_amount = float(lease.rent_amount) if lease.rent_amount else 0.0
                except (TypeError, ValueError) as e:
                    print(f"Error converting rent_amount: {e}")
                    rent_amount = 0.0
                
                # Safely get last payment date
                last_payment_date = None
                if last_payment and last_payment.payment_date:
                    try:
                        last_payment_date = last_payment.payment_date.isoformat()
                    except Exception as e:
                        print(f"Error converting payment date: {e}")
                        last_payment_date = None
                
                tenant_data = {
                    "tenant_id": lease.tenant_id,
                    "tenant_name": lease.tenant.full_name or "Unknown",
                    "room_number": lease.tenant.room_number or "N/A",
                    "rent_amount": rent_amount,
                    "current_month_paid": is_paid,
                    "last_payment_date": last_payment_date,
                    "lease_id": lease.id
                }
                
                tenants_data.append(tenant_data)
                print(f"Successfully processed tenant {lease.tenant.full_name}")
                
            except Exception as lease_error:
                print(f"Error processing lease {lease.id}: {str(lease_error)}")
                import traceback
                traceback.print_exc()
                continue

        print(f"Returning {len(tenants_data)} tenant records")
        
        return jsonify({
            "success": True,
            "tenants": tenants_data,
            "total": len(tenants_data),
            "current_period": {
                "start": current_month_start.isoformat(),
                "end": next_month_start.isoformat()
            }
        }), 200

    except Exception as e:
        print(f"Error in get_all_tenants_payment_status: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/payments/mark", methods=["POST"])
@caretaker_required
def mark_payment_status():
    """Manually mark a payment as paid or unpaid."""
    try:
        data = request.get_json()
        print(f"Received payment mark request: {data}")
        
        # Validate required fields
        for field in ["tenant_id", "status", "amount"]:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400
        
        if data["status"] not in ["paid", "unpaid"]:
            return jsonify({"success": False, "error": "Status must be 'paid' or 'unpaid'"}), 400
        
        # Get active lease
        lease = Lease.query.filter_by(
            tenant_id=data["tenant_id"],
            status="active"
        ).first()
        
        if not lease:
            return jsonify({"success": False, "error": "No active lease found for tenant"}), 404
        
        print(f"Found lease {lease.id} for tenant {data['tenant_id']}")
        
        # Get current month start (5th of current month)
        today = datetime.now()
        if today.day < 5:
            # If before 5th, use previous month
            current_month_start = (today.replace(day=1) - relativedelta(days=1)).replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        else:
            current_month_start = today.replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        
        # Next month start
        next_month_start = current_month_start + relativedelta(months=1)
        
        print(f"Payment period: {current_month_start} to {next_month_start}")
        
        # Check if payment record exists for current month using created_at
        existing_payment = Payment.query.filter(
            Payment.lease_id == lease.id,
            Payment.created_at >= current_month_start,
            Payment.created_at < next_month_start
        ).first()
        
        # Convert amount to float
        try:
            amount = float(data["amount"])
        except (TypeError, ValueError) as e:
            return jsonify({"success": False, "error": f"Invalid amount: {str(e)}"}), 400
        
        if existing_payment:
            print(f"Updating existing payment {existing_payment.id}")
            # Update existing payment
            existing_payment.status = data["status"]
            if data["status"] == "paid":
                existing_payment.payment_date = datetime.now()
                existing_payment.amount_paid = amount
                existing_payment.payment_method = "manual"
            else:
                # If marking as unpaid, clear payment details
                existing_payment.payment_date = None
                existing_payment.amount_paid = 0
                existing_payment.payment_method = None
            
            db.session.commit()
            payment_result = existing_payment
        else:
            print(f"Creating new payment record")
            # Create new payment record (without due_date field)
            new_payment = Payment(
                tenant_id=lease.tenant_id,
                lease_id=lease.id,
                amount=amount,
                status=data["status"],
                payment_method="manual" if data["status"] == "paid" else None,
                payment_date=datetime.now() if data["status"] == "paid" else None,
                amount_paid=amount if data["status"] == "paid" else 0
            )
            db.session.add(new_payment)
            db.session.commit()
            payment_result = new_payment
        
        print(f"Payment marked as {data['status']} successfully")
        
        # Return a simplified response
        return jsonify({
            "success": True,
            "message": f"Payment marked as {data['status']}",
            "payment": {
                "id": payment_result.id,
                "status": payment_result.status,
                "amount": float(payment_result.amount) if payment_result.amount else 0.0,
                "payment_date": payment_result.payment_date.isoformat() if payment_result.payment_date else None
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in mark_payment_status: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# TENANTS
# =========================
@caretaker_bp.route("/tenants", methods=["GET"])
@caretaker_required
def get_tenants():
    """Get all active tenants."""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 100, type=int)

        tenants_query = User.query.filter_by(role="tenant", is_active=True)
        pagination = tenants_query.paginate(page=page, per_page=per_page, error_out=False)

        tenants = []
        for tenant in pagination.items:
            # Get active lease for room number
            lease = Lease.query.filter_by(
                tenant_id=tenant.id,
                status="active"
            ).first()

            tenants.append({
                "id": tenant.id,
                "name": tenant.full_name,
                "email": tenant.email,
                "phone_number": tenant.phone_number,
                "room_number": tenant.room_number,
                "is_active": tenant.is_active,
                "created_at": tenant.created_at.isoformat() if tenant.created_at else None
            })

        return jsonify({
            "success": True,
            "tenants": tenants,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        print(f"Error in get_tenants: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# =========================
# VACATE NOTICES
# =========================
@caretaker_bp.route("/vacate-notices", methods=["GET"])
@caretaker_required
def get_vacate_notices():
    """Get all vacate notices with optional filtering."""
    try:
        status = request.args.get("status")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        query = VacateNotice.query
        if status:
            query = query.filter_by(status=status)

        pagination = query.order_by(
            VacateNotice.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        notices = []
        for notice in pagination.items:
            lease = notice.lease
            tenant = lease.tenant if lease else None
            prop = lease.property if lease else None
            
            notices.append({
                "id": notice.id,
                "lease_id": notice.lease_id,
                "tenant_id": tenant.id if tenant else None,
                "tenant_name": tenant.full_name if tenant else "Unknown",
                "room_number": tenant.room_number if tenant else None,
                "property_name": prop.name if prop else "Unknown",
                "vacate_date": notice.vacate_date.isoformat() if notice.vacate_date else None,
                "reason": notice.reason,
                "status": notice.status,
                "admin_notes": notice.admin_notes,
                "created_at": notice.created_at.isoformat() if notice.created_at else None,
                "updated_at": notice.updated_at.isoformat() if notice.updated_at else None
            })

        return jsonify({
            "success": True,
            "notices": notices,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        print(f"Error in get_vacate_notices: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices", methods=["POST"])
@caretaker_required
def create_vacate_notice():
    """Create a new vacate notice."""
    try:
        data = request.get_json()

        # Validate required fields
        for field in ["lease_id", "vacate_date"]:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400

        # Check if lease exists
        lease = Lease.query.get(data["lease_id"])
        if not lease:
            return jsonify({"success": False, "error": "Lease not found"}), 404

        # Parse vacate date
        try:
            vacate_date = datetime.fromisoformat(data["vacate_date"]).date()
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Invalid vacate_date format (use YYYY-MM-DD)"}), 400

        # Check if notice already exists for this lease
        existing = VacateNotice.query.filter_by(
            lease_id=data["lease_id"],
            status="pending"
        ).first()
        
        if existing:
            return jsonify({
                "success": False,
                "error": "A pending vacate notice already exists for this lease"
            }), 400

        # Create new vacate notice
        notice = VacateNotice(
            lease_id=data["lease_id"],
            vacate_date=vacate_date,
            reason=data.get("reason"),
            status="pending"
        )

        db.session.add(notice)
        db.session.commit()

        tenant = lease.tenant
        prop = lease.property

        return jsonify({
            "success": True,
            "message": "Vacate notice created successfully",
            "notice": {
                "id": notice.id,
                "lease_id": notice.lease_id,
                "tenant_name": tenant.full_name if tenant else "Unknown",
                "property_name": prop.name if prop else "Unknown",
                "vacate_date": notice.vacate_date.isoformat(),
                "reason": notice.reason,
                "status": notice.status,
                "created_at": notice.created_at.isoformat() if notice.created_at else None
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error in create_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/<int:notice_id>", methods=["GET"])
@caretaker_required
def get_vacate_notice(notice_id):
    """Get a specific vacate notice."""
    try:
        notice = VacateNotice.query.get(notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        lease = notice.lease
        tenant = lease.tenant if lease else None
        prop = lease.property if lease else None

        return jsonify({
            "success": True,
            "notice": {
                "id": notice.id,
                "lease_id": notice.lease_id,
                "tenant_id": tenant.id if tenant else None,
                "tenant_name": tenant.full_name if tenant else "Unknown",
                "tenant_phone": tenant.phone_number if tenant else None,
                "tenant_email": tenant.email if tenant else None,
                "room_number": tenant.room_number if tenant else None,
                "property_name": prop.name if prop else "Unknown",
                "property_id": prop.id if prop else None,
                "vacate_date": notice.vacate_date.isoformat() if notice.vacate_date else None,
                "reason": notice.reason,
                "status": notice.status,
                "admin_notes": notice.admin_notes,
                "created_at": notice.created_at.isoformat() if notice.created_at else None,
                "updated_at": notice.updated_at.isoformat() if notice.updated_at else None
            }
        }), 200

    except Exception as e:
        print(f"Error in get_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/<int:notice_id>", methods=["PUT"])
@caretaker_required
def update_vacate_notice(notice_id):
    """Update a vacate notice."""
    try:
        notice = VacateNotice.query.get(notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        data = request.get_json()

        # Update fields
        if "vacate_date" in data:
            try:
                notice.vacate_date = datetime.fromisoformat(data["vacate_date"]).date()
            except (ValueError, TypeError):
                return jsonify({"success": False, "error": "Invalid vacate_date format (use YYYY-MM-DD)"}), 400

        if "reason" in data:
            notice.reason = data["reason"]

        if "admin_notes" in data:
            notice.admin_notes = data["admin_notes"]

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Vacate notice updated successfully",
            "notice": {
                "id": notice.id,
                "lease_id": notice.lease_id,
                "vacate_date": notice.vacate_date.isoformat(),
                "reason": notice.reason,
                "status": notice.status,
                "admin_notes": notice.admin_notes
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in update_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/<int:notice_id>/approve", methods=["POST"])
@caretaker_required
def approve_vacate_notice(notice_id):
    """Approve a vacate notice."""
    try:
        notice = VacateNotice.query.get(notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        data = request.get_json() or {}
        
        # Approve the notice
        notice.approve(notes=data.get("admin_notes"))

        return jsonify({
            "success": True,
            "message": "Vacate notice approved successfully",
            "notice": {
                "id": notice.id,
                "status": notice.status,
                "admin_notes": notice.admin_notes
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in approve_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/<int:notice_id>/reject", methods=["POST"])
@caretaker_required
def reject_vacate_notice(notice_id):
    """Reject a vacate notice."""
    try:
        notice = VacateNotice.query.get(notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        data = request.get_json() or {}
        
        # Reject the notice
        notice.reject(notes=data.get("admin_notes"))

        return jsonify({
            "success": True,
            "message": "Vacate notice rejected successfully",
            "notice": {
                "id": notice.id,
                "status": notice.status,
                "admin_notes": notice.admin_notes
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in reject_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/<int:notice_id>/complete", methods=["POST"])
@caretaker_required
def complete_vacate_notice(notice_id):
    """Complete a vacate notice (mark as completed and terminate lease)."""
    try:
        notice = VacateNotice.query.get(notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        if notice.status != "approved":
            return jsonify({
                "success": False,
                "error": "Only approved notices can be completed"
            }), 400

        # Complete the notice (this also terminates the lease)
        notice.complete()

        return jsonify({
            "success": True,
            "message": "Vacate notice completed and lease terminated successfully",
            "notice": {
                "id": notice.id,
                "status": notice.status,
                "lease_status": notice.lease.status if notice.lease else "unknown"
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in complete_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/<int:notice_id>", methods=["DELETE"])
@caretaker_required
def delete_vacate_notice(notice_id):
    """Delete a vacate notice (only pending notices can be deleted)."""
    try:
        notice = VacateNotice.query.get(notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        if notice.status != "pending":
            return jsonify({
                "success": False,
                "error": "Only pending notices can be deleted"
            }), 400

        db.session.delete(notice)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Vacate notice deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_vacate_notice: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/vacate-notices/summary", methods=["GET"])
@caretaker_required
def get_vacate_notices_summary():
    """Get summary of vacate notices by status."""
    try:
        total = VacateNotice.query.count()
        pending = VacateNotice.query.filter_by(status="pending").count()
        approved = VacateNotice.query.filter_by(status="approved").count()
        rejected = VacateNotice.query.filter_by(status="rejected").count()
        completed = VacateNotice.query.filter_by(status="completed").count()

        return jsonify({
            "success": True,
            "summary": {
                "total": total,
                "pending": pending,
                "approved": approved,
                "rejected": rejected,
                "completed": completed
            }
        }), 200

    except Exception as e:
        print(f"Error in get_vacate_notices_summary: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500