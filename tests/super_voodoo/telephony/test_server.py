import pytest
from fastapi.testclient import TestClient
from super_voodoo.telephony.server import app

client = TestClient(app)

def test_voice_endpoint():
    response = client.post("/voice")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "<Response>" in response.text
    assert "<Say>" in response.text
    assert "<Stream" in response.text

def test_websocket_connection():
    with client.websocket_connect("/media-stream") as websocket:
        websocket.send_text('{"event": "start", "start": {"streamSid": "test_sid"}}')
        # We don't have a listener for responses yet, but we verify it doesn't crash
        websocket.send_text('{"event": "stop"}')
