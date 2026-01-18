from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.security import HTTPBearer
from datetime import datetime
import base64
import numpy as np
from PIL import Image
from io import BytesIO
from bson import ObjectId

from config.db import predictions_collection
from middleware.auth_middleware import get_current_user
from utils.model_loader import get_model

security = HTTPBearer()

router = APIRouter(
    tags=["Prediction"],
    dependencies=[Depends(security)]
)

model = get_model()

PEST_CLASSES = [
    "rice_stem_borer",
    "rice_leaf_roller",
    "planthopper",
    "green_leafhopper",
    "rice_bug"
]

PEST_RISK_MAP = {
    "rice_stem_borer": "high",
    "rice_leaf_roller": "high",
    "planthopper": "medium",
    "green_leafhopper": "medium",
    "rice_bug": "low"
}

@router.post("/predict")
async def predict_and_save(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    image_bytes = await file.read()

    # base64 preview
    image_base64 = base64.b64encode(image_bytes).decode()
    image_url = f"data:{file.content_type};base64,{image_base64}"

    # preprocess image
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    preds = model.predict(image_array)[0]
    idx = int(np.argmax(preds))

    pest_name = PEST_CLASSES[idx]
    confidence = float(preds[idx])
    risk = PEST_RISK_MAP.get(pest_name, "low")

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
