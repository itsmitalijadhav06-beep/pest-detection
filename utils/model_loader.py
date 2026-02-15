import os
import requests
import numpy as np
import tensorflow as tf

MODEL_PATH = "pest_model.tflite"
MODEL_URL = os.getenv(
    "MODEL_URL",
    "https://huggingface.co/Mitali06/pest-detection-model/resolve/main/pest_model.tflite"
)

_interpreter = None
_input_details = None
_output_details = None

def get_interpreter():
    global _interpreter, _input_details, _output_details

    if _interpreter is None:
        if not os.path.exists(MODEL_PATH):
            print("⬇️ Downloading TFLite model...")
            response = requests.get(MODEL_URL, stream=True)
            response.raise_for_status()

            with open(MODEL_PATH, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    f.write(chunk)

        print("✅ Loading TFLite model...")
        _interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        _interpreter.allocate_tensors()

        _input_details = _interpreter.get_input_details()
        _output_details = _interpreter.get_output_details()

    return _interpreter, _input_details, _output_details