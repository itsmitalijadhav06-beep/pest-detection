from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")

client = MongoClient(MONGO_URI)

db = client["pestguard"]

users_collection = db["users"]
predictions_collection = db["predictions"]
