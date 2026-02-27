# GENERAL-PROMPT.md — Automatic Prompt Enhancement Engine for WasteWatch

> **This file is auto-executed on EVERY prompt received. Before doing ANY work, Claude must run every user message through this enhancement pipeline. No exceptions. No skipping. This is not optional.**

---

## PURPOSE

Most prompts are vague, shallow, or missing critical details. Your job is to intercept every prompt, hyper-analyze it, expand it into a detailed specification, and THEN execute the enhanced version. For WasteWatch—a government-grade fraud detection and waste analysis platform—this is especially critical: financial forensics must be precise, data accuracy is non-negotiable, and all features must respect compliance requirements (WCAG AA, FedRAMP, SOC 2, multi-tenancy, and role-based access). The user should never have to think about being descriptive — you do that for them.

---

## MANDATORY PIPELINE — RUN ON EVERY PROMPT

**Every single message the user sends must pass through these 5 stages before you write a single line of code or take any action:**

### STAGE 1: INTENT EXTRACTION
Ask yourself silently (do NOT output this to the user):
- What is the user actually trying to accomplish?
- What is the end goal, not just the surface request?
- Is this a feature request, a bug fix, a refactor, a question, or an audit trigger?
- What context clues exist in their message (file names, feature names, frustration, urgency)?
- What are they NOT saying that they probably mean?
- Does this affect data integrity, compliance, vendor scoring, anomaly detection, or reporting?
- Will this change impact multi-tenant data isolation or role-based access control?

### STAGE 2: AMBIGUITY DETECTION
Identify every vague, unclear, or underspecified element:
- **Vague nouns:** "it", "the thing", "the page", "the component" → Identify WHICH specific one (vendor dashboard, investigation form, risk scoring engine, etc.)
- **Vague verbs:** "fix", "make it work", "clean up", "improve" → Define WHAT specifically needs to change
- **Missing scope:** Does this apply to one organization, one vendor profile, one analysis type, or the whole platform?
- **Missing acceptance criteria:** How will we know when it's "done"? (risk score recalculated, Benford's Law validation passes, FCA form generates correctly, etc.)
- **Missing edge cases:** What happens with missing data, anomalies, false positives, multi-organization queries, role restrictions?
- **Missing context:** Which analysis type (Benford's Law, vendor risk, department comparison), which organization tier (government, healthcare, defense), which user role (admin, analyst, viewer)?
- **Missing compliance impact:** Does this change affect WCAG AA accessibility, FedRAMP controls, SOC 2 audit trails, or data retention policies?
- **Missing data accuracy impact:** Does this change affect financial calculations, forensic thresholds, or flagging algorithms?

### STAGE 3: PROMPT EXPANSION
Take the original prompt and expand it into a hyper-detailed internal specification. For every vague element, fill in the most likely intended meaning based on:
1. The current codebase and WasteWatch's feature set (vendor management, anomaly detection, Benford's Law forensics, FCA complaint generation)
2. The project's conventions (Next.js 16.1.6, React 19.2.3, TypeScript, PostgreSQL/Prisma, Zustand state, NextAuth, Tailwind/shadcn UI, Recharts/D3 charts, statistical forensics algorithms)
3. Industry best practices for SaaS fraud detection platforms
4. Government compliance requirements (multi-tenancy data scoping, role-based access, audit logging, WCAG AA)
5. Common sense and professional judgment

**Expansion rules:**
- "Fix the dashboard header" → Identify what's broken (visual consistency? responsive collapse on mobile? organization context missing? notification badge? role-based nav?). Ensure it displays organization name, user role, pending investigations count, and provides role-appropriate navigation (admin gets settings, analyst gets case list, viewer gets read-only reports). Check for scroll behavior, z-index conflicts, accessibility, dark mode, compliance logo placement.
- "Add vendor search" → Full spec: search-as-you-type with debounced input (300ms), filters by risk score range (critical/high/medium/low), contract status (active/suspended/terminated), department, organization scope, keyboard navigation, empty state when no vendors match, loading spinner during fetch, URL query param sync (?vendorId=, ?riskMin=, ?riskMax=), mobile-responsive collapse, results show vendor name, risk score, contract value, pending flags count, aria-live for screen reader announcements.
- "Add investigation form" → Full spec: fields for case title, description, evidence file attachment (drag-drop + file input, max 100MB, virus scan check), associated vendors/departments, flag severity (critical/high/medium), FCA complaint checkbox, investigator notes, supporting evidence, client-side validation (required fields, file type whitelist), server-side validation, XSS/injection prevention, CSRF protection, success/error toast, loading state, multi-tenancy org scope enforcement, audit log entry on submission, accessible labels, responsive layout.
- "Fix risk score calculation" → Reproduce the issue with test data, identify root cause (Benford's Law threshold? vendor history weighting? department anomalies? multi-tenant data mixing?), verify fix against known test cases, ensure calculation precision (no floating-point errors affecting financial forensics), add tests to prevent regression, check if recalculation needs to run on existing vendors.
- "Build vendor detail page" → Full layout: vendor name, risk score (color-coded), contract details (value, start/end dates, status), department breakdown, transaction history (searchable, sortable, paginated, shows flagged txns), Benford's Law chart, anomaly timeline, associated investigations, FCA complaint history, role-based actions (admin: approve/suspend, analyst: create investigation, viewer: view only), loading skeleton, error boundary, 404 for nonexistent vendors, multi-tenant org isolation.
- "Make a savings calculator" → Spec: calculator that estimates audit savings based on selected flags (number of flags, avg transaction value, recovery rate %), displays potential recovery amount, department/vendor comparison, export functionality, inputs validated (no negative numbers, reasonable ranges), accessible number inputs, responsive layout, no external API calls (statistical calculation only), stores calculation in Zustand if needed for report context.

### STAGE 4: ENHANCED SPECIFICATION OUTPUT
Before executing, output a brief enhanced version to the user in this format:

```
**Enhanced prompt:** [1-3 sentence expanded version of what you're about to do]
```

This should be concise but show the user you understood their intent at a deeper level. Do NOT write a novel — just enough to prove you're not doing something stupid.

**Examples:**

User says: "add vendor search"
```
**Enhanced prompt:** Adding a vendor search component to the dashboard with real-time search-as-you-type, filters for risk score ranges (critical/high/medium/low) and contract status, keyboard navigation, debounced API calls (300ms), mobile collapse behavior, and aria-live announcements for result count. Results display vendor name, current risk score, contract value, and pending investigation count.
```

User says: "fix the dashboard header"
```
**Enhanced prompt:** Auditing the dashboard header for: organization context display (name, tier, admin status), role-appropriate navigation (admin sees Settings, analyst sees Cases, viewer sees Reports only), notification badge for pending investigations, responsive collapse on mobile, proper z-index with sticky positioning, accessibility (landmark role, skip-to-content), dark mode compatibility, and Core Web Vitals impact (CLS from layout shifts).
```

User says: "add investigation form"
```
**Enhanced prompt:** Building an investigation form with: case title, description, evidence file upload (drag-drop + click, max 100MB, virus scan, audit trail), vendor/department selection, flag severity selector, FCA complaint checkbox with conditional fields, investigator notes, client-side validation, server-side CSRF protection, multi-tenant org scoping, success/error notifications, loading states, accessible labels, and audit log entry.
```

User says: "build vendor detail page"
```
**Enhanced prompt:** Building a vendor detail page with: vendor name + risk score (color-coded by severity), contract details (value, dates, status), department breakdown chart, searchable/sortable transaction history (with flag indicators), Benford's Law distribution chart, anomaly timeline, linked investigations, FCA complaint history, role-based action buttons (admin: suspend, analyst: investigate, viewer: read-only), loading skeleton, error boundary, and strict multi-tenant data isolation.
```

User says: "fix risk score calculation"
```
**Enhanced prompt:** Diagnosing risk score calculation issue: reproduce with test data, identify root cause (vendor history weights? Benford's threshold? department anomalies? multi-tenant data leak?), verify fix against known test cases, ensure floating-point precision doesn't affect financial accuracy, add regression tests, determine if bulk recalculation is needed on existing vendors, and verify no multi-tenant data isolation issues were introduced.
```

### STAGE 5: EXECUTE THE ENHANCED VERSION
Now — and only now — execute the expanded specification. Follow it as if the user had typed every detail themselves.

---

## EXPANSION TEMPLATES BY CATEGORY

Use these templates to fill in missing details based on what type of request it is:

### When the user says "add [feature]":
Expand to include:
- Where does it go (which dashboard, which page/route, which component, visible to which roles)?
- What does it look like (layout, sizing, spacing, responsive behavior on mobile/tablet/desktop)?
- What are all the states (default, hover, active, focus, disabled, loading, error, success, empty, no-permission)?
- What data does it need (API calls, Prisma queries, real-time updates via Zustand, multi-tenant scoping)?
- How does it handle errors (network failures, validation, 404s, 500s, permission denied, data inconsistency)?
- Is it accessible (labels, keyboard nav, screen reader, focus management, WCAG AA compliant)?
- Is it responsive (mobile-first, tablet, desktop, print-friendly where applicable)?
- Does it need dark mode support?
- What's the compliance impact (WCAG AA, FedRAMP, SOC 2 audit trail, data retention)?
- What's the multi-tenancy scope (which organization sees this? does it respect role-based access?)?
- What's the rendering strategy (SSR, client-side, ISR, when to refetch, caching strategy)?
- What happens at the edges (long text, missing data, slow network, no JavaScript, unauthorized access, data anomalies)?

### When the user says "fix [thing]":
Expand to include:
- What specifically is broken (reproduce the issue with steps and test data)?
- What is the root cause (not just the symptom - is it a calculation error, data scoping issue, multi-tenant leak, UI bug, performance degradation)?
- What does "fixed" look like (expected behavior with realistic test case)?
- What files are involved?
- What's the regression risk (could this fix break something else, especially in other organizations' data)?
- How do we verify the fix (manual test, automated test, verify financial accuracy, check multi-tenant isolation)?
- Does the fix affect data accuracy, compliance, or audit trails?

### When the user says "improve/clean up/refactor [thing]":
Expand to include:
- What's currently wrong with it (specific problems - performance? maintainability? compliance gap?)?
- What does "improved" look like (measurable criteria - calculation speed? code clarity? fewer database queries?)?
- What's the scope (this file only, or related files too, or data models)?
- What patterns should the refactored code follow (check CONVENTIONS.md, Zustand for state, Prisma for queries)?
- What tests exist that might break?
- What's the performance/readability/maintainability/compliance improvement?
- Does the refactor affect bundle size, database performance, or multi-tenant isolation?

### When the user says "build [page/component/feature]":
Expand to include:
- Full layout specification (sections, hierarchy, spacing, responsive grid at 320px, 640px, 768px, 1024px, 1280px, 1536px)
- All interactive elements and their behaviors (filters, sorts, downloads, case actions, etc.)
- All states (loading skeleton, empty, error boundary, success, partial, no-permission, no-data-for-org)
- Data requirements (API calls, Prisma queries, Zustand state, server components, multi-tenant filtering)
- User flow (what page comes before and after, breadcrumbs, back navigation, role-appropriate workflows)
- Validation rules for any inputs (required fields, file size limits, format validation, etc.)
- Responsive behavior at each breakpoint
- Accessibility requirements (landmarks, headings, focus order, ARIA, WCAG AA, screen reader support)
- Compliance requirements (data isolation by org, role-based access enforcement, audit logging, FedRAMP controls)
- SEO requirements (title, description, og:image, structured data, canonical URL)
- Rendering strategy (SSR vs SSG vs ISR vs client-side, when to prefetch, caching strategy)
- Error handling for every failure point (network errors, auth failures, missing data, permission denied, data anomalies)
- Edge cases (no data for this org, too much data (pagination), slow network, JavaScript disabled, cross-org data access attempts)

### When the user says something extremely vague:
Examples: "make it better", "it doesn't work", "help", "idk fix stuff"
- Scan the codebase for the most likely issue area
- Run type checking (TSC) to find obvious problems
- Check for recent changes that might have introduced bugs
- Look for TODO/FIXME/HACK comments
- Identify the lowest-hanging fruit improvements
- For WasteWatch: check for data accuracy issues, multi-tenant data leaks, missing audit logs, compliance gaps
- Present findings and ask ONE clarifying question if truly ambiguous

---

## ENHANCEMENT RULES

### DO:
- Always enhance, even if the prompt seems clear — there's always more depth to add
- Fill in edge cases the user didn't mention (especially: missing data, multi-tenant isolation, role restrictions, data anomalies)
- Add error handling the user didn't ask for (especially: network failures, permission denied, data inconsistency)
- Add accessibility the user didn't think about (WCAG AA compliance is required)
- Add responsive behavior the user didn't specify
- Consider dark mode implications
- Think about loading/empty/error states for every UI element
- Consider compliance impact for any change (WCAG AA, FedRAMP, SOC 2, multi-tenancy data scoping)
- Consider data accuracy impact for any calculations or forensics changes
- Consider the impact on existing code, tests, and data
- Reference CONVENTIONS.md for how the enhanced code should be structured
- Verify multi-tenant data isolation: all queries must be scoped by organization
- Verify role-based access: features must respect user role (admin/analyst/viewer)

### DO NOT:
- Ask the user 20 clarifying questions before starting — just make smart assumptions
- Output a massive specification document — keep the enhanced prompt to 1-3 sentences
- Skip enhancement because the prompt "seems detailed enough" — always add depth
- Change the user's intent — enhance it, don't redirect it
- Over-scope — if they said "fix the vendor search," don't redesign the entire dashboard
- Under-scope — if they said "add anomaly detection," don't just add a flag counter
- Skip compliance checks — WCAG AA, multi-tenancy data isolation, and audit trails are non-negotiable
- Deploy changes to production data without confirming multi-tenant isolation is maintained

### WHEN TO ASK vs WHEN TO ASSUME:
**Ask** (max 1 question) when:
- The request could go in 2 fundamentally different directions (e.g., "add filtering" — by risk score, contract status, department, or combination?)
- The request involves multi-tenant data scope ambiguity (e.g., "show all vendors" — for this org, or all orgs?)
- The request involves irreversible actions (e.g., "delete the old code" — which old code? confirm before deleting)
- You genuinely cannot determine intent from context

**Assume** (and just do it) when:
- The intent is clear but details are missing — fill them in with best practices
- The user is clearly frustrated ("it's broken, fix it") — don't interrogate them, just fix it
- The enhancement is additive (adding error handling, accessibility, edge cases)
- Multi-tenancy data isolation should always be verified (default: assume changes must respect current org scoping)

---

## QUALITY MULTIPLIER

The enhancement pipeline should act as a quality multiplier. A lazy prompt should produce the same quality output as a detailed prompt, because YOU fill in the gaps. The user's job is to state their intent. YOUR job is to make it bulletproof, accurate, and compliant.

| User Effort | Without Enhancement | With Enhancement |
|-------------|-------------------|-----------------|
| "add vendor search" | A search box appears. No filters, no states, no a11y | Vendor search with risk score range filters, contract status filter, debounced input (300ms), loading spinner, keyboard navigation, URL params (?vendorId=&riskMin=), aria-live results, mobile collapse, results show risk score + pending flags |
| "fix risk score" | The specific reported bug gets patched | Root cause found (vendor history? department weighting? Benford's threshold?), bug fixed, test case added, floating-point precision verified, multi-tenant data isolation confirmed, bulk recalculation run if needed |
| "make it faster" | One random optimization | Performance profiling (Core Web Vitals), database query analysis (N+1 problems), bundle size check, top 3 bottlenecks identified, measurable improvements with before/after metrics, verified on realistic org data scale |
| "build vendor dashboard" | A page with some vendor data | Full dashboard with organization context, role-based actions (admin/analyst/viewer), loading skeletons, error boundaries, empty states ("no vendors in this org"), responsive grid, risk score filters, department breakdown, Benford's Law comparison, pending investigations count, multi-tenant data scoped, proper meta tags |
| "add FCA form" | A form appears | FCA form with compliance fields (evidence requirements, severity, complaint type, supporting documentation), client-side validation (required fields, file formats), server-side validation, CSRF protection, audit logging on submission, multi-tenant org enforcement, success notification with reference number, file attachment with virus scan, accessible labels, responsive layout |

---

## WASTEWATCH-SPECIFIC CONSIDERATIONS

When enhancing any WasteWatch request, always verify:

1. **Multi-Tenancy Data Isolation**
   - All database queries must filter by organization ID
   - Cross-org data access attempts should fail silently (404 or empty result)
   - User role must be scoped to their organization
   - Reports/exports must only include org's data

2. **Role-Based Access Control**
   - Admin: full access, settings, user management, all investigations
   - Analyst: create/manage investigations, view all org data, generate reports, cannot change settings
   - Viewer: read-only access to dashboards and reports, cannot create investigations
   - Verify role checks on both client and server side
   - Hide UI elements from unauthorized roles

3. **Data Accuracy & Financial Forensics**
   - All calculations must use precise arithmetic (no floating-point surprises)
   - Benford's Law thresholds must match forensics standards
   - Risk scores must be consistent and reproducible
   - Flag counts and transaction sums must match source data
   - Test with real-world fraud patterns and edge cases

4. **Compliance Requirements**
   - WCAG AA accessibility (colors, contrast, keyboard nav, screen readers)
   - FedRAMP control mapping (document any controls affected by changes)
   - SOC 2 audit trails (log sensitive actions: case creation, flag changes, report generation)
   - Data retention policies (do not expose delete functionality for audit data)
   - Encrypted connections for all data transmission

5. **Government/Healthcare/Defense Context**
   - Assume users work in high-security, high-compliance environments
   - Error messages must be generic (don't leak data in error text)
   - Timestamps should be audit-trail-ready
   - Avoid marketing language; use professional, precise terminology
   - Consider offline/slow-network scenarios

---

## INTEGRATION WITH AUDIT PROMPTS

If the enhanced prompt matches an audit trigger (see CLAUDE.md trigger map), route it to the appropriate audit prompt AFTER enhancement. The enhancement adds context that makes the audit more targeted and effective.

Example: User says "the risk scores look wrong" →
1. Enhanced to: "Data accuracy audit for risk score calculation: verify Benford's Law thresholds match expected values, vendor history weighting is consistent, department anomalies don't affect cross-org data, test with known fraud patterns, confirm no floating-point precision issues, and check if bulk recalculation is needed on affected vendors."
2. May route to: data accuracy audit or forensics algorithm review

---

## FINAL RULE

**Every prompt gets enhanced. No exceptions. If the user types one word, you turn it into a complete specification. If the user types a paragraph, you still find gaps and fill them. The enhancement is silent, fast, and automatic. The user should feel like you read their mind — and understood that WasteWatch requires precision, compliance, and airtight multi-tenant data isolation.**
