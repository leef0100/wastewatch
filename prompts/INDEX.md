# WasteWatch Audit Prompts Index

This directory contains comprehensive audit prompts customized for WasteWatch, a government-grade fraud detection SaaS platform.

## File List

### 1. [05-TESTING-QA.md](/sessions/admiring-happy-gates/mnt/wastewatch/prompts/05-TESTING-QA.md)
**Testing & QA Audit for WasteWatch**

Setup comprehensive testing infrastructure from scratch (no testing framework exists yet).

- Vitest + React Testing Library + Playwright configuration
- MSW (Mock Service Worker) for API mocking with WasteWatch endpoints
- Anomaly detection algorithm tests (Benford's Law, duplicates, round numbers, splits)
- Risk scoring accuracy verification
- Organization data isolation tests (no cross-org leaks)
- Role-based access control tests (admin/analyst/viewer)
- CSV/Excel import validation tests
- Dashboard statistics accuracy tests
- jsPDF report generation tests
- TypeScript strict mode enforcement
- ESLint configuration for code quality
- Coverage targets: 75% minimum, 100% for critical paths

**Key Features:**
- WasteWatch-specific test scenarios
- Custom render wrapper with Zustand store provider
- NextAuth session mocking
- E2E test fixtures for authenticated flows

---

### 2. [06-PERFORMANCE.md](/sessions/admiring-happy-gates/mnt/wastewatch/prompts/06-PERFORMANCE.md)
**Performance & Core Web Vitals Audit for WasteWatch**

Optimize performance for data visualization heavy application with large datasets and statistical computations.

- Lighthouse baseline profiling (target: > 85 score)
- Core Web Vitals optimization (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Chart performance (Recharts/D3 memoization, data aggregation for 5+ simultaneous charts)
- Data table virtualization (TanStack Virtual for 1000+ transaction rows)
- CSV import optimization (chunked parsing without main thread blocking)
- Statistical analysis Web Worker setup (Benford's Law, risk scoring)
- jsPDF report generation in Web Worker (no UI freezing)
- Bundle size analysis and optimization
- Dynamic imports for heavy components
- Tree-shaking verification
- Real User Monitoring setup (web-vitals library integration)

**WasteWatch-Specific Optimizations:**
- Dashboard with 5+ Recharts charts
- Transaction lists with 1000+ rows
- Large CSV import (10,000+ transactions)
- Heavy statistical computations (Benford's Law chi-squared)
- PDF report generation for investigations

---

### 3. [07-STATE-DATA.md](/sessions/admiring-happy-gates/mnt/wastewatch/prompts/07-STATE-DATA.md)
**State Management & Data Flow Audit for WasteWatch**

Audit and establish proper state architecture for multi-tenant fraud detection platform.

- Six state categories framework (URL, Server, Form, UI, Global Client, Derived)
- URL state with nuqs (filters shareable and bookmark-able)
- Server state management (React Server Components vs React Query)
- Form state with React Hook Form + Zod
- UI state with Zustand (sidebar, toasts, modals)
- Global client state (auth, organization context, permissions)
- Derived/computed state patterns (useMemo, never duplicate)
- Organization scoping enforcement (critical for multi-tenant data isolation)
- Role-based access control state (admin/analyst/viewer)
- Filter state sync between URL and components
- Dashboard statistics computation
- Data flow audit (CSV → parse → analyze → store → display)
- Multi-tab consistency with BroadcastChannel API
- Single source of truth violations detection

**WasteWatch-Specific State:**
- Multi-tenant organization scoping (prevent cross-org data leaks)
- Role-based permissions enforcement
- Filter state (vendor, date range, risk severity, department)
- Zustand stores: auth, organization, UI state
- CSV import workflow state
- Investigation creation and management
- Report generation state

---

### 4. [08-SEO.md](/sessions/admiring-happy-gates/mnt/wastewatch/prompts/08-SEO.md)
**SEO & Discoverability Audit for WasteWatch**

Optimize public-facing pages for search engine discoverability while keeping sensitive areas protected.

- robots.txt configuration (block /dashboard, /api, /admin, allow /blog)
- Sitemap generation with dynamic routes (blog posts, case studies)
- Canonical URL implementation
- HTTPS + HSTS security headers
- Page metadata (unique titles, descriptions)
- Open Graph tags for social media sharing
- Twitter Card tags
- Schema markup (Organization, SoftwareApplication, Article, BlogPosting)
- B2B/Government SaaS keyword strategy
- Blog content strategy (fraud detection, compliance, case studies)
- Google Search Console integration
- Google Analytics 4 setup
- Core Web Vitals monitoring

**WasteWatch SEO Strategy:**
- Target keywords: fraud detection, government spending, waste detection, Benford's Law, FCA compliance, anomaly detection
- Public pages: /, /features, /pricing, /trial, /blog, /resources, /case-studies
- Block sensitive areas: /dashboard, /api, /onboarding, /admin, /settings
- Focus on government agency and auditor audience

---

## How to Use These Prompts

1. **Review one prompt at a time** - Start with 05-TESTING-QA if you haven't set up testing yet
2. **Follow the audit steps** - Each prompt includes step-by-step checklists
3. **Implement the code examples** - Copy and adapt code samples for your codebase
4. **Track progress** - Use the included checklists to verify completion
5. **Commit changes** - Follow the suggested git commit messages

## WasteWatch Technology Stack

- **Frontend:** Next.js 16.1.6, React 19.2.3, TypeScript strict mode
- **State Management:** Zustand 5.0.11
- **Authentication:** NextAuth 5.0.0-beta.30
- **Database:** PostgreSQL 16, Prisma 7.4.1
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Visualization:** Recharts 3.7.0, D3 7.9.0
- **Export/Reports:** jsPDF, PapaParse, XLSX
- **Deployment:** Docker

## Critical Requirements

1. **Multi-Tenant Data Isolation** - No cross-organization data leaks (enforced at server and client)
2. **Role-Based Access Control** - Three roles: admin, analyst, viewer with proper permission enforcement
3. **Statistical Forensics** - Benford's Law, anomaly detection, risk scoring (no external AI required)
4. **Large Dataset Handling** - Perform well with thousands of transactions
5. **Performance** - Lighthouse > 85, LCP < 2.5s, responsive to user interactions

## Audit Execution Order

1. **05-TESTING-QA.md** - Set up testing infrastructure (prerequisite for everything else)
2. **07-STATE-DATA.md** - Establish proper state architecture
3. **06-PERFORMANCE.md** - Optimize performance metrics
4. **08-SEO.md** - Optimize for search and discoverability

All four audits should be completed for a production-ready WasteWatch instance.

---

Generated: February 27, 2026
