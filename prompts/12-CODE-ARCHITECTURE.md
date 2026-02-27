# 12-CODE-ARCHITECTURE.md — Code Architecture Audit (WasteWatch)

> **Audit Phase 12 of 12: Code Architecture Audit for WasteWatch**
>
> WasteWatch is a government-grade fraud detection SaaS with statistical forensics engine. This audit validates folder structure, server/client component boundaries, Zustand store organization, TypeScript patterns, Prisma schema alignment, and adherence to SOLID principles.

---

## PROJECT CONTEXT

**Stack:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript strict mode
- Zustand 5.0.11 (client state)
- Prisma 7.4.1 (database ORM)
- PostgreSQL 16 (database)
- NextAuth 5.0.0-beta.30 (authentication)
- Tailwind CSS 4 + shadcn/ui
- Recharts 3.7.0, D3 7.9.0 (data visualization)
- No testing framework yet

**Key Features:**
- Multi-tenant (org-scoped)
- Role-based access control (admin, analyst, viewer)
- Red flag detection (statistical anomalies)
- Investigation workflow
- FCA complaint generation
- Audit logging

---

## STEP 1: FOLDER STRUCTURE AUDIT

### 1.1 Canonical WasteWatch Structure

```
wastewatch/
├── public/                        # Static assets
├── scripts/                       # Build & deploy scripts
│   ├── docker-entrypoint.sh
│   └── init-db.sql
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Prisma migrations
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Public pages
│   │   │   ├── page.tsx           # Landing
│   │   │   ├── trial/page.tsx     # Trial signup
│   │   │   ├── pricing/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/                # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── onboarding/            # Onboarding flow
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── data-upload/page.tsx
│   │   │   └── users/page.tsx
│   │   ├── (dashboard)/           # Protected app routes
│   │   │   ├── layout.tsx         # Sidebar + Header
│   │   │   ├── page.tsx           # Command Center
│   │   │   ├── departments/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── vendors/page.tsx
│   │   │   │       └── flags/page.tsx
│   │   │   ├── vendors/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── flags/page.tsx
│   │   │   │       └── analysis/page.tsx
│   │   │   ├── flags/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── investigate/page.tsx
│   │   │   ├── investigations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── edit/page.tsx
│   │   │   │       └── fca-complaint/page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── organization/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── billing/page.tsx
│   │   │   │   └── audit-log/page.tsx
│   │   │   └── error.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── flags/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── investigations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── departments/
│   │   │   ├── vendors/
│   │   │   ├── analysis/          # Analysis endpoints
│   │   │   │   ├── statistical/route.ts
│   │   │   │   └── patterns/route.ts
│   │   │   ├── reports/
│   │   │   ├── upload/
│   │   │   ├── billing/
│   │   │   │   └── webhook/route.ts
│   │   │   └── health/route.ts
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root redirect
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── components/                # Shared React components
│   │   ├── ui/                    # Unstyled UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── index.ts
│   │   ├── layout/                # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── stat-card.tsx
│   │   │   ├── spending-overview-chart.tsx
│   │   │   ├── spending-by-department-chart.tsx
│   │   │   ├── category-breakdown-chart.tsx
│   │   │   ├── top-vendors-table.tsx
│   │   │   ├── recent-flags.tsx
│   │   │   ├── command-center.tsx
│   │   │   └── index.ts
│   │   ├── flags/                 # Flag-related components
│   │   │   ├── flags-table.tsx
│   │   │   ├── flag-detail-view.tsx
│   │   │   ├── flag-severity-badge.tsx
│   │   │   └── index.ts
│   │   ├── investigations/        # Investigation components
│   │   │   ├── investigation-form.tsx
│   │   │   ├── investigation-timeline.tsx
│   │   │   ├── evidence-uploader.tsx
│   │   │   ├── fca-complaint-generator.tsx
│   │   │   └── index.ts
│   │   ├── vendors/               # Vendor components
│   │   │   ├── vendors-table.tsx
│   │   │   ├── vendor-detail-view.tsx
│   │   │   ├── vendor-profile.tsx
│   │   │   └── index.ts
│   │   ├── departments/           # Department components
│   │   │   ├── departments-table.tsx
│   │   │   ├── department-detail.tsx
│   │   │   └── index.ts
│   │   ├── reports/               # Report components
│   │   │   ├── report-builder.tsx
│   │   │   ├── report-preview.tsx
│   │   │   └── index.ts
│   │   └── shared/                # Shared utilities
│   │       ├── providers.tsx      # React providers
│   │       ├── icons/
│   │       └── index.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-org.ts             # Organization context
│   │   ├── use-session-user.ts    # Session + user data
│   │   ├── use-flags.ts           # Flag data + filtering
│   │   ├── use-vendors.ts         # Vendor data
│   │   ├── use-departments.ts     # Department data
│   │   ├── use-investigations.ts  # Investigation data
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-pagination.ts      # Table pagination
│   │   └── index.ts
│   ├── lib/                       # Utility & helper functions
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── auth.ts                # Auth utilities
│   │   ├── api-client.ts          # HTTP client wrapper
│   │   ├── constants.ts           # App-wide constants
│   │   ├── validations.ts         # Zod schemas
│   │   ├── utils.ts               # General utilities (cn, formatters)
│   │   ├── cn.ts                  # classNames utility
│   │   ├── date.ts                # Date formatting
│   │   ├── errors.ts              # Custom error classes
│   │   ├── analysis/              # Statistical analysis functions
│   │   │   ├── index.ts
│   │   │   ├── fraud-detection.ts # Core fraud detection logic
│   │   │   ├── statistical.ts     # Statistical calculations
│   │   │   ├── anomaly-detection.ts # Outlier detection
│   │   │   └── pattern-matching.ts  # Pattern recognition
│   │   ├── math.ts                # Math utilities for analysis
│   │   └── index.ts
│   ├── services/                  # External service integrations
│   │   ├── whop.ts                # Whop payment API
│   │   ├── export.ts              # PDF/XLSX export (jsPDF, XLSX)
│   │   ├── csv.ts                 # CSV import (PapaParse)
│   │   └── index.ts
│   ├── stores/                    # Zustand state stores
│   │   ├── auth-store.ts          # Auth session + user info
│   │   ├── ui-store.ts            # UI state (sidebar, modals, filters)
│   │   ├── flag-store.ts          # Flags state
│   │   ├── investigation-store.ts # Investigation state
│   │   └── index.ts
│   ├── types/                     # TypeScript type definitions
│   │   ├── index.ts               # Barrel export
│   │   ├── api.ts                 # API request/response types
│   │   ├── auth.ts                # Auth types
│   │   ├── common.ts              # Shared types
│   │   ├── flags.ts               # Flag types
│   │   ├── investigations.ts       # Investigation types
│   │   ├── vendors.ts             # Vendor types
│   │   ├── departments.ts         # Department types
│   │   └── analysis.ts            # Analysis engine types
│   ├── config/                    # Configuration
│   │   ├── site.ts                # Site metadata, nav structure
│   │   ├── api.ts                 # API endpoints, base URL
│   │   └── constants.ts           # Environment-specific constants
│   ├── middleware.ts              # Next.js middleware (auth checks)
│   ├── env.ts                     # Environment variables + validation
│   └── instrumentation.ts         # Optional: monitoring/observability
├── tests/                         # Tests (setup for future)
│   ├── integration/
│   └── e2e/
├── .env.local                     # Local env (gitignored)
├── .env.example                   # Env template
├── .gitignore
├── .eslintrc.json
├── tsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
├── README.md
└── DEPLOYMENT.md
```

**Audit Checklist:**

- [ ] All source files in `src/` directory
- [ ] Route groups use correct parentheses: `(marketing)`, `(auth)`, `(dashboard)`
- [ ] API routes organized by domain: `/api/flags`, `/api/investigations`, etc.
- [ ] Components organized by feature/page: `components/dashboard/`, `components/flags/`, etc.
- [ ] Analysis engine isolated in `lib/analysis/` with clear responsibilities
- [ ] Stores centralized in `stores/` directory
- [ ] Types organized in `types/` with barrel exports
- [ ] No circular imports (`lib/db.ts` not imported by `types/`)
- [ ] No deeply nested folders (max 4 levels)
- [ ] Naming conventions consistent (PascalCase components, camelCase functions)
- [ ] No `.index.ts` files in app/ directory (breaks routing)

---

### 1.2 Folder Depth Analysis

**Find files > 4 levels deep:**

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read f; do
  depth=$(echo "$f" | tr -cd '/' | wc -c)
  if [ $depth -gt 4 ]; then
    echo "$f — depth: $depth"
  fi
done
```

**Acceptable deep nesting:**

- `src/app/(dashboard)/departments/[id]/page.tsx` — Route segment (necessary)
- `src/components/investigations/fca-complaint-generator.tsx` — Feature component (acceptable)
- `src/lib/analysis/fraud-detection.ts` — Analysis module (acceptable)

**Problematic deep nesting:**

- `src/components/dashboard/flags/flagDetail/flagTimeline/timelineItem.tsx` — Too deep, extract to `components/investigation/timeline-item.tsx`

---

## STEP 2: SERVER/CLIENT COMPONENT ARCHITECTURE

### 2.1 Component Boundary Audit

WasteWatch dashboard uses Next.js server components (default) with client components only for interactive UI.

**Audit Process:**

```bash
# Find all 'use client' declarations
grep -r "'use client'" src/app src/components --include="*.ts" --include="*.tsx"
```

**Expected distribution:**

- **Server Components (pages, layouts):** ~80% of app/
- **Client Components (interactive):** ~20% (forms, filters, modals, charts)

**Client Component Checklist:**

For each `'use client'` file, verify it needs interactivity:

```typescript
// ❌ WRONG: Entire page is client
'use client';
export default async function DashboardPage() {  // WRONG: can't use async with 'use client'
  const data = await fetchDashboard();
  return <Dashboard data={data} />;
}

// ✅ CORRECT: Server page fetches, client component renders UI
export default async function DashboardPage() {
  const data = await fetchDashboard();
  return <DashboardClient data={data} />;  // Pass to client component
}

'use client';
export function DashboardClient({ data }) {
  const [activeTab, setActiveTab] = useState('overview');
  return <Dashboard data={data} activeTab={activeTab} />;
}
```

**Analysis Audit:**

The analysis engine (statistical forensics) should be server-side or API-only:

```typescript
// ✅ CORRECT: Analysis in API route
// app/api/analysis/statistical/route.ts
export async function POST(request: Request) {
  const { transactions } = await request.json();
  const results = performStatisticalAnalysis(transactions);
  return Response.json(results);
}

// ❌ WRONG: Analysis in client component
'use client';
export function AnalysisComponent() {
  const results = performStatisticalAnalysis(data);  // DON'T do heavy compute in client
}
```

**Audit Checklist:**

- [ ] Pages are server components (no `'use client'`)
- [ ] Layouts are server components (except interactive features)
- [ ] Client components only use hooks, events, browser APIs
- [ ] Data fetching happens in server components or API routes
- [ ] Client components receive data as props (serializable)
- [ ] Analysis engine calls happen via API routes or server actions
- [ ] Charts (Recharts, D3) are client components (interactivity)
- [ ] Forms are client components (useState, onChange)
- [ ] Tables are mostly server (with client filtering/sorting if needed)

---

### 2.2 Data Flow & Serialization

Ensure all props passed to client components are serializable.

```typescript
// ✅ CORRECT: Serializable data
export async function DepartmentPage({ params }) {
  const department = await db.department.findUnique({
    where: { id: params.id },
    include: { vendors: true, flags: true },
  });

  return <DepartmentClient department={department} />;  // All JSON-serializable
}

// ❌ WRONG: Non-serializable data
const date = new Date();  // NOT serializable
const fn = () => {};      // NOT serializable
const symbol = Symbol();  // NOT serializable

// ✅ CORRECT: Convert dates to strings
const department = {
  ...data,
  createdAt: data.createdAt.toISOString(),  // Convert to string
};
```

---

## STEP 3: ZUSTAND STORE ORGANIZATION

### 3.1 Current Monolithic Store Issue

If WasteWatch currently has one large Zustand store, it should be split by domain:

**Before (Monolithic - Anti-pattern):**

```typescript
// src/stores/app-store.ts — TOO LARGE
export const useAppStore = create((set) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  role: 'viewer',

  // UI state
  sidebarOpen: true,
  modalOpen: false,
  activeTab: 'overview',

  // Flags state
  flags: [],
  flagFilters: {},
  selectedFlag: null,

  // Investigations state
  investigations: [],
  investigationFilters: {},

  // Vendors state
  vendors: [],
  vendorFilters: {},

  // LOTS of actions...
  setUser: (user) => set({ user }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setFlags: (flags) => set({ flags }),
  // ... 50+ more setters
}));
```

**After (Domain-Split - Best Practice):**

```typescript
// src/stores/auth-store.ts
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: 'viewer' as Role,
  organizationId: null,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// src/stores/ui-store.ts
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  modalsOpen: {} as Record<string, boolean>,
  activeTab: 'overview',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modalName) => set(state => ({
    modalsOpen: { ...state.modalsOpen, [modalName]: true }
  })),
  closeModal: (modalName) => set(state => ({
    modalsOpen: { ...state.modalsOpen, [modalName]: false }
  })),
}));

// src/stores/flag-store.ts
export const useFlagStore = create((set) => ({
  flags: [] as Flag[],
  selectedFlag: null as Flag | null,
  filters: {
    severity: null as Severity | null,
    status: null as string | null,
  },

  setFlags: (flags) => set({ flags }),
  setSelectedFlag: (flag) => set({ selectedFlag: flag }),
  setFilters: (filters) => set(state => ({
    filters: { ...state.filters, ...filters }
  })),
}));

// src/stores/investigation-store.ts
export const useInvestigationStore = create((set) => ({
  investigations: [] as Investigation[],
  selectedInvestigation: null as Investigation | null,
  filters: {},

  setInvestigations: (investigations) => set({ investigations }),
  setSelectedInvestigation: (investigation) => set({ selectedInvestigation: investigation }),
}));

// src/stores/index.ts (Barrel export)
export { useAuthStore } from './auth-store';
export { useUIStore } from './ui-store';
export { useFlagStore } from './flag-store';
export { useInvestigationStore } from './investigation-store';
```

**Audit Checklist:**

- [ ] Stores are split by domain (auth, ui, flags, investigations, vendors)
- [ ] Each store has focused responsibility (< 50 lines ideally)
- [ ] No circular dependencies between stores
- [ ] UI state (modals, sidebar) separate from data state (flags, vendors)
- [ ] Auth store is read-only (no mutations, use API for auth changes)
- [ ] Stores use immer middleware for immutability
- [ ] DevTools enabled for debugging: `create(devtools(...))`

---

### 3.2 Store Usage Audit

**Find monolithic store usage:**

```bash
grep -r "useAppStore\|useStore" src --include="*.ts" --include="*.tsx" | wc -l
```

**Replace monolithic with domain stores:**

```typescript
// ❌ OLD
const { user, flags, sidebarOpen, setUser, setFlags, setSidebarOpen } = useAppStore();

// ✅ NEW
const { user, role } = useAuthStore();
const { flags } = useFlagStore();
const { sidebarOpen } = useUIStore();
```

---

## STEP 4: ANALYSIS ENGINE ORGANIZATION

### 4.1 Fraud Detection Engine Structure

WasteWatch's core value is statistical fraud detection. The analysis engine should be:
- Testable (pure functions)
- Isolated from React/UI
- Server-side (not client-side)
- Well-documented

**Structure:**

```typescript
// src/lib/analysis/index.ts — Public API
export { performStatisticalAnalysis } from './statistical';
export { detectAnomalies } from './anomaly-detection';
export { findPatterns } from './pattern-matching';
export type { AnalysisResult, AnomalyFlag, Pattern } from '../types/analysis';

// src/lib/analysis/statistical.ts
import { calculateMean, calculateStdDev, calculateZScore } from './math-utils';
import type { Transaction, StatisticalResult } from '@/types/analysis';

/**
 * Performs statistical analysis on transactions to detect anomalies.
 *
 * @param transactions - Array of transactions to analyze
 * @param threshold - Z-score threshold (default: 2.5, meaning 2.5 standard deviations)
 * @returns Statistical analysis results with flagged outliers
 */
export function performStatisticalAnalysis(
  transactions: Transaction[],
  threshold: number = 2.5
): StatisticalResult {
  // Group transactions by vendor
  const byVendor = groupBy(transactions, 'vendorId');

  const results = {
    anomalies: [] as AnomalyFlag[],
    statistics: {} as Record<string, VendorStats>,
  };

  for (const [vendorId, vendorTxns] of Object.entries(byVendor)) {
    const amounts = vendorTxns.map(t => t.amount);
    const mean = calculateMean(amounts);
    const stdDev = calculateStdDev(amounts, mean);

    results.statistics[vendorId] = { mean, stdDev, count: vendorTxns.length };

    // Flag outliers
    vendorTxns.forEach(txn => {
      const zScore = calculateZScore(txn.amount, mean, stdDev);
      if (Math.abs(zScore) > threshold) {
        results.anomalies.push({
          type: 'price_outlier',
          transactionId: txn.id,
          vendorId,
          amount: txn.amount,
          expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
          zScore,
          severity: Math.abs(zScore) > 3.5 ? 'critical' : 'high',
        });
      }
    });
  }

  return results;
}

// src/lib/analysis/anomaly-detection.ts
export function detectAnomalies(
  transactions: Transaction[]
): AnomalyFlag[] {
  const anomalies: AnomalyFlag[] = [];

  // 1. Statistical outliers
  const statistical = performStatisticalAnalysis(transactions);
  anomalies.push(...statistical.anomalies);

  // 2. Duplicate payments
  const duplicates = detectDuplicatePayments(transactions);
  anomalies.push(...duplicates);

  // 3. Sudden spending spikes
  const spikes = detectSpendingSpikes(transactions);
  anomalies.push(...spikes);

  // 4. Vendor clustering anomalies
  const clustering = detectVendorClustering(transactions);
  anomalies.push(...clustering);

  return anomalies;
}

// src/lib/analysis/math-utils.ts
export function calculateMean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateStdDev(values: number[], mean: number): number {
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}
```

**Audit Checklist:**

- [ ] Analysis functions are pure (no side effects)
- [ ] Analysis code is testable (no React dependencies)
- [ ] Analysis functions have clear inputs/outputs with types
- [ ] API routes call analysis functions, not client components
- [ ] Analysis results stored in database (Prisma models)
- [ ] Mathematical utilities isolated and documented
- [ ] No analysis functions in React components
- [ ] Results can be regenerated from raw data (audit trail)

---

## STEP 5: TYPE DEFINITIONS AUDIT

### 5.1 Type Organization

```typescript
// src/types/index.ts — Barrel export
export * from './api';
export * from './auth';
export * from './common';
export * from './flags';
export * from './investigations';
export * from './vendors';
export * from './departments';
export * from './analysis';

// src/types/auth.ts
export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  image?: string;
  createdAt: Date;
};

export type Role = 'admin' | 'analyst' | 'viewer';

export type Session = {
  user: User;
  expires: string;
};

// src/types/flags.ts
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Flag = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  riskScore: number; // 0-100
  anomalyType: string;
  analysisData: Record<string, any>;
  affectedCount: number;
  organizationId: string;
  vendorId?: string;
  departmentId?: string;
  createdAt: Date;
  resolvedAt?: Date;
};

// src/types/analysis.ts
export type StatisticalResult = {
  anomalies: AnomalyFlag[];
  statistics: Record<string, VendorStats>;
};

export type AnomalyFlag = {
  type: 'price_outlier' | 'duplicate_payment' | 'spending_spike' | 'vendor_clustering';
  transactionId: string;
  vendorId: string;
  amount: number;
  expectedRange: [number, number];
  zScore: number;
  severity: 'high' | 'critical';
};

export type VendorStats = {
  mean: number;
  stdDev: number;
  count: number;
};
```

**Audit Checklist:**

- [ ] Types organized by domain (flags.ts, vendors.ts, etc.)
- [ ] No duplicate type definitions
- [ ] All types have JSDoc comments describing fields
- [ ] API request/response types in `types/api.ts`
- [ ] Page params/search params in `types/common.ts`
- [ ] Prisma models NOT re-exported from types/ (import from @prisma/client)
- [ ] Union types for discriminated unions (e.g., AsyncState)
- [ ] No `any` type anywhere
- [ ] Strict type checking enabled in tsconfig.json

---

## STEP 6: COMMON CODE PATTERNS

### 6.1 API Route Pattern

```typescript
// app/api/flags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { flagSchema } from '@/lib/validations';
import type { Flag } from '@/types';

// GET /api/flags
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity');

    const flags = await prisma.flag.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(severity && { severity }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.flag.count({
      where: { organizationId: session.user.organizationId },
    });

    return NextResponse.json({
      data: flags,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/flags
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = flagSchema.parse(body);

    const flag = await prisma.flag.create({
      data: {
        ...validated,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Audit Checklist:**

- [ ] Auth check on all protected routes
- [ ] Role-based authorization (viewer can't modify)
- [ ] Organization scoping (multi-tenant safety)
- [ ] Input validation with Zod
- [ ] Error handling with appropriate status codes
- [ ] Pagination support for list endpoints
- [ ] Consistent error response format
- [ ] No sensitive data in response (passwords, secrets)

---

### 6.2 Component Pattern

```typescript
// components/flags/flag-detail-view.tsx
'use client';

import { Flag, Severity } from '@/types';
import { FlagSeverityBadge } from './flag-severity-badge';
import { InvestigateButton } from '../investigations/investigate-button';
import { useRouter } from 'next/navigation';

interface FlagDetailViewProps {
  flag: Flag;
  onClose?: () => void;
}

export function FlagDetailView({ flag, onClose }: FlagDetailViewProps) {
  const router = useRouter();

  const handleInvestigate = () => {
    router.push(`/dashboard/investigations/create?flagId=${flag.id}`);
    onClose?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{flag.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{flag.anomalyType}</p>
        </div>
        <FlagSeverityBadge severity={flag.severity} />
      </div>

      <p className="text-gray-700">{flag.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Risk Score</p>
          <p className="text-2xl font-bold text-gray-900">{flag.riskScore}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Affected Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{flag.affectedCount}</p>
        </div>
      </div>

      {flag.vendorId && (
        <div>
          <p className="text-sm font-medium text-gray-500">Related Vendor</p>
          <button
            onClick={() => router.push(`/dashboard/vendors/${flag.vendorId}`)}
            className="text-blue-600 hover:underline"
          >
            View vendor details
          </button>
        </div>
      )}

      <div className="pt-4 border-t">
        <InvestigateButton flagId={flag.id} onClick={handleInvestigate} />
      </div>
    </div>
  );
}
```

---

## STEP 7: CODE DUPLICATION AUDIT

### 7.1 Finding Duplicated Code

**Duplicated analysis logic:**

```bash
# Find similar analysis patterns
grep -r "calculateMean\|calculateStdDev" src --include="*.ts" --include="*.tsx" | wc -l
```

If analysis logic appears in multiple files, extract to `lib/analysis/math-utils.ts`.

**Duplicated component patterns:**

```typescript
// ❌ WRONG: Same table structure in 3 places
// components/vendors-table.tsx
// components/departments-table.tsx
// components/flagged-vendors-table.tsx

// ✅ CORRECT: Generic data table component
// components/ui/data-table.tsx
export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  // Reusable table logic
}

// Usage:
<DataTable
  columns={vendorColumns}
  data={vendors}
  onRowClick={(vendor) => router.push(`/vendors/${vendor.id}`)}
/>
```

**Audit Checklist:**

- [ ] No duplicated analysis algorithms
- [ ] Data fetching logic centralized in hooks (useVendors, useFlags)
- [ ] UI component logic extracted to reusable components
- [ ] Common patterns (tables, forms, modals) extracted
- [ ] No copy-paste API route implementations

---

## STEP 8: IMPORTS & CIRCULAR DEPENDENCIES

**Check for circular imports:**

```bash
# Madge tool for dependency analysis
npm install -g madge
madge --circular src/
```

**Common circular dependency issues:**

```typescript
// ❌ WRONG: Circular import
// src/lib/db.ts
import { User } from '@/types/auth';  // ← types/ should not import from lib/

// src/types/auth.ts
import { prisma } from '@/lib/db';  // ← Creates circular dependency

// ✅ CORRECT: Unidirectional dependency
// Dependency flow: UI → Hooks → Services → Lib → Types (no reverse)
```

**Audit Checklist:**

- [ ] No circular imports between lib/, types/, services/
- [ ] lib/ imports only from types/ (never reverse)
- [ ] Components import from lib/, hooks/, services/ (not other components)
- [ ] API routes import from lib/, prisma (not app files)
- [ ] Unidirectional dependency graph (use madge tool)

---

## FINAL VERIFICATION CHECKLIST

- [ ] `npm run build` succeeds with zero errors
- [ ] `tsc --noEmit` passes (TypeScript strict mode)
- [ ] `npm run lint` passes (ESLint + Prettier)
- [ ] No `any` types in codebase
- [ ] No unused imports or variables
- [ ] No circular dependencies (madge --circular src/)
- [ ] Zustand stores are split by domain (not monolithic)
- [ ] Analysis engine is pure functions, no React
- [ ] All API routes have auth + org scoping
- [ ] Folder structure follows canonical pattern
- [ ] All components typed with TypeScript
- [ ] Server/client component boundaries clear
- [ ] No sensitive data in logs or error messages
- [ ] Code duplication minimal (Rule of Three)
