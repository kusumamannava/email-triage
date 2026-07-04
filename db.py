import os
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Text, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "email_triage.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Email(Base):
    __tablename__ = "emails"
    id            = Column(String,  primary_key=True, index=True)
    sender        = Column(String,  nullable=False)
    sender_name   = Column(String)
    subject       = Column(String)
    body          = Column(Text)
    summary       = Column(Text)
    urgency       = Column(String)
    urgency_order = Column(Integer)
    urgency_reason= Column(String)
    action_required = Column(Boolean, default=False)
    action_hint   = Column(String, nullable=True)
    alert_type    = Column(String)
    sla_minutes   = Column(Integer, nullable=True)
    sla_label     = Column(String)
    deadline      = Column(String, nullable=True)
    reminder_at   = Column(String, nullable=True)
    color         = Column(String)
    badge_color   = Column(String)
    is_read       = Column(Boolean, default=False)
    is_starred    = Column(Boolean, default=False)
    is_snoozed    = Column(Boolean, default=False)
    snooze_until  = Column(String, nullable=True)
    received_at   = Column(String)
    processed_at  = Column(String)
    source        = Column(String, default="demo")


def init_db():
    Base.metadata.create_all(bind=engine)


def _to_dict(email: Email) -> dict:
    return {c.name: getattr(email, c.name) for c in email.__table__.columns}


def save_email(db, data: dict):
    existing = db.query(Email).filter(Email.id == data["id"]).first()
    if existing:
        return _to_dict(existing)
    obj = Email(**{k: v for k, v in data.items() if hasattr(Email, k)})
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return _to_dict(obj)


def get_all_emails(db) -> list:
    rows = db.query(Email).order_by(Email.urgency_order.asc(), Email.received_at.desc()).all()
    return [_to_dict(r) for r in rows]


def clear_all_emails(db):
    db.query(Email).delete()
    db.commit()


def mark_read(db, email_id: str):
    obj = db.query(Email).filter(Email.id == email_id).first()
    if obj:
        obj.is_read = True
        db.commit()


def toggle_star(db, email_id: str) -> bool:
    obj = db.query(Email).filter(Email.id == email_id).first()
    if obj:
        obj.is_starred = not obj.is_starred
        db.commit()
        return obj.is_starred
    return False


def snooze_email(db, email_id: str, until: str):
    obj = db.query(Email).filter(Email.id == email_id).first()
    if obj:
        obj.is_snoozed = True
        obj.snooze_until = until
        db.commit()
