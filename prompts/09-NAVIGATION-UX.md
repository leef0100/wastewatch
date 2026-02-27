# 09-NAVIGATION-UX.md — Navigation & UX Audit (WasteWatch)

> **Audit Phase 9 of 11: Navigation, Routing, and User Experience for WasteWatch**
>
> WasteWatch is a government-grade fraud detection/waste analysis SaaS. This audit validates that all routes, navigation patterns, user flows, and UX interactions meet production standards for government clients and multi-tenant organizations. Focus on secure routing architecture, role-based navigation, investigation workflows, and accessible dashboard interactions.

---

## PREREQUISITES

Before starting this audit, ensure you have:

1. Complete app file tree (scope the routes directory)
2. WasteWatch routing architecture diagram (route groups, dynamic segments, auth boundaries)
3. Navigation component inventory (Header, Sidebar, Breadcrumbs for dashboard)
4. Critical user flows documented:
   - Trial upload → teaser → signup → onboarding → dashboard
   - Flag → investigation → FCA complaint workflow
   - Department/vendor drill-down flows
5. Browser DevTools for accessibility testing
6. Test accounts with different roles (admin, analyst, viewer)

---

## PROJECT CONTEXT

**Framework:** Next.js 16.1.6, App Router
**Routing:** Server-side auth with NextAuth 5.0.0-beta.30
**Styling:** Tailwind CSS 4 + shadcn/ui
**State Management:** Zustand 5.0.11 (client-side UI state)
**Multi-tenant:** Org-scoped routes and data access
**Dashboard:** Command Center, Departments, Vendors, Red Flags, Investigations, Reports, Settings

---

## STEP 1: ROUTING ARCHITECTURE AUDIT

### 1.1 Route Group Organization

WasteWatch uses Next.js App Router with route groups to separate public, authentication, and authenticated app flows.

**Expected WasteWatch route structure:**

```
app/
├── (marketing)/                    # Public routes
│   ├── page.tsx                    # Landing page
│   ├── trial/page.tsx              # Trial signup entry
│   ├── pricing/page.tsx            # Pricing page
│   └── layout.tsx                  # Marketing layout (no auth required)
├── (auth)/                         # Auth routes
│   ├── login/page.tsx              # Email/password login
│   ├── register/page.tsx           # Sign up page
│   ├── forgot-password/page.tsx    # Password reset
│   └── layout.tsx                  # Auth-specific layout (centered form)
├── onboarding/                     # Onboarding flow (after signup)
│   ├── layout.tsx                  # Onboarding wrapper
│   ├── page.tsx                    # Organization setup
│   ├── data-upload/page.tsx        # Initial data import
│   └── users/page.tsx              # Team member setup
├── (dashboard)/                    # Authenticated app routes
│   ├── layout.tsx                  # Dashboard layout (header + sidebar)
│   ├── page.tsx                    # /dashboard → Command Center
│   ├── departments/
│   │   ├── page.tsx                # Department list
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Department detail with spending breakdown
│   │   │   ├── vendors/page.tsx    # Vendors in this department
│   │   │   └── flags/page.tsx      # Red flags for this department
│   │   └── layout.tsx
│   ├── vendors/
│   │   ├── page.tsx                # Vendor list with analytics
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Vendor detail + spending history
│   │   │   ├── flags/page.tsx      # Flags associated with vendor
│   │   │   └── analysis/page.tsx   # Statistical breakdown
│   │   └── layout.tsx
│   ├── flags/
│   │   ├── page.tsx                # Red flags dashboard
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Flag detail view
│   │   │   ├── investigate/page.tsx # Open investigation from flag
│   │   │   └── details/page.tsx    # Full flag context
│   │   └── layout.tsx
│   ├── investigations/
│   │   ├── page.tsx                # All investigations
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Investigation detail + timeline
│   │   │   ├── edit/page.tsx       # Edit investigation
│   │   │   ├── fca-complaint/page.tsx  # Generate FCA complaint
│   │   │   └── evidence/page.tsx   # Supporting evidence
│   │   └── layout.tsx
│   ├── reports/
│   │   ├── page.tsx                # Report dashboard
│   │   ├── [id]/page.tsx           # View report
│   │   ├── create/page.tsx         # Generate new report
│   │   └── layout.tsx
│   ├── settings/
│   │   ├── page.tsx                # Settings home
│   │   ├── organization/page.tsx   # Organization settings
│   │   ├── users/page.tsx          # Team & permissions
│   │   ├── billing/page.tsx        # Subscription & payments (Whop integration)
│   │   └── audit-log/page.tsx      # Activity log
│   └── error.tsx                   # Dashboard error boundary
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── session/route.ts
│   ├── flags/
│   │   ├── route.ts                # GET /api/flags, POST create flag
│   │   └── [id]/route.ts           # GET/PATCH/DELETE specific flag
│   ├── investigations/
│   │   ├── route.ts                # GET /api/investigations, POST create
│   │   └── [id]/route.ts           # GET/PATCH/DELETE/start investigation
│   ├── departments/
│   │   ├── route.ts                # GET departments
│   │   └── [id]/route.ts           # GET department details
│   ├── vendors/
│   │   ├── route.ts                # GET vendors
│   │   └── [id]/route.ts           # GET vendor details
│   ├── analysis/
│   │   ├── statistical/route.ts    # POST statistical analysis
│   │   └── patterns/route.ts       # POST pattern detection
│   ├── reports/
│   │   ├── route.ts                # GET/POST reports
│   │   └── [id]/route.ts           # GET specific report
│   ├── billing/
│   │   └── webhook/route.ts        # Whop payment webhook
│   ├── upload/
│   │   ├── trial/route.ts          # Trial CSV upload
│   │   └── org/route.ts            # Org data import
│   └── health/route.ts             # Health check endpoint
├── layout.tsx                      # Root layout (providers, session)
├── page.tsx                        # Root page (redirect to /dashboard or landing)
├── not-found.tsx                   # Custom 404
└── error.tsx                       # Global error boundary
```

**Audit Checklist:**

- [ ] Route groups use correct naming: `(auth)`, `(marketing)`, `(dashboard)`
- [ ] Public routes under `(marketing)` group
- [ ] Auth routes under `(auth)` group with centered form layout
- [ ] Authenticated app routes under `(dashboard)` with sidebar layout
- [ ] Onboarding routes separate from dashboard (post-auth, pre-full-access)
- [ ] API routes organized by domain: `/api/flags`, `/api/investigations`, `/api/departments`, `/api/vendors`
- [ ] Each route group has appropriate `layout.tsx` with correct wrappers
- [ ] No hardcoded organization IDs in routes (multi-tenant safety)
- [ ] Dynamic routes use bracket notation: `[id]`, `[departmentId]`

**Issues to Fix:**

- [ ] Routes scattered without grouping → Reorganize into groups
- [ ] Same layout applied to public + auth pages → Create separate layouts per group
- [ ] API routes not organized by domain → Group related endpoints

---

### 1.2 Layout Hierarchy and Nesting

WasteWatch dashboard must maintain proper layout nesting for navigation state persistence and role-based UI rendering.

**Root layout hierarchy:**

```
Root layout (app/layout.tsx)
├── Providers (SessionProvider, Zustand stores, Tailwind)
│
├── (marketing) layout
│   ├── Header (marketing nav)
│   └── Marketing page content
│
├── (auth) layout
│   ├── Centered form container
│   └── Login/Register page
│
├── onboarding layout
│   ├── Step tracker
│   └── Onboarding page
│
└── (dashboard) layout
    ├── Header (with org selector, user menu)
    ├── Sidebar (navigation + command center)
    └── Dashboard page content
```

**Audit Checklist:**

- [ ] Root layout includes:
  - SessionProvider (NextAuth)
  - Zustand store providers
  - Theme provider (Tailwind)
  - Toast/notification provider
  - Error boundary
- [ ] Marketing layout has minimal header, no auth checks
- [ ] Auth layout centers form, redirects authenticated users to dashboard
- [ ] Dashboard layout enforces authentication (via middleware or component-level check)
- [ ] Dashboard layout renders Sidebar + Header persistent across all dashboard routes
- [ ] Role-based sidebar content (admin sees all, viewer sees limited options)
- [ ] No data fetching in layouts (fetch in pages/route handlers)
- [ ] Org context available throughout dashboard (for multi-tenant scoping)

**Code Example: Root Layout**

```typescript
// app/layout.tsx
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { getSession } from '@/lib/auth';
import './globals.css';

export const metadata = {
  title: 'WasteWatch - Government Fraud Detection',
  description: 'Statistical forensics for waste analysis',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

### 1.3 Middleware and Auth Boundaries

Middleware handles routing decisions before pages render, protecting dashboard from unauthenticated access.

**Code Example: Auth Middleware**

```typescript
// middleware.ts (root of project)
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/', '/trial', '/pricing', '/login', '/register'];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  if (isPublic) {
    return NextResponse.next();
  }

  // Check authentication
  const session = await auth();

  if (!session) {
    // Redirect to login with returnUrl
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (pathname.startsWith('/settings/billing') || pathname.startsWith('/settings/users')) {
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Audit Checklist:**

- [ ] Middleware protects `/dashboard/**` and other private routes
- [ ] Unauthenticated access redirects to `/login` with `returnUrl` param
- [ ] Role-based routes checked in middleware (admin, analyst, viewer)
- [ ] Public routes bypass middleware (performance)
- [ ] Middleware does NOT perform heavy computation
- [ ] API routes have separate auth logic (middleware doesn't protect them)
- [ ] Session object includes user role and organization ID

---

## STEP 2: CRITICAL USER FLOWS

### 2.1 Trial Upload → Signup → Onboarding → Dashboard

Document the complete new user journey:

```
1. User lands on / (landing page)
   ↓
2. Clicks "Start Trial" → /trial
   ↓
3. Uploads CSV file (fraud detection teaser)
   ↓
4. Sees results preview + "Sign up to continue"
   ↓
5. Redirects to /register with CSV analysis context
   ↓
6. Creates account + organization
   ↓
7. Redirects to /onboarding/page.tsx
   ├── Step 1: Organization setup
   ├── Step 2: Data upload (full dataset)
   ├── Step 3: Team members
   └── Step 4: Review + activate
   ↓
8. Completes onboarding → Redirects to /dashboard (Command Center)
```

**Audit Checklist:**

- [ ] `/trial` upload accepts CSV, displays statistical analysis
- [ ] Trial results include "fraud scores" without requiring full auth
- [ ] Trial upload stored in temporary session (cleared after signup or 24h)
- [ ] Signup form (`/register`) pre-fills organization name from trial
- [ ] Onboarding routes enforce sequential steps (can't skip to step 3)
- [ ] Onboarding progress persists (user can close and resume)
- [ ] Completion triggers org activation + first data import
- [ ] First login after onboarding shows Command Center (not blank dashboard)

---

### 2.2 Investigation Workflow: Flag → Investigation → FCA Complaint

```
1. User views Red Flags dashboard (/flags)
   ↓
2. Clicks flag detail → /flags/[flagId]
   ├── Shows:
   │   - Statistical anomaly data
   │   - Affected transactions
   │   - Affected vendors/departments
   │   - Severity score + risk factors
   └── Action: "Open Investigation"
   ↓
3. Creates investigation → /investigations/[investigationId]
   ├── Investigation form with:
   │   - Title, description
   │   - Assigned analyst
   │   - Related flags (multi-select)
   │   - Evidence section (upload files)
   └── Action: "Save as Draft" or "Start Investigation"
   ↓
4. On investigation page, can:
   ├── Add timeline entries
   ├── Link transactions/vendors
   ├── Upload supporting evidence (XLSX, PDF)
   ├── Add investigator notes (audit-logged)
   └── Generate FCA complaint report
   ↓
5. Analyst clicks "Generate FCA Complaint" → /investigations/[id]/fca-complaint
   ├── Complaint form with:
   │   - Government agency selection
   │   - Complaint summary (auto-filled from investigation)
   │   - Fraud classification
   │   - Estimated recovery amount
   │   - Supporting evidence links
   └── Action: "Preview" or "Submit"
   ↓
6. Generates PDF/XLSX complaint file, shows submission confirmation
```

**Audit Checklist:**

- [ ] Flag detail shows all relevant data without investigation
- [ ] Investigation creation links back to source flag (backlinks)
- [ ] Investigations list filters by status (draft, active, closed)
- [ ] Investigation page shows timeline of all activity (Zustand store + API)
- [ ] Evidence upload is restricted to admin/analyst roles
- [ ] FCA complaint generator uses investigation data to pre-fill form
- [ ] Complaint export supports PDF + XLSX formats (jsPDF + XLSX libraries)
- [ ] All investigation actions are audit-logged (who changed what, when)

---

### 2.3 Department & Vendor Drill-Down

```
/departments
├── Department list with:
│   ├── Spending trend chart
│   ├── Red flag count
│   ├── Top vendors
│   └── Fraud risk score
└── Click row → /departments/[id]
    ├── Spending breakdown by category
    ├── Top vendors in department (sortable)
    ├── Red flags affecting department (link to /flags)
    ├── Historical analysis
    └── Department settings (if admin)

/vendors
├── Vendor list with:
│   ├── Total spend
│   ├── Transaction count
│   ├── Flag count
│   └── Risk score
└── Click row → /vendors/[id]
    ├── Vendor profile (contact, registration)
    ├── Spending history (Recharts)
    ├── All transactions (paginated table)
    ├── Red flags involving vendor (link to /flags)
    ├── Competitors/similar vendors (pattern analysis)
    └── Vendor settings (if admin)
```

**Audit Checklist:**

- [ ] Department list is paginated (if > 50 departments)
- [ ] Vendor list is paginated (if > 100 vendors)
- [ ] Drill-down preserves breadcrumb trail: `Vendors > [Vendor Name] > Flags`
- [ ] Charts are interactive (zoom, hover for details)
- [ ] All tables are sortable (by amount, count, date, etc.)
- [ ] Filters are URL-searchable: `/vendors?status=flagged&sort=spend-desc`
- [ ] Back button works correctly (browser history)

---

## STEP 3: NAVIGATION COMPONENTS

### 3.1 Header Component

**Location:** `components/layout/header.tsx`
**Responsibilities:**
- Logo + branding
- User menu (profile, settings, logout)
- Organization selector (multi-tenant switcher)
- Notifications indicator
- Search bar (optional, for finding vendors/flags)

```typescript
// components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { ChevronDown, LogOut, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="text-xl font-bold text-gray-900">WasteWatch</span>
        </Link>

        {/* Center: Organization info */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Org: <span className="font-medium">{session.user.org?.name}</span>
          </div>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src={session.user.image || '/avatar-placeholder.png'}
                alt={session.user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:inline text-sm font-medium">{session.user.name}</span>
              <ChevronDown size={16} className={cn('transition-transform', menuOpen && 'rotate-180')} />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1">
                <button
                  onClick={() => {
                    router.push('/settings');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings size={16} /> Settings
                </button>
                <button
                  onClick={() => {
                    signOut({ redirect: true, redirectUrl: '/' });
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

### 3.2 Sidebar Navigation

**Location:** `components/layout/sidebar.tsx`
**Responsibilities:**
- Main navigation menu
- Role-based visibility (admin, analyst, viewer)
- Active route highlighting
- Collapsible sections (for analysts vs viewers)

```typescript
// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  AlertTriangle,
  Search,
  FileText,
  Users,
  Settings,
  Building2,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Command Center',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Red Flags',
    href: '/dashboard/flags',
    icon: AlertTriangle,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Investigations',
    href: '/dashboard/investigations',
    icon: Search,
    roles: ['admin', 'analyst'],
  },
  {
    label: 'Departments',
    href: '/dashboard/departments',
    icon: Building2,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Vendors',
    href: '/dashboard/vendors',
    icon: TrendingUp,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!session) return null;

  const filteredItems = navItems.filter(item =>
    item.roles.includes(session.user.role)
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static left-0 top-16 h-[calc(100vh-64px)] lg:h-auto bg-gray-50 border-r border-gray-200 z-30 transition-all duration-300',
          collapsed ? 'w-0 lg:w-64 overflow-hidden' : 'w-64'
        )}
      >
        <nav className="p-4 space-y-2 overflow-y-auto">
          {filteredItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
```

---

### 3.3 Breadcrumbs for Nested Views

**Location:** `components/breadcrumbs.tsx`
**Used in:** Department detail, vendor detail, investigation detail pages

```typescript
// components/breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumbs">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-blue-600">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

---

## STEP 4: ROLE-BASED NAVIGATION

WasteWatch has three roles with different permissions:

| Role | Permissions | Visible Routes |
|------|-------------|-----------------|
| **admin** | Full access, user mgmt, billing, settings | All routes |
| **analyst** | View all data, create investigations, generate complaints | Command Center, Flags, Investigations, Departments, Vendors, Reports |
| **viewer** | Read-only access to dashboards and reports | Command Center, Flags, Departments, Vendors, Reports (read-only) |

**Audit Checklist:**

- [ ] Sidebar items filtered by `session.user.role`
- [ ] Settings/Admin pages show 403 error for non-admins (or redirect)
- [ ] Investigation creation limited to analysts + admins
- [ ] FCA complaint generation limited to analysts + admins
- [ ] Viewer role shows read-only UI (no edit buttons)
- [ ] Data tables hide delete/edit columns for viewers
- [ ] Settings routes protected by middleware + component-level checks

---

## STEP 5: DEEP LINKING & QUERY PARAMETERS

WasteWatch should support deep linking for specific analytical views.

**Supported deep links:**

```
/dashboard/flags?status=high-risk&sort=date-desc&page=1
/dashboard/vendors?department=engineering&risk-score=8-10&sort=spend
/dashboard/departments/[id]/flags?severity=critical
/dashboard/investigations?status=draft&assigned-to=me
```

**Audit Checklist:**

- [ ] Filter state persists in URL (not just local state)
- [ ] Sharing URL with filters reproduces exact view
- [ ] Pagination persists in URL (`?page=2`)
- [ ] Sort order in URL (`?sort=spend-desc`)
- [ ] Filters are validated (malicious params don't crash app)

---

## STEP 6: MOBILE RESPONSIVE NAVIGATION

Government clients may use tablets for field investigations.

**Audit Checklist:**

- [ ] Sidebar collapses on mobile (hamburger menu)
- [ ] Header is touch-friendly (min 44px touch targets)
- [ ] Tables scroll horizontally on mobile (don't reflow)
- [ ] Breadcrumbs stack on mobile
- [ ] Dialog/modals work on mobile (full-screen on small devices)
- [ ] Touch interactions (click, not hover)

---

## VERIFICATION CHECKLIST

- [ ] Navigate through trial → signup → onboarding → dashboard without errors
- [ ] All role-based routes work correctly for admin/analyst/viewer
- [ ] Sidebar updates on navigation
- [ ] Breadcrumbs show correct hierarchy
- [ ] Deep links (with filters) work as expected
- [ ] Mobile navigation collapses and reopens smoothly
- [ ] No console errors during navigation
- [ ] Keyboard navigation works (Tab through links)
