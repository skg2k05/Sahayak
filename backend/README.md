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

### Transaction Translator (Phase B3)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/translator/explain` | Translate cryptic financial SMS alert into plain voice-first explanation | Yes (Bearer JWT) |

### Voice Pipeline (Phase B4)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/voice/transcribe` | Transcribe speech audio file into text using Whisper | Yes (Bearer JWT) |
| `POST` | `/api/voice/synthesize` | Synthesize plain text into spoken MP3 audio stream using gTTS | Yes (Bearer JWT) |

### Fraud & Risk Detection (Phase B5)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/fraud/check` | Perform explainable deterministic transaction risk evaluation | Yes (Bearer JWT) |

### AI Banking Chatbot (Phase B7)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Secure AI banking chatbot with intent routing and zero PII data minimization | Yes (Bearer JWT) |

---

## 8. API Request & Response Examples

### `POST /api/chat` (Phase B7)
**Request:**
```json
{
  "message": "What is my account balance?",
  "language": "en"
}
```
**Response (200 OK):**
```json
{
  "response": "Your current balance for account XXXXXX9012 is ₹4,200.00.",
  "language": "en",
  "intent": "BALANCE"
}
```

**Supported Chatbot Intents:**
- `BALANCE`: Retrieve authenticated user's account balance deterministically.
- `ACCOUNT`: Retrieve authenticated user's account status with masked account number (`XXXXXX1234`).
- `RECENT_TRANSACTIONS`: Retrieve minimal details of authenticated user's latest transaction.
- `TRANSACTION_EXPLANATION`: Explain latest user transaction using `TransactionTranslatorService`.
- `FRAUD`: Return account security risk evaluation using `FraudService`.
- `UNSUPPORTED_ACTION`: Safely decline financial actions (e.g. transfer money, change PIN/password) and instruct user to use secure transaction flow.
- `GENERAL_BANKING_QUESTION`: Answer educational banking queries (e.g. "What is UPI?", "What is IFSC?") without sending user PII to OpenAI.
- `UNKNOWN`: Respond safely to unrecognized input or prompt injection attempts.

**Security Controls:**
- **Controlled Orchestration**: LLM cannot directly execute SQL, database queries, or backend tools.
- **Strict User Isolation**: All database queries are hard-scoped to `current_user.id` from JWT session.
- **Zero PII Data Minimization**: Passwords, PINs, CVVs, full account numbers, and DB records are never passed to OpenAI.


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

### `POST /api/translator/explain` (Phase B3)
**Request:**
```json
{
  "text": "INR 1200 debited from A/C XX1234 at XYZ UPI on 21-08-2026",
  "language": "hi"
}
```
**Response (200 OK):**
```json
{
  "summary": "₹1,200.00 aapke bank khate se kaate gaye hain.",
  "amount": 1200.0,
  "transaction_type": "debit",
  "merchant": "XYZ",
  "account_last4": "1234",
  "plain_language": "₹1,200.00 aapke khate (aakhri 4 digits 1234) se XYZ par debit hue hain.",
  "language": "hi"
}
```

### `POST /api/voice/transcribe` (Phase B4)
**Request (multipart/form-data):**
- `file`: `audio_sample.mp3` (Binary audio stream, max 10MB)
- `language`: `en` (Optional spoken language code)

**Response (200 OK):**
```json
{
  "text": "Please explain my last transaction",
  "language": "en"
}
```

### `POST /api/voice/synthesize` (Phase B4)
**Request:**
```json
{
  "text": "Aapke account mein 4200 rupaye bache hain.",
  "language": "hi"
}
```
**Response (200 OK):**
- Binary MP3 Audio Stream (`Content-Type: audio/mpeg`)

### `POST /api/fraud/check` (Phase B5)
**Request:**
```json
{
  "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 60000.00,
  "payee_id": "7ca85f64-5717-4562-b3fc-2c963f66afa7",
  "transaction_type": "DEBIT"
}
```
**Response (200 OK):**
```json
{
  "risk_level": "medium",
  "risk_score": 35,
  "reasons": [
    "Transaction amount of ₹60,000.00 exceeds the ₹50,000.00 large transaction threshold."
  ]
}
```

**Fraud Detection Rules & Score Thresholds:**
- **Score Range**: Bounded `0` to `100`.
- **Tiers**:
  - `0 - 29`: **`low`** (Normal, safe transaction parameters)
  - `30 - 69`: **`medium`** (Single elevated risk factor or multiple moderate indicators)
  - `70 - 100`: **`high`** (Multiple compounded severe risk indicators)
- **Transparent Explainable Rules**:
  1. *Large Transaction*: Amount > ₹50,000 (+35 pts) or > ₹20,000 (+15 pts).
  2. *Rapid Velocity*: >= 3 transactions in 5 minutes (+30 pts) or 2 transactions (+15 pts).
  3. *High Frequency*: >= 5 transactions in the past hour (+25 pts).
  4. *Balance Depletion*: Amount depletes > 80% of available account balance (+20 pts).
  5. *Untrusted Payee*: Recipient payee is not marked as trusted contact (+15 pts).

**Redis Caching Architecture (Phase B5):**
- **Configuration**: `REDIS_URL` (`redis://localhost:6379/0`), `REDIS_CACHE_TTL_SECONDS` (default: 300s / 5 min).
- **Target**: Account balance queries (`GET /api/accounts/{account_id}/balance`).
- **User Scoping**: Cache keys strictly scoped as `sahayak:balance:{user_id}:{account_id}` preventing cross-user cache contamination.
- **Invalidation**: Cache key is immediately deleted when a balance-changing transaction executes (`POST /api/transactions`).
- **Graceful Fallback**: If Redis is offline or fails, requests transparently query PostgreSQL with zero user impact or 500 errors.

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

Phase B5 implements Explainable Fraud Detection and Redis Caching.

The following features remain explicitly deferred to future implementation phases:
- Frontend UI components or client-side assets.
- Real UPI, bank API, or payment gateway integration.
