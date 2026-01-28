"""
Pytest configuration for water bill tests
"""

import pytest
import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from models.base import db


@pytest.fixture(scope='session')
def test_app():
    """Create application for testing"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Import and register blueprints
    from routes.auth_routes import auth_bp
    from routes.rent_deposit import rent_deposit_bp
    from routes.admin_routes import admin_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(rent_deposit_bp)
    app.register_blueprint(admin_bp)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def app(test_app):
    """Create app instance for tests"""
    return test_app
