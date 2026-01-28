from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from datetime import datetime, timedelta, timezone
import base64
import os
import traceback

from models.base import db
from models.user import User
from models.lease import Lease
from models.payment import Payment
from models.maintenance import MaintenanceRequest
from models.notification import Notification
from models.vacate_notice import VacateNotice
from models.property import Property
from routes.auth_routes import token_required
from services.mpesa_service import MpesaService
from config import Config
from utils.finance import calculate_outstanding_balance

tenant_bp = Blueprint("tenant", __name__)

SIGNATURE_FOLDER = 'uploads/signatures'
os.makedirs(SIGNATURE_FOLDER, exist_ok=True)


def tenant_required(f):
    """Decorator requiring tenant role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != "tenant":
            return jsonify({
                "success": False,
                "error": "Tenant access required"
            }), 403
        return f(*args, **kwargs)
    return decorated


def get_account_details_backend(room_number):
    """Backend version of getAccountDetails from frontend."""
    try:
        room_num = int(room_number)
    except ValueError:
        return None
    
    joyce_rooms = [1, 2, 3, 4, 5, 6, 8, 9, 10]
    lawrence_rooms = [11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
    
    rent_amount = 5000
    deposit_amount = 5400
    room_type = 'bedsitter'
    
    if room_num in [8, 9, 10, 17, 19, 20]:
        rent_amount = 7500
        deposit_amount = 7900
        room_type = 'one_bedroom'
    elif room_num == 18:
        rent_amount = 7000
        deposit_amount = 7400
        room_type = 'one_bedroom'
    elif room_num in [12, 22]:
        rent_amount = 5500
        deposit_amount = 5900
        room_type = 'bedsitter'
    elif room_num in [11, 13, 14, 15, 21, 23, 24, 25, 26]:
        rent_amount = 5000
        deposit_amount = 5400
        room_type = 'bedsitter'
    
    if room_num in joyce_rooms:
        landlord_name = 'Joyce Muthoni Mathea'
        paybill = '222111'
        account_number = f'JOYCE{room_num:03d}'
    elif room_num in lawrence_rooms:
        landlord_name = 'Lawrence Mathea'
        paybill = '222222'
        account_number = f'LAWRENCE{room_num:03d}'
    else:
        landlord_name = 'Not Assigned'
        paybill = 'N/A'
        account_number = 'N/A'
    
    return {
        'room_number': room_num,
        'room_type': room_type,
        'rent_amount': rent_amount,
        'deposit_amount': deposit_amount,
        'landlord_name': landlord_name,
        'paybill': paybill,
        'account_number': account_number
    }


@tenant_bp.route("/dashboard", methods=["GET"])
@tenant_required
def dashboard():
    """Get tenant dashboard overview."""
    try:
        current_app.logger.info(f"🔍 Fetching dashboard for user_id: {request.user_id}")
        
        user = db.session.get(User, request.user_id)
        if not user:
            current_app.logger.error(f"❌ User not found: {request.user_id}")
            return jsonify({"success": False, "error": "User not found"}), 404

        active_lease = Lease.query.filter_by(tenant_id=user.id, status='active').first()
        
        recent_payments = []
        if active_lease:
            payments = Payment.query.filter_by(lease_id=active_lease.id)\
                .order_by(Payment.created_at.desc()).limit(5).all()
            recent_payments = [p.to_dict() for p in payments] if payments else []

        active_maintenance = MaintenanceRequest.query.filter(
            MaintenanceRequest.reported_by_id == user.id,
            MaintenanceRequest.status.in_(['pending', 'in_progress'])
        ).count()

        unread_notifications = Notification.query.filter_by(
            user_id=user.id, is_read=False
        ).count()

        property_name = "No active lease"
        rent_amount = 0
        unit_number = user.room_number or "N/A"
        
        if active_lease:
            if hasattr(active_lease, 'property') and active_lease.property:
                property_name = active_lease.property.name
                rent_amount = active_lease.rent_amount or 0
                if not user.room_number:
                    unit_number = property_name.replace('Room ', '')
            else:
                property_name = "Unknown Property"

        outstanding_balance = calculate_outstanding_balance(active_lease)

        current_app.logger.info(f"✅ Dashboard data loaded for {user.email}")
        
        return jsonify({
            "success": True,
            "dashboard": {
                "tenant_name": user.full_name,
                "email": user.email,
                "property_name": property_name,
                "unit_number": unit_number,
                "lease_status": active_lease.status if active_lease else "None",
                "rent_amount": float(rent_amount),
                "outstanding_balance": float(outstanding_balance),
                "active_maintenance_requests": active_maintenance,
                "unread_notifications": unread_notifications,
                "recent_payments": recent_payments,
                "photo_path": user.photo_path,
                "has_lease": active_lease is not None,
                "lease_signed": active_lease.signed_by_tenant if active_lease else False
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"❌ Dashboard error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Dashboard error: {str(e)}"}), 500


@tenant_bp.route("/profile", methods=["GET"])
@tenant_required
def get_tenant_profile():
    """Get tenant profile information."""
    try:
        user = db.session.get(User, request.user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "national_id": user.national_id,
                "id_number": user.national_id,
                "room_number": user.room_number,
                "photo_path": user.photo_path,
                "id_document_path": user.id_document_path,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }), 200
    except Exception as e:
        current_app.logger.error(f"❌ Profile error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Profile error: {str(e)}"}), 500


@tenant_bp.route("/payment-details", methods=["GET"])
@tenant_required
def get_payment_details():
    """Get payment details for current tenant's room"""
    try:
        current_app.logger.info(f"💰 Fetching payment details for user_id: {request.user_id}")
        
        lease = Lease.query.filter_by(
            tenant_id=request.user_id,
            status='active'
        ).first()
        
        if not lease:
            current_app.logger.warning(f"❌ No active lease found for user_id: {request.user_id}")
            return jsonify({
                "success": False,
                "error": "No active lease found. Please sign your lease agreement first."
            }), 404
        
        if not lease.signed_by_tenant:
            current_app.logger.warning(f"⚠️ Lease {lease.id} not signed yet")
            return jsonify({
                "success": False,
                "error": "Please sign your lease agreement before accessing payment details"
            }), 400
        
        property = db.session.get(Property, lease.property_id)
        
        if not property:
            current_app.logger.warning(f"❌ Property not found for lease_id: {lease.id}")
            return jsonify({
                "success": False,
                "error": "Property not found"
            }), 404
        
        room_number = property.name.replace("Room ", "").strip()
        
        current_app.logger.info(f"✅ Payment details found - Room: {room_number}, Rent: {property.rent_amount}")
        
        return jsonify({
            "success": True,
            "payment_details": {
                "room_number": room_number,
                "paybill_number": property.paybill_number,
                "account_number": property.account_number,
                "rent_amount": float(property.rent_amount),
                "lease_id": lease.id,
                "deposit_amount": float(property.deposit_amount) if hasattr(property, 'deposit_amount') else 0,
                "property_name": property.name
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Payment details error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"Error fetching payment details: {str(e)}"
        }), 500


@tenant_bp.route("/lease", methods=["GET"])
@tenant_required
def get_lease_details():
    """Get current lease details."""
    try:
        current_app.logger.info(f"📄 Fetching lease details for user_id: {request.user_id}")
        
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        
        if not lease:
            current_app.logger.info(f"ℹ️ No active lease found for user_id: {request.user_id}")
            return jsonify({
                "success": True,
                "message": "No active lease",
                "lease": None,
                "has_lease": False
            }), 200

        property = db.session.get(Property, lease.property_id) if lease.property_id else None
        
        lease_data = {
            "id": lease.id,
            "status": lease.status,
            "start_date": lease.start_date.isoformat() if lease.start_date else None,
            "end_date": lease.end_date.isoformat() if lease.end_date else None,
            "rent_amount": float(lease.rent_amount) if lease.rent_amount else 0,
            "deposit_amount": float(lease.deposit_amount) if lease.deposit_amount else 0,
            "signed": lease.is_signed() if hasattr(lease, 'is_signed') else False,
            "signed_by_tenant": lease.signed_by_tenant,
            "signed_at": lease.signed_at.isoformat() if lease.signed_at else None,
            "terms_accepted": lease.terms_accepted,
            "property": {
                "name": property.name if property else "Unknown",
                "type": property.property_type if property else "N/A",
                "description": property.description if property else "N/A"
            } if property else None
        }

        current_app.logger.info(f"✅ Lease data loaded for user_id: {request.user_id}")
        
        return jsonify({
            "success": True,
            "lease": lease_data,
            "has_lease": True
        }), 200

    except Exception as e:
        current_app.logger.error(f"❌ Lease error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Lease error: {str(e)}"}), 500


@tenant_bp.route("/lease/sign", methods=["POST"])
@tenant_required
def sign_lease():
    """Sign lease agreement with digital signature. Auto-creates if missing."""
    try:
        data = request.get_json()
        current_app.logger.info(f"✍️ Lease signing attempt for user_id: {request.user_id}")
        
        if not data.get('signature'):
            current_app.logger.error("❌ Signature is required")
            return jsonify({"success": False, "error": "Signature is required"}), 400
        
        if not data.get('terms_accepted'):
            current_app.logger.error("❌ Must accept terms and conditions")
            return jsonify({"success": False, "error": "Must accept terms and conditions"}), 400
        
        user = db.session.get(User, request.user_id)
        if not user:
            current_app.logger.error(f"❌ User not found: {request.user_id}")
            return jsonify({"success": False, "error": "User not found"}), 404
        
        lease = Lease.query.filter_by(
            tenant_id=request.user_id,
            status='active'
        ).first()
        
        if not lease:
            current_app.logger.info(f"ℹ️ No active lease found, creating one for user_id: {request.user_id}")
            
            if not user.room_number:
                current_app.logger.error("❌ No room number assigned to user")
                return jsonify({
                    "success": False, 
                    "error": "No room assigned. Please contact admin."
                }), 400
            
            account_details = get_account_details_backend(user.room_number)
            if not account_details:
                current_app.logger.error(f"❌ Invalid room number: {user.room_number}")
                return jsonify({
                    "success": False, 
                    "error": f"Invalid room number: {user.room_number}"
                }), 400
            
            property_name = f"Room {user.room_number}"
            property = Property.query.filter_by(name=property_name).first()
            
            if not property:
                current_app.logger.info(f"✅ Creating property: {property_name}")
                property = Property(
                    name=property_name,
                    property_type=account_details['room_type'],
                    rent_amount=account_details['rent_amount'],
                    deposit_amount=account_details['deposit_amount'],
                    paybill_number=account_details['paybill'],
                    account_number=account_details['account_number'],
                    status='occupied'
                )
                db.session.add(property)
                db.session.commit()
                current_app.logger.info(f"✅ Created property: {property_name}")
            else:
                current_app.logger.info(f"✅ Using existing property: {property_name}")
            
            lease = Lease(
                tenant_id=user.id,
                property_id=property.id,
                status='active',
                rent_amount=property.rent_amount,
                deposit_amount=property.deposit_amount,
                start_date=datetime.now(timezone.utc).date(),
                end_date=datetime.now(timezone.utc).date() + timedelta(days=365),
                signed_by_tenant=False,
                terms_accepted=False
            )
            db.session.add(lease)
            db.session.commit()
            current_app.logger.info(f"✅ Created lease: {lease.id}")
        
        if lease.signed_by_tenant:
            current_app.logger.warning(f"⚠️ Lease {lease.id} already signed")
            return jsonify({"success": False, "error": "Lease already signed"}), 400
        
        signature_data = data['signature']
        if signature_data.startswith('data:image'):
            signature_data = signature_data.split(',')[1]
        
        filename = f'lease_{lease.id}_{request.user_id}_{int(datetime.now().timestamp())}.png'
        filepath = os.path.join(SIGNATURE_FOLDER, filename)
        
        with open(filepath, 'wb') as f:
            f.write(base64.b64decode(signature_data))
        
        lease.signature_path = filepath
        lease.signature_filename = filename
        lease.signed_by_tenant = True
        lease.signed_at = datetime.fromisoformat(data['signed_at']) if data.get('signed_at') else datetime.now()
        lease.terms_accepted = True
        
        db.session.commit()
        
        current_app.logger.info(f"✅ Lease {lease.id} signed successfully by user_id: {request.user_id}")
        
        try:
            property = db.session.get(Property, lease.property_id)
            
            caretakers = User.query.filter_by(role='caretaker').all()
            admins = User.query.filter_by(role='admin').all()
            
            for recipient in caretakers + admins:
                notification = Notification(
                    user_id=recipient.id,
                    title=f"Lease Signed - Room {property.name if property else 'N/A'}",
                    message=f"Tenant {user.full_name} has signed the lease agreement for Room {user.room_number}",
                    notification_type='lease_signed'
                )
                db.session.add(notification)
            
            db.session.commit()
            current_app.logger.info(f"📢 Notifications created for lease signing")
        except Exception as notif_error:
            current_app.logger.error(f"⚠️ Failed to create notifications: {notif_error}")
        
        property = db.session.get(Property, lease.property_id) if lease.property_id else None
        
        return jsonify({
            "success": True,
            "message": "Lease agreement signed successfully",
            "lease": {
                "id": lease.id,
                "status": lease.status,
                "signed_by_tenant": lease.signed_by_tenant,
                "signed_at": lease.signed_at.isoformat() if lease.signed_at else None,
                "terms_accepted": lease.terms_accepted,
                "rent_amount": float(lease.rent_amount) if lease.rent_amount else 0,
                "deposit_amount": float(lease.deposit_amount) if lease.deposit_amount else 0,
                "property_name": property.name if property else "Unknown"
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Lease signing error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Error signing lease: {str(e)}"}), 500


@tenant_bp.route("/stk-push", methods=["POST"])
@tenant_required
def initiate_mpesa_payment():
    """Initiate M-Pesa STK Push."""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        amount = data.get('amount')
        
        if not phone_number or not amount:
            return jsonify({"success": False, "error": "Phone number and amount are required"}), 400
            
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        if not lease:
            return jsonify({"success": False, "error": "No active lease found"}), 404
            
        mpesa_service = MpesaService(Config)
        
        # Automate account details based on room number
        account_details = get_account_details_backend(user.room_number)
        if not account_details:
            return jsonify({"success": False, "error": "Invalid account configuration"}), 400
            
        shortcode = account_details['paybill']
        account_reference = account_details['account_number']
        description = f"Rent payment for Room {user.room_number}"
        
        response_data, error = mpesa_service.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            shortcode=shortcode,
            account_reference=account_reference,
            description=description
        )
        
        if error:
            return jsonify({"success": False, "error": error}), 400
            
        # Create pending payment record
        payment = Payment(
            tenant_id=request.user_id,
            lease_id=lease.id,
            amount=amount,
            status='pending',
            payment_method='M-Pesa',
            checkout_request_id=response_data.get('CheckoutRequestID'),
            description=description
        )
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "STK Push initiated successfully. Please enter your PIN on your phone.",
            "checkout_request_id": payment.checkout_request_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"STK Push error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenant_bp.route("/payments", methods=["GET"])
@tenant_required
def get_payment_history():
    """Get payment history."""
    try:
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        if not lease:
            return jsonify({"success": True, "payments": [], "has_lease": False}), 200

        payments = Payment.query.filter_by(lease_id=lease.id)\
            .order_by(Payment.created_at.desc()).all()
            
        payments_data = [{
            "id": p.id,
            "amount": float(p.amount) if p.amount else 0,
            "status": p.status,
            "transaction_id": p.transaction_id if hasattr(p, 'transaction_id') else None,
            "checkout_request_id": p.checkout_request_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "payment_method": p.payment_method if hasattr(p, 'payment_method') else "M-Pesa"
        } for p in payments]

        return jsonify({
            "success": True,
            "payments": payments_data,
            "has_lease": True,
            "total_payments": len(payments_data)
        }), 200

    except Exception as e:
        current_app.logger.error(f"❌ Payments error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Payments error: {str(e)}"}), 500


@tenant_bp.route("/maintenance/request", methods=["POST"])
@tenant_required
def create_maintenance_request():
    """Create maintenance request."""
    try:
        data = request.get_json() or {}
        current_app.logger.info(f"🔧 Creating maintenance request for user_id: {request.user_id}")
        
        if not data.get('title') or not data.get('description'):
            return jsonify({"success": False, "error": "Title and description required"}), 400

        user = db.session.get(User, request.user_id)
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        
        property_id = None
        if lease:
            property_id = lease.property_id
        elif user.room_number:
            property = Property.query.filter_by(name=f"Room {user.room_number}").first()
            if property:
                property_id = property.id
        
        if not property_id:
            return jsonify({"success": False, "error": "No room assigned. Please sign your lease first."}), 400

        new_request = MaintenanceRequest(
            title=data['title'],
            description=data['description'],
            priority=data.get('priority', 'normal'),
            property_id=property_id,
            reported_by_id=request.user_id,
            status='pending'
        )
        
        db.session.add(new_request)
        db.session.commit()

        current_app.logger.info(f"✅ Maintenance request created: {new_request.id}")
        
        try:
            caretakers = User.query.filter_by(role='caretaker').all()
            admins = User.query.filter_by(role='admin').all()
            
            for recipient in caretakers + admins:
                notification = Notification(
                    user_id=recipient.id,
                    title=f"New Maintenance Request - {data['title'][:50]}",
                    message=f"Tenant {user.full_name} submitted: {data['description'][:100]}...",
                    notification_type='maintenance'
                )
                db.session.add(notification)
            
            db.session.commit()
            current_app.logger.info(f"📢 Notifications created for maintenance request")
        except Exception as notif_error:
            current_app.logger.error(f"⚠️ Failed to create notifications: {notif_error}")
        
        request_data = {
            "id": new_request.id,
            "title": new_request.title,
            "description": new_request.description,
            "status": new_request.status,
            "priority": new_request.priority,
            "created_at": new_request.created_at.isoformat() if new_request.created_at else None
        }

        return jsonify({
            "success": True,
            "message": "Maintenance request submitted successfully",
            "request": request_data
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Maintenance error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Request failed: {str(e)}"}), 500


@tenant_bp.route("/maintenance", methods=["GET"])
@tenant_required
def get_maintenance_requests():
    """Get tenant's maintenance requests."""
    try:
        requests_list = MaintenanceRequest.query.filter_by(reported_by_id=request.user_id)\
            .order_by(MaintenanceRequest.created_at.desc()).all()
            
        requests_data = [{
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "priority": r.priority,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            "property_name": r.property.name if r.property else "N/A"
        } for r in requests_list]

        return jsonify({
            "success": True,
            "requests": requests_data,
            "total_requests": len(requests_data)
        }), 200

    except Exception as e:
        current_app.logger.error(f"❌ Maintenance list error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Failed to fetch: {str(e)}"}), 500


@tenant_bp.route("/maintenance-requests", methods=["GET", "POST"])
@tenant_required
def maintenance_requests_combined():
    """Combined endpoint for maintenance requests (GET and POST)."""
    if request.method == 'GET':
        return get_maintenance_requests()
    elif request.method == 'POST':
        return create_maintenance_request()


@tenant_bp.route("/room-details/<unit_number>", methods=["GET"])
@tenant_required
def get_room_details(unit_number):
    """Get room details for a specific unit."""
    try:
        current_app.logger.info(f"🏠 Fetching room details for unit: {unit_number}, user_id: {request.user_id}")
        
        property = Property.query.filter_by(name=f"Room {unit_number}").first()
        
        if not property:
            lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
            if lease and lease.property:
                property = lease.property
        
        if not property:
            return jsonify({
                "success": False,
                "error": "Room not found"
            }), 404
        
        landlord_info = {}
        if property.landlord_id:
            landlord = db.session.get(User, property.landlord_id)
            if landlord:
                landlord_info = {
                    "name": f"{landlord.first_name} {landlord.last_name}",
                    "phone": landlord.phone_number,
                    "email": landlord.email
                }
        
        return jsonify({
            "success": True,
            "room": {
                "id": property.id,
                "name": property.name,
                "room_number": unit_number,
                "property_type": property.property_type,
                "rent_amount": float(property.rent_amount),
                "deposit_amount": float(property.deposit_amount),
                "description": property.description,
                "status": property.status,
                "paybill_number": property.paybill_number,
                "account_number": property.account_number,
                "landlord": landlord_info,
                "features": property.features if hasattr(property, 'features') else [],
                "size": property.size if hasattr(property, 'size') else None
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Room details error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Error fetching room: {str(e)}"}), 500


@tenant_bp.route("/vacate-notice", methods=["POST"])
@tenant_required
def submit_vacate_notice():
    """Submit vacate notice (30-day notice required)."""
    try:
        data = request.get_json()
        current_app.logger.info(f"🚪 Submitting vacate notice for user_id: {request.user_id}")
        
        if not data.get('intended_move_date'):
            return jsonify({"success": False, "error": "Intended move date is required"}), 400
        
        move_date = datetime.fromisoformat(data['intended_move_date']).date()
        
        min_date = datetime.now().date() + timedelta(days=30)
        if move_date < min_date:
            return jsonify({
                "success": False,
                "error": f"Move date must be at least 30 days from today. Minimum date: {min_date.isoformat()}"
            }), 400
        
        lease = Lease.query.filter_by(
            tenant_id=request.user_id,
            status='active'
        ).first()
        
        if not lease:
            return jsonify({"success": False, "error": "No active lease found"}), 404
        
        existing_notice = VacateNotice.query.filter_by(
            lease_id=lease.id,
            status='pending'
        ).first()
        
        if existing_notice:
            return jsonify({"success": False, "error": "You already have a pending vacate notice"}), 400
        
        notice = VacateNotice(
            lease_id=lease.id,
            tenant_id=request.user_id,
            vacate_date=move_date,
            reason=data.get('reason', ''),
            status='pending'
        )
        
        db.session.add(notice)
        db.session.commit()
        
        current_app.logger.info(f"✅ Vacate notice created: {notice.id}")
        
        try:
            user = db.session.get(User, request.user_id)
            property = db.session.get(Property, lease.property_id) if lease.property_id else None
            
            caretakers = User.query.filter_by(role='caretaker').all()
            admins = User.query.filter_by(role='admin').all()
            
            for recipient in caretakers + admins:
                notification = Notification(
                    user_id=recipient.id,
                    title=f"Vacate Notice - Room {property.name if property else 'N/A'}",
                    message=f"Tenant {user.full_name} submitted vacate notice for {move_date.isoformat()}. Reason: {data.get('reason', 'No reason provided')}",
                    notification_type='vacate_notice'
                )
                db.session.add(notification)
            
            db.session.commit()
            current_app.logger.info(f"📢 Notifications created for vacate notice")
        except Exception as notif_error:
            current_app.logger.error(f"⚠️ Failed to create notifications: {notif_error}")
        
        return jsonify({
            "success": True,
            "message": "Vacate notice submitted successfully",
            "notice": {
                "id": notice.id,
                "lease_id": notice.lease_id,
                "vacate_date": notice.vacate_date.isoformat(),
                "status": notice.status,
                "reason": notice.reason
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Vacate notice error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Error submitting notice: {str(e)}"}), 500


@tenant_bp.route("/vacate-notices", methods=["GET"])
@tenant_required
def get_vacate_notices():
    """Get tenant's vacate notices."""
    try:
        lease = Lease.query.filter_by(tenant_id=request.user_id, status='active').first()
        
        if not lease:
            return jsonify({"success": True, "notices": [], "has_lease": False}), 200
        
        notices = VacateNotice.query.filter_by(lease_id=lease.id)\
            .order_by(VacateNotice.created_at.desc()).all()
        
        notices_data = [{
            "id": n.id,
            "lease_id": n.lease_id,
            "vacate_date": n.vacate_date.isoformat() if n.vacate_date else None,
            "intended_move_date": n.vacate_date.isoformat() if n.vacate_date else None,
            "reason": n.reason,
            "status": n.status,
            "admin_notes": n.admin_notes,
            "notice_date": n.created_at.isoformat() if n.created_at else None,
            "days_until_move": (n.vacate_date - datetime.now().date()).days if n.vacate_date else 0,
            "lease": {
                "room_number": lease.property.name if lease.property else "N/A",
                "rent_amount": lease.rent_amount
            }
        } for n in notices]
        
        return jsonify({
            "success": True,
            "notices": notices_data,
            "has_lease": True,
            "total_notices": len(notices_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Vacate notices error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Error fetching notices: {str(e)}"}), 500


@tenant_bp.route("/vacate-notice/<int:notice_id>/cancel", methods=["POST"])
@tenant_required
def cancel_vacate_notice(notice_id):
    """Cancel pending vacate notice."""
    try:
        notice = db.session.get(VacateNotice, notice_id)
        
        if not notice:
            return jsonify({"success": False, "error": "Notice not found"}), 404
        
        lease = db.session.get(Lease, notice.lease_id)
        if not lease or lease.tenant_id != request.user_id:
            return jsonify({"success": False, "error": "Unauthorized"}), 403
        
        if notice.status != 'pending':
            return jsonify({"success": False, "error": f"Cannot cancel {notice.status} notice"}), 400
        
        db.session.delete(notice)
        db.session.commit()
        
        current_app.logger.info(f"✅ Vacate notice {notice_id} cancelled")
        
        return jsonify({
            "success": True,
            "message": "Vacate notice cancelled successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Cancel notice error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Error cancelling notice: {str(e)}"}), 500


@tenant_bp.route("/notifications", methods=["GET"])
@tenant_required
def get_notifications():
    """Get tenant notifications."""
    try:
        notifications = Notification.query.filter_by(user_id=request.user_id)\
            .order_by(Notification.created_at.desc()).all()
            
        notif_data = [{
            "id": n.id,
            "title": n.title if hasattr(n, 'title') else "Notification",
            "message": n.message if hasattr(n, 'message') else str(n),
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "notification_type": n.notification_type if hasattr(n, 'notification_type') else 'general'
        } for n in notifications]

        return jsonify({
            "success": True,
            "notifications": notif_data,
            "total_notifications": len(notif_data),
            "unread_count": len([n for n in notif_data if not n['is_read']])
        }), 200

    except Exception as e:
        current_app.logger.error(f"❌ Notifications error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Failed to fetch: {str(e)}"}), 500


@tenant_bp.route("/notifications/mark-read/<int:notification_id>", methods=["PUT"])
@tenant_required
def mark_notification_read(notification_id):
    """Mark notification as read."""
    try:
        notification = Notification.query.filter_by(
            id=notification_id, user_id=request.user_id
        ).first()
        
        if not notification:
            return jsonify({"success": False, "error": "Not found"}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({"success": True, "message": "Notification marked as read"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Mark read error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Update failed: {str(e)}"}), 500


@tenant_bp.route("/rooms/<room_number>", methods=["GET"])
@tenant_required
def get_room_pricing(room_number):
    """Get pricing details for a specific room"""
    try:
        room = Property.query.filter(
            Property.name.ilike(f"%{room_number}%")
        ).first()
        
        if not room:
            return jsonify({
                "success": False,
                "error": "Room not found"
            }), 404
        
        deposit_amount = room.rent_amount * 1.07
        
        return jsonify({
            "success": True,
            "room": {
                "id": room.id,
                "name": room.name,
                "type": room.property_type,
                "rent_amount": float(room.rent_amount),
                "deposit_amount": float(deposit_amount),
                "description": room.description,
                "status": room.status,
                "paybill_number": room.paybill_number if hasattr(room, 'paybill_number') else None,
                "account_number": room.account_number if hasattr(room, 'account_number') else None
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Room pricing error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"Error fetching room: {str(e)}"
        }), 500


@tenant_bp.route("/lease/preview/<int:room_id>", methods=["GET"])
@tenant_required
def get_lease_preview(room_id):
    """Get lease preview with room details for modal"""
    try:
        room = db.session.get(Property, room_id)
        
        if not room:
            return jsonify({
                "success": False,
                "error": "Room not found"
            }), 404
        
        user = db.session.get(User, request.user_id)
        
        landlord_name = "JOYCE MUTHONI MATHEA"
        landlord_phone = "0758 999322"
        landlord_email = "joycesuites@gmail.com"
        
        if hasattr(room, 'paybill_number') and room.paybill_number == '222222':
            landlord_name = "LAWRENCE MATHEA"
            landlord_phone = "0758 999322"
            landlord_email = "lawrence@joycesuites.com"
        
        return jsonify({
            "success": True,
            "lease_preview": {
                "tenant": {
                    "name": user.full_name,
                    "email": user.email,
                    "phone": user.phone_number,
                    "id_number": user.national_id,
                    "room_number": user.room_number
                },
                "room": {
                    "name": room.name,
                    "type": room.property_type,
                    "rent_amount": float(room.rent_amount),
                    "deposit_amount": float(room.deposit_amount) if hasattr(room, 'deposit_amount') else float(room.rent_amount * 1.07),
                    "water_deposit": 400,
                    "description": room.description,
                    "paybill": room.paybill_number if hasattr(room, 'paybill_number') else None,
                    "account": room.account_number if hasattr(room, 'account_number') else None
                },
                "landlord": {
                    "name": landlord_name,
                    "phone": landlord_phone,
                    "email": landlord_email
                },
                "terms": {
                    "lease_type": "month-to-month",
                    "notice_period": 30,
                    "quiet_hours_start": "22:00",
                    "quiet_hours_end": "08:00",
                    "rent_due_date": "5th of each month"
                }
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Lease preview error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"Error fetching preview: {str(e)}"
        }), 500


@tenant_bp.route("/lease/create", methods=["POST"])
@tenant_required
def create_lease():
    """Create a new lease for the tenant."""
    try:
        current_app.logger.info(f"📝 Creating lease for user_id: {request.user_id}")
        
        user = db.session.get(User, request.user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        existing_lease = Lease.query.filter_by(
            tenant_id=user.id, 
            status='active'
        ).first()
        
        if existing_lease:
            return jsonify({
                "success": False, 
                "error": "You already have an active lease"
            }), 400
        
        if not user.room_number:
            return jsonify({
                "success": False, 
                "error": "No room number assigned to your account. Please contact admin."
            }), 400
        
        account_details = get_account_details_backend(user.room_number)
        if not account_details:
            return jsonify({
                "success": False, 
                "error": f"Invalid room number: {user.room_number}"
            }), 400
        
        property_name = f"Room {user.room_number}"
        property = Property.query.filter_by(name=property_name).first()
        
        if not property:
            property = Property(
                name=property_name,
                property_type=account_details['room_type'],
                rent_amount=account_details['rent_amount'],
                deposit_amount=account_details['deposit_amount'],
                paybill_number=account_details['paybill'],
                account_number=account_details['account_number'],
                status='occupied'
            )
            db.session.add(property)
            db.session.commit()
            current_app.logger.info(f"✅ Created property: {property_name}")
        
        new_lease = Lease(
            tenant_id=user.id,
            property_id=property.id,
            status='active',
            rent_amount=property.rent_amount,
            deposit_amount=property.deposit_amount,
            start_date=datetime.now(timezone.utc).date(),
            end_date=datetime.now(timezone.utc).date() + timedelta(days=365),
            signed_by_tenant=False,
            terms_accepted=False
        )
        
        db.session.add(new_lease)
        db.session.commit()
        
        current_app.logger.info(f"✅ Lease created for user_id: {request.user_id}, lease_id: {new_lease.id}")
        
        return jsonify({
            "success": True,
            "message": "Lease created successfully. Please sign it to activate.",
            "lease": {
                "id": new_lease.id,
                "status": new_lease.status,
                "rent_amount": float(new_lease.rent_amount),
                "deposit_amount": float(new_lease.deposit_amount),
                "property_name": property.name,
                "signed": new_lease.signed_by_tenant
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Lease creation error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": f"Error creating lease: {str(e)}"}), 500


@tenant_bp.route("/health", methods=["GET"])
def tenant_health():
    """Health check for tenant routes."""
    return jsonify({
        "success": True,
        "service": "Tenant API",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200
@tenant_bp.route("/payment-status/<checkout_id>", methods=["GET"])
@tenant_required
def check_payment_status(checkout_id):
    """Query Safaricom for STK Push status."""
    try:
        payment = Payment.query.filter_by(checkout_request_id=checkout_id).first()
        if not payment:
            return jsonify({"success": False, "error": "Payment record not found"}), 404
            
        if payment.status in ['paid', 'completed']:
            return jsonify({
                "success": True, 
                "status": payment.status,
                "message": "Payment already confirmed as successful"
            }), 200
            
        lease = db.session.get(Lease, payment.lease_id)
        if not lease:
            return jsonify({"success": False, "error": "Lease not found"}), 404
            
        property = db.session.get(Property, lease.property_id)
        if not property or not property.paybill_number:
            return jsonify({"success": False, "error": "Property paybill configuration missing"}), 400
            
        mpesa_service = MpesaService(Config)
        response_data, error = mpesa_service.query_stk_status(checkout_id, property.paybill_number)
        
        if error:
            return jsonify({"success": False, "error": error}), 400
            
        result_code = response_data.get("ResultCode")
        
        if str(result_code) == "0":
            payment.status = 'paid'
            # In Safaricom STK Query, receipt is not always in the same place as callback
            # But we can update the status at least.
            db.session.commit()
            return jsonify({
                "success": True, 
                "status": "paid",
                "message": "Payment confirmed successfully"
            }), 200
        elif str(result_code) == "1032":
            payment.status = 'cancelled'
            db.session.commit()
            return jsonify({
                "success": True, 
                "status": "cancelled",
                "message": "Request cancelled by user"
            }), 200
        elif str(result_code) in ["1", "1037"]:
            # 1: record not found (expired), 1037: timeout
            return jsonify({
                "success": True, 
                "status": "pending",
                "message": "Payment still pending or expired. Please check your phone."
            }), 200
        else:
            payment.status = 'failed'
            payment.notes = response_data.get("ResultDesc")
            db.session.commit()
            return jsonify({
                "success": True, 
                "status": "failed",
                "message": response_data.get("ResultDesc")
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Payment status query error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
