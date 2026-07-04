# 📧 Gmail Triage — AI-Powered Inbox Sorter

Looks exactly like Gmail. Sorts emails by urgency (CRITICAL → HIGH → MODERATE → LOW) using rules + OpenRouter LLM.

---

## Requirements
- Python 3.11
- Node.js 18+
- OpenRouter API key (free tier works) — https://openrouter.ai

---

## Setup (do this once)

### 1. Backend

```bash
cd email-triage/backend

# Create venv
python -m venv venv

# Activate — Windows:
venv\Scripts\activate
# Activate — Linux/Mac:
source venv/bin/activate

# Install
pip install -r requirements.txt
```

### 2. Environment file

```bash
# Still inside /backend
copy ..\\.env.example .env        # Windows
# cp ../.env.example .env         # Linux/Mac

# Open .env and paste your OpenRouter API key:
# OPENROUTER_API_KEY=sk-or-xxxxxxxx
```

### 3. Frontend

```bash
cd email-triage/frontend
npm install
```

---

## Run

**Terminal 1 — Backend** (run from /backend with venv active):
```bash
uvicorn main:app --reload --port 8000
```
You should see: `Email Triage API v2 running ✓`

**Terminal 2 — Frontend** (run from /frontend):
```bash
npm run dev
```
Open: http://localhost:5173

---

## No XGBoost training needed

The old version used XGBoost — that's been removed. The classifier now uses:
1. **Rule engine** — instant keyword + sender scoring (no training, no model file)
2. **OpenRouter LLM** — called only for ambiguous emails (saves API cost)

This means the system works immediately with no setup beyond your API key.

---

## Connect Gmail (later)

1. Go to https://console.cloud.google.com
2. Enable Gmail API
3. Create OAuth 2.0 Client ID → Desktop app → Download JSON
4. Save as `backend/credentials.json`
5. In `.env` set `GMAIL_ENABLED=true`
6. Restart backend → browser opens → sign in once → `token.json` auto-saved

---

## API Endpoints

| Method | Path | What it does |
|--------|------|--------------|
| GET | /api/emails | All emails sorted by urgency |
| POST | /api/demo/generate | Generate a random demo email |
| POST | /api/demo/load-inbox | Load initial 15 demo emails (parallel) |
| POST | /api/process | Process a custom email |
| POST | /api/emails/{id}/read | Mark as read |
| POST | /api/emails/{id}/star | Toggle star |
| POST | /api/emails/{id}/snooze | Snooze (body: {"minutes": 30}) |
| GET | /api/reminders | Unread HIGH/CRITICAL emails past SLA |
| GET | /api/health | Check API key + Gmail status |

---

## Troubleshooting

**`ModuleNotFoundError`** → make sure venv is activated and you ran `pip install -r requirements.txt`

**Frontend shows blank / network error** → make sure backend is running on port 8000 first

**LLM returns fallback** → add `OPENROUTER_API_KEY` to `/backend/.env`

**Slow inbox load** → normal first time (LLM calls run in parallel). After that, emails are cached in SQLite and load instantly.
