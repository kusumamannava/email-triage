"""
MODULE 1 — NLP PREP
Strips HTML, URLs, cleans text. No external model needed.
"""
import re
from bs4 import BeautifulSoup


def strip_html(text: str) -> str:
    if "<" in text and ">" in text:
        try:
            return BeautifulSoup(text, "html.parser").get_text(separator=" ")
        except Exception:
            return re.sub(r"<[^>]+>", " ", text)
    return text


def remove_urls(text: str) -> str:
    return re.sub(r"https?://\S+|www\.\S+", "", text)


def remove_quoted_lines(text: str) -> str:
    """Remove reply/forward quoted lines (lines starting with >)."""
    lines = [l for l in text.splitlines() if not l.strip().startswith(">")]
    return "\n".join(lines)


def clean_text(text: str) -> str:
    text = strip_html(text)
    text = remove_urls(text)
    text = remove_quoted_lines(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def prepare_email(sender: str, subject: str, body: str) -> dict:
    """Clean the email body. Returns clean_body string."""
    clean_body = clean_text(body)
    return {"clean_body": clean_body}
