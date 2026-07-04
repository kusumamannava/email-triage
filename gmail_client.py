"""
Gmail OAuth2 Client - Read Only
Set GMAIL_ENABLED=true in .env and place credentials.json in /backend/ to activate.
"""
import os, base64
GMAIL_ENABLED = os.getenv("GMAIL_ENABLED", "false").lower() == "true"
CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "../credentials.json")
TOKEN_PATH = os.path.join(os.path.dirname(__file__), "../token.json")
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def get_gmail_service():
    if not GMAIL_ENABLED:
        return None
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        creds = None
        if os.path.exists(TOKEN_PATH):
            creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
                creds = flow.run_local_server(port=0)
            with open(TOKEN_PATH, "w") as f:
                f.write(creds.to_json())
        return build("gmail", "v1", credentials=creds)
    except Exception as e:
        print(f"[Gmail] Auth error: {e}")
        return None

def fetch_recent_emails(max_results=20):
    if not GMAIL_ENABLED:
        return []
    service = get_gmail_service()
    if not service:
        return []
    try:
        results = service.users().messages().list(userId="me", labelIds=["INBOX"], maxResults=max_results).execute()
        messages = results.get("messages", [])
        emails = []
        for msg_ref in messages:
            msg = service.users().messages().get(userId="me", id=msg_ref["id"], format="full").execute()
            headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
            subject = headers.get("Subject", "(no subject)")
            sender = headers.get("From", "unknown@unknown.com")
            body = ""
            payload = msg["payload"]
            if "parts" in payload:
                for part in payload["parts"]:
                    if part["mimeType"] == "text/plain":
                        data = part["body"].get("data", "")
                        body = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="ignore")
                        break
            elif "body" in payload:
                data = payload["body"].get("data", "")
                if data:
                    body = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="ignore")
            is_unread = "UNREAD" in msg.get("labelIds", [])
            emails.append({
                "id": msg_ref["id"],
                "sender": sender,
                "sender_name": sender.split("<")[0].strip() if "<" in sender else sender,
                "subject": subject,
                "body": body[:3000],
                "received_at": headers.get("Date", ""),
                "is_read": not is_unread,
                "is_starred": "STARRED" in msg.get("labelIds", []),
            })
        return emails
    except Exception as e:
        print(f"[Gmail] Fetch error: {e}")
        return []
