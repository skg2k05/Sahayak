from unittest.mock import MagicMock, patch
import pytest
from app.models.user import User
from app.core.security import hash_password, create_access_token


@pytest.fixture
def auth_header(db_session):
    """Fixture providing an Authorization header with a valid JWT for an active user."""
    user = User(
        full_name="Savita Sharma",
        email="savita.translator@example.com",
        phone="9876543299",
        password_hash=hash_password("Password123!"),
        preferred_language="hi-IN",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_translator_rejected(client):
    """Unauthenticated requests to POST /api/translator/explain must return 401 Unauthorized."""
    payload = {"text": "INR 1200 debited from A/C XX1234 at XYZ UPI on 21-08-2026"}
    response = client.post("/api/translator/explain", json=payload)
    assert response.status_code == 401


def test_authenticated_translator_success(client, auth_header):
    """Authenticated request translates SMS text into structured explanation."""
    payload = {
        "text": "INR 1200 debited from A/C XX1234 at XYZ UPI on 21-08-2026",
        "language": "en",
    }
    response = client.post("/api/translator/explain", json=payload, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert "1,200" in data["summary"] or "1200" in data["summary"]
    assert float(data["amount"]) == 1200.0
    assert data["transaction_type"] == "debit"
    assert data["merchant"] == "XYZ"
    assert data["account_last4"] == "1234"
    assert "1234" in data["plain_language"]
    assert data["language"] == "en"


def test_empty_input_rejected(client, auth_header):
    """Empty or whitespace-only input text must return HTTP 400 or 422."""
    response1 = client.post("/api/translator/explain", json={"text": ""}, headers=auth_header)
    assert response1.status_code in [400, 422]

    response2 = client.post("/api/translator/explain", json={"text": "   "}, headers=auth_header)
    assert response2.status_code in [400, 422]


def test_overly_long_input_rejected(client, auth_header):
    """Input text exceeding 1000 characters must return HTTP 400 or 422."""
    long_text = "A" * 1001
    response = client.post("/api/translator/explain", json={"text": long_text}, headers=auth_header)
    assert response.status_code in [400, 422]


def test_hindi_response_request(client, auth_header):
    """Requesting language 'hi' produces Hindi summary and plain language explanation."""
    payload = {
        "text": "INR 500 debited from A/C XX5678 at Metro UPI on 21-08-2026",
        "language": "hi",
    }
    response = client.post("/api/translator/explain", json=payload, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "hi"
    plain_lower = data["plain_language"].lower()
    assert "khate" in plain_lower or "kaate" in plain_lower or "debit" in plain_lower


def test_missing_optional_fields_handled_safely(client, auth_header):
    """SMS lacking amount or merchant must be handled safely without hallucination."""
    payload = {"text": "Transaction successful on 21-08-2026"}
    response = client.post("/api/translator/explain", json=payload, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] is None
    assert data["merchant"] is None
    assert "deducted" in data["plain_language"] or "processed" in data["plain_language"]


@patch("app.services.transaction_translator.OpenAI")
def test_mocked_openai_success(mock_openai_cls, client, auth_header):
    """Mocked OpenAI API completion succeeds and returns structured JSON explanation."""
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client

    mock_choice = MagicMock()
    mock_choice.message.content = '{"summary": "₹2,500 was received in your account.", "amount": 2500.0, "transaction_type": "credit", "merchant": "Employer Inc", "account_last4": "9999", "plain_language": "₹2,500 was credited to your account ending in 9999 from Employer Inc.", "language": "en"}'
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_completion

    with patch("app.services.transaction_translator.settings.OPENAI_API_KEY", "mock-sk-12345"):
        payload = {"text": "Salary credit of INR 2500 from Employer Inc"}
        response = client.post("/api/translator/explain", json=payload, headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 2500.0
        assert data["transaction_type"] == "credit"
        assert data["merchant"] == "Employer Inc"
        assert data["account_last4"] == "9999"


@patch("app.services.transaction_translator.OpenAI")
def test_mocked_openai_malformed_response_handling(mock_openai_cls, client, auth_header):
    """Malformed JSON response from OpenAI falls back safely to deterministic rule parser."""
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client

    mock_choice = MagicMock()
    mock_choice.message.content = "INVALID JSON TEXT HERE"
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_completion

    with patch("app.services.transaction_translator.settings.OPENAI_API_KEY", "mock-sk-12345"):
        payload = {"text": "INR 1200 debited from A/C XX1234 at XYZ UPI on 21-08-2026"}
        response = client.post("/api/translator/explain", json=payload, headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert float(data["amount"]) == 1200.0
        assert data["account_last4"] == "1234"


@patch("app.services.transaction_translator.OpenAI")
def test_openai_api_failure_handling(mock_openai_cls, client, auth_header):
    """OpenAI network/API exception falls back safely to rule-based parser without crashing."""
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("OpenAI API rate limit exceeded")

    with patch("app.services.transaction_translator.settings.OPENAI_API_KEY", "mock-sk-12345"):
        payload = {"text": "INR 1200 debited from A/C XX1234 at XYZ UPI on 21-08-2026"}
        response = client.post("/api/translator/explain", json=payload, headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert float(data["amount"]) == 1200.0
        assert data["account_last4"] == "1234"
