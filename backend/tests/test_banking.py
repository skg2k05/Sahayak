from decimal import Decimal
import uuid
import pytest
from app.models.user import User
from app.models.account import Account
from app.models.payee import Payee
from app.models.transaction import Transaction
from app.core.security import hash_password, create_access_token


@pytest.fixture
def test_users(db_session):
    """Fixture creating two distinct test users with accounts and payees."""
    user_a = User(
        full_name="Savita Sharma",
        email="savita@example.com",
        phone="9876543210",
        password_hash=hash_password("Password123!"),
        preferred_language="hi-IN",
        is_active=True,
    )
    user_b = User(
        full_name="Ramesh Kumar",
        email="ramesh@example.com",
        phone="9123456789",
        password_hash=hash_password("Password123!"),
        preferred_language="en-IN",
        is_active=True,
    )
    db_session.add_all([user_a, user_b])
    db_session.commit()
    db_session.refresh(user_a)
    db_session.refresh(user_b)

    # Accounts
    account_a = Account(
        user_id=user_a.id,
        account_number="123456789012",
        account_type="SAVINGS",
        bank_name="Sahayak Demo Bank",
        balance=Decimal("5000.00"),
        currency="INR",
        is_active=True,
    )
    account_b = Account(
        user_id=user_b.id,
        account_number="987654321098",
        account_type="SAVINGS",
        bank_name="State Bank of India",
        balance=Decimal("2000.00"),
        currency="INR",
        is_active=True,
    )
    db_session.add_all([account_a, account_b])

    # Payees
    payee_a = Payee(
        user_id=user_a.id,
        name="Electricity Board",
        upi_id="electricity@upi",
        phone="9998887776",
        is_trusted=True,
    )
    payee_b = Payee(
        user_id=user_b.id,
        name="Water Department",
        upi_id="water@upi",
        phone="8887776665",
        is_trusted=False,
    )
    db_session.add_all([payee_a, payee_b])
    db_session.commit()

    db_session.refresh(account_a)
    db_session.refresh(account_b)
    db_session.refresh(payee_a)
    db_session.refresh(payee_b)

    token_a = create_access_token(data={"sub": str(user_a.id)})
    token_b = create_access_token(data={"sub": str(user_b.id)})

    return {
        "user_a": user_a,
        "token_a": token_a,
        "account_a": account_a,
        "payee_a": payee_a,
        "user_b": user_b,
        "token_b": token_b,
        "account_b": account_b,
        "payee_b": payee_b,
    }


def test_unauthenticated_banking_access_rejected(client):
    """Unauthenticated requests to banking endpoints must return 401 Unauthorized."""
    assert client.get("/api/accounts").status_code == 401
    assert client.get("/api/payees").status_code == 401
    assert client.get("/api/transactions").status_code == 401
    assert client.post("/api/transactions", json={}).status_code == 401


def test_get_accounts(client, test_users):
    """Authenticated user can list their own accounts with masked account numbers."""
    headers = {"Authorization": f"Bearer {test_users['token_a']}"}
    response = client.get("/api/accounts", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    acc = data[0]
    assert acc["id"] == str(test_users["account_a"].id)
    assert acc["bank_name"] == "Sahayak Demo Bank"
    assert acc["account_number"] == "XXXXXX9012"
    assert float(acc["balance"]) == 5000.00
    assert acc["is_primary"] is True


def test_get_account_balance(client, test_users):
    """Authenticated user can retrieve account balance and narration."""
    headers = {"Authorization": f"Bearer {test_users['token_a']}"}
    acc_id = test_users["account_a"].id
    response = client.get(f"/api/accounts/{acc_id}/balance", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["account_id"] == str(acc_id)
    assert float(data["balance"]) == 5000.00
    assert "Aapke account mein" in data["narration"]


def test_cross_user_account_balance_access_blocked(client, test_users):
    """User A attempting to access User B's account balance must return 404."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    acc_b_id = test_users["account_b"].id
    response = client.get(f"/api/accounts/{acc_b_id}/balance", headers=headers_a)
    assert response.status_code == 404


def test_get_payees_user_scoped(client, test_users):
    """Authenticated user can list only their saved payees."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    response = client.get("/api/payees", headers=headers_a)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Electricity Board"
    assert data[0]["id"] == str(test_users["payee_a"].id)


def test_create_transaction_success(client, test_users):
    """Valid transaction succeeds, decreases balance, and creates transaction record."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    payload = {
        "account_id": str(test_users["account_a"].id),
        "payee_id": str(test_users["payee_a"].id),
        "amount": 500.00,
        "description": "Electricity Bill Payment",
        "category": "Bills",
    }
    response = client.post("/api/transactions", json=payload, headers=headers_a)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["transaction_type"] == "DEBIT"
    assert float(data["amount"]) == 500.00
    assert float(data["resulting_balance"]) == 4500.00
    assert data["payee_name"] == "Electricity Board"

    # Verify balance was updated in database
    bal_response = client.get(f"/api/accounts/{test_users['account_a'].id}/balance", headers=headers_a)
    assert float(bal_response.json()["balance"]) == 4500.00


def test_create_transaction_insufficient_balance(client, test_users):
    """Transaction exceeding account balance must be rejected with HTTP 400."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    payload = {
        "account_id": str(test_users["account_a"].id),
        "amount": 10000.00,
    }
    response = client.post("/api/transactions", json=payload, headers=headers_a)
    assert response.status_code == 400
    assert "Insufficient account balance" in response.json()["detail"]


def test_create_transaction_invalid_amount(client, test_users):
    """Zero or negative transaction amounts must be rejected."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    payload = {
        "account_id": str(test_users["account_a"].id),
        "amount": -100.00,
    }
    response = client.post("/api/transactions", json=payload, headers=headers_a)
    assert response.status_code in [400, 422]


def test_create_transaction_cross_user_account_rejected(client, test_users):
    """User A spending from User B's account must return 404."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    payload = {
        "account_id": str(test_users["account_b"].id),
        "amount": 100.00,
    }
    response = client.post("/api/transactions", json=payload, headers=headers_a)
    assert response.status_code == 404


def test_create_transaction_cross_user_payee_rejected(client, test_users):
    """User A transferring to User B's payee (unauthorized payee) must return 404."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}
    payload = {
        "account_id": str(test_users["account_a"].id),
        "payee_id": str(test_users["payee_b"].id),
        "amount": 100.00,
    }
    response = client.post("/api/transactions", json=payload, headers=headers_a)
    assert response.status_code == 404


def test_transaction_history_and_detail(client, test_users):
    """Transaction history and transaction detail endpoints must be user-scoped."""
    headers_a = {"Authorization": f"Bearer {test_users['token_a']}"}

    # Create transaction for User A
    tx_payload = {
        "account_id": str(test_users["account_a"].id),
        "amount": 250.00,
        "description": "Mobile Recharge",
    }
    create_res = client.post("/api/transactions", json=tx_payload, headers=headers_a)
    tx_id = create_res.json()["id"]

    # History check for User A
    history_res = client.get("/api/transactions", headers=headers_a)
    assert history_res.status_code == 200
    assert history_res.json()["total"] == 1

    # Detail check for User A
    detail_res = client.get(f"/api/transactions/{tx_id}", headers=headers_a)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == tx_id

    # User B trying to access User A's transaction detail must return 404
    headers_b = {"Authorization": f"Bearer {test_users['token_b']}"}
    cross_detail_res = client.get(f"/api/transactions/{tx_id}", headers=headers_b)
    assert cross_detail_res.status_code == 404
