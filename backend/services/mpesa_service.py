import os
from dotenv import load_dotenv

load_dotenv()

# M-Pesa Safaricom Daraja API Credentials
CONSUMER_KEY = os.getenv('CONSUMER_KEY', '')
CONSUMER_SECRET = os.getenv('CONSUMER_SECRET', '')

# Two different business shortcodes
BUSINESS_SHORTCODE_JOYCE = os.getenv('BUSINESS_SHORTCODE_JOYCE', '123456')     # Replace with Joyce’s actual shortcode
BUSINESS_SHORTCODE_LAWRENCE = os.getenv('BUSINESS_SHORTCODE_LAWRENCE', '654321')  # Replace with Lawrence’s actual shortcode

PASSKEY_JOYCE = os.getenv('PASSKEY_JOYCE', '')
PASSKEY_LAWRENCE = os.getenv('PASSKEY_LAWRENCE', '')

CALLBACK_URL = os.getenv('CALLBACK_URL', 'https://your-domain.com/api/payments/confirmation')

# API Endpoints
AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

# Account holder mapping
ACCOUNT_HOLDERS = {
    'Joyce': {
        'name': 'Joyce Muthoni',
        'rooms': list(range(1, 11)),  # Rooms 1–10
        'shortcode': 2536316,
        'paybill_number': 537363437,
        'passkey': GAo00tDPzZRJfPU5IsqzqQ8yoSBbPmO1r50/LhmEsYeDYI1xwcCYXqn/zQVU7pk20s1gJ1B7tRhiU5gyhY/ueuZs2m+wywPJ0zRk5xHLswyUCwchLfsTtlNpzlqqb4j8Nhdq74maQ6HFFvcv5KtANA/ycMM76nQYgfBNOsSBz68KhF8kzeROOBkgP7JQlCbFLje8zyTG2+hi453qegEPio42ywF5nepTRKVON2rHPEghOrKurb3DEuOP2QDpSd8Dwk8g2UFvARixLpY/Os7ZvZI/V8NcrFP3K3YUKzn2kEstaDzTAApAJY/F1HfU1QkAWXxy6xlIvxbTmMxrhcfBrg==
    },
    'Lawrence': {
        'name': 'Lawrence Mathea',
        'rooms': list(range(11, 27)),  # Rooms 11–26
        'shortcode': 54544,
        'paybill_number': 222111,
        'passkey': PGbezSggCYce3IZOBqJCV9pbPW0/eU8n71gOnG0iAjJy5D1OxlLEW1p1MB0xniMz3Rl3ptsN/K9WL6mqYRiK5pKgj6tjEMEMWzOSH890nz/rp2ZepT0N0r+COptBqOUHffABQCcdO7EpZjjen15A9VyFN19i4zDUJIxuLlCDNyBwXtAuc3mI0jasnDAs5TH/TzN8ws7aafB1HAANl+w91YBoXD+cw9lYb6ebY2EWfCNScgBUNo1rNdYZVniDLVldr7v00yLtzQkqhzI+cTcXaEoeooS/TTCBldXFoFcDP8IlMP2SXa+fGAMBs+4eLZhfhMvxZP01JPmROCxwwX+wSTA==
    }
}


def get_access_token():
    """
    Retrieves access token from Safaricom Daraja API.
    
    Returns:
        str: Access token for API authentication
        
    Raises:
        Exception: If token generation fails
    """
    import requests
    from requests.auth import HTTPBasicAuth
    
    try:
        response = requests.get(
            AUTH_URL,
            auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET),
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data.get('access_token')
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to generate access token: {str(e)}")


def get_account_by_room(room_number: int):
    """
    Determines which account (Joyce or Lawrence) should receive payment
    based on room number.
    """
    for account, details in ACCOUNT_HOLDERS.items():
        if room_number in details['rooms']:
            return details
    # Default fallback (Joyce)
    return ACCOUNT_HOLDERS['Joyce']