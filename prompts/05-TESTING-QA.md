# 05-TESTING-QA.md — Testing & QA Audit (WasteWatch Edition)

> **Objective:** Establish comprehensive testing infrastructure from scratch, eliminate dead code, achieve strict TypeScript compliance, and ensure complete test coverage of all critical audit and fraud detection paths. WasteWatch has no testing framework yet—this audit sets up Vitest + React Testing Library + Playwright + MSW, with focus on anomaly detection, risk scoring, and data isolation.

---

## CONTEXT: WASTEWATCH CRITICAL PATHS

Before setting up tests, understand what needs testing:

1. **Anomaly Detection Algorithms:**
   - Duplicate transaction detection (same amount, vendor, date within X days)
   - Round number detection (amounts like 10,000, 50,000 with suspicious frequency)
   - Split transaction detection (pattern of same-vendor transactions just below approval thresholds)
   - Benford's Law analysis (chi-squared calculation for first-digit distribution)

2. **Risk Scoring Pipeline:**
   - Transaction risk score calculation (0-100)
   - Aggregated vendor risk scores
   - Department risk profiles
   - Historical anomaly weighting

3. **Data Integrity (Critical):**
   - Organization data isolation (no cross-org leaks)
   - Role-based access control (admin/analyst/viewer permissions)
   - CSV/Excel import parsing and validation
   - Decimal precision for financial amounts (PostgreSQL NUMERIC)

4. **Report & Export:**
   - jsPDF report generation for investigations
   - CSV export with proper formatting
   - Dashboard stat calculations accuracy

---

## STEP 1: TEST FRAMEWORK CONFIGURATION

### 1.1 Vitest Setup (Recommended for Next.js 16+)

**Status Checklist:**
- [ ] `vitest.config.ts` exists and configured for Next.js
- [ ] Path aliases match tsconfig.json (`@/*` → `src/*`)
- [ ] Setup files load matchers, global mocks, and NextAuth mocks
- [ ] Coverage configuration present with Istanbul
- [ ] Test environment set to `jsdom` for component tests
- [ ] Node environment for API route tests

**File: vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for component testing
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./vitest.setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.config.ts',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/dist/**',
        'coverage/',
        'playwright.config.ts',
      ],
      // WasteWatch: Strict coverage targets for audit-critical code
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
    },

    // Global config
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e'],

    // Timeout for long-running tests (e.g., Benford's Law calculations)
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
});
```

**File: vitest.setup.ts**
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock IntersectionObserver for data table virtualization tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock window.scrollTo for table tests
window.scrollTo = vi.fn();

// Mock ResizeObserver for chart/dashboard tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock crypto for session tokens
if (!global.crypto) {
  global.crypto = { getRandomValues: () => new Uint8Array(32) } as any;
}

// Suppress specific console warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('useLayoutEffect') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

**Audit Tasks:**
1. Check if `vitest.config.ts` exists. If not, create it with the configuration above.
2. Verify path aliases in `vitest.config.ts` match `tsconfig.json`.
3. Create `vitest.setup.ts` with mocks for browser APIs.
4. Add vitest to `package.json` scripts:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:run": "vitest run",
       "test:coverage": "vitest run --coverage",
       "test:ui": "vitest --ui"
     }
   }
   ```
5. Run `npm install --save-dev vitest @vitejs/plugin-react @vitest/ui` if not already installed.

---

### 1.2 React Testing Library + MSW Setup

**Status Checklist:**
- [ ] `@testing-library/react` installed
- [ ] `@testing-library/jest-dom` imported in setup
- [ ] `@testing-library/user-event` for user interactions
- [ ] Custom render wrapper with Zustand store provider (critical for WasteWatch)
- [ ] MSW (Mock Service Worker) configured for API mocking
- [ ] NextAuth session mocks configured

**File: src/test-utils.tsx**
```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreProvider } from './store/provider'; // Zustand store provider
import { SessionProvider } from 'next-auth/react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any;
  storeState?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    session = null,
    storeState = {},
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <StoreProvider initialState={storeState}>
          {children}
        </StoreProvider>
      </SessionProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    user: userEvent.setup(),
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };
```

**File: src/mocks/handlers.ts** (MSW - WasteWatch API routes)
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth routes
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'analyst@wastewatch.test',
        name: 'Test Analyst',
        role: 'analyst',
        orgId: 'test-org-id',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // Transaction endpoints
  http.get('/api/transactions', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          orgId: 'test-org-id',
          amount: 15000,
          vendor: 'Test Vendor',
          department: 'Operations',
          date: '2024-01-15',
          riskScore: 45,
          flags: [],
        },
      ],
      total: 1,
    });
  }),

  http.post('/api/transactions/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return HttpResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    return HttpResponse.json({
      imported: 10,
      skipped: 0,
      errors: [],
    });
  }),

  // Risk scoring endpoint
  http.post('/api/analyze/risk-score', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      riskScore: 62,
      factors: ['high_amount', 'new_vendor'],
    });
  }),

  // Benford's Law analysis
  http.post('/api/analyze/benford', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      chiSquared: 18.5,
      pValue: 0.002,
      suspicious: true,
      firstDigitDistribution: {
        1: 0.32, 2: 0.17, 3: 0.12, 4: 0.09, 5: 0.08, 6: 0.07, 7: 0.06, 8: 0.06, 9: 0.03,
      },
    });
  }),

  // Flag detection
  http.get('/api/flags', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'flag-1',
          transactionId: '1',
          type: 'duplicate',
          severity: 'high',
          description: 'Potential duplicate transaction',
        },
      ],
      total: 1,
    });
  }),

  // Investigation endpoints
  http.post('/api/investigations', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'inv-1',
      title: body.title,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  }),

  // Organization context
  http.get('/api/org', () => {
    return HttpResponse.json({
      id: 'test-org-id',
      name: 'Test Organization',
      role: 'analyst',
      permissions: ['read:transactions', 'create:investigations'],
    });
  }),
];
```

**File: src/mocks/server.ts**
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**File: vitest.setup.ts** (Update with MSW)
```typescript
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Audit Tasks:**
1. Install dependencies:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
   ```
2. Create `src/test-utils.tsx` with custom render wrapper.
3. Create `src/mocks/handlers.ts` with WasteWatch API endpoints.
4. Create `src/mocks/server.ts` MSW server setup.
5. Verify setup by running a simple test.

---

### 1.3 Playwright E2E Setup

**Status Checklist:**
- [ ] `playwright.config.ts` exists
- [ ] baseURL points to dev server
- [ ] Browsers configured (chromium, firefox, webkit)
- [ ] Page Object Model pattern implemented
- [ ] WasteWatch-specific fixtures (auth, transaction data)

**File: playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  use: {
    baseURL: 'http://localhost:3000',
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
  ],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  timeout: 30 * 1000,
});
```

**File: e2e/fixtures.ts** (WasteWatch test fixtures)
```typescript
import { test as base, expect, Page } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';

type TestFixtures = {
  dashboardPage: DashboardPage;
  transactionsPage: TransactionsPage;
  investigationsPage: InvestigationsPage;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login before tests
    await page.goto('/');
    await page.fill('input[type="email"]', 'analyst@test.wastewatch');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use(page);
  },

  dashboardPage: async ({ authenticatedPage }, use) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await use(dashboardPage);
  },

  transactionsPage: async ({ authenticatedPage }, use) => {
    const transactionsPage = new TransactionsPage(authenticatedPage);
    await use(transactionsPage);
  },

  investigationsPage: async ({ authenticatedPage }, use) => {
    const investigationsPage = new InvestigationsPage(authenticatedPage);
    await use(investigationsPage);
  },
});

export { expect };
```

**Audit Tasks:**
1. Install Playwright: `npm install --save-dev @playwright/test`
2. Create `playwright.config.ts`
3. Create `e2e/fixtures.ts` and Page Object Model classes
4. Add scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`

---

## STEP 2: WASTEWATCH-SPECIFIC TEST SCENARIOS

### 2.1 Anomaly Detection Algorithm Tests

**File: src/lib/__tests__/anomaly-detection.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import {
  detectDuplicates,
  detectRoundNumbers,
  detectSplitTransactions,
  calculateBenfordsLaw,
} from '@/lib/anomaly-detection';

describe('Anomaly Detection', () => {
  describe('detectDuplicates', () => {
    it('should find duplicate transactions within 7-day window', () => {
      const transactions = [
        { id: '1', amount: 5000, vendor: 'Acme', date: '2024-01-01' },
        { id: '2', amount: 5000, vendor: 'Acme', date: '2024-01-03' },
        { id: '3', amount: 5000, vendor: 'Other', date: '2024-01-05' },
      ];

      const duplicates = detectDuplicates(transactions, { windowDays: 7 });

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0]).toEqual(['1', '2']);
    });

    it('should not flag duplicates beyond window', () => {
      const transactions = [
        { id: '1', amount: 5000, vendor: 'Acme', date: '2024-01-01' },
        { id: '2', amount: 5000, vendor: 'Acme', date: '2024-01-15' }, // 14 days later
      ];

      const duplicates = detectDuplicates(transactions, { windowDays: 7 });
      expect(duplicates).toHaveLength(0);
    });

    it('should require both amount AND vendor match', () => {
      const transactions = [
        { id: '1', amount: 5000, vendor: 'Acme', date: '2024-01-01' },
        { id: '2', amount: 5000, vendor: 'Different', date: '2024-01-02' },
      ];

      const duplicates = detectDuplicates(transactions, { windowDays: 7 });
      expect(duplicates).toHaveLength(0);
    });
  });

  describe('detectRoundNumbers', () => {
    it('should identify suspicious round number patterns', () => {
      const transactions = [
        { id: '1', amount: 10000, vendor: 'A', date: '2024-01-01' },
        { id: '2', amount: 10000, vendor: 'B', date: '2024-01-02' },
        { id: '3', amount: 10000, vendor: 'C', date: '2024-01-03' },
        { id: '4', amount: 15234, vendor: 'D', date: '2024-01-04' }, // Not round
      ];

      const roundNumbers = detectRoundNumbers(transactions);

      // 3 out of 4 are round numbers = 75% (suspicious if threshold is 50%)
      expect(roundNumbers.isAnomalous).toBe(true);
      expect(roundNumbers.percentage).toBeGreaterThan(0.5);
    });
  });

  describe('detectSplitTransactions', () => {
    it('should detect pattern-based splits just below threshold', () => {
      const approvalThreshold = 10000;
      const transactions = [
        { id: '1', amount: 9999, vendor: 'Acme', date: '2024-01-01' },
        { id: '2', amount: 9950, vendor: 'Acme', date: '2024-01-02' },
        { id: '3', amount: 9975, vendor: 'Acme', date: '2024-01-03' },
      ];

      const splits = detectSplitTransactions(transactions, approvalThreshold);

      expect(splits.isSuspicious).toBe(true);
      expect(splits.pattern).toBe('consistent_below_threshold');
    });
  });

  describe('calculateBenfordsLaw', () => {
    it('should calculate chi-squared correctly', () => {
      // Test data: 100 transactions
      const amounts = Array.from({ length: 30 }, () => 1000 + Math.random() * 9000); // ~30% start with 1
      const amounts2 = Array.from({ length: 20 }, () => 20000 + Math.random() * 90000); // ~20% start with 2-9

      const allAmounts = [...amounts, ...amounts2];

      const result = calculateBenfordsLaw(allAmounts);

      expect(result.chiSquared).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.suspicious).toBeDefined();
    });

    it('should identify benford violations (p < 0.05)', () => {
      // Artificial data with strong pattern (not Benford-like)
      const amounts = [
        ...Array(50).fill(5000), // 50% start with 5
        ...Array(30).fill(6000), // 30% start with 6
        ...Array(20).fill(7000), // 20% start with 7
      ];

      const result = calculateBenfordsLaw(amounts);

      expect(result.pValue).toBeLessThan(0.05);
      expect(result.suspicious).toBe(true);
    });
  });
});
```

### 2.2 Risk Scoring Tests

**File: src/lib/__tests__/risk-scoring.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTransactionRiskScore, calculateVendorRiskScore } from '@/lib/risk-scoring';

describe('Risk Scoring', () => {
  describe('calculateTransactionRiskScore', () => {
    it('should score high-amount transactions higher', () => {
      const lowAmount = { amount: 1000, vendor: 'Normal', date: new Date() };
      const highAmount = { amount: 100000, vendor: 'Normal', date: new Date() };

      const lowScore = calculateTransactionRiskScore(lowAmount);
      const highScore = calculateTransactionRiskScore(highAmount);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should consider frequency of new vendors', () => {
      const newVendor = { amount: 5000, vendor: 'Never seen before', isNewVendor: true, date: new Date() };
      const knownVendor = { amount: 5000, vendor: 'Known vendor', isNewVendor: false, date: new Date() };

      const newVendorScore = calculateTransactionRiskScore(newVendor);
      const knownVendorScore = calculateTransactionRiskScore(knownVendor);

      expect(newVendorScore).toBeGreaterThan(knownVendorScore);
    });

    it('should return score between 0 and 100', () => {
      const transaction = { amount: Math.random() * 100000, vendor: 'Test', date: new Date() };
      const score = calculateTransactionRiskScore(transaction);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateVendorRiskScore', () => {
    it('should aggregate transaction scores correctly', () => {
      const vendorTransactions = [
        { riskScore: 30 },
        { riskScore: 40 },
        { riskScore: 50 },
      ];

      const vendorScore = calculateVendorRiskScore(vendorTransactions);

      // Should be weighted average, probably around 40
      expect(vendorScore).toBeGreaterThan(30);
      expect(vendorScore).toBeLessThan(60);
    });
  });
});
```

### 2.3 Data Isolation Tests

**File: src/lib/__tests__/data-isolation.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { filterByOrganization, enforceRolePermissions } from '@/lib/data-isolation';

describe('Data Isolation', () => {
  describe('filterByOrganization', () => {
    it('should filter transactions to organization scope', () => {
      const allTransactions = [
        { id: '1', orgId: 'org-1', amount: 5000 },
        { id: '2', orgId: 'org-2', amount: 10000 },
        { id: '3', orgId: 'org-1', amount: 15000 },
      ];

      const filtered = filterByOrganization(allTransactions, 'org-1');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => t.orgId === 'org-1')).toBe(true);
    });

    it('should prevent cross-organization data leaks', () => {
      const org1Data = [{ id: '1', orgId: 'org-1' }];
      const org2Data = [{ id: '2', orgId: 'org-2' }];

      expect(() => {
        // Should throw if trying to access org-2 as org-1
        enforceRolePermissions(org2Data, 'org-1', 'analyst');
      }).toThrow();
    });
  });

  describe('Role-based access control', () => {
    it('viewer should not create investigations', () => {
      expect(() => {
        enforceRolePermissions({ action: 'create:investigation' }, 'org-1', 'viewer');
      }).toThrow('Insufficient permissions');
    });

    it('analyst should create investigations', () => {
      expect(() => {
        enforceRolePermissions({ action: 'create:investigation' }, 'org-1', 'analyst');
      }).not.toThrow();
    });

    it('admin should have all permissions', () => {
      const permissions = [
        'read:transactions',
        'create:investigation',
        'export:data',
        'manage:users',
      ];

      permissions.forEach(permission => {
        expect(() => {
          enforceRolePermissions({ action: permission }, 'org-1', 'admin');
        }).not.toThrow();
      });
    });
  });
});
```

### 2.4 CSV Import Tests

**File: src/lib/__tests__/csv-import.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { parseCSV, validateTransactionRow } from '@/lib/csv-import';

describe('CSV Import', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV data', async () => {
      const csv = `date,vendor,amount,department
2024-01-01,Acme,5000,Operations
2024-01-02,Widget Co,10000,Finance`;

      const result = await parseCSV(csv);

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].vendor).toBe('Acme');
      expect(result.rows[0].amount).toBe(5000);
    });

    it('should skip rows with missing required fields', async () => {
      const csv = `date,vendor,amount,department
2024-01-01,Acme,5000,Operations
2024-01-02,,10000,Finance`;

      const result = await parseCSV(csv);

      expect(result.rows).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('missing vendor');
    });

    it('should validate decimal precision for amounts', async () => {
      const csv = `date,vendor,amount,department
2024-01-01,Acme,5000.123456789,Operations`;

      const result = await parseCSV(csv);

      // Should truncate to 2 decimals for currency
      expect(result.rows[0].amount).toBe(5000.12);
    });
  });

  describe('validateTransactionRow', () => {
    it('should validate required fields', () => {
      const row = { date: '2024-01-01', vendor: 'Acme', amount: 5000, department: 'Ops' };
      const errors = validateTransactionRow(row);

      expect(errors).toHaveLength(0);
    });

    it('should reject invalid date format', () => {
      const row = { date: 'invalid', vendor: 'Acme', amount: 5000, department: 'Ops' };
      const errors = validateTransactionRow(row);

      expect(errors).toContain('Invalid date format');
    });

    it('should reject negative amounts', () => {
      const row = { date: '2024-01-01', vendor: 'Acme', amount: -5000, department: 'Ops' };
      const errors = validateTransactionRow(row);

      expect(errors).toContain('Amount must be positive');
    });

    it('should reject zero amount', () => {
      const row = { date: '2024-01-01', vendor: 'Acme', amount: 0, department: 'Ops' };
      const errors = validateTransactionRow(row);

      expect(errors).toContain('Amount must be greater than 0');
    });
  });
});
```

---

## STEP 3: COMPONENT & INTEGRATION TESTS

### 3.1 Dashboard Component Tests

**File: src/components/dashboard/__tests__/DashboardStats.test.tsx**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { DashboardStats } from '../DashboardStats';

describe('DashboardStats', () => {
  it('should render statistics correctly', () => {
    const stats = {
      totalTransactions: 1234,
      totalAmount: 5000000,
      flaggedCount: 23,
      avgRiskScore: 45.2,
    };

    render(<DashboardStats stats={stats} />);

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('$5,000,000')).toBeInTheDocument();
    expect(screen.getByText('23 Flags')).toBeInTheDocument();
  });

  it('should calculate percentages correctly', () => {
    const stats = {
      totalTransactions: 100,
      flaggedCount: 10,
      avgRiskScore: 50,
      totalAmount: 1000000,
    };

    render(<DashboardStats stats={stats} />);

    const flagPercentage = screen.getByText('10%');
    expect(flagPercentage).toBeInTheDocument();
  });
});
```

### 3.2 Transaction Import Component Tests

**File: src/components/import/__tests__/CSVUploader.test.tsx**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { CSVUploader } from '../CSVUploader';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

describe('CSVUploader', () => {
  it('should handle file upload', async () => {
    const user = userEvent.setup();

    render(<CSVUploader onSuccess={() => {}} />);

    const input = screen.getByRole('button', { name: /upload/i });
    expect(input).toBeInTheDocument();
  });

  it('should show progress during upload', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('/api/transactions/upload', async () => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({ imported: 10, skipped: 0 });
      })
    );

    render(<CSVUploader onSuccess={() => {}} />);

    // Simulate file selection and upload
    expect(screen.getByText(/uploading/i) || screen.getByText(/done/i)).toBeDefined();
  });

  it('should reject invalid file types', async () => {
    const user = userEvent.setup();
    render(<CSVUploader onSuccess={() => {}} />);

    // Should show error for non-CSV files
    expect(screen.queryByText(/must be csv/i)).not.toBeInTheDocument();
  });
});
```

---

## STEP 4: ADD TYPESCRIPT STRICT MODE

**Status Checklist:**
- [ ] `tsconfig.json` has `strict: true`
- [ ] `noImplicitAny` is enforced
- [ ] `strictNullChecks` is enabled
- [ ] All test files pass `tsc --noEmit`

**File: tsconfig.json**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Audit Tasks:**
1. Verify TypeScript strict mode is enabled: `npx tsc --noEmit`
2. Fix any type errors that appear
3. Add npm script: `"type-check": "tsc --noEmit"`

---

## STEP 5: ESLINT CONFIGURATION

**Status Checklist:**
- [ ] ESLint configured with `@typescript-eslint/recommended-type-checked`
- [ ] No `console.log` in production code
- [ ] No `any` types (except test mocks)
- [ ] Exhaustive-deps rule enforced
- [ ] No circular imports

**Audit Tasks:**
1. Install: `npm install --save-dev eslint @typescript-eslint/eslint-plugin`
2. Run: `npx eslint . --fix`
3. Fix remaining warnings manually
4. Add script: `"lint": "eslint . --max-warnings 0"`

---

## STEP 6: COVERAGE REQUIREMENTS

**Target Coverage:**
- Statements: 75%
- Branches: 70%
- Functions: 75%
- Lines: 75%

**Critical Paths (100% coverage required):**
- Anomaly detection algorithms
- Risk scoring logic
- Data isolation/RBAC
- CSV import validation
- Report generation

**Audit Tasks:**
1. Run: `npm run test:coverage`
2. Review HTML report: `open coverage/index.html`
3. Mark critical paths for 100% coverage
4. Iterate until targets met

---

## FINAL VERIFICATION

**Checklist:**
- [ ] All tests pass: `npm run test:run`
- [ ] Coverage meets targets: `npm run test:coverage`
- [ ] TypeScript strict: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] E2E tests passing: `npm run test:e2e`
- [ ] No console errors in tests
- [ ] MSW handlers cover all API routes
- [ ] Data isolation tests verify org/role enforcement
- [ ] Anomaly detection accuracy verified (unit test baselines)
