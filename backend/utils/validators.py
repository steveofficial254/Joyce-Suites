import re

def validate_phone_number(phone: str) -> bool:
    """Validate phone number format (Kenya format)."""
    pattern = r"^(\+254|0)[1-9]\d{8}$"
    return re.match(pattern, phone) is not None

def format_phone_number(phone: str) -> str:
    """Format phone number to Kenyan standard 254XXXXXXXXX."""
    phone = re.sub(r'\D', '', phone) # Remove non-digits
    
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('+'):
        phone = phone[1:]
    elif not phone.startswith('254') and len(phone) == 9:
        phone = '254' + phone
        
    return phone
