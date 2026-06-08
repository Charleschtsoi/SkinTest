import { FINDING_LABELS, type FindingLabel } from "@/lib/constants";
import { denseNetResponseFromAnalyzeModel3 } from "@/lib/dense-net-from-analysis";
import { model2VisionFromAnalysis } from "@/lib/model2-vision";
import type {
  AiNoticeFindingRow,
  AnalyzeSuccessResponse,
  DenseNetResponse,
  Predictions,
} from "@/types";

export type { AiNoticeFindingRow, SkinNoticeKind } from "@/types";

const THRESHOLD = 0.3;

/** Per-class model probabilities above this (exclusive) surface in "What the AI noticed" alongside fusion scores. */
const MODEL_NOTICE_THRESHOLD = 0.5;

export type ConfidenceTier = "Low" | "Moderate" | "High";

export function confidenceTier(score: number): ConfidenceTier {
  if (score < 0.45) return "Low";
  if (score < 0.65) return "Moderate";
  return "High";
}

export function tierBarSegments(tier: ConfidenceTier): 1 | 2 | 3 {
  if (tier === "Low") return 1;
  if (tier === "Moderate") return 2;
  return 3;
}

export function formatConditionName(label: FindingLabel): string {
  return label.replace(/_/g, " ");
}

/** Top findings above threshold, sorted by score descending, max 3. */
export function getNotableFindings(predictions: Predictions): { label: FindingLabel; score: number }[] {
  return (FINDING_LABELS as readonly FindingLabel[])
    .map((label) => ({ label, score: predictions[label] }))
    .filter((x) => x.score > THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

const FINDING_LABEL_SET = new Set<string>(FINDING_LABELS as readonly string[]);

/** Normalize backend probability to 0–1 (handles 0–100 percentages). */
export function normalizeProbabilityToUnit(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  if (raw > 1 + 1e-9) return Math.min(1, raw / 100);
  return Math.min(1, Math.max(0, raw));
}

/**
 * Maps a pipeline / DenseNet class key to a dashboard finding label.
 * Skips non-actionable classes (`Normal`, `Other`).
 */
export function modelClassKeyToFindingLabel(className: string): FindingLabel | null {
  const s = typeof className === "string" ? className.trim() : "";
  if (!s || s === "Normal" || s === "Benign" || s === "Other") return null;
  if (s === "Benign Nevus") return "Benign Nevus";
  if (s === "Melanoma") return "Melanoma";
  if (s === "Basal Cell Carcinoma" || s === "BCC" || s === "Basal Cell") return "Basal Cell Carcinoma";
  if (FINDING_LABEL_SET.has(s)) return s as FindingLabel;
  return null;
}

function collectModelNoticeScores(
  analysis: AnalyzeSuccessResponse,
  denseNetDisplay: DenseNetResponse | null,
): Map<FindingLabel, number> {
  const scores = new Map<FindingLabel, number>();

  const absorb = (probabilities: Record<string, number> | undefined | null) => {
    if (!probabilities) return;
    for (const [key, raw] of Object.entries(probabilities)) {
      const score = normalizeProbabilityToUnit(raw);
      if (!(score > MODEL_NOTICE_THRESHOLD)) continue;
      const lab = modelClassKeyToFindingLabel(key);
      if (!lab) continue;
      scores.set(lab, Math.max(scores.get(lab) ?? 0, score));
    }
  };

  absorb(analysis.model1?.probabilities);
  absorb(model2VisionFromAnalysis(analysis)?.probabilities);
  absorb(analysis.model4_swint?.probabilities);
  absorb(analysis.model5_densenet?.probabilities);
  if (denseNetDisplay?.success && denseNetDisplay.probabilities) {
    absorb(denseNetDisplay.probabilities);
  } else {
    const fromAnalyze = denseNetResponseFromAnalyzeModel3(analysis);
    if (fromAnalyze?.success && fromAnalyze.probabilities) {
      absorb(fromAnalyze.probabilities);
    }
  }

  return scores;
}

function upsertNoticeRow(map: Map<string, AiNoticeFindingRow>, row: AiNoticeFindingRow) {
  const mergeKey = `${row.label}::${row.noticeKind}`;
  const prev = map.get(mergeKey);
  if (!prev || row.score > prev.score) {
    map.set(mergeKey, row);
  }
}

/**
 * Notable findings for the AI notice card: fusion scores above threshold
 * or any pipeline model class probability strictly above 50%.
 */
export function getMergedNotableFindingsForAiNotice(
  predictions: Predictions,
  analysis: AnalyzeSuccessResponse,
  denseNetDisplay: DenseNetResponse | null,
): AiNoticeFindingRow[] {
  const byKey = new Map<string, AiNoticeFindingRow>();

  for (const { label, score } of getNotableFindings(predictions)) {
    upsertNoticeRow(byKey, {
      id: `fusion-${label}`,
      label,
      score,
      noticeKind: "default",
    });
  }

  for (const [label, score] of Array.from(
    collectModelNoticeScores(analysis, denseNetDisplay).entries(),
  )) {
    upsertNoticeRow(byKey, {
      id: `model-${label}`,
      label,
      score,
      noticeKind: "default",
    });
  }

  return Array.from(byKey.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export { THRESHOLD as FINDINGS_CONFIDENCE_THRESHOLD };
