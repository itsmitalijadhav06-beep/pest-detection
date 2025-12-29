from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.security import HTTPBearer
from datetime import datetime
from PIL import Image
import numpy as np
import tensorflow as tf
import io
import base64
from bson import ObjectId

from config.db import predictions_collection as prediction_collection
from middleware.auth_middleware import get_current_user

security = HTTPBearer()

router = APIRouter(
    tags=["Prediction"],
    dependencies=[Depends(security)]
)

MODEL_PATH = "pest_inception_transfer.h5"
model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = [
    "green_leafhopper",
    "planthopper",
    "rice_bug",
    "rice_leaf_roller",
    "rice_stem_borer"
]

# =========================
# Risk Helper
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


@router.post("/predict")
async def predict_and_save(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    image_bytes = await file.read()

    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:{file.content_type};base64,{image_base64}"

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((299, 299))

    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    preds = model.predict(img_array)
    idx = int(np.argmax(preds))
    confidence = float(np.max(preds))  # 0–1

    pest_name = CLASS_NAMES[idx]
    risk = get_risk_level(pest_name)

    doc = {
        "userId": ObjectId(user_id),
        "pestName": pest_name,
        "confidence": (confidence),  # % for UI
        "risk": risk,
        "imageUrl": image_url,
        "createdAt": datetime.utcnow()
    }

    result = prediction_collection.insert_one(doc)

    return {
        "_id": str(result.inserted_id),
        "pestName": doc["pestName"],
        "confidence": doc["confidence"],
        "risk": doc["risk"],
        "imageUrl": doc["imageUrl"],
        "createdAt": doc["createdAt"].isoformat()
    }
