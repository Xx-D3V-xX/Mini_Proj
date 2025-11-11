# Quick Start Guide - MumbAI Trails

## ⚡ Get Started in 60 Seconds

```bash
# 1. Install dependencies
pnpm run install:all

# 2. Start all services
pnpm run dev:start

# 3. Run smoke tests
pnpm run test:api-probes

# 4. Open your browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:4000/docs
```

## 🛑 Stop Services

```bash
pnpm run dev:stop
```

## 📝 What Was Fixed?

### ✅ Environment & API
- Frontend now calls `http://localhost:4000/api/*` (not `http://localhost:4000/*`)
- CORS simplified to allow `http://localhost:5173`
- All documentation updated with correct routes

### ✅ UI Issues
- Fixed invalid DOM nesting in Navbar, Landing, Profile pages
- Changed `<Link><Button>` pattern to `<Button asChild><Link>`
- Eliminates hydration warnings

### ✅ Development Automation
- Port conflict detection (4000, 5173, 8001)
- Automated service startup with health checks
- Graceful service shutdown (no orphaned processes)
- AI service stub for testing (port 8001)
- CLI API smoke tests

## 📂 Important Files

| File | Description |
|------|-------------|
| `IMPLEMENTATION_SUMMARY.md` | Complete change log |
| `TESTING_GUIDE.md` | Full testing implementation guide |
| `package.json` | Root scripts (dev:start, test:*, etc.) |
| `scripts/dev-start.sh` | Service startup automation |
| `scripts/dev-stop.sh` | Service shutdown automation |
| `scripts/api-probes.sh` | API smoke tests |
| `frontend/.env` | Frontend environment variables |

## 🧪 Testing (Requires Implementation)

The testing infrastructure is ready. To implement tests:

1. **Backend Tests** (Jest + Supertest)
   ```bash
   cd backend
   pnpm add -D jest @types/jest ts-jest supertest @types/supertest
   # Create jest.config.js and *.spec.ts files
   # See TESTING_GUIDE.md for details
   ```

2. **Frontend Tests** (Vitest + Testing Library)
   ```bash
   cd frontend
   pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom msw
   # Update vite.config.ts and create *.test.tsx files
   # See TESTING_GUIDE.md for details
   ```

3. **E2E Tests** (Playwright)
   ```bash
   cd tests/e2e
   npm init -y
   npm install -D @playwright/test
   npx playwright install
   # Create playwright.config.ts and *.spec.ts files
   # See TESTING_GUIDE.md for details
   ```

## 🚨 Troubleshooting

### Port Already in Use?
```bash
bash scripts/check-ports.sh
# Kill specific port: lsof -iTCP:4000 -sTCP:LISTEN -t | xargs kill
```

### Services Not Starting?
```bash
tail -f artifacts/backend.log
tail -f artifacts/frontend.log
tail -f artifacts/ai-stub.log
```

### Need to Restart?
```bash
pnpm run dev:stop
pnpm run dev:start
```

## 📚 Learn More

- **IMPLEMENTATION_SUMMARY.md** - What changed and why
- **TESTING_GUIDE.md** - Complete testing implementation guide
- **API.http** - Test API endpoints in VS Code
- **EVALUATION.md** - Project evaluation criteria

## ✅ What Works Now

- ✅ Frontend → Backend API communication
- ✅ CORS configured correctly
- ✅ No invalid HTML/React warnings
- ✅ Automated service management
- ✅ Port conflict prevention
- ✅ API smoke tests

## ⏳ What Needs Implementation

- ⏳ Backend unit tests (80% coverage)
- ⏳ Frontend component tests (70% coverage)
- ⏳ E2E tests (Playwright, 3 browsers)
- ⏳ Performance tests (autocannon)
- ⏳ Security scans (semgrep, gitleaks)
- ⏳ Accessibility tests (axe)

**All infrastructure is ready. Follow TESTING_GUIDE.md to implement.**

## 🎯 Next Steps

1. Read `IMPLEMENTATION_SUMMARY.md` for detailed changes
2. Follow `TESTING_GUIDE.md` to implement tests
3. Run `pnpm run dev:start` to verify everything works
4. Run `pnpm run test:api-probes` to test API endpoints

---

**Need Help?** Check `TESTING_GUIDE.md` for troubleshooting and detailed guides.
