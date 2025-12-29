from config.db import predictions_collection
from bson import ObjectId
from datetime import datetime


# =========================
# Risk Helper (CLASS BASED)
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
# Prediction Model
# =========================
class PredictionModel:

    @staticmethod
    def save_prediction(user_id: str, pest_name: str, confidence: float):
        """
        Save a pest prediction with calculated risk level.
        """
        confidence = (confidence)
        risk = get_risk_level(pest_name)



        prediction = {
            "userId": ObjectId(user_id),
            "pestName": pest_name,
            "confidence": confidence,
            "risk": risk,                     # 🔥 REQUIRED for analytics
            "createdAt": datetime.utcnow()
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
