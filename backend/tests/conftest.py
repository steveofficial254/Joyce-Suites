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
