from datetime import datetime, timezone, timedelta
from decimal import Decimal
from unittest.mock import MagicMock, patch
import uuid
import pytest

from app.models.user import User
from app.models.account import Account
from app.models.payee import Payee
from app.models.transaction import Transaction
from app.core.security import hash_password, create_access_token
from app.core.redis import RedisClient


@pytest.fixture
def user_and_auth(db_session):
    """Fixture producing an active user with account and auth header."""
    user = User(
        full_name="Savita Sharma",
        email="savita.fraud@example.com",
        phone="9876543277",
        password_hash=hash_password("Password123!"),
        preferred_language="hi-IN",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    account = Account(
        user_id=user.id,
        bank_name="Sahayak Bank",
        account_type="SAVINGS",
        account_number="123456789012",
        balance=Decimal("100000.00"),
        currency="INR",
    )
    db_session.add(account)
    db_session.commit()
    db_session.refresh(account)

    token = create_access_token(data={"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}
    return user, account, headers


# ==========================================
# PART 1: Fraud Detection Tests
# ==========================================

def test_fraud_check_unauthenticated_rejected(client):
    """Unauthenticated request to POST /api/fraud/check returns 401."""
    payload = {
        "account_id": str(uuid.uuid4()),
        "amount": "500.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload)
    assert response.status_code == 401


def test_fraud_check_low_risk_success(client, user_and_auth):
    """Normal sized transaction with safe history evaluates as low risk."""
    _, account, headers = user_and_auth
    payload = {
        "account_id": str(account.id),
        "amount": "1000.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "low"
    assert data["risk_score"] < 30
    assert len(data["reasons"]) > 0


def test_fraud_check_large_amount_flagged(client, user_and_auth):
    """Large transaction (> ₹50,000) increases risk score with explainable reason."""
    _, account, headers = user_and_auth
    payload = {
        "account_id": str(account.id),
        "amount": "60000.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 35
    assert any("50,000" in r for r in data["reasons"])


def test_fraud_check_rapid_successive_transactions_flagged(client, user_and_auth, db_session):
    """Rapid transactions in past 5 minutes triggers velocity rule."""
    user, account, headers = user_and_auth

    # Insert 3 recent transactions within last 2 minutes
    now = datetime.now(timezone.utc)
    for i in range(3):
        txn = Transaction(
            account_id=account.id,
            transaction_type="DEBIT",
            amount=Decimal("500.00"),
            currency="INR",
            status="SUCCESS",
            reference=f"TXN-RAPID-{i}",
            created_at=now - timedelta(minutes=1),
        )
        db_session.add(txn)
    db_session.commit()

    payload = {
        "account_id": str(account.id),
        "amount": "1000.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 30
    assert any("5-minute" in r.lower() or "rapid" in r.lower() for r in data["reasons"])


def test_fraud_check_balance_depletion_and_untrusted_payee(client, user_and_auth, db_session):
    """Transaction depleting > 80% balance to an untrusted payee compounds risk score."""
    user, account, headers = user_and_auth

    # Add an untrusted payee
    payee = Payee(
        user_id=user.id,
        name="Unknown Vendor",
        upi_id="unknown@upi",
        is_trusted=False,
    )
    db_session.add(payee)
    db_session.commit()
    db_session.refresh(payee)

    # 90% depletion of ₹100,000 balance -> ₹90,000 (also triggers large amount > ₹50,000)
    payload = {
        "account_id": str(account.id),
        "payee_id": str(payee.id),
        "amount": "90000.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "high"
    assert data["risk_score"] >= 70
    reasons_text = " ".join(data["reasons"]).lower()
    assert "80%" in reasons_text or "depletes" in reasons_text
    assert "trusted" in reasons_text


def test_fraud_check_bounded_score_max_100(client, user_and_auth, db_session):
    """Multiple compounded risk factors remain bounded at max 100."""
    user, account, headers = user_and_auth

    # Add untrusted payee
    payee = Payee(
        user_id=user.id,
        name="Suspicious Receiver",
        is_trusted=False,
    )
    db_session.add(payee)

    # Add 5 transactions in last 2 minutes
    now = datetime.now(timezone.utc)
    for i in range(5):
        txn = Transaction(
            account_id=account.id,
            transaction_type="DEBIT",
            amount=Decimal("1000.00"),
            currency="INR",
            status="SUCCESS",
            reference=f"TXN-BURST-{i}",
            created_at=now - timedelta(minutes=1),
        )
        db_session.add(txn)
    db_session.commit()
    db_session.refresh(payee)

    payload = {
        "account_id": str(account.id),
        "payee_id": str(payee.id),
        "amount": "95000.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] <= 100
    assert data["risk_level"] == "high"


def test_fraud_check_cross_user_account_rejected(client, user_and_auth, db_session):
    """Evaluating another user's account must return 404."""
    _, _, headers = user_and_auth

    # Another user's account
    other_user = User(
        full_name="Other User",
        email="other.fraud@example.com",
        password_hash=hash_password("Pass123!"),
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)

    other_account = Account(
        user_id=other_user.id,
        bank_name="Other Bank",
        account_type="SAVINGS",
        account_number="999988887777",
        balance=Decimal("50000.00"),
        currency="INR",
    )
    db_session.add(other_account)
    db_session.commit()
    db_session.refresh(other_account)

    payload = {
        "account_id": str(other_account.id),
        "amount": "1000.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code == 404


def test_fraud_check_invalid_amount_rejected(client, user_and_auth):
    """Negative or zero amounts return HTTP 400 or 422."""
    _, account, headers = user_and_auth
    payload = {
        "account_id": str(account.id),
        "amount": "0.00",
        "transaction_type": "DEBIT",
    }
    response = client.post("/api/fraud/check", json=payload, headers=headers)
    assert response.status_code in [400, 422]


# ==========================================
# PART 2: Redis Caching Tests
# ==========================================

def test_redis_client_get_set_delete_operations():
    """Verify RedisClient abstraction methods."""
    mock_redis = MagicMock()
    mock_redis.get.return_value = '{"cached": "val"}'
    mock_redis.set.return_value = True
    mock_redis.delete.return_value = True

    with patch.object(RedisClient, "get_client", return_value=mock_redis):
        assert RedisClient.set("test_key", "test_val", 60) is True
        mock_redis.set.assert_called_with("test_key", "test_val", ex=60)

        assert RedisClient.get("test_key") == '{"cached": "val"}'
        mock_redis.get.assert_called_with("test_key")

        assert RedisClient.delete("test_key") is True
        mock_redis.delete.assert_called_with("test_key")


def test_account_balance_cache_miss_and_set(client, user_and_auth):
    """Cache miss fetches from DB and stores result in Redis with user-scoped key."""
    user, account, headers = user_and_auth

    mock_redis = MagicMock()
    mock_redis.get.return_value = None  # Cache miss

    with patch.object(RedisClient, "get_client", return_value=mock_redis):
        response = client.get(f"/api/accounts/{account.id}/balance", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert float(data["balance"]) == 100000.0

        # Verify Redis set was called with expected user-scoped key
        expected_key = f"sahayak:balance:{user.id}:{account.id}"
        mock_redis.get.assert_called_with(expected_key)
        assert mock_redis.set.called
        call_args = mock_redis.set.call_args
        assert call_args[0][0] == expected_key


def test_account_balance_cache_hit_returns_cached_data(client, user_and_auth):
    """Cache hit returns cached balance payload without querying DB."""
    user, account, headers = user_and_auth

    cached_json = (
        f'{{"account_id": "{account.id}", "balance": 99999.0, "currency": "INR", '
        f'"narration": "Aapke account mein ₹99,999.00 bache hain."}}'
    )
    mock_redis = MagicMock()
    mock_redis.get.return_value = cached_json  # Cache hit

    with patch.object(RedisClient, "get_client", return_value=mock_redis):
        response = client.get(f"/api/accounts/{account.id}/balance", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert float(data["balance"]) == 99999.0
        assert "99,999.00" in data["narration"]


def test_transaction_creation_invalidates_account_balance_cache(client, user_and_auth):
    """Creating a transaction invalidates the cached balance in Redis."""
    user, account, headers = user_and_auth

    mock_redis = MagicMock()
    mock_redis.delete.return_value = True

    with patch.object(RedisClient, "get_client", return_value=mock_redis):
        payload = {
            "account_id": str(account.id),
            "amount": "250.00",
            "description": "Tea and snacks",
            "category": "Food",
        }
        response = client.post("/api/transactions", json=payload, headers=headers)
        assert response.status_code == 201

        # Verify Redis delete was invoked for the user's account cache key
        expected_key = f"sahayak:balance:{user.id}:{account.id}"
        mock_redis.delete.assert_called_with(expected_key)


def test_redis_failure_fallback_to_postgres(client, user_and_auth):
    """When Redis is unavailable or throws an exception, system cleanly falls back to DB."""
    user, account, headers = user_and_auth

    mock_redis = MagicMock()
    mock_redis.get.side_effect = Exception("Redis connection refused")
    mock_redis.set.side_effect = Exception("Redis connection refused")

    with patch.object(RedisClient, "get_client", return_value=mock_redis):
        response = client.get(f"/api/accounts/{account.id}/balance", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert float(data["balance"]) == 100000.0
        assert "100,000.00" in data["narration"]
