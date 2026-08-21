# Sahayak Backend Service

Sahayak is a voice-first, AI-powered accessible banking companion for elderly, visually impaired, and low-literacy users in India.

This directory contains the FastAPI backend service foundation established in **Phase B0**, extended in **Phase B1**, and completed with **Phase B2** Banking Core features.

---

## 1. Python Version Requirement

- **Python 3.11+** is required.

---

## 2. Virtual Environment Setup

Create and activate a virtual environment inside the `backend` directory:

### On Windows (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### On macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 3. Dependency Installation

Install the required dependencies:

```bash
pip install -r requirements.txt
```

---

## 4. Environment Configuration

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

### Configuration Variables (`app/core/config.py`):
- `PROJECT_NAME`: Title of the FastAPI application (`"Sahayak API"`).
- `VERSION`: Application version string (`"0.1.0"`).
- `ENVIRONMENT`: Runtime environment (`development`, `staging`, `production`).
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://user:password@localhost:5432/sahayak_db`).
- `CORS_ORIGINS`: Allowed origins for CORS as a JSON array string or comma-separated values.
- `JWT_SECRET_KEY`: Secret key used for signing JWT authentication tokens.
- `JWT_ALGORITHM`: Signing algorithm for JWTs (default: `HS256`).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiration duration for access tokens in minutes (default: `1440`).

> [!NOTE]
> Secrets and real credentials should never be committed to the repository. Always maintain local overrides in `.env`.

---

## 5. Database Models

SQLAlchemy 2.0 domain entity models implemented in `app/models/`:

- **User (`users`)**: Primary user account record (`id` [UUID], `full_name`, `email`, `phone`, `password_hash`, `preferred_language`, `accessibility_settings`, `is_active`, `created_at`, `updated_at`).
- **Account (`accounts`)**: User bank accounts (`id` [UUID], `user_id` [FK], `account_number`, `account_type`, `bank_name`, `balance` [Numeric], `currency`, `is_active`, `created_at`, `updated_at`).
- **Payee (`payees`)**: Saved transaction beneficiaries (`id` [UUID], `user_id` [FK], `name`, `upi_id`, `phone`, `bank_name`, `account_number`, `is_trusted`, `created_at`, `updated_at`).
- **Transaction (`transactions`)**: Financial transaction persistence (`id` [UUID], `account_id` [FK], `payee_id` [FK], `transaction_type`, `amount` [Numeric], `currency`, `status`, `reference`, `description`, `created_at`).
- **SMSTranslation (`sms_translations`)**: Stored bank SMS explanations (`id` [UUID], `user_id` [FK], `original_message`, `translated_message`, `detected_language`, `created_at`).
- **AuditLog (`audit_logs`)**: Security and system activity audit trail (`id` [UUID], `user_id` [FK], `action`, `resource_type`, `resource_id`, `metadata_json`, `created_at`).
- **FeatureFlag (`feature_flags`)**: Runtime feature toggle configuration (`id` [UUID], `name`, `enabled`, `description`, `created_at`, `updated_at`).

---

## 6. Database & Alembic Migration Commands

Alembic is configured to read database settings dynamically from `app/core/config.py`.

Migration commands:

```bash
# Verify migration status and current head revision
alembic heads

# Apply all pending migrations to PostgreSQL database
alembic upgrade head

# Rollback the last applied migration
alembic downgrade -1
```

---

## 7. API Endpoints

### Authentication & Health
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user with hashed password and return JWT | No |
| `POST` | `/api/auth/login` | Authenticate credentials and return JWT access token | No |
| `GET` | `/api/auth/me` | Fetch profile of currently authenticated user | Yes (Bearer JWT) |
| `GET` | `/health` | Verify operational status of the service | No |

### Banking Core (Phase B2)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounts` | Return authenticated user's accounts with masked account numbers | Yes (Bearer JWT) |
| `GET` | `/api/accounts/{account_id}/balance` | Return account balance and localized narration string | Yes (Bearer JWT) |
| `GET` | `/api/payees` | Return authenticated user's saved payees | Yes (Bearer JWT) |
| `POST` | `/api/transactions` | Initiate a mock payment transaction, update balance atomically | Yes (Bearer JWT) |
| `GET` | `/api/transactions` | Return authenticated user's transaction history (newest first) | Yes (Bearer JWT) |
| `GET` | `/api/transactions/{transaction_id}` | Return detail for a single transaction owned by user | Yes (Bearer JWT) |

---

## 8. Banking API Request & Response Examples

### `GET /api/accounts`
**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "bank_name": "Sahayak Demo Bank",
    "account_type": "SAVINGS",
    "account_number": "XXXXXX9012",
    "balance": 5000.00,
    "currency": "INR",
    "upi_id": "savita@upi",
    "is_primary": true
  }
]
```

### `GET /api/accounts/{account_id}/balance`
**Response (200 OK):**
```json
{
  "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "balance": 5000.00,
  "currency": "INR",
  "narration": "Aapke account mein ₹5,000.00 bache hain."
}
```

### `GET /api/payees`
**Response (200 OK):**
```json
[
  {
    "id": "7ca85f64-5717-4562-b3fc-2c963f66afa7",
    "name": "Electricity Board",
    "upi_id": "electricity@upi",
    "phone": "9998887776",
    "bank_name": null,
    "account_number": null,
    "is_trusted": true,
    "trusted_status": true,
    "relationship": "Saved Payee",
    "photo_url": null,
    "monthly_limit": 50000.00
  }
]
```

### `POST /api/transactions`
**Request:**
```json
{
  "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "payee_id": "7ca85f64-5717-4562-b3fc-2c963f66afa7",
  "amount": 500.00,
  "description": "Electricity Bill Payment",
  "category": "Bills"
}
```
**Response (201 Created):**
```json
{
  "id": "9ba85f64-5717-4562-b3fc-2c963f66afa8",
  "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "payee_id": "7ca85f64-5717-4562-b3fc-2c963f66afa7",
  "payee_name": "Electricity Board",
  "transaction_type": "DEBIT",
  "amount": 500.00,
  "currency": "INR",
  "status": "SUCCESS",
  "reference": "TXN-8A7B6C5D4E3F",
  "description": "Electricity Bill Payment",
  "category": "Bills",
  "created_at": "2026-08-21T22:00:00Z",
  "resulting_balance": 4500.00
}
```

---

## 9. How to Start FastAPI Application

Run the application locally with Uvicorn:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive API documentation:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

---

## 10. How to Run Tests

Run the full automated test suite using `pytest`:

```bash
pytest
```

---

## 11. Scope & Deferred Features

Phase B2 implements user-scoped Accounts, Payees, and Transaction processing APIs.

The following features remain explicitly deferred to future implementation phases:
- Voice processing & STT/TTS pipeline integration.
- OpenAI API / LLM orchestrator integration.
- Redis cache & session store integration.
- Rule-based or ML fraud detection layer.
- Frontend UI components or client-side assets.
- Real UPI, bank API, or payment gateway integration.
