from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from config.db import users_collection as user_collection
from utils.password_utils import hash_password, verify_password
from utils.jwt_utils import generate_token


# =========================
# Router
# =========================
router = APIRouter( tags=["Auth"])


# =========================
# Request Schemas
# =========================
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# SIGN UP
# =========================
@router.post("/signup")
def signup(data: SignupRequest):
    if user_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password)
    }

    result = user_collection.insert_one(user)
    token = generate_token(str(result.inserted_id))

    return {"token": token}


# =========================
# SIGN IN
# =========================
@router.post("/signin")
def signin(data: SigninRequest):
    user = user_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = generate_token(str(user["_id"]))
    return {"token": token}
