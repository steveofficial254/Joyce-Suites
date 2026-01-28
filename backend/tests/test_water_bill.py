"""
Comprehensive Water Bill System Tests

Tests for:
- WaterBill model functionality
- Caretaker water reading endpoints
- Admin water bill management
- Automatic notifications
- Payment processing
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
from models.water_bill import WaterBill, WaterBillStatus
from models.notification import Notification
from routes.auth_routes import generate_jwt_token
from routes.rent_deposit import record_water_readings, get_tenants_for_water_readings
from routes.admin_routes import get_all_water_bills, get_admin_water_bill_summary


class TestWaterBillModel:
    """Test WaterBill model functionality"""
    
    def test_water_bill_creation(self, app, tenant_user, property_obj, lease_obj, caretaker_user):
        """Test basic water bill creation"""
        with app.app_context():
            water_bill = WaterBill.create_monthly_bill(
                tenant=tenant_user,
                property=property_obj,
                lease=lease_obj,
                current_reading=150.0,
                previous_reading=100.0,
                unit_rate=50.0,
                caretaker_id=caretaker_user.id,
                month=1,
                year=2024
            )
            
            db.session.add(water_bill)
            db.session.commit()
            
            assert water_bill.tenant_id == tenant_user.id
            assert water_bill.property_id == property_obj.id
            assert water_bill.lease_id == lease_obj.id
            assert water_bill.current_reading == 150.0
            assert water_bill.previous_reading == 100.0
            assert water_bill.units_consumed == 50.0
            assert water_bill.amount_due == 2500.0  # 50 * 50.0
            assert water_bill.status == WaterBillStatus.UNPAID
            assert water_bill.recorded_by_caretaker_id == caretaker_user.id
    
    def test_water_bill_calculation(self, app, water_bill_obj):
        """Test water bill amount calculation"""
        with app.app_context():
            water_bill_obj.current_reading = 200.0
            water_bill_obj.previous_reading = 150.0
            water_bill_obj.unit_rate = 60.0
            
            water_bill_obj.calculate_amount()
            
            assert water_bill_obj.units_consumed == 50.0
            assert water_bill_obj.amount_due == 3000.0  # 50 * 60.0
            assert water_bill_obj.balance == 3000.0
    
    def test_water_bill_payment_marking(self, app, water_bill_obj, caretaker_user):
        """Test marking water bill payments"""
        with app.app_context():
            water_bill_obj.mark_payment(
                amount_paid=1500.0,
                caretaker_id=caretaker_user.id,
                payment_method="M-Pesa",
                payment_reference="ABC123",
                notes="Partial payment"
            )
            
            assert water_bill_obj.amount_paid == 1500.0
            assert water_bill_obj.balance == 1500.0
            assert water_bill_obj.status == WaterBillStatus.PARTIALLY_PAID
            assert water_bill_obj.paid_by_caretaker_id == caretaker_user.id
            assert water_bill_obj.payment_method == "M-Pesa"
            assert water_bill_obj.payment_reference == "ABC123"
            assert water_bill_obj.notes == "Partial payment"
    
    def test_water_bill_full_payment(self, app, water_bill_obj, caretaker_user):
        """Test full water bill payment"""
        with app.app_context():
            original_amount = float(water_bill_obj.amount_due)
            
            water_bill_obj.mark_payment(
                amount_paid=original_amount,
                caretaker_id=caretaker_user.id,
                payment_method="Cash"
            )
            
            assert water_bill_obj.amount_paid == original_amount
            assert water_bill_obj.balance == 0.0
            assert water_bill_obj.status == WaterBillStatus.PAID
    
    def test_water_bill_overdue_status(self, app, water_bill_obj):
        """Test overdue status calculation"""
        with app.app_context():
            # Set due date in the past
            past_date = datetime.now(timezone.utc) - timedelta(days=10)
            water_bill_obj.due_date = past_date
            water_bill_obj.calculate_balance()
            
            assert water_bill_obj.status == WaterBillStatus.OVERDUE
    
    def test_notification_timing(self, app, water_bill_obj):
        """Test notification timing logic"""
        with app.app_context():
            now = datetime.now(timezone.utc)
            
            # Test 5th day notification
            water_bill_obj.month = now.month
            water_bill_obj.year = now.year
            water_bill_obj.notification_sent_5th = False
            
            # Mock current day as 5th
            if now.day >= 5:
                assert water_bill_obj.should_send_5th_notification() == True
            else:
                assert water_bill_obj.should_send_5th_notification() == False
            
            # Test after marking notification sent
            water_bill_obj.mark_notification_sent('5th')
            assert water_bill_obj.should_send_5th_notification() == False
    
    def test_negative_consumption_prevention(self, app, tenant_user, property_obj, lease_obj, caretaker_user):
        """Test prevention of negative consumption"""
        with app.app_context():
            water_bill = WaterBill.create_monthly_bill(
                tenant=tenant_user,
                property=property_obj,
                lease=lease_obj,
                current_reading=50.0,  # Lower than previous
                previous_reading=100.0,
                unit_rate=50.0,
                caretaker_id=caretaker_user.id
            )
            
            # Should prevent negative consumption
            assert water_bill.units_consumed == 0.0
            assert water_bill.amount_due == 0.0


class TestWaterBillEndpoints:
    """Test water bill API endpoints"""
    
    def test_record_water_readings_success(self, client, caretaker_headers, tenant_user, property_obj, lease_obj):
        """Test successful water reading recording"""
        with client.application.app_context():
            # Create lease first
            db.session.add(lease_obj)
            db.session.commit()
            
            data = {
                'month': 1,
                'year': 2024,
                'unit_rate': 50.0,
                'readings': [
                    {
                        'tenant_id': tenant_user.id,
                        'current_reading': 150.0,
                        'previous_reading': 100.0
                    }
                ]
            }
            
            response = client.post(
                '/api/rent-deposit/water-bill/record-readings',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['created_bills'] == 1
            assert len(response_data['bills']) == 1
    
    def test_record_water_readings_validation(self, client, caretaker_headers):
        """Test water reading validation"""
        data = {
            'unit_rate': 50.0,
            'readings': []  # Empty readings
        }
        
        response = client.post(
            '/api/rent-deposit/water-bill/record-readings',
            data=json.dumps(data),
            headers=caretaker_headers,
            content_type='application/json'
        )
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert response_data['success'] == False
        assert 'At least one reading is required' in response_data['error']
    
    def test_get_tenants_for_readings(self, client, caretaker_headers, tenant_user, property_obj, lease_obj):
        """Test getting tenants for water readings"""
        with client.application.app_context():
            # Create lease
            db.session.add(lease_obj)
            db.session.commit()
            
            response = client.get(
                '/api/rent-deposit/water-bill/tenants-with-readings?month=1&year=2024',
                headers=caretaker_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert len(response_data['tenants']) == 1
            assert response_data['tenants'][0]['tenant_id'] == tenant_user.id
            assert response_data['tenants'][0]['last_reading'] == 0.0
    
    def test_mark_water_bill_payment(self, client, caretaker_headers, water_bill_obj):
        """Test marking water bill payment"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            data = {
                'bill_id': water_bill_obj.id,
                'amount_paid': 1000.0,
                'payment_method': 'M-Pesa',
                'payment_reference': 'TEST123',
                'notes': 'Test payment'
            }
            
            response = client.post(
                '/api/rent-deposit/water-bill/mark-payment',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['water_bill']['amount_paid'] == 1000.0
    
    def test_send_water_bill_notifications(self, client, caretaker_headers, water_bill_obj):
        """Test sending water bill notifications"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            data = {
                'type': '5th'
            }
            
            response = client.post(
                '/api/rent-deposit/water-bill/send-notifications',
                data=json.dumps(data),
                headers=caretaker_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
    
    def test_water_bill_summary(self, client, caretaker_headers, water_bill_obj):
        """Test water bill summary"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            response = client.get(
                '/api/rent-deposit/water-bill/summary?month=1&year=2024',
                headers=caretaker_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'summary' in response_data
            assert response_data['summary']['total_bills'] == 1


class TestAdminWaterBillEndpoints:
    """Test admin water bill endpoints"""
    
    def test_admin_get_all_water_bills(self, client, admin_headers, water_bill_obj):
        """Test admin getting all water bills"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            response = client.get(
                '/api/admin/water-bills',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert len(response_data['water_bills']) == 1
    
    def test_admin_get_water_bill_details(self, client, admin_headers, water_bill_obj):
        """Test admin getting water bill details"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            response = client.get(
                f'/api/admin/water-bills/{water_bill_obj.id}',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['water_bill']['id'] == water_bill_obj.id
    
    def test_admin_update_water_bill(self, client, admin_headers, water_bill_obj):
        """Test admin updating water bill"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            data = {
                'current_reading': 200.0,
                'unit_rate': 60.0,
                'notes': 'Updated by admin'
            }
            
            response = client.put(
                f'/api/admin/water-bills/{water_bill_obj.id}',
                data=json.dumps(data),
                headers=admin_headers,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert response_data['water_bill']['current_reading'] == 200.0
    
    def test_admin_delete_water_bill(self, client, admin_headers, water_bill_obj):
        """Test admin deleting water bill"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            bill_id = water_bill_obj.id
            
            response = client.delete(
                f'/api/admin/water-bills/{bill_id}',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            
            # Verify deletion
            deleted_bill = WaterBill.query.get(bill_id)
            assert deleted_bill is None
    
    def test_admin_water_bill_summary(self, client, admin_headers, water_bill_obj):
        """Test admin water bill summary"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            response = client.get(
                '/api/admin/water-bills/summary?month=1&year=2024',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'summary' in response_data
            assert response_data['summary']['total_bills'] == 1
            assert 'property_breakdown' in response_data['summary']
            assert 'monthly_trend' in response_data['summary']
    
    def test_admin_export_water_bills(self, client, admin_headers, water_bill_obj):
        """Test admin exporting water bills"""
        with client.application.app_context():
            db.session.add(water_bill_obj)
            db.session.commit()
            
            response = client.get(
                '/api/admin/water-bills/export?month=1&year=2024',
                headers=admin_headers
            )
            
            assert response.status_code == 200
            response_data = json.loads(response.data)
            assert response_data['success'] == True
            assert 'csv_data' in response_data
            assert 'filename' in response_data
            assert len(response_data['csv_data']) > 1  # Header + data


class TestWaterBillEdgeCases:
    """Test water bill edge cases and error handling"""
    
    def test_zero_reading(self, app, tenant_user, property_obj, lease_obj, caretaker_user):
        """Test water bill with zero readings"""
        with app.app_context():
            water_bill = WaterBill.create_monthly_bill(
                tenant=tenant_user,
                property=property_obj,
                lease=lease_obj,
                current_reading=0.0,
                previous_reading=0.0,
                unit_rate=50.0,
                caretaker_id=caretaker_user.id
            )
            
            assert water_bill.units_consumed == 0.0
            assert water_bill.amount_due == 0.0
            assert water_bill.balance == 0.0
    
    def test_very_high_consumption(self, app, tenant_user, property_obj, lease_obj, caretaker_user):
        """Test water bill with very high consumption"""
        with app.app_context():
            water_bill = WaterBill.create_monthly_bill(
                tenant=tenant_user,
                property=property_obj,
                lease=lease_obj,
                current_reading=10000.0,
                previous_reading=1000.0,
                unit_rate=50.0,
                caretaker_id=caretaker_user.id
            )
            
            assert water_bill.units_consumed == 9000.0
            assert water_bill.amount_due == 450000.0
    
    def test_payment_exceeding_amount_due(self, app, water_bill_obj, caretaker_user):
        """Test payment exceeding amount due"""
        with app.app_context():
            original_due = float(water_bill_obj.amount_due)
            overpayment = original_due + 500.0
            
            water_bill_obj.mark_payment(
                amount_paid=overpayment,
                caretaker_id=caretaker_user.id
            )
            
            # Should cap at amount due
            assert water_bill_obj.amount_paid == original_due
            assert water_bill_obj.balance == 0.0
            assert water_bill_obj.status == WaterBillStatus.PAID
    
    def test_invalid_bill_id_payment(self, client, caretaker_headers):
        """Test payment marking with invalid bill ID"""
        data = {
            'bill_id': 99999,
            'amount_paid': 1000.0
        }
        
        response = client.post(
            '/api/rent-deposit/water-bill/mark-payment',
            data=json.dumps(data),
            headers=caretaker_headers,
            content_type='application/json'
        )
        
        assert response.status_code == 404
        response_data = json.loads(response.data)
        assert response_data['success'] == False
        assert 'Water bill not found' in response_data['error']
    
    def test_unauthorized_access(self, client, tenant_headers):
        """Test unauthorized access to caretaker endpoints"""
        response = client.get(
            '/api/rent-deposit/water-bill/tenants-with-readings',
            headers=tenant_headers
        )
        
        # Should return 403 or similar for unauthorized access
        assert response.status_code in [401, 403, 422]


class TestWaterBillNotifications:
    """Test water bill notification system"""
    
    def test_5th_day_notification_creation(self, app, water_bill_obj):
        """Test 5th day notification creation"""
        with app.app_context():
            now = datetime.now(timezone.utc)
            
            # Set up for 5th day notification
            water_bill_obj.month = now.month
            water_bill_obj.year = now.year
            water_bill_obj.notification_sent_5th = False
            
            if water_bill_obj.should_send_5th_notification():
                notification = Notification(
                    user_id=water_bill_obj.tenant_id,
                    title="Water Bill Due",
                    message=f"Your water bill for {water_bill_obj.month}/{water_bill_obj.year} is KES {water_bill_obj.amount_due:,.2f}.",
                    type="water_bill_due",
                    is_read=False
                )
                
                db.session.add(notification)
                water_bill_obj.mark_notification_sent('5th')
                db.session.commit()
                
                assert notification.user_id == water_bill_obj.tenant_id
                assert notification.type == "water_bill_due"
                assert water_bill_obj.notification_sent_5th == True
    
    def test_overdue_notification_creation(self, app, water_bill_obj):
        """Test overdue notification creation"""
        with app.app_context():
            # Set up overdue scenario
            past_date = datetime.now(timezone.utc) - timedelta(days=5)
            water_bill_obj.due_date = past_date
            water_bill_obj.calculate_balance()
            
            if water_bill_obj.should_send_overdue_notification():
                notification = Notification(
                    user_id=water_bill_obj.tenant_id,
                    title="Water Bill Overdue",
                    message=f"Your water bill of KES {water_bill_obj.balance:,.2f} is overdue.",
                    type="water_bill_overdue",
                    is_read=False
                )
                
                db.session.add(notification)
                water_bill_obj.mark_notification_sent('overdue')
                db.session.commit()
                
                assert notification.type == "water_bill_overdue"
                assert water_bill_obj.notification_sent_overdue == True


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
def water_bill_obj(app, tenant_user, property_obj, lease_obj, caretaker_user):
    """Create test water bill"""
    with app.app_context():
        water_bill = WaterBill.create_monthly_bill(
            tenant=tenant_user,
            property=property_obj,
            lease=lease_obj,
            current_reading=150.0,
            previous_reading=100.0,
            unit_rate=50.0,
            caretaker_id=caretaker_user.id,
            month=1,
            year=2024
        )
        return water_bill


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
