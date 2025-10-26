def test_home_route(client):
    """
    Test the root '/' route.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.get_json()
    assert "message" in data
    assert data["message"] == "✅ Joyce Suites Backend is running successfully!"
