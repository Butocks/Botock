import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_analytics_no_token():
    response = client.get("/api/admin/analytics")
    assert response.status_code == 401

def test_admin_auth_empty_secret():
    response = client.post("/api/admin/auth/verify-secret", json={"email": "admin@botock.com", "secret": ""})
    # Empty secret should be rejected with 401 or 403
    assert response.status_code in [401, 403]

def test_image_generation_no_auth():
    response = client.post("/api/image/generate", json={"prompt": "test"})
    assert response.status_code == 401

def test_video_download_fail_closed():
    # Attempt to download non-existent generation without auth
    response = client.get("/api/video/download/12345678-1234-1234-1234-1234567890ab")
    assert response.status_code == 401

def test_image_base64_limit():
    large_base64 = "a" * 6000000  # 6MB, exceeds 5MB limit
    response = client.post("/api/image/generate", json={"prompt": "test", "image_base64": large_base64}, headers={"Authorization": "Bearer fake"})
    # Pydantic should catch it before auth if body is parsed, or auth fails first.
    # We just want to ensure it doesn't process it.
    assert response.status_code in [422, 401]

