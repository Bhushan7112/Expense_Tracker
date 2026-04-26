from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_home():
    res = client.get("/")
    assert res.status_code == 200

def test_get_expenses():
    res = client.get("/expenses")
    assert res.status_code == 200