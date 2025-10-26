from flask import Blueprint, request, jsonify
from datetime import datetime
import json
from models import db, Payment, Room



payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')
mpesa_bp = Blueprint("mpesa_bp", __name__, url_prefix="/api/mpesa")


@mpesa_bp.route("/token", methods=["GET"])
def generate_token():
    """Mock M-Pesa token generation."""
    return jsonify({"access_token": "mocked_token", "expires_in": "3600"}), 200


@mpesa_bp.route("/stkpush", methods=["POST"])
def stkpush_mock():
    """Mock STK push route for testing."""
    data = request.get_json()
    return jsonify({
        "MerchantRequestID": "12345",
        "CheckoutRequestID": "abcde123",
        "ResponseCode": "0",
        "ResponseDescription": "Success",
        "CustomerMessage": "STK push simulated successfully"
    }), 200



@mpesa_bp.route('/pay', methods=['POST'])
def process_payment():
    data = request.json
    amount = data.get('amount')
    phone = data.get('phone')

    payment = Payment(amount=amount, phone=phone)
    db.session.add(payment)
    db.session.commit()

    return jsonify({'message': 'Payment saved successfully'})


@payment_bp.route('/stkpush', methods=['POST'])
def stk_push():
    """
    Initiates M-Pesa STK Push payment.

    Expected JSON body:
    {
        "phone_number": "2547XXXXXXXX",
        "amount": 5000,
        "room_number": 12
    }

    Returns:
        JSON response with status and M-Pesa details
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        phone_number = data.get('phone_number', '').strip()
        amount = data.get('amount')
        room_number = data.get('room_number')

        # Validate inputs
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        if not amount or amount <= 0:
            return jsonify({'error': 'Valid amount is required'}), 400
        if not room_number or not isinstance(room_number, int):
            return jsonify({'error': 'Valid room number is required'}), 400

        # Validate and format phone number
        if not validate_phone_number(phone_number):
            return jsonify({'error': 'Invalid phone number format. Use 254XXXXXXXXX or 07XXXXXXXX'}), 400
        phone_number = format_phone_number(phone_number)

        # Identify the room and account owner
        room = Room.query.filter_by(room_number=room_number).first()
        if not room:
            return jsonify({'error': f'Room {room_number} not found'}), 404

        # Determine account holder based on room number
        if room_number in [1, 2, 3, 4, 5, 6, 8, 9, 10]:
            account_holder = 'Joyce Muthoni'
            paybill_owner = 'joyce'
        elif room_number in [11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]:
            account_holder = 'Lawrence Mathea'
            paybill_owner = 'lawrence'
        else:
            return jsonify({'error': 'Invalid room number for paybill mapping'}), 400

        account_reference = f"Room-{room_number}"
        transaction_desc = f"Rent payment for {account_holder} (Room {room_number})"

        # Initiate STK Push through mpesa_utils
        mpesa_response = initiate_stk_push(
            phone_number=phone_number,
            amount=int(amount),
            account_reference=account_reference,
            transaction_desc=transaction_desc,
            paybill_owner=paybill_owner  # crucial for dual paybill logic
        )

        # Handle M-Pesa response
        if mpesa_response.get('status') == 'success':
            payment = Payment(
                phone_number=phone_number,
                amount=amount,
                room_number=room_number,
                account_holder=account_holder,
                status='pending',
                checkout_request_id=mpesa_response.get('checkout_request_id'),
                payment_method='M-Pesa',
                description=transaction_desc,
                created_at=datetime.utcnow()
            )
            db.session.add(payment)
            db.session.commit()

            return jsonify({
                'status': 'success',
                'message': 'STK Push initiated successfully',
                'data': {
                    'checkout_request_id': mpesa_response.get('checkout_request_id'),
                    'customer_message': mpesa_response.get('customer_message'),
                    'room_number': room_number,
                    'account_holder': account_holder,
                    'amount': amount,
                    'phone_number': phone_number,
                    'paybill_owner': paybill_owner
                }
            }), 200
        else:
            return jsonify({
                'status': 'failed',
                'message': mpesa_response.get('message', 'STK Push request failed'),
                'response_code': mpesa_response.get('response_code', 'N/A')
            }), 400

    except Exception as e:
        return jsonify({'error': f'STK Push failed: {str(e)}'}), 500


@payment_bp.route('/confirmation', methods=['POST'])
def payment_confirmation():
    """
    Handles M-Pesa payment confirmation callback.
    Updates Payment status based on result.
    """
    try:
        callback_data = request.get_json()
        print(f"M-Pesa Callback: {json.dumps(callback_data, indent=2)}")

        result = callback_data.get('Body', {}).get('stkCallback', {})
        merchant_request_id = result.get('MerchantRequestID')
        checkout_request_id = result.get('CheckoutRequestID')
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc')

        payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
        if not payment:
            return jsonify({'ResultCode': 1, 'ResultDesc': 'Payment record not found'}), 404

        # Successful transaction
        if result_code == 0:
            payment.status = 'completed'
            payment.merchant_request_id = merchant_request_id

            if result.get('CallbackMetadata'):
                for item in result['CallbackMetadata']['Item']:
                    name = item.get('Name')
                    value = item.get('Value')
                    if name == 'Amount':
                        payment.amount = value
                    elif name == 'MpesaReceiptNumber':
                        payment.transaction_id = value
                    elif name == 'TransactionDate':
                        payment.transaction_date = value
                    elif name == 'PhoneNumber':
                        payment.phone_number = value
        else:
            payment.status = 'failed'
            payment.error_message = result_desc

        payment.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'ResultCode': 0, 'ResultDesc': 'Processed successfully'}), 200

    except Exception as e:
        print(f"Error processing callback: {str(e)}")
        return jsonify({'ResultCode': 1, 'ResultDesc': f'Error: {str(e)}'}), 500


@payment_bp.route('/status/<checkout_request_id>', methods=['GET'])
def payment_status(checkout_request_id):
    """
    Retrieves payment status by CheckoutRequestID.
    """
    try:
        payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404

        return jsonify({
            'checkout_request_id': payment.checkout_request_id,
            'status': payment.status,
            'amount': payment.amount,
            'phone_number': payment.phone_number,
            'room_number': payment.room_number,
            'account_holder': payment.account_holder,
            'transaction_id': payment.transaction_id,
            'created_at': payment.created_at.isoformat() if payment.created_at else None,
            'updated_at': payment.updated_at.isoformat() if payment.updated_at else None
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/history/<int:room_number>', methods=['GET'])
def payment_history(room_number):
    """
    Retrieves payment history for a specific room.
    """
    try:
        payments = Payment.query.filter_by(room_number=room_number).order_by(Payment.created_at.desc()).all()

        return jsonify({
            'room_number': room_number,
            'payments': [
                {
                    'id': p.id,
                    'amount': p.amount,
                    'status': p.status,
                    'phone_number': p.phone_number,
                    'account_holder': p.account_holder,
                    'transaction_id': p.transaction_id,
                    'created_at': p.created_at.isoformat() if p.created_at else None,
                    'updated_at': p.updated_at.isoformat() if p.updated_at else None,
                }
                for p in payments
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500