import tensorflow as tf
from tensorflow.keras import backend as K

K.set_floatx("float16")

model = tf.keras.models.load_model(
    "model_no_optimizer.h5",
    compile=False
)

model.save(
    "model_fp16.h5",
    include_optimizer=False,
    save_traces=False
)

print("✅ Converted to FP16")
