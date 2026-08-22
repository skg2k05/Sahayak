from unittest.mock import patch
import pytest
from app.repositories.user_repository import UserRepository
from app.core.redis import RedisClient


# ==========================================
# 1. Base Authentication & Registration Tests
# ==========================================

def test_register_user_success(client):
    """Verify user registration returns HTTP 201, safe user payload, and JWT token."""
    payload = {
        "full_name": "Anita Sharma",
        "email": "anita@example.com",
        "phone": "+919876543210",
        "password": "ExamplePassword123",
        "preferred_language": "hi-IN",
        "accessibility_settings": {"high_contrast": True},
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data

    user = data["user"]
    assert user["email"] == "anita@example.com"
    assert user["full_name"] == "Anita Sharma"
    assert user["phone"] == "+919876543210"
    assert user["preferred_language"] == "hi-IN"
    assert user["accessibility_settings"] == {"high_contrast": True}
    assert user["is_active"] is True
    assert "password" not in user
    assert "password_hash" not in user


def test_register_duplicate_email_rejection(client):
    """Verify registration rejects duplicate email addresses with HTTP 400."""
    payload = {
        "full_name": "User One",
        "email": "duplicate@example.com",
        "password": "Password123",
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    payload_duplicate = {
        "full_name": "User Two",
        "email": "duplicate@example.com",
        "password": "DifferentPassword123",
    }
    res2 = client.post("/api/auth/register", json=payload_duplicate)
    assert res2.status_code == 400
    assert "Email already registered" in res2.json()["detail"]


def test_register_duplicate_phone_rejection(client):
    """Verify registration rejects duplicate phone numbers with HTTP 400."""
    payload1 = {
        "full_name": "User One",
        "email": "user1@example.com",
        "phone": "+919999988888",
        "password": "Password123",
    }
    res1 = client.post("/api/auth/register", json=payload1)
    assert res1.status_code == 201

    payload2 = {
        "full_name": "User Two",
        "email": "user2@example.com",
        "phone": "+919999988888",
        "password": "Password123",
    }
    res2 = client.post("/api/auth/register", json=payload2)
    assert res2.status_code == 400
    assert "Phone number already registered" in res2.json()["detail"]


def test_login_user_success(client):
    """Verify successful authentication returns HTTP 200 and access token."""
    reg_payload = {
        "full_name": "Rahul Verma",
        "email": "rahul@example.com",
        "password": "SecretPassword123",
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "rahul@example.com",
        "password": "SecretPassword123",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "rahul@example.com"


def test_login_invalid_password_rejection(client):
    """Verify login with incorrect password returns HTTP 401."""
    reg_payload = {
        "full_name": "Rahul Verma",
        "email": "rahul@example.com",
        "password": "CorrectPassword123",
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "rahul@example.com",
        "password": "WrongPassword123",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_me_without_token(client):
    """Verify GET /api/auth/me without authorization header returns HTTP 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_get_me_with_valid_token(client):
    """Verify GET /api/auth/me with valid bearer token returns user profile."""
    reg_payload = {
        "full_name": "Priya Singh",
        "email": "priya@example.com",
        "password": "PriyaPassword123",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "priya@example.com"
    assert user_data["full_name"] == "Priya Singh"


def test_get_me_with_invalid_token(client):
    """Verify GET /api/auth/me with invalid or forged token returns HTTP 401."""
    headers = {"Authorization": "Bearer invalid.jwt.token.string"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401


def test_password_not_returned_in_api_responses(client):
    """Verify password and password_hash fields are excluded from all API responses."""
    reg_payload = {
        "full_name": "Test Security",
        "email": "security@example.com",
        "password": "SuperSecretPass123",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    user_reg = reg_res.json()["user"]

    assert "password" not in user_reg
    assert "password_hash" not in user_reg

    login_res = client.post(
        "/api/auth/login",
        json={"email": "security@example.com", "password": "SuperSecretPass123"},
    )
    user_login = login_res.json()["user"]
    assert "password" not in user_login
    assert "password_hash" not in user_login

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_me = me_res.json()
    assert "password" not in user_me
    assert "password_hash" not in user_me


def test_password_stored_as_hash_rather_than_plaintext(client, db_session):
    """Verify password is stored as a secure bcrypt hash in the database, never plaintext."""
    plaintext_password = "MySecretPassword123"
    reg_payload = {
        "full_name": "Hash Check",
        "email": "hashcheck@example.com",
        "password": plaintext_password,
    }
    client.post("/api/auth/register", json=reg_payload)

    db_user = UserRepository.get_by_email(db_session, "hashcheck@example.com")
    assert db_user is not None
    assert db_user.password_hash != plaintext_password
    assert db_user.password_hash.startswith("$2b$")


# ==========================================
# 2. Strong Password Validation Tests (Phase B7)
# ==========================================

def test_register_password_too_short_rejected(client):
    """Verify passwords under 8 characters are rejected with HTTP 422."""
    payload = {
        "full_name": "Short Pass User",
        "email": "short@example.com",
        "password": "Pass1",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422
    errors = str(response.json()["detail"]).lower()
    assert "at least 8 characters" in errors


def test_register_password_missing_uppercase_rejected(client):
    """Verify passwords without uppercase letter are rejected with HTTP 422."""
    payload = {
        "full_name": "No Upper User",
        "email": "noupper@example.com",
        "password": "password123",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422
    errors = str(response.json()["detail"]).lower()
    assert "uppercase" in errors


def test_register_password_missing_lowercase_rejected(client):
    """Verify passwords without lowercase letter are rejected with HTTP 422."""
    payload = {
        "full_name": "No Lower User",
        "email": "nolower@example.com",
        "password": "PASSWORD123",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422
    errors = str(response.json()["detail"]).lower()
    assert "lowercase" in errors


def test_register_password_missing_digit_rejected(client):
    """Verify passwords without a digit are rejected with HTTP 422."""
    payload = {
        "full_name": "No Digit User",
        "email": "nodigit@example.com",
        "password": "PasswordAbc",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422
    errors = str(response.json()["detail"]).lower()
    assert "digit" in errors


def test_register_valid_password_accepted(client):
    """Verify valid password meeting all strength requirements is accepted with HTTP 201."""
    payload = {
        "full_name": "Valid Pass User",
        "email": "validpass@example.com",
        "password": "ValidStrongPass123",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    assert "access_token" in response.json()


# ==========================================
# 3. Rate Limiting Tests (Phase B7)
# ==========================================

def test_login_rate_limiting_exceeded_returns_429(client):
    """Verify exceeding login attempt limit returns HTTP 429 Too Many Requests."""
    with patch.object(RedisClient, "increment_rate_limit", return_value=6):
        payload = {
            "email": "ratelimit@example.com",
            "password": "Password123",
        }
        response = client.post("/api/auth/login", json=payload)
        assert response.status_code == 429
        assert "Too many login attempts" in response.json()["detail"]


def test_login_rate_limiting_redis_failure_falls_back_gracefully(client):
    """Verify Redis failure during login does not throw HTTP 500 and allows auth flow."""
    # Register user first
    client.post("/api/auth/register", json={
        "full_name": "Fallback User",
        "email": "fallback.login@example.com",
        "password": "ValidPassword123",
    })

    # When Redis returns None (simulating outage/exception)
    with patch.object(RedisClient, "increment_rate_limit", return_value=None):
        response = client.post("/api/auth/login", json={
            "email": "fallback.login@example.com",
            "password": "ValidPassword123",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()


def test_register_rate_limiting_exceeded_returns_429(client):
    """Verify exceeding registration attempt limit returns HTTP 429 Too Many Requests."""
    with patch.object(RedisClient, "increment_rate_limit", return_value=6):
        payload = {
            "full_name": "Rate Limit User",
            "email": "ratelimit.reg@example.com",
            "password": "ValidPassword123",
        }
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 429
        assert "Too many registration attempts" in response.json()["detail"]


def test_register_rate_limiting_redis_failure_falls_back_gracefully(client):
    """Verify Redis failure during registration does not throw HTTP 500 and allows registration."""
    with patch.object(RedisClient, "increment_rate_limit", return_value=None):
        payload = {
            "full_name": "Fallback Reg User",
            "email": "fallback.reg@example.com",
            "password": "ValidPassword123",
        }
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 201
        assert "access_token" in response.json()
