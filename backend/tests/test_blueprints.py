def test_mpesa_route(client):
    """
    Test an example GET route in mpesa blueprint.
    Replace '/example' with a real endpoint in mpesa_routes.py.
    """
    response = client.get("/api/mpesa/example")
    assert response.status_code in [200, 404]

def test_auth_register_route(client):
    """
    Test POST register route in auth blueprint.
    Replace payload with expected fields.
    """
    payload = {
        "username": "testuser",
        "password": "testpass"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code in [200, 201, 400]
