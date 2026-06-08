import type { FindingLabel } from "@/lib/constants";
import { conditionName } from "@/lib/i18n";
import type { Locale } from "@/store/useLocaleStore";
import type { EducationalInsight } from "@/types";

type InsightTemplate = { title: string; text: string; category: string };

const TEMPLATES_EN: Record<FindingLabel, InsightTemplate[]> = {
  Melanoma: [
    {
      title: "What suspicious melanoma patterns mean",
      text: "Melanoma is a serious form of skin cancer. AI may flag asymmetry, irregular borders, or uneven color on a phone photo. Only a dermatologist can confirm with dermoscopy and biopsy.",
      category: "overview",
    },
    {
      title: "Typical clinical pathway",
      text: "Clinicians often use the ABCDE criteria, dermoscopy, and urgent dermatology referral when melanoma is suspected. Early detection improves outcomes.",
      category: "treatment",
    },
  ],
  "Basal Cell Carcinoma": [
    {
      title: "Understanding basal cell carcinoma",
      text: "BCC is the most common skin cancer, often appearing as a pearly bump or non-healing sore. AI flags visual patterns but cannot replace in-person examination.",
      category: "overview",
    },
    {
      title: "Management themes",
      text: "Treatment may include surgical excision, Mohs surgery, or other dermatologist-directed therapies depending on location and subtype.",
      category: "treatment",
    },
  ],
  "Benign Nevus": [
    {
      title: "Benign mole appearance",
      text: "A benign nevus is a common pigmented lesion. AI may classify patterns as consistent with a benign mole, but any changing lesion should still be reviewed by a clinician.",
      category: "overview",
    },
    {
      title: "When to seek review",
      text: "Watch for changes in size, shape, color, or symptoms such as bleeding or itching. Regular skin checks are recommended for high-risk individuals.",
      category: "treatment",
    },
  ],
};

const TEMPLATES_ZH_HANT: Record<FindingLabel, InsightTemplate[]> = {
  Melanoma: [
    {
      title: "可疑黑色素瘤的意義",
      text: "黑色素瘤是較嚴重的皮膚癌。AI 可能在手機照片上標示不對稱、邊界不規則或顏色不均。只有皮膚科醫師能透過皮膚鏡及活檢確認。",
      category: "overview",
    },
    {
      title: "常見臨床路徑",
      text: "醫師常使用 ABCDE 準則、皮膚鏡檢查，並在懷疑黑色素瘤時盡快轉介皮膚科。",
      category: "treatment",
    },
  ],
  "Basal Cell Carcinoma": [
    {
      title: "基底細胞癌簡介",
      text: "基底細胞癌是最常見的皮膚癌，可能呈珍珠狀凸起或久不癒合的傷口。AI 僅供教育參考，不能取代面診。",
      category: "overview",
    },
    {
      title: "處理方向",
      text: "治療可能包括手術切除、莫氏手術或其他由皮膚科醫師決定的方案。",
      category: "treatment",
    },
  ],
  "Benign Nevus": [
    {
      title: "良性痣的外觀",
      text: "良性痣是常見的色素病灶。AI 可能判斷為良性外觀，但若有變化仍應請醫師覆檢。",
      category: "overview",
    },
    {
      title: "何時應覆檢",
      text: "留意大小、形狀、顏色改變，或出血、痕癢等症狀。高風險人士宜定期皮膚檢查。",
      category: "treatment",
    },
  ],
};

const TEMPLATES_ZH_HANS: Record<FindingLabel, InsightTemplate[]> = {
  Melanoma: [
    {
      title: "可疑黑色素瘤的意义",
      text: "黑色素瘤是较严重的皮肤癌。AI 可能在手机照片上标示不对称、边界不规则或颜色不均。只有皮肤科医生能通过皮肤镜及活检确认。",
      category: "overview",
    },
    {
      title: "常见临床路径",
      text: "医生常使用 ABCDE 准则、皮肤镜检查，并在怀疑黑色素瘤时尽快转诊皮肤科。",
      category: "treatment",
    },
  ],
  "Basal Cell Carcinoma": [
    {
      title: "基底细胞癌简介",
      text: "基底细胞癌是最常见的皮肤癌，可能呈珍珠状凸起或久不愈合的伤口。AI 仅供教育参考，不能取代面诊。",
      category: "overview",
    },
    {
      title: "处理方向",
      text: "治疗可能包括手术切除、莫氏手术或其他由皮肤科医生决定的方案。",
      category: "treatment",
    },
  ],
  "Benign Nevus": [
    {
      title: "良性痣的外观",
      text: "良性痣是常见的色素病灶。AI 可能判断为良性外观，但若有变化仍应请医生复检。",
      category: "overview",
    },
    {
      title: "何时应复检",
      text: "留意大小、形状、颜色改变，或出血、瘙痒等症状。高风险人士宜定期皮肤检查。",
      category: "treatment",
    },
  ],
};

function templatesForLocale(locale: Locale): Record<FindingLabel, InsightTemplate[]> {
  if (locale === "zh-Hant") return TEMPLATES_ZH_HANT;
  if (locale === "zh-Hans") return TEMPLATES_ZH_HANS;
  return TEMPLATES_EN;
}

export function buildEducationalInsights(
  findings: { label: FindingLabel; displayName?: string }[],
  locale: Locale = "en",
): EducationalInsight[] {
  const templates = templatesForLocale(locale);
  const out: EducationalInsight[] = [];
  let idx = 1;

  if (findings.length === 0) {
    const generic =
      locale === "zh-Hant"
        ? {
            title: "本次掃描重點",
            text: "AI 未標示明顯高關注模式。這並不代表沒有問題—請以皮膚科醫師面診及正式評估為準。",
          }
        : locale === "zh-Hans"
          ? {
              title: "本次扫描重点",
              text: "AI 未标示明显高关注模式。这并不代表没有问题—请以皮肤科医生面诊及正式评估为准。",
            }
          : {
              title: "About your scan",
              text: "The AI did not flag strong patterns on this photo. That does not rule out important findings—always rely on an in-person dermatology review for changing lesions.",
            };
    return [
      {
        id: "i1",
        title: generic.title,
        text: generic.text,
        finding_trigger: "General",
        category: "overview",
      },
    ];
  }

  for (const f of findings.slice(0, 3)) {
    const label = f.label;
    const name = f.displayName ?? conditionName(locale, label);
    for (const tpl of templates[label] ?? []) {
      out.push({
        id: `i${idx}`,
        title: tpl.title.replace(/finding/gi, name),
        text: tpl.text,
        finding_trigger: label,
        category: tpl.category,
      });
      idx += 1;
    }
  }
  return out.slice(0, 6);
}

/** Plain strings for PDF export. */
export function educationalInsightsToPdfLines(insights: EducationalInsight[]): string[] {
  return insights.map((row) => `${row.title}: ${row.text}`);
}
