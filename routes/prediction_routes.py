from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.security import HTTPBearer
from datetime import datetime
import base64
import os
import requests
from bson import ObjectId

from config.db import predictions_collection
from middleware.auth_middleware import get_current_user

# =========================
# Security & Router
# =========================
security = HTTPBearer()

router = APIRouter(
    tags=["Prediction"],
    dependencies=[Depends(security)]
)

# =========================
# Hugging Face Config
# =========================
HF_API_URL = "https://router.huggingface.co/hf-inference/models/Mitali06/pest-detection-model"
HF_TOKEN = os.getenv("HF_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/octet-stream"
}

# =========================
# Risk Mapping
# =========================
PEST_RISK_MAP = {
    "rice_stem_borer": "high",
    "rice_leaf_roller": "high",
    "planthopper": "medium",
    "green_leafhopper": "medium",
    "rice_bug": "low"
}

def get_risk_level(pest_name: str) -> str:
    return PEST_RISK_MAP.get(pest_name, "low")

# =========================
# Prediction Endpoint
# =========================
@router.post("/predict")
async def predict_and_save(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    image_bytes = await file.read()

    # Base64 for frontend preview
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:{file.content_type};base64,{image_base64}"

    # Send image directly to Hugging Face
    response = requests.post(
        HF_API_URL,
        headers=HEADERS,
        data=image_bytes,
        timeout=60
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=response.text
        )

    result = response.json()

    # Example HF output: [{'label': 'rice_bug', 'score': 0.87}]
    top_prediction = max(result, key=lambda x: x["score"])
    pest_name = top_prediction["label"]
    confidence = float(top_prediction["score"])
    risk = get_risk_level(pest_name)

    doc = {
        "userId": ObjectId(user_id),
        "pestName": pest_name,
        "confidence": confidence,
        "risk": risk,
        "imageUrl": image_url,
        "createdAt": datetime.utcnow()
    }

    inserted = predictions_collection.insert_one(doc)

    return {
        "_id": str(inserted.inserted_id),
        "pestName": pest_name,
        "confidence": confidence,
        "risk": risk,
        "imageUrl": image_url,
        "createdAt": doc["createdAt"].isoformat()
    }
