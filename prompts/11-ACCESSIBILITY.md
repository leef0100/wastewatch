# 11-ACCESSIBILITY.md — Accessibility (a11y) Audit (WasteWatch)

> **Audit Phase 11 of 11: Accessibility for WasteWatch**
>
> WasteWatch serves government agencies and must comply with WCAG 2.1 Level AA and Section 508 standards. This audit covers semantic HTML, screen reader compatibility, keyboard navigation, data visualization accessibility, and role-based UI accessibility.

---

## CRITICAL GOVERNMENT COMPLIANCE

**WasteWatch must meet:**
- WCAG 2.1 Level AA (minimum)
- Section 508 (U.S. government requirement)
- ADA compliance
- Target: Lighthouse Accessibility > 90 on all pages

This is non-negotiable for government clients.

---

## STEP 1: AUTOMATED ACCESSIBILITY TESTING

### 1.1 Tooling Setup

```bash
npm install --save-dev axe-core axe-playwright jest-axe eslint-plugin-jsx-a11y lighthouse
```

**ESLint a11y configuration:**

```json
{
  "extends": ["next", "plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/aria-activedescendant-has-tabindex": "error"
  }
}
```

**Run accessibility checks:**

```bash
# ESLint checks
npm run lint

# Lighthouse accessibility audit
lighthouse https://localhost:3000/dashboard --chrome-flags="--headless=new" --output=html

# axe-core automated scan
npm run test:a11y
```

---

## STEP 2: DASHBOARD NAVIGATION ACCESSIBILITY

### 2.1 Semantic HTML & Landmarks

WasteWatch dashboard must have proper landmark structure:

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Skip-to-content link (first focusable element) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-2 focus:rounded"
        >
          Skip to main content
        </a>

        {/* Header landmark */}
        <header role="banner" className="bg-white border-b">
          {/* Header content */}
        </header>

        {/* Navigation landmark */}
        <nav aria-label="Dashboard navigation" className="sidebar">
          {/* Navigation items */}
        </nav>

        {/* Main content landmark */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Footer landmark */}
        <footer role="contentinfo" className="border-t bg-gray-50">
          {/* Footer content */}
        </footer>
      </body>
    </html>
  );
}
```

**Audit Checklist:**

- [ ] One `<main id="main-content">` per page (for skip link)
- [ ] One `<header role="banner">` at page top
- [ ] One `<footer role="contentinfo">` at page bottom
- [ ] `<nav aria-label="Dashboard navigation">` for sidebar
- [ ] Skip-to-content link visible on focus
- [ ] All landmarks are properly nested

---

### 2.2 Heading Hierarchy

Dashboard pages must follow heading hierarchy (no skipping levels).

```typescript
// Example: Dashboard page structure
export default function DashboardPage() {
  return (
    <main id="main-content">
      <h1>Command Center</h1>  {/* Page title */}

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading">Spending Overview</h2>
        <SpendingOverTimeChart />
      </section>

      <section aria-labelledby="flags-heading">
        <h2 id="flags-heading">Red Flags</h2>

        <div aria-labelledby="high-risk-heading">
          <h3 id="high-risk-heading">High Risk (Critical)</h3>
          <FlagsList severity="critical" />
        </div>

        <div aria-labelledby="medium-risk-heading">
          <h3 id="medium-risk-heading">Medium Risk</h3>
          <FlagsList severity="medium" />
        </div>
      </section>

      <section aria-labelledby="departments-heading">
        <h2 id="departments-heading">Departments</h2>
        <DepartmentBreakdownChart />
      </section>
    </main>
  );
}
```

**Audit Checklist:**

- [ ] Exactly ONE `<h1>` per page (page title)
- [ ] Heading hierarchy: h1 → h2 → h3 (no skipping)
- [ ] Section headings use `aria-labelledby` to link to `<h2>` or `<h3>`
- [ ] No empty headings
- [ ] Headings are descriptive and meaningful
- [ ] DevTools console check: `document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => console.log(h.tagName, h.textContent))`

---

## STEP 3: DATA TABLE ACCESSIBILITY

### 3.1 Vendors & Flags Tables

Data tables require proper headers and scope attributes for screen readers.

```typescript
// components/dashboard/vendors-table.tsx
'use client';

interface VendorsTableProps {
  vendors: Vendor[];
  onVendorClick: (vendor: Vendor) => void;
}

export function VendorsTable({ vendors, onVendorClick }: VendorsTableProps) {
  return (
    <div className="overflow-x-auto" role="region" aria-label="Vendors list">
      <table className="w-full border-collapse">
        {/* Table caption */}
        <caption className="sr-only">
          List of vendors with spending, transaction count, and risk score. Use arrow keys to navigate.
        </caption>

        {/* Table header */}
        <thead>
          <tr className="border-b bg-gray-100">
            <th scope="col" className="px-4 py-2 text-left font-bold text-gray-900">
              Vendor Name
            </th>
            <th scope="col" className="px-4 py-2 text-right font-bold text-gray-900">
              Total Spend
            </th>
            <th scope="col" className="px-4 py-2 text-right font-bold text-gray-900">
              Transactions
            </th>
            <th scope="col" className="px-4 py-2 text-right font-bold text-gray-900">
              Risk Score
            </th>
            <th scope="col" className="px-4 py-2 text-center font-bold text-gray-900">
              Flags
            </th>
            <th scope="col" className="sr-only">Actions</th>
          </tr>
        </thead>

        {/* Table body */}
        <tbody>
          {vendors.map(vendor => (
            <tr
              key={vendor.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onVendorClick(vendor)}
              onKeyDown={e => e.key === 'Enter' && onVendorClick(vendor)}
              role="button"
              tabIndex={0}
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {vendor.name}
              </td>
              <td className="px-4 py-3 text-right text-gray-700">
                ${vendor.totalSpend.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-3 text-right text-gray-700">
                {vendor.transactionCount}
              </td>
              <td className="px-4 py-3 text-right">
                <RiskScoreBadge score={vendor.riskScore} />
              </td>
              <td className="px-4 py-3 text-center text-gray-700">
                {vendor.flagCount > 0 ? (
                  <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                    {vendor.flagCount}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="sr-only">
                <button onClick={() => onVendorClick(vendor)}>
                  View vendor details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Audit Checklist:**

- [ ] Table has `<caption>` or aria-label describing its purpose
- [ ] All `<th>` cells have `scope="col"` (column header) or `scope="row"` (row header)
- [ ] Table wrapped in `role="region"` with `aria-label`
- [ ] Sortable columns indicate sort direction (aria-sort="ascending" or "descending")
- [ ] Row selection uses proper ARIA roles (checkbox + role="rowgroup")
- [ ] Keyboard navigation works (Tab through cells, Enter to activate)
- [ ] Read table aloud with screen reader to verify sense

---

## STEP 4: CHART ACCESSIBILITY

### 4.1 Recharts Accessibility

WasteWatch uses Recharts for charts. Charts must have text alternatives.

```typescript
// components/dashboard/spending-chart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SpendingChartProps {
  data: ChartData[];
}

export function SpendingOverTimeChart({ data }: SpendingChartProps) {
  return (
    <figure>
      {/* Chart title */}
      <figcaption id="spending-chart-title" className="text-lg font-bold mb-4">
        Spending Over Time
      </figcaption>

      {/* Chart */}
      <div role="img" aria-labelledby="spending-chart-title spending-chart-desc">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
              }}
              formatter={(value: any) => `$${value.toLocaleString('en-US')}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              name="Total Spend"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Text alternative (data table) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-blue-600 underline">
          View data table
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <caption id="spending-chart-desc" className="sr-only">
              Monthly spending data showing total spend trends from {data[0]?.month} to {data[data.length - 1]?.month}
            </caption>
            <thead>
              <tr className="bg-gray-100">
                <th scope="col" className="border border-gray-300 px-3 py-2 text-left font-bold">
                  Month
                </th>
                <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">
                  Total Spend
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.month}>
                  <td className="border border-gray-300 px-3 py-2">{row.month}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    ${row.total.toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
```

**Audit Checklist:**

- [ ] Chart has `role="img"` with `aria-labelledby` describing it
- [ ] Data table alternative provided (expandable `<details>`)
- [ ] Chart title in `<figcaption>` with ID
- [ ] Colors not sole indicator of meaning (line styles, icons, labels)
- [ ] Chart tooltips show data on hover/focus
- [ ] D3 charts (if used) have similar alt text + data tables

---

## STEP 5: FORM ACCESSIBILITY

### 5.1 Investigation Form

Investigation forms must be fully accessible for data entry.

```typescript
// components/investigation-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const investigationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedTo: z.string().min(1, 'Must assign to an analyst'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export function InvestigationForm() {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(investigationSchema),
  });

  return (
    <form className="space-y-6">
      <fieldset>
        <legend className="text-lg font-bold mb-4">Create Investigation</legend>

        {/* Title field */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
            Title <span aria-label="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Describe the investigation"
          />
          {errors.title && (
            <div id="title-error" role="alert" className="mt-1 text-sm text-red-600 flex items-center gap-2">
              <span className="text-lg">⚠</span> {errors.title.message}
            </div>
          )}
        </div>

        {/* Description field */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
            Description <span aria-label="required">*</span>
          </label>
          <textarea
            id="description"
            {...register('description')}
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={errors.description ? 'description-error' : 'description-hint'}
            rows={5}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Provide context and findings"
          />
          <div id="description-hint" className="mt-1 text-sm text-gray-500">
            At least 10 characters. Include findings, timeline, and context.
          </div>
          {errors.description && (
            <div id="description-error" role="alert" className="mt-1 text-sm text-red-600">
              ⚠ {errors.description.message}
            </div>
          )}
        </div>

        {/* Severity select */}
        <div className="mb-4">
          <label htmlFor="severity" className="block text-sm font-medium text-gray-900 mb-1">
            Severity <span aria-label="required">*</span>
          </label>
          <select
            id="severity"
            {...register('severity')}
            aria-invalid={errors.severity ? 'true' : 'false'}
            aria-describedby={errors.severity ? 'severity-error' : undefined}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Select severity level</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          {errors.severity && (
            <div id="severity-error" role="alert" className="mt-1 text-sm text-red-600">
              ⚠ {errors.severity.message}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
        >
          Create Investigation
        </button>
      </fieldset>
    </form>
  );
}
```

**Audit Checklist:**

- [ ] All inputs have associated `<label>`
- [ ] Required fields marked with `aria-required="true"` and visual indicator
- [ ] Error messages linked via `aria-describedby`
- [ ] Error role="alert" announced to screen readers
- [ ] Form validation on blur and submit
- [ ] Disabled button state visible and announced
- [ ] Focus visible on all interactive elements
- [ ] Tab order is logical (follows visual order)

---

## STEP 6: COLOR & CONTRAST

### 6.1 Risk Score Indicators

Risk scores must not rely on color alone.

```typescript
// components/risk-score-badge.tsx
interface RiskScoreBadgeProps {
  score: number; // 0-100
}

export function RiskScoreBadge({ score }: RiskScoreBadgeProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'CRITICAL', color: 'bg-red-600', icon: '🔴' };
    if (score >= 60) return { level: 'HIGH', color: 'bg-orange-500', icon: '🟠' };
    if (score >= 40) return { level: 'MEDIUM', color: 'bg-yellow-500', icon: '🟡' };
    return { level: 'LOW', color: 'bg-green-600', icon: '🟢' };
  };

  const { level, color, icon } = getRiskLevel(score);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white text-sm font-bold ${color}`}
      aria-label={`Risk score: ${score}/100 (${level})`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{score}</span>
    </span>
  );
}
```

**Audit Checklist:**

- [ ] Risk colors meet 4.5:1 contrast with white text
- [ ] Icons + numbers convey risk level (not just color)
- [ ] aria-label describes risk level and score
- [ ] Decorative icons hidden with `aria-hidden="true"`
- [ ] Text color sufficient contrast with background
- [ ] Works in high contrast mode

---

### 6.2 Flag Severity Indicators

Red flags show severity with color + icon + text.

```typescript
// components/flag-severity-badge.tsx
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface FlagSeverityBadgeProps {
  severity: Severity;
}

export function FlagSeverityBadge({ severity }: FlagSeverityBadgeProps) {
  const severityConfig: Record<Severity, { label: string; color: string; bgColor: string; icon: string }> = {
    LOW: { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-100', icon: '✓' },
    MEDIUM: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '!' },
    HIGH: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '⚠' },
    CRITICAL: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', icon: '⛔' },
  };

  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded font-semibold ${config.bgColor} ${config.color}`}
      aria-label={`Severity: ${config.label}`}
    >
      <span aria-hidden="true" className="text-lg">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

---

## STEP 7: KEYBOARD NAVIGATION

### 7.1 Tab Order Through Dashboard

Dashboard must be fully keyboard navigable.

**Audit process:**

```javascript
// In browser DevTools console, check tab order
document.querySelectorAll('button, a, input, [tabindex="0"]').forEach((el, i) => {
  console.log(`${i}: ${el.tagName} — ${el.textContent?.substring(0, 50)}`);
});
```

**Test checklist:**

- [ ] Tab through header user menu
- [ ] Tab through sidebar navigation (Tab goes through items, not all subitems)
- [ ] Tab through main content (tables, buttons, links)
- [ ] Tab out of modal/dialog without getting trapped
- [ ] Shift+Tab goes backward correctly
- [ ] Focus visible indicator (outline or ring) on all focusable elements
- [ ] Skip-to-content link is first focusable element

---

### 7.2 Sidebar Keyboard Navigation

```typescript
// components/layout/sidebar.tsx — enhanced for keyboard
'use client';

import { useState } from 'react';
import { useEffect } from 'react';

export function SidebarNav() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const handleKeyDown = (groupLabel: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpandedGroups(prev => ({
        ...prev,
        [groupLabel]: !prev[groupLabel],
      }));
    }
  };

  return (
    <nav aria-label="Dashboard navigation" role="navigation">
      {navGroups.map(group => (
        <div key={group.label}>
          <button
            onClick={() => setExpandedGroups(prev => ({
              ...prev,
              [group.label]: !prev[group.label],
            }))}
            onKeyDown={(e) => handleKeyDown(group.label, e)}
            aria-expanded={expandedGroups[group.label] ?? true}
            aria-controls={`${group.label}-items`}
            className="w-full text-left px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset"
          >
            {group.label}
          </button>

          {expandedGroups[group.label] !== false && (
            <ul id={`${group.label}-items`} className="space-y-1 ml-4">
              {group.items.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block px-4 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
```

---

## STEP 8: SCREEN READER TESTING

### 8.1 Manual Screen Reader Testing

**Test with NVDA (Windows) or VoiceOver (Mac):**

1. Start with fresh page load
2. Tab through all major sections
3. Listen to page structure announcement
4. Verify form labels read correctly
5. Listen to table headers + rows
6. Check chart alternative text
7. Verify error messages announced

**Common issues to listen for:**

- Unlabeled buttons
- Missing heading structure
- Form fields without labels
- Images without alt text
- Meaningless landmark structure

---

## STEP 9: AUTOMATED SCANNING

```bash
# Run axe-core scan
npm run test:a11y

# Lighthouse audit
lighthouse https://localhost:3000/dashboard --output=html

# WAVE browser extension
# Install from: https://wave.webaim.org/extension/
```

---

## FINAL VERIFICATION CHECKLIST

- [ ] Lighthouse Accessibility score > 90 on all pages
- [ ] axe-core scan shows zero critical/serious issues
- [ ] WAVE extension shows no errors
- [ ] ESLint a11y rules pass
- [ ] Tab order is logical and visible
- [ ] Skip-to-content link works
- [ ] All images have alt text
- [ ] All tables have proper headers
- [ ] All forms are labeled and validated
- [ ] Charts have data table alternatives
- [ ] Color contrast 4.5:1 for normal text, 3:1 for large text
- [ ] Error messages use color + icon + text (not color alone)
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works (no traps)
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Mobile screen reader tested (iOS VoiceOver or Android TalkBack)
