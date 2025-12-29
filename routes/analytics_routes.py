from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer
from bson.son import SON
from bson import ObjectId
from config.db import predictions_collection
from middleware.auth_middleware import get_current_user

security = HTTPBearer()

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
    dependencies=[Depends(security)]
)

# =========================
# MONTHLY ANALYTICS
# =========================
from bson import ObjectId
from bson.son import SON

@router.get("/monthly")
def monthly_stats(user_id: str = Depends(get_current_user)):
    pipeline = [
        {
            "$match": {
                "userId": ObjectId(user_id)   # ✅ FIXED
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$createdAt"},
                    "month": {"$month": "$createdAt"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": SON([("_id.year", 1), ("_id.month", 1)])}
    ]

    data = predictions_collection.aggregate(pipeline)

    return [
        {
            "month": f"{d['_id']['year']}-{d['_id']['month']:02d}",
            "count": d["count"]
        }
        for d in data
    ]


# =========================
# YEARLY ANALYTICS
# =========================
@router.get("/yearly")
def yearly_stats(user_id: str = Depends(get_current_user)):
    pipeline = [
        {"$match": {"userId": ObjectId(user_id)}},   # ✅ FIX
        {
            "$group": {
                "_id": {"year": {"$year": "$createdAt"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id.year": 1}}
    ]

    return [
        {"year": str(d["_id"]["year"]), "count": d["count"]}
        for d in predictions_collection.aggregate(pipeline)
    ]


# =========================
# OVERALL STATS
# =========================
@router.get("/stats")
def overall_stats(user_id: str = Depends(get_current_user)):
    uid = ObjectId(user_id)

    return {
        "total": predictions_collection.count_documents({"userId": uid}),
        "high": predictions_collection.count_documents({"userId": uid, "risk": "high"}),
        "medium": predictions_collection.count_documents({"userId": uid, "risk": "medium"}),
        "low": predictions_collection.count_documents({"userId": uid, "risk": "low"})
    }


# =========================
# RECENT PREDICTIONS
# =========================
@router.get("/recent")
def recent_predictions(user_id: str = Depends(get_current_user)):
    data = predictions_collection.find(
        {"userId": ObjectId(user_id)}    # ✅ FIX
    ).sort("createdAt", -1).limit(5)

    return [
        {
            "_id": str(d["_id"]),
            "pestName": d.get("pestName"),
            "confidence": d.get("confidence"),
            "risk": d.get("risk"),
            "createdAt": d.get("createdAt"),
            "imageUrl": d.get("imageUrl")
        }
        for d in data
    ]
