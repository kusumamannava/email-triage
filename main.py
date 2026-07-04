"""
Email Triage — FastAPI Backend
Run from /backend directory: uvicorn main:app --reload --port 8000
"""
import os
import sys
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Make sure we can import from the backend directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from database.db import (
    init_db, SessionLocal, save_email, get_all_emails,
    mark_read, toggle_star, snooze_email, clear_all_emails
)
from modules.nlp_prep import prepare_email
from modules.rule_classifier import pre_classify
from modules.llm_classifier import classify_with_llm
from modules.alert_engine import build_alert, should_remind
from demo_emails import get_random_demo_email, get_initial_demo_batch

app = FastAPI(title="Email Triage API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
init_db()
print("[Startup] Database initialized.")


# ── Dependency ────────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Pydantic schemas ──────────────────────────────────────────────────────────
class EmailInput(BaseModel):
    sender: str
    sender_name: Optional[str] = None
    subject: str
    body: str
    received_at: Optional[str] = None
    is_read: Optional[bool] = False
    is_starred: Optional[bool] = False
    source: Optional[str] = "demo"

class SnoozeInput(BaseModel):
    minutes: int = 30


# ── Core pipeline ─────────────────────────────────────────────────────────────
async def run_pipeline(raw: dict) -> dict:
    """
    Full triage pipeline for one email:
      1. NLP clean
      2. Rule pre-classify
      3. LLM classify (skipped for obvious LOW)
      4. Build alert metadata
    """
    sender    = raw.get("sender", "")
    subject   = raw.get("subject", "")
    body      = raw.get("body", "")

    # Step 1 – clean
    prep = prepare_email(sender, subject, body)
    clean_body = prep["clean_body"]

    # Step 2 – rule classifier (instant, no model needed)
    rule = pre_classify(sender, subject, clean_body)
    hint = rule["urgency"]

    # Step 3 – LLM (skip if obvious LOW)
    if rule["skip_llm"]:
        llm = {
            "summary": f"Email from {raw.get('sender_name') or sender} — {subject}.",
            "urgency": "LOW",
            "urgency_reason": rule["reason"],
            "action_required": False,
            "action_hint": None,
        }
    else:
        llm = await classify_with_llm(sender, subject, clean_body, hint)

    urgency = llm.get("urgency", hint)
    # Validate urgency value
    if urgency not in ("CRITICAL", "HIGH", "MODERATE", "LOW"):
        urgency = hint

    # Step 4 – alert metadata
    received_at = raw.get("received_at") or datetime.now().isoformat()
    try:
        received_dt = datetime.fromisoformat(received_at)
    except Exception:
        received_dt = datetime.now()

    alert = build_alert(urgency, received_dt)

    return {
        "id":             raw.get("id") or str(uuid.uuid4()),
        "sender":         sender,
        "sender_name":    raw.get("sender_name") or sender,
        "subject":        subject,
        "body":           body[:3000],
        "summary":        llm.get("summary", ""),
        "urgency":        urgency,
        "urgency_order":  alert["urgency_order"],
        "urgency_reason": llm.get("urgency_reason", ""),
        "action_required":llm.get("action_required", False),
        "action_hint":    llm.get("action_hint"),
        "alert_type":     alert["alert_type"],
        "sla_minutes":    alert["sla_minutes"],
        "sla_label":      alert["sla_label"],
        "deadline":       alert["deadline"],
        "reminder_at":    alert["reminder_at"],
        "color":          alert["color"],
        "badge_color":    alert["badge_color"],
        "is_read":        bool(raw.get("is_read", False)),
        "is_starred":     bool(raw.get("is_starred", False)),
        "is_snoozed":     False,
        "snooze_until":   None,
        "received_at":    received_at,
        "processed_at":   datetime.now().isoformat(),
        "source":         raw.get("source", "demo"),
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Email Triage API v2 running ✓"}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gmail_enabled": os.getenv("GMAIL_ENABLED", "false").lower() == "true",
        "openrouter_configured": bool(os.getenv("OPENROUTER_API_KEY", "")),
        "mode": "gmail" if os.getenv("GMAIL_ENABLED", "false").lower() == "true" else "demo",
    }


@app.get("/api/emails")
def list_emails(db: Session = Depends(get_db)):
    return {"emails": get_all_emails(db)}


@app.post("/api/process")
async def process_email(email: EmailInput, db: Session = Depends(get_db)):
    result = await run_pipeline(email.model_dump())
    saved  = save_email(db, result)
    return saved


@app.post("/api/demo/generate")
async def generate_demo_email(db: Session = Depends(get_db)):
    """Pick a random demo email, run full pipeline, save & return."""
    raw = get_random_demo_email()
    raw["source"] = "demo"
    result = await run_pipeline(raw)
    saved  = save_email(db, result)
    return saved


@app.post("/api/demo/load-inbox")
async def load_demo_inbox(db: Session = Depends(get_db)):
    """
    Load initial batch of ~15 demo emails in parallel.
    Uses asyncio.gather so all LLM calls fire concurrently.
    """
    # Clear old demo emails first so reload is clean
    clear_all_emails(db)

    batch = get_initial_demo_batch()
    for raw in batch:
        raw["source"] = "demo"

    # Run all pipelines concurrently
    results = await asyncio.gather(*[run_pipeline(r) for r in batch])

    saved = []
    for result in results:
        s = save_email(db, result)
        saved.append(s)

    return {"emails": saved, "count": len(saved)}


@app.post("/api/emails/{email_id}/read")
def mark_email_read(email_id: str, db: Session = Depends(get_db)):
    mark_read(db, email_id)
    return {"ok": True}


@app.post("/api/emails/{email_id}/star")
def star_email(email_id: str, db: Session = Depends(get_db)):
    starred = toggle_star(db, email_id)
    return {"starred": starred}


@app.post("/api/emails/{email_id}/snooze")
def snooze(email_id: str, body: SnoozeInput, db: Session = Depends(get_db)):
    until = (datetime.now() + timedelta(minutes=body.minutes)).isoformat()
    snooze_email(db, email_id, until)
    return {"snoozed_until": until}


@app.get("/api/reminders")
def get_reminders(db: Session = Depends(get_db)):
    all_emails = get_all_emails(db)
    reminders  = [e for e in all_emails if should_remind(e)]
    return {"reminders": reminders}
