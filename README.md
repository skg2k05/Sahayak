# 🏦 Sahayak (सहायक) — Secure, Inclusive & Multilingual AI Voice Banking Assistant

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Sahayak (सहायक)** is an accessible, voice-first, multi-lingual AI banking platform designed to bridge the digital banking gap for 500M+ citizens in India who face language barriers, low digital literacy, or visual impairment.

---

## 🌟 Key Highlights & Hackathon Features

- 🌐 **7 Native-Script Languages**: Full native-script output for **English (`en`)**, **Hindi (`hi` — Devanagari)**, **Kannada (`kn`)**, **Tamil (`ta`)**, **Telugu (`te`)**, **Marathi (`mr`)**, and **Bengali (`bn`)**. No Latin transliteration or Hinglish.
- 🎙️ **Voice Assistant with Speech Normalization**: Screen displays masked account numbers (`•••• 4237` or `XXXXXX4237`) for privacy, while Text-to-Speech (gTTS / Web Speech) naturally reads *"account ending in 4 2 3 7"* or *"4 2 3 7 पर समाप्त होने वाला खाता"*.
- 🛡️ **Zero-Trust AI Data Minimization**: Strict isolation layer ensures **passwords, JWTs, account balances, user IDs, CVVs, and transaction histories NEVER reach Google Gemini**.
- ⚡ **Deterministic Intent Routing**: Sensitive banking requests (`BALANCE`, `ACCOUNT`, `TRANSACTIONS`, `FRAUD`) bypass the LLM completely and are executed directly against authenticated database records.
- 🚨 **Real-Time Fraud Detection**: Calculates real-time transaction risk scores with high-velocity anomaly detection and Redis caching.
- 📖 **Transaction Translator**: Translates confusing bank statement line items into plain, simple native language explanations.
- ♿ **High Accessibility UI**: Built according to WCAG 2.2 accessibility standards — screen-reader support, voice navigation, high-contrast modes, large target fonts, and keyboard shortcuts.

---

## 📐 System Architecture & Security Isolation Boundary

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            SAHAYAK FRONTEND                             │
 │            React 18 + TypeScript + Tailwind CSS + Web Speech API         │
 └───────────────────────────────────┬─────────────────────────────────────┘
                                     │ (HTTP REST / JWT Auth)
                                     ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            FASTAPI BACKEND                              │
 │                           App Router & Middleware                       │
 └───────┬───────────────────────────┬───────────────────────────┬─────────┘
         │                           │                           │
         ▼                           ▼                           ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│   BANKING CORE    │       │  DETERMINISTIC    │       │  AI CHATBOT       │
│  SERVICES (B1-B5) │       │  INTENT ROUTER    │       │  ORCHESTRATOR     │
└────────┬──────────┘       └────────┬──────────┘       └────────┬──────────┘
         │                           │                           │
         │                           │ (Personal Intent Bypass) │ (General Qs)
         ▼                           │                           ▼
┌───────────────────┐                │                  ┌───────────────────┐
│   PostgreSQL /    │◄───────────────┘                  │   GOOGLE GEMINI   │
│   SQLite Cache    │                                   │   (Zero-PII Data) │
└───────────────────┘                                   └───────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, Lucide React, Web Speech API |
| **Backend API** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy 2.0, Alembic |
| **Database** | PostgreSQL / Local SQLite fallback (`sahayak_db.sqlite3`), Redis Cache |
| **Artificial Intelligence**| Google Gemini 2.5 Flash API (General QA), OpenAI Whisper API (Voice-to-Text) |
| **Voice Synthesis** | gTTS (Google Text-to-Speech), Web Speech Synthesis API |
| **Testing** | Pytest (88 unit & integration tests passing 100%), Vitest / Vite Build |

---

## 🚀 Quick Start — Local Setup

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** & **npm**

### 1. Backend Setup

```cmd
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run pytest suite to verify setup (88 tests)
pytest -v

# Run local development server (uses automatic SQLite fallback if PostgreSQL is not installed)
python -m uvicorn app.main:app --reload --port 8000
```
> The API documentation will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup

```cmd
cd frontend

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```
> The frontend application will be live at `http://localhost:5173`.

---

## 🌐 Deployment Instructions for Hackathon Evaluation

### Option 1: Live Cloud Deployment (Recommended)

#### A. Deploying Frontend to Vercel
1. Push your code to GitHub.
2. Log into [Vercel](https://vercel.com).
3. Click **New Project** and import your repository.
4. Set **Root Directory** to `frontend`.
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`
6. Click **Deploy**. Vercel will build and host your app on an HTTPS URL.

#### B. Deploying Backend to Render / Railway
1. Log into [Render](https://render.com) or [Railway](https://railway.app).
2. Create a **New Web Service** pointing to your repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `JWT_SECRET_KEY`: `your-random-secure-secret-key`
   - `GEMINI_API_KEY`: `your-google-gemini-api-key` *(Optional, falls back to static knowledge if unconfigured)*
   - `OPENAI_API_KEY`: `your-openai-api-key` *(Optional, for voice transcription)*
   - `DATABASE_URL`: `sqlite:///./sahayak_db.sqlite3` *(or your PostgreSQL URL)*
   - `CORS_ORIGINS`: `["https://your-frontend.vercel.app"]`
7. Click **Deploy**.

---

## 📡 API Endpoint Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Application health & status check | ❌ |
| `POST` | `/api/auth/register` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ |
| `GET` | `/api/accounts` | Fetch user bank accounts | ✅ |
| `GET` | `/api/accounts/{id}/balance` | Fetch account balance | ✅ |
| `GET` | `/api/payees` | List registered payees | ✅ |
| `POST` | `/api/transactions` | Initiate new funds transfer | ✅ |
| `GET` | `/api/transactions` | Fetch user transaction history | ✅ |
| `POST` | `/api/translator/explain` | Explain cryptic bank statement item | ✅ |
| `POST` | `/api/fraud/check` | Analyze transaction risk score | ✅ |
| `POST` | `/api/voice/synthesize` | Convert text to speech audio (gTTS) | ✅ |
| `POST` | `/api/chat` | Send multilingual AI chatbot message | ✅ |

---

## 🛡️ Security & Privacy Architecture Summary

1. **Authentication**: Stateful JWT bearer tokens stored securely in client state with expiration checks.
2. **Deterministic Intent Handling**: Queries asking for `balance`, `recent transactions`, or `payees` trigger direct DB queries scoped strictly to `current_user.id`.
3. **Data Minimization**: Prompts sent to Gemini contain zero PII, zero balances, and zero internal database IDs.
4. **Input Sanitization**: Rejects prompt injection attempts (`"ignore previous instructions"`, `"act as admin"`) with safe, static localized responses.

---

## 🏆 Hackathon Submission Checklist

- [x] Full source code for Frontend & Backend.
- [x] Automated test suite passed cleanly (`88 passed` in pytest).
- [x] Zero build or lint errors (`npm run build` passed cleanly).
- [x] Multi-lingual support verified across 7 Indian languages.
- [x] Voice navigation and speech normalization verified.
- [x] Deployment instructions & environment configuration documented.

---
## Team Members

1. [Sushil Kumar Gauda](https://github.com/skg2k05)
2. [Anup Kumar Jena](https://github.com/AKJenaX)
3. [Kamal Nath Mallick](https://github.com/kamalnathmallick)

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.
