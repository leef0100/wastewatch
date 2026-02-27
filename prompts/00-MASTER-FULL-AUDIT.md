# 00-MASTER-FULL-AUDIT.md — WasteWatch Full Web Application Audit

**This is the master orchestration document for a complete web application audit of WasteWatch, a government-grade fraud detection SaaS platform, across 12 phases.**

> **CRITICAL:** Before starting, read `CLAUDE.md` and `CONVENTIONS.md` in the parent directory. This file controls the entire audit workflow.

---

## PURPOSE

This prompt orchestrates a comprehensive, methodical audit of the WasteWatch application. It verifies that:
- The application is architecturally sound and follows best practices for government-grade fraud detection
- Security, performance, and accessibility are not compromised
- Code quality is high and maintainable
- User experience is optimal for fraud investigators
- Compliance with government standards (FedRAMP, SOC 2, WCAG AA) is maintained
- Deployment and CI/CD pipelines are robust
- Backend API routes are fully implemented (currently stub/empty)
- Testing infrastructure is configured and comprehensive

**Duration:** 3-6 hours depending on codebase size
**Scope:** All 12 audit phases, executed in priority order
**Output:** Structured phase reports + final summary report with metrics

---

## PRE-AUDIT SETUP (REQUIRED)

### Step 1: Environment & Project Context

**WasteWatch Tech Stack:**

```
PROJECT:            WasteWatch (Government-Grade Fraud Detection SaaS)
FRAMEWORK:          Next.js 16.1.6 (App Router)
LANGUAGE:           TypeScript (strict mode)
RENDERING:          Hybrid (SSR + CSR, mostly client-side dashboard)
BACKEND:            Next.js API Routes (currently stub/empty — CRITICAL)
DATABASE:           PostgreSQL 16 + Prisma 7.4.1
STATE MANAGEMENT:   Zustand 5.0.11
AUTH PROVIDER:      NextAuth 5.0.0-beta.30 (Prisma Adapter)
AI/ML PROVIDER:     None (uses statistical forensics — Benford's Law, anomaly detection, risk scoring)
HOSTING:            Docker (docker-compose with PostgreSQL)
CDN:                None configured yet
STYLING:            Tailwind CSS 4 + shadcn/ui + Radix UI
TESTING:            None configured yet (CRITICAL)
MONITORING:         None configured yet
LINTING:            ESLint (Next.js default)
COMPLIANCE:         FedRAMP, SOC 2, WCAG AA (government-grade)
```

### Step 2: Key Pages & Routes

WasteWatch application routes:
- **Landing:** `/` — Public landing page
- **Trial:** `/trial` — Trial signup page
- **Onboarding:** `/onboarding` — Post-signup onboarding flow
- **Dashboard:** `/dashboard` — Main fraud detection dashboard
- **Departments:** `/departments` — Department management
- **Vendors:** `/vendors` — Vendor management and analysis
- **Flags:** `/flags` — Fraud flag review and management
- **Investigations:** `/investigations` — Detailed investigation workspace
- **Reports:** `/reports` — Report generation and export
- **Settings:** `/settings` — Account and organization settings

### Step 3: Component Inventory

Major WasteWatch components:
- **Layout:** Navbar, Sidebar, DashboardLayout
- **Data Cards:** StatCard, MetricCard, RiskScoreCard
- **Tables:** TopVendorsTable, DepartmentTable, VendorTransactionsTable, FlagsTable
- **Charts:** BenfordDistributionChart, AnomalyTrendChart, RiskHeatmap, VendorAnalysisChart
- **Modals:** FlagDetailsModal, InvestigationDetailsModal, ExportReportModal
- **Forms:** TrialSignupForm, OnboardingForm, VendorUploadForm
- **Lists:** RecentFlags, TopAnomalies, InvestigationList
- **Investigation UI:** TimelineView, DocumentGrid, AnnotationPanel
- **Trial Components:** TrialBanner, TrialExpiredModal, TrialExtensionForm

### Step 4: Browser/Device Targets

- Target browsers: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- Mobile: iOS Safari 17+, Chrome Mobile 120+, Firefox Mobile 120+
- Responsive breakpoints: 320px, 768px, 1024px, 1280px, 1920px
- Accessibility: WCAG AA (government requirement), keyboard navigation, screen reader support
- Government compliance: FedRAMP-compatible, no external CDNs, encrypted data flows

### Step 5: Initial Health Check

Run these commands and record results:

```bash
# Build check
npm run build

# Linting check
npm run lint

# Type checking
npm run type-check  # or: tsc --noEmit

# Tests (if applicable)
npm run test

# Docker health check
docker-compose up -d
docker-compose logs postgres
docker-compose down
```

**Record these results in your working notes. Do NOT proceed if the build fails or critical errors exist.**

### Step 6: Lighthouse Baseline

Run Lighthouse on the main pages:

```bash
# Using Google Chrome DevTools
# Or: npm install -g lighthouse
lighthouse https://localhost:3000 --output=json > lighthouse-baseline.json
```

Record baseline scores for:
- **Performance:**
- **Accessibility:**
- **Best Practices:**
- **SEO:**
- **Core Web Vitals (LCP, INP, CLS):**

### Step 7: Set Up Audit Branch

```bash
git checkout -b audit/full-web-audit
```

---

## SEVERITY CLASSIFICATION

Use these categories when documenting issues:

| Severity | Definition | Action |
|----------|-----------|--------|
| **P0 - Critical** | App crashes, security vulnerability, data loss, complete feature failure, blocks users, missing API implementation | Fix immediately, before moving to next phase |
| **P1 - High** | Broken feature, broken build, Core Web Vitals failure, auth bypass, XSS vulnerability, missing backend endpoints | Fix in current session |
| **P2 - Medium** | Visual bug, UI inconsistency, missing loading/error state, minor performance issue, SEO bug | Fix in current session if time permits |
| **P3 - Low** | Polish, micro-optimization, nice-to-have improvement, naming clarity | Document for future sprints |

---

## PHASE EXECUTION OVERVIEW

This audit is structured as **12 sequential phases**, each with its own detailed prompt file. Each phase:
1. Scans the codebase for issues in that category
2. Fixes all P0 and P1 issues immediately
3. Documents all P2 and P3 issues
4. Commits working checkpoints
5. Produces a phase report

### Recommended Priority Order

**CRITICAL NOTE:** WasteWatch has **two critical blockers** that must be addressed first:
- **API Routes are stubs** (Phase 2 is critical)
- **Testing is not configured** (Phase 5 is critical)

The phases should be executed in this order:

1. **Phase 3: Security & Auth** — Must be first (prevents catastrophic issues, validates NextAuth setup)
2. **Phase 2: Backend & API** — CRITICAL (API routes are currently empty stubs)
3. **Phase 1: Design System** — Visual and token foundation
4. **Phase 7: State & Data** — Data architecture and Zustand flow
5. **Phase 8: SEO** — Content structure and metadata
6. **Phase 9: Navigation & UX** — User flows and routing
7. **Phase 4: AI Integration** — Statistical forensics and Benford's Law implementation
8. **Phase 6: Performance** — After features are stable
9. **Phase 10: Deployment** — Shipping readiness (Docker validation)
10. **Phase 11: Accessibility** — WCAG AA compliance (government requirement)
11. **Phase 12: Code Architecture** — Clean up and organize
12. **Phase 5: Testing & QA** — CRITICAL (set up from scratch, validate everything)

### Alternative Order (If Time-Constrained)

If you run out of context or need to deprioritize:

**MUST DO (P0):**
- Phase 3: Security & Auth
- Phase 2: Backend & API (API routes currently empty)
- Phase 5: Testing & QA (testing not configured at all)

**SHOULD DO (P1):**
- Phase 1: Design System
- Phase 10: Deployment
- Phase 11: Accessibility (government compliance)

**NICE TO DO (P2/P3):**
- Phase 4: AI Integration (statistical forensics)
- Phase 6: Performance
- Phase 7: State & Data
- Phase 8: SEO
- Phase 9: Navigation & UX
- Phase 12: Code Architecture

---

## PHASE 1: DESIGN SYSTEM (01-DESIGN-SYSTEM.md)

### Objectives
- Verify all colors are defined as CSS custom properties (no hardcoded hex values)
- Ensure consistent typography scale
- Validate spacing/sizing tokens (critical for fraud detection UI clarity)
- Check component consistency across dashboard and investigation views
- Verify dark mode support (reduce eye strain for fraud investigators)
- Verify color contrast meets WCAG AA for government compliance

### Key Deliverables
- [ ] CSS custom properties defined for colors, spacing, typography, shadows
- [ ] Theme configuration centralized (tailwind.config.ts)
- [ ] All hardcoded colors replaced with tokens
- [ ] Component library follows consistent patterns
- [ ] Dark mode toggle functional
- [ ] Design tokens documented
- [ ] Color contrast verified for accessibility
- [ ] shadcn/ui and Radix UI components properly themed

### Typical Issues
- Hardcoded hex values scattered throughout dashboard components
- Inconsistent spacing in fraud flag cards and investigation UI
- Typography scales not defined for data tables
- No dark mode support (important for investigator comfort)
- Missing component documentation
- Low color contrast on risk indicators

### Government Compliance Notes
- Ensure all interactive fraud indicators meet WCAG AA contrast (4.5:1 for text)
- Design tokens should support high-contrast mode for accessibility

---

## PHASE 2: BACKEND & API (02-BACKEND-API.md)

### Objectives
- **CRITICAL:** Implement missing API route handlers (currently stubs/empty)
- Audit all API routes and handlers for fraud detection endpoints
- Verify input validation and sanitization on all endpoints
- Check error handling and logging
- Validate database queries and performance (Prisma models)
- Ensure proper caching strategies for vendor and department data
- Check rate limiting on investigation endpoints

### Key Deliverables
- [ ] All API routes have input validation
- [ ] Implement Departments endpoints (GET /api/departments, GET /api/departments/[id], etc.)
- [ ] Implement Vendors endpoints (GET /api/vendors, POST /api/vendors/upload, etc.)
- [ ] Implement Flags endpoints (GET /api/flags, POST /api/flags, PATCH /api/flags/[id], etc.)
- [ ] Implement Investigations endpoints (GET /api/investigations, POST /api/investigations, etc.)
- [ ] Implement Reports endpoints (GET /api/reports, POST /api/reports/generate, etc.)
- [ ] Implement statistical forensics endpoints (Benford's Law, anomaly detection)
- [ ] All API errors return meaningful messages
- [ ] Database queries are optimized and indexed
- [ ] Error logging is centralized
- [ ] Rate limiting configured for public and auth endpoints
- [ ] CORS properly configured
- [ ] Request/response types are validated with Zod/type-safe approach
- [ ] Database migrations are versioned and tested

### Typical Issues
- **All API routes are currently stubs (CRITICAL)**
- Missing input validation on endpoints
- Unhandled promise rejections
- N+1 query problems in vendor/department lookups
- Missing database indexes on frequently-queried fields
- No rate limiting on upload endpoints
- CORS misconfigured for dashboard API calls
- No pagination on large result sets
- Missing error handling for statistical analysis failures

### Statistical Forensics Endpoints Needed
- POST /api/forensics/benford — Analyze distribution against Benford's Law
- POST /api/forensics/anomalies — Detect statistical anomalies in vendor behavior
- POST /api/forensics/risk-score — Calculate fraud risk scores
- GET /api/forensics/benford/chart-data — Return chart-ready data

---

## PHASE 3: SECURITY & AUTH (03-SECURITY-AUTH.md)

### Objectives
- Audit NextAuth 5 setup and configuration
- Check authorization on all protected routes (dashboard requires auth)
- Verify secrets management (no hardcoded keys)
- Review security headers
- Check for XSS/CSRF/SQL injection vulnerabilities
- Validate HTTPS enforcement
- Verify government compliance for data security

### Key Deliverables
- [ ] No hardcoded secrets in code (all in .env)
- [ ] All protected routes have auth guards
- [ ] CSP headers configured (prevents XSS)
- [ ] CORS headers properly set
- [ ] Secrets never logged or exposed
- [ ] All user inputs sanitized
- [ ] HTTPS enforced
- [ ] No XSS vulnerabilities
- [ ] CSRF protection enabled
- [ ] SQL injection protection enabled (Prisma parameterized queries)
- [ ] NextAuth session configuration secure
- [ ] Role-based access control (RBAC) implemented
- [ ] Government compliance: Data never sent to external APIs

### Typical Issues
- API keys in code or git history
- Missing auth guards on /dashboard routes
- XSS vulnerabilities in fraud flag rendering
- CORS too permissive
- No CSP headers
- Secrets in error messages or logs
- NextAuth session cookies not secure (httpOnly, sameSite)
- No role-based access control
- External API calls exposing sensitive investigation data

### Government Compliance Notes
- Audit logs must be comprehensive for compliance
- No external CDNs allowed (use local assets only)
- Data encryption at rest and in transit required
- Ensure compliance with FedRAMP guidelines

---

## PHASE 4: AI INTEGRATION (04-AI-INTEGRATION.md)

### Objectives
- Audit statistical forensics implementation (Benford's Law, anomaly detection)
- Check cost controls (local processing, no external APIs)
- Verify fraud scoring algorithm accuracy
- Validate error handling for analysis failures
- Check for data sanitization in analysis inputs

### Key Deliverables
- [ ] Benford's Law analysis implemented and tested
- [ ] Anomaly detection algorithm working correctly
- [ ] Risk scoring algorithm produces meaningful results
- [ ] All statistical analyses have timeout protection
- [ ] Error handling for computation failures
- [ ] User data sanitized before analysis
- [ ] Results cached appropriately
- [ ] Error messages helpful and non-technical

### Typical Issues
- Inaccurate Benford's Law analysis
- No timeout on expensive statistical computations
- Poor error handling when analysis fails
- Missing validation of input data
- Results not cached, causing slow dashboard
- Analysis algorithms returning nonsensical scores

### Note on Statistical Forensics
WasteWatch uses **no external AI/ML providers** — all fraud detection is local:
- Benford's Law distribution analysis
- Statistical anomaly detection
- Risk scoring based on forensic indicators
- All processing is deterministic and auditable

---

## PHASE 5: TESTING & QA (05-TESTING-QA.md)

### Objectives
- **CRITICAL:** Set up testing infrastructure (currently not configured)
- Implement unit tests for statistical forensics algorithms
- Implement integration tests for API routes
- Test critical user flows end-to-end
- Verify error scenarios are tested
- Test investigation workflow thoroughly

### Key Deliverables
- [ ] Jest or Vitest configured
- [ ] Testing Library configured for component tests
- [ ] Playwright or Cypress configured for E2E tests
- [ ] Test database (separate from production)
- [ ] Critical user flows have E2E tests:
  - [ ] Trial signup flow
  - [ ] Onboarding flow
  - [ ] Upload vendor data
  - [ ] Review fraud flags
  - [ ] Create investigation
  - [ ] Generate report
- [ ] Unit tests for statistical algorithms (Benford's Law, anomaly detection)
- [ ] API route tests for all endpoints
- [ ] Error scenarios tested
- [ ] All tests pass
- [ ] Test data properly seeded
- [ ] Tests run in CI/CD pipeline

### Typical Issues
- **Testing not configured at all (CRITICAL)**
- Low or zero test coverage
- Tests that don't actually test anything
- Flaky tests on CI/CD
- No E2E test coverage for fraud workflows
- Missing error case tests
- No tests for statistical forensics
- Database state not reset between tests

---

## PHASE 6: PERFORMANCE (06-PERFORMANCE.md)

### Objectives
- Optimize Core Web Vitals
- Reduce bundle size (critical for slow government networks)
- Implement code splitting
- Optimize images (charts and investigation documents)
- Check for memory leaks
- Verify caching strategies for large datasets

### Key Deliverables
- [ ] Lighthouse Performance score > 90
- [ ] Core Web Vitals all pass
  - LCP < 2.5 seconds
  - INP < 200 milliseconds
  - CLS < 0.1
- [ ] Bundle size < 250KB (gzipped)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] Large datasets (vendors, transactions) paginated
- [ ] Investigation views lazy-load documents
- [ ] Database queries cached appropriately

### Typical Issues
- Large bundle size from chart libraries
- Unoptimized images (investigation screenshots)
- No code splitting between public and dashboard
- Large vendor data tables not paginated
- No client-side caching of forensic analyses
- Slow investigation document loading

### Note on Performance for Government Networks
Many government agencies have slower networks. Optimize for:
- Minimal asset size
- Quick time-to-interactive for dashboard
- Progressive loading of investigation data

---

## PHASE 7: STATE & DATA (07-STATE-DATA.md)

### Objectives
- Audit Zustand state management architecture
- Verify data flow and mutations
- Check URL state synchronization
- Validate data consistency across stores
- Check for state duplication

### Key Deliverables
- [ ] Zustand store architecture documented
- [ ] URL reflects application state (pagination, filters, active investigation)
- [ ] No data duplication across stores
- [ ] Async operations properly handled in stores
- [ ] Error states properly displayed
- [ ] Loading states on all async operations
- [ ] Data validation on inputs
- [ ] Fraud flags, vendors, and investigations properly normalized

### Typical Issues
- State scattered across multiple Zustand stores
- URL doesn't reflect current filters/pagination
- Duplicate vendor data in different stores
- No loading/error states during API calls
- Unhandled async edge cases
- Investigation data not properly refetched

---

## PHASE 8: SEO (08-SEO.md)

### Objectives
- Verify meta tags on all pages
- Check structured data
- Validate robots.txt and sitemap (for public landing page)
- Check mobile-friendliness
- Verify canonical tags

### Key Deliverables
- [ ] Meta tags on landing and public pages (title, description, OG tags)
- [ ] Structured data on landing page
- [ ] robots.txt properly configured
- [ ] sitemap.xml generated for public pages
- [ ] Mobile-friendly (responsive design)
- [ ] Lighthouse SEO score > 90
- [ ] No duplicate content
- [ ] Internal linking structure sound

### Typical Issues
- Missing meta tags on landing page
- No structured data
- Missing sitemap
- Poor mobile experience on landing page

### Note on SEO for SaaS
Focus SEO efforts on:
- Landing page (/) — public-facing
- Blog/resources (if applicable)
- Trial page (/trial) — conversion-focused
Dashboard and investigation pages should NOT be indexed.

---

## PHASE 9: NAVIGATION & UX (09-NAVIGATION-UX.md)

### Objectives
- Audit routing and navigation
- Check user flow consistency
- Verify information architecture
- Test breadcrumb navigation
- Check for dead links
- Validate navigation accessibility

### Key Deliverables
- [ ] All routes defined and organized
- [ ] Navigation components consistent
- [ ] Breadcrumb navigation on investigation pages
- [ ] User flows intuitive and documented:
  - [ ] Trial signup → Onboarding → Dashboard
  - [ ] Upload vendors → Review flags → Create investigation
  - [ ] Investigation workflow (timeline, documents, notes)
- [ ] No dead links
- [ ] Back button behavior correct
- [ ] Navigation keyboard accessible
- [ ] Page transitions smooth

### Typical Issues
- Confusing navigation between dashboard sections
- Dead links in investigations
- Missing navigation labels
- Inconsistent patterns across pages
- Investigation breadcrumbs broken

---

## PHASE 10: DEPLOYMENT (10-DEPLOYMENT.md)

### Objectives
- Verify CI/CD pipeline
- Check environment configuration
- Validate secrets management
- Ensure database migrations run
- Verify monitoring and alerts
- Check rollback capability
- Validate Docker setup

### Key Deliverables
- [ ] CI/CD pipeline passes all checks (GitHub Actions, GitLab CI, etc.)
- [ ] Build process automated
- [ ] Environment variables properly configured (.env, .env.local)
- [ ] Database migrations automated (Prisma migrations)
- [ ] Docker compose setup working
- [ ] PostgreSQL 16 container properly configured
- [ ] Zero-downtime deployments possible
- [ ] Monitoring and error tracking active
- [ ] Rollback procedure documented and tested
- [ ] Preview deploys working for PRs

### Typical Issues
- Manual deployment steps
- Secrets in deployment logs
- Broken migrations
- No monitoring setup
- Slow or failing builds
- Docker environment inconsistencies

### Government Deployment Notes
- Document security controls for deployment
- Audit trails for deployment activity
- Compliance certification for hosting environment

---

## PHASE 11: ACCESSIBILITY (11-ACCESSIBILITY.md)

### Objectives
- Verify WCAG AA compliance (government requirement)
- Check keyboard navigation
- Test screen reader support
- Verify color contrast
- Check form accessibility
- Validate ARIA labels

### Key Deliverables
- [ ] Lighthouse Accessibility score > 90
- [ ] WCAG AA contrast ratios on all text (4.5:1 for normal text)
- [ ] All interactive elements have accessible labels
- [ ] Keyboard navigation works on all pages
- [ ] Screen reader tested on critical flows (fraud flags, investigations)
- [ ] Forms properly labeled (upload, search, filters)
- [ ] ARIA attributes used correctly
- [ ] Focus indicators visible
- [ ] Risk indicators have non-color-dependent communication

### Typical Issues
- Low contrast ratios on risk scores
- Missing alt text on fraud detection charts
- Buttons without labels
- Form inputs not labeled
- Keyboard traps in investigation UI
- Tab order incorrect

### Government Compliance Notes
WCAG AA is mandatory for government applications. Focus on:
- Color contrast for fraud severity indicators
- Keyboard navigation for investigators
- Screen reader support for investigation timeline
- Accessible data tables for vendor analysis

---

## PHASE 12: CODE ARCHITECTURE (12-CODE-ARCHITECTURE.md)

### Objectives
- Audit folder structure
- Verify naming conventions
- Check TypeScript strictness
- Review design patterns
- Eliminate code duplication
- Clean up unused code

### Key Deliverables
- [ ] Folder structure logical and documented
- [ ] Naming conventions consistent
- [ ] Zero TypeScript errors (strict mode)
- [ ] Zero linting errors
- [ ] No unused code or imports
- [ ] No `any` types in TypeScript
- [ ] No `@ts-ignore` comments without justification
- [ ] Components properly abstracted
- [ ] No console.log in production code
- [ ] API routes organized logically

### Typical Issues
- Disorganized folder structure
- Inconsistent naming conventions
- TypeScript strict mode not enabled
- Unused dependencies
- Code duplication in statistical algorithms
- Over-engineering

### Expected Folder Structure
```
src/
  app/               # Next.js app router
    (auth)/         # Auth pages
    (public)/       # Public pages (landing, trial)
    dashboard/      # Protected dashboard routes
  components/        # UI components
  lib/              # Utilities and helpers
    forensics/      # Statistical forensics algorithms
    db/             # Database utilities
    auth/           # Auth utilities
  stores/           # Zustand stores
  types/            # TypeScript types
```

---

## PHASE TRANSITION PROTOCOL

After completing each phase:

1. **Verify the build passes:**
   ```bash
   npm run build
   npm run lint
   npm run type-check
   ```

2. **Run tests (if applicable):**
   ```bash
   npm test
   ```

3. **Commit your progress:**
   ```bash
   git add .
   git commit -m "audit([phase-number]): [concise description]"
   # Example: git commit -m "audit(3): validate NextAuth setup, add CSP headers, remove hardcoded secrets"
   ```

4. **Document the phase report** (see template below)

5. **Note any P0/P1 issues** that carry forward to the next phase

6. **Move to the next phase** without stopping

---

## AUDIT COMPLETION CHECKLIST

Mark these off as you complete each phase. All should be checked by the end:

### Design System (Phase 1)
- [ ] All design tokens defined as CSS custom properties
- [ ] No hardcoded colors in component code
- [ ] Typography scale defined and consistent
- [ ] Spacing tokens used throughout
- [ ] Dark mode support implemented
- [ ] Tailwind config properly organized
- [ ] Color contrast meets WCAG AA

### Backend & API (Phase 2) — **CRITICAL**
- [ ] All Departments API routes implemented
- [ ] All Vendors API routes implemented
- [ ] All Flags API routes implemented
- [ ] All Investigations API routes implemented
- [ ] All Reports API routes implemented
- [ ] All statistical forensics endpoints implemented
- [ ] All API routes have input validation
- [ ] All API responses have proper error handling
- [ ] Database queries are optimized
- [ ] Request/response schemas defined and validated
- [ ] Rate limiting configured
- [ ] Logging centralized and not exposing secrets
- [ ] CORS properly configured
- [ ] Database migrations versioned
- [ ] Pagination implemented on large result sets

### Security & Auth (Phase 3)
- [ ] No secrets in code or git history
- [ ] All protected routes have auth guards
- [ ] CSP headers configured
- [ ] CORS headers appropriate
- [ ] Input sanitization on all user inputs
- [ ] HTTPS enforced
- [ ] No XSS vulnerabilities
- [ ] CSRF protection enabled
- [ ] Auth tokens properly secured (httpOnly, secure flags)
- [ ] Secrets rotation policy defined
- [ ] NextAuth 5 properly configured
- [ ] Role-based access control implemented

### AI Integration (Phase 4)
- [ ] Benford's Law analysis implemented
- [ ] Anomaly detection algorithm working
- [ ] Risk scoring algorithm accurate
- [ ] All statistical analyses have timeout protection
- [ ] Error handling for computation failures
- [ ] User data sanitized before analysis
- [ ] Results cached appropriately
- [ ] Error messages helpful and non-technical

### Testing & QA (Phase 5) — **CRITICAL**
- [ ] Testing framework configured (Jest/Vitest)
- [ ] Testing Library configured
- [ ] E2E testing framework configured (Playwright/Cypress)
- [ ] Test database separate from production
- [ ] Trial signup flow tested E2E
- [ ] Onboarding flow tested E2E
- [ ] Vendor upload tested E2E
- [ ] Fraud flag review tested E2E
- [ ] Investigation creation tested E2E
- [ ] Report generation tested E2E
- [ ] Unit tests cover business logic (>70% coverage)
- [ ] All API routes have tests
- [ ] Error scenarios are tested
- [ ] Tests pass consistently
- [ ] Tests run in CI/CD

### Performance (Phase 6)
- [ ] Lighthouse Performance > 90
- [ ] LCP < 2.5 seconds
- [ ] INP < 200 milliseconds
- [ ] CLS < 0.1
- [ ] Bundle size < 250KB gzipped
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] Large datasets paginated
- [ ] Investigation views lazy-load documents
- [ ] Database queries cached appropriately

### State & Data (Phase 7)
- [ ] Zustand store architecture documented
- [ ] URL reflects app state (pagination, filters)
- [ ] No data duplication across stores
- [ ] Async operations properly handled
- [ ] Loading states visible during async operations
- [ ] Error states visible and actionable
- [ ] Data validation on all inputs
- [ ] State updates are atomic

### SEO (Phase 8)
- [ ] Meta tags on landing and public pages
- [ ] Structured data implemented
- [ ] robots.txt properly configured
- [ ] sitemap.xml auto-generated
- [ ] Lighthouse SEO > 90
- [ ] Mobile-friendly (responsive)
- [ ] No duplicate content
- [ ] Canonical tags prevent duplication
- [ ] Internal linking structure logical
- [ ] Alt text on all images

### Navigation & UX (Phase 9)
- [ ] All routes defined and organized
- [ ] Navigation components consistent
- [ ] Breadcrumbs on investigation pages
- [ ] User flows documented
- [ ] No dead links
- [ ] Back button works correctly
- [ ] Navigation keyboard accessible
- [ ] Page transitions smooth
- [ ] Loading indicators clear
- [ ] Error messages actionable

### Deployment (Phase 10)
- [ ] CI/CD pipeline configured and passing
- [ ] Automated build process
- [ ] Environment variables properly managed
- [ ] Database migrations automated
- [ ] Docker compose setup working
- [ ] PostgreSQL 16 container configured
- [ ] Zero-downtime deployments possible
- [ ] Monitoring and error tracking active
- [ ] Alerts configured for critical issues
- [ ] Rollback procedure documented and tested
- [ ] Preview deploys for PRs working
- [ ] SSL/HTTPS enforced

### Accessibility (Phase 11) — **GOVERNMENT REQUIREMENT**
- [ ] Lighthouse Accessibility > 90
- [ ] WCAG AA contrast ratios met
- [ ] All interactive elements labeled
- [ ] Keyboard navigation works
- [ ] Screen reader support verified
- [ ] Forms properly labeled
- [ ] ARIA attributes used correctly
- [ ] Focus indicators visible
- [ ] Color not sole conveyor of information
- [ ] Risk indicators have non-color communication

### Code Architecture (Phase 12)
- [ ] Folder structure logical and consistent
- [ ] Naming conventions documented and followed
- [ ] Zero TypeScript errors (strict mode)
- [ ] Zero ESLint errors
- [ ] No unused imports or code
- [ ] No `any` types
- [ ] No `@ts-ignore` comments without issue links
- [ ] No console.log in production code
- [ ] Components properly abstracted
- [ ] Utilities organized logically
- [ ] No code duplication (DRY principle)
- [ ] API routes organized logically

---

## PHASE REPORT TEMPLATE

Use this template after completing each phase:

```markdown
## Phase [Number]: [Phase Name]

**Status:** Complete | In Progress | Blocked
**Date Completed:** [date]
**Context Used:** ~[percentage]%

### Issues Summary
- **P0 (Critical):** [count] found, [count] fixed
- **P1 (High):** [count] found, [count] fixed
- **P2 (Medium):** [count] found, [count] fixed
- **P3 (Low):** [count] found, [count] fixed

### Changes Made
- `[file/path]`: [what changed and why]
- `[file/path]`: [what changed and why]

### Verification
- Build passes: ✓/✗
- Linting passes: ✓/✗
- Tests pass: ✓/✗
- Lighthouse delta: [if applicable]

### Remaining Issues
- [P0 issues] (blocking, prevent next phase)
- [P1 issues] (document for urgent follow-up)
- [P2/P3 issues] (backlog items)

### Notes
[Any blockers, gotchas, or decisions made]
```

---

## CRITICAL ISSUES TRACKING

**These items MUST be addressed for WasteWatch to be production-ready:**

### Current Status
1. **API Routes Empty (Phase 2, P0)** — All API route handlers are stubs
   - Departments endpoints not implemented
   - Vendors endpoints not implemented
   - Flags endpoints not implemented
   - Investigations endpoints not implemented
   - Reports endpoints not implemented
   - Statistical forensics endpoints not implemented

2. **Testing Not Configured (Phase 5, P0)** — No test framework set up
   - Jest/Vitest not configured
   - Testing Library not configured
   - E2E testing framework not configured
   - Zero test coverage

3. **Monitoring Not Configured (Phase 10, P1)** — No error tracking
   - Sentry not configured
   - Application logs not centralized
   - Performance monitoring not set up

---

## CONTEXT LIMIT STRATEGY

If you approach the context limit during any phase:

1. **Finish the current section** you're working on
2. **Commit all progress** with a clear message
3. **Document where you stopped** with:
   - Current phase and section
   - Next steps to resume
   - Any P0/P1 issues still open
   - Estimated context remaining
4. **Provide a summary report** of what was completed
5. **Hand off** to the user with clear resumption instructions

**Priority if cutting short:**
1. Complete current phase fully
2. Skip remaining phases in this order: Phase 4, 6, 7, 8, 9, 12
3. Always complete: Phase 3 (Security), Phase 2 (Backend/API), Phase 5 (Testing)

---

## FINAL AUDIT SUMMARY REPORT

After completing all 12 phases, produce this final report:

```markdown
# WASTEWATCH FULL AUDIT — FINAL SUMMARY REPORT

**Project:** WasteWatch (Government-Grade Fraud Detection SaaS)
**Audit Date:** [start date] → [end date]
**Duration:** [total time]
**Branch:** audit/full-web-audit
**Commits:** [count]

## Overall Results

### Issues Breakdown
- **Total Issues Found:** [count]
- **P0 (Critical):** [count] fixed, [count] remaining
- **P1 (High):** [count] fixed, [count] remaining
- **P2 (Medium):** [count] fixed, [count] remaining
- **P3 (Low):** [count] found (backlog)

### Code Quality Metrics
- **TypeScript Errors:** [count] (should be 0)
- **ESLint Errors:** [count] (should be 0)
- **Test Coverage:** [percentage] (target > 70% for critical paths)
- **Unused Dependencies:** [count]
- **Code Duplication:** [percentage]

### API Implementation Status
- **Departments Endpoints:** [count] implemented, [count] tested
- **Vendors Endpoints:** [count] implemented, [count] tested
- **Flags Endpoints:** [count] implemented, [count] tested
- **Investigations Endpoints:** [count] implemented, [count] tested
- **Reports Endpoints:** [count] implemented, [count] tested
- **Statistical Forensics:** [implemented/missing]

### Testing Status
- **Testing Framework:** [Jest/Vitest/None]
- **E2E Framework:** [Playwright/Cypress/None]
- **Test Coverage:** [percentage]
- **Critical Flow Tests:** [count/count passed]

### Performance Metrics
- **Lighthouse Performance:** [baseline] → [final]
- **Lighthouse Accessibility:** [baseline] → [final]
- **Lighthouse Best Practices:** [baseline] → [final]
- **Lighthouse SEO:** [baseline] → [final]
- **Core Web Vitals:**
  - LCP: [value] (target < 2.5s)
  - INP: [value] (target < 200ms)
  - CLS: [value] (target < 0.1)
- **Bundle Size:** [value] gzipped (target < 250KB)

### Government Compliance Status
- **WCAG AA Compliance:** [percentage]
- **FedRAMP Readiness:** [status]
- **SOC 2 Readiness:** [status]
- **Data Security:** [status]

### Files Modified
- Total: [count]
- Created: [count]
- Deleted: [count]
- Modified: [count]

### Phase-by-Phase Summary
| Phase | Found | Fixed | Remaining | Status |
|-------|-------|-------|-----------|--------|
| 1 - Design System | [count] | [count] | [count] | ✓ |
| 2 - Backend & API | [count] | [count] | [count] | ✓ |
| 3 - Security & Auth | [count] | [count] | [count] | ✓ |
| 4 - AI Integration | [count] | [count] | [count] | ✓ |
| 5 - Testing & QA | [count] | [count] | [count] | ✓ |
| 6 - Performance | [count] | [count] | [count] | ✓ |
| 7 - State & Data | [count] | [count] | [count] | ✓ |
| 8 - SEO | [count] | [count] | [count] | ✓ |
| 9 - Navigation & UX | [count] | [count] | [count] | ✓ |
| 10 - Deployment | [count] | [count] | [count] | ✓ |
| 11 - Accessibility | [count] | [count] | [count] | ✓ |
| 12 - Code Architecture | [count] | [count] | [count] | ✓ |

## Build Status: PASS ✓

```bash
npm run build       # ✓ Pass
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm run test        # ✓ Pass ([count] tests)
docker-compose up   # ✓ Running
```

## Critical Findings

[List any P0 issues that could not be resolved and why]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

## Government Compliance Summary

- **WCAG AA:** [compliance status]
- **FedRAMP:** [readiness status]
- **SOC 2:** [readiness status]
- **Data Security:** [status]

## Next Steps

1. Merge `audit/full-web-audit` into `main`
2. Deploy to staging environment
3. Run government compliance checklist
4. Configure monitoring and alerting
5. Schedule security review with government stakeholders
6. Begin Phase 5 (Testing) in earnest if not yet complete

## Confidence Level

**[High/Medium/Low]** — [explanation based on blockers and issue counts]
```

---

## STARTING THE AUDIT

To begin the audit:

1. **Read this file completely** (you are here ✓)
2. **Read `CLAUDE.md`** in the parent directory
3. **Read `CONVENTIONS.md`** in the parent directory
4. **Note the critical blockers:**
   - API routes are stubs (Phase 2)
   - Testing not configured (Phase 5)
5. **Run initial health checks** (build, lint, test)
6. **Record Lighthouse baseline** on main pages
7. **Create audit branch:** `git checkout -b audit/full-web-audit`
8. **Start with Phase 3** (Security & Auth) — must be first
9. **Then Phase 2** (Backend & API) — critical
10. **Then Phase 1, 7, 8, 9, 4, 6, 10, 11, 12**
11. **Finally Phase 5** (Testing & QA)
12. **Produce the final summary report**

---

## GOLDEN RULES

1. **Do not skip phases** — Each one finds and fixes issues others don't
2. **Do not stop early** — If you hit a P0 issue, fix it and continue (don't stall)
3. **Verify everything** — Don't claim something works unless you actually tested it
4. **Commit often** — After each major section, commit your progress
5. **Build must always pass** — Never commit broken code
6. **Tests must always pass** — If adding tests, ensure they pass
7. **Follow conventions** — Use the project's existing patterns
8. **API routes are critical** — Phase 2 is a blocker for the entire system
9. **Testing is critical** — Phase 5 validates that everything works
10. **Ask no permission** — The answer is always "continue"

---

## QUICK REFERENCE

- **Audit Branch:** `audit/full-web-audit`
- **Commit Message Format:** `audit([phase]): [description]`
- **Phase Reports:** Use the template above after each phase
- **Final Report:** Produce after all 12 phases complete
- **Critical Blockers:** API routes (Phase 2), Testing (Phase 5)
- **Government Compliance:** WCAG AA, FedRAMP, SOC 2
- **Tech Stack:** Next.js 16.1.6, TypeScript, Zustand, NextAuth 5, PostgreSQL 16, Prisma 7.4.1

---

**Last Updated:** February 2026
**For Project:** WasteWatch (Government-Grade Fraud Detection SaaS)
**Status:** Ready to begin audit
