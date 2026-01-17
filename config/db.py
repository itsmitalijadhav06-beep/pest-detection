from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://itsmitalijadhav06_db_user:WPM6j9eQdMXCarZA@pest-detection.madzvbj.mongodb.net/?appName=pest-detection")


client = MongoClient(MONGO_URI)

db = client["pestguard"]

users_collection = db["users"]
predictions_collection = db["predictions"]
