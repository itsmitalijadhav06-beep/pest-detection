from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer
from bson.son import SON
from bson import ObjectId
from config.db import predictions_collection
from middleware.auth_middleware import get_current_user

security = HTTPBearer()

router = APIRouter(
    tags=["Analytics"],
    dependencies=[Depends(security)]
)
PEST_RISK_MAP = {
    "green_leafhopper": "medium",
    "planthopper": "medium",
    "rice_bug": "low",
    "rice_leaf_roller": "high",
    "rice_stem_borer": "high",
}

SEVERITY_SCORE = {
    "low": 1,
    "medium": 2,
    "high": 3
}

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
            "createdAt": d.get("createdAt").isoformat(),
            "imageUrl": d.get("imageUrl")
        }
        for d in data
    ]
# =========================
# DAILY PEST ANALYSIS
# =========================
from datetime import datetime, timedelta

@router.get("/daily")
def daily_pest_analysis(user_id: str = Depends(get_current_user)):
    uid = ObjectId(user_id)

    # Start of today
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # End of today
    end_of_day = start_of_day + timedelta(days=1)

    pipeline = [
        {
            "$match": {
                "userId": uid,
                "createdAt": {
                    "$gte": start_of_day,
                    "$lt": end_of_day
                }
            }
        },
        {
            "$group": {
                "_id": "$pestName",
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "pestName": "$_id",
                "count": 1
            }
        },
        {
            "$sort": {"count": -1}
        }
    ]

    return list(predictions_collection.aggregate(pipeline))

# =========================
# MONTHLY INTELLIGENCE REPORT
# =========================
from datetime import datetime

@router.get("/monthly-report")
def generate_monthly_report(user_id: str = Depends(get_current_user)):

    uid = ObjectId(user_id)

    # Get current month
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)

    # Fetch this month's predictions
    monthly_data = list(predictions_collection.find({
        "userId": uid,
        "createdAt": {"$gte": start_of_month}
    }))

    if not monthly_data:
        return {"message": "No detections this month."}

    total_detections = len(monthly_data)

    pest_count = {}
    severity_count = {"high": 0, "medium": 0, "low": 0}
    total_score = 0

    for detection in monthly_data:
        pest = detection.get("pestName", "unknown")

        # Count pest frequency
        pest_count[pest] = pest_count.get(pest, 0) + 1

        # Get severity from map
        risk = PEST_RISK_MAP.get(pest, "low")
        severity_count[risk] += 1

        # Add score
        total_score += SEVERITY_SCORE[risk]

    # Calculate Severity Index
    severity_index = round(total_score / total_detections, 2)

    # Generate Smart Conclusion
    if severity_index > 2.3:
        conclusion = "Severe pest activity detected. High outbreak possibility."
    elif severity_index > 1.5:
        conclusion = "Moderate pest activity observed. Preventive measures recommended."
    else:
        conclusion = "Low pest activity observed. Crop condition appears stable."

    return {
        "month": f"{now.year}-{now.month:02d}",
        "totalDetections": total_detections,
        "pestBreakdown": pest_count,
        "severityDistribution": severity_count,
        "severityIndex": severity_index,
        "conclusion": conclusion
    }
