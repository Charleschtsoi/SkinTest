# SkinTest AI

SkinTest AI is a smartphone-based skin lesion education companion. It runs an ensemble of vision models on uploaded photos and synthesizes an educational report via Gemini.

**Important:** This project is educational and research-oriented. It is not a medical diagnostic tool.

## Monorepo layout

| Directory | Stack | Role |
|-----------|-------|------|
| `frontend/` | Next.js 14, TypeScript, Tailwind | Upload UI, results dashboard, BFF proxy |
| `backend/` | FastAPI, PyTorch, TensorFlow | Vision ensemble, Grad-CAM, Gemini synthesis |

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7861 --reload
```

Health check: `curl http://127.0.0.1:7861/health`

### Frontend

```bash
cd frontend
cp .env.example .env.local   # after copying from LungLens template
npm install
npm run dev
```

Open http://localhost:3000

### Environment

**Frontend** (`.env.local`):

- `BACKEND_API_BASE_URL=http://127.0.0.1:7861`
- `BACKEND_API_KEY=` (optional locally)
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:7861`

**Backend** (`.env`):

- `ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `GEMINI_API_KEY=` (for LLM synthesis)
- Model paths — see `backend/.env.example`

## Safety disclaimer

Educational/research use only. Not a substitute for medical diagnosis. Always consult a qualified healthcare professional.
