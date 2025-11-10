Title: MumbAI Trails — Local-Only Build (Submission-Ready)

1. Overview
- Three top-level folders only: /ai-models, /backend, /frontend
- Ports: FE 5173, BE 4000, AI 8001 (OSRM optional 5000)
- Features: mood-based recs, explore list+map, day planner with itinerary, PDF export, QR share,
  single-destination ETA + Google Maps redirect, admin CMS + CSV import + analytics,
  chatbot over local corpus, weather (mock), route-time heuristic fallback.

2. Prerequisites
- Node.js 22.x and one package manager: npm OR pnpm OR yarn
- Python 3.11 with pip (or conda)
- PostgreSQL 14+ (local)
- (Optional) OSRM local server; (Optional) Google Gemini API key for AI answers

3. Clone & Install Dependencies
Linux/macOS:
  git clone <your-repo> mumbai-trails && cd mumbai-trails
  cd backend && npm i   # OR: pnpm i   # OR: yarn
  cd ../frontend && npm i  # OR: pnpm i  # OR: yarn
  cd ../ai-models && python -m pip install -r requirements.txt
Windows (PowerShell):
  git clone <your-repo> mumbai-trails; cd mumbai-trails
  cd backend; npm i; cd ..\frontend; npm i; cd ..\ai-models; python -m pip install -r requirements.txt
Conda alternative for ai-models:
  conda create -n mumbai-trails python=3.11 -y
  conda activate mumbai-trails
  pip install -r ai-models/requirements.txt

4. Environment Setup
  cp backend/.env.example backend/.env
  cp ai-models/.env.example ai-models/.env
  cp frontend/.env.example frontend/.env
  (Edit values only if necessary; defaults work for localhost. Set GEMINI_API_KEY to enable Gemini-powered chat.)

5. Database Create & Init
Linux (Ubuntu):
  sudo apt update && sudo apt install -y postgresql postgresql-contrib
  sudo -u postgres psql
    CREATE DATABASE mumbai_trails;
    -- optional user:
    -- CREATE USER mumbai_user WITH PASSWORD 'mumbai_pass';
    -- GRANT ALL PRIVILEGES ON DATABASE mumbai_trails TO mumbai_user;
    \q
Windows:
  Use "SQL Shell (psql)" that comes with PostgreSQL and run the same SQL as above.
Prisma (from backend/):
  cd backend
  npm run gen
  npm run migrate
Seed:
  npm run seed

6. Start Services Individually
AI Models:
  cd ai-models
  python -m uvicorn app.main:app --port 8001
Backend:
  cd backend
  npm run start
Frontend:
  cd frontend
  npm run dev
Open:
  Frontend: http://localhost:5173
  Backend Swagger: http://localhost:4000/docs
  AI Health: http://localhost:8001/health

7. One-Command Start
Linux/macOS:
  bash ./start-all.sh
Windows (PowerShell):
  ./start-all.ps1

8. Default Accounts
  admin@local.test / Admin123!
  user@local.test  / User123!

9. Using the App
- Landing: pick mood → “Get Suggestions” (list + map)
- Explore: filter by category/tags/rating/price; add to plan
- Planner: “Generate Itinerary” → reorder → Save → PDF/QR
- Single destination: shows ETA + “Open in Google Maps”
- Admin: login → CSV import (/backend/seed/pois.csv) → CRUD → analytics
- Chatbot: ask “family-friendly places near Bandra” (Gemini 2.5 Flash refines responses with safety guardrails)

10. Optional (OSRM & Gemini)
- OSRM: run locally at http://localhost:5000; set OSRM_URL in ai-models/.env
- Gemini: enable `google-generativeai` (already in requirements) and export GEMINI_API_KEY (and optional GEMINI_MODEL / GEMINI_REQUESTS_PER_MINUTE) inside ai-models/.env. The chatbot enforces rate limits + profanity/context-hacking guardrails automatically.

11. Troubleshooting
- Port conflicts → change ports in .env files (FE/BE/AI) and restart.
- DB connection errors → verify DATABASE_URL; ensure postgres is running (sudo service postgresql status).
- Prisma migrate issues → delete backend/prisma/migrations and re-run gen + migrate; ensure DB is empty.
- AI model download blocked → ai-models will fallback to TF-IDF automatically.
- Gemini responses missing → ensure GEMINI_API_KEY is set and requests stay within GEMINI_REQUESTS_PER_MINUTE.
- CORS/auth issues → verify CORS_ORIGIN and USE_AUTH_COOKIES in backend/.env

12. Appendix
- API quick test: use API.http in VS Code “REST Client” or run curl samples in EVALUATION.md
- Changing ports: update env in all three folders consistently.
