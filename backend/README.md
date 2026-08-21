# Sahayak Backend Service

Sahayak is a voice-first, AI-powered accessible banking companion for elderly, visually impaired, and low-literacy users in India.

This directory contains the FastAPI backend service foundation established in **Phase B0**.

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

Install the required core dependencies for Phase B0:

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

> [!NOTE]
> Secrets and real credentials should never be committed to repository. Always maintain local overrides in `.env`.

---

## 5. How to Start FastAPI Application

Run the application locally with Uvicorn:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, interactive API documentation is available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

---

## 6. How to Run Tests

Run the test suite using `pytest`:

```bash
pytest
```

---

## 7. Database & Alembic Usage

Database ORM infrastructure is powered by SQLAlchemy 2.0. Alembic is configured to read database parameters dynamically from application settings.

Common Alembic migration workflow for future phases:

```bash
# Generate a new migration script
alembic revision --autogenerate -m "describe changes"

# Apply pending migrations to database
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

---

## 8. Current B0 Scope

Phase B0 focuses exclusively on establishing a reliable backend architecture:
- Project folder modularization (`app/core`, `app/api`, `app/models`, `app/schemas`, `app/services`, `app/repositories`, `app/utils`).
- Centralized Pydantic `BaseSettings` configuration.
- Database engine, session factory (`SessionLocal`), and `DeclarativeBase` ORM setup.
- Alembic migration initialization.
- FastAPI app entry point with CORS middleware.
- Operational `GET /health` endpoint.
- Automated testing suite with `pytest`.

---

## 9. Intentionally NOT Implemented Yet

The following features are explicitly deferred to subsequent implementation phases:
- User Authentication & Authorization (JWT / OAuth2).
- Core Banking APIs (Accounts, Payees, Transactions).
- Voice processing & STT/TTS pipeline integration.
- OpenAI API / LLM orchestrator integration.
- Redis cache & session store integration.
- Rule-based or ML fraud detection layer.
- Frontend UI components or client-side assets.
