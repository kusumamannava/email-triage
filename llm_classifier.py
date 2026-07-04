"""
MODULE 3 — LLM CLASSIFIER via OpenRouter.
Called only when rule_classifier is uncertain (not obvious LOW).
"""
import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL   = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct")
OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are an email urgency classifier. Analyze the email and reply ONLY with a JSON object — no markdown, no explanation.

Required JSON fields:
{
  "summary": "1-2 sentence summary of what this email is about and what action is needed",
  "urgency": "CRITICAL or HIGH or MODERATE or LOW",
  "urgency_reason": "One sentence explaining the urgency level",
  "action_required": true or false,
  "action_hint": "What to do next, or null if nothing needed"
}

Urgency rules:
- CRITICAL: Production issues, security breaches, immediate financial loss, contract termination threats. Must respond NOW.
- HIGH: Deadlines within 24-48h, client escalations, important approvals, legal/compliance deadlines.
- MODERATE: Non-urgent tasks, scheduled things, info with no hard deadline.
- LOW: Newsletters, marketing, automated digests, social notifications."""


async def classify_with_llm(sender: str, subject: str, clean_body: str, hint: str) -> dict:
    """Call OpenRouter. Returns classification dict. Falls back gracefully."""
    if not OPENROUTER_API_KEY:
        return _fallback(sender, subject, hint)

    prompt = f"Sender: {sender}\nSubject: {subject}\n\nBody:\n{clean_body[:1800]}\n\n(Pre-classifier hint: {hint} — use your own judgment)"

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "EmailTriage",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user",   "content": prompt},
                    ],
                    "max_tokens": 250,
                    "temperature": 0.1,
                },
            )
            r.raise_for_status()
            content = r.json()["choices"][0]["message"]["content"].strip()
            # Strip markdown fences if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            return json.loads(content.strip())
    except json.JSONDecodeError:
        return _fallback(sender, subject, hint)
    except Exception as e:
        print(f"[LLM] Error: {e}")
        return _fallback(sender, subject, hint)


def _fallback(sender: str, subject: str, hint: str) -> dict:
    SLA = {"CRITICAL": 0, "HIGH": 60, "MODERATE": 480, "LOW": None}
    return {
        "summary": f"Email from {sender}: {subject}",
        "urgency": hint,
        "urgency_reason": "Classified by rule engine (LLM unavailable or no API key)",
        "action_required": hint in ("CRITICAL", "HIGH"),
        "action_hint": "Review and respond" if hint in ("CRITICAL", "HIGH") else None,
    }
