# 06-PERFORMANCE.md — Performance & Core Web Vitals Audit (WasteWatch Edition)

> **Purpose:** Comprehensive performance audit for WasteWatch, a government-grade fraud detection SaaS. Heavy on data visualization (Recharts/D3), large dataset handling, and statistical computations. Focus on dashboard performance, report generation, and ensuring analysts can work with thousands of transactions without lag.
>
> **Scope:** All pages (especially dashboard, transactions, investigations, reports), all charts, data imports, statistical analysis, PDF generation, and real-user monitoring.
>
> **Success Criteria:** Lighthouse Performance > 85, LCP < 2.5s, INP < 200ms, CLS < 0.1, first-load JS < 120KB (compressed). Dashboard with 5+ charts loads in < 3s.

---

## PREREQUISITE

Before starting:

1. Run `npm run build && npm start` to verify clean build
2. Open Chrome DevTools → Lighthouse tab (v12+)
3. Have editor open for file modifications
4. Identify key pages: dashboard, transactions, investigations, reports
5. Note baseline performance (run Lighthouse now)

---

## STEP 1: BASELINE PROFILING

### 1.1 Lighthouse Audit — WasteWatch-Specific Pages

**Pages to audit:**
1. `/dashboard` — Main view with Recharts charts (LCP, INP risk)
2. `/transactions` — Data table with virtualization
3. `/flags` — Flag list with search/filter
4. `/investigations` — Investigation list and detail view
5. `/reports` — Report generation and download (PDF)
6. `/settings` — Admin/org settings
7. `/` — Public landing page

**Objective:** Establish baseline metrics, identify top opportunities.

**Instructions:**

1. Open Chrome DevTools (F12) → Lighthouse tab
2. Run audit on each page with:
   - Device: Mobile (Slow 4G + 4x CPU slowdown)
   - Clear storage: checked
3. Record results:
   - Performance score, LCP, FCP, CLS, INP
   - Accessibility, Best Practices, SEO scores
4. Repeat for Desktop (no throttling)
5. Export JSON for each page

**Key Metrics to Extract:**
- Performance score (target: > 85)
- Largest Contentful Paint (LCP) — milliseconds (target: < 2.5s)
- First Contentful Paint (FCP) — milliseconds (target: < 1.8s)
- Cumulative Layout Shift (CLS) — unitless (target: < 0.1)
- Interaction to Next Paint (INP) — milliseconds (target: < 200ms)

**Lighthouse Opportunities (WasteWatch-specific):**
- "Reduce unused JavaScript" (heavy chart libraries)
- "Defer offscreen images" (transaction list avatars)
- "Remove unused CSS" (Tailwind purging)
- "Serve images in next-gen formats" (OG images, logos)
- "Reduce unused CSS/JS from Recharts/D3"
- "Eliminate render-blocking resources"
- "Avoid excessively large DOM" (data tables with 1000+ rows need virtualization)
- "Avoid long main-thread tasks" (statistical analysis blocking UI)

**Classification:**
- P0: LCP > 4s, INP > 500ms, Performance < 50 (blocks MVP)
- P1: LCP > 2.5s, INP > 200ms, Performance < 85 (must fix before release)
- P2: Polish optimizations (80-85 score, < 2.5s LCP)

**Action:** Document baseline in README, create performance tracking spreadsheet.

---

### 1.2 WasteWatch-Specific Performance Concerns

**Large Data Visualization (Recharts/D3):**
- Dashboard has 5+ charts rendering simultaneously
- Each chart re-renders when filters change
- Risk: Recharts can cause layout shifts + INP issues with large datasets

**Large Dataset Handling:**
- Transactions table shows 100-1000+ rows
- Without virtualization: DOM explosion, memory leak risk
- CSV import parsing: 10,000+ transactions = main thread blockage

**Statistical Analysis:**
- Benford's Law chi-squared calculation: CPU-intensive
- Risk scoring: runs on each transaction
- Should move to Web Worker or batch process

**Report Generation (jsPDF):**
- Building PDF with 100+ charts/pages = main thread blockage
- Currently blocking UI while generating
- Should use Web Worker or stream generation

**Diagnosis Approach:**

1. **For Charts:** Open DevTools → Performance tab
   - Record while dashboard loads
   - Look for long "Render" tasks (Recharts rendering)
   - Check main thread blocking during interaction

2. **For Tables:** Check DOM node count
   - DevTools → Elements tab → Inspect table
   - If > 5000 nodes without virtualization: P0 issue
   - Use React Window or TanStack Virtual

3. **For Statistical Analysis:**
   - Check DevTools → Performance during "Analyze" button click
   - If main thread blocked > 50ms: move to Web Worker

4. **For PDF Generation:**
   - Monitor Performance tab during report download
   - If main thread blocked > 100ms: implement streaming

---

## STEP 2: CRITICAL OPTIMIZATIONS FOR WASTEWATCH

### 2.1 Chart Performance (Recharts/D3)

**Status Checklist:**
- [ ] Recharts charts lazy-load only when visible (Intersection Observer)
- [ ] Chart data is memoized and doesn't re-calculate on every render
- [ ] Large charts use dynamic imports (load on demand)
- [ ] Avoid re-rendering all charts when single filter changes
- [ ] D3 computations run in Web Worker for heavy analysis

**Problem 1: All Charts Re-render on Filter Change**

Current (bad):
```typescript
export function DashboardPage() {
  const [dateRange, setDateRange] = useState([]);

  // When dateRange changes, ALL charts re-render
  const chartData = useMemo(() => calculateChartData(dateRange), [dateRange]);

  return (
    <div>
      <RiskDistributionChart data={chartData} /> {/* expensive */}
      <VendorBreakdownChart data={chartData} /> {/* expensive */}
      <TimeSeriesChart data={chartData} /> {/* expensive */}
      <ComplianceChart data={chartData} /> {/* expensive */}
      <AnomalyPatternChart data={chartData} /> {/* expensive */}
    </div>
  );
}
```

Optimized (good):
```typescript
export function DashboardPage() {
  const [dateRange, setDateRange] = useState([]);

  return (
    <div>
      {/* Each chart memoized separately */}
      <RiskDistributionChart dateRange={dateRange} />
      <VendorBreakdownChart dateRange={dateRange} />
      <TimeSeriesChart dateRange={dateRange} />
      <ComplianceChart dateRange={dateRange} />
      <AnomalyPatternChart dateRange={dateRange} />
    </div>
  );
}

// Each chart component memoized
const RiskDistributionChart = memo(({ dateRange }: Props) => {
  const chartData = useMemo(() => calculateChartData(dateRange), [dateRange]);
  return <ResponsiveContainer><BarChart data={chartData} /></ResponsiveContainer>;
});
```

**Problem 2: Large Datasets Cause Recharts to Choke**

Recharts struggles with > 500 data points per chart.

Solution: Aggregate/sample data for visualization:
```typescript
function aggregateChartData(transactions, granularity = 'daily') {
  // Instead of 10,000 individual transactions → 30 days aggregated
  const aggregated = {};
  transactions.forEach(t => {
    const bucket = getDateBucket(t.date, granularity);
    aggregated[bucket] = (aggregated[bucket] || 0) + t.amount;
  });
  return Object.entries(aggregated).map(([date, amount]) => ({ date, amount }));
}
```

**Action Items:**
1. Memoize individual chart components
2. Sample/aggregate data for large datasets (> 1000 rows)
3. Lazy-load charts below fold with Intersection Observer
4. Benchmark: dashboard load time with 1000+ transactions
5. Commit: `perf(charts): memoize chart components, aggregate large datasets`

---

### 2.2 Data Table Virtualization

**Status Checklist:**
- [ ] Transactions table uses React Window or TanStack Virtual
- [ ] Flags table virtualized
- [ ] Vendors table virtualized
- [ ] Initial DOM < 500 nodes per table
- [ ] Smooth scrolling (60fps)

**Problem: Unvirtualized Table with 1000 Rows**

Current (bad):
```typescript
export function TransactionsTable({ transactions }: Props) {
  return (
    <table>
      <tbody>
        {transactions.map(t => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>{t.vendor}</td>
            <td>{t.amount}</td>
            <td>{t.riskScore}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
// Renders 1000 <tr> elements = 4000+ DOM nodes = lag
```

Optimized with TanStack Virtual (formerly react-virtual):
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function TransactionsTable({ transactions }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Row height in pixels
    overscan: 10, // Render 10 rows above/below viewport
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}>
        {virtualItems.map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderRow(transactions[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
// Renders only ~15 visible rows at a time = smooth scrolling
```

**Installation & Setup:**
```bash
npm install --save @tanstack/react-virtual
```

**Action Items:**
1. Install TanStack Virtual
2. Convert transactions/flags/vendors tables to virtualized
3. Benchmark: scrolling performance (should be 60fps)
4. Commit: `perf(tables): virtualize transaction/flag lists`

---

### 2.3 CSV/Excel Import Performance

**Status Checklist:**
- [ ] Large file parsing doesn't block UI (Web Worker or chunked processing)
- [ ] File size limit enforced (max 50MB)
- [ ] Progress bar shows parsing progress
- [ ] Validation runs in background

**Problem: Parsing 10,000 CSV Rows Freezes UI**

Current (bad):
```typescript
async function handleCSVUpload(file: File) {
  const text = await file.text();
  const rows = Papa.parse(text); // Blocks main thread for 3+ seconds
  // UI freezes while parsing
}
```

Optimized with chunked processing:
```typescript
async function handleCSVUpload(file: File) {
  const text = await file.text();

  // Parse in chunks to yield to browser
  const chunkSize = 100; // Process 100 rows at a time
  const allRows: any[] = [];

  // Use CSV parser with chunk callback
  Papa.parse(text, {
    header: true,
    chunkSize: 1024 * 100, // 100KB chunks
    chunk: (results, parser) => {
      // Process chunk
      allRows.push(...results.data);
      // Update progress UI
      updateProgress({ imported: allRows.length });
    },
    complete: () => {
      importTransactions(allRows);
    },
  });
}
```

Or use Web Worker:
```typescript
// main.ts
async function handleCSVUpload(file: File) {
  const worker = new Worker(new URL('./csv-parser.worker.ts', import.meta.url), {
    type: 'module',
  });

  worker.postMessage({ file });

  worker.onmessage = (event) => {
    const { rows, progress } = event.data;
    updateProgress(progress);
    if (rows) importTransactions(rows);
  };
}

// csv-parser.worker.ts
self.onmessage = async (event) => {
  const { file } = event.data;
  const text = await file.text();

  Papa.parse(text, {
    header: true,
    chunk: (results) => {
      self.postMessage({ rows: results.data, progress: results.data.length });
    },
  });
};
```

**Action Items:**
1. Implement chunked CSV parsing with progress updates
2. Or set up Web Worker for background parsing
3. Add file size validation (max 50MB)
4. Benchmark: import 10,000 rows without main thread blockage
5. Commit: `perf(import): chunked CSV parsing, no main thread blocking`

---

### 2.4 Statistical Analysis (Benford's Law, Risk Scoring)

**Status Checklist:**
- [ ] Benford's Law chi-squared doesn't block UI (Web Worker)
- [ ] Risk scoring computation is memoized
- [ ] Analysis runs in background with progress indication
- [ ] Results cached for repeated analyses

**Problem: Analyzing 10,000 Transactions for Benford's Law Freezes UI**

Solution: Web Worker
```typescript
// benford-analysis.worker.ts
self.onmessage = (event) => {
  const { amounts } = event.data;

  // Heavy calculation runs here, not on main thread
  const result = calculateBenfordsLaw(amounts);

  self.postMessage({ result });
};

// Using in component
function AnalyzeButton() {
  const [analyzing, setAnalyzing] = useState(false);
  const transactions = useStore(s => s.transactions);

  const handleAnalyze = () => {
    setAnalyzing(true);
    const worker = new Worker(new URL('./benford-analysis.worker', import.meta.url), {
      type: 'module',
    });

    const amounts = transactions.map(t => t.amount);
    worker.postMessage({ amounts });

    worker.onmessage = (event) => {
      const { result } = event.data;
      setAnalyzing(false);
      // Display results
    };
  };

  return <button onClick={handleAnalyze} disabled={analyzing}>Analyze</button>;
}
```

**Action Items:**
1. Move Benford's Law to Web Worker
2. Move risk scoring to Web Worker (if analyzing large batches)
3. Add progress indication for analyses
4. Cache results (don't re-analyze same data)
5. Benchmark: analyze 10,000 transactions without main thread blockage
6. Commit: `perf(analysis): move statistical computations to Web Worker`

---

### 2.5 Report Generation (jsPDF)

**Status Checklist:**
- [ ] PDF generation doesn't block UI (Web Worker)
- [ ] Progress indication while generating
- [ ] Large PDFs (100+ pages) use streaming/chunking
- [ ] Images optimized before embedding in PDF

**Problem: Generating PDF with 50+ charts Freezes UI for 10+ Seconds**

Solution: Web Worker + Streaming
```typescript
// pdf-generator.worker.ts
self.onmessage = async (event) => {
  const { reportData, config } = event.data;

  const pdf = new jsPDF();
  let pageIndex = 0;

  // Generate in chunks and send back
  for (const section of reportData.sections) {
    // Add content to page
    pdf.text(section.title, 10, 10 + pageIndex * 30);

    if (section.chart) {
      // Compress image before embedding
      const compressedImg = await compressImage(section.chart);
      pdf.addImage(compressedImg, 'JPEG', 10, 40, 190, 100);
    }

    pdf.addPage();
    pageIndex++;

    // Send progress update
    self.postMessage({
      progress: (pageIndex / reportData.sections.length) * 100,
    });
  }

  // Send final PDF
  const pdfBlob = pdf.output('blob');
  self.postMessage({ completed: true, pdf: pdfBlob });
};

// Using in component
function GenerateReportButton() {
  const [progress, setProgress] = useState(0);
  const reportData = useStore(s => s.reportData);

  const handleGenerateReport = () => {
    const worker = new Worker(new URL('./pdf-generator.worker', import.meta.url), {
      type: 'module',
    });

    worker.postMessage({ reportData, config: {} });

    worker.onmessage = (event) => {
      if (event.data.progress) {
        setProgress(event.data.progress);
      }

      if (event.data.completed) {
        // Download PDF
        const url = URL.createObjectURL(event.data.pdf);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'investigation-report.pdf';
        a.click();
      }
    };
  };

  return (
    <div>
      <button onClick={handleGenerateReport}>Generate PDF Report</button>
      {progress > 0 && <ProgressBar value={progress} />}
    </div>
  );
}
```

**Action Items:**
1. Move PDF generation to Web Worker
2. Optimize images before embedding (compress to < 100KB each)
3. Implement progress indication
4. Test with large reports (100+ pages)
5. Benchmark: generate 50-page report without UI blocking
6. Commit: `perf(reports): PDF generation in Web Worker with progress`

---

## STEP 3: BUNDLE SIZE OPTIMIZATION

### 3.1 Bundle Analysis

**Objective:** Identify and eliminate unnecessary code.

**Install & Run:**
```bash
npm install --save-dev @next/bundle-analyzer
```

**File: next.config.ts** (add bundle analyzer)
```typescript
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  // ... existing config
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
```

**Run Analysis:**
```bash
ANALYZE=true npm run build
# Then open .next/analyze/__openFileWithDefaultApp-*.html
```

**WasteWatch-Specific Issues to Look For:**
- Recharts: 100KB+ (check if we're using all chart types)
- D3: 70KB+ (check granularity of imports)
- jsPDF: 150KB+ (necessary for reports)
- Zustand: 2KB (good)
- Next.js: 50KB+ (acceptable)

**Tree-Shaking Check for Recharts:**
```typescript
// ❌ BAD: Imports entire Recharts
import * as Recharts from 'recharts';

// ✅ GOOD: Named imports
import { BarChart, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
```

**Action Items:**
1. Run bundle analyzer
2. Verify chart libraries are tree-shaken
3. Remove unused chart types if possible
4. Target: first-load JS < 120KB (gzip)
5. Commit: `perf(bundle): analyze and optimize dependencies`

---

### 3.2 Dynamic Imports for Heavy Components

**Status Checklist:**
- [ ] Report builder loaded on demand (dynamic import)
- [ ] Settings pages loaded on demand
- [ ] Advanced filter UI loaded only when needed
- [ ] Admin-only pages loaded only for admins

**Implementation:**
```typescript
import dynamic from 'next/dynamic';

// Load report builder only when needed
const ReportBuilder = dynamic(
  () => import('@/components/ReportBuilder'),
  { loading: () => <SkeletonLoader /> }
);

// Load advanced filters only when "Advanced" button clicked
const AdvancedFilters = dynamic(
  () => import('@/components/AdvancedFilters'),
  { loading: () => <div>Loading filters...</div> }
);

export function InvestigationsPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAdvanced(!showAdvanced)}>
        Advanced Filters
      </button>
      {showAdvanced && <AdvancedFilters />}
    </div>
  );
}
```

**Action Items:**
1. Identify large, conditionally-rendered components
2. Convert to dynamic imports
3. Test: verify code splitting in bundle analyzer
4. Commit: `perf(imports): dynamic import for large components`

---

## STEP 4: REAL USER MONITORING (RUM)

### 4.1 Setup Web Vitals

**Install:**
```bash
npm install web-vitals
```

**File: lib/vitals.ts**
```typescript
import { getCLS, getFCP, getFID, getLCP, getTTFB, INPValue } from 'web-vitals';

export function reportWebVitals(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    rating: metric.rating,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });

  // Send to analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { method: 'POST', body, keepalive: true });
  }

  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Vitals] ${metric.name}: ${metric.value}ms (${metric.rating})`);
  }
}

export function initWebVitals() {
  getCLS(reportWebVitals);
  getFCP(reportWebVitals);
  getLCP(reportWebVitals);
  getTTFB(reportWebVitals);
}
```

**File: app/vitals.tsx**
```typescript
'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}
```

**File: app/layout.tsx** (include reporter)
```typescript
import { WebVitalsReporter } from './vitals';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

**API Endpoint: app/api/vitals/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log to console for now
    console.log('[Vitals]', body);

    // TODO: Store in database or send to analytics service
    // await db.vitals.create(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
```

**Action Items:**
1. Set up web-vitals library
2. Create vitals API endpoint
3. Monitor metrics in production
4. Set up alerts for regressions (LCP > 3s, INP > 250ms)
5. Review RUM data weekly

---

## STEP 5: PERFORMANCE CHECKLIST

**Final Verification:**

- [ ] Lighthouse Performance score > 85
- [ ] LCP < 2.5s (mobile, slow 4G)
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] First-load JS < 120KB (gzip)
- [ ] Dashboard with 5 charts loads < 3s
- [ ] CSV import doesn't block UI
- [ ] PDF generation doesn't block UI
- [ ] Data tables virtualized and scroll smoothly
- [ ] Chart memoization working (no unnecessary re-renders)
- [ ] Web Vitals monitoring active
- [ ] Bundle analyzer shows tree-shaking working
- [ ] All dynamic imports configured
- [ ] No unused dependencies

**Commit:**
```bash
git add .
git commit -m "perf: comprehensive performance audit and optimizations

- Virtualize data tables (TanStack Virtual)
- Memoize chart components separately
- Move heavy computations to Web Worker (Benford's, PDF generation)
- Chunked CSV parsing without main thread blockage
- Dynamic imports for heavy components
- Web Vitals monitoring configured
- Bundle analysis: first-load JS reduced by X%

Lighthouse Score: 85+
LCP: 2.2s (mobile), 1.1s (desktop)
INP: 145ms
CLS: 0.08
"
```
