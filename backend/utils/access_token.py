import requests
import base64
import os
from datetime import datetime
from app.utils.mpesa_credentials import (
    get_access_token,
    STK_PUSH_URL,
    CALLBACK_URL,
)


def initiate_stk_push(phone_number, amount, account_reference, transaction_desc, paybill_owner='joyce'):
    """
    Initiates M-Pesa STK Push request to customer's phone.

    Args:
        phone_number (str): Customer phone number (format: 2547XXXXXXXX)
        amount (int): Payment amount in KES
        account_reference (str): Account reference/room number
        transaction_desc (str): Transaction description
        paybill_owner (str): Either 'joyce' or 'lawrence' to use correct shortcode

    Returns:
        dict: M-Pesa API response
    """
    try:
        # ✅ Match the .env variable names
        if paybill_owner.lower() == 'lawrence':
            business_shortcode = os.getenv('54544')
            passkey = os.getenv('PASSKEY_LAWRENCE')
        else:
            business_shortcode = os.getenv('2536316')
            passkey = os.getenv('PASSKEY_JOYCE')

        if not business_shortcode or not passkey:
            raise Exception(f"Failed! for {paybill_owner} account")

        # Generate timestamp and password
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{business_shortcode}{passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()

        # Prepare payload
        payload = {
            'BusinessShortCode': business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': amount,
            'PartyA': phone_number,
            'PartyB': business_shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': CALLBACK_URL,
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc,
        }

        # Get access token
        access_token = get_access_token()

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }

        # Send STK Push request
        response = requests.post(STK_PUSH_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()

        if result.get('ResponseCode') == '0':
            return {
                'status': 'success',
                'message': 'STK Push sent successfully',
                'checkout_request_id': result.get('CheckoutRequestID'),
                'customer_message': result.get('CustomerMessage'),
                'response_code': result.get('ResponseCode'),
                'business_shortcode': business_shortcode,
                'paybill_owner': paybill_owner
            }
        else:
            return {
                'status': 'failed',
                'message': result.get('ResponseDescription', 'STK Push failed'),
                'response_code': result.get('ResponseCode'),
            }

    except requests.exceptions.RequestException as e:
        raise Exception(f"STK Push request failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Error during STK Push: {str(e)}")


def validate_phone_number(phone_number):
    """Validates phone number format."""
    if phone_number.startswith('254') and len(phone_number) == 12 and phone_number.isdigit():
        return True
    if (phone_number.startswith('07') or phone_number.startswith('01')) and len(phone_number) == 10:
        return True
    return False


def format_phone_number(phone_number):
    """Formats phone number to 254XXXXXXXXX."""
    phone_number = phone_number.strip()
    if phone_number.startswith('254'):
        return phone_number
    elif phone_number.startswith('0'):
        return '254' + phone_number[1:]
    elif phone_number.startswith('+254'):
        return phone_number.replace('+', '')
    else:
        raise ValueError(f"Invalid phone number format: {phone_number}")
