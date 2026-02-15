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
from utils.model_loader import get_interpreter
from datetime import datetime, timezone
import pytz


security = HTTPBearer()

router = APIRouter(
    tags=["Prediction"],
    dependencies=[Depends(security)]
)


PEST_CLASSES = [
    "green_leafhopper",
    "planthopper",
    "rice_bug",
    "rice_leaf_roller",
    "rice_stem_borer"
]

PEST_RISK_MAP = {
    "green_leafhopper": "medium",
    "planthopper": "medium",
    "rice_bug": "low",
    "rice_leaf_roller": "high",
    "rice_stem_borer": "high",
}

import numpy as np

@router.post("/predict")
async def predict_and_save(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file")

        image_base64 = base64.b64encode(image_bytes).decode()
        image_url = f"data:{file.content_type};base64,{image_base64}"

        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file")

        image = image.resize((299, 299))
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        # 🔥 Load TFLite interpreter lazily
        interpreter, input_details, output_details = get_interpreter()

        interpreter.set_tensor(input_details[0]['index'], image_array)
        interpreter.invoke()
        preds = interpreter.get_tensor(output_details[0]['index'])[0]

        idx = int(np.argmax(preds))

        pest_name = PEST_CLASSES[idx]
        confidence = float(preds[idx])
        risk = PEST_RISK_MAP.get(pest_name, "low")

        doc = {
            "userId": ObjectId(user_id) if isinstance(user_id, str) else user_id,
            "pestName": pest_name,
            "confidence": confidence,
            "risk": risk,
            "imageUrl": image_url,
            "createdAt": datetime.now(timezone.utc)
        }

        inserted = predictions_collection.insert_one(doc)

        return {
            "_id": str(inserted.inserted_id),
            "userId": str(doc["userId"]),
            "pestName": pest_name,
            "confidence": confidence,
            "risk": risk,
            "imageUrl": image_url,
            "createdAt": doc["createdAt"].isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Predict error:", e)
        raise HTTPException(status_code=500, detail="Prediction failed")