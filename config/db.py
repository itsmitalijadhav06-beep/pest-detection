from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable is not set")

client = MongoClient(MONGO_URI)

db = client["pest-detection"]

users_collection = db["users"]
predictions_collection = db["predictions"]
