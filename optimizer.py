import tensorflow as tf

INPUT = "pest_inception_transfer.h5"
OUTPUT = "model_no_optimizer.h5"

model = tf.keras.models.load_model(INPUT, compile=False)

model.save(
    OUTPUT,
    include_optimizer=False,
    save_traces=False
)

print("✅ Optimizer & traces removed")
