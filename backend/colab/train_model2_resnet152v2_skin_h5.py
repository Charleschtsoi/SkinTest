"""
Colab-ready training template for SkinTest Model 2: ResNet-152V2 -> Keras .h5.

Privacy:
- Keep your notebook + dataset private (do not publish links).
- Do not commit/export weights to git public history.

Label-order contract:
- Backend interprets model outputs using MODEL2_VISION_LABELS in backend/.env.
- This script prints the inferred class order (folder names order) so you can
  set MODEL2_VISION_LABELS to the same order.

Backend preprocessing parity note:
- SkinTest backend Model 2 inference preprocesses by direct resize to 224x224
  and applies resnet_v2 preprocess_input (see backend/main.py: _preprocess_model2_vision_h5_numpy).
- This script uses image_size=(224, 224) and applies resnet_v2 preprocess_input,
  matching that expectation.
"""

from __future__ import annotations

import argparse
import os
from typing import Sequence

import tensorflow as tf  # type: ignore

from tensorflow.keras.applications.resnet_v2 import ResNet152V2, preprocess_input  # type: ignore


def _csv(s: str) -> list[str]:
  return [x.strip() for x in s.split(",") if x.strip()]


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--data-dir", required=True, help="Directory with subfolders per class.")
  parser.add_argument(
    "--output",
    default="resnet152v2_skin.h5",
    help="Output .h5 path (download from Colab afterwards).",
  )
  parser.add_argument("--epochs", type=int, default=10)
  parser.add_argument("--batch-size", type=int, default=16)
  parser.add_argument("--val-split", type=float, default=0.15)
  parser.add_argument("--seed", type=int, default=1337)
  parser.add_argument(
    "--class-names",
    default="Benign Nevus,Melanoma,Basal Cell Carcinoma",
    help="Expected class order to compare with inferred folder order.",
  )
  args = parser.parse_args()

  expected_order: Sequence[str] = _csv(args.class_names)

  # image_dataset_from_directory infers label indices from subfolder names order.
  train_ds = tf.keras.utils.image_dataset_from_directory(
    args.data_dir,
    labels="inferred",
    label_mode="categorical",
    validation_split=args.val_split,
    subset="training",
    seed=args.seed,
    image_size=(224, 224),
    batch_size=args.batch_size,
  )
  val_ds = tf.keras.utils.image_dataset_from_directory(
    args.data_dir,
    labels="inferred",
    label_mode="categorical",
    validation_split=args.val_split,
    subset="validation",
    seed=args.seed,
    image_size=(224, 224),
    batch_size=args.batch_size,
  )

  inferred_order = list(train_ds.class_names)
  print("Inferred class order (folder names):", inferred_order)
  print("Expected backend MODEL2_VISION_LABELS order:", list(expected_order))
  if inferred_order != list(expected_order):
    raise SystemExit(
      "Class order mismatch. Rename data folders OR update MODEL2_VISION_LABELS to match inferred order."
    )

  num_classes = len(inferred_order)

  def _prep(x, y):
    # Ensure dtype float32 and apply Keras resnet_v2 preprocess_input.
    x = tf.cast(x, tf.float32)
    return preprocess_input(x), y

  train_ds = train_ds.map(_prep).prefetch(tf.data.AUTOTUNE)
  val_ds = val_ds.map(_prep).prefetch(tf.data.AUTOTUNE)

  base = ResNet152V2(include_top=False, weights="imagenet", input_shape=(224, 224, 3))
  base.trainable = False  # freeze for initial stable training

  inputs = tf.keras.Input(shape=(224, 224, 3))
  x = base(inputs, training=False)
  x = tf.keras.layers.GlobalAveragePooling2D()(x)
  x = tf.keras.layers.Dropout(0.2)(x)
  outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
  model = tf.keras.Model(inputs=inputs, outputs=outputs)

  model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=[tf.keras.metrics.CategoricalAccuracy(name="acc")],
  )

  model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

  # Optional fine-tune (uncomment if you want):
  # base.trainable = True
  # model.compile(
  #   optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
  #   loss="categorical_crossentropy",
  #   metrics=[tf.keras.metrics.CategoricalAccuracy(name="acc")],
  # )
  # model.fit(train_ds, validation_data=val_ds, epochs=max(3, args.epochs // 3))

  out_path = os.path.abspath(args.output)
  model.save(out_path)
  print("Saved:", out_path)

  # Save class order for you to paste into MODEL2_VISION_LABELS.
  with open(os.path.join(os.path.dirname(out_path), "model2_class_order.txt"), "w", encoding="utf-8") as f:
    f.write(",".join(inferred_order) + "\n")
  print("Wrote class order to model2_class_order.txt")


if __name__ == "__main__":
  main()

