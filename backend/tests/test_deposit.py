"""
Comprehensive Deposit System Tests

Tests for:
- DepositRecord model functionality
- Caretaker deposit management endpoints
- Admin deposit oversight endpoints
- Tenant deposit viewing endpoints
- Automatic notifications
- Payment processing
- Refund management
- Data validation and edge cases
"""

import pytest
import json
from datetime import datetime, timezone, timedelta
from flask import Flask
from models.base import db
from models.user import User
from models.property import Property
from models.lease import Lease
from models.rent_deposit import DepositRecord, DepositStatus
from models.notification import Notification
from routes.auth_routes import generate_jwt_token
from routes.rent_deposit import get_tenants_for_deposits, mark_deposit_payment, update_deposit_status
from routes.admin_routes import get_all_deposits, get_admin_deposit_summary
from routes.tenant_routes import get_tenant_deposit_status


class TestDepositRecordModel:
    """Test DepositRecord model functionality"""
    
    def test_deposit_record_creation(self, app, tenant_user, property_obj, lease_obj):
        """Test basic deposit record creation"""
        with app.app_context():
            deposit_record = DepositRecord.create_deposit_record(
                tenant=tenant_user,
                property_obj=property_obj,
                lease=lease_obj,
                amount_required=5400.0
            )
            
            db.session.add(deposit_record)
            db.session.commit()
            
            assert deposit_record.tenant_id == tenant_user.id
            assert deposit_record.property_id == property_obj.id
            assert deposit_record.lease_id == lease_obj.id
            assert deposit_record.amount_required == 5400.0
            assert deposit_record.amount_paid == 0.0
            assert deposit_record.balance == 5400.0
            assert deposit_record.status == DepositStatus.UNPAID
    
    def test_deposit_payment_marking(self, app, deposit_record_obj, caretaker_user):
        """Test marking deposit payments"""
        with app.app_context():
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=caretaker_user.id,
                payment_method="M-Pesa",
                payment_reference="DEP123",
                notes="Full deposit payment"
            )
            
            assert deposit_record_obj.amount_paid == 5400.0
            assert deposit_record_obj.balance == 0.0
            assert deposit_record_obj.status == DepositStatus.PAID
            assert deposit_record_obj.paid_by_caretaker_id == caretaker_user.id
            assert deposit_record_obj.payment_method == "M-Pesa"
            assert deposit_record_obj.payment_reference == "DEP123"
            assert deposit_record_obj.notes == "Full deposit payment"
    
    def test_partial_deposit_payment(self, app, deposit_record_obj, caretaker_user):
        """Test partial deposit payment"""
        with app.app_context():
            deposit_record_obj.mark_payment(
                amount_paid=2700.0,
                caretaker_id=caretaker_user.id,
                payment_method="Cash",
                notes="Partial payment"
            )
            
            assert deposit_record_obj.amount_paid == 2700.0
            assert deposit_record_obj.balance == 2700.0
            assert deposit_record_obj.status == DepositStatus.PAID  # Still marked as paid
    
    def test_deposit_refund_processing(self, app, deposit_record_obj, admin_user):
        """Test deposit refund processing"""
        with app.app_context():
            # First mark as paid
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=1  # Dummy caretaker
            )
            
            # Process refund
            deposit_record_obj.mark_refund(
                refund_amount=5400.0,
                admin_id=admin_user.id,
                refund_method="Bank Transfer",
                refund_reference="REF123",
                refund_notes="Full refund"
            )
            
            assert deposit_record_obj.refund_amount == 5400.0
            assert deposit_record_obj.status == DepositStatus.REFUNDED
            assert deposit_record_obj.refunded_by_admin_id == admin_user.id
            assert deposit_record_obj.refund_method == "Bank Transfer"
            assert deposit_record_obj.refund_reference == "REF123"
            assert deposit_record_obj.refund_notes == "Full refund"
    
    def test_partial_deposit_refund(self, app, deposit_record_obj, admin_user):
        """Test partial deposit refund"""
        with app.app_context():
            # First mark as paid
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=1  # Dummy caretaker
            )
            
            # Process partial refund
            deposit_record_obj.mark_refund(
                refund_amount=2000.0,
                admin_id=admin_user.id,
                refund_method="Cash",
                refund_notes="Partial refund"
            )
            
            assert deposit_record_obj.refund_amount == 2000.0
            assert deposit_record_obj.status == DepositStatus.PARTIALLY_REFUNDED
    
    def test_deposit_notification_tracking(self, app, deposit_record_obj):
        """Test deposit notification tracking"""
        with app.app_context():
            assert deposit_record_obj.payment_notification_sent == False
            
            deposit_record_obj.mark_payment_notification_sent()
            
            assert deposit_record_obj.payment_notification_sent == True
            assert deposit_record_obj.last_notification_date is not None
    
    def test_deposit_calculation_edge_cases(self, app, tenant_user, property_obj, lease_obj):
        """Test deposit calculation edge cases"""
        with app.app_context():
            # Test zero amount
            deposit_record = DepositRecord.create_deposit_record(
                tenant=tenant_user,
                property_obj=property_obj,
                lease=lease_obj,
                amount_required=0.0
            )
            
            assert deposit_record.amount_required == 0.0
            assert deposit_record.balance == 0.0
            assert deposit_record.status == DepositStatus.PAID  # Zero amount is considered paid


class TestDepositEndpoints:
    """Test deposit API endpoints"""
    
    def test_get_tenants_for_deposits(self, client, caretaker_headers, tenant_user, property_obj, lease_obj):
        """Test getting tenants for deposit management"""
        with client.application.app_context():
            # Create lease first
            db.session.add(lease_obj)
            db.session.commit()
            
            response = client.get(
                '/api/rent-deposit/deposit/tenants-with-deposits',
                headers=caretaker_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert len(response_data['tenants']) == 1
            assert response_data['tenants'][0]['tenant_id'] == tenant_user.id
            assert 'deposit_record' in response_data['tenants'][0]
    
    def test_mark_deposit_payment_success(self, client, caretaker_headers, deposit_record_obj):
        """Test successful deposit payment marking"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            data = {
                'deposit_id': deposit_record_obj.id,
                'amount_paid': 5400.0,
                'payment_method': 'M-Pesa',
                'payment_reference': 'TEST123',
                'notes': 'Test payment',
                'send_notification': True
            }
            
            response = client.post(
                '/api/rent-deposit/deposit/mark-payment',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['deposit_record']['amount_paid'] == 5400.0
            assert response_data['deposit_record']['status'] == 'paid'
    
    def test_update_deposit_status_to_paid(self, client, caretaker_headers, deposit_record_obj):
        """Test updating deposit status to paid"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            data = {
                'deposit_id': deposit_record_obj.id,
                'status': 'paid',
                'amount_paid': 5400.0,
                'payment_method': 'Cash',
                'send_notification': True
            }
            
            response = client.post(
                '/api/rent-deposit/deposit/update-status',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['deposit_record']['status'] == 'paid'
    
    def test_update_deposit_status_to_unpaid(self, client, caretaker_headers, deposit_record_obj):
        """Test updating deposit status to unpaid"""
        with client.application.app_context():
            # First mark as paid
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=1
            )
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            data = {
                'deposit_id': deposit_record_obj.id,
                'status': 'unpaid',
                'notes': 'Payment cancelled',
                'send_notification': True
            }
            
            response = client.post(
                '/api/rent-deposit/deposit/update-status',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['deposit_record']['status'] == 'unpaid'
            assert response_data['deposit_record']['amount_paid'] == 0.0
    
    def test_deposit_summary(self, client, caretaker_headers, deposit_record_obj):
        """Test deposit summary statistics"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            response = client.get(
                '/api/rent-deposit/deposit/summary',
                headers=caretaker_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'summary' in response_data
            assert response_data['summary']['total_deposits'] == 1
            assert response_data['summary']['total_amount_required'] == 5400.0
    
    def test_deposit_payment_validation(self, client, caretaker_headers):
        """Test deposit payment validation"""
        data = {
            'amount_paid': 1000.0
            # Missing deposit_id
        }
        
        response = client.post(
            '/api/rent-deposit/deposit/mark-payment',
            data=json.dumps(data),
            headers=caretaker_headers,
            content_type='application/json'
        )
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert response_data['success'] == False
        assert 'Deposit ID and amount paid are required' in response_data['error']


class TestAdminDepositEndpoints:
    """Test admin deposit endpoints"""
    
    def test_admin_get_all_deposits(self, client, admin_headers, deposit_record_obj):
        """Test admin getting all deposits"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            response = client.get(
                '/api/admin/deposits',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert len(response_data['deposits']) == 1
    
    def test_admin_get_deposit_details(self, client, admin_headers, deposit_record_obj):
        """Test admin getting deposit details"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            response = client.get(
                f'/api/admin/deposits/{deposit_record_obj.id}',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['deposit']['id'] == deposit_record_obj.id
    
    def test_admin_update_deposit(self, client, admin_headers, deposit_record_obj):
        """Test admin updating deposit"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            data = {
                'amount_required': 6000.0,
                'notes': 'Updated by admin'
            }
            
            response = client.put(
                f'/api/admin/deposits/{deposit_record_obj.id}',
                data=json.dumps(data),
                headers=admin_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['deposit']['amount_required'] == 6000.0
    
    def test_admin_process_refund(self, client, admin_headers, deposit_record_obj):
        """Test admin processing refund"""
        with client.application.app_context():
            # First mark as paid
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=1
            )
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            data = {
                'deposit_id': deposit_record_obj.id,
                'refund_amount': 2700.0,
                'refund_method': 'Bank Transfer',
                'refund_reference': 'REF123',
                'refund_notes': 'Partial refund',
                'send_notification': True
            }
            
            response = client.post(
                '/api/admin/deposits/refund',
                data=json.dumps(data),
                headers=admin_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['deposit']['status'] == 'partially_refunded'
    
    def test_admin_delete_deposit(self, client, admin_headers, deposit_record_obj):
        """Test admin deleting deposit"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            deposit_id = deposit_record_obj.id
            
            response = client.delete(
                f'/api/admin/deposits/{deposit_id}',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            
            # Verify deletion
            deleted_deposit = DepositRecord.query.get(deposit_id)
            assert deleted_deposit is None
    
    def test_admin_deposit_summary(self, client, admin_headers, deposit_record_obj):
        """Test admin deposit summary"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            response = client.get(
                '/api/admin/deposits/summary',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'summary' in response_data
            assert response_data['summary']['total_deposits'] == 1
            assert 'property_breakdown' in response_data['summary']
            assert 'monthly_trend' in response_data['summary']
    
    def test_admin_export_deposits(self, client, admin_headers, deposit_record_obj):
        """Test admin exporting deposits"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            response = client.get(
                '/api/admin/deposits/export',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'csv_data' in response_data
            assert 'filename' in response_data
            assert len(response_data['csv_data']) > 1  # Header + data


class TestTenantDepositEndpoints:
    """Test tenant deposit endpoints"""
    
    def test_tenant_get_deposit_status(self, client, tenant_headers, tenant_user, property_obj, lease_obj):
        """Test tenant getting deposit status"""
        with client.application.app_context():
            # Create lease first
            db.session.add(lease_obj)
            db.session.commit()
            
            response = client.get(
                '/api/tenant/deposit/status',
                headers=tenant_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'deposit' in response_data
            assert response_data['deposit']['status'] == 'unpaid'
    
    def test_tenant_get_payment_history(self, client, tenant_headers, tenant_user, property_obj, lease_obj, deposit_record_obj):
        """Test tenant getting payment history"""
        with client.application.app_context():
            # Create lease and deposit
            db.session.add(lease_obj)
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            response = client.get(
                '/api/tenant/deposit/payment-history',
                headers=tenant_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'deposit' in response_data
            assert 'payment_history' in response_data
    
    def test_tenant_no_active_lease(self, client, tenant_headers, tenant_user):
        """Test tenant with no active lease"""
        response = client.get(
            '/api/tenant/deposit/status',
            headers=tenant_headers
        )
        
        assert response.status_code == 404
        response_data = json.loads(response.data)
        assert response_data['success'] == False
        assert 'No active lease found' in response_data['error']


class TestDepositEdgeCases:
    """Test deposit edge cases and error handling"""
    
    def test_zero_deposit_amount(self, app, tenant_user, property_obj, lease_obj):
        """Test deposit with zero amount"""
        with app.app_context():
            deposit_record = DepositRecord.create_deposit_record(
                tenant=tenant_user,
                property_obj=property_obj,
                lease=lease_obj,
                amount_required=0.0
            )
            
            assert deposit_record.amount_required == 0.0
            assert deposit_record.balance == 0.0
            assert deposit_record.status == DepositStatus.PAID
    
    def test_overpayment_handling(self, app, deposit_record_obj, caretaker_user):
        """Test handling of overpayment"""
        with app.app_context():
            original_required = float(deposit_record_obj.amount_required)
            overpayment = original_required + 1000.0
            
            deposit_record_obj.mark_payment(
                amount_paid=overpayment,
                caretaker_id=caretaker_user.id
            )
            
            # Should cap at amount required
            assert deposit_record_obj.amount_paid == original_required
            assert deposit_record_obj.balance == 0.0
            assert deposit_record_obj.status == DepositStatus.PAID
    
    def test_invalid_deposit_id_payment(self, client, caretaker_headers):
        """Test payment marking with invalid deposit ID"""
        data = {
            'deposit_id': 99999,
            'amount_paid': 1000.0
        }
        
        response = client.post(
            '/api/rent-deposit/deposit/mark-payment',
            data=json.dumps(data),
            headers=caretaker_headers,
            content_type='application/json'
        )
        
        assert response.status_code == 404
        response_data = json.loads(response.data)
        assert response_data['success'] == False
        assert 'Deposit record not found' in response_data['error']
    
    def test_invalid_status_update(self, client, caretaker_headers, deposit_record_obj):
        """Test invalid status update"""
        with client.application.app_context():
            db.session.add(deposit_record_obj)
            db.session.commit()
            
            data = {
                'deposit_id': deposit_record_obj.id,
                'status': 'invalid_status'
            }
            
            response = client.post(
                '/api/rent-deposit/deposit/update-status',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 400
            response_data = json.loads(response.data)
            assert response_data['success'] == False
            assert 'Status must be "paid" or "unpaid"' in response_data['error']
    
    def test_unauthorized_access(self, client, tenant_headers):
        """Test unauthorized access to caretaker endpoints"""
        response = client.get(
            '/api/rent-deposit/deposit/tenants-with-deposits',
            headers=tenant_headers
        )
        
        # Should return 403 or similar for unauthorized access
        assert response.status_code in [401, 403, 422]


class TestDepositNotifications:
    """Test deposit notification system"""
    
    def test_payment_notification_creation(self, app, deposit_record_obj, caretaker_user):
        """Test payment notification creation"""
        with app.app_context():
            # Mark payment
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=caretaker_user.id
            )
            
            # Create notification
            notification = Notification(
                user_id=deposit_record_obj.tenant_id,
                title="Deposit Payment Confirmed",
                message=f"Your deposit payment of KES {deposit_record_obj.amount_paid:,.2f} has been confirmed.",
                type="deposit_payment",
                is_read=False
            )
            
            db.session.add(notification)
            deposit_record_obj.mark_payment_notification_sent()
            db.session.commit()
            
            assert notification.user_id == deposit_record_obj.tenant_id
            assert notification.type == "deposit_payment"
            assert deposit_record_obj.payment_notification_sent == True
    
    def test_refund_notification_creation(self, app, deposit_record_obj, admin_user):
        """Test refund notification creation"""
        with app.app_context():
            # Mark as paid first
            deposit_record_obj.mark_payment(
                amount_paid=5400.0,
                caretaker_id=1
            )
            
            # Process refund
            deposit_record_obj.mark_refund(
                refund_amount=2700.0,
                admin_id=admin_user.id
            )
            
            # Create notification
            notification = Notification(
                user_id=deposit_record_obj.tenant_id,
                title="Deposit Refund Processed",
                message=f"Your deposit refund of KES {deposit_record_obj.refund_amount:,.2f} has been processed.",
                type="deposit_refund",
                is_read=False
            )
            
            db.session.add(notification)
            db.session.commit()
            
            assert notification.type == "deposit_refund"
            assert deposit_record_obj.status == DepositStatus.PARTIALLY_REFUNDED


# Pytest fixtures for test setup
@pytest.fixture
def app():
    """Create test Flask app"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def tenant_user(app):
    """Create test tenant user"""
    with app.app_context():
        user = User(
            email='tenant@test.com',
            username='test_tenant',
            first_name='Test',
            last_name='Tenant',
            role='tenant',
            is_active=True
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def caretaker_user(app):
    """Create test caretaker user"""
    with app.app_context():
        user = User(
            email='caretaker@test.com',
            username='test_caretaker',
            first_name='Test',
            last_name='Caretaker',
            role='caretaker',
            is_active=True
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def admin_user(app):
    """Create test admin user"""
    with app.app_context():
        user = User(
            email='admin@test.com',
            username='test_admin',
            first_name='Test',
            last_name='Admin',
            role='admin',
            is_active=True
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def property_obj(app):
    """Create test property"""
    with app.app_context():
        prop = Property(
            name='Test Property',
            property_type='bedsitter',
            rent_amount=5000.0,
            deposit_amount=5400.0,
            status='vacant'
        )
        db.session.add(prop)
        db.session.commit()
        return prop


@pytest.fixture
def lease_obj(app, tenant_user, property_obj):
    """Create test lease"""
    with app.app_context():
        lease = Lease(
            tenant_id=tenant_user.id,
            property_id=property_obj.id,
            start_date=datetime.now(timezone.utc),
            end_date=datetime.now(timezone.utc) + timedelta(days=365),
            rent_amount=5000.0,
            deposit_amount=5400.0,
            status='active'
        )
        return lease


@pytest.fixture
def deposit_record_obj(app, tenant_user, property_obj, lease_obj):
    """Create test deposit record"""
    with app.app_context():
        deposit_record = DepositRecord.create_deposit_record(
            tenant=tenant_user,
            property_obj=property_obj,
            lease=lease_obj,
            amount_required=5400.0
        )
        return deposit_record


@pytest.fixture
def tenant_headers(tenant_user):
    """Create tenant auth headers"""
    token = generate_jwt_token(tenant_user.id, tenant_user.role)
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }


@pytest.fixture
def caretaker_headers(caretaker_user):
    """Create caretaker auth headers"""
    token = generate_jwt_token(caretaker_user.id, caretaker_user.role)
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }


@pytest.fixture
def admin_headers(admin_user):
    """Create admin auth headers"""
    token = generate_jwt_token(admin_user.id, admin_user.role)
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
