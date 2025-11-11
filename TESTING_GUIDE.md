# Testing Implementation Guide

This document provides a comprehensive guide for implementing and running tests for the MumbAI Trails project.

## Quick Start

```bash
# Install dependencies
pnpm run install:all

# Start all services (with port checks and health waits)
pnpm run dev:start

# Run API probes (quick smoke tests)
pnpm run test:api-probes

# Stop all services
pnpm run dev:stop
```

## Project Structure

```
Mini_Proj/
├── scripts/
│   ├── check-ports.sh       # Port availability checker
│   ├── dev-start.sh          # Start all services with health checks
│   ├── dev-stop.sh           # Stop all services gracefully
│   ├── ai-stub.py            # AI service stub for testing
│   └── api-probes.sh         # CLI API smoke tests
├── backend/                  # NestJS backend (pnpm)
├── frontend/                 # React frontend (pnpm)
├── tests/e2e/               # Playwright E2E tests
└── artifacts/               # Test output artifacts
    ├── e2e/                 # E2E test artifacts
    ├── perf/                # Performance test results
    ├── security/            # Security scan results
    └── a11y/                # Accessibility test results
```

## Fixes Applied

### 1. Environment Configuration
- ✅ Updated `frontend/.env.example` with `/api` prefix
- ✅ Created `frontend/.env` for local development
- ✅ Set `VITE_API_BASE=http://localhost:4000/api`
- ✅ Set `VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

### 2. Backend CORS & API Prefix
- ✅ Simplified CORS configuration in `backend/src/main.ts`
- ✅ Static origin: `['http://localhost:5173']`
- ✅ Global API prefix: `/api` (already configured)
- ✅ Credentials enabled for cookies/auth

### 3. Documentation Updates
- ✅ Updated `API.http` with `@base=http://localhost:4000/api`
- ✅ Added search and POI detail endpoint examples
- ✅ Updated `EVALUATION.md` with correct `/api` routes

### 4. Invalid DOM Nesting Fixes
- ✅ Fixed `Navbar.tsx`: Changed `<Link><Button asChild>` to `<Button asChild><Link>`
- ✅ Fixed `Landing.tsx`: All Button+Link combinations now use correct pattern
- ✅ Fixed `Profile.tsx`: Button with asChild wrapping Link

### 5. Development Scripts
- ✅ `scripts/check-ports.sh`: Checks ports 4000, 5173, 8001
- ✅ `scripts/dev-start.sh`: Starts AI stub, backend, frontend with health checks
- ✅ `scripts/dev-stop.sh`: Gracefully stops all services using .pids file
- ✅ `scripts/ai-stub.py`: Python stub for AI service (port 8001)
- ✅ `scripts/api-probes.sh`: CLI tests for critical API endpoints

## Testing Implementation Status

### ✅ Completed
1. Port conflict detection
2. Service startup/shutdown automation
3. AI service stub for deterministic testing
4. API probe scripts (CLI smoke tests)
5. Root package.json with all test commands

### 🔄 Requires Implementation

#### Backend Tests (Jest + Supertest)

**Required Setup:**
```bash
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**Files to Create:**

1. `backend/jest.config.js`:
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

2. **Unit Tests** (backend/src/**/*.spec.ts):
   - `pois/pois.service.spec.ts`: Test POI search, filtering, CRUD
   - `itineraries/itineraries.service.spec.ts`: Test generation, validation
   - `integrations/integrations.service.spec.ts`: Test AI recommendations
   - `feedback/feedback.service.spec.ts`: Test feedback creation
   - Mock Prisma client and external services

3. **Integration Tests** (backend/test/integration/*.e2e-spec.ts):
   - Test CORS preflight (OPTIONS /api/search → 204)
   - Test GET /api/search?q=museum → 200
   - Test GET /api/pois/:id → 200 / 404
   - Test POST /api/itineraries → 201 / 400
   - Test POST /api/integrations/recommend → 200
   - Test POST /api/feedback → 201

**Add to backend/package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

#### Frontend Tests (Vitest + Testing Library)

**Required Setup:**
```bash
cd frontend
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw @axe-core/react
```

**Files to Create:**

1. `frontend/vite.config.ts` (add test config):
```typescript
/// <reference types="vitest" />
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

2. `frontend/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

3. **Component Tests**:
   - `pages/Landing.test.tsx`: Test hero CTA, navigation
   - `pages/Explore.test.tsx`: Test search bar, POI cards
   - `components/PoiCard.test.tsx`: Test rendering, interactions
   - Use MSW to mock API calls

4. **Accessibility Tests**:
   - Run axe on Landing, Explore, Profile pages
   - Assert no serious/critical violations

**Add to frontend/package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### E2E Tests (Playwright)

**Required Setup:**
```bash
cd tests/e2e
npm init -y
npm install -D @playwright/test
npx playwright install
```

**Files to Create:**

1. `tests/e2e/playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../../artifacts/e2e/playwright-report' }],
    ['json', { outputFile: '../../artifacts/e2e/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'cd ../.. && bash scripts/dev-start.sh',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

2. **Test Files** (tests/e2e/tests/*.spec.ts):
   - `landing.spec.ts`: Test navigation, no anchor nesting warnings
   - `explore-search.spec.ts`: Search "museum" → results appear
   - `poi-details.spec.ts`: Click result → details page renders
   - `recommend.spec.ts`: Submit mood → recommendations appear
   - `itinerary.spec.ts`: Create itinerary → success
   - `negative.spec.ts`: Invalid inputs → graceful errors

3. **Add to tests/e2e/package.json:**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug"
  }
}
```

#### Non-Functional Tests

**Performance Tests:**
```bash
# Install autocannon
npm install -g autocannon

# Create scripts/perf-test.sh
autocannon -c 10 -d 30 http://localhost:4000/api/search?q=museum \
  -o ../../artifacts/perf/search.json
```

**Security Tests:**
```bash
# Run backend linter
cd backend && pnpm run lint

# Install semgrep (optional)
brew install semgrep
semgrep --config=auto backend/src --json > artifacts/security/semgrep.json

# Install gitleaks (optional)
brew install gitleaks
gitleaks detect --source . --report-path artifacts/security/gitleaks.json
```

**Accessibility Tests:**
Integrate @axe-core/playwright in E2E tests:
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Landing page should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Running Tests

### Development Workflow

1. **Start Services:**
   ```bash
   pnpm run dev:start
   ```

2. **Run Quick Smoke Tests:**
   ```bash
   pnpm run test:api-probes
   ```

3. **Run Unit Tests:**
   ```bash
   pnpm run test:backend   # Backend Jest tests
   pnpm run test:frontend  # Frontend Vitest tests
   ```

4. **Run E2E Tests:**
   ```bash
   pnpm run test:e2e       # Playwright (all browsers)
   ```

5. **Stop Services:**
   ```bash
   pnpm run dev:stop
   ```

### Continuous Integration Ready

All scripts are designed to:
- ✅ Fail fast with non-zero exit codes
- ✅ Generate artifacts for CI/CD
- ✅ Check port conflicts before starting
- ✅ Wait for services to be healthy
- ✅ Clean up processes on failure

## Troubleshooting

### Port Conflicts
```bash
# Check which ports are busy
bash scripts/check-ports.sh

# Manually kill processes
lsof -iTCP:5173 -sTCP:LISTEN -t | xargs kill
lsof -iTCP:4000 -sTCP:LISTEN -t | xargs kill
lsof -iTCP:8001 -sTCP:LISTEN -t | xargs kill
```

### Service Startup Issues
```bash
# Check logs
tail -f artifacts/backend.log
tail -f artifacts/frontend.log
tail -f artifacts/ai-stub.log
```

### Test Failures
- Backend: Check `backend/coverage/` for coverage reports
- Frontend: Check `frontend/coverage/` for coverage reports
- E2E: Check `artifacts/e2e/playwright-report/index.html`

## Next Steps

1. Implement backend unit tests (80% coverage target)
2. Implement backend integration tests (CORS, all endpoints)
3. Implement frontend component tests (70% coverage target)
4. Configure and implement Playwright E2E tests
5. Add performance benchmarks with autocannon
6. Add security scans (eslint, semgrep, gitleaks)
7. Add accessibility tests with axe
8. Document coverage gaps and improvement areas

## Acceptance Criteria

- [x] Frontend calls `/api` endpoints successfully
- [x] No invalid DOM nesting warnings
- [x] Port conflicts detected early with clear messages
- [x] Services start/stop cleanly without orphaned processes
- [ ] Backend unit tests: ≥80% coverage
- [ ] Frontend unit tests: ≥70% coverage
- [ ] E2E tests pass on chromium/firefox/webkit
- [ ] API probes succeed with 2xx responses
- [ ] Artifacts generated in deterministic paths

## Summary

**Completed:**
- ✅ Fixed environment configuration
- ✅ Fixed CORS and API prefix issues
- ✅ Fixed invalid DOM nesting
- ✅ Created development automation scripts
- ✅ Created API probe scripts
- ✅ Added root package.json with all commands

**Requires Manual Implementation:**
- Backend Jest tests (unit + integration)
- Frontend Vitest tests (component + a11y)
- Playwright E2E test suite
- Non-functional tests (perf, security, a11y)

All infrastructure and scripts are in place. Follow the guides above to implement the actual test files.
