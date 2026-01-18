import os
import requests
import tensorflow as tf

MODEL_PATH = "pest_inception_transfer.h5"
MODEL_URL = os.getenv(
    "MODEL_URL",
    "https://huggingface.co/Mitali06/pest-detection-model/resolve/main/pest_inception_transfer.tflite"
)

_model = None  # cache

def get_model():
    global _model

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            print("⬇️ Downloading model from Hugging Face...")
            response = requests.get(MODEL_URL, stream=True)
            response.raise_for_status()

            with open(MODEL_PATH, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    f.write(chunk)

        print("✅ Loading model into memory...")
        _model = tf.keras.models.load_model(MODEL_PATH)

    return _model
