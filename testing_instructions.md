# Testing Instructions - Manual Implementation Guide

## 🚨 CURRENT CRITICAL ISSUES

### Issue #1: Backend Database Not Configured (BLOCKING)

**Problem:** Backend fails to start because there's no database connection configured.

**Error:** 
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Root Cause:** Backend is missing a properly configured database. The `.env` file exists but PostgreSQL is not set up.

**Solution Options:**

#### Option A: Install PostgreSQL (Recommended for Production-like Testing)

```bash
# 1. Install PostgreSQL
brew install postgresql@14

# 2. Start PostgreSQL service
brew services start postgresql@14

# 3. Create database
createdb mumbai_trails

# 4. Update backend/.env
# Ensure this line exists:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mumbai_trails

# 5. Run migrations
cd backend
pnpm install
pnpm run gen      # Generate Prisma client
pnpm run migrate  # Run database migrations
pnpm run seed     # (Optional) Seed initial data

# 6. Test backend starts
pnpm run dev
# Should see: "NestJS application successfully started"
```

#### Option B: Use SQLite (Quickest for Testing)

```bash
# 1. Update backend/prisma/schema.prisma
# Change this line:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# To this:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

# 2. Update backend/.env
DATABASE_URL="file:./dev.db"

# 3. Run migrations
cd backend
pnpm run gen
pnpm run migrate
pnpm run seed

# 4. Test backend starts
pnpm run dev
```

#### Option C: Use Docker PostgreSQL

```bash
# 1. Start PostgreSQL in Docker
docker run --name mumbai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mumbai_trails -p 5432:5432 -d postgres:14

# 2. Verify backend/.env has:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mumbai_trails

# 3. Run migrations
cd backend
pnpm run gen
pnpm run migrate
pnpm run seed

# 4. Test backend starts
pnpm run dev
```

---

### Issue #2: No Actual Test Files Implemented

**Problem:** Test infrastructure is ready, but no actual test files exist yet.

**Status:** 
- ⚠️ Backend unit tests - NOT IMPLEMENTED
- ⚠️ Backend integration tests - NOT IMPLEMENTED  
- ⚠️ Frontend component tests - NOT IMPLEMENTED
- ⚠️ E2E tests - NOT IMPLEMENTED
- ⚠️ Non-functional tests - NOT IMPLEMENTED

**Why This Matters:** Without these tests, you can't verify code quality, catch bugs, or ensure the application works correctly.

---

## 📋 STEP-BY-STEP IMPLEMENTATION GUIDE

### PHASE 1: Fix Critical Issues (30 minutes)

#### Step 1.1: Set Up Database

**Choose ONE option from Issue #1 above and complete it.**

**Verification:**
```bash
# After completing database setup, run:
cd backend
pnpm run dev

# You should see:
# [Nest] INFO [NestFactory] Starting Nest application...
# [Nest] INFO [NestApplication] Nest application successfully started on port 4000

# Press Ctrl+C to stop
```

#### Step 1.2: Verify All Services Start

```bash
# From project root
pnpm run dev:start

# Expected output:
# ✓ AI service is ready
# ✓ Backend is ready  
# ✓ Frontend is ready
# All services running successfully!

# Stop services
pnpm run dev:stop
```

#### Step 1.3: Run API Probes

```bash
# With services running, test API endpoints
pnpm run dev:start
pnpm run test:api-probes

# Expected: All probes should pass
# ✓ GET /api/search?q=museum
# ✓ GET /api/pois
# ✓ GET /health (AI Stub)

pnpm run dev:stop
```

**✅ CHECKPOINT:** If all services start and API probes pass, proceed to Phase 2.

---

### PHASE 2: Implement Backend Tests (4-6 hours)

#### Step 2.1: Install Test Dependencies

```bash
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest @nestjs/testing
```

#### Step 2.2: Create Jest Configuration

Create `backend/jest.config.js`:

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
    '!**/*.interface.ts',
    '!**/*.dto.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
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

#### Step 2.3: Create Unit Test Example

Create `backend/src/pois/pois.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PoisService } from './pois.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PoisService', () => {
  let service: PoisService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    poi: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoisService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PoisService>(PoisService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPoiDetails', () => {
    it('should return POI details when POI exists', async () => {
      const mockPoi = {
        id: '123',
        name: 'Gateway of India',
        slug: 'gateway-of-india',
        description: 'Historic monument',
        address: 'Apollo Bunder',
        locality: 'Colaba',
        city: 'Mumbai',
        latitude: 18.9220,
        longitude: 72.8347,
        rating: 4.5,
        price_level: 1,
        ticket_price_inr: null,
        best_time_of_day: 'MORNING',
        indoor_outdoor: 'OUTDOOR',
        time_spent_min: 60,
        website_url: null,
        phone: null,
        image_url: null,
        opening_hours: [],
        category_links: [],
        tag_links: [],
      };

      mockPrismaService.poi.findUnique.mockResolvedValue(mockPoi);

      const result = await service.getPoiDetails('123');

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.name).toBe('Gateway of India');
      expect(mockPrismaService.poi.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          opening_hours: true,
          category_links: { include: { category: true } },
          tag_links: { include: { tag: true } },
        },
      });
    });

    it('should throw NotFoundException when POI does not exist', async () => {
      mockPrismaService.poi.findUnique.mockResolvedValue(null);

      await expect(service.getPoiDetails('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should return search results for query', async () => {
      const mockPois = [
        {
          id: '1',
          name: 'Museum',
          latitude: 18.9220,
          longitude: 72.8347,
          rating: 4.5,
          price_level: 2,
          opening_hours: [],
        },
      ];

      mockPrismaService.poi.findMany.mockResolvedValue(mockPois);

      const result = await service.search({ q: 'museum', limit: 10 });

      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      expect(mockPrismaService.poi.findMany).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      mockPrismaService.poi.findMany.mockResolvedValue([]);

      await service.search({
        q: 'museum',
        min_rating: 4,
        max_price: 2,
        category: 'heritage',
        limit: 10,
      });

      expect(mockPrismaService.poi.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.any(Array),
          }),
        }),
      );
    });
  });
});
```

#### Step 2.4: Create Integration Test Example

Create `backend/test/integration/search.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Search API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/search (GET)', () => {
    it('should return search results', () => {
      return request(app.getHttpServer())
        .get('/api/search?q=museum')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should handle empty query', () => {
      return request(app.getHttpServer())
        .get('/api/search')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
        });
    });

    it('should respect limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/search?q=museum&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.results.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('CORS preflight', () => {
    it('should handle OPTIONS request', () => {
      return request(app.getHttpServer())
        .options('/api/search')
        .expect(204)
        .expect((res) => {
          expect(res.headers['access-control-allow-origin']).toBe(
            'http://localhost:5173',
          );
          expect(res.headers['access-control-allow-credentials']).toBe('true');
        });
    });
  });
});
```

#### Step 2.5: Create Integration Test Configuration

Create `backend/test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/../src/$1"
  }
}
```

#### Step 2.6: Add Test Scripts to backend/package.json

Add these scripts to the `scripts` section:

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

#### Step 2.7: Run Backend Tests

```bash
cd backend

# Run unit tests
pnpm test

# Run with coverage
pnpm run test:cov

# Run integration tests
pnpm run test:e2e

# Check coverage report
open coverage/lcov-report/index.html
```

**TODO for You:**
- [ ] Create unit tests for all services (pois, itineraries, integrations, feedback)
- [ ] Create integration tests for all API endpoints
- [ ] Mock Prisma client properly for unit tests
- [ ] Achieve ≥80% code coverage
- [ ] Fix any failing tests

---

### PHASE 3: Implement Frontend Tests (3-4 hours)

#### Step 3.1: Install Test Dependencies

```bash
cd frontend
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw @vitest/ui @axe-core/react happy-dom
```

#### Step 3.2: Update vite.config.ts

Add test configuration to `frontend/vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.ts',
        '**/*.test.tsx',
        'src/main.tsx',
      ],
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

#### Step 3.3: Create Test Setup File

Create `frontend/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
```

#### Step 3.4: Create Component Test Example

Create `frontend/src/pages/Landing.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Router } from 'wouter';
import Landing from './Landing';

describe('Landing Page', () => {
  const mockOnLogin = vi.fn();

  it('should render hero section', () => {
    render(
      <Router>
        <Landing isAuthenticated={false} onLogin={mockOnLogin} />
      </Router>
    );

    expect(
      screen.getByText(/Explore Mumbai's Hidden Gems with AI/i)
    ).toBeInTheDocument();
  });

  it('should show Get Started button when not authenticated', () => {
    render(
      <Router>
        <Landing isAuthenticated={false} onLogin={mockOnLogin} />
      </Router>
    );

    const getStartedButton = screen.getByTestId('button-hero-getstarted');
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveTextContent('Get Started Free');
  });

  it('should show Explore button when authenticated', () => {
    render(
      <Router>
        <Landing isAuthenticated={true} onLogin={mockOnLogin} />
      </Router>
    );

    const exploreButton = screen.getByTestId('button-hero-explore');
    expect(exploreButton).toBeInTheDocument();
    expect(exploreButton).toHaveTextContent('Go to Explore');
  });

  it('should render feature cards', () => {
    render(
      <Router>
        <Landing isAuthenticated={false} onLogin={mockOnLogin} />
      </Router>
    );

    expect(screen.getByText('Discover Trails')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Itineraries')).toBeInTheDocument();
    expect(screen.getByText('Local Insights')).toBeInTheDocument();
  });

  it('should render featured trails', () => {
    render(
      <Router>
        <Landing isAuthenticated={false} onLogin={mockOnLogin} />
      </Router>
    );

    expect(screen.getByText('Heritage Architecture Tour')).toBeInTheDocument();
    expect(screen.getByText('Street Food Paradise')).toBeInTheDocument();
    expect(screen.getByText('Coastal Charm Walk')).toBeInTheDocument();
  });
});
```

#### Step 3.5: Create MSW Mock Handlers (Optional)

Create `frontend/src/test/mocks/handlers.ts`:

```typescript
import { rest } from 'msw';

const API_BASE = 'http://localhost:4000/api';

export const handlers = [
  rest.get(`${API_BASE}/search`, (req, res, ctx) => {
    const q = req.url.searchParams.get('q');
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: '1',
            name: `${q} Result 1`,
            lat: 18.9220,
            lon: 72.8347,
            rating: 4.5,
            price_level: 2,
          },
        ],
      })
    );
  }),

  rest.get(`${API_BASE}/pois/:id`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.id,
        name: 'Gateway of India',
        description: 'Historic monument',
        latitude: 18.9220,
        longitude: 72.8347,
      })
    );
  }),
];
```

#### Step 3.6: Add Test Scripts to frontend/package.json

Add these scripts to the `scripts` section:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

#### Step 3.7: Run Frontend Tests

```bash
cd frontend

# Run tests once
pnpm test

# Run in watch mode
pnpm run test:watch

# Run with coverage
pnpm run test:coverage

# Open UI
pnpm run test:ui

# Check coverage report
open coverage/index.html
```

**TODO for You:**
- [ ] Create tests for all major components (Navbar, PoiCard, SearchResultCard)
- [ ] Create tests for all pages (Explore, Profile, ItineraryGenerator)
- [ ] Add accessibility tests with @axe-core/react
- [ ] Mock API calls with MSW
- [ ] Achieve ≥70% code coverage

---

### PHASE 4: Implement E2E Tests (3-4 hours)

#### Step 4.1: Set Up Playwright

```bash
cd tests/e2e

# Initialize if needed
npm init -y

# Install Playwright
npm install -D @playwright/test @axe-core/playwright

# Install browsers
npx playwright install
```

#### Step 4.2: Create Playwright Configuration

Create `tests/e2e/playwright.config.ts`:

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
    ['list'],
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
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'cd ../.. && bash scripts/dev-start.sh',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Step 4.3: Create E2E Test Examples

Create `tests/e2e/tests/landing.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MumbAI Trails/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    const hero = page.getByTestId('text-hero-title');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText("Explore Mumbai's Hidden Gems with AI");
  });

  test('should navigate to explore page when clicking explore button', async ({ page }) => {
    await page.goto('/');
    
    const exploreButton = page.getByTestId('button-hero-explore-guest');
    await exploreButton.click();
    
    await expect(page).toHaveURL('/explore');
  });

  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should render feature cards', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Discover Trails')).toBeVisible();
    await expect(page.getByText('AI-Powered Itineraries')).toBeVisible();
    await expect(page.getByText('Local Insights')).toBeVisible();
  });
});
```

Create `tests/e2e/tests/explore.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Explore Page', () => {
  test('should load explore page', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL('/explore');
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/explore');
    
    // Look for search input (adjust selector as needed)
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should display POI cards when searching', async ({ page }) => {
    await page.goto('/explore');
    
    // Type search query
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('museum');
    await searchInput.press('Enter');
    
    // Wait for results (adjust based on your implementation)
    await page.waitForTimeout(1000);
    
    // Check if results appear (adjust selector)
    const results = page.locator('[data-testid="search-result-item"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });
});
```

#### Step 4.4: Add Test Scripts to tests/e2e/package.json

Update the `scripts` section:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:chrome": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:webkit": "playwright test --project=webkit",
    "report": "playwright show-report ../../artifacts/e2e/playwright-report"
  }
}
```

#### Step 4.5: Run E2E Tests

```bash
cd tests/e2e

# Run all tests (all browsers)
npm test

# Run with UI
npm run test:ui

# Run headed (see browser)
npm run test:headed

# Run specific browser
npm run test:chrome

# View report
npm run report
```

**TODO for You:**
- [ ] Create tests for all major user flows
- [ ] Test POI details page
- [ ] Test itinerary creation
- [ ] Test recommendation feature
- [ ] Add negative test cases (errors, validation)
- [ ] Ensure all tests pass on all 3 browsers

---

### PHASE 5: Add Non-Functional Tests (2-3 hours)

#### Step 5.1: Performance Testing

```bash
# Install autocannon globally
npm install -g autocannon

# Create performance test script
cat > scripts/perf-test.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

ARTIFACTS_DIR="artifacts/perf"
mkdir -p "$ARTIFACTS_DIR"

echo "Running performance tests..."

# Test 1: Search endpoint
echo "Test 1: Search endpoint (10 concurrent, 30s)"
autocannon -c 10 -d 30 http://localhost:4000/api/search?q=museum \
  -j > "$ARTIFACTS_DIR/search-10c.json"

# Test 2: POI list endpoint  
echo "Test 2: POI list (10 concurrent, 30s)"
autocannon -c 10 -d 30 http://localhost:4000/api/pois \
  -j > "$ARTIFACTS_DIR/pois-10c.json"

# Test 3: Higher concurrency
echo "Test 3: Search endpoint (50 concurrent, 30s)"
autocannon -c 50 -d 30 http://localhost:4000/api/search?q=museum \
  -j > "$ARTIFACTS_DIR/search-50c.json"

echo "Performance tests complete. Results in $ARTIFACTS_DIR"
EOF

chmod +x scripts/perf-test.sh

# Run performance tests (ensure services are running)
pnpm run dev:start
bash scripts/perf-test.sh
pnpm run dev:stop
```

#### Step 5.2: Security Testing

```bash
# Run backend linter
cd backend
pnpm run lint

# Install semgrep (optional but recommended)
brew install semgrep

# Run security scan
mkdir -p artifacts/security
semgrep --config=auto backend/src --json > artifacts/security/semgrep.json

# Install gitleaks (optional)
brew install gitleaks

# Scan for secrets
gitleaks detect --source . --report-path artifacts/security/gitleaks.json
```

#### Step 5.3: Accessibility Testing

Already covered in E2E tests with @axe-core/playwright. Review E2E test results for accessibility violations.

---

## 🎯 VERIFICATION CHECKLIST

After completing all phases, verify everything works:

### Database Setup
- [ ] PostgreSQL/SQLite configured
- [ ] Migrations run successfully
- [ ] Database has seed data

### Services
- [ ] `pnpm run dev:start` starts all services without errors
- [ ] Backend accessible at http://localhost:4000/docs
- [ ] Frontend accessible at http://localhost:5173
- [ ] AI stub accessible at http://localhost:8001/health
- [ ] `pnpm run dev:stop` cleanly stops all services

### API Tests
- [ ] `pnpm run test:api-probes` passes all probes
- [ ] Search endpoint returns results
- [ ] POI endpoint returns data
- [ ] AI stub responds correctly

### Backend Tests
- [ ] `cd backend && pnpm test` passes
- [ ] `cd backend && pnpm run test:cov` shows ≥80% coverage
- [ ] `cd backend && pnpm run test:e2e` passes
- [ ] Coverage report generated

### Frontend Tests
- [ ] `cd frontend && pnpm test` passes
- [ ] `cd frontend && pnpm run test:coverage` shows ≥70% coverage
- [ ] All components have tests
- [ ] Coverage report generated

### E2E Tests
- [ ] `cd tests/e2e && npm test` passes on all browsers
- [ ] Chromium tests pass
- [ ] Firefox tests pass
- [ ] WebKit tests pass
- [ ] No accessibility violations
- [ ] Playwright report generated

### Non-Functional Tests
- [ ] Performance tests run successfully
- [ ] No security issues found (or documented)
- [ ] Accessibility scans complete

### Reports
- [ ] `pnpm run test:run-all` generates reports
- [ ] `result1.html` opens and shows detailed results
- [ ] `test-results-latest.md` contains comprehensive info
- [ ] All artifacts saved to correct locations

---

## 📊 EXPECTED RESULTS

After completing all tasks, you should have:

### Code Coverage
- Backend: ≥80% (statements, branches, functions, lines)
- Frontend: ≥70% (statements, branches, functions, lines)

### Test Counts (Approximate)
- Backend unit tests: 30-50 tests
- Backend integration tests: 15-25 tests
- Frontend component tests: 20-40 tests
- E2E tests: 15-25 scenarios

### Performance Targets
- Search API p95 < 200ms at 10 concurrent requests
- POI detail API p95 < 150ms at 10 concurrent requests

### Accessibility
- 0 critical violations
- 0 serious violations
- Minor violations documented and tracked

---

## 🆘 TROUBLESHOOTING

### Problem: Backend won't start
**Solution:** Check database connection, run migrations, verify .env file

### Problem: Tests fail with "module not found"
**Solution:** Run `pnpm install` in the relevant directory

### Problem: E2E tests timeout
**Solution:** Increase timeout in playwright.config.ts, ensure services start

### Problem: Coverage below threshold
**Solution:** Add more test cases, focus on untested files shown in report

### Problem: CORS errors in E2E tests
**Solution:** Verify backend CORS allows localhost:5173, check .env files

---

## 📚 ADDITIONAL RESOURCES

- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Vitest Documentation:** https://vitest.dev/guide/
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro
- **Playwright Documentation:** https://playwright.dev/docs/intro
- **NestJS Testing:** https://docs.nestjs.com/fundamentals/testing

---

## ✅ FINAL NOTES

**Time Estimates:**
- Phase 1 (Critical Fixes): 30 minutes
- Phase 2 (Backend Tests): 4-6 hours
- Phase 3 (Frontend Tests): 3-4 hours
- Phase 4 (E2E Tests): 3-4 hours
- Phase 5 (Non-Functional): 2-3 hours
- **Total: 13-18 hours**

**Priority Order:**
1. Fix database (CRITICAL - blocks everything)
2. Verify services start (CRITICAL)
3. Backend tests (HIGH - core functionality)
4. Frontend tests (HIGH - user experience)
5. E2E tests (MEDIUM - integration)
6. Non-functional tests (LOW - nice to have)

**Support Files:**
- Full examples in TESTING_GUIDE.md
- Templates in test directories
- Run `pnpm run test:run-all` to see current status

**Questions?**
- Check existing test files for patterns
- Review TESTING_GUIDE.md for detailed examples
- Test configurations already created (jest.config.js, playwright.config.ts)

---

**Last Updated:** 2025-11-11  
**Status:** Ready for manual implementation  
**Next Action:** Start with Phase 1 - Fix Database Issue
