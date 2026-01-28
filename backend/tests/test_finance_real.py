
import pytest
from datetime import datetime, timedelta, timezone
from models.base import db
from models.rent_deposit import RentRecord, DepositRecord, RentStatus, DepositStatus
from models.water_bill import WaterBill, WaterBillStatus
from models.lease import Lease
from models.property import Property
from models.user import User

class TestFinanceReal:
    @pytest.fixture(autouse=True)
    def setup_method(self, client, admin_user, caretaker_user, tenant_user):
        """Setup authentication headers and test data."""
        self.client = client
        
        # Login admin
        resp = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        self.admin_token = resp.get_json()['token']
        self.admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Login caretaker
        resp = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        self.caretaker_token = resp.get_json()['token']
        self.caretaker_headers = {'Authorization': f'Bearer {self.caretaker_token}'}
        
        # Login tenant
        resp = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        self.tenant_token = resp.get_json()['token']
        self.tenant_headers = {'Authorization': f'Bearer {self.tenant_token}'}

        # Get actual user IDs
        with client.application.app_context():
            self.tenant = User.query.filter_by(email=tenant_user['email']).first()
            self.caretaker = User.query.filter_by(email=caretaker_user['email']).first()
            self.admin = User.query.filter_by(email=admin_user['email']).first()
            
            # Create a property and lease
            self.prop = Property(
                name="Finance Test Unit",
                property_type="one_bedroom",
                rent_amount=10000,
                deposit_amount=10000,
                status="occupied",
                landlord_id=self.admin.id
            )
            db.session.add(self.prop)
            db.session.flush()
            
            self.lease = Lease(
                tenant_id=self.tenant.id,
                property_id=self.prop.id,
                start_date=datetime.now(timezone.utc).date(),
                end_date=(datetime.now(timezone.utc) + timedelta(days=365)).date(),
                rent_amount=10000,
                status="active"
            )
            db.session.add(self.lease)
            db.session.commit()
            
            self.lease_id = self.lease.id
            self.prop_id = self.prop.id
            self.tenant_id = self.tenant.id

    def test_rent_management(self):
        """Test generating and marking rent payment."""
        # 1. Generate monthly rent
        resp = self.client.post('/api/rent-deposit/rent/generate-monthly', json={
            'month': datetime.now(timezone.utc).month,
            'year': datetime.now(timezone.utc).year
        }, headers=self.caretaker_headers)
        if resp.status_code != 200:
            print(f"DEBUG: generate-monthly failed with {resp.status_code}: {resp.get_json()}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'records' in data
        assert len(data['records']) > 0
        
        rent_id = data['records'][0]['id']
        
        # 2. Get rent records
        resp = self.client.get('/api/rent-deposit/rent/records', headers=self.caretaker_headers)
        assert resp.status_code == 200
        
        # 3. Mark payment
        resp = self.client.post('/api/rent-deposit/rent/mark-payment', json={
            'rent_id': rent_id,
            'amount_paid': 10000,
            'payment_method': 'mpesa',
            'payment_reference': 'TESTREF123',
            'notes': 'Test rent payment'
        }, headers=self.caretaker_headers)
        assert resp.status_code == 200
        assert resp.get_json()['rent_record']['status'] == 'paid'

    def test_deposit_management(self):
        """Test creating and paying deposit."""
        # 1. Create deposit record
        resp = self.client.post('/api/rent-deposit/deposit/create', json={
            'tenant_id': self.tenant_id,
            'property_id': self.prop_id,
            'lease_id': self.lease_id,
            'amount_required': 10000
        }, headers=self.caretaker_headers)
        assert resp.status_code == 201
        deposit_id = resp.get_json()['deposit_record']['id']
        
        # 2. Mark deposit as paid
        resp = self.client.post('/api/rent-deposit/deposit/mark-payment', json={
            'deposit_id': deposit_id,
            'amount_paid': 10000,
            'payment_method': 'mpesa',
            'payment_reference': 'DEPREF123'
        }, headers=self.caretaker_headers)
        assert resp.status_code == 200
        assert resp.get_json()['deposit_record']['status'] == 'paid'

    def test_water_bill_management(self):
        """Test creating and paying water bill."""
        # 1. Create water bill
        resp = self.client.post('/api/rent-deposit/water-bill/create', json={
            'tenant_id': self.tenant_id,
            'property_id': self.prop_id,
            'lease_id': self.lease_id,
            'month': datetime.now(timezone.utc).month,
            'year': datetime.now(timezone.utc).year,
            'reading_date': datetime.now(timezone.utc).isoformat(),
            'previous_reading': 100,
            'current_reading': 110,
            'unit_rate': 100
        }, headers=self.caretaker_headers)
        assert resp.status_code == 201
        data = resp.get_json()
        water_bill_id = data['water_bill']['id']
        assert data['water_bill']['amount_due'] == 1000.0
        
        # 2. Mark as paid
        resp = self.client.post('/api/rent-deposit/water-bill/mark-payment', json={
            'water_bill_id': water_bill_id,
            'amount_paid': 1000,
            'payment_method': 'cash'
        }, headers=self.caretaker_headers)
        assert resp.status_code == 200
        assert resp.get_json()['water_bill']['status'] == 'paid'

    def test_finance_dashboard_summary(self):
        """Test the finance dashboard summary endpoint."""
        resp = self.client.get('/api/rent-deposit/dashboard/summary', headers=self.caretaker_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'rent_summary' in data
        assert 'deposit_summary' in data
        assert 'water_bill_summary' in data
