# 02-BACKEND-API.md — WasteWatch Backend & API Audit

> **Purpose:** Complete audit of WasteWatch backend architecture, API layer, data handling, and integration patterns.
>
> **Scope:** API routes, Prisma ORM, multi-tenant data isolation, CSV/Excel imports, report generation, transaction analysis.
>
> **Critical Context:** WasteWatch API routes are currently STUBS. This audit defines implementation priorities.
>
> **Time Estimate:** 6-8 hours
>
> **Tech Stack:**
> - Next.js 16.1.6 (App Router)
> - Prisma 7.4.1 + PostgreSQL 16
> - Zustand 5.0.11 (state management)
> - NextAuth 5.0.0-beta.30 (authentication)

---

## CONTEXT SETUP

**Database & ORM:**
```
DATABASE: PostgreSQL 16
ORM: Prisma 7.4.1
MULTI-TENANT: Organization-scoped queries (org_id foreign key on all tables)
STATE: Zustand 5.0.11
AUTH: NextAuth 5.0.0-beta.30
```

**Known Issues (Starting State):**
- API routes are STUBS — need full implementation
- No CSV/Excel import pipeline
- No report generation
- No transaction analysis endpoints
- Organization scoping may not be complete

---

# STEP 1: API LAYER ARCHITECTURE

## 1.1 Centralized API Client

**Objective:** Ensure all client-side API calls use a single, typed client with proper error handling and auth header injection.

### Audit Checklist:
- [ ] Single API client exists (`lib/api-client.ts`)
- [ ] Base URL read from `NEXT_PUBLIC_API_URL` env var
- [ ] All HTTP methods wrapped (GET, POST, PUT, PATCH, DELETE)
- [ ] Request interceptor adds `Authorization: Bearer` token
- [ ] Response interceptor handles errors (401, 500, network)
- [ ] Response typed with generics (`ApiResult<T>`)
- [ ] Timeout configured (30s recommended)
- [ ] Retry logic for network failures (optional but recommended)

### Implementation:

```typescript
// lib/api-client.ts
import { auth } from '@/lib/auth'

interface ApiResponse<T> {
  data: T
  error: null
}

interface ApiErrorResponse {
  data: null
  error: {
    message: string
    statusCode: number
    details?: Record<string, unknown>
  }
}

type ApiResult<T> = ApiResponse<T> | ApiErrorResponse

interface RequestConfig extends RequestInit {
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout = 30000 // 30 seconds

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const { timeout = this.defaultTimeout, ...fetchConfig } = config

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const headers = new Headers(fetchConfig.headers || {})

      // Add auth token from NextAuth session
      const session = await auth()
      if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`)
      }

      headers.set('Content-Type', 'application/json')

      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')
      const body = isJson ? await response.json() : await response.text()

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: body?.message || 'An error occurred',
            statusCode: response.status,
            details: body?.details,
          },
        }
      }

      return {
        data: body as T,
        error: null,
      }
    } catch (err) {
      clearTimeout(timeoutId)

      if (err instanceof DOMException && err.name === 'AbortError') {
        return {
          data: null,
          error: {
            message: 'Request timeout',
            statusCode: 0,
          },
        }
      }

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        return {
          data: null,
          error: {
            message: 'Network error — check your connection',
            statusCode: 0,
          },
        }
      }

      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'Unknown error',
          statusCode: 0,
        },
      }
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
```

### Issues to Check For:
1. **Hardcoded API URLs** → Move to `NEXT_PUBLIC_API_URL`
2. **Scattered fetch() calls** → Refactor to centralized client
3. **Missing auth headers** → Implement request interceptor
4. **No timeout** → Add AbortController with 30s default
5. **Untyped responses** → Enforce `ApiResult<T>` everywhere
6. **No error handling** → Check `if (result.error)` on every call

---

## 1.2 API Route Structure & Standards

**Objective:** All API routes follow consistent patterns: input validation, auth checks, organization scoping, proper HTTP codes, typed responses.

### Audit Checklist:
- [ ] All routes have Zod input validation
- [ ] All protected routes check authentication first
- [ ] All database queries scoped to `organizationId`
- [ ] HTTP status codes correct (201 for POST, 204 for DELETE, 400 for validation errors)
- [ ] All error responses include `error` and `message` fields
- [ ] Responses consistently typed (no `any`)
- [ ] CORS headers if needed (usually not in Next.js App Router)

### Standard Route Handler Pattern:

```typescript
// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Define input schema
const CreateTransactionSchema = z.object({
  vendorId: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
  description: z.string().min(1).max(500),
  departmentId: z.string().min(1),
})

type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>

// Define response type
interface TransactionResponse {
  id: string
  vendorId: string
  amount: number
  date: string
  description: string
  departmentId: string
  riskScore: number
  createdAt: string
}

/**
 * GET /api/transactions
 * Fetch transactions with pagination and filtering (org-scoped)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get organization from user (via Prisma)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    })

    if (!user?.organization?.id) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // 3. Parse query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const vendorId = searchParams.get('vendorId')
    const minRiskScore = searchParams.get('minRiskScore')
      ? parseFloat(searchParams.get('minRiskScore')!)
      : undefined

    // 4. Query database (ORG-SCOPED)
    const transactions = await db.transaction.findMany({
      where: {
        organizationId: user.organization.id, // CRITICAL: org scoping
        ...(vendorId && { vendorId }),
        ...(minRiskScore && { riskScore: { gte: minRiskScore } }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    })

    const total = await db.transaction.count({
      where: {
        organizationId: user.organization.id,
        ...(vendorId && { vendorId }),
        ...(minRiskScore && { riskScore: { gte: minRiskScore } }),
      },
    })

    // 5. Return response
    return NextResponse.json({
      data: transactions as TransactionResponse[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a new transaction (org-scoped)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get organization
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    })

    if (!user?.organization?.id) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // 3. Parse and validate body
    const body = await request.json()
    const validatedData = CreateTransactionSchema.parse(body)

    // 4. Create transaction (org-scoped)
    const transaction = await db.transaction.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id, // Set org automatically
        riskScore: 0, // Placeholder — will be calculated by analysis engine
      },
    })

    // 5. Return created response
    return NextResponse.json(
      { data: transaction } as { data: TransactionResponse },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.flatten(),
        },
        { status: 400 }
      )
    }

    console.error('POST /api/transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 1.3 WasteWatch Endpoint Specifications

**These endpoints are currently STUBS and need full implementation.**

### Priority Tier 1: Core Data Endpoints

#### GET /api/analysis
Returns fraud analysis summary for dashboard.

**Response:**
```typescript
{
  "data": {
    "totalTransactions": 12450,
    "flaggedTransactions": 87,
    "avgRiskScore": 5.2,
    "criticalFlags": 12,
    "benfordsLawScore": 0.087,
    "topAnomalies": [
      {
        "type": "round_numbers",
        "count": 45,
        "severity": "high"
      }
    ]
  }
}
```

#### GET /api/departments
List departments with aggregated fraud metrics.

**Query Params:**
- `page?: number` (default: 1)
- `limit?: number` (default: 50)
- `sortBy?: 'name' | 'riskScore' | 'flagCount'` (default: 'name')

**Response:**
```typescript
{
  "data": [
    {
      "id": "dept-123",
      "name": "IT Procurement",
      "budget": 500000,
      "spent": 450000,
      "transactionCount": 234,
      "flagCount": 12,
      "avgRiskScore": 6.1,
      "potentialSavings": 45000
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 8, "pages": 1 }
}
```

#### GET /api/vendors
List vendors with fraud detection metrics.

**Query Params:**
- `page?: number`
- `limit?: number`
- `riskLevel?: 'low' | 'medium' | 'high' | 'critical'`
- `sortBy?: 'name' | 'riskScore' | 'transactionCount'`

**Response:**
```typescript
{
  "data": [
    {
      "id": "vendor-456",
      "name": "Acme Corp",
      "transactionCount": 234,
      "totalSpent": 125000,
      "avgTransactionAmount": 534.18,
      "riskScore": 7.8,
      "anomalies": ["round_numbers", "duplicate_vendor"],
      "fcaComplaints": 2
    }
  ],
  "pagination": { ... }
}
```

#### GET /api/flags
List fraud flags/anomalies with details.

**Query Params:**
- `page?: number`
- `limit?: number`
- `status?: 'open' | 'reviewed' | 'cleared'`
- `type?: 'benford' | 'duplicate' | 'ghost_vendor' | 'round_amount' | ...`
- `severityMin?: number` (1-4)

**Response:**
```typescript
{
  "data": [
    {
      "id": "flag-789",
      "transactionId": "tx-001",
      "type": "round_amount",
      "severity": 2,
      "description": "Suspiciously round amount: $50,000.00",
      "riskScore": 6.5,
      "status": "open",
      "createdAt": "2024-01-15T10:30:00Z",
      "reviewedBy": null
    }
  ],
  "pagination": { ... }
}
```

### Priority Tier 2: Analysis & Reporting

#### POST /api/analysis/benford
Run Benford's Law analysis on transactions.

**Request:**
```typescript
{
  "vendorId"?: string,
  "departmentId"?: string,
  "dateRange"?: {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

**Response:**
```typescript
{
  "data": {
    "digitDistribution": [
      { "digit": 1, "observed": 0.318, "expected": 0.301, "chiSquared": 0.015 },
      { "digit": 2, "observed": 0.175, "expected": 0.176, "chiSquared": 0.0001 }
    ],
    "chiSquaredStatistic": 0.087,
    "pValue": 0.995,
    "anomaly": false,
    "analysis": "Distribution matches Benford's Law expectations"
  }
}
```

#### POST /api/analysis/risk-score
Calculate risk score for a transaction or set of transactions.

**Request:**
```typescript
{
  "transactionIds": ["tx-001", "tx-002"],
  "includeContext"?: true
}
```

**Response:**
```typescript
{
  "data": [
    {
      "transactionId": "tx-001",
      "riskScore": 7.2,
      "breakdown": {
        "benford": 0.3,
        "amount_pattern": 0.4,
        "vendor_history": 0.5,
        "frequency_anomaly": 0.0
      },
      "flags": ["round_amount", "vendor_repeated_same_amount"]
    }
  ]
}
```

#### GET /api/reports
Generate fraud analysis reports.

**Query Params:**
- `type?: 'summary' | 'detailed' | 'by_vendor' | 'by_department'`
- `format?: 'json' | 'csv' | 'pdf'`
- `dateRange`: required
  - `startDate`: YYYY-MM-DD
  - `endDate`: YYYY-MM-DD

**Response (JSON):**
```typescript
{
  "data": {
    "reportId": "report-123",
    "generatedAt": "2024-01-15T10:30:00Z",
    "type": "summary",
    "dateRange": { "startDate": "2024-01-01", "endDate": "2024-12-31" },
    "metrics": {
      "totalTransactions": 12450,
      "flaggedCount": 87,
      "totalSpent": 5000000,
      "potentialSavings": 125000,
      "avgRiskScore": 5.2
    },
    "topFraudVendors": [
      { "vendorId": "v-456", "vendorName": "Acme Corp", "riskScore": 8.1, "flags": 45 }
    ],
    "topFraudDepartments": [
      { "deptId": "d-123", "deptName": "IT", "riskScore": 7.2, "flags": 23 }
    ]
  },
  "downloadUrl"?: "https://..."
}
```

### Priority Tier 3: Data Import

#### POST /api/import
Upload and import CSV/Excel transaction files.

**Request (multipart/form-data):**
- `file`: File (CSV or Excel)
- `departmentId`: string (optional, auto-detect from file)
- `skipValidation`?: boolean (default: false)

**Response:**
```typescript
{
  "data": {
    "importId": "import-123",
    "filename": "transactions_q1.csv",
    "status": "processing" | "completed" | "failed",
    "totalRows": 5000,
    "successfulRows": 4998,
    "failedRows": 2,
    "errors": [
      { "rowNumber": 45, "error": "Invalid amount format" }
    ],
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": null
  }
}
```

**CSV Format Expected:**
```
vendor_name,amount,date,description,department
Acme Corp,12500.00,2024-01-15,Software license,IT
Smith Supplies,3400.50,2024-01-14,Office equipment,Admin
```

### Priority Tier 4: Demonstration/Demo

#### GET /api/demo
Populate organization with sample fraud data for testing.

**Response:**
```typescript
{
  "data": {
    "message": "Demo data loaded successfully",
    "transactionsCreated": 500,
    "vendorsCreated": 50,
    "departmentsCreated": 5,
    "flagsCreated": 87
  }
}
```

---

## 1.4 Multi-Tenant Organization Scoping

**CRITICAL:** Every database query MUST filter by `organizationId` to prevent data leakage.

### Pattern to Follow:

```typescript
// ✓ CORRECT: Organization-scoped query
const transactions = await db.transaction.findMany({
  where: {
    organizationId: user.organization.id, // MUST include
    vendorId: vendorId,
  },
})

// ✗ WRONG: Missing organization scope
const transactions = await db.transaction.findMany({
  where: {
    vendorId: vendorId, // Missing organizationId filter!
  },
})
```

### Prisma Schema (Verification):

```prisma
model Transaction {
  id                String   @id @default(cuid())
  organizationId    String   // CRITICAL: Foreign key
  organization      Organization @relation(fields: [organizationId], references: [id])
  vendorId          String
  vendor            Vendor @relation(fields: [vendorId], references: [id])
  amount            Decimal
  date              DateTime
  riskScore         Float
  createdAt         DateTime @default(now())

  @@index([organizationId]) // Index for scoped queries
  @@index([vendorId])
  @@unique([organizationId, id]) // Composite index for safety
}

model Vendor {
  id                String   @id @default(cuid())
  organizationId    String   // CRITICAL
  organization      Organization @relation(fields: [organizationId], references: [id])
  name              String
  transactions      Transaction[]
  riskScore         Float

  @@unique([organizationId, name])
  @@index([organizationId])
}

model Department {
  id                String   @id @default(cuid())
  organizationId    String   // CRITICAL
  organization      Organization @relation(fields: [organizationId], references: [id])
  name              String
  budget            Decimal
  transactions      Transaction[]

  @@unique([organizationId, name])
  @@index([organizationId])
}

model Organization {
  id                String   @id @default(cuid())
  name              String
  users             User[]
  transactions      Transaction[]
  vendors           Vendor[]
  departments       Department[]
  flags             Flag[]
  createdAt         DateTime @default(now())
}
```

### Audit Checklist:

- [ ] All Transaction queries include `organizationId` filter
- [ ] All Vendor queries include `organizationId` filter
- [ ] All Department queries include `organizationId` filter
- [ ] All Flag queries include `organizationId` filter
- [ ] User organization extracted from session at route start
- [ ] Composite indexes on (organizationId, id) for safety
- [ ] No "public" endpoints that bypass org scoping

---

## 1.5 CSV/Excel Import Pipeline

**Currently:** Not implemented

**Required Implementation:**

```typescript
// app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseCSV } from '@/lib/import/csv-parser'
import { validateTransaction } from '@/lib/import/validators'

const ImportSchema = z.object({
  vendorName: z.string().min(1),
  amount: z.string().transform(val => parseFloat(val)),
  date: z.string().transform(val => new Date(val)),
  description: z.string().optional(),
  department: z.string().optional(),
})

type ImportRow = z.infer<typeof ImportSchema>

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    })

    if (!user?.organization?.id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Parse multipart form
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    const results = {
      totalRows: rows.length,
      successfulRows: 0,
      failedRows: 0,
      errors: [] as Array<{ rowNumber: number; error: string }>,
      transactionIds: [] as string[],
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      try {
        const validated = ImportSchema.parse(rows[i])

        // Find or create vendor
        let vendor = await db.vendor.findFirst({
          where: {
            organizationId: user.organization.id,
            name: validated.vendorName,
          },
        })

        if (!vendor) {
          vendor = await db.vendor.create({
            data: {
              organizationId: user.organization.id,
              name: validated.vendorName,
              riskScore: 0,
            },
          })
        }

        // Create transaction
        const transaction = await db.transaction.create({
          data: {
            organizationId: user.organization.id,
            vendorId: vendor.id,
            amount: validated.amount,
            date: validated.date,
            description: validated.description || '',
            riskScore: 0, // Will be calculated by analysis engine
          },
        })

        results.transactionIds.push(transaction.id)
        results.successfulRows++
      } catch (error) {
        results.failedRows++
        results.errors.push({
          rowNumber: i + 2, // +2 for header row
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ data: results }, { status: 201 })
  } catch (error) {
    console.error('POST /api/import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
```

---

## 1.6 Error Handling & Logging

**Audit Checklist:**

- [ ] All endpoints have try-catch blocks
- [ ] Validation errors return 400 with schema details
- [ ] Auth errors return 401
- [ ] Not found errors return 404
- [ ] Server errors return 500 with generic message
- [ ] Errors logged to console or logging service (not exposed to client)
- [ ] No stack traces in production responses

---

# STEP 2: PRISMA ORM BEST PRACTICES

## 2.1 Query Optimization

### Audit Checklist:

- [ ] N+1 queries eliminated with `include()` or `select()`
- [ ] Large datasets paginated with `skip()` and `take()`
- [ ] Indexes created on frequently filtered fields
- [ ] Complex queries use raw SQL with parameters (for performance)
- [ ] Prisma Client result caching considered (for static data)

### Good Pattern:

```typescript
// ✓ GOOD: Single query with include
const vendors = await db.vendor.findMany({
  where: { organizationId: orgId },
  include: {
    transactions: { select: { id: true, amount: true } },
  },
  take: 50,
})

// ✗ BAD: N+1 queries
const vendors = await db.vendor.findMany({
  where: { organizationId: orgId },
})
vendors.forEach(async v => {
  // This runs a query for EACH vendor!
  const txns = await db.transaction.findMany({
    where: { vendorId: v.id },
  })
})
```

---

## 2.2 Data Integrity Checks

**Audit Checklist:**

- [ ] Foreign keys enforce referential integrity
- [ ] Soft deletes used for audit trails (optional)
- [ ] Timestamps on all entities (`createdAt`, `updatedAt`)
- [ ] Unique constraints on business keys
- [ ] No orphaned records (cascade delete or soft delete)

---

# STEP 3: INTEGRATION PATTERNS

## 3.1 Transaction Analysis Engine Integration

The Statistical Analysis Engine (separate module) must receive transaction data and return risk scores.

**Expected Integration Point:**

```typescript
// After transaction creation/import, trigger analysis
import { analyzeTransaction } from '@/lib/analysis/engine'

const transaction = await db.transaction.create({
  data: { ... }
})

// Run analysis asynchronously
void (async () => {
  const riskData = await analyzeTransaction(transaction)
  await db.transaction.update({
    where: { id: transaction.id },
    data: { riskScore: riskData.score },
  })
})()
```

---

## 3.2 Webhook/Event Patterns (Future)

**For FCA complaint integration or external fraud data:**

```typescript
// app/api/webhooks/fca/route.ts
export async function POST(request: NextRequest) {
  // Verify webhook signature
  const signature = request.headers.get('X-Signature')
  if (!verifySignature(signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = await request.json()

  // Process FCA complaint data
  await db.flag.create({
    data: {
      organizationId: body.organizationId,
      type: 'fca_complaint',
      description: body.complaint,
    },
  })

  return NextResponse.json({ success: true })
}
```

---

# STEP 4: COMPREHENSIVE AUDIT CHECKLIST

### API Routes & Endpoints
- [ ] All stub endpoints have full implementations
- [ ] GET /api/analysis returns dashboard summary
- [ ] GET /api/departments returns paginated dept list
- [ ] GET /api/vendors returns paginated vendor list
- [ ] GET /api/flags returns paginated flags
- [ ] POST /api/analysis/benford runs Benford's Law
- [ ] POST /api/analysis/risk-score calculates risk
- [ ] GET /api/reports generates reports
- [ ] POST /api/import handles CSV/Excel upload

### Organization Scoping
- [ ] Every database query includes organizationId filter
- [ ] User organization extracted from session
- [ ] No queries leak data across organizations
- [ ] Composite indexes on (organizationId, id)
- [ ] No "public" endpoints

### Error Handling
- [ ] All endpoints have try-catch
- [ ] Validation errors return 400
- [ ] Auth errors return 401
- [ ] Server errors return 500 (generic message)
- [ ] No stack traces in production

### Data Validation
- [ ] All POST/PATCH endpoints validate input with Zod
- [ ] Validation errors include field details
- [ ] No SQL injection possible (Prisma parameterizes)
- [ ] File uploads validated (type, size)

### Database & Prisma
- [ ] N+1 queries eliminated
- [ ] Large datasets paginated
- [ ] Indexes on filtered fields
- [ ] Timestamps on all entities
- [ ] Foreign key constraints

### Response Format Consistency
- [ ] Success responses: `{ data: T }`
- [ ] List responses: `{ data: T[], pagination: {...} }`
- [ ] Error responses: `{ error: string, details?: {...} }`
- [ ] HTTP codes: 200, 201, 204, 400, 401, 404, 500

### API Documentation
- [ ] All endpoints documented (URL, method, auth, params, response)
- [ ] Response types exported from `lib/api-types.ts`
- [ ] Client can infer types from API

### Performance
- [ ] Response times < 500ms for list endpoints
- [ ] Large imports processed asynchronously
- [ ] Report generation doesn't block
- [ ] Caching considered for expensive queries

