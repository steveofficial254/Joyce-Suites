from app import app
from models import db
from models.property import Unit
from models.tenant import Tenant
from models.payment import Paymentfrom datetime import datetime

# UNITS SEED DATA - All deposits 
units = [
    {"room_no": 1, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Joyce Muthoni"},
    {"room_no": 2, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Joyce Muthoni"},
    {"room_no": 3, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Joyce Muthoni"},
    {"room_no": 4, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Joyce Muthoni"},
    {"room_no": 5, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Joyce Muthoni"},
    {"room_no": 6, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Joyce Muthoni"},
    {"room_no": 8, "room_type": "1-bedroom", "rent_amount": 7500, "deposit_amount": 7900, "payment_account": "Joyce Muthoni"},
    {"room_no": 9, "room_type": "1-bedroom", "rent_amount": 7500, "deposit_amount": 7900, "payment_account": "Joyce Muthoni"},
    {"room_no": 10, "room_type": "1-bedroom", "rent_amount": 7500, "deposit_amount": 7900, "payment_account": "Joyce Muthoni"},
    {"room_no": 11, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 12, "room_type": "bedsitter", "rent_amount": 5500, "deposit_amount": 5900, "payment_account": "Lawrence Mathea"},
    {"room_no": 13, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 14, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 15, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 17, "room_type": "1-bedroom", "rent_amount": 7500, "deposit_amount": 7900, "payment_account": "Lawrence Mathea"},
    {"room_no": 18, "room_type": "1-bedroom", "rent_amount": 7000, "deposit_amount": 7400, "payment_account": "Lawrence Mathea"},
    {"room_no": 19, "room_type": "1-bedroom", "rent_amount": 7500, "deposit_amount": 7900, "payment_account": "Lawrence Mathea"},
    {"room_no": 20, "room_type": "1-bedroom", "rent_amount": 7500, "deposit_amount": 7900, "payment_account": "Lawrence Mathea"},
    {"room_no": 21, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 22, "room_type": "bedsitter", "rent_amount": 5500, "deposit_amount": 5900, "payment_account": "Lawrence Mathea"},
    {"room_no": 23, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 24, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 25, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"},
    {"room_no": 26, "room_type": "bedsitter", "rent_amount": 5000, "deposit_amount": 5400, "payment_account": "Lawrence Mathea"}
]

# Complete payment records from your document - corrected years to 2025
payment_records = [
    {"room_no": 13, "tenant_name": "Ann", "month": "January", "year": 2025, "rent_dep": 3500, "rent": 7000, "water_dep": 3000, "water_bill": 2500, "total_rent": 10100, "payment_date": "2025-01-01", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 14, "tenant_name": "Dennis", "month": "January", "year": 2025, "rent_dep": 2000, "rent": 5000, "water_dep": 4000, "water_bill": 1600, "total_rent": 6000, "payment_date": "2025-01-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "January", "year": 2025, "rent_dep": 2000, "rent": 5000, "water_dep": 4000, "water_bill": 2400, "total_rent": 7000, "payment_date": "2025-01-06", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 2, "tenant_name": "Morseen", "month": "January", "year": 2025, "rent_dep": 2500, "rent": 5000, "water_dep": 4000, "water_bill": 1600, "total_rent": 7500, "payment_date": "2025-01-06", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 8, "tenant_name": "Ann", "month": "January", "year": 2025, "rent_dep": 2500, "rent": 7000, "water_dep": 2400, "water_bill": 2800, "total_rent": 10500, "payment_date": "2025-01-08", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 9, "tenant_name": "Athena", "month": "January", "year": 2025, "rent_dep": 2500, "rent": 5000, "water_dep": 4000, "water_bill": 1700, "total_rent": 9000, "payment_date": "2025-01-13", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Graham", "month": "January", "year": 2025, "rent_dep": 2500, "rent": 5000, "water_dep": 4000, "water_bill": 3200, "total_rent": 7500, "payment_date": "2025-01-15", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Ann", "month": "February", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 2300, "total_rent": 7000, "payment_date": "2025-02-08", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 2, "tenant_name": "Morseen", "month": "February", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5000, "payment_date": "2025-02-11", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 3, "tenant_name": "Patience", "month": "February", "year": 2025, "rent_dep": 2500, "rent": 5000, "water_dep": 0, "water_bill": 1800, "total_rent": 5000, "payment_date": "2025-02-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "February", "year": 2025, "rent_dep": 1000, "rent": 5000, "water_dep": 0, "water_bill": 2400, "total_rent": 6000, "payment_date": "2025-02-11", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Dennis Kemboi", "month": "February", "year": 2025, "rent_dep": 1000, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 6000, "payment_date": "2025-02-11", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Graham", "month": "February", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2025-02-08", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 2, "tenant_name": "Morseen", "month": "March", "year": 2025, "rent_dep": 2500, "rent": 0, "water_dep": 0, "water_bill": 500, "total_rent": 2500, "payment_date": "2025-03-05", "status": "PARTIAL", "payment_method": "Cash"},
    {"room_no": 3, "tenant_name": "Patience", "month": "March", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5000, "total_rent": 10000, "payment_date": "2025-03-18", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 4, "tenant_name": "Vanessa", "month": "March", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4400, "water_bill": 800, "total_rent": 16400, "payment_date": "2025-03-19", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 5, "tenant_name": "Ivy", "month": "March", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4400, "water_bill": 800, "total_rent": 16400, "payment_date": "2025-03-19", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Graham", "month": "March", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 4000, "total_rent": 5000, "payment_date": "2025-03-18", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 11, "tenant_name": "Gloria", "month": "March", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4000, "water_bill": 2100, "total_rent": 16400, "payment_date": "2025-03-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "March", "year": 2025, "rent_dep": 1000, "rent": 5000, "water_dep": 0, "water_bill": 2400, "total_rent": 6200, "payment_date": "2025-03-18", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Kemboi Dennis", "month": "March", "year": 2025, "rent_dep": 1000, "rent": 2000, "water_dep": 0, "water_bill": 3200, "total_rent": 3200, "payment_date": "2025-03-11", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Loise", "month": "March", "year": 2025, "rent_dep": 2000, "rent": 5000, "water_dep": 4000, "water_bill": 1800, "total_rent": 3000, "payment_date": "2025-03-23", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 18, "tenant_name": "Ann", "month": "March", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 2300, "total_rent": 7000, "payment_date": "2025-03-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 20, "tenant_name": "Samuel Mary", "month": "March", "year": 2025, "rent_dep": 3750, "rent": 7500, "water_dep": 4000, "water_bill": 2400, "total_rent": 11650, "payment_date": "2025-03-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 22, "tenant_name": "Michelle", "month": "March", "year": 2025, "rent_dep": 5000, "rent": 1600, "water_dep": 4400, "water_bill": 800, "total_rent": 11500, "payment_date": "2025-03-24", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 25, "tenant_name": "Rebecca", "month": "March", "year": 2025, "rent_dep": 5000, "rent": 1600, "water_dep": 4400, "water_bill": 0, "total_rent": 2000, "payment_date": "2025-03-25", "status": "PARTIAL", "payment_method": "Cash"},
    {"room_no": 26, "tenant_name": "Christine", "month": "March", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4400, "water_bill": 800, "total_rent": 10400, "payment_date": "2025-03-08", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 1, "tenant_name": "Humphrey", "month": "April", "year": 2025, "rent_dep": 5000, "rent": 2000, "water_dep": 0, "water_bill": 1900, "total_rent": 9000, "payment_date": "2025-04-18", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 2, "tenant_name": "Fiona", "month": "April", "year": 2025, "rent_dep": 2000, "rent": 5000, "water_dep": 4400, "water_bill": 900, "total_rent": 10400, "payment_date": "2025-04-25", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 3, "tenant_name": "Symon", "month": "April", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4400, "water_bill": 0, "total_rent": 10400, "payment_date": "2025-04-25", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 4, "tenant_name": "Sharon", "month": "April", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4000, "water_bill": 1600, "total_rent": 6500, "payment_date": "2025-04-25", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 5, "tenant_name": "James", "month": "April", "year": 2025, "rent_dep": 1500, "rent": 5000, "water_dep": 0, "water_bill": 2600, "total_rent": 4000, "payment_date": "2025-04-16", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Graham", "month": "April", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5600, "total_rent": 5000, "payment_date": "2025-04-16", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 11, "tenant_name": "Gloria Maryanne", "month": "April", "year": 2025, "rent_dep": 0, "rent": 0, "water_dep": 0, "water_bill": 1600, "total_rent": 5000, "payment_date": "2025-04-01", "status": "PARTIAL", "payment_method": "In-kind"},
    {"room_no": 12, "tenant_name": "Harrison", "month": "April", "year": 2025, "rent_dep": 5500, "rent": 5500, "water_dep": 4400, "water_bill": 0, "total_rent": 11000, "payment_date": "2025-04-29", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "April", "year": 2025, "rent_dep": 0, "rent": 1000, "water_dep": 0, "water_bill": 2400, "total_rent": 2000, "payment_date": "2025-04-12", "status": "PARTIAL", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Kemboi Dennis", "month": "April", "year": 2025, "rent_dep": 1000, "rent": 5000, "water_dep": 0, "water_bill": 3200, "total_rent": 3200, "payment_date": "2025-04-02", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Loise", "month": "April", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2025-04-01", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 18, "tenant_name": "Ann", "month": "April", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 2400, "total_rent": 7240, "payment_date": "2025-04-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 20, "tenant_name": "Samuel Mary", "month": "April", "year": 2025, "rent_dep": 3750, "rent": 0, "water_dep": 0, "water_bill": 0, "total_rent": 3750, "payment_date": "2025-04-22", "status": "PARTIAL", "payment_method": "M-Pesa"},
    {"room_no": 20, "tenant_name": "Sandra Bethsda Zemlina", "month": "April", "year": 2025, "rent_dep": 7500, "rent": 7500, "water_dep": 4600, "water_bill": 0, "total_rent": 15400, "payment_date": "2025-04-03", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 21, "tenant_name": "Ivy", "month": "April", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 9300, "payment_date": "2025-04-10", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 1, "tenant_name": "Ann", "month": "May", "year": 2025, "rent_dep": 2000, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 7000, "payment_date": "2025-05-04", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 3, "tenant_name": "Symon", "month": "May", "year": 2025, "rent_dep": 5000, "rent": 5000, "water_dep": 4400, "water_bill": 800, "total_rent": 16400, "payment_date": "2025-05-25", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 4, "tenant_name": "Sharon", "month": "May", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2025-05-04", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 5, "tenant_name": "James", "month": "May", "year": 2025, "rent_dep": 1500, "rent": 5000, "water_dep": 4400, "water_bill": 3200, "total_rent": 3500, "payment_date": "2025-05-25", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 6, "tenant_name": "Charity", "month": "May", "year": 2025, "rent_dep": 4000, "rent": 0, "water_dep": 4400, "water_bill": 0, "total_rent": 5400, "payment_date": "2025-05-01", "status": "PARTIAL", "payment_method": "Cash"},
    {"room_no": 11, "tenant_name": "Fiona", "month": "May", "year": 2025, "rent_dep": 2600, "rent": 5000, "water_dep": 4400, "water_bill": 5300, "total_rent": 8000, "payment_date": "2025-05-23", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 12, "tenant_name": "Harrison", "month": "May", "year": 2025, "rent_dep": 5500, "rent": 5500, "water_dep": 4400, "water_bill": 0, "total_rent": 11000, "payment_date": "2025-04-29", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 13, "tenant_name": "Vitalis Dickson", "month": "May", "year": 2025, "rent_dep": 0, "rent": 0, "water_dep": 5200, "water_bill": 0, "total_rent": 2400, "payment_date": "2025-05-16", "status": "PARTIAL", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Dennis Kemboi", "month": "May", "year": 2025, "rent_dep": 0, "rent": 2000, "water_dep": 0, "water_bill": 1600, "total_rent": 2000, "payment_date": "2025-05-18", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Loise", "month": "May", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 2000, "payment_date": "2025-05-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 18, "tenant_name": "Ann", "month": "May", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 1600, "total_rent": 7000, "payment_date": "2025-05-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 1, "tenant_name": "Ann", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5160, "payment_date": "2025-06-16", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 2, "tenant_name": "Morseen", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 2800, "total_rent": 5000, "payment_date": "2025-05-03", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 3, "tenant_name": "Symon", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2025-06-04", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 4, "tenant_name": "Sharon", "month": "June", "year": 2025, "rent_dep": 0, "rent": 3000, "water_dep": 0, "water_bill": 3200, "total_rent": 5000, "payment_date": "2025-06-16", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 5, "tenant_name": "Michael", "month": "June", "year": 2025, "rent_dep": 5000, "rent": 2300, "water_dep": 4000, "water_bill": 800, "total_rent": 1700, "payment_date": "2025-06-16", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Charity", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5000, "payment_date": "2025-06-11", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 11, "tenant_name": "Fiona", "month": "June", "year": 2025, "rent_dep": 0, "rent": 3000, "water_dep": 0, "water_bill": 4400, "total_rent": 3000, "payment_date": "2025-06-02", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 12, "tenant_name": "Harrison", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5500, "water_dep": 0, "water_bill": 1600, "total_rent": 5500, "payment_date": "2025-06-01", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "June", "year": 2025, "rent_dep": 1000, "rent": 0, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2025-06-15", "status": "PARTIAL", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Dennis Vitalis", "month": "June", "year": 2025, "rent_dep": 1000, "rent": 2000, "water_dep": 0, "water_bill": 3200, "total_rent": 3200, "payment_date": "2025-06-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Loise", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5000, "payment_date": "2025-05-26", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 18, "tenant_name": "Ann", "month": "June", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 1600, "total_rent": 7000, "payment_date": "2025-07-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 19, "tenant_name": "Sandra Bethsda Zemlina", "month": "June", "year": 2025, "rent_dep": 0, "rent": 7900, "water_dep": 0, "water_bill": 6700, "total_rent": 7900, "payment_date": "2025-06-04", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 20, "tenant_name": "Samuel Mary", "month": "June", "year": 2025, "rent_dep": 0, "rent": 2180, "water_dep": 0, "water_bill": 0, "total_rent": 3180, "payment_date": "2024-06-13", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 21, "tenant_name": "Ivy", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 500, "total_rent": 5000, "payment_date": "2024-07-03", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 22, "tenant_name": "Kelsey", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-06-04", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 23, "tenant_name": "Michelle", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 2400, "total_rent": 5800, "payment_date": "2024-06-04", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 24, "tenant_name": "Vanessa", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 3700, "total_rent": 5120, "payment_date": "2024-06-06", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 25, "tenant_name": "Rebecca", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 3200, "total_rent": 5000, "payment_date": "2024-05-13", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 26, "tenant_name": "Christine", "month": "June", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 2400, "total_rent": 5400, "payment_date": "2024-06-04", "status": "PAID", "payment_method": "Cash"},
    
    {"room_no": 1, "tenant_name": "Ann", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 4400, "water_bill": 1600, "total_rent": 5460, "payment_date": "2024-07-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 2, "tenant_name": "Morseen", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5290, "payment_date": "2024-07-10", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 3, "tenant_name": "Soy", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-07-02", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 4, "tenant_name": "Sharon", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-07-04", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 5, "tenant_name": "Michael", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-07-02", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Charity", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 2400, "total_rent": 5000, "payment_date": "2024-07-01", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 9, "tenant_name": "Lean", "month": "July", "year": 2025, "rent_dep": 3500, "rent": 7500, "water_dep": 4400, "water_bill": 800, "total_rent": 11400, "payment_date": "2024-07-01", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 11, "tenant_name": "Fiona", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5400, "payment_date": "2024-07-11", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 12, "tenant_name": "Harrison", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5500, "water_dep": 0, "water_bill": 1200, "total_rent": 5600, "payment_date": "2024-07-04", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis Penni", "month": "July", "year": 2025, "rent_dep": 0, "rent": 1900, "water_dep": 0, "water_bill": 0, "total_rent": 1900, "payment_date": "2024-07-11", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Grace", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-07-04", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Loise", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5000, "payment_date": "2024-06-21", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 18, "tenant_name": "Ann", "month": "July", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 1600, "total_rent": 7000, "payment_date": "2024-07-10", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 19, "tenant_name": "Sandra Bethsda Zemlina", "month": "July", "year": 2025, "rent_dep": 0, "rent": 8200, "water_dep": 0, "water_bill": 6600, "total_rent": 8200, "payment_date": "2024-07-06", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 20, "tenant_name": "Hamandi Teresiah", "month": "July", "year": 2025, "rent_dep": 2750, "rent": 1500, "water_dep": 4400, "water_bill": 1600, "total_rent": 5650, "payment_date": "2024-07-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 21, "tenant_name": "Ivy", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-07-05", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 22, "tenant_name": "Kelsey", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5500, "water_dep": 0, "water_bill": 2400, "total_rent": 5740, "payment_date": "2024-07-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 23, "tenant_name": "Michelle", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 500, "total_rent": 5160, "payment_date": "2024-07-05", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 24, "tenant_name": "Vanessa", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-07-01", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 25, "tenant_name": "Rebecca", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 2400, "total_rent": 5240, "payment_date": "2024-07-03", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 26, "tenant_name": "Sylvia Christine", "month": "July", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-07-05", "status": "PAID", "payment_method": "Cash"},
    
    {"room_no": 1, "tenant_name": "Ann", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5160, "payment_date": "2024-08-06", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 2, "tenant_name": "Morseen", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5160, "payment_date": "2024-08-03", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 3, "tenant_name": "Joy", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 800, "total_rent": 5000, "payment_date": "2024-08-25", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 4, "tenant_name": "Jasinot", "month": "August", "year": 2025, "rent_dep": 2000, "rent": 3000, "water_dep": 0, "water_bill": 1600, "total_rent": 7000, "payment_date": "2024-08-09", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 5, "tenant_name": "Michael", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-01", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 6, "tenant_name": "Charity", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 8, "tenant_name": "Nixon Cecilia", "month": "August", "year": 2025, "rent_dep": 4400, "rent": 4500, "water_dep": 0, "water_bill": 0, "total_rent": 11520, "payment_date": "2024-08-30", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 9, "tenant_name": "Leah", "month": "August", "year": 2025, "rent_dep": 4200, "rent": 7500, "water_dep": 0, "water_bill": 1600, "total_rent": 11380, "payment_date": "2024-08-04", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 11, "tenant_name": "Fiona", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5160, "payment_date": "2024-08-08", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 12, "tenant_name": "Danice", "month": "August", "year": 2025, "rent_dep": 0, "rent": 2700, "water_dep": 0, "water_bill": 0, "total_rent": 2700, "payment_date": "2024-08-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 12, "tenant_name": "Harrison", "month": "August", "year": 2025, "rent_dep": 0, "rent": 2700, "water_dep": 0, "water_bill": 0, "total_rent": 5200, "payment_date": "2024-08-02", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "August", "year": 2025, "rent_dep": 5300, "rent": 5300, "water_dep": 0, "water_bill": 0, "total_rent": 0, "payment_date": "2024-08-15", "status": "PARTIAL", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Grace", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-06", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Collins", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 9500, "payment_date": "2024-08-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 17, "tenant_name": "Waimera", "month": "August", "year": 2025, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 1600, "total_rent": 7500, "payment_date": "2024-08-01", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 18, "tenant_name": "Ann", "month": "August", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 0, "total_rent": 7160, "payment_date": "2024-08-09", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 19, "tenant_name": "Sandra Zemlina Bethsda", "month": "August", "year": 2025, "rent_dep": 0, "rent": 4000, "water_dep": 0, "water_bill": 0, "total_rent": 4000, "payment_date": "2024-08-07", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 20, "tenant_name": "Hamandi Teresia", "month": "August", "year": 2025, "rent_dep": 1240, "rent": 7500, "water_dep": 0, "water_bill": 2600, "total_rent": 9000, "payment_date": "2024-08-06", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 21, "tenant_name": "Ivy", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 22, "tenant_name": "Kelsey", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5500, "water_dep": 0, "water_bill": 0, "total_rent": 5400, "payment_date": "2024-08-01", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 23, "tenant_name": "Michelle", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 24, "tenant_name": "Vanessa", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 26, "tenant_name": "Christine", "month": "August", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-08-05", "status": "PAID", "payment_method": "Cash"},
    
    {"room_no": 1, "tenant_name": "Ann", "month": "September", "year": 2025, "rent_dep": 1000, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 6000, "payment_date": "2024-09-12", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 2, "tenant_name": "Valentina", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 4000, "total_rent": 5000, "payment_date": "2024-09-06", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 3, "tenant_name": "Joy", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-09-02", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 4, "tenant_name": "Daramella", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5200, "total_rent": 5000, "payment_date": "2024-09-25", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 6, "tenant_name": "Charity", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-09-02", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 9, "tenant_name": "Leah", "month": "September", "year": 2025, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 4400, "total_rent": 7600, "payment_date": "2024-09-05", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 11, "tenant_name": "Fiona", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 5000, "payment_date": "2024-09-11", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 12, "tenant_name": "Jasinot", "month": "September", "year": 2025, "rent_dep": 2000, "rent": 5500, "water_dep": 4000, "water_bill": 1600, "total_rent": 7500, "payment_date": "2024-09-06", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 13, "tenant_name": "Dickson Vitalis", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-09-06", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 14, "tenant_name": "Grace", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-09-04", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 15, "tenant_name": "Collins", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 4000, "payment_date": "2024-09-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 17, "tenant_name": "Waithera", "month": "September", "year": 2025, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 1600, "total_rent": 7500, "payment_date": "2024-09-27", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 18, "tenant_name": "Ann", "month": "September", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 4400, "total_rent": 7000, "payment_date": "2024-10-05", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 19, "tenant_name": "Leah", "month": "September", "year": 2025, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 0, "total_rent": 7500, "payment_date": "2024-10-01", "status": "PENDING", "payment_method": "Pending"},
    {"room_no": 20, "tenant_name": "Hamandi Teresia", "month": "September", "year": 2024, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 2000, "total_rent": 8000, "payment_date": "2024-09-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 21, "tenant_name": "Ivy", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-10-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 22, "tenant_name": "Kelsey", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5400, "payment_date": "2024-10-06", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 23, "tenant_name": "Michelle", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5200, "water_dep": 0, "water_bill": 0, "total_rent": 5160, "payment_date": "2024-10-05", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 24, "tenant_name": "Vanessa", "month": "September", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5160, "payment_date": "2024-10-01", "status": "PAID", "payment_method": "Cash"},

    {"room_no": 6, "tenant_name": "Lestinon", "month": "October", "year": 2025, "rent_dep": 2000, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 7000, "payment_date": "2024-10-04", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 9, "tenant_name": "Farth", "month": "October", "year": 2025, "rent_dep": 3750, "rent": 7500, "water_dep": 4000, "water_bill": 0, "total_rent": 13400, "payment_date": "2024-09-02", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 11, "tenant_name": "Janice", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5160, "payment_date": "2024-10-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 12, "tenant_name": "Jasinot", "month": "October", "year": 2025, "rent_dep": 1800, "rent": 5500, "water_dep": 4000, "water_bill": 1600, "total_rent": 5300, "payment_date": "2024-10-05", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 14, "tenant_name": "Grace", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-10-04", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 15, "tenant_name": "Collins", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 1600, "total_rent": 4000, "payment_date": "2024-09-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 17, "tenant_name": "Waithera", "month": "October", "year": 2025, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 1600, "total_rent": 7500, "payment_date": "2024-09-27", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 18, "tenant_name": "Ann", "month": "October", "year": 2025, "rent_dep": 0, "rent": 7000, "water_dep": 0, "water_bill": 4000, "total_rent": 7040, "payment_date": "2024-10-05", "status": "PAID", "payment_method": "Bank"},
    {"room_no": 19, "tenant_name": "Leah", "month": "October", "year": 2025, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 0, "total_rent": 7500, "payment_date": "2024-10-01", "status": "PENDING", "payment_method": "Pending"},
    {"room_no": 20, "tenant_name": "Hamandi Teresia", "month": "October", "year": 2024, "rent_dep": 0, "rent": 7500, "water_dep": 0, "water_bill": 8000, "total_rent": 8000, "payment_date": "2024-09-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 21, "tenant_name": "Ivy", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5200, "payment_date": "2024-10-08", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 22, "tenant_name": "Kelsey", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5400, "total_rent": 5400, "payment_date": "2024-10-06", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 23, "tenant_name": "Michelle", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5200, "water_dep": 0, "water_bill": 5160, "total_rent": 5160, "payment_date": "2024-10-05", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 24, "tenant_name": "Vanessa", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5160, "total_rent": 5160, "payment_date": "2024-10-01", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 25, "tenant_name": "Rebecca", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5240, "total_rent": 5240, "payment_date": "2024-10-02", "status": "PAID", "payment_method": "M-Pesa"},
    {"room_no": 26, "tenant_name": "Christine", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 5000, "total_rent": 5000, "payment_date": "2024-09-03", "status": "PAID", "payment_method": "Cash"},
    {"room_no": 1, "tenant_name": "Symon", "month": "October", "year": 2025, "rent_dep": 0, "rent": 5000, "water_dep": 0, "water_bill": 0, "total_rent": 5000, "payment_date": "2024-10-05", "status": "PAID", "payment_method": "M-Pesa"},
]

# SEED FUNCTIONS

def seed_units():
    """Seed all units/rooms into database"""
    for u in units:
        # Check if unit already exists
        existing = Unit.query.filter_by(room_no=u["room_no"]).first()
        if not existing:
            unit = Unit(
                room_no=u["room_no"],
                room_type=u["room_type"],
                rent_amount=u["rent_amount"],
                deposit_amount=u["deposit_amount"],
                payment_account=u["payment_account"]
            )
            db.session.add(unit)
    db.session.commit()
    print(f"✓ Seeded {len(units)} units successfully")

def seed_payments():
    """Seed all payment records into database"""
    for record in payment_records:
        # Check if payment already exists
        existing = Payment.query.filter_by(
            room_no=record["room_no"],
            tenant_name=record["tenant_name"],
            month=record["month"],
            year=record["year"]
        ).first()
        
        if not existing:
            payment = Payment(
                room_no=record["room_no"],
                tenant_name=record["tenant_name"],
                month=record["month"],
                year=record["year"],
                rent_deposit=record["rent_dep"],
                rent_amount=record["rent"],
                water_deposit=record["water_dep"],
                water_bill=record["water_bill"],
                total_rent=record["total_rent"],
                amount_paid=record["total_rent"],
                payment_date=datetime.strptime(record["payment_date"], "%Y-%m-%d"),
                payment_status=record["status"],
                payment_method=record["payment_method"]
            )
            db.session.add(payment)
    db.session.commit()
    print(f"✓ Seeded {len(payment_records)} payment records successfully")

def seed_all():
    """Run all seed functions"""
    print("Starting database seeding...")
    try:
        seed_units()
        seed_payments()
        print("\n✓ Database seeding completed successfully!")
        print(f"  - Total Units: {len(units)}")
        print(f"  - Total Payment Records: {len(payment_records)}")
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error during seeding: {str(e)}")

if __name__ == "__main__":
    seed_all()
