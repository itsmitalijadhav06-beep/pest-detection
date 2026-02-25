from config.db import predictions_collection
from bson import ObjectId
from datetime import datetime, timezone

from routes.prediction_routes import IST


# =========================
# Risk Helper (CLASS BASED)
# =========================
PEST_RISK_MAP = {
    "green_leafhopper": "medium",
    "planthopper": "medium",
    "rice_bug": "low",
    "rice_leaf_roller": "high",
    "rice_stem_borer": "high"
}

CONFIDENCE_THRESHOLD = 0.90  # 75%

def get_risk_level(pest_name: str) -> str:
    return PEST_RISK_MAP.get(pest_name, "low")


# =========================
# Prediction Model
# =========================
class PredictionModel:

    @staticmethod
    def save_prediction(user_id: str, pest_name: str, confidence: float):

        CONFIDENCE_THRESHOLD = 0.75

        # If low confidence → do not save
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "status": "uncertain",
                "message": "Low confidence. Please upload a clear crop image.",
                "confidence": round(confidence * 100, 2)
            }

        # If confidence is valid → continue normally
        risk = get_risk_level(pest_name)

        prediction = {
            "userId": ObjectId(user_id),
            "pestName": pest_name,
            "confidence": round(confidence * 100, 2),
            "risk": risk,
            "createdAt": datetime.now(timezone.utc)
        }

        predictions_collection.insert_one(prediction)

        return {
            "status": "success",
            "prediction": prediction
        }           

        predictions_collection.insert_one(prediction)
        return prediction

    @staticmethod
    def get_all_predictions():
        """
        Fetch all predictions (admin/debug use).
        """
        return list(
            predictions_collection.find(
                {},
                {
                    "_id": 1,
                    "userId": 1,
                    "pestName": 1,
                    "confidence": 1,
                    "risk": 1,
                    "createdAt": 1
                }
            )
        )
