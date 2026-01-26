from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer
from middleware.auth_middleware import get_current_user
import smtplib
from email.mime.text import MIMEText
import os

security = HTTPBearer()

router = APIRouter(
    tags=["Alerts"],
    dependencies=[Depends(security)]
)

@router.post("/email")
def send_email_alert(
    data: dict,
    user_id: str = Depends(get_current_user)
):
    pest_name = data.get("pest_name")
    confidence = data.get("confidence")

    sender = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASSWORD")
    receiver = sender  # or farmer email from DB

    subject = "🚨 PestGuard Alert: High Risk Pest Detected"
    body = f"""
    ⚠️ High Risk Pest Detected!

    Pest: {pest_name}
    Confidence: {confidence}%

    Immediate action is recommended.
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.send_message(msg)

    return {"message": "Email sent successfully"}
