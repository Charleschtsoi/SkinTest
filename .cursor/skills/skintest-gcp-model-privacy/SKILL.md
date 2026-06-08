---
name: skintest-gcp-model-privacy
description: >
  Provides a private GCS + Cloud Run pattern for keeping SkinTest model weights private, and documents the env-var contract to let the backend download Model 2 weights at startup.
disable-model-invocation: true
---

# SkinTest: Private Model Weights (GCP Cloud Run + GCS)

Use this skill when you are deploying SkinTest’s FastAPI backend on **GCP Cloud Run** and you want to keep model weights private while still supporting runtime inference.

## Assumptions

- Frontend never receives model weights (frontend talks to backend via API).
- Model weights are stored in a **private** Google Cloud Storage bucket.
- Cloud Run runs with a **least-privilege** service account that can read only the required object(s).

## Privacy rules (mandatory)

1. Bucket must not be public (disable uniform public access).
2. Grant `roles/storage.objectViewer` only to the Cloud Run service account and only for the relevant prefix/object(s).
3. Never store weight file contents in git history.
4. Do not expose GCS URLs in `NEXT_PUBLIC_*` environment variables.

## Recommended GCS setup

1. Create a bucket:
   - Uniform bucket-level access: enabled
   - Public access prevention: enabled
   - Versioning: optional
2. Upload your exported Model 2 weight:
   - Example object path:
     - `v1/resnet152v2_skin.h5`

## Cloud Run service account (least privilege)

1. Use a dedicated Cloud Run runtime service account (for SkinTest backend).
2. Grant:
   - `roles/storage.objectViewer`
   - Scope: bucket + prefix containing your `.h5` (or individual object if you prefer).

## Environment variable contract (Model 2 starter)

Set the following on the Cloud Run service:

- `ENABLE_MODEL2_VISION_H5=true`
- `MODEL2_VISION_H5_PATH=models/resnet152v2_skin.h5`
  - This is the destination path inside the container filesystem.
- `MODEL2_VISION_H5_GCS_URI=gs://<your-bucket>/v1/resnet152v2_skin.h5`
  - This is the private source object URI in GCS.
- `MODEL2_VISION_LABELS=Benign Nevus,Melanoma,Basal Cell Carcinoma`
  - Must match the softmax output order in the exported H5.
- `MODEL2_PREPROCESS_MODE=resnet_v2`

Secrets that may also be needed (depending on your setup):

- `GEMINI_API_KEY` for educational summary generation

## How the backend keeps weights private

The backend:

1. Checks whether the enabled weight file exists at `MODEL2_VISION_H5_PATH`
2. If missing and `MODEL2_VISION_H5_GCS_URI` is provided, downloads the object from GCS at startup
3. Loads the model in-memory, then serves inference requests

At no point does the frontend get weight files or GCS URLs.

## Verification

1. After deploy, call:
   - `GET /health`
2. Confirm:
   - `models.model2.enabled=true`
   - `models.model2.loaded=true`
   - `models.model2.file_exists=true`
3. Smoke test an upload end-to-end (frontend → backend), ensuring only JSON results are returned.

