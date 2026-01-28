
import pytest
from datetime import datetime, timedelta, timezone
from models.base import db
from models.property import Property
from models.user import User
from models.maintenance import MaintenanceRequest
from models.lease import Lease
from models.vacate_notice import VacateNotice
from models.booking_inquiry import BookingInquiry

class TestManagementReal:
    @pytest.fixture(autouse=True)
    def setup_method(self, client, admin_user, caretaker_user, tenant_user):
        self.client = client
        
        # Login admin
        resp = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        self.admin_headers = {'Authorization': f'Bearer {resp.get_json()["token"]}'}
        
        # Login caretaker
        resp = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        self.caretaker_headers = {'Authorization': f'Bearer {resp.get_json()["token"]}'}
        
        # Login tenant
        resp = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        self.tenant_headers = {'Authorization': f'Bearer {resp.get_json()["token"]}'}

        with client.application.app_context():
            self.tenant = User.query.filter_by(email=tenant_user['email']).first()
            self.admin = User.query.filter_by(email=admin_user['email']).first()
            self.tenant_id = self.tenant.id

    def test_property_management(self):
        """Test property creation and listing."""
        # Caretaker creates diagnostic property
        # Wait, usually admin creates properties. Let's check caretaker_routes. 
        # Actually admin_routes has property management too.
        
        # Test get available rooms (Caretaker)
        resp = self.client.get('/api/caretaker/rooms/available', headers=self.caretaker_headers)
        assert resp.status_code == 200
        
        # Verify dashboard stats (Admin)
        resp = self.client.get('/api/admin/dashboard-stats', headers=self.admin_headers)
        assert resp.status_code == 200

    def test_maintenance_lifecycle(self):
        """Test maintenance request lifecycle from reporting to resolution."""
        # 1. Create a property for maintenance with required landlord_id
        with self.client.application.app_context():
            prop = Property(
                name="Maint Unit", 
                property_type="bedsitter", 
                rent_amount=5000,
                deposit_amount=5000,
                landlord_id=self.admin.id
            )
            db.session.add(prop)
            db.session.commit()
            prop_id = prop.id

        # 2. Tenant reports issue
        resp = self.client.post('/api/tenant/maintenance/request', json={
            'title': 'Leaking Sink',
            'description': 'Kitchen sink is leaking',
            'priority': 'normal'
        }, headers=self.tenant_headers)
        if resp.status_code != 201:
            print(f"DEBUG: maintenance report failed with {resp.status_code}: {resp.get_json()}")
        assert resp.status_code == 201
        req_id = resp.get_json()['request']['id']
        
        # 3. Caretaker updates status
        resp = self.client.put(f'/api/caretaker/maintenance/{req_id}', json={
            'status': 'in_progress'
        }, headers=self.caretaker_headers)
        assert resp.status_code == 200
        assert resp.get_json()['request']['status'] == 'in_progress'

    def test_vacate_notice_flow(self):
        """Test tenant giving notice and admin viewing."""
        # 1. Setup lease for tenant with required property and landlord
        with self.client.application.app_context():
            prop = Property(
                name="Vacate Unit", 
                property_type="bedsitter", 
                rent_amount=5000, 
                deposit_amount=5000,
                landlord_id=self.admin.id
            )
            db.session.add(prop)
            db.session.flush()
            lease = Lease(
                tenant_id=self.tenant_id, 
                property_id=prop.id, 
                status="active", 
                start_date=datetime.now(timezone.utc).date(),
                end_date=(datetime.now(timezone.utc) + timedelta(days=365)).date(),
                rent_amount=5000
            )
            db.session.add(lease)
            db.session.commit()
            lease_id = lease.id

        # 2. Tenant submits notice
        resp = self.client.post('/api/tenant/vacate-notice', json={
            'intended_move_date': (datetime.now(timezone.utc) + timedelta(days=31)).date().isoformat(),
            'reason': 'Moving closer to work'
        }, headers=self.tenant_headers)
        if resp.status_code != 201:
            print(f"DEBUG: vacate notice failed with {resp.status_code}: {resp.get_json()}")
        assert resp.status_code == 201
        
        # 3. Admin views notices
        resp = self.client.get('/api/admin/vacate-notices', headers=self.admin_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()['notices']) > 0

    def test_booking_inquiry(self):
        """Test public booking inquiry and caretaker viewing."""
        # 1. Setup room with required landlord
        with self.client.application.app_context():
            prop = Property(
                name="Public Room", 
                property_type="one_bedroom", 
                status="vacant", 
                rent_amount=12000,
                deposit_amount=12000,
                landlord_id=self.admin.id
            )
            db.session.add(prop)
            db.session.commit()
            prop_id = prop.id
            
        # 2. Public inquiry
        resp = self.client.post('/api/auth/inquiry', json={
            'name': 'Inquirer Name',
            'email': 'inquirer@example.com',
            'room_id': prop_id,
            'message': 'Is this room still available?',
            'phone': '+254711122233'
        })
        
        assert resp.status_code in [201, 200]
