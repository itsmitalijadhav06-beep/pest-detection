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
    language = data.get("language", "en")  # ✅ NEW

    sender = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASSWORD")
    receiver = sender  # or farmer email from DB

    # ✅ LANGUAGE SWITCH
    if language == "hi":
        subject = "🚨 PestGuard चेतावनी: उच्च जोखिम कीट पाया गया"
        body = f"""
        ⚠️ उच्च जोखिम कीट पाया गया!

        कीट: {pest_name}
        विश्वास स्तर: {confidence}%

        कृपया तुरंत कार्रवाई करें।
        """

    elif language == "mr":
        subject = "🚨 PestGuard सूचना: उच्च जोखीम कीड आढळली"
        body = f"""
        ⚠️ उच्च जोखीम कीड आढळली!

        कीड: {pest_name}
        विश्वास पातळी: {confidence}%

        कृपया त्वरित उपाययोजना करा.
        """

    else:  # default English
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