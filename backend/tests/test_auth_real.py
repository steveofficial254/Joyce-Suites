
import pytest
from models.base import db
from models.user import User

class TestAuth:
    """Test authentication endpoints with real database."""
    
    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@test.com',
            'password': 'Password123',
            'full_name': 'New User',
            'phone': '+254712345678',
            'role': 'tenant',
            'idNumber': '12345678',
            'roomNumber': '101'
        })
        
        if response.status_code != 201:
            print(f"\nRegistration failed: {response.get_json()}")
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'token' in data
        assert data['user']['email'] == 'newuser@test.com'
        
        # Verify user is in database
        with client.application.app_context():
            user = User.query.filter_by(email='newuser@test.com').first()
            assert user is not None
            assert user.full_name == 'New User'

    def test_register_duplicate_email(self, client):
        """Test registration with existing email."""
        # Register first user
        client.post('/api/auth/register', json={
            'email': 'duplicate@test.com',
            'password': 'Password123',
            'full_name': 'First User',
            'phone': '+254712345678',
            'role': 'tenant',
            'idNumber': '11111111'
        })
        
        # Try to register same email
        response = client.post('/api/auth/register', json={
            'email': 'duplicate@test.com',
            'password': 'Password123',
            'full_name': 'Second User',
            'phone': '+254712345679',
            'role': 'tenant',
            'idNumber': '22222222'
        })
        
        if response.status_code != 409:
            print(f"\nDuplicate registration failed: {response.get_json()}")
            
        assert response.status_code == 409
        data = response.get_json()
        assert data['success'] is False
        assert 'Email already registered' in data['error']

    def test_login_success(self, client):
        """Test successful login."""
        # Register user
        reg_res = client.post('/api/auth/register', json={
            'email': 'login@test.com',
            'password': 'Password123',
            'full_name': 'Login User',
            'phone': '+254712345678',
            'role': 'tenant',
            'idNumber': '33333333'
        })
        if reg_res.status_code != 201:
             print(f"\nLogin setup (registration) failed: {reg_res.get_json()}")

        # Login
        response = client.post('/api/auth/login', json={
            'email': 'login@test.com',
            'password': 'Password123'
        })
        
        if response.status_code != 200:
            print(f"\nLogin failed: {response.get_json()}")
            
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'token' in data
        assert data['user']['email'] == 'login@test.com'

    def test_login_invalid_credentials(self, client):
        """Test login with wrong password."""
        # Register user
        client.post('/api/auth/register', json={
            'email': 'wrongpass@test.com',
            'password': 'Password123',
            'full_name': 'User',
            'phone': '+254712345678',
            'role': 'tenant',
            'idNumber': '44444444'
        })
        
        # Login with wrong password
        response = client.post('/api/auth/login', json={
            'email': 'wrongpass@test.com',
            'password': 'WrongPassword123'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_profile_access(self, client):
        """Test accessing profile with token."""
        # Register and login
        client.post('/api/auth/register', json={
            'email': 'profile@test.com',
            'password': 'Password123',
            'full_name': 'Profile User',
            'phone': '+254712345678',
            'role': 'tenant',
            'idNumber': '55555555'
        })
        
        login_res = client.post('/api/auth/login', json={
            'email': 'profile@test.com',
            'password': 'Password123'
        })
        token = login_res.get_json()['token']
        
        # Access profile
        response = client.get('/api/auth/profile', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['email'] == 'profile@test.com'
