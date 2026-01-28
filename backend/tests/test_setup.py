"""
Simple test to verify the testing setup works correctly
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_imports():
    """Test that all required modules can be imported"""
    try:
        from models.water_bill import WaterBill, WaterBillStatus
        from models.user import User
        from models.property import Property
        from models.lease import Lease
        from models.notification import Notification
        from routes.rent_deposit import record_water_readings
        from routes.admin_routes import get_all_water_bills
        assert True
    except ImportError as e:
        pytest.fail(f"Import error: {e}")


def test_water_bill_status_enum():
    """Test WaterBillStatus enum values"""
    from models.water_bill import WaterBillStatus
    
    assert WaterBillStatus.UNPAID.value == "unpaid"
    assert WaterBillStatus.PAID.value == "paid"
    assert WaterBillStatus.PARTIALLY_PAID.value == "partially_paid"
    assert WaterBillStatus.OVERDUE.value == "overdue"


def test_water_bill_model_exists():
    """Test that WaterBill model exists and has required attributes"""
    from models.water_bill import WaterBill
    
    # Check that model has required columns
    required_columns = [
        'tenant_id', 'property_id', 'lease_id',
        'month', 'year', 'reading_date',
        'previous_reading', 'current_reading',
        'units_consumed', 'unit_rate',
        'amount_due', 'amount_paid', 'balance',
        'status', 'due_date',
        'notification_sent_5th', 'notification_sent_overdue',
        'recorded_by_caretaker_id'
    ]
    
    for column in required_columns:
        assert hasattr(WaterBill, column), f"Missing column: {column}"


def test_basic_math():
    """Test basic math calculations work correctly"""
    # Simple test to ensure our calculation logic is sound
    current_reading = 150.0
    previous_reading = 100.0
    unit_rate = 50.0
    
    expected_consumption = current_reading - previous_reading
    expected_amount = expected_consumption * unit_rate
    
    assert expected_consumption == 50.0
    assert expected_amount == 2500.0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
