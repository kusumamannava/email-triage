"""
Rule-based pre-classifier. No training needed.
Returns urgency + whether to skip LLM (cost saving).
"""

CRITICAL_KEYWORDS = [
    "production down", "outage", "critical", "urgent", "immediately",
    "breach", "compromised", "emergency", "server down", "payment failed",
    "system failure", "terminated", "suspended", "action required today",
    "respond today", "response needed today", "past due", "overdue",
]
HIGH_KEYWORDS = [
    "important", "required", "approval needed", "deadline", "by friday",
    "by monday", "end of week", "eow", "eod", "contract", "invoice",
    "follow up", "meeting tomorrow", "escalation", "client complaint",
    "legal", "compliance", "renewal",
]
LOW_KEYWORDS = [
    "unsubscribe", "newsletter", "digest", "weekly roundup", "sale",
    "deal", "offer", "discount", "promotion", "no-reply", "noreply",
    "wrapped", "top stories", "recommended for you", "you might like",
]
MARKETING_SENDERS = [
    "newsletter", "digest", "noreply", "no-reply", "deals", "promo",
    "marketing", "info@", "hello@", "team@", "hello@", "hi@",
]
ALERT_SENDERS = [
    "pagerduty", "alert", "billing", "aws", "security", "stripe",
    "github", "datadog", "sentry", "cloudwatch",
]


def pre_classify(sender: str, subject: str, body: str) -> dict:
    """
    Returns: { urgency, skip_llm, reason }
    skip_llm=True only for very obvious LOW emails (saves OpenRouter cost).
    """
    text = f"{subject} {body}".lower()
    subj = subject.lower()
    sndr = sender.lower()

    critical_hits = sum(1 for kw in CRITICAL_KEYWORDS if kw in text)
    high_hits     = sum(1 for kw in HIGH_KEYWORDS if kw in text)
    low_hits      = sum(1 for kw in LOW_KEYWORDS if kw in text)

    is_marketing = any(kw in sndr for kw in MARKETING_SENDERS)
    is_alert     = any(kw in sndr for kw in ALERT_SENDERS)
    subj_caps    = sum(1 for c in subject if c.isupper()) > len(subject) * 0.4

    # --- Hard CRITICAL rules ---
    if critical_hits >= 2 or (critical_hits >= 1 and is_alert) or (subj_caps and critical_hits >= 1):
        return {"urgency": "CRITICAL", "skip_llm": False, "reason": "critical_keywords"}

    # --- Hard LOW rules (skip LLM) ---
    if is_marketing and low_hits >= 1 and critical_hits == 0 and high_hits == 0:
        return {"urgency": "LOW", "skip_llm": True, "reason": "marketing_sender"}
    if low_hits >= 2 and critical_hits == 0 and high_hits == 0:
        return {"urgency": "LOW", "skip_llm": True, "reason": "low_keywords"}

    # --- HIGH hint ---
    if high_hits >= 2 or (high_hits >= 1 and is_alert):
        return {"urgency": "HIGH", "skip_llm": False, "reason": "high_keywords"}

    # --- Uncertain — let LLM decide ---
    return {"urgency": "MODERATE", "skip_llm": False, "reason": "uncertain"}
