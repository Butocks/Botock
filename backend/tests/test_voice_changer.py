import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

def test_voice_changer_invalid_file():
    response = client.post(
        "/api/convert/voice-changer",
        files={"file": ("test.txt", b"dummy content", "text/plain")},
        data={"mode": "kid"}
    )
    assert response.status_code == 400
    assert "File must be an audio file" in response.json()["detail"]

def test_voice_changer_invalid_mode():
    response = client.post(
        "/api/convert/voice-changer",
        files={"file": ("test.mp3", b"dummy content", "audio/mpeg")},
        data={"mode": "invalid_mode"}
    )
    assert response.status_code == 400
    assert "Invalid voice mode" in response.json()["detail"]
