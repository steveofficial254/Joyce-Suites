from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime, timezone
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
from models.booking_inquiry import BookingInquiry
from utils.finance import calculate_outstanding_balance

caretaker_bp = Blueprint("caretaker", __name__, url_prefix="/api/caretaker")


def caretaker_required(f):
    """Decorator to require caretaker or admin role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        if request.user_role not in ["caretaker", "admin"]:
            return jsonify({
                "success": False,
                "error": "Forbidden: Caretaker access required"
            }), 403
        return f(*args, **kwargs)
    return decorated


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

        occupied_properties = Property.query.filter_by(status="occupied").count()
        reserved_properties = Property.query.filter_by(status="reserved").count()
        vacant_properties = Property.query.filter_by(status="vacant").count()
        total_properties = Property.query.count()

        return jsonify({
            "success": True,
            "overview": {
                "pending_maintenance": pending_maintenance,
                "in_progress_maintenance": in_progress_maintenance,
                "completed_today": completed_today,
                "vacant_properties": vacant_properties,
                "reserved_properties": reserved_properties,
                "occupied_properties": occupied_properties,
                "total_properties": total_properties
            }
        }), 200

    except Exception as e:
        print(f"Error in get_overview: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/maintenance/create", methods=["POST"])
@caretaker_required
def create_maintenance_request():
    """Create a new maintenance request."""
    try:
        data = request.get_json()

        for field in ["property_id", "title", "description", "priority"]:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400

        prop = db.session.get(Property, data["property_id"])
        if not prop:
            return jsonify({"success": False, "error": "Property not found"}), 404

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


@caretaker_bp.route("/maintenance", methods=["GET"])
@caretaker_required
def get_maintenance_requests():
    try:
        status = request.args.get("status")
        priority = request.args.get("priority")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        # Eagerly load related data
        query = MaintenanceRequest.query.options(
            db.joinedload(MaintenanceRequest.property),
            db.joinedload(MaintenanceRequest.reported_by),
            db.joinedload(MaintenanceRequest.assigned_to)
        )
        
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
        maintenance = db.session.get(MaintenanceRequest, req_id)
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


@caretaker_bp.route("/rooms/available", methods=["GET"])
@caretaker_required
def get_available_rooms():
    """Get all available (vacant) rooms."""
    try:
        occupied_property_ids = [lease.property_id for lease in Lease.query.filter_by(status="active").all()]
        
        vacant_properties = Property.query.filter(
            ~Property.id.in_(occupied_property_ids),
            Property.status == "vacant"
        ).all()
        
        rooms = []
        for prop in vacant_properties:
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
        active_leases = Lease.query.filter_by(status="active").all()
        rooms = []

        for lease in active_leases:
            prop = lease.property
            if not prop:
                continue
            
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
            is_occupied = prop.id in occupied_property_ids
            
            rent_amount = float(prop.rent_amount) if prop.rent_amount else 0.0
            
            if is_occupied:
                actual_status = "occupied"
            else:
                actual_status = prop.status
            
            room_data = {
                "id": prop.id,
                "name": prop.name,
                "property_type": prop.property_type,
                "rent_amount": rent_amount,
                "status": actual_status,
                "description": prop.description,
                "tenant_name": None,
                "tenant_phone": None,
                "lease_id": None
            }

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


@caretaker_bp.route("/rooms/create-test", methods=["GET"])
def create_test_properties():
    """Create test properties for debugging."""
    try:
        # Check if properties already exist
        existing_props = Property.query.count()
        if existing_props > 0:
            return jsonify({
                "success": True,
                "message": f"Properties already exist: {existing_props}",
                "existing_count": existing_props
            }), 200
        
        # Get or create a default landlord (admin user)
        from models.user import User
        admin_user = User.query.filter_by(role="admin").first()
        if not admin_user:
            # Create a default admin user if none exists
            admin_user = User(
                email="admin@joycesuites.com",
                full_name="Admin User",
                role="admin",
                is_active=True
            )
            admin_user.set_password("admin123")
            db.session.add(admin_user)
            db.session.commit()
        
        # Create test properties
        test_properties = [
            {
                "name": "Cozy Bedsitter A1",
                "property_type": "bedsitter",
                "description": "Modern bedsitter with all amenities",
                "rent_amount": 8000,
                "deposit_amount": 8000,
                "status": "vacant"
            },
            {
                "name": "Spacious One Bedroom B2",
                "property_type": "one_bedroom",
                "description": "Large one bedroom with separate living area",
                "rent_amount": 15000,
                "deposit_amount": 15000,
                "status": "vacant"
            },
            {
                "name": "Deluxe One Bedroom C3",
                "property_type": "one_bedroom",
                "description": "Premium one bedroom with modern finishes",
                "rent_amount": 18000,
                "deposit_amount": 18000,
                "status": "vacant"
            }
        ]
        
        created_props = []
        for prop_data in test_properties:
            prop = Property(
                name=prop_data["name"],
                property_type=prop_data["property_type"],
                description=prop_data["description"],
                rent_amount=prop_data["rent_amount"],
                deposit_amount=prop_data["deposit_amount"],
                status=prop_data["status"],
                landlord_id=admin_user.id
            )
            db.session.add(prop)
            created_props.append(prop)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": f"Created {len(created_props)} test properties",
            "properties": [
                {
                    "id": prop.id,
                    "name": prop.name,
                    "type": prop.property_type,
                    "status": prop.status,
                    "rent": prop.rent_amount,
                    "landlord_id": prop.landlord_id
                } for prop in created_props
            ]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/rooms/debug", methods=["GET"])
def debug_rooms():
    """Debug endpoint to see database state."""
    try:
        # Get all properties
        all_properties = Property.query.all()
        properties_data = []
        for prop in all_properties:
            properties_data.append({
                "id": prop.id,
                "name": prop.name,
                "status": prop.status,
                "property_type": prop.property_type,
                "rent_amount": float(prop.rent_amount) if prop.rent_amount else 0.0
            })
        
        # Get active leases
        active_leases = Lease.query.filter_by(status="active").all()
        leases_data = []
        for lease in active_leases:
            leases_data.append({
                "id": lease.id,
                "property_id": lease.property_id,
                "status": lease.status,
                "end_date": lease.end_date.strftime("%Y-%m-%d") if lease.end_date else None
            })
        
        return jsonify({
            "success": True,
            "total_properties": len(properties_data),
            "properties": properties_data,
            "active_leases": len(leases_data),
            "leases": leases_data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/rooms/public", methods=["GET", "OPTIONS"])
def get_public_rooms():
    """Public endpoint for tenant registration."""
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        response = current_app.make_default_options_response()
        origin = request.headers.get('Origin')
        if origin in ["https://joyce-suites.vercel.app", "https://joyce-suites-jcfw.vercel.app", "https://joyce-suites-git-main-steves-projects-d95e3bef.vercel.app"]:
            response.headers.set('Access-Control-Allow-Origin', origin)
            response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'content-type, Content-Type, Authorization, X-Requested-With, Accept, Origin')
            response.headers.set('Access-Control-Allow-Credentials', 'true')
        else:
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'content-type, Content-Type, Authorization, X-Requested-With, Accept, Origin')
        return response
    
    try:
        print("🔍 Debug: Starting get_public_rooms")
        
        # Get all properties first
        all_properties = Property.query.all()
        print(f"📊 Debug: Total properties in DB: {len(all_properties)}")
        
        properties_debug = []
        for prop in all_properties:
            prop_data = {
                "id": prop.id,
                "name": prop.name,
                "status": prop.status,
                "property_type": prop.property_type,
                "rent_amount": float(prop.rent_amount) if prop.rent_amount else 0.0
            }
            properties_debug.append(prop_data)
            print(f"  - ID: {prop.id}, Name: {prop.name}, Status: {prop.status}")
        
        # Get active leases
        active_leases = Lease.query.filter_by(status="active").all()
        print(f"📋 Debug: Active leases: {len(active_leases)}")
        
        leases_debug = []
        for lease in active_leases:
            lease_data = {
                "id": lease.id,
                "property_id": lease.property_id,
                "status": lease.status,
                "end_date": lease.end_date.strftime("%Y-%m-%d") if lease.end_date else None
            }
            leases_debug.append(lease_data)
            print(f"  - Property ID: {lease.property_id}, Status: {lease.status}")
        
        occupied_property_ids = [lease.property_id for lease in Lease.query.filter_by(status="active").all()]
        print(f"🚫 Debug: Occupied property IDs: {occupied_property_ids}")
        
        vacant_properties = Property.query.filter(
            ~Property.id.in_(occupied_property_ids),
            Property.status == "vacant"
        ).all()
        
        print(f"✅ Debug: Vacant properties found: {len(vacant_properties)}")
        for prop in vacant_properties:
            print(f"  - ID: {prop.id}, Name: {prop.name}, Status: {prop.status}")

        rooms = []
        for prop in vacant_properties:
            rent_amount = float(prop.rent_amount) if prop.rent_amount else 0.0
            
            rooms.append({
                "id": prop.id,
                "name": prop.name,
                "property_type": prop.property_type,  # FIXED: was 'type'
                "rent_amount": rent_amount,
                "description": prop.description,
                "images": [{"image_url": img.image_url, "is_primary": img.is_primary} for img in prop.images]
            })

        next_available_date = None
        if len(rooms) == 0:
            nearest_lease = Lease.query.filter_by(status="active").order_by(Lease.end_date.asc()).first()
            if nearest_lease and nearest_lease.end_date:
                 next_available_date = nearest_lease.end_date.strftime("%B %d, %Y")

        result = {
            "success": True,
            "rooms": rooms,
            "total": len(rooms),
            "next_available_date": next_available_date,
            "debug": {
                "total_properties": len(all_properties),
                "properties": properties_debug,
                "active_leases": len(active_leases),
                "leases": leases_debug,
                "occupied_property_ids": occupied_property_ids,
                "vacant_properties_count": len(vacant_properties)
            }
        }
        print(f"🎯 Debug: Final result: {result}")
        return jsonify(result), 200

    except Exception as e:
        print(f"❌ Error in get_public_rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@caretaker_bp.route("/payments/pending", methods=["GET"])
@caretaker_required
def get_pending_payments():
    """Get tenants with pending/unpaid payments (legacy endpoint)."""
    try:
        active_leases = Lease.query.filter_by(status="active").all()
        tenants_with_arrears = []

        for lease in active_leases:
            pending = Payment.query.filter(
                Payment.lease_id == lease.id,
                Payment.status.in_(['pending', 'unpaid'])
            ).count()

            if pending > 0:
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
        today = datetime.now()
        if today.day < 5:
            current_month_start = (today.replace(day=1) - relativedelta(days=1)).replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        else:
            current_month_start = today.replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        
        next_month_start = current_month_start + relativedelta(months=1)
        
        print(f"Payment period: {current_month_start} to {next_month_start}")
        
        active_leases = Lease.query.filter_by(status="active").all()
        print(f"Found {len(active_leases)} active leases")
        
        tenants_data = []

        for lease in active_leases:
            try:
                if not lease.tenant:
                    print(f"Lease {lease.id} has no tenant, skipping")
                    continue
                
                print(f"Processing lease {lease.id} for tenant {lease.tenant.full_name}")
                    
                current_month_payment = Payment.query.filter(
                    Payment.lease_id == lease.id,
                    Payment.created_at >= current_month_start,
                    Payment.created_at < next_month_start
                ).first()
                
                if not current_month_payment:
                    current_month_payment = Payment.query.filter(
                        Payment.lease_id == lease.id,
                        Payment.payment_date >= current_month_start,
                        Payment.payment_date < next_month_start
                    ).first()
                
                last_payment = Payment.query.filter_by(
                    lease_id=lease.id,
                    status="paid"
                ).order_by(Payment.payment_date.desc()).first()
                
                is_paid = False
                if current_month_payment:
                    is_paid = current_month_payment.status == "paid"
                    print(f"Current month payment found: {current_month_payment.id}, status: {is_paid}")
                else:
                    print(f"No payment found for current month")
                
                try:
                    rent_amount = float(lease.rent_amount) if lease.rent_amount else 0.0
                except (TypeError, ValueError) as e:
                    print(f"Error converting rent_amount: {e}")
                    rent_amount = 0.0
                
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
        
        for field in ["tenant_id", "status", "amount"]:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400
        
        if data["status"] not in ["paid", "unpaid"]:
            return jsonify({"success": False, "error": "Status must be 'paid' or 'unpaid'"}), 400
        
        lease = Lease.query.filter_by(
            tenant_id=data["tenant_id"],
            status="active"
        ).first()
        
        if not lease:
            return jsonify({"success": False, "error": "No active lease found for tenant"}), 404
        
        today = datetime.now()
        if today.day < 5:
            current_month_start = (today.replace(day=1) - relativedelta(days=1)).replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        else:
            current_month_start = today.replace(day=5, hour=0, minute=0, second=0, microsecond=0)
        
        next_month_start = current_month_start + relativedelta(months=1)
        
        existing_payment = Payment.query.filter(
            Payment.lease_id == lease.id,
            Payment.created_at >= current_month_start,
            Payment.created_at < next_month_start
        ).first()
        
        try:
            amount = float(data["amount"])
        except (TypeError, ValueError) as e:
            return jsonify({"success": False, "error": f"Invalid amount: {str(e)}"}), 400
        
        if existing_payment:
            print(f"Updating existing payment {existing_payment.id}")
            existing_payment.status = data["status"]
            if data["status"] == "paid":
                existing_payment.payment_date = datetime.now()
                existing_payment.amount_paid = amount
                existing_payment.payment_method = "manual"
            else:
                existing_payment.payment_date = None
                existing_payment.amount_paid = 0
                existing_payment.payment_method = None
            
            db.session.commit()
            payment_result = existing_payment
        else:
            print(f"Creating new payment record")
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


@caretaker_bp.route("/financial-summary", methods=["GET"])
@caretaker_required
def get_financial_summary():
    """Get comprehensive financial summary for caretaker dashboard"""
    try:
        from models.rent_deposit import RentRecord, DepositRecord, RentStatus, DepositStatus
        from models.water_bill import WaterBill, WaterBillStatus
        from datetime import datetime, timedelta
        
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Rent Statistics
        total_rent_records = RentRecord.query.count()
        paid_rent = RentRecord.query.filter_by(status=RentStatus.PAID.value).count()
        unpaid_rent = RentRecord.query.filter_by(status=RentStatus.UNPAID.value).count()
        overdue_rent = RentRecord.query.filter_by(status=RentStatus.OVERDUE.value).count()
        
        # Current month rent
        current_month_rent = RentRecord.query.filter(
            RentRecord.month == current_month,
            RentRecord.year == current_year
        ).all()
        
        current_month_paid = sum(float(r.amount_paid or 0) for r in current_month_rent)
        current_month_due = sum(float(r.amount_due or 0) for r in current_month_rent)
        current_month_balance = sum(float(r.balance or 0) for r in current_month_rent)
        
        # Deposit Statistics
        total_deposits = DepositRecord.query.count()
        paid_deposits = DepositRecord.query.filter_by(status=DepositStatus.PAID.value).count()
        pending_deposits = DepositRecord.query.filter_by(status=DepositStatus.UNPAID.value).count()
        refunded_deposits = DepositRecord.query.filter_by(status=DepositStatus.REFUNDED.value).count()
        
        total_deposit_amount = sum(float(d.amount_required or 0) for d in DepositRecord.query.all())
        total_deposit_paid = sum(float(d.amount_paid or 0) for d in DepositRecord.query.all())
        
        # Water Bill Statistics
        total_water_bills = WaterBill.query.count()
        paid_water_bills = WaterBill.query.filter_by(status=WaterBillStatus.PAID.value).count()
        unpaid_water_bills = WaterBill.query.filter_by(status=WaterBillStatus.UNPAID.value).count()
        overdue_water_bills = WaterBill.query.filter_by(status=WaterBillStatus.OVERDUE.value).count()
        
        total_water_amount = sum(float(w.amount_due or 0) for w in WaterBill.query.all())
        total_water_paid = sum(float(w.amount_paid or 0) for w in WaterBill.query.all())
        
        # Overall Financial Summary
        total_expected_revenue = current_month_due + total_deposit_amount + total_water_amount
        total_actual_revenue = current_month_paid + total_deposit_paid + total_water_paid
        total_outstanding = total_expected_revenue - total_actual_revenue
        
        return jsonify({
            "success": True,
            "summary": {
                "rent": {
                    "total_records": total_rent_records,
                    "paid": paid_rent,
                    "unpaid": unpaid_rent,
                    "overdue": overdue_rent,
                    "current_month": {
                        "paid": current_month_paid,
                        "due": current_month_due,
                        "balance": current_month_balance
                    }
                },
                "deposits": {
                    "total_records": total_deposits,
                    "paid": paid_deposits,
                    "pending": pending_deposits,
                    "refunded": refunded_deposits,
                    "total_amount": total_deposit_amount,
                    "total_paid": total_deposit_paid
                },
                "water_bills": {
                    "total_records": total_water_bills,
                    "paid": paid_water_bills,
                    "unpaid": unpaid_water_bills,
                    "overdue": overdue_water_bills,
                    "total_amount": total_water_amount,
                    "total_paid": total_water_paid
                },
                "overall": {
                    "total_expected_revenue": total_expected_revenue,
                    "total_actual_revenue": total_actual_revenue,
                    "total_outstanding": total_outstanding,
                    "collection_rate": (total_actual_revenue / total_expected_revenue * 100) if total_expected_revenue > 0 else 0
                }
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Financial summary error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch financial summary",
            "message": str(e)
        }), 500


@caretaker_bp.route("/notifications/send-bulk", methods=["POST"])
@token_required
def send_bulk_notifications():
    """Send notifications to multiple tenants"""
    try:
        data = request.get_json()
        recipient_ids = data.get("recipient_ids", [])
        title = data.get("title", "")
        message = data.get("message", "")
        notification_type = data.get("type", "general")

        if not recipient_ids or not title or not message:
            return jsonify({
                "success": False,
                "error": "Recipients, title, and message are required"
            }), 400

        notifications_created = []
        for tenant_id in recipient_ids:
            notification = Notification(
                user_id=tenant_id,
                title=title,
                message=message,
                notification_type=notification_type,
                is_read=False
            )
            db.session.add(notification)
            notifications_created.append({
                "tenant_id": tenant_id,
                "title": title,
                "message": message
            })

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Successfully sent {len(notifications_created)} notifications",
            "notifications": notifications_created
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Failed to send notifications: {str(e)}"
        }), 500


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
                "outstanding_balance": calculate_outstanding_balance(lease),
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

        for field in ["lease_id", "vacate_date"]:
            if field not in data:
                return jsonify({"success": False, "error": f"{field} is required"}), 400

        lease = db.session.get(Lease, data["lease_id"])
        if not lease:
            return jsonify({"success": False, "error": "Lease not found"}), 404

        try:
            vacate_date = datetime.fromisoformat(data["vacate_date"]).date()
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Invalid vacate_date format (use YYYY-MM-DD)"}), 400

        existing = VacateNotice.query.filter_by(
            lease_id=data["lease_id"],
            status="pending"
        ).first()
        
        if existing:
            return jsonify({
                "success": False,
                "error": "A pending vacate notice already exists for this lease"
            }), 400

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
        notice = db.session.get(VacateNotice, notice_id)
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
        notice = db.session.get(VacateNotice, notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        data = request.get_json()

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
        notice = db.session.get(VacateNotice, notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        data = request.get_json() or {}
        
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
        notice = db.session.get(VacateNotice, notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        data = request.get_json() or {}
        
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
        notice = db.session.get(VacateNotice, notice_id)
        if not notice:
            return jsonify({"success": False, "error": "Vacate notice not found"}), 404

        if notice.status != "approved":
            return jsonify({
                "success": False,
                "error": "Only approved notices can be completed"
            }), 400

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
        notice = db.session.get(VacateNotice, notice_id)
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

@caretaker_bp.route("/inquiries", methods=["GET"])
@caretaker_required
def get_booking_inquiries():
    """Get all booking inquiries."""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status", "pending")
        
        query = BookingInquiry.query
        if status:
            query = query.filter_by(status=status)
            
        pagination = query.order_by(BookingInquiry.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            "success": True,
            "inquiries": [i.to_dict() for i in pagination.items],
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": page
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@caretaker_bp.route("/inquiries/<int:inquiry_id>/approve", methods=["POST"])
@caretaker_required
def approve_inquiry(inquiry_id):
    """Approve a booking inquiry and reserve the room."""
    try:
        inquiry = db.session.get(BookingInquiry, inquiry_id)
        if not inquiry:
            return jsonify({"success": False, "error": "Inquiry not found"}), 404
            
        inquiry.status = "approved"
        inquiry.approved_by = request.user_id
        
        if inquiry.room_id:
            room = db.session.get(Property, inquiry.room_id)
            if room:
                room.status = "reserved"
        
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "Booking inquiry approved and room reserved.",
            "inquiry": inquiry.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@caretaker_bp.route("/inquiries/<int:inquiry_id>/reject", methods=["POST"])
@caretaker_required
def reject_inquiry(inquiry_id):
    """Reject a booking inquiry."""
    try:
        inquiry = db.session.get(BookingInquiry, inquiry_id)
        if not inquiry:
            return jsonify({"success": False, "error": "Inquiry not found"}), 404
            
        inquiry.status = "rejected"
        inquiry.approved_by = request.user_id
        
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "Booking inquiry rejected.",
            "inquiry": inquiry.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@caretaker_bp.route("/inquiries/<int:inquiry_id>/mark-paid", methods=["POST"])
@caretaker_required
def mark_inquiry_paid(inquiry_id):
    """Mark a booking inquiry as paid."""
    try:
        inquiry = db.session.get(BookingInquiry, inquiry_id)
        if not inquiry:
            return jsonify({"success": False, "error": "Inquiry not found"}), 404
            
        inquiry.status = "paid"
        inquiry.is_paid = True
        inquiry.paid_at = datetime.now(timezone.utc)
        inquiry.approved_by = request.user_id
        
        if inquiry.room_id:
            room = db.session.get(Property, inquiry.room_id)
            if room:
                room.status = "reserved"
        
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "Booking inquiry marked as paid. Tenant can now proceed to registration.",
            "inquiry": inquiry.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500