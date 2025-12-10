from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import tensorflow as tf
import io

app = FastAPI()

# ✅ CORS FIX (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "pest_inception_transfer.h5"
model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = [
    "green_leafhopper",
    "planthopper",
    "rice_bug",
    "rice_leaf_roller",
    "rice_stem_borer"
]

@app.get("/")
def home():
    return {"message": "Pest Detection API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((299, 299))

        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        predicted_index = int(np.argmax(predictions))
        confidence = float(np.max(predictions))

        return {
            "predicted_class": CLASS_NAMES[predicted_index],
            "confidence": round(confidence, 4)
        }

    except Exception as e:
        return {"error": str(e)}
