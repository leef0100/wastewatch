# 01-DESIGN-SYSTEM.md — WasteWatch Design System & UI Audit

> **Design System Audit for WasteWatch: Government-Grade Fraud Detection SaaS**
>
> Next.js 16.1.6 (App Router) | React 19.2.3 | TypeScript strict | Tailwind CSS 4 | shadcn/ui | Recharts 3.7.0 | D3 7.9.0

This audit ensures WasteWatch has a consistent, authoritative, and accessible design system matching government and financial sector standards. Every color, component, and layout must reflect a professional fraud-detection platform.

---

## STEP 1: DESIGN TOKEN AUDIT

### 1.1 Government-Grade Color Tokens

**Goal:** Semantic color tokens following USWDS-inspired patterns with authority and severity coding. All colors support dark mode and meet WCAG AA contrast ratios (4.5:1 for body text, 3:1 for graphics).

**Context:** WasteWatch detects fraud and waste in government spending. Colors must communicate:
- Trust and authority (dark blues, grays)
- Risk severity (red=critical, amber=warning, blue=info)
- Data integrity and accuracy

**Required Semantic Colors:**

1. **Primary** — Main actions, navigation, active state
   - Dark navy blue (#003A70 light, #5BA3D0 dark) — Government authority
   - Foreground: white (light) / dark navy (dark)

2. **Secondary** — Alternative actions, secondary navigation
   - Steel blue (#1976D2) — Professional, analytical
   - Foreground: white

3. **Severity-Critical** — Fraud alerts, critical anomalies
   - Red (#DC2626) — High-urgency red flags
   - Foreground: white

4. **Severity-Warning** — Suspicious patterns, anomalies to review
   - Amber (#F59E0B) — Caution, needs investigation
   - Foreground: #000 / #1F2937

5. **Severity-Info** — Normal transactions, background info
   - Blue (#3B82F6) — Informational
   - Foreground: white / text-foreground

6. **Severity-Success** — Compliant transactions, cleared flags
   - Green (#10B981) — Approved, safe
   - Foreground: white

7. **Muted** — Disabled states, secondary labels, inactive elements
   - Gray (#9CA3AF) — Neutral, de-emphasized
   - Foreground: #6B7280 (light) / #D1D5DB (dark)

8. **Background** — Page and card backgrounds
   - Light: #FFFFFF
   - Dark: #0F172A (slate-900)

9. **Foreground** — Body text
   - Light: #1F2937 (gray-800)
   - Dark: #E2E8F0 (slate-200)

10. **Card** — Card and container backgrounds
    - Light: #F9FAFB (gray-50)
    - Dark: #1E293B (slate-800)

11. **Border** — All borders and dividers
    - Light: #E5E7EB (gray-200)
    - Dark: #334155 (slate-700)

12. **Risk Score Severity Gradient** (4-level risk model)
    - **Level 1 (Low):** #10B981 (green)
    - **Level 2 (Medium):** #F59E0B (amber)
    - **Level 3 (High):** #EF4444 (red)
    - **Level 4 (Critical):** #7C2D12 (red-900 / dark red)

**Tailwind Config Example:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary (Government Navy)
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          fg: 'hsl(var(--color-primary-fg) / <alpha-value>)',
        },
        // Secondary (Steel Blue)
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          fg: 'hsl(var(--color-secondary-fg) / <alpha-value>)',
        },
        // Severity levels
        critical: {
          DEFAULT: 'hsl(var(--color-critical) / <alpha-value>)',
          fg: 'hsl(var(--color-critical-fg) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning) / <alpha-value>)',
          fg: 'hsl(var(--color-warning-fg) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info) / <alpha-value>)',
          fg: 'hsl(var(--color-info-fg) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success) / <alpha-value>)',
          fg: 'hsl(var(--color-success-fg) / <alpha-value>)',
        },
        // Standard semantic
        muted: {
          DEFAULT: 'hsl(var(--color-muted) / <alpha-value>)',
          fg: 'hsl(var(--color-muted-fg) / <alpha-value>)',
        },
        background: 'hsl(var(--color-bg) / <alpha-value>)',
        foreground: 'hsl(var(--color-fg) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--color-card) / <alpha-value>)',
          fg: 'hsl(var(--color-card-fg) / <alpha-value>)',
        },
        border: 'hsl(var(--color-border) / <alpha-value>)',
        ring: 'hsl(var(--color-ring) / <alpha-value>)',
      },
    },
  },
}

export default config
```

**CSS Custom Properties (app/globals.css):**

```css
@layer base {
  :root {
    /* Light Mode (Default) */
    --color-primary: 210 97% 22%; /* #003A70 - Dark Navy */
    --color-primary-fg: 0 0% 100%; /* White */
    --color-secondary: 215 93% 53%; /* #1976D2 - Steel Blue */
    --color-secondary-fg: 0 0% 100%;
    --color-critical: 0 84% 60%; /* #DC2626 - Red */
    --color-critical-fg: 0 0% 100%;
    --color-warning: 37 92% 50%; /* #F59E0B - Amber */
    --color-warning-fg: 0 0% 0%; /* Black on amber */
    --color-info: 217 91% 60%; /* #3B82F6 - Blue */
    --color-info-fg: 0 0% 100%;
    --color-success: 160 84% 39%; /* #10B981 - Green */
    --color-success-fg: 0 0% 100%;
    --color-muted: 220 13% 91%; /* #E2E8F0 */
    --color-muted-fg: 220 13% 40%;
    --color-bg: 0 0% 100%; /* White */
    --color-fg: 220 13% 13%; /* #1F2937 - Dark Gray */
    --color-card: 220 13% 98%; /* #F9FAFB - Light Gray */
    --color-card-fg: 220 13% 13%;
    --color-border: 220 13% 90%; /* #E5E7EB */
    --color-ring: 210 97% 22%; /* Primary (Navy) */
  }

  @media (prefers-color-scheme: dark) {
    :root {
      /* Dark Mode */
      --color-primary: 204 76% 52%; /* #5BA3D0 - Light Navy */
      --color-primary-fg: 220 13% 13%;
      --color-secondary: 215 93% 60%; /* Lighter steel blue */
      --color-secondary-fg: 220 13% 13%;
      --color-critical: 0 85% 60%;
      --color-critical-fg: 220 13% 13%;
      --color-warning: 37 92% 55%;
      --color-warning-fg: 220 13% 13%;
      --color-info: 217 91% 65%;
      --color-info-fg: 220 13% 13%;
      --color-success: 160 84% 45%;
      --color-success-fg: 220 13% 13%;
      --color-muted: 220 13% 23%; /* #334155 */
      --color-muted-fg: 220 13% 80%;
      --color-bg: 220 13% 8%; /* #0F172A - Slate-900 */
      --color-fg: 220 13% 91%; /* #E2E8F0 */
      --color-card: 220 13% 13%; /* #1E293B - Slate-800 */
      --color-card-fg: 220 13% 91%;
      --color-border: 220 13% 25%; /* #334155 */
      --color-ring: 204 76% 52%;

      color-scheme: dark;
    }
  }
}
```

**Contrast Ratio Verification Checklist:**

- [ ] Primary (navy) on white: ≥ 7:1 (excellent for body text)
- [ ] Secondary (steel blue) on white: ≥ 4.5:1
- [ ] Critical (red) on white: ≥ 4.5:1
- [ ] Warning (amber) on white: ≥ 4.5:1
- [ ] Foreground text on background: ≥ 4.5:1
- [ ] Border on background: ≥ 3:1
- [ ] Ring (focus) clearly visible: ≥ 3:1
- [ ] Dark mode colors tested for visibility

**Risk Score Color Coding:**

```typescript
// lib/colorByRisk.ts
export const riskColorMap = {
  LOW: 'text-success bg-success/10', // Green
  MEDIUM: 'text-warning bg-warning/10', // Amber
  HIGH: 'text-critical bg-critical/10', // Red
  CRITICAL: 'text-[#7C2D12] bg-red-950/20', // Dark Red
} as const

export function getRiskColor(riskLevel: number): string {
  if (riskLevel <= 1) return riskColorMap.LOW
  if (riskLevel <= 2) return riskColorMap.MEDIUM
  if (riskLevel <= 3) return riskColorMap.HIGH
  return riskColorMap.CRITICAL
}
```

**Audit Instructions:**

1. Search codebase for hardcoded hex colors:
   ```bash
   grep -r "#[0-9a-fA-F]\{6\}" app/ components/ --include="*.ts" --include="*.tsx"
   grep -r "rgb(" app/ components/ --include="*.ts" --include="*.tsx"
   ```

2. For each result: Map to semantic token in Tailwind config

3. Verify token values in browser DevTools color picker

4. Test contrast: Use WebAIM Contrast Checker for all severity colors

5. Test dark mode: Toggle `prefers-color-scheme: dark` and verify readability

6. Verify risk score colors map correctly across all data visualizations (Recharts, D3)

---

### 1.2 Spacing Tokens

**Goal:** Consistent 4px-based spacing for a professional, grid-aligned layout. All margin, padding, and gap values are tokens.

**Spacing Scale:**

```
0   = 0px
0.5 = 2px
1   = 4px
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
8   = 32px
10  = 40px
12  = 48px
16  = 64px
```

**Common Patterns for WasteWatch:**

| Token | Use Case | Example |
|---|---|---|
| `p-2` | Badge padding, small controls | `<span className="px-2 py-1">` |
| `p-3` | Button padding (compact) | `<button className="px-3 py-2">` |
| `p-4` | Card padding, input container | `<div className="p-4">` |
| `p-6` | Section/modal padding | `<section className="p-6">` |
| `gap-2` | Input label + field spacing | `<div className="flex gap-2">` |
| `gap-3` | Stat card grid spacing | `<div className="grid gap-3">` |
| `gap-4` | Vendor/transaction table rows | `<div className="gap-4">` |
| `gap-6` | Main section spacing | `<div className="flex flex-col gap-6">` |
| `mb-4` | Heading spacing | `<h2 className="mb-4">` |
| `mb-8` | Section separator | `<section className="mb-8">` |

**Dashboard Layout Pattern:**

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-64 border-r border-border bg-card">
        {/* Sidebar navigation */}
      </aside>
      <main className="flex-1">
        <header className="border-b border-border bg-card">
          {/* Top navigation bar */}
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

**Stat Card Grid (Common Pattern):**

```typescript
// components/StatGrid.tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard icon={AlertCircle} label="Critical Flags" value={42} />
  <StatCard icon={TrendingUp} label="Avg Risk Score" value={7.2} />
  <StatCard icon={DollarSign} label="Potential Savings" value="$2.4M" />
  <StatCard icon={Users} label="Vendors Flagged" value={127} />
</div>
```

**Audit Checklist:**

- [ ] All padding uses tokens: p-2, p-4, p-6, etc. (no hardcoded px-[])
- [ ] All margin uses tokens: m-2, m-4, etc.
- [ ] All gaps use tokens: gap-2, gap-4, etc.
- [ ] Container max-width: max-w-7xl consistent across pages
- [ ] Section spacing: gap-6 or mb-8 between major sections
- [ ] Card padding: p-4 for data cards, p-6 for modals
- [ ] Button padding: px-3 py-2 for compact, px-4 py-2 for standard
- [ ] Table row spacing: gap-4 or py-3 between rows
- [ ] Responsive padding: px-4 sm:px-6 lg:px-8

**Spacing Audit Command:**

```bash
grep -r "px-\[" app/ components/ --include="*.ts" --include="*.tsx"
grep -r "py-\[" app/ components/ --include="*.ts" --include="*.tsx"
grep -r "p-\[" app/ components/ --include="*.ts" --include="*.tsx"
grep -r "m-\[" app/ components/ --include="*.ts" --include="*.tsx"
grep -r "gap-\[" app/ components/ --include="*.ts" --include="*.tsx"
```

---

### 1.3 Typography Tokens

**Goal:** Professional, readable type scale with government-grade authority. Fonts loaded via `next/font` with no FOUT (Flash of Unstyled Text).

**Font Family Configuration:**

```typescript
// app/layout.tsx
import { Inter, IBM_Plex_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

**Type Scale:**

| Size | Use Case | Example |
|---|---|---|
| `text-xs` | Timestamps, badge labels, captions | `<span className="text-xs text-muted-fg">Jan 15, 2024</span>` |
| `text-sm` | Helper text, labels, secondary info | `<label className="text-sm font-medium">Transaction ID</label>` |
| `text-base` | Body text, table cells, input fields | `<p className="text-base">Lorem ipsum...</p>` |
| `text-lg` | Card titles, secondary headings | `<h3 className="text-lg font-semibold">Suspicious Vendor</h3>` |
| `text-xl` | Section headings | `<h2 className="text-xl font-semibold">Department Analysis</h2>` |
| `text-2xl` | Page titles | `<h1 className="text-2xl font-bold">Dashboard</h1>` |
| `text-3xl` | Major section headers | `<h1 className="text-3xl font-bold">Fraud Alerts</h1>` |

**Font Weight Usage:**

- **400 (normal):** Body text, table content, long-form data
- **500 (medium):** Labels, secondary headings, metadata
- **600 (semibold):** Card titles, stat values, emphasis
- **700 (bold):** Page titles, critical alerts, strong emphasis

**Responsive Typography for Dashboards:**

```typescript
// Page heading (scales on mobile)
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Fraud Detection Dashboard
</h1>

// Stat value (important for readability)
<div className="text-xl sm:text-2xl font-bold text-primary">
  42
</div>

// Card subtitle
<p className="text-sm text-muted-fg">
  {transactions.length} transactions analyzed
</p>
```

**Audit Checklist:**

- [ ] All fonts loaded via `next/font` with `display: 'swap'`
- [ ] No hardcoded font sizes: search for `text-[` — should be 0 results
- [ ] Heading hierarchy correct: h1 → h2 → h3 (no skipping)
- [ ] Body text minimum `text-sm` (never smaller)
- [ ] All headings use `font-semibold` or `font-bold`
- [ ] Line length readable on desktop (45-75 characters)
- [ ] Responsive scaling tested on mobile (375px viewport)
- [ ] Mono font used only for: code blocks, transaction IDs, account numbers
- [ ] No font-family in component styles (classes only)

---

### 1.4 Border Radius Tokens

**Goal:** Consistent, professional rounding. Most components use DEFAULT (8px), modals use `rounded-lg`.

**Scale:**

```typescript
// tailwind.config.ts
borderRadius: {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',      // 4px
  DEFAULT: 'var(--radius)',               // 8px
  md: 'calc(var(--radius) + 2px)',       // 10px
  lg: 'calc(var(--radius) + 4px)',       // 12px
  full: '9999px',
}
```

**CSS Variable:**

```css
@layer base {
  :root {
    --radius: 8px; /* Government/professional default */
  }
}
```

**Usage Pattern:**

| Token | Use Case | Example |
|---|---|---|
| `rounded-none` | Hard edges (borders, tables) | `<div className="rounded-none border">` |
| `rounded-sm` | Input fields | `<input className="rounded-sm border" />` |
| `rounded` | Buttons, cards, badges | `<button className="rounded">`, `<div className="rounded bg-card">` |
| `rounded-md` | Larger cards, alerts | `<div className="rounded-md bg-card">` |
| `rounded-lg` | Modals, dialogs, popovers | `<div className="rounded-lg bg-card shadow-lg">` |
| `rounded-full` | Avatars, badge pills | `<img className="rounded-full" />` |

**Component Examples:**

```typescript
// Data card (standard)
<div className="rounded bg-card p-4 shadow">
  <h3 className="font-semibold">Top Vendors by Risk</h3>
</div>

// Button (primary)
<button className="rounded bg-primary px-4 py-2 text-primary-fg">
  Approve Transaction
</button>

// Alert/badge (warning)
<div className="rounded-md border border-warning bg-warning/10 p-3">
  <p className="text-warning-fg font-semibold">Anomaly Detected</p>
</div>

// Modal (prominent)
<div className="rounded-lg bg-card p-6 shadow-lg">
  <h2 className="text-2xl font-bold">Flag Transaction?</h2>
</div>

// Avatar
<img src="..." alt="User" className="h-10 w-10 rounded-full" />
```

**Audit Checklist:**

- [ ] No hardcoded `border-radius` in styles
- [ ] All rounded corners use semantic tokens
- [ ] Buttons use `rounded` (DEFAULT)
- [ ] Cards use `rounded` (DEFAULT)
- [ ] Inputs use `rounded-sm`
- [ ] Modals use `rounded-lg`
- [ ] Avatars use `rounded-full`
- [ ] CSS variable `--radius` defined

---

### 1.5 Shadow Tokens

**Goal:** Subtle elevation and depth. Standard shadow for cards, stronger shadow for modals/popovers.

**Configuration:**

```typescript
// tailwind.config.ts
boxShadow: {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}
```

**Dark Mode Shadow Boost (optional):**

```css
@media (prefers-color-scheme: dark) {
  :root {
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
}
```

**Usage:**

| Shadow | Use Case | Example |
|---|---|---|
| `shadow-sm` | Hovered elements, subtle elevation | `<div className="shadow-sm">` |
| `shadow` | Standard cards, default elevation | `<div className="rounded bg-card shadow">` |
| `shadow-md` | Featured cards, data tables | `<div className="shadow-md">` |
| `shadow-lg` | Modals, dropdowns, overlays | `<div className="shadow-lg">` |

**Component Examples:**

```typescript
// Data card with hover effect
<div className="rounded bg-card p-4 shadow transition-shadow hover:shadow-md">
  Transaction details
</div>

// Modal
<div className="rounded-lg bg-card p-6 shadow-lg">
  Modal content
</div>

// Data table row (optional subtle shadow)
<tr className="border-b border-border hover:bg-muted/30 shadow-sm">
  {/* Row cells */}
</tr>
```

**Audit Checklist:**

- [ ] No hardcoded `box-shadow` in styles
- [ ] All shadows use tokens
- [ ] Cards use `shadow` by default
- [ ] Modals use `shadow-lg`
- [ ] Shadows tested in dark mode
- [ ] Shadow transitions smooth (150-200ms)

---

### 1.6 Animation Tokens

**Goal:** Smooth, purposeful transitions. Respect `prefers-reduced-motion`. Durations ≤ 200ms for micro-interactions.

**Configuration:**

```typescript
// tailwind.config.ts
transitionDuration: {
  DEFAULT: '150ms',
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
}

transitionTimingFunction: {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
}

animation: {
  spin: 'spin 1s linear infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

**Micro-Interaction Guide:**

| Interaction | Duration | Easing |
|---|---|---|
| Hover (button, card) | 150ms | ease-out |
| Focus ring | 100ms | ease-out |
| Dropdown open/close | 150-200ms | ease-out |
| Alert/toast appear | 100ms | ease-out |
| Loading spinner | infinite | linear |

**Examples:**

```typescript
// Button hover
<button className="transition-all duration-150 hover:bg-primary/90 hover:shadow-md">
  Click me
</button>

// Focus ring (accessibility critical)
<input className="transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-ring" />

// Loading state
<div className="animate-spin">
  <Loader2 className="h-4 w-4" />
</div>

// Alert that appears
<div className="animate-in fade-in duration-200">
  Anomaly detected
</div>
```

**Prefers-Reduced-Motion (CSS-only, recommended):**

```css
/* In app/globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Audit Checklist:**

- [ ] All transitions use duration tokens (duration-150, duration-200)
- [ ] Micro-interactions ≤ 300ms
- [ ] No hardcoded `transition-duration` values
- [ ] Easing uses standard curves (ease-in, ease-out, ease-in-out)
- [ ] Loading spinners use `animate-spin`
- [ ] All animations respect `prefers-reduced-motion: reduce`
- [ ] Hover states smooth (not instant)

---

## STEP 2: COMPONENT LIBRARY AUDIT

Every shared UI component must be production-ready, fully typed (no `any`), support all required states, and be accessible.

### 2.1 Core Components Checklist

**Data Display Components:**
- [ ] `StatCard` — Risk score cards, metric displays
- [ ] `RiskBadge` — 4-level risk color coding
- [ ] `TransactionTable` — Paginated transaction list
- [ ] `TopVendorsTable` — Vendor ranking by risk score
- [ ] `FlagsTimeline` — Recent anomalies/flags chronologically

**Input/Control Components:**
- [ ] `Button` (primary, secondary, ghost, destructive variants)
- [ ] `Input` with label and error state
- [ ] `Select` (dropdown for departments, vendors)
- [ ] `DatePicker` for time-range filtering
- [ ] `SearchInput` for transaction/vendor search

**Visualization Components:**
- [ ] `RechartsWrapper` — Standard chart container (Benford's Law charts)
- [ ] `D3RiskGauge` — Risk score gauge visualization
- [ ] `TransactionTrendChart` — Time-series line chart
- [ ] `VendorRiskMatrix` — Scatter plot (vendor count vs avg risk)

**Layout Components:**
- [ ] `DashboardHeader` — Page title + filter/action controls
- [ ] `SidebarNav` — Role-based navigation
- [ ] `DataCard` — Standard card container
- [ ] `AlertBanner` — Warning/critical alerts

**Modal/Overlay Components:**
- [ ] `ConfirmDialog` — Flag transaction, clear flag
- [ ] `DetailModal` — Transaction/vendor details
- [ ] `FilterPanel` — Advanced filtering sidebar

### 2.2 StatCard Component (WasteWatch-Specific)

**Purpose:** Display risk metrics, counts, and summary statistics on dashboard.

**Requirements:**
- Icon support (leading icon)
- Label and value (or secondary value for trends)
- Optional trend indicator (↑ ↓)
- Risk color coding (optional)
- Loading state

**Implementation Example:**

```typescript
// components/StatCard.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  secondaryValue?: string
  trend?: 'up' | 'down' | 'stable'
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  isLoading?: boolean
  className?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({
    icon,
    label,
    value,
    secondaryValue,
    trend,
    riskLevel,
    isLoading,
    className,
  }, ref) => {
    const riskColorMap = {
      low: 'text-success',
      medium: 'text-warning',
      high: 'text-critical',
      critical: 'text-red-900',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded bg-card p-4 shadow transition-shadow hover:shadow-md',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-muted-fg">{icon}</div>
            <div>
              <p className="text-sm font-medium text-muted-fg">{label}</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  riskLevel && riskColorMap[riskLevel]
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  value
                )}
              </p>
              {secondaryValue && (
                <p className="text-xs text-muted-fg mt-1">{secondaryValue}</p>
              )}
            </div>
          </div>
          {trend && (
            <span className={cn(
              'text-lg',
              trend === 'up' && 'text-critical',
              trend === 'down' && 'text-success',
              trend === 'stable' && 'text-muted-fg'
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'stable' && '→'}
            </span>
          )}
        </div>
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
```

**Audit Checklist:**

- [ ] StatCard displays icon, label, and value
- [ ] Risk color coding works (low=green, medium=amber, high=red, critical=dark red)
- [ ] Loading state shows spinner
- [ ] Hover state changes shadow
- [ ] All props are typed (no `any`)
- [ ] forwardRef properly implemented
- [ ] displayName set

### 2.3 RiskBadge Component

**Purpose:** Small, inline risk level indicator for tables, list items.

**Implementation Example:**

```typescript
// components/RiskBadge.tsx
import { cn } from '@/lib/utils'

interface RiskBadgeProps {
  level: number | 'low' | 'medium' | 'high' | 'critical'
  size?: 'sm' | 'md'
}

const riskLevelMap = {
  low: { label: 'Low', color: 'bg-success/10 text-success' },
  medium: { label: 'Medium', color: 'bg-warning/10 text-warning' },
  high: { label: 'High', color: 'bg-critical/10 text-critical' },
  critical: { label: 'Critical', color: 'bg-red-950/20 text-red-700 dark:text-red-400' },
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  let levelKey: keyof typeof riskLevelMap = 'low'
  if (typeof level === 'number') {
    if (level <= 1) levelKey = 'low'
    else if (level <= 2) levelKey = 'medium'
    else if (level <= 3) levelKey = 'high'
    else levelKey = 'critical'
  } else {
    levelKey = level
  }

  const { label, color } = riskLevelMap[levelKey]

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' && 'px-2 py-1 text-xs',
      size === 'md' && 'px-3 py-1.5 text-sm',
      color
    )}>
      {label}
    </span>
  )
}
```

**Audit Checklist:**

- [ ] Renders correct color for each risk level
- [ ] Size variants (sm, md) work
- [ ] Supports both numeric (1-4) and string ('low', 'medium', etc.) levels
- [ ] Accessible text contrast

---

## STEP 3: DATA VISUALIZATION AUDIT

WasteWatch uses Recharts 3.7.0 for statistical charts and D3 7.9.0 for advanced visualizations.

### 3.1 Recharts Color Theming

**Benford's Law Chart Example:**

```typescript
// components/BenfordsLawChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CHART_COLORS = {
  observed: '#3B82F6', // info blue
  expected: '#10B981', // success green
  anomaly: '#DC2626', // critical red
}

export function BenfordsLawChart({ data }) {
  return (
    <div className="rounded bg-card p-4 shadow">
      <h3 className="mb-4 font-semibold">Benford's Law Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="digit" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: `1px solid var(--color-border)`,
            }}
          />
          <Legend />
          <Bar dataKey="observed" fill={CHART_COLORS.observed} />
          <Bar dataKey="expected" fill={CHART_COLORS.expected} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Audit Checklist:**

- [ ] Chart colors use semantic tokens (not hardcoded hex)
- [ ] Responsive container fills parent width
- [ ] Tooltip uses card background color
- [ ] Loading state shows spinner
- [ ] Empty state displays message
- [ ] Axes labeled clearly
- [ ] Legend uses semantic colors

### 3.2 D3 Risk Gauge Example

```typescript
// components/RiskGauge.tsx
import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

export function RiskGauge({ riskScore }: { riskScore: number }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = 200
    const height = 200
    const radius = Math.min(width, height) / 2
    const value = Math.max(0, Math.min(riskScore, 10)) // 0-10 scale

    // Color scale (low to critical)
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 3.33, 6.66, 10])
      .range(['#10B981', '#F59E0B', '#EF4444', '#7C2D12'])

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Arc generator
    const arc = d3.arc()
      .innerRadius(radius - 30)
      .outerRadius(radius)

    // Background arc (full)
    svg.append('path')
      .attr('d', arc({
        startAngle: -Math.PI / 2,
        endAngle: Math.PI / 2,
      } as d3.DefaultArcObject))
      .attr('fill', '#E5E7EB')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // Value arc
    const endAngle = -Math.PI / 2 + (value / 10) * Math.PI
    svg.append('path')
      .attr('d', arc({
        startAngle: -Math.PI / 2,
        endAngle,
      } as d3.DefaultArcObject))
      .attr('fill', colorScale(value))
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // Value text
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', colorScale(value))
      .text(riskScore.toFixed(1))
  }, [riskScore])

  return <svg ref={svgRef} />
}
```

---

## STEP 4: COMPREHENSIVE AUDIT CHECKLIST

### Color & Theming
- [ ] No hardcoded hex colors in components
- [ ] All colors use semantic tokens
- [ ] Dark mode tested and verified
- [ ] Contrast ratios meet WCAG AA
- [ ] Risk level colors consistent across all components
- [ ] Severity badges use correct color coding

### Spacing & Layout
- [ ] No hardcoded px values in padding/margin
- [ ] All spacing uses token scale (p-2, p-4, etc.)
- [ ] Dashboard layout responsive (mobile/tablet/desktop)
- [ ] Card layouts consistent
- [ ] Table row spacing uniform

### Typography
- [ ] Fonts loaded via `next/font`
- [ ] No hardcoded font sizes
- [ ] Heading hierarchy correct
- [ ] Body text readable (size and line-height)
- [ ] Mono font used for IDs, account numbers only

### Components
- [ ] All components fully typed (TypeScript strict)
- [ ] All interactive components accessible (ARIA labels, focus states)
- [ ] Button variants work correctly
- [ ] Input validation and error states
- [ ] Loading states show spinners
- [ ] Empty states display messages
- [ ] Dark mode tested for all components

### Data Visualization
- [ ] Recharts use semantic colors
- [ ] D3 visualizations responsive
- [ ] Tooltips readable on mobile
- [ ] Chart legends clear and accessible
- [ ] Loading states for async data

### Accessibility
- [ ] Color not sole indicator of information
- [ ] Focus rings visible (2px, contrasting)
- [ ] Images have alt text
- [ ] Form labels associated with inputs
- [ ] ARIA labels on icon-only buttons
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] prefers-reduced-motion respected

