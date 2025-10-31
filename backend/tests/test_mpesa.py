import pytest
import requests
import requests_mock
from app import create_app

@pytest.fixture
def app():
    app = create_app()
    app.config.update({"TESTING": True})
    return app

@pytest.fixture
def client(app):
    return app.test_client()


def test_mpesa_token_route(client, requests_mock):
    """
    Test the Mpesa token generation route using a mocked response.
    """
    # Mock the Mpesa OAuth endpoint
    token_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    requests_mock.get(token_url, json={"access_token": "mocked_token", "expires_in": "3600"}, status_code=200)

    response = client.get("/api/mpesa/token")  # adjust if your route is different
    data = response.get_json()

    assert response.status_code == 200
    assert "access_token" in data
    assert data["access_token"] == "mocked_token"


def test_mpesa_stk_push_route(client, requests_mock):
    """
    Test Mpesa STK push route with mocked response.
    """
    stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    requests_mock.post(stk_url, json={
        "MerchantRequestID": "12345",
        "CheckoutRequestID": "abcde123",
        "ResponseCode": "0",
        "ResponseDescription": "Success"
    }, status_code=200)

    payload = {
        "amount": 10,
        "phone_number": "254712345678",
        "account_ref": "JoyceSuites"
    }

    response = client.post("/api/mpesa/stkpush", json=payload)
    data = response.get_json()

    assert response.status_code == 200
    assert data["ResponseCode"] == "0"
    assert data["ResponseDescription"] == "Success"
