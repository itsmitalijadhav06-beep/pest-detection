from config.db import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime

class UserModel:

    @staticmethod
    def create_user(name, email, password):
        if users_collection.find_one({"email": email}):
            return None

        user = {
            "name": name,
            "email": email,
            "password": generate_password_hash(password),
            "role": "user",
            "createdAt": datetime.utcnow()
        }

        users_collection.insert_one(user)
        user["_id"] = str(user["_id"])
        user.pop("password")
        return user

    @staticmethod
    def login_user(email, password):
        user = users_collection.find_one({"email": email})
        if user and check_password_hash(user["password"], password):
            user["_id"] = str(user["_id"])
            user.pop("password")
            return user
        return None
