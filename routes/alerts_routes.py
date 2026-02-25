from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from middleware.auth_middleware import get_current_user
import os
import requests

security = HTTPBearer()

router = APIRouter(
    tags=["Alerts"],
    dependencies=[Depends(security)]
)

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")


@router.post("/email")
def send_email_alert(
    data: dict,
    user_id: str = Depends(get_current_user)
):
    try:
        pest_name = data.get("pest_name")
        confidence = data.get("confidence")
        language = data.get("language", "en")

        receiver = FROM_EMAIL  # or fetch farmer email from DB

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
        else:
            subject = "🚨 PestGuard Alert: High Risk Pest Detected"
            body = f"""
⚠️ High Risk Pest Detected!

Pest: {pest_name}
Confidence: {confidence}%

Immediate action is recommended.
"""

        url = "https://api.sendgrid.com/v3/mail/send"

        headers = {
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "personalizations": [
                {
                    "to": [{"email": receiver}],
                    "subject": subject
                }
            ],
            "from": {"email": FROM_EMAIL},
            "content": [
                {
                    "type": "text/plain",
                    "value": body
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 202:
            print("SendGrid error:", response.text)
            raise HTTPException(status_code=500, detail="Email failed")

        return {"message": "Email sent successfully"}

    except Exception as e:
        print("Email error:", e)
        raise HTTPException(status_code=500, detail="Email failed")