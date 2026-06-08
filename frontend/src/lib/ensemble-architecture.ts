/** Visual skin-lesion analysis slots (vision-only ensemble). */
export const VISUAL_PIPELINE_MODEL_SLOTS = [
  "model1",
  "model2",
  "model3",
  "model4_swint",
  "model5_densenet",
] as const;

export type VisualPipelineModelSlot = (typeof VISUAL_PIPELINE_MODEL_SLOTS)[number];

export type EnsembleArchitectureRow = {
  displayName: string;
  architecture: string;
  apiField: string;
  trainedBy: string;
};

/**
 * Ensemble Architecture Details table — fixed Model 1→5 order.
 * Do not sort, filter, or derive from object keys; render this array as-is.
 */
export const ENSEMBLE_ARCHITECTURE_ROWS: readonly EnsembleArchitectureRow[] = [
  {
    displayName: "Model 1 (ResNet-50)",
    architecture: "ResNet-50 (PyTorch) — skin lesion 3-class",
    apiField: "model1",
    trainedBy: "Charles Tsoi",
  },
  {
    displayName: "Model 2 (ResNet-152V2)",
    architecture: "ResNet-152V2 (Keras H5) — RGB mobile photos",
    apiField: "model2",
    trainedBy: "Charles Tsoi",
  },
  {
    displayName: "Model 3 (DenseNet-121)",
    architecture: "DenseNet-121 (PyTorch) + Grad-CAM",
    apiField: "model3",
    trainedBy: "Charles Tsoi",
  },
  {
    displayName: "Model 4 (Swin-T)",
    architecture: "Swin Transformer (Swin-T)",
    apiField: "model4_swint",
    trainedBy: "Charles Tsoi",
  },
  {
    displayName: "Model 5 (DenseNet-121)",
    architecture: "DenseNet-121 expansion (multi-class dermoscopy)",
    apiField: "model5_densenet",
    trainedBy: "Charles Tsoi",
  },
] as const;
