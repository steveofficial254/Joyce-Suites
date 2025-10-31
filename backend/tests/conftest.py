
"""
tests/conftest.py - Pytest configuration and shared fixtures

This file is automatically discovered by pytest and provides fixtures
for all test modules in the tests directory.
"""

import pytest
import os
import sys

# Add backend directory to Python path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from app import create_app
from models.base import db
from werkzeug.security import generate_password_hash


@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    os.environ['TESTING'] = 'True'
    os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['JWT_SECRET_KEY'] = 'test-secret-key-do-not-use-in-production'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's CLI."""
    return app.test_cli_runner()


@pytest.fixture
def db_session(app):
    """Reset database for each test."""
    with app.app_context():
        yield db
        db.session.rollback()


@pytest.fixture(autouse=True)
def clear_blacklist(app):
    """Clear the token blacklist before each test to avoid cross-test contamination."""
    # Import here to avoid circular imports
    from routes.auth_routes import blacklisted_tokens
    blacklisted_tokens.clear()
    yield
    blacklisted_tokens.clear()


@pytest.fixture(autouse=True)
def patch_tenant_decorator(app):
    """
    Patch tenant_required decorator to properly validate tokens.
    
    The key insight: tenant_required must call token_required BEFORE
    checking the tenant role. This ensures the token is validated and
    request.user_role is set.
    """
    from routes import tenant_routes
    from routes.auth_routes import token_required
    from functools import wraps
    from flask import request, jsonify
    
    # Store original
    original_tenant_required = tenant_routes.tenant_required
    
    def patched_tenant_required(f):
        """Patched tenant_required that chains with token_required."""
        @token_required  # Apply token_required FIRST (bottom decorator)
        @wraps(f)
        def decorated(*args, **kwargs):
            # At this point, token_required has already validated the token
            # and set request.user_id and request.user_role
            
            if not hasattr(request, 'user_role') or request.user_role != "tenant":
                return jsonify({
                    "success": False,
                    "error": "Forbidden: Tenant access required"
                }), 403
            
            # All checks passed, call the actual route handler
            return f(*args, **kwargs)
        
        return decorated
    
    # Monkey patch the decorator
    tenant_routes.tenant_required = patched_tenant_required
    
    yield
    
    # Restore original
    tenant_routes.tenant_required = original_tenant_required


@pytest.fixture
def admin_user(client):
    """Create an admin user for testing using the API."""
    user_data = {
        'email': 'admin@test.com',
        'password': 'Admin@123456',
        'confirm_password': 'Admin@123456',
        'full_name': 'Admin User',
        'phone': '+254712345678',
        'role': 'admin'
    }
    response = client.post('/api/auth/register', json=user_data)
    
    return {
        'email': user_data['email'],
        'password': user_data['password'],
        'full_name': user_data['full_name'],
        'phone': user_data['phone'],
        'role': user_data['role']
    }


@pytest.fixture
def caretaker_user(client):
    """Create a caretaker user for testing using the API."""
    user_data = {
        'email': 'caretaker@test.com',
        'password': 'Caretaker@123456',
        'confirm_password': 'Caretaker@123456',
        'full_name': 'Caretaker User',
        'phone': '+254723456789',
        'role': 'caretaker'
    }
    response = client.post('/api/auth/register', json=user_data)
    
    return {
        'email': user_data['email'],
        'password': user_data['password'],
        'full_name': user_data['full_name'],
        'phone': user_data['phone'],
        'role': user_data['role']
    }


@pytest.fixture
def tenant_user(client):
    """Create a tenant user for testing using the API."""
    user_data = {
        'email': 'tenant@test.com',
        'password': 'Tenant@123456',
        'confirm_password': 'Tenant@123456',
        'full_name': 'Tenant User',
        'phone': '+254734567890',
        'role': 'tenant'
    }
    response = client.post('/api/auth/register', json=user_data)
    
    return {
        'email': user_data['email'],
        'password': user_data['password'],
        'full_name': user_data['full_name'],
        'phone': user_data['phone'],
        'role': user_data['role']
    }


@pytest.fixture
def auth_headers(client, admin_user):
    """Get JWT auth headers for admin user."""
    response = client.post('/api/auth/login', json={
        'email': admin_user['email'],
        'password': admin_user['password']
    })
    data = response.get_json()
    if data and data.get('success') and 'token' in data:
        return {'Authorization': f'Bearer {data["token"]}'}
    return {}


def get_jwt_token(client, email, password):
    """Helper function to get JWT token for a user."""
    response = client.post('/api/auth/login', json={
        'email': email,
        'password': password
    })
    data = response.get_json()
    return data.get('token') if data and data.get('success') else None
=======
import pytest
from app import create_app

@pytest.fixture
def app():
    """
    Creates a Flask app instance for testing.
    """
    app = create_app()
    app.config.update({
        "TESTING": True,  # Enable testing mode
    })
    return app

@pytest.fixture
def client(app):
    """
    Test client for sending HTTP requests.
    """
    return app.test_client()

@pytest.fixture
def runner(app):
    """
    Test runner for invoking CLI commands.
    """
    return app.test_cli_runner()
>>>>>>> main
