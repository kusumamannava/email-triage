"""
Demo email pool — 20 realistic emails across all urgency levels.
Used in demo mode to populate the inbox without Gmail auth.
"""
import random
from datetime import datetime, timedelta

# Raw email templates — go through the full NLP + rule + LLM pipeline
_POOL = [
    # ── CRITICAL ──────────────────────────────────────────────────────────────
    {
        "sender": "devops@company.com",
        "sender_name": "DevOps Team",
        "subject": "URGENT: Production server down — immediate action needed",
        "body": "The main production server (prod-01) has been unresponsive for 15 minutes. All customer-facing services are down. Error: connection timeout on port 443. Check /var/log/app/error.log, restart the application service, and update the status page. P0 incident — all hands on deck.",
    },
    {
        "sender": "alerts@stripe.com",
        "sender_name": "Stripe Alerts",
        "subject": "Payment processing failure — 47 transactions declined this hour",
        "body": "We detected 47 failed payment transactions in the last hour on your Stripe account. Possible causes: API key rotation, webhook endpoint down, card processor outage. Review your Stripe Dashboard immediately to prevent further revenue loss.",
    },
    {
        "sender": "security@corp.com",
        "sender_name": "Security Team",
        "subject": "Unauthorized login attempt from unrecognized IP — action required",
        "body": "A login attempt from IP 185.220.101.47 (Russia) was blocked at 8:30 AM. Recommended actions: change your password immediately, enable 2FA, and review recent account activity. If you did not authorize this, your credentials may be compromised.",
    },
    {
        "sender": "ceo@bigclient.com",
        "sender_name": "Robert Chen (CEO)",
        "subject": "Contract termination — response needed TODAY",
        "body": "I need to speak with your leadership team today. We have been experiencing service degradation for 3 weeks and our board has asked me to explore alternatives unless we receive a concrete remediation plan by 5 PM today. This is regarding our $450,000 annual contract. Please call me directly.",
    },
    # ── HIGH ──────────────────────────────────────────────────────────────────
    {
        "sender": "sarah.kim@client.com",
        "sender_name": "Sarah Kim",
        "subject": "Contract renewal — response needed by EOD Friday",
        "body": "Following up on the contract renewal discussion from last week. We need a decision by Friday COB. The current contract expires on the 15th. Please review Section 4.2 (updated SLA terms) and send back a signed copy or your counter-proposal.",
    },
    {
        "sender": "hr@company.com",
        "sender_name": "HR Department",
        "subject": "Action required: Benefits enrollment closes in 48 hours",
        "body": "This is a reminder that open enrollment for health, dental, and vision benefits closes this Friday at 5 PM. If you do not make your selections by then, you will be defaulted to the basic plan. Please log into the HR portal and complete your enrollment now.",
    },
    {
        "sender": "aws-billing@amazon.com",
        "sender_name": "AWS Billing",
        "subject": "Unusual billing activity — your bill increased 340% this month",
        "body": "We have detected unusually high usage on your AWS account. Your estimated bill for this month is $8,240, compared to $1,850 last month — a 340% increase. This may indicate misconfigured resources or unauthorized access. Please review your usage in the AWS Console immediately.",
    },
    {
        "sender": "legal@lawfirm.com",
        "sender_name": "Morrison & Associates",
        "subject": "NDA breach — immediate response required",
        "body": "We represent XYZ Corp and have reason to believe that confidential information covered by the NDA dated Jan 2023 has been disclosed without authorization. We require your response within 48 hours. Please forward this to your legal team immediately.",
    },
    {
        "sender": "manager@company.com",
        "sender_name": "Jennifer Walsh",
        "subject": "Board presentation tomorrow — slides due tonight",
        "body": "Quick reminder that the Q3 board presentation is tomorrow at 9 AM. Please have your section of the slides ready and send to me tonight by 10 PM for a final review. The board will have questions on revenue projections so be prepared with supporting data.",
    },
    # ── MODERATE ──────────────────────────────────────────────────────────────
    {
        "sender": "jira@atlassian.com",
        "sender_name": "Jira",
        "subject": "Sprint 42 retrospective — 3 action items assigned to you",
        "body": "You have 3 new action items from the Sprint 42 retrospective: (1) Update API documentation by next sprint, (2) Set up monitoring alerts for the auth service, (3) Schedule a knowledge transfer session with the new team member. Please acknowledge in Jira.",
    },
    {
        "sender": "recruiter@techcorp.com",
        "sender_name": "Alex Chen",
        "subject": "Senior Engineer role — thought of you",
        "body": "Hi, I came across your profile and think you would be a great fit for a Senior Software Engineer role at TechCorp. We are building AI-powered infrastructure tools. Compensation: $180-220k + equity. Would you be open to a 15-minute call this week?",
    },
    {
        "sender": "travel@company.com",
        "sender_name": "Travel & Expenses",
        "subject": "Expense report pending your approval — $1,240",
        "body": "Team member Alex Rodriguez has submitted an expense report totaling $1,240 for your approval. Breakdown: Conference registration $800, Hotel $320, Meals $120. Reimbursement deadline is end of month. Please approve or reject in the expense portal.",
    },
    {
        "sender": "david.park@company.com",
        "sender_name": "David Park",
        "subject": "Q3 performance review — please schedule",
        "body": "Hi, it is that time of year. Please use the Calendly link to book a 45-minute performance review slot with me sometime in the next two weeks. Come prepared with a summary of your Q3 accomplishments and any blockers you are facing.",
    },
    # ── LOW ───────────────────────────────────────────────────────────────────
    {
        "sender": "noreply@medium.com",
        "sender_name": "Medium Daily Digest",
        "subject": "Top stories for you: AI, Python, and System Design",
        "body": "Here are your personalized top stories this week: 1. Why Rust is eating Python's lunch in ML (2.3k claps). 2. Building production RAG systems in 2024 (1.8k claps). 3. System design interview patterns (4.1k claps). Read at your own pace — no rush.",
    },
    {
        "sender": "deals@amazon.com",
        "sender_name": "Amazon",
        "subject": "Your wishlist items are on sale today only",
        "body": "Good news! 3 items on your wishlist are on sale. Keychron K2 Mechanical Keyboard — was $99, now $72 (27% off). Adjustable desk lamp — was $45, now $31. 7-port USB Hub — was $35, now $24. Sale ends at midnight tonight.",
    },
    {
        "sender": "noreply@linkedin.com",
        "sender_name": "LinkedIn",
        "subject": "You appeared in 47 searches this week",
        "body": "Your profile is getting noticed! You appeared in 47 searches this week, up 12% from last week. 8 people viewed your profile. 3 people reacted to your recent post about microservices. See who is viewing your profile with LinkedIn Premium.",
    },
    {
        "sender": "team@figma.com",
        "sender_name": "Figma",
        "subject": "New Figma features you might have missed this month",
        "body": "We shipped a bunch of updates this month: Auto-layout v4 improvements, Variable modes for faster theming, Dev Mode improvements with React/Swift code snippets, new multiplayer cursor chat. Full release notes on our blog.",
    },
    {
        "sender": "digest@producthunt.com",
        "sender_name": "Product Hunt",
        "subject": "Top products this week: AI tools edition",
        "body": "This week top picks: 1. Perplexity for Teams — AI search for businesses. 2. Cursor Pro — AI-first code editor. 3. Notion AI Q&A. 4. Linear AI — intelligent issue tracking. 5. v0 by Vercel — AI UI generator. Check out the full list and upvote your favorites.",
    },
    {
        "sender": "kaggle@kaggle.com",
        "sender_name": "Kaggle",
        "subject": "New badge received: Python — Gold",
        "body": "Congratulations! You have earned the Python Gold Badge on Kaggle. Your current ranking is Expert. You have published 12 notebooks with 347 total votes. Keep it up! Check out this week's featured competitions.",
    },
    {
        "sender": "noreply@fitbit.com",
        "sender_name": "Fitbit",
        "subject": "Your weekly progress report from Fitbit",
        "body": "Great week! You hit your step goal 5 out of 7 days. Weekly summary: 52,340 steps (goal: 70,000), 145 active zone minutes, 7.2 hours average sleep, 14,230 calories burned. Keep up the momentum next week!",
    },
]


def get_random_demo_email() -> dict:
    """Return a random raw email from the pool, ready for pipeline processing."""
    template = random.choice(_POOL).copy()
    minutes_ago = random.randint(1, 300)
    template["received_at"] = (datetime.now() - timedelta(minutes=minutes_ago)).isoformat()
    template["id"] = f"demo_{random.randint(10000, 99999)}"
    template["is_read"] = False
    template["is_starred"] = random.choice([False, False, False, True])
    return template


def get_initial_demo_batch() -> list:
    """
    Return all 20 demo emails with staggered timestamps.
    Pipeline will process them in parallel.
    """
    pool = _POOL.copy()
    random.shuffle(pool)
    result = []
    for i, template in enumerate(pool):
        email = template.copy()
        minutes_ago = (i * 15) + random.randint(0, 10)
        email["received_at"] = (datetime.now() - timedelta(minutes=minutes_ago)).isoformat()
        email["id"] = f"demo_{1000 + i:04d}"
        email["is_read"] = i > 4   # first 5 unread
        email["is_starred"] = i in [0, 2]  # first and third starred
        result.append(email)
    return result
