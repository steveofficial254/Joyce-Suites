
import pytest
from models.base import db
from models.user import User
from models.lease import Lease
from models.property import Property
from datetime import datetime, timedelta

class TestTenant:
    """Test tenant endpoints with real database."""
    
    @pytest.fixture
    def tenant_token(self, client):
        """Create a tenant and return token."""
        client.post('/api/auth/register', json={
            'email': 'tenant_real@test.com',
            'password': 'Password123',
            'full_name': 'Real Tenant',
            'phone': '+254700000001',
            'role': 'tenant',
            'idNumber': '10000001'
        })
        
        response = client.post('/api/auth/login', json={
            'email': 'tenant_real@test.com',
            'password': 'Password123'
        })
        return response.get_json()['token']

    def test_dashboard_access(self, client, tenant_token):
        """Test accessing tenant dashboard."""
        response = client.get('/api/tenant/dashboard', headers={
            'Authorization': f'Bearer {tenant_token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'dashboard' in data

    def test_lease_details(self, client, tenant_token):
        """Test getting lease details."""
        with client.application.app_context():
            user = User.query.filter_by(email='tenant_real@test.com').first()
            
            landlord = User(
                email="landlord@test.com",
                username="landlord",
                first_name="Land",
                last_name="Lord",
                password_hash="hash",
                role="admin",
                national_id=99999999
            )
            db.session.add(landlord)
            db.session.commit()

            prop = Property(
                name="Test Property",
                property_type="one_bedroom",
                rent_amount=15000.0,
                landlord_id=landlord.id,
                description="A nice apartment"
            )
            db.session.add(prop)
            db.session.commit()
            
            lease = Lease(
                tenant_id=user.id,
                property_id=prop.id,
                start_date=datetime.now().date(),
                end_date=datetime.now().date() + timedelta(days=365),
                rent_amount=15000.0
            )
            db.session.add(lease)
            db.session.commit()

        response = client.get('/api/tenant/lease', headers={
            'Authorization': f'Bearer {tenant_token}'
        })
        
        if response.status_code != 200:
            print(f"\nLease details failed: {response.get_json()}")

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['lease']['rent_amount'] == 15000.0

    def test_maintenance_request(self, client, tenant_token):
        """Test creating maintenance request."""
        with client.application.app_context():
            user = User.query.filter_by(email='tenant_real@test.com').first()
            
            landlord = User.query.filter_by(email="landlord2@test.com").first()
            if not landlord:
                landlord = User(
                    email="landlord2@test.com",
                    username="landlord2",
                    first_name="Land",
                    last_name="Lord",
                    password_hash="hash",
                    role="admin",
                    national_id=88888888
                )
                db.session.add(landlord)
                db.session.commit()

            prop = Property(
                name="Test Property 2",
                property_type="one_bedroom",
                rent_amount=15000.0,
                landlord_id=landlord.id,
                description="Another nice apartment"
            )
            db.session.add(prop)
            db.session.commit()
            
            lease = Lease(
                tenant_id=user.id,
                property_id=prop.id,
                start_date=datetime.now().date(),
                end_date=datetime.now().date() + timedelta(days=365),
                rent_amount=15000.0
            )
            db.session.add(lease)
            db.session.commit()

        response = client.post('/api/tenant/maintenance/request', 
            headers={'Authorization': f'Bearer {tenant_token}'},
            json={
                'title': 'Broken Sink',
                'description': 'The sink is leaking',
                'priority': 'normal'
            }
        )
        
        if response.status_code != 201:
            print(f"\nMaintenance request failed: {response.get_json()}")

        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['request']['title'] == 'Broken Sink'
