"""RGB mobile photo preprocessing for SkinTest AI vision models."""

from __future__ import annotations

from io import BytesIO
from typing import Any, Literal

import numpy as np
from PIL import Image, ImageOps

PreprocessMode = Literal["imagenet", "keras_resnet", "keras_densenet"]

IMAGE_SIZE = (224, 224)
SHORT_EDGE = 256


def load_mobile_rgb(image_bytes: bytes) -> Image.Image:
    """Load smartphone JPEG/PNG, apply EXIF orientation, return RGB PIL image."""
    img = Image.open(BytesIO(image_bytes))
    img.verify()
    img = Image.open(BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    return img.convert("RGB")


def center_crop_224(pil_img: Image.Image) -> Image.Image:
    """Resize short edge to 256, center-crop to 224x224 (aspect-preserving)."""
    from torchvision import transforms
    from torchvision.transforms import InterpolationMode

    transform = transforms.Compose(
        [
            transforms.Resize(SHORT_EDGE, interpolation=InterpolationMode.BILINEAR),
            transforms.CenterCrop(IMAGE_SIZE[0]),
        ]
    )
    return transform(pil_img)


def pil_to_rgb_hwc_01(pil_img: Image.Image) -> np.ndarray:
    """RGB PIL → float32 HWC array in [0, 1] for Grad-CAM overlay."""
    arr = np.asarray(pil_img, dtype=np.float32) / 255.0
    if arr.ndim == 2:
        arr = np.stack([arr, arr, arr], axis=-1)
    return arr


def preprocess_for_model(
    pil_img: Image.Image,
    mode: PreprocessMode,
) -> tuple[Any, Image.Image]:
    """
    Return (model_input_tensor_or_array, cropped_rgb_pil_for_display).
    All modes use center_crop_224 on oriented RGB input.
    """
    cropped = center_crop_224(pil_img)

    if mode == "imagenet":
        from torchvision import transforms

        tensor_transform = transforms.Compose(
            [
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )
        return tensor_transform(cropped), cropped

    if mode == "keras_resnet":
        from tensorflow.keras.applications.resnet_v2 import preprocess_input

        arr = np.asarray(cropped, dtype=np.float32)
        arr = preprocess_input(arr)
        return np.expand_dims(arr, axis=0), cropped

    if mode == "keras_densenet":
        from tensorflow.keras.applications.densenet import preprocess_input

        arr = np.asarray(cropped, dtype=np.float32)
        arr = preprocess_input(arr)
        return np.expand_dims(arr, axis=0), cropped

    raise ValueError(f"Unknown preprocess mode: {mode}")
