import tensorflow as tf

MODEL_PATH = "pest_inception_transfer.h5"
TFLITE_PATH = "pest_inception_transfer.tflite"

model = tf.keras.models.load_model(MODEL_PATH)

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

tflite_model = converter.convert()

with open(TFLITE_PATH, "wb") as f:
    f.write(tflite_model)

print("✅ Converted to TFLite successfully")
