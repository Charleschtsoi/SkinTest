"""
Smoke-test validator for SkinTest Model 2 (.h5).

This script:
- loads a given Keras .h5 model
- preprocesses a single image the same way SkinTest backend Model 2 does
  (direct resize to 224x224 + resnet_v2 preprocess_input by default)
- runs inference and prints:
  - top predicted label
  - full probability distribution

It does not require GPU and does not touch GCS.
"""

from __future__ import annotations

import argparse
from io import BytesIO
from typing import Sequence

import numpy as np  # type: ignore
import tensorflow as tf  # type: ignore
from PIL import Image  # type: ignore

from tensorflow.keras.applications.resnet_v2 import preprocess_input  # type: ignore


def _csv(s: str) -> list[str]:
  return [x.strip() for x in s.split(",") if x.strip()]


def preprocess_backend_like(image_bytes: bytes) -> np.ndarray:
  # Matches backend/main.py: _preprocess_model2_vision_h5_numpy defaults:
  # - convert to RGB
  # - resize to (224, 224)
  # - apply resnet_v2 preprocess_input on float32 array
  img = Image.open(BytesIO(image_bytes)).convert("RGB")
  img = img.resize((224, 224), Image.Resampling.BILINEAR)
  arr = np.asarray(img, dtype=np.float32)
  arr = preprocess_input(arr)
  return np.expand_dims(arr, axis=0)


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--model-path", required=True)
  parser.add_argument("--image-path", required=True)
  parser.add_argument(
    "--labels",
    default="Benign Nevus,Melanoma,Basal Cell Carcinoma",
    help="Comma-separated label order to interpret softmax indices.",
  )
  args = parser.parse_args()

  labels: Sequence[str] = _csv(args.labels)

  with open(args.image_path, "rb") as f:
    image_bytes = f.read()

  batch = preprocess_backend_like(image_bytes)

  model = tf.keras.models.load_model(args.model_path, compile=False)
  preds = model.predict(batch, verbose=0)[0]

  if preds.shape[0] < len(labels):
    raise SystemExit(
      f"Model returned {preds.shape[0]} logits but labels has {len(labels)}. "
      "Fix MODEL2_VISION_LABELS order to match your exported model."
    )

  # Use first N if the model has extra outputs (defensive).
  preds = preds[: len(labels)]
  probs = {labels[i]: float(preds[i]) for i in range(len(labels))}

  top_label = max(probs, key=probs.get)
  top_score = probs[top_label]

  print("Top prediction:", top_label)
  print("Top probability:", round(top_score, 4))
  print("All probabilities:")
  for k in labels:
    print(f"- {k}: {round(probs[k], 6)}")


if __name__ == "__main__":
  main()

