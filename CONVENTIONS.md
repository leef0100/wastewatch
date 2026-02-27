# CONVENTIONS.md — WasteWatch Coding Standards & Patterns

> **This file defines all coding conventions for the WasteWatch project. Every line of code must follow these rules. No exceptions. When in conflict with external guides or personal preference, this file wins.**

---

## TABLE OF CONTENTS

1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Rules](#typescript-rules)
4. [Component Patterns](#component-patterns)
5. [Server vs Client Components](#server-vs-client-components)
6. [Styling Rules (Tailwind CSS)](#styling-rules-tailwind-css)
7. [State Management](#state-management)
8. [Data Fetching Patterns](#data-fetching-patterns)
9. [API Route Patterns](#api-route-patterns)
10. [Error Handling](#error-handling)
11. [Forbidden Patterns](#forbidden-patterns)
12. [Import Order](#import-order)
13. [Git Conventions](#git-conventions)
14. [Testing Conventions](#testing-conventions)
15. [SEO & Meta Conventions](#seo--meta-conventions)
16. [Performance Conventions](#performance-conventions)
17. [Accessibility Conventions](#accessibility-conventions)

---

## 1. PROJECT STRUCTURE

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: authentication pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Route group: authenticated pages
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Overview & key metrics
│   │   │   └── layout.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx          # Transaction list with search/filter
│   │   │   ├── [id]/page.tsx     # Transaction detail view
│   │   │   └── import/page.tsx
│   │   ├── flags/
│   │   │   ├── page.tsx          # Anomaly flag management
│   │   │   └── [id]/page.tsx     # Flag investigation detail
│   │   ├── vendors/
│   │   │   ├── page.tsx          # Vendor risk profiles
│   │   │   └── [id]/page.tsx
│   │   ├── investigations/
│   │   │   ├── page.tsx          # Open investigations
│   │   │   └── [id]/page.tsx     # Investigation case details
│   │   ├── reports/
│   │   │   ├── page.tsx          # Report generation & history
│   │   │   └── [id]/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx          # Organization settings
│   │   │   ├── audit-log/page.tsx
│   │   │   └── team/page.tsx
│   │   └── layout.tsx            # Dashboard wrapper with nav
│   ├── trial/                    # Route group: trial/onboarding
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── analysis/route.ts     # Risk analysis endpoints
│   │   ├── flags/route.ts        # Flag CRUD operations
│   │   ├── import/route.ts       # Data import endpoints
│   │   ├── reports/route.ts      # Report generation
│   │   ├── transactions/route.ts
│   │   ├── vendors/route.ts
│   │   ├── investigations/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx             # Custom 404
│   ├── error.tsx                 # Global error boundary
│   ├── loading.tsx               # Global loading UI
│   └── globals.css               # Global styles & Tailwind imports
├── components/                   # Shared components
│   ├── ui/                       # Primitive/base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── index.ts              # Barrel export
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   ├── nav-user.tsx
│   │   └── index.ts
│   └── features/                 # Feature-specific components
│       ├── dashboard/
│       │   ├── stat-card.tsx
│       │   ├── risk-distribution-chart.tsx
│       │   └── top-flags-widget.tsx
│       ├── transactions/
│       │   ├── transaction-table.tsx
│       │   ├── transaction-detail.tsx
│       │   └── import-dialog.tsx
│       ├── flags/
│       │   ├── flag-list.tsx
│       │   ├── flag-detail.tsx
│       │   ├── flag-status-badge.tsx
│       │   └── benford-chart.tsx
│       ├── vendors/
│       │   ├── vendor-risk-card.tsx
│       │   └── vendor-history.tsx
│       └── investigations/
│           ├── investigation-form.tsx
│           ├── investigation-timeline.tsx
│           └── fca-complaint-link.tsx
├── lib/                          # Utilities and shared logic
│   ├── utils.ts                  # General utility functions
│   ├── constants.ts              # App-wide constants
│   ├── validations.ts            # Zod schemas / validation
│   ├── fonts.ts                  # Font configuration
│   ├── forensics.ts              # Statistical forensics utilities (Benford's Law, etc.)
│   └── auth-utils.ts             # Auth helper functions
├── hooks/                        # Custom React hooks
│   ├── use-organization.ts       # Organization context hook
│   ├── use-flags.ts              # Flag data hook
│   ├── use-transactions.ts       # Transaction data hook
│   ├── use-debounce.ts
│   └── use-media-query.ts
├── services/                     # External service integrations
│   ├── api-client.ts             # Centralized fetch wrapper
│   ├── auth.ts                   # NextAuth integration
│   ├── database.ts               # Prisma wrapper
│   └── analysis-engine.ts        # Risk scoring & analysis logic
├── stores/                       # Global state (Zustand)
│   └── use-store.ts              # Single unified store for UI state
├── types/                        # TypeScript type definitions
│   ├── api.ts                    # API request/response types
│   ├── database.ts               # Prisma model types (re-exports)
│   ├── fraud.ts                  # Fraud detection domain types
│   ├── investigation.ts          # Investigation types
│   └── analysis.ts               # Analysis result types
├── config/                       # Configuration files
│   ├── site.ts                   # Site metadata config
│   ├── navigation.ts             # Nav items config
│   └── risk-thresholds.ts        # Risk scoring thresholds (DO NOT hardcode)
└── middleware.ts                  # Next.js middleware (auth, org routing)
```

**Rules:**
- One component per file (except tightly coupled sub-components)
- Barrel exports (`index.ts`) ONLY for `ui/` and `layout/` directories
- Colocate tests next to source files: `button.tsx` → `button.test.tsx`
- Organization context is passed via middleware + React Context, not URL — never expose org ID in public routes
- All queries must be scoped by organization ID (security boundary)

---

## 2. NAMING CONVENTIONS

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `StatCard.tsx`, `FlagList.tsx`, `TransactionDetail.tsx` |
| Pages | `page.tsx` (Next.js convention) | `app/flags/page.tsx` |
| Layouts | `layout.tsx` (Next.js convention) | `app/(dashboard)/layout.tsx` |
| Hooks | camelCase with `use` prefix | `useOrganization.ts`, `useFlags.ts`, `useFraudAnalysis.ts` |
| Utilities | camelCase | `calculateRiskScore.ts`, `benfordAnalysis.ts` |
| Services | camelCase | `apiClient.ts`, `analysisEngine.ts` |
| Stores | `useStore.ts` | Single unified Zustand store (not per-feature) |
| Types/Interfaces | PascalCase with descriptive suffix | `TransactionFlag`, `VendorRiskScore`, `InvestigationStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_BENFORD_DEVIATION`, `RISK_THRESHOLD_HIGH`, `FCA_ENDPOINT` |
| CSS classes | kebab-case (Tailwind utilities) | `text-primary`, `bg-danger-subtle` |
| Route groups | parentheses lowercase | `(auth)`, `(dashboard)`, `(trial)` |
| API routes | kebab-case | `api/analysis/route.ts`, `api/import/route.ts` |
| Environment variables | UPPER_SNAKE_CASE with prefix | `NEXT_PUBLIC_API_URL`, `DATABASE_URL`, `NEXTAUTH_SECRET` |

**Strict naming rules:**
- Domain entities: `Transaction`, `TransactionFlag`, `Vendor`, `Investigation`, `VendorRiskScore`, `AuditLog`
- Boolean props: prefix with `is`, `has`, `should` → `isLoading`, `hasError`, `shouldRedirect`, `isHighRisk`
- Event handlers: prefix with `handle` → `handleFlagReview`, `handleImport`, `handleStatusChange`
- Callback props: prefix with `on` → `onFlagCreated`, `onInvestigationStart`
- Risk scores: always suffix with `Score` → `overallRiskScore`, `vendorRiskScore`
- Flags: anomalies are called `TransactionFlag` internally (not "anomaly" or "alert")

---

## 3. TYPESCRIPT RULES

### tsconfig.json Strict Settings (Required)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Rules:
- **NEVER** use `any` — use `unknown` and narrow with type guards
- **NEVER** use `@ts-ignore` — use `@ts-expect-error` with a linked issue comment if absolutely necessary
- **NEVER** use non-null assertion (`!`) without a comment explaining why it's safe
- **ALWAYS** type function parameters and return types explicitly
- **ALWAYS** use discriminated unions for state modeling (loading, success, error)
- **PREFER** `interface` for object shapes, `type` for unions/intersections
- **PREFER** `as const` for literal values and configuration objects
- **USE** Zod for runtime validation of external data (API responses, form inputs, file uploads)

### Type Patterns:
```typescript
// ✅ GOOD: Discriminated union for async state
type FraudAnalysisState =
  | { status: 'idle' }
  | { status: 'analyzing' }
  | { status: 'success'; data: TransactionFlag[] }
  | { status: 'error'; error: string };

// ✅ GOOD: Domain-specific API response
interface FlagAnalysisResponse {
  flags: TransactionFlag[];
  meta: {
    analysisDate: string;
    methodsApplied: string[];
    organizationId: string;
  };
}

// ✅ GOOD: Risk score with metadata
interface VendorRiskScore {
  vendorId: string;
  overallScore: number;
  components: {
    benfordDeviation: number;
    frequencyAnomalies: number;
    timingPatterns: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  updatedAt: Date;
}

// ❌ BAD: any, implicit returns, no org scoping
const analyzeTransactions = (data) => data.map(t => ({...t, risk: 'unknown'}));
const flags: any[] = [];
```

---

## 4. COMPONENT PATTERNS

### Standard Component Template
```tsx
// components/features/flags/flag-list.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import type { TransactionFlag } from '@/types/fraud';

interface FlagListProps {
  flags: TransactionFlag[];
  organizationId: string;
  onFlagSelect?: (flag: TransactionFlag) => void;
  className?: string;
}

export function FlagList({
  flags,
  organizationId,
  onFlagSelect,
  className
}: FlagListProps) {
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);

  const handleFlagClick = (flag: TransactionFlag) => {
    setSelectedFlagId(flag.id);
    onFlagSelect?.(flag);
  };

  if (flags.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No flags for this organization</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {flags.map((flag) => (
        <Card
          key={flag.id}
          className={cn(
            'p-4 cursor-pointer hover:shadow-md transition-shadow',
            selectedFlagId === flag.id && 'ring-2 ring-primary'
          )}
          onClick={() => handleFlagClick(flag)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{flag.transactionId}</p>
              <p className="text-sm text-muted-foreground">{flag.reason}</p>
            </div>
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              flag.severity === 'high' && 'bg-red-100 text-red-900',
              flag.severity === 'medium' && 'bg-yellow-100 text-yellow-900',
              flag.severity === 'low' && 'bg-blue-100 text-blue-900'
            )}>
              {flag.severity}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### Component Rules:
- All interactive components MUST use `forwardRef`
- All components MUST have explicit `displayName` if using `forwardRef` or `memo`
- All components MUST accept a `className` prop for style composition
- Use `cn()` utility for className merging
- Props interfaces are defined in same file, exported alongside component
- Default prop values via destructuring, NOT `defaultProps`
- No inline function definitions in JSX — extract to named handlers
- Maximum component file length: 250 lines (split if longer)
- **ALWAYS** scope data operations by organization — pass `organizationId` explicitly

---

## 5. SERVER VS CLIENT COMPONENTS

### Default to Server Components
Every component is a Server Component by default. Only add `'use client'` when you NEED:
- `useState`, `useEffect`, `useReducer`, or React hooks
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers (`onClick`, `onChange`)
- Real-time features (websockets, polling)
- Client libraries that use hooks

### Boundary Pattern:
```
ServerComponent (fetch transactions, apply org filter)
  └── ClientComponent (filtering UI, risk visualization)
       └── ServerComponent (detailed flag data, passed as children)
```

### Rules:
- **NEVER** add `'use client'` to a page or layout unless absolutely necessary
- **PUSH** `'use client'` as far down the tree as possible
- **PREFER** passing server data as props to client components
- **USE** Server Components for: data fetching, organization scoping, access control
- **SEPARATE** interactive islands into small client components
- Server Components can import Client Components, but NOT vice versa
- **ALWAYS** fetch fraud analysis data server-side, then pass to client visualization

---

## 6. STYLING RULES (TAILWIND CSS)

### Tailwind Configuration:
```typescript
// tailwind.config.ts — Required design token structure
const config = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '...', foreground: '...' },
        success: { DEFAULT: '...', foreground: '...' },
        warning: { DEFAULT: '...', foreground: '...' },
        danger: { DEFAULT: '...', foreground: '...' },
        muted: { DEFAULT: '...', foreground: '...' },
        background: '...',
        foreground: '...',
        card: { DEFAULT: '...', foreground: '...' },
        border: '...',
        input: '...',
        ring: '...',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

### Styling Rules:
- **NEVER** use inline `style={{}}` — use Tailwind utilities
- **NEVER** hardcode colors — always use theme tokens
- **NEVER** use arbitrary values (`[#ff0000]`) — define in theme config
- **ALWAYS** use responsive prefixes mobile-first: `text-sm md:text-base lg:text-lg`
- **USE** Tailwind for: danger/warning/success states; primary/secondary for navigation
- **USE** semantic color names: `text-danger` for errors, `text-warning` for alerts
- **GROUP** Tailwind classes: layout → spacing → sizing → typography → colors → effects

### Responsive Breakpoints:
```
sm:  640px   (large phones landscape)
md:  768px   (tablets)
lg:  1024px  (small laptops)
xl:  1280px  (desktops)
2xl: 1536px  (large desktops)
```

---

## 7. STATE MANAGEMENT

### State Hierarchy (use the simplest option):
1. **URL State** — search params, filters, org context (for shareable state)
2. **Server State** — React Server Components, Prisma queries (for persistent data)
3. **Form State** — React Hook Form (for form inputs)
4. **Local Component State** — `useState` (for UI-only state)
5. **Global Client State** — Zustand single `useStore` (for cross-component UI state)

### Zustand Store Pattern (Single Unified Store):
```typescript
// stores/use-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI state only — never put server data here
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeInvestigationTab: 'overview' | 'timeline' | 'notes';
  selectedFlagId: string | null;

  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: AppState['theme']) => void;
  setActiveInvestigationTab: (tab: AppState['activeInvestigationTab']) => void;
  selectFlag: (flagId: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      activeInvestigationTab: 'overview',
      selectedFlagId: null,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setActiveInvestigationTab: (tab) => set({ activeInvestigationTab: tab }),
      selectFlag: (flagId) => set({ selectedFlagId: flagId }),
    }),
    {
      name: 'wastewatch-app-state',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
);
```

### Rules:
- **NEVER** put server-fetched data in Zustand — fetch server-side or use React Query
- **NEVER** duplicate URL state in local state
- **ALWAYS** persist user preferences (theme, sidebar) to localStorage
- **ALWAYS** use selectors to prevent re-renders: `useStore(state => state.theme)`
- **USE** a single `useStore` — no per-feature stores
- **USE** URL search params for: filters, sorting, pagination, organization context

---

## 8. DATA FETCHING PATTERNS

### Server Components (Preferred):
```typescript
// app/(dashboard)/flags/page.tsx
import { db } from '@/services/database';
import { FlagList } from '@/components/features/flags/flag-list';
import type { TransactionFlag } from '@/types/fraud';

interface FlagsPageProps {
  searchParams: Promise<{ status?: string; severity?: string }>;
}

export default async function FlagsPage({ searchParams }: FlagsPageProps) {
  const { status, severity } = await searchParams;

  // ✅ GOOD: Fetch server-side with org scoping
  const flags = await db.transactionFlag.findMany({
    where: {
      organizationId: session.organization.id, // ALWAYS scope by org
      status: status || undefined,
      severity: severity || undefined,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <h1>Transaction Flags</h1>
      <FlagList flags={flags} organizationId={session.organization.id} />
    </div>
  );
}
```

### Rules:
- **DEFAULT** to server-side data fetching in Server Components
- **ALWAYS** scope queries by organization ID (security requirement)
- **ALWAYS** implement loading states (skeleton UI, not spinners)
- **ALWAYS** implement error states with retry actions
- **ALWAYS** implement empty states with helpful messaging
- **NEVER** fetch in `useEffect` + `useState` — use Server Components
- **USE** `Suspense` boundaries with `loading.tsx` for streaming
- **USE** `error.tsx` files for error boundaries

---

## 9. API ROUTE PATTERNS

### Standard API Route:
```typescript
// app/api/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { analysisEngine } from '@/services/analysis-engine';
import { db } from '@/services/database';

const analyzeTransactionsSchema = z.object({
  transactionIds: z.array(z.string().uuid()).min(1),
  includeVendorHistory: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = analyzeTransactionsSchema.parse(body);

    // ✅ GOOD: Scope analysis by organization
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: validated.transactionIds },
        organizationId: session.organization.id, // CRITICAL: org scoping
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found for your organization' },
        { status: 404 }
      );
    }

    // Run fraud analysis (Benford's Law, statistical forensics)
    const flags = await analysisEngine.analyzeTransactions(
      transactions,
      { includeVendorHistory: validated.includeVendorHistory }
    );

    // Store flags for audit trail
    await db.transactionFlag.createMany({
      data: flags.map(flag => ({
        ...flag,
        organizationId: session.organization.id,
      })),
    });

    return NextResponse.json(
      { flags, count: flags.length, organizationId: session.organization.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[analysis] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transactions' },
      { status: 500 }
    );
  }
}
```

### Rules:
- **ALWAYS** validate input with Zod
- **ALWAYS** check authentication and authorization first
- **ALWAYS** scope database queries by organization ID
- **ALWAYS** return proper HTTP status codes
- **ALWAYS** return consistent error shape: `{ error: string, details?: unknown }`
- **NEVER** expose internal error messages or stack traces
- **NEVER** trust client input — validate everything server-side
- **NEVER** hardcode risk thresholds — use config constants
- **USE** try/catch with typed error handling
- **USE** proper logging with organization context
- **IMPORTANT** API endpoints for fraud analysis: `/api/analysis`, `/api/flags`, `/api/import`, `/api/reports`

---

## 10. ERROR HANDLING

### Error Boundary Pattern:
```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to monitoring service with context
    console.error('[ErrorBoundary]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">
          {error.message || 'An unexpected error occurred during fraud analysis'}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset} variant="primary">
        Try again
      </Button>
    </div>
  );
}
```

### Rules:
- **EVERY** route segment should have an `error.tsx` boundary
- **EVERY** async operation must have try/catch with user-friendly messaging
- **NEVER** show raw error messages, stack traces, or internal paths to users
- **ALWAYS** log errors server-side with context (organization ID, user, request details, timestamp)
- **NEVER** log sensitive data (API keys, risk scores before audit)
- **USE** toast notifications for non-blocking errors
- **USE** full-page error states for blocking errors
- **IMPLEMENT** retry logic with exponential backoff for network errors
- **DISTINGUISH** between validation errors (client issue) and system errors (server issue)

---

## 11. FORBIDDEN PATTERNS

The following patterns are NEVER allowed. Fix immediately if found:

| # | Pattern | Why Forbidden | Fix |
|---|---------|---------------|-----|
| 1 | Hardcoded risk thresholds | Not configurable, audit nightmare | Use `config/risk-thresholds.ts` |
| 2 | Database queries without org scoping | Multi-tenant data leak | Always add `organizationId` WHERE clause |
| 3 | `console.log()` in production | Leaks information | Use proper logging service |
| 4 | `any` type | Defeats TypeScript | Use proper types or `unknown` + narrowing |
| 5 | `@ts-ignore` | Hides type errors | Fix the type error properly |
| 6 | `var` keyword | Function-scoped footgun | Use `const` or `let` |
| 7 | Inline `style={{}}` | Breaks Tailwind consistency | Use Tailwind utilities |
| 8 | `useEffect` for data fetching | Race conditions, no caching | Use Server Components or React Query |
| 9 | Array index as `key` in lists | Rendering bugs on reorder | Use stable unique IDs |
| 10 | Nested ternaries | Unreadable | Extract to variables or early returns |
| 11 | `setTimeout` without cleanup | Memory leaks | Always clear in useEffect cleanup |
| 12 | Hardcoded API URLs | Environment-dependent | Use environment variables |
| 13 | `document.querySelector` in React | Breaks React's model | Use refs or state |
| 14 | `dangerouslySetInnerHTML` | XSS vulnerability | Avoid entirely, use DOMPurify if necessary |
| 15 | `localStorage` without hydration guard | SSR mismatch | Check `typeof window !== 'undefined'` or use `useEffect` |
| 16 | Exposing risk scores in URLs | Unencrypted sensitive data | Keep scores in session/server only |
| 17 | Skipping organization checks in APIs | Multi-tenant security breach | ALWAYS validate org ownership of data |
| 18 | Manual Benford's Law calculation | Unreliable | Use `analysisEngine.benfordAnalysis()` |
| 19 | Storing unencrypted FCA IDs | Compliance issue | Use encrypted configuration |
| 20 | Direct Prisma calls in components | Server/client boundary violation | Use services or Server Components |

---

## 12. IMPORT ORDER

Imports must follow this exact order, with blank lines between groups:

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// 2. External library imports
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

// 3. Internal services and utilities (@/)
import { analysisEngine } from '@/services/analysis-engine';
import { db } from '@/services/database';
import { cn } from '@/lib/utils';
import { RISK_THRESHOLD_HIGH } from '@/lib/constants';

// 4. Components (@/)
import { Button, Card } from '@/components/ui';
import { StatCard } from '@/components/features/dashboard';
import { FlagList } from '@/components/features/flags';

// 5. Hooks and stores (@/)
import { useStore } from '@/stores/use-store';
import { useOrganization } from '@/hooks/use-organization';

// 6. Types (@/)
import type { TransactionFlag, VendorRiskScore } from '@/types/fraud';

// 7. Relative imports
import { flagUtils } from './flag-utils';

// 8. Style imports (if any CSS modules)
import styles from './flags.module.css';
```

**Rules:**
- `type` imports must use `import type { ... }` syntax
- No circular imports
- Barrel imports only from `@/components/ui` and `@/components/layout`
- Never import from `../../../` — use `@/` alias
- Group domain-specific imports (fraud, analysis) together

---

## 13. GIT CONVENTIONS

### Branch Naming:
```
feature/[ticket-id]-short-description
fix/[ticket-id]-short-description
refactor/short-description
audit/[compliance-requirement]
chore/short-description

Examples:
feature/FD-142-benford-analysis-engine
fix/SEC-89-org-scoping-transaction-api
audit/fca-complaint-tracking
```

### Commit Message Format (Conventional Commits):
```
type(scope): description

feat(analysis): add Benford's Law detection for expense patterns
fix(api): ensure transactions scoped by organization ID in flags endpoint
refactor(stores): consolidate UI state into single useStore
perf(imports): optimize transaction data import for large datasets
a11y(dashboard): add aria-labels to risk score components
audit(compliance): add encryption for FCA complaint references
test(analysis): add benford deviation calculation tests

Examples:
feat(flags): add manual flag review workflow
fix(auth): resolve org context loss on page refresh
refactor(forensics): extract vendor analysis into separate module
perf(dashboard): memoize risk distribution chart
docs(api): update fraud analysis endpoint documentation
audit(security): add org ID validation to all database queries
```

**Types:** `feat`, `fix`, `refactor`, `perf`, `a11y`, `audit`, `test`, `docs`, `chore`

### Rules:
- Commit messages are lowercase (except proper nouns, domain terms)
- Maximum 72 characters for subject line
- Reference ticket/issue numbers in commit body
- One logical change per commit — don't mix refactors with features
- Audit commits document compliance or security changes

---

## 14. TESTING CONVENTIONS

### Test File Naming:
- Unit/Component tests: `[name].test.tsx` (colocated with source)
- Feature tests: `__tests__/[feature].test.tsx`
- E2E tests: `e2e/[flow].spec.ts` (Playwright)

### Testing with Vitest (Recommended):
```typescript
// components/features/flags/flag-list.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlagList } from './flag-list';
import type { TransactionFlag } from '@/types/fraud';

describe('FlagList', () => {
  const mockFlags: TransactionFlag[] = [
    {
      id: '1',
      transactionId: 'TXN-001',
      organizationId: 'org-1',
      reason: 'Benford deviation detected',
      severity: 'high',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders flag list correctly', () => {
    render(<FlagList flags={mockFlags} organizationId="org-1" />);
    expect(screen.getByText('Benford deviation detected')).toBeInTheDocument();
  });

  it('calls onFlagSelect when flag is clicked', async () => {
    const handleFlagSelect = vi.fn();
    render(
      <FlagList
        flags={mockFlags}
        organizationId="org-1"
        onFlagSelect={handleFlagSelect}
      />
    );

    await userEvent.click(screen.getByText('TXN-001'));
    expect(handleFlagSelect).toHaveBeenCalledWith(mockFlags[0]);
  });

  it('shows empty state when no flags', () => {
    render(<FlagList flags={[]} organizationId="org-1" />);
    expect(screen.getByText(/no flags/i)).toBeInTheDocument();
  });
});
```

### Rules:
- **USE** `screen.getByRole` for querying — not `getByTestId`
- **USE** `userEvent` over `fireEvent` for realistic interactions
- **TEST** behavior, not implementation details
- **NEVER** test internal state — test what the user sees
- **MINIMUM** coverage: 70% statements, 60% branches for fraud analysis code
- **REQUIRED** tests for: all shared UI components, all API routes, all forensics utilities, critical user flows (E2E)
- **TEST ORGANIZATION SCOPING**: verify that queries filter by `organizationId`

---

## 15. SEO & META CONVENTIONS

### Metadata Pattern (B2B/Government SaaS):
```typescript
// app/(marketing)/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fraud Detection Platform | WasteWatch',
  description:
    'Government-grade transaction fraud detection for public sector organizations. Detect spending anomalies with Benford\'s Law and statistical forensics.',
  openGraph: {
    title: 'Fraud Detection Platform | WasteWatch',
    description:
      'Detect transaction anomalies and vendor risk patterns using statistical forensics.',
    images: [{ url: '/og/platform.png', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: {
    canonical: '/about',
  },
  keywords: ['fraud detection', 'government spending', 'anomaly detection', 'Benford\'s Law'],
};
```

### Rules (B2B/Government):
- **EVERY** page must have unique `title` and `description`
- **EVERY** page must have Open Graph tags
- **USE** `next/image` for all images
- **USE** `next/link` for all internal navigation
- **USE** semantic HTML (`<main>`, `<article>`, `<section>`, etc.)
- **IMPLEMENT** structured data (JSON-LD) for organization/product pages
- **GENERATE** `sitemap.xml` and `robots.txt`
- **SET** canonical URLs
- **USE** proper heading hierarchy (one `<h1>` per page)
- **FOCUS** SEO on: fraud detection, anomaly detection, compliance, spending analytics

---

## 16. PERFORMANCE CONVENTIONS

### Image Rules:
- **ALWAYS** use `next/image` — never raw `<img>` tags
- **ALWAYS** set explicit `width` and `height`
- **USE** `priority` for above-the-fold images
- **USE** `loading="lazy"` for below-the-fold (default)
- **PREFER** WebP/AVIF via Next.js
- **SIZE** appropriately — don't serve 4K images to mobile

### Bundle Rules:
- **USE** dynamic imports for heavy components below the fold
- **NEVER** import entire libraries when you only need one function
- **ANALYZE** bundle size with `@next/bundle-analyzer`
- **KEEP** client-side JavaScript minimal — prefer Server Components
- **USE** tree-shaking: `import { debounce } from 'lodash-es'`

### Rendering Rules:
- **DEFAULT** to static rendering (SSG) for marketing pages
- **USE** ISR for data that changes periodically (fraud reports)
- **USE** SSR only when data must be fresh on every request
- **MINIMIZE** client-side hydration — keep `'use client'` components small

### Core Web Vitals Targets:
```
LCP (Largest Contentful Paint):  < 2.5s
INP (Interaction to Next Paint): < 200ms (target < 100ms)
CLS (Cumulative Layout Shift):   < 0.1
TTFB (Time to First Byte):       < 800ms
FCP (First Contentful Paint):    < 1.8s
```

---

## 17. ACCESSIBILITY CONVENTIONS

### Required on Every Interactive Element:
- Visible focus indicator (`:focus-visible` ring)
- Keyboard operability (Enter/Space for buttons, Tab navigation)
- Accessible name (`aria-label`, visible text, or `aria-labelledby`)
- Appropriate ARIA role (prefer semantic HTML)

### Semantic HTML First:
```html
<!-- ✅ GOOD: Semantic HTML -->
<button>Review Flag</button>
<a href="/vendors/123">Vendor Profile</a>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<section aria-labelledby="flags-heading">
  <h2 id="flags-heading">Transaction Flags</h2>
</section>

<!-- ❌ BAD: Div soup with ARIA band-aids -->
<div role="button" onclick="...">Review Flag</div>
<div onclick="navigate(...)">Vendor Profile</div>
```

### Rules:
- **USE** semantic HTML before ARIA
- **EVERY** image must have meaningful `alt` text (or `alt=""` for decorative)
- **EVERY** form input must have an associated `<label>`
- **EVERY** page must have a skip-to-content link
- **EVERY** page must have proper heading hierarchy (h1 → h2 → h3, no skipping)
- **EVERY** icon button must have `aria-label`
- **MAINTAIN** WCAG AA contrast: 4.5:1 for text, 3:1 for large text
- **TEST** with keyboard-only navigation
- **TEST** with screen reader (VoiceOver, NVDA)
- **SUPPORT** `prefers-reduced-motion`
- **SUPPORT** `prefers-color-scheme` for dark mode

---

## ENFORCEMENT

These conventions are enforced by:
1. **ESLint** — `eslint-config-next`, `@typescript-eslint`, `eslint-plugin-jsx-a11y`, `eslint-plugin-import`
2. **Prettier** — consistent formatting
3. **TypeScript** — strict mode catches type violations
4. **Husky + lint-staged** — pre-commit hooks run linting and type checking
5. **Database** — Prisma migrations enforce schema
6. **Code review** — all changes go through PR review with security/audit focus
7. **NextAuth** — enforces authentication boundaries

**When these conventions conflict with a library's patterns, these conventions win. When these conventions conflict with common practice, these conventions win. The only thing that overrides these conventions is an explicit decision documented in this file.**

---

## WASTEWATCH-SPECIFIC SECURITY REQUIREMENTS

1. **Organization Isolation**: EVERY database query must be scoped by `organizationId`. No exceptions. This is a multi-tenant data leak risk.
2. **Risk Threshold Configuration**: Risk thresholds MUST come from `config/risk-thresholds.ts`, never hardcoded in components or analysis logic.
3. **Audit Logging**: All flag creations, status changes, and investigations must be logged to `AuditLog` table with full context.
4. **Statistical Integrity**: All fraud detection calculations must use the `analysisEngine` service — no duplicate analysis logic in components.
5. **FCA Compliance**: FCA complaint references must use encrypted IDs, never exposed in URLs or logs.
