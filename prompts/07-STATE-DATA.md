# 07-STATE-DATA.md — State Management & Data Flow Audit (WasteWatch Edition)

> **Scope:** Comprehensive state architecture audit for WasteWatch, a fraud detection SaaS with Zustand 5.0.11 for client state, PostgreSQL 16 + Prisma 7.4.1 for server state, and NextAuth 5.0.0-beta.30 for authentication.
>
> **Golden Rule:** Every piece of state must have a single source of truth. If the same data is stored in two places, you've found a bug.
>
> **Critical for WasteWatch:** Organization scoping (multi-tenant), role-based access control, data isolation (no cross-org leaks), and filter/search state persistence across navigation.

---

## STEP 1: STATE ARCHITECTURE AUDIT

### 1.1 State Category Classification

Every piece of state falls into one of six categories. Audit your codebase and classify ALL state.

**Category 1: URL State**

State that belongs in the URL (shareable, bookmark-able, browser back/forward compatible):
- Search filters (vendor name, date range)
- Sort order (transactions by amount ascending/descending)
- Pagination (current page, page size)
- Tab selection (active tab in investigations detail)
- Modal/sidebar state (is advanced filter open?)
- Investigation ID in detail view
- Report filter selections

**Example — Bad (useState for filters):**
```typescript
// ❌ BAD: Filters in state, not URL
export function TransactionsPage() {
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // When user refreshes: all filters lost
  // When user shares link: recipient sees no filters
  // Browser back button: doesn't work
}
```

**Example — Good (URL state with nuqs):**
```typescript
'use client';

import { useQueryState } from 'nuqs';

export function TransactionsPage() {
  const [vendor, setVendor] = useQueryState('vendor', { defaultValue: '' });
  const [dateFrom, setDateFrom] = useQueryState('from', { defaultValue: '' });
  const [dateTo, setDateTo] = useQueryState('to', { defaultValue: '' });
  const [page, setPage] = useQueryState('page', { parse: Number, defaultValue: 1 });

  // ✅ All state persisted in URL: /transactions?vendor=Acme&from=2024-01-01&page=2
  // ✅ Browser back/forward works
  // ✅ Link shareable
  // ✅ Page refresh preserves filters
}
```

**WasteWatch URL State Examples:**
```
/dashboard — No params needed
/transactions?vendor=&severity=high&riskMin=50&page=1
/investigations?status=open&dept=operations
/reports?from=2024-01-01&to=2024-12-31&type=summary
/flags?type=duplicate&vendor=Acme&resolved=false
```

**Storage Mechanism:** Use `nuqs` library (type-safe URL search params):
```bash
npm install nuqs
```

---

**Category 2: Server State**

Data from database or API that can be stale:
- Transactions list
- Organizations and departments
- Vendors
- Flags detected
- Investigation records
- Current user profile
- Reports

**Why Server State is Different:** Can be modified by other users, needs refetching, requires caching.

**Storage Mechanism:**
- **Preferred:** React Server Components (fetch data on server, pass as props)
- **Secondary:** React Query (client-side caching, auto-refetch)
- **Never:** useState + useEffect (guarantees stale data bugs)

**Example — Server Component (Preferred):**
```typescript
// app/transactions/page.tsx (Server Component)
async function TransactionsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  // Fetch on server with filters from URL
  const vendor = searchParams.vendor || '';
  const severity = searchParams.severity || '';
  const page = parseInt(searchParams.page || '1');

  const transactions = await prisma.transaction.findMany({
    where: {
      vendor: vendor ? { contains: vendor } : undefined,
      riskScore: severity === 'high' ? { gte: 70 } : undefined,
    },
    take: 50,
    skip: (page - 1) * 50,
    orderBy: { date: 'desc' },
  });

  // Pass to Client Component
  return <TransactionsList initialTransactions={transactions} />;
}

// components/TransactionsList.tsx (Client Component)
'use client';

export function TransactionsList({ initialTransactions }: Props) {
  // Data is already loaded, no need for useState + useEffect
  return (
    <table>
      <tbody>
        {initialTransactions.map(t => (
          <tr key={t.id}>
            <td>{t.vendor}</td>
            <td>{t.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Example — React Query (for real-time updates):**
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function InvestigationsList() {
  const { data: investigations, isLoading } = useQuery({
    queryKey: ['investigations', 'open'],
    queryFn: async () => {
      const res = await fetch('/api/investigations?status=open');
      return res.json();
    },
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  if (isLoading) return <Skeleton />;

  return <InvestigationsTable data={investigations} />;
}
```

---

**Category 3: Form State**

Input field values, validation errors, touched fields, submission status:
- Transaction CSV upload form
- Investigation creation form
- Report filter form
- Organization settings form

**Storage Mechanism:** React Hook Form + Zod for validation:
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Example:**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createInvestigationSchema = z.object({
  title: z.string().min(5, 'Title required'),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']),
  flagIds: z.array(z.string()).optional(),
});

type CreateInvestigationForm = z.infer<typeof createInvestigationSchema>;

export function CreateInvestigationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvestigationForm>({
    resolver: zodResolver(createInvestigationSchema),
  });

  const onSubmit = async (data: CreateInvestigationForm) => {
    const res = await fetch('/api/investigations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}

      <select {...register('severity')}>
        <option>Select severity</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Investigation'}
      </button>
    </form>
  );
}
```

---

**Category 4: UI State**

Ephemeral visual state (doesn't persist across page reload):
- Is sidebar open?
- Is dark mode enabled (unless persisted)?
- Is advanced filter panel open?
- Which row is expanded?
- Which tab is active?

**Storage Mechanism:**
- Local component `useState` for single-component UI
- Zustand for global UI state (sidebar, toast notifications)

**Example — Local UI State:**
```typescript
export function TransactionRow({ transaction }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr onClick={() => setIsExpanded(!isExpanded)}>
        <td>{transaction.vendor}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colspan="4">{transaction.details}</td>
        </tr>
      )}
    </>
  );
}
```

**Example — Global UI State (Zustand):**
```typescript
// lib/store/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;

  advancedFilterOpen: boolean;
  toggleAdvancedFilter: () => void;

  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString() },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  advancedFilterOpen: false,
  toggleAdvancedFilter: () =>
    set((state) => ({
      advancedFilterOpen: !state.advancedFilterOpen,
    })),

  darkMode: false,
  setDarkMode: (enabled) => set({ darkMode: enabled }),
}));

// Usage
export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarOpen ? '' : 'hidden'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

---

**Category 5: Global Client State**

Data read everywhere, changes infrequently:
- Current user (auth status, email, role, organization)
- Theme preference
- User preferences
- Feature flags
- Organization context (orgId, orgName)

**Storage Mechanism:** Zustand with persist middleware + NextAuth:
```typescript
// lib/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSession } from 'next-auth/react';

interface AuthStore {
  user: User | null;
  orgId: string | null;
  role: 'admin' | 'analyst' | 'viewer' | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      orgId: null,
      role: null,
      setUser: (user) =>
        set({
          user,
          orgId: user.orgId,
          role: user.role,
        }),
      logout: () =>
        set({
          user: null,
          orgId: null,
          role: null,
        }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        // Only persist user (session token handled by NextAuth)
        user: state.user,
      }),
    }
  )
);

// Hook that syncs with NextAuth session
export function useAuthWithSession() {
  const { data: session } = useSession();
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id!,
        email: session.user.email!,
        name: session.user.name!,
        role: session.user.role as any,
        orgId: session.user.orgId!,
      });
    }
  }, [session, setUser]);

  return { user, logout };
}
```

---

**Category 6: Computed/Derived State**

Values calculated from other state (NEVER stored separately):
- Is the form valid?
- Total risk score for vendor
- Filtered transaction list
- Dashboard statistics (count, sum, average)
- User's full name (first + last)

**Why Don't Store It:** Creates multiple sources of truth → bugs when source changes.

**Storage Mechanism:** `useMemo` or selector functions.

**Example — Bad (Storing Derived State):**
```typescript
// ❌ BAD
export function InvestigationDetail() {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [flagCount, setFlagCount] = useState(0);

  useEffect(() => {
    fetch('/api/investigations/1').then((res) => {
      const inv = res.json();
      setInvestigation(inv);
      setFlagCount(inv.flags.length); // Derived state stored separately!
    });
  }, []);

  // When investigation updates, must remember to update flagCount
  const addFlag = (flag: Flag) => {
    const updated = { ...investigation, flags: [...investigation.flags, flag] };
    setInvestigation(updated);
    setFlagCount(flagCount + 1); // Easy to forget!
  };
}
```

**Example — Good (Computing Derived State):**
```typescript
// ✅ GOOD
export function InvestigationDetail() {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);

  // Derived: computed, not stored
  const flagCount = useMemo(() => investigation?.flags.length ?? 0, [investigation]);

  const addFlag = (flag: Flag) => {
    // Update only source of truth
    setInvestigation((prev) => ({
      ...prev!,
      flags: [...prev!.flags, flag],
    }));
    // flagCount automatically updates
  };

  return <div>Flags: {flagCount}</div>;
}
```

---

### 1.2 WasteWatch-Specific State Audit

**Create this table and fill in for your codebase:**

| State Name | Current Location | Category | Correct Location | Issue | Priority |
|------------|-----------------|----------|-----------------|-------|----------|
| `vendorFilter` | useState | Form/URL | URL (nuqs) | Breaks on refresh, not shareable | P1 |
| `selectedTransaction` | useState | URL | URL param (?id=123) | Should be in URL for direct linking | P1 |
| `transactions` | useState + useEffect | Server | React Server Component | Stale data, refetch on mount | P1 |
| `user` | useState | Global | useSession + Zustand | Refetch on every mount | P1 |
| `orgId` | context | Global | Zustand + persist | Should sync with auth | P2 |
| `isSidebarOpen` | useState | UI | Zustand (global) | Should persist across pages | P2 |
| `riskScoreBreakdown` | useState | Derived | useMemo | Should compute from riskFactors | P1 |
| `dashboardStats` | useState | Derived | useMemo | Compute from transactions | P1 |
| `filteredFlags` | useState | Derived | useMemo | Filter from all flags | P1 |

---

### 1.3 Critical Source of Truth Violations

**Violation #1: Duplicate State**
```typescript
// ❌ BAD: Same data in two places
const user = useAuthStore((s) => s.user);
const [userProfile, setUserProfile] = useState(null);

useEffect(() => {
  setUserProfile(user); // Duplicate!
}, [user]);
```

**Fix:** Use only one source (Zustand auth store).

**Violation #2: Stale State**
```typescript
// ❌ BAD: Fetched once, never refreshed
const [transactions, setTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  fetch('/api/transactions').then((res) =>
    setTransactions(res.json())
  );
}, []); // Empty deps = fetch once at mount, never again
```

**Fix:** Use React Server Component or React Query with proper staleTime.

**Violation #3: Orphaned State**
```typescript
// ❌ BAD: State set but never used
const [debugInfo, setDebugInfo] = useState('');

useEffect(() => {
  setDebugInfo(JSON.stringify(someData)); // Set but never displayed
}, [someData]);
```

**Fix:** Delete if truly unused, move to `console.log` for debugging.

---

## STEP 2: WASTEWATCH SPECIFIC STATE REQUIREMENTS

### 2.1 Organization Scoping & Multi-Tenant Isolation

**Critical Requirement:** Ensure NO cross-organization data leaks.

**Global Organization State (Zustand):**
```typescript
// lib/store/org-store.ts
import { create } from 'zustand';

interface OrgStore {
  currentOrgId: string | null;
  currentOrgName: string | null;
  setOrganization: (orgId: string, orgName: string) => void;
}

export const useOrgStore = create<OrgStore>((set) => ({
  currentOrgId: null,
  currentOrgName: null,
  setOrganization: (orgId, orgName) =>
    set({ currentOrgId: orgId, currentOrgName: orgName }),
}));
```

**Server-Side Enforcement (Critical):**
Every API route MUST filter by currentOrgId:

```typescript
// app/api/transactions/route.ts
import { getServerSession } from 'next-auth/next';

export async function GET(req: Request) {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = session.user.orgId;

  // CRITICAL: Always filter by orgId
  const transactions = await prisma.transaction.findMany({
    where: {
      orgId, // ← MUST filter here
    },
  });

  return Response.json(transactions);
}
```

**Client-Side Enforcement (Defense in Depth):**
```typescript
// hooks/useOrgFilteredData.ts
export function useOrgFilteredTransactions(allTransactions: Transaction[]) {
  const { currentOrgId } = useOrgStore();

  return useMemo(() => {
    // Defense: Filter again on client (should be unnecessary if server works)
    return allTransactions.filter((t) => t.orgId === currentOrgId);
  }, [allTransactions, currentOrgId]);
}
```

---

### 2.2 Role-Based Access Control (RBAC)

**Three roles:** admin, analyst, viewer

**Store:**
```typescript
interface AuthStore {
  user: User | null; // Includes role
  role: 'admin' | 'analyst' | 'viewer' | null;
  hasPermission: (action: string) => boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  hasPermission: (action) => {
    // Implementation
  },
}));
```

**Permissions Matrix:**
```
admin:     [read:*, write:*, delete:*, manage:users]
analyst:   [read:*, write:investigations, write:flags]
viewer:    [read:*]

Admin: can view all transactions, create/edit investigations, manage users
Analyst: can view/search transactions, create investigations, flag items
Viewer: can view transactions and reports, cannot modify
```

**Component-Level Gating:**
```typescript
export function CreateInvestigationButton() {
  const { hasPermission } = useAuthStore();

  if (!hasPermission('write:investigations')) {
    return null; // Hide button if no permission
  }

  return <button onClick={openDialog}>Create Investigation</button>;
}
```

---

### 2.3 Filter & Search State (URL + Zustand)

**Store filtered state in URL, not Zustand:**

```typescript
// app/transactions/page.tsx
'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export function TransactionsPage() {
  const [vendor, setVendor] = useQueryState('vendor', parseAsString.withDefault(''));
  const [riskMin, setRiskMin] = useQueryState('riskMin', parseAsInteger.withDefault(0));
  const [dateFrom, setDateFrom] = useQueryState('from', parseAsString.withDefault(''));
  const [dateTo, setDateTo] = useQueryState('to', parseAsString.withDefault(''));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // URL: /transactions?vendor=Acme&riskMin=70&from=2024-01-01&page=2

  return (
    <div>
      <input
        value={vendor}
        onChange={(e) => setVendor(e.target.value)}
        placeholder="Vendor"
      />
      <input
        type="number"
        value={riskMin}
        onChange={(e) => setRiskMin(parseInt(e.target.value))}
        placeholder="Min Risk"
      />
      <TransactionsList
        filters={{ vendor, riskMin, dateFrom, dateTo }}
        page={page}
      />
    </div>
  );
}
```

---

### 2.4 Dashboard State & Statistics

**Dashboard stats are DERIVED from transactions:**

```typescript
// hooks/useDashboardStats.ts
import { useMemo } from 'react';

export function useDashboardStats(transactions: Transaction[]) {
  return useMemo(() => {
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const flaggedCount = transactions.filter((t) => t.isFlagged).length;
    const avgRiskScore =
      transactions.reduce((sum, t) => sum + t.riskScore, 0) / totalTransactions;

    return {
      totalTransactions,
      totalAmount,
      flaggedCount,
      avgRiskScore,
      flagPercentage: ((flaggedCount / totalTransactions) * 100).toFixed(1),
    };
  }, [transactions]);
}

// Usage in component
export function Dashboard() {
  const [transactions] = useState<Transaction[]>([]); // From server

  const stats = useDashboardStats(transactions);

  return (
    <div>
      <StatCard title="Total Transactions" value={stats.totalTransactions} />
      <StatCard title="Total Amount" value={formatCurrency(stats.totalAmount)} />
      <StatCard title="Flagged" value={stats.flagPercentage + '%'} />
    </div>
  );
}
```

---

## STEP 3: DATA FLOW AUDIT

### 3.1 CSV Import → Analyze → Store → Display Flow

**1. CSV Upload (Client):**
```typescript
const file = new FormData();
file.append('file', selectedFile);
const res = await fetch('/api/import/csv', { method: 'POST', body: file });
```

**2. Parsing (Server):**
```typescript
// app/api/import/csv/route.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const text = await file.text();

  // Parse CSV
  const rows = Papa.parse(text, { header: true }).data;

  // Validate rows
  const validated = rows.filter(validateTransactionRow);

  return Response.json({ imported: validated.length });
}
```

**3. Analysis (Server or Worker):**
```typescript
// Calculate risk scores
const withRiskScores = validated.map((row) => ({
  ...row,
  riskScore: calculateTransactionRiskScore(row),
}));

// Detect anomalies
const flags = detectAnomalies(withRiskScores);
```

**4. Store to Database (Server):**
```typescript
await prisma.transaction.createMany({
  data: withRiskScores.map((row) => ({
    ...row,
    orgId: session.user.orgId,
    departmentId: resolveDepartmentId(row.department),
  })),
});
```

**5. Display to User (Client):**
```typescript
// app/import-status/page.tsx
const [importStatus, setImportStatus] = useState(null);

const handleImportClick = async () => {
  const res = await fetch('/api/import/csv', { method: 'POST', body: file });
  const { imported, errors } = await res.json();
  setImportStatus({ imported, errors });

  // Refetch transactions
  queryClient.invalidateQueries(['transactions']);
};
```

---

### 3.2 Multi-Tab Consistency

**Ensure data stays consistent across multiple browser tabs:**

Problem: User opens 2 tabs, imports data in tab 1, tab 2 shows stale data.

Solution: Use BroadcastChannel or session storage:

```typescript
// lib/sync.ts
export function useSyncAcrossTabs() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel('wastewatch-sync');

    channel.onmessage = (event) => {
      if (event.data.type === 'IMPORT_COMPLETE') {
        // Refetch in this tab
        queryClient.invalidateQueries(['transactions']);
      }
    };

    return () => channel.close();
  }, [queryClient]);
}

// When import completes in any tab:
const channel = new BroadcastChannel('wastewatch-sync');
channel.postMessage({ type: 'IMPORT_COMPLETE' });
```

---

## STEP 4: CHECKLIST

**State Architecture:**
- [ ] All filter state in URL (nuqs)
- [ ] All server data fetched on server (RSC) or React Query
- [ ] Organization scoping enforced server-side AND client-side
- [ ] Role-based access control in place
- [ ] No `useState` + `useEffect` for server data
- [ ] No duplicate state (data stored only once)
- [ ] All derived state computed with `useMemo`

**Zustand Store:**
- [ ] `lib/store/auth-store.ts` exists with user/role/permissions
- [ ] `lib/store/ui-store.ts` exists with global UI state (sidebar, toasts)
- [ ] `lib/store/org-store.ts` exists with organization context
- [ ] Stores use persistence middleware where appropriate
- [ ] No circular dependencies between stores

**URL State (nuqs):**
- [ ] Filter querystring parameters defined
- [ ] Pagination in URL
- [ ] Tab selection in URL
- [ ] Links shareable and work after refresh

**API Route Security:**
- [ ] Every GET/POST filters by `session.user.orgId`
- [ ] Role permissions checked before write operations
- [ ] No sensitive data in API responses for non-authorized roles

**Commit:**
```bash
git add .
git commit -m "refactor: comprehensive state architecture audit

- Move filter state from useState to URL (nuqs)
- Consolidate organization state in Zustand
- Remove duplicate user state (use NextAuth + Zustand)
- Compute all derived state with useMemo
- Add org filtering to all API routes
- Implement role-based access control
- Multi-tab sync with BroadcastChannel

State categories:
✓ URL: filters, pagination, tab selection
✓ Server: transactions, investigations, flags
✓ Form: CSV upload, create investigation
✓ UI: sidebar, toasts, modals
✓ Global: user, organization, permissions
✓ Derived: stats, filtered lists (useMemo)

Multi-tenant isolation: verified
RBAC enforcement: verified
"
```
