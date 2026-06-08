---
name: skintest-colab-h5-training
description: >
  Guides private Colab training/export of SkinTest Model 2 (ResNet-152V2) as a Keras .h5, keeping label-order and preprocessing aligned with the backend.
disable-model-invocation: true
---

# SkinTest: Colab .h5 Training (Model 2)

Use this skill when you need to train and export the first SkinTest vision model in a private Colab notebook (the starter path), and then validate that the exported `.h5` matches the backend inference contract.

## What to train

- Target: **Model 2 — ResNet-152V2 (.h5)** (3-class skin lesion education)
- Output artifact: a single **Keras** file, e.g. `resnet152v2_skin.h5`

## Backend contract you must match

Your backend expects:

- **Preprocessing**: `MODEL2_PREPROCESS_MODE=resnet_v2`
- **Input resolution**: 224x224 after EXIF orientation, with center-crop parity implemented in `backend/preprocessing.py`

Relevant config (read-only reference):

- `backend/.env.example` — `ENABLE_MODEL2_VISION_H5`, `MODEL2_VISION_H5_PATH`, `MODEL2_VISION_LABELS`, `MODEL2_PREPROCESS_MODE`
- `backend/preprocessing.py` — `load_mobile_rgb(...)` + `center_crop_224(...)`
- `backend/main.py` — Model 2 loader and `resnet_v2` preprocess_input usage

## Privacy rules (mandatory)

1. Keep the Colab notebook and dataset private.
2. Do **not** push weights to git (the repo’s `.gitignore` already excludes weight files).
3. Do not generate shareable public links for datasets/notebooks.
4. When exporting, download to your local machine temporarily and then copy to a private location (or private GCS in production).

## Step-by-step (Colab)

### 1) Build an explicit label-order mapping

The backend maps softmax indices to class names using `MODEL2_VISION_LABELS[i]`.

So you must ensure that the exported model’s output order is exactly the order you will set in `MODEL2_VISION_LABELS`.

Do this in the notebook:

- Choose the final class list in a fixed order (example):
  - `["Benign Nevus", "Melanoma", "Basal Cell Carcinoma"]`
- Ensure your training generator (or custom dataset) uses the same order when building targets.
- Save the mapping somewhere in your notebook output/logs (you will paste it into `MODEL2_VISION_LABELS` later).

### 2) Use resnet_v2 preprocessing during training

Use:

- `from tensorflow.keras.applications.resnet_v2 import preprocess_input`
- Ensure images go through the same effective preprocessing as the backend’s `_preprocess_model2_vision_h5_numpy(...)`

Your preprocessing parity goal:

- PIL image loading
- 224x224 resize/crop
- preprocessing via `resnet_v2` preprocess_input

### 3) Train ResNet152V2 with transfer learning

Recommended (adjust as needed):

- Instantiate `ResNet152V2(include_top=False, weights="imagenet", input_shape=(224,224,3))`
- Add pooling + dense softmax head with `units=3`
- Freeze base layers first, then fine-tune with a lower learning rate

### 4) Validate quickly inside the notebook

Before exporting:

- Run inference on 1–3 held-out images
- Confirm that predicted class names align with your saved mapping
- Record the confusion matrix/metrics for transparency

### 5) Export the model as `.h5`

Export exactly once and use a stable name:

- `model.save("resnet152v2_skin.h5")`

## Step-by-step (export → local smoke test)

1. Create `backend/models/` in your local environment if it doesn’t exist.
2. Copy the exported file into:

   - `backend/models/resnet152v2_skin.h5`

3. Enable Model 2 locally in `backend/.env`:

   - `ENABLE_MODEL2_VISION_H5=true`
   - `MODEL2_VISION_H5_PATH=models/resnet152v2_skin.h5`
   - `MODEL2_VISION_LABELS=<your exact label order comma-separated>`
   - `MODEL2_PREPROCESS_MODE=resnet_v2` (or leave default)

4. Start backend and check:

   - `GET http://127.0.0.1:7861/health`
   - Look for `models.model2.loaded=true` and `file_exists=true`

## Required outputs

When this skill is done, you should have:

- `resnet152v2_skin.h5` exported from a private Colab session
- A confirmed label-order mapping that matches `MODEL2_VISION_LABELS`
- A local smoke test plan (and ideally a successful health check)

