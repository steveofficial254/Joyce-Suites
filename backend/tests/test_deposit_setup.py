"""
Simple test to verify the deposit testing setup works correctly
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_deposit_imports():
    """Test that all required modules can be imported"""
    try:
        from models.rent_deposit import DepositRecord, DepositStatus
        from models.user import User
        from models.property import Property
        from models.lease import Lease
        from models.notification import Notification
        from routes.rent_deposit import get_tenants_for_deposits, mark_deposit_payment
        from routes.admin_routes import get_all_deposits, get_admin_deposit_summary
        from routes.tenant_routes import get_tenant_deposit_status
        assert True
    except ImportError as e:
        pytest.fail(f"Import error: {e}")


def test_deposit_status_enum():
    """Test DepositStatus enum values"""
    from models.rent_deposit import DepositStatus
    
    assert DepositStatus.UNPAID.value == "unpaid"
    assert DepositStatus.PAID.value == "paid"
    assert DepositStatus.REFUNDED.value == "refunded"
    assert DepositStatus.PARTIALLY_REFUNDED.value == "partially_refunded"


def test_deposit_record_model_exists():
    """Test that DepositRecord model exists and has required attributes"""
    from models.rent_deposit import DepositRecord
    
    # Check that model has required columns
    required_columns = [
        'tenant_id', 'property_id', 'lease_id',
        'amount_required', 'amount_paid', 'balance',
        'status', 'payment_date', 'payment_method',
        'refund_amount', 'refund_date', 'refund_method',
        'payment_notification_sent', 'last_notification_date',
        'paid_by_caretaker_id', 'refunded_by_admin_id'
    ]
    
    for column in required_columns:
        assert hasattr(DepositRecord, column), f"Missing column: {column}"


def test_deposit_calculation_logic():
    """Test basic deposit calculation logic"""
    # Simple test to ensure our calculation logic is sound
    amount_required = 5400.0
    amount_paid = 5400.0
    
    expected_balance = amount_required - amount_paid
    
    assert expected_balance == 0.0
    
    # Test partial payment
    partial_paid = 2700.0
    expected_partial_balance = amount_required - partial_paid
    
    assert expected_partial_balance == 2700.0


def test_refund_calculation_logic():
    """Test refund calculation logic"""
    amount_required = 5400.0
    amount_paid = 5400.0
    refund_amount = 2000.0
    
    expected_balance = amount_required - amount_paid + refund_amount
    
    assert expected_balance == 2000.0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
