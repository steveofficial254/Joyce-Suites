import requests
import base64
from datetime import datetime
import json
from flask import current_app

class MpesaService:
    def __init__(self, config):
        self.auth_url = config.AUTH_URL
        self.stk_push_url = config.STK_PUSH_URL
        self.callback_url = config.CALLBACK_URL
        
    def _get_credentials(self, shortcode):
        """Get credentials based on shortcode or landlord name."""
        # This is a bit of a hack since we need to know which landlord's credentials to use
        # In a real app, this should be more robust.
        if str(shortcode) == current_app.config['JOYCE']['BUSINESS_SHORTCODE']:
            return (
                current_app.config['JOYCE']['CONSUMER_KEY'],
                current_app.config['JOYCE']['CONSUMER_SECRET'],
                current_app.config['JOYCE']['PASSKEY']
            )
        else:
            return (
                current_app.config['LAWRENCE']['CONSUMER_KEY'],
                current_app.config['LAWRENCE']['CONSUMER_SECRET'],
                current_app.config['LAWRENCE']['PASSKEY']
            )

    def get_access_token(self, consumer_key, consumer_secret):
        """Generate M-Pesa access token."""
        try:
            auth_string = f"{consumer_key}:{consumer_secret}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            
            headers = {
                "Authorization": f"Basic {encoded_auth}"
            }
            
            response = requests.get(self.auth_url, headers=headers)
            response.raise_for_status()
            
            return response.json().get("access_token")
        except Exception as e:
            current_app.logger.error(f"Failed to get M-Pesa token: {str(e)}")
            return None

    def initiate_stk_push(self, phone_number, amount, shortcode, account_reference, description):
        """Initiate STK Push request."""
        try:
            consumer_key, consumer_secret, passkey = self._get_credentials(shortcode)
            
            access_token = self.get_access_token(consumer_key, consumer_secret)
            if not access_token:
                return None, "Failed to authenticate with Safaricom"

            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            password_string = f"{shortcode}{passkey}{timestamp}"
            password = base64.b64encode(password_string.encode()).decode()

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            # Ensure phone starts with 254
            if phone_number.startswith("0"):
                phone_number = "254" + phone_number[1:]
            elif not phone_number.startswith("254"):
                phone_number = "254" + phone_number

            payload = {
                "BusinessShortCode": shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),
                "PartyA": phone_number,
                "PartyB": shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": description
            }

            response = requests.post(self.stk_push_url, json=payload, headers=headers)
            response.raise_for_status()
            
            return response.json(), None
            
        except requests.exceptions.HTTPError as e:
            error_msg = response.json().get("errorMessage", str(e))
            current_app.logger.error(f"M-Pesa API Error: {error_msg}")
            return None, error_msg
        except Exception as e:
            current_app.logger.error(f"STK Push failed: {str(e)}")
            return None, str(e)

    def process_callback(self, callback_data):
        """Process callback data from Safaricom."""
        try:
            stk_callback = callback_data.get("Body", {}).get("stkCallback", {})
            result_code = stk_callback.get("ResultCode")
            result_desc = stk_callback.get("ResultDesc")
            checkout_request_id = stk_callback.get("CheckoutRequestID")
            
            success = result_code == 0
            metadata = {}
            
            if success:
                items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
                for item in items:
                    metadata[item["Name"]] = item.get("Value")
            
            return {
                "success": success,
                "checkout_request_id": checkout_request_id,
                "result_desc": result_desc,
                "metadata": metadata,
                "receipt": metadata.get("MpesaReceiptNumber")
            }
        except Exception as e:
            current_app.logger.error(f"Callback processing failed: {str(e)}")
            return None
    def query_stk_status(self, checkout_request_id, shortcode):
        """Query STK Push status."""
        try:
            consumer_key, consumer_secret, passkey = self._get_credentials(shortcode)
            
            access_token = self.get_access_token(consumer_key, consumer_secret)
            if not access_token:
                return None, "Failed to authenticate with Safaricom"

            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            password_string = f"{shortcode}{passkey}{timestamp}"
            password = base64.b64encode(password_string.encode()).decode()

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            payload = {
                "BusinessShortCode": shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id
            }

            # Safaricom query URL
            query_url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query" 
            if "api.safaricom" in self.stk_push_url:
                query_url = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"

            response = requests.post(query_url, json=payload, headers=headers)
            response.raise_for_status()
            
            return response.json(), None
            
        except Exception as e:
            current_app.logger.error(f"STK Query failed: {str(e)}")
            return None, str(e)
