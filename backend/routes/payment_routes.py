from flask import Blueprint, request, jsonify, current_app
from models.base import db
from models.payment import Payment
from models.lease import Lease
from models.notification import Notification
from models.user import User
from services.mpesa_service import MpesaService
from config import Config
import json

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payments")

@payment_bp.route("/validation", methods=["POST"])
def mpesa_validation():
    """Handle M-Pesa C2B Validation."""
    try:
        data = request.get_json()
        current_app.logger.info(f"M-Pesa C2B Validation Received: {json.dumps(data)}")
        
        bill_ref = data.get("BillRefNumber", "").upper().strip()
        
        # Parse room number from BillRefNumber
        room_num = None
        if bill_ref.startswith("JOYCE"):
            try:
                room_num = str(int(bill_ref[5:]))
            except (ValueError, IndexError):
                pass
        elif bill_ref.startswith("LAWRENCE"):
            try:
                room_num = str(int(bill_ref[8:]))
            except (ValueError, IndexError):
                pass
        
        if not room_num:
            return jsonify({
                "ResultCode": "C2B00012", 
                "ResultDesc": "Invalid account number format. Use JOYCE001 or LAWRENCE011"
            }), 200 # Safaricom expects 200 even for rejection in some cases, but ResultCode determines outcome

        # Check if tenant exists for this room
        tenant = User.query.filter_by(room_number=room_num, role='tenant', is_active=True).first()
        if not tenant:
            return jsonify({
                "ResultCode": "C2B00013", 
                "ResultDesc": f"No active tenant found for room {room_num}"
            }), 200

        return jsonify({
            "ResultCode": 0, 
            "ResultDesc": "Accepted"
        }), 200

    except Exception as e:
        current_app.logger.error(f"C2B Validation Error: {str(e)}")
        return jsonify({"ResultCode": "C2B00016", "ResultDesc": "Internal error"}), 200

@payment_bp.route("/callback", methods=["POST"])
def mpesa_callback():
    """Handle M-Pesa STK Push callback."""
    try:
        data = request.get_json()
        current_app.logger.info(f"M-Pesa Callback Received: {json.dumps(data)}")
        
        mpesa_service = MpesaService(Config)
        result = mpesa_service.process_callback(data)
        
        if not result:
            return jsonify({"ResultCode": 1, "ResultDesc": "Invalid callback data"}), 400
            
        checkout_request_id = result["checkout_request_id"]
        payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
        
        if not payment:
            current_app.logger.error(f"Payment not found for CheckoutRequestID: {checkout_request_id}")
            return jsonify({"ResultCode": 1, "ResultDesc": "Payment not found"}), 404
            
        if result["success"]:
            payment.status = 'paid'
            payment.reference_number = result["receipt"]
            payment.details = result["metadata"]
            
            # Notify tenant
            notification = Notification(
                user_id=payment.tenant_id,
                title="Payment Successful",
                message=f"Your payment of KES {payment.amount} has been received. Receipt: {result['receipt']}",
                notification_type='payment'
            )
            db.session.add(notification)
            
            # Notify admins/caretakers
            admins = User.query.filter(User.role.in_(['admin', 'caretaker'])).all()
            for admin in admins:
                admin_notif = Notification(
                    user_id=admin.id,
                    title="New Payment Received",
                    message=f"Payment of KES {payment.amount} received from tenant ID {payment.tenant_id}. Receipt: {result['receipt']}",
                    notification_type='payment'
                )
                db.session.add(admin_notif)
        else:
            payment.status = 'failed'
            payment.notes = result["result_desc"]
            
            # Notify tenant
            notification = Notification(
                user_id=payment.tenant_id,
                title="Payment Failed",
                message=f"Your payment request failed: {result['result_desc']}",
                notification_type='payment'
            )
            db.session.add(notification)
            
        db.session.commit()
        return jsonify({"ResultCode": 0, "ResultDesc": "Success"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Callback Error: {str(e)}")
        return jsonify({"ResultCode": 1, "ResultDesc": "Internal error"}), 500

@payment_bp.route("/confirmation", methods=["POST"])
def mpesa_confirmation():
    """Handle M-Pesa C2B Confirmation."""
    try:
        data = request.get_json()
        current_app.logger.info(f"M-Pesa C2B Confirmation Received: {json.dumps(data)}")
        
        trans_id = data.get("TransID")
        amount = float(data.get("TransAmount", 0))
        bill_ref = data.get("BillRefNumber", "").upper().strip()
        phone = data.get("MSISDN")
        
        # Parse room number
        room_num = None
        if bill_ref.startswith("JOYCE"):
            try:
                room_num = str(int(bill_ref[5:]))
            except: pass
        elif bill_ref.startswith("LAWRENCE"):
            try:
                room_num = str(int(bill_ref[8:]))
            except: pass
            
        if room_num:
            tenant = User.query.filter_by(room_number=room_num, role='tenant', is_active=True).first()
            if tenant:
                lease = Lease.query.filter_by(tenant_id=tenant.id, status='active').first()
                
                # Create payment record
                payment = Payment(
                    tenant_id=tenant.id,
                    lease_id=lease.id if lease else None,
                    amount=amount,
                    status='paid',
                    payment_method='M-Pesa (C2B)',
                    reference_number=trans_id,
                    phone_number=phone,
                    description=f"C2B Payment for Room {room_num}",
                    payment_date=datetime.now()
                )
                db.session.add(payment)
                
                # Notify tenant
                notification = Notification(
                    user_id=tenant.id,
                    title="Payment Received",
                    message=f"We have received your payment of KES {amount} via Paybill. Receipt: {trans_id}",
                    notification_type='payment'
                )
                db.session.add(notification)
                
                # Notify admins
                admins = User.query.filter(User.role.in_(['admin', 'caretaker'])).all()
                for admin in admins:
                    admin_notif = Notification(
                        user_id=admin.id,
                        title="New C2B Payment",
                        message=f"KES {amount} received from {tenant.full_name} (Room {room_num}). Receipt: {trans_id}",
                        notification_type='payment'
                    )
                    db.session.add(admin_notif)
                    
                db.session.commit()
                current_app.logger.info(f"✅ Automatically recorded C2B payment {trans_id} for Room {room_num}")
        
        return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"C2B Confirmation Error: {str(e)}")
        return jsonify({"ResultCode": 1, "ResultDesc": "Internal error"}), 500
