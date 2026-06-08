/** Keys returned by the analyze API `predictions` object (primary ML classifications). */
export const FINDING_LABELS = ["Melanoma", "Basal Cell Carcinoma", "Benign Nevus"] as const;

export const PIPELINE = {
  gateThreshold: 0.3,
  reportDisclaimer:
    "SkinTest AI is an educational tool only. This output is not a medical diagnosis. Always consult a qualified healthcare professional.",
} as const;

export type FindingLabel = (typeof FINDING_LABELS)[number];

/**
 * Educational descriptions (not diagnostic). Shown on the results dashboard for notable model scores.
 */
export const CONDITION_DESCRIPTIONS: Record<FindingLabel, string> = {
  Melanoma:
    "Melanoma is a type of skin cancer that can develop from pigment-producing cells. The AI flagged visual patterns that may resemble melanoma. Only a dermatologist can confirm this with dermoscopy and, if needed, biopsy.",
  "Basal Cell Carcinoma":
    "Basal cell carcinoma is the most common form of skin cancer, often appearing as a pearly or waxy bump. The AI detected patterns consistent with this category. Clinical examination is required for confirmation.",
  "Benign Nevus":
    "A benign nevus (mole) is a common, usually harmless pigmented skin lesion. The AI classified patterns as consistent with a benign appearance, but changing moles should still be reviewed by a clinician.",
};
