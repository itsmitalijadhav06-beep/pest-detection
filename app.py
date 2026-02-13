from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.prediction_routes import router as prediction_router
from routes.analytics_routes import router as analytics_router
from routes.alerts_routes import router as alerts_router


app = FastAPI(title="Pest Detection API")

# =========================
# CORS Configuration
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Routes
# =========================
app.include_router(auth_router, prefix="/api/auth")
app.include_router(prediction_router, prefix="/api")
app.include_router(analytics_router, prefix="/api/analytics")
app.include_router(alerts_router, prefix="/api/alerts")

# =========================
# Health Check
# =========================
@app.get("/")
def home():
    return {"message": "Pest Detection API is running"}


