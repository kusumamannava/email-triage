from datetime import datetime, timedelta
from typing import Optional

ALERT_CONFIG = {
    "CRITICAL": {"alert_type": "push",    "sla_minutes": 0,    "sla_label": "Respond NOW",    "reminder_after_minutes": 10,  "color": "#dc2626", "badge_color": "#dc2626"},
    "HIGH":     {"alert_type": "email",   "sla_minutes": 60,   "sla_label": "Within 1 hour",  "reminder_after_minutes": 30,  "color": "#ea580c", "badge_color": "#ea580c"},
    "MODERATE": {"alert_type": "digest",  "sla_minutes": 480,  "sla_label": "End of day",     "reminder_after_minutes": 240, "color": "#ca8a04", "badge_color": "#ca8a04"},
    "LOW":      {"alert_type": "archive", "sla_minutes": None, "sla_label": "No SLA",         "reminder_after_minutes": None,"color": "#6b7280", "badge_color": "#6b7280"},
}
URGENCY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MODERATE": 2, "LOW": 3}


def build_alert(urgency: str, received_dt: Optional[datetime] = None) -> dict:
    cfg = ALERT_CONFIG.get(urgency, ALERT_CONFIG["LOW"])
    now = received_dt or datetime.now()

    deadline   = (now + timedelta(minutes=cfg["sla_minutes"])).isoformat() if cfg["sla_minutes"] is not None else None
    reminder   = (now + timedelta(minutes=cfg["reminder_after_minutes"])).isoformat() if cfg["reminder_after_minutes"] is not None else None

    return {
        "urgency_order": URGENCY_ORDER.get(urgency, 3),
        "alert_type":    cfg["alert_type"],
        "sla_minutes":   cfg["sla_minutes"],
        "sla_label":     cfg["sla_label"],
        "deadline":      deadline,
        "reminder_at":   reminder,
        "color":         cfg["color"],
        "badge_color":   cfg["badge_color"],
    }


def should_remind(email: dict) -> bool:
    if email.get("is_read") or email.get("is_snoozed"):
        return False
    urgency = email.get("urgency", "LOW")
    cfg = ALERT_CONFIG.get(urgency)
    if not cfg or cfg["reminder_after_minutes"] is None:
        return False
    try:
        received = datetime.fromisoformat(email["received_at"])
        elapsed  = (datetime.now() - received).total_seconds() / 60
        return elapsed >= cfg["reminder_after_minutes"]
    except Exception:
        return False
