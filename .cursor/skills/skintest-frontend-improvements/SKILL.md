---
name: skintest-frontend-improvements
description: >
  Rebranding checklist for SkinTest: remove LungLens/chest X-ray wording, update Navbar/Footer + metadata + i18n copy, and verify upload/results flow.
disable-model-invocation: true
---

# SkinTest: Frontend Improvements (Rebrand + Copy)

Use this skill when you need to modernize the SkinTest frontend copy and branding so it consistently reflects:

- Skin lesion / skin-photo education (not chest X-rays)
- Solo creator attribution (not team/MSc group wording)
- Brand name: `SkinTest`

## Scope (where to change)

1. Global metadata
   - `frontend/src/app/layout.tsx` — `metadata.title` / `metadata.description`
2. Brand UI
   - `frontend/src/components/shared/Navbar.tsx` — brand text in the top-left
   - `frontend/src/components/shared/Footer.tsx` — copyright + any visible “LungLens”
3. i18n (majority of user-facing copy)
   - `frontend/src/lib/i18n.ts`
   - Replace “LungLens” → “SkinTest” in all locales
   - Replace “X-ray / chest X-ray” references with skin-photo / skin lesion terms
4. About + external links
   - `frontend/src/app/about/page.tsx` — update GitHub repo link(s) to `https://github.com/Charleschtsoi/SkinTest`
5. Skin-specific landing / upload / results strings
   - `frontend/src/components/landing/*` — ensure hero/how-it-works language matches skin education
   - `frontend/src/components/upload/*` — upload prompt labels
   - `frontend/src/components/results/*` — tab titles, disclaimers, and any “lung fields” mentions
   - `frontend/src/components/densenet/DenseNetPredictorCard.tsx` — alt text and prompts

## Step-by-step workflow

### 1) Remove route references to deleted Pitch

If you removed `/pitch`, confirm:

- `frontend/src/components/shared/Navbar.tsx` does not link to `/pitch`
- `frontend/src/components/landing/LandingExploreLinks.tsx` does not link to `/pitch`
- `frontend/src/lib/i18n.ts` does not include `nav.pitch`

### 2) Rebrand exact visible strings

Do the following in `frontend/src/lib/i18n.ts` (EN, zh-Hant, zh-Hans):

- Replace occurrences of `LungLens` with `SkinTest`
- Replace occurrences of `Chest X-ray`, `X-ray` and `radiologist`-style language with skin-photo education wording
- Keep disclaimers medical-safe: avoid implying diagnosis

### 3) Update components that hardcode copy

Some components may contain hardcoded English text even though many strings are in i18n.

Search:

- `frontend/src/components` and `frontend/src/app` for:
  - `LungLens`
  - `X-ray`
  - `Chest X-ray`

Update those occurrences to `SkinTest` and skin-photo terminology.

### 4) Verification (must run)

After changes:

1. Run:

   - `cd frontend && npm run build`
2. Manual smoke test (local):
   - Open `/upload`
   - Upload a sample image
   - Confirm results page renders without X-ray-specific labels
   - Confirm medical disclaimer still reads educational-only

## Output

When this skill is complete, the frontend should have:

- No visible “LungLens” wording anywhere in UI
- No visible “chest X-ray / X-ray” wording anywhere in UI copy
- Brand and links updated to the `SkinTest` GitHub repository

