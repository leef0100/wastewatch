# 10-DEPLOYMENT.md — Deployment & CI/CD Audit (WasteWatch)

> **Audit Phase 10 of 11: Deployment, Infrastructure, and Production Readiness for WasteWatch**
>
> WasteWatch is government-grade SaaS requiring robust deployment, security, multi-tenancy isolation, and audit logging. This audit covers Docker containerization, PostgreSQL setup with Prisma, NextAuth security, environment management, CI/CD pipelines, monitoring, and production readiness for government clients.

---

## DEPLOYMENT CONTEXT

**Stack:**
- Next.js 16.1.6 (Node.js framework)
- PostgreSQL 16 + Prisma 7.4.1 (ORM)
- NextAuth 5.0.0-beta.30 (Authentication)
- Zustand 5.0.11 (Client state)
- Docker (containerization)
- GitHub Actions (CI/CD recommended)
- Whop.com integration (payment processor)

**Deployment Target:** Self-hosted Docker (government requirement for data sovereignty)
**Monitoring:** Sentry recommended (no current setup)
**Backup Strategy:** Required for government compliance

---

## STEP 1: DOCKER CONTAINERIZATION

### 1.1 Multi-Stage Dockerfile

WasteWatch requires a production-ready Dockerfile with proper layering for Next.js standalone output.

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# Install dependencies layer
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Build layer
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production layer
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built app and dependencies
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy prisma schema for migrations
COPY --chown=nextjs:nodejs prisma ./prisma

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Entrypoint: Run migrations, then start app
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
CMD ["node", "server.js"]
```

**Docker entrypoint script:**

```bash
#!/bin/bash
# scripts/docker-entrypoint.sh

set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --skip-generate

echo "Starting WasteWatch server..."
exec "$@"
```

**Audit Checklist:**

- [ ] Dockerfile uses multi-stage build (reduces image size)
- [ ] Production image is based on lightweight `alpine` image
- [ ] Node.js version matches `package.json` (20.x)
- [ ] Non-root user created for security (`nextjs` user)
- [ ] `NEXT_TELEMETRY_DISABLED=1` set (no telemetry for government)
- [ ] Health check endpoint configured (`/api/health`)
- [ ] Prisma migrations run at container startup
- [ ] Environment variables documented in Dockerfile comments

---

### 1.2 Docker Compose Setup

For local development and testing:

```yaml
# docker-compose.yml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: wastewatch-db
    environment:
      POSTGRES_USER: ${DB_USER:-wastewatch}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: ${DB_NAME:-wastewatch}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-wastewatch}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - wastewatch

  # WasteWatch Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: wastewatch-app
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER:-wastewatch}:${DB_PASSWORD:-changeme}@postgres:5432/${DB_NAME:-wastewatch}
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:-dev-secret-change-in-production}
      NEXT_PUBLIC_API_URL: http://localhost:3000/api
      WHOP_API_KEY: ${WHOP_API_KEY:-}
      WHOP_WEBHOOK_SECRET: ${WHOP_WEBHOOK_SECRET:-}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - wastewatch

volumes:
  postgres-data:

networks:
  wastewatch:
    driver: bridge
```

**Usage:**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app npx prisma migrate dev

# Stop services
docker-compose down
```

---

## STEP 2: ENVIRONMENT VARIABLES

### 2.1 Environment Variable Schema

WasteWatch requires strict environment validation for government compliance.

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  // Server-side secrets
  server: {
    DATABASE_URL: z.string().url('Invalid database URL'),
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL'),

    // Whop billing integration
    WHOP_API_KEY: z.string().min(20, 'Invalid Whop API key'),
    WHOP_WEBHOOK_SECRET: z.string().min(20, 'Invalid Whop webhook secret'),

    // Audit & monitoring
    SENTRY_DSN: z.string().url().optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  },

  // Client-side public variables
  client: {
    NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL'),
    NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },

  // Runtime mapping
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    WHOP_API_KEY: process.env.WHOP_API_KEY,
    WHOP_WEBHOOK_SECRET: process.env.WHOP_WEBHOOK_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  emitWarningOnMissingServerSecrets: true,
});
```

**Audit Checklist:**

- [ ] `DATABASE_URL` is PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` is cryptographically random (32+ chars)
- [ ] `NEXTAUTH_URL` matches deployment domain
- [ ] No hardcoded secrets in `.env.example`
- [ ] Environment variables validated at startup
- [ ] Build fails if required vars are missing
- [ ] Client-only vars prefixed with `NEXT_PUBLIC_`
- [ ] Server-only vars NOT prefixed with `NEXT_PUBLIC_`

**Example `.env.production`:**

```
# Database
DATABASE_URL=postgresql://wastewatch:SECURE_PASSWORD@db.prod.internal:5432/wastewatch

# Authentication
NEXTAUTH_URL=https://wastewatch.gov-agency.org
NEXTAUTH_SECRET=RANDOM_32_CHAR_STRING_HERE

# Payment Processing (Whop)
WHOP_API_KEY=whop_api_key_prod_xxx
WHOP_WEBHOOK_SECRET=whop_webhook_secret_prod_xxx

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
LOG_LEVEL=warn

# Client-visible
NEXT_PUBLIC_API_URL=https://wastewatch.gov-agency.org/api
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project-id
```

---

## STEP 3: PRISMA & DATABASE

### 3.1 Prisma Schema Audit

WasteWatch's Prisma schema must enforce multi-tenancy and audit logging.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Organizations (multi-tenant)
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  departments Department[]
  vendors   Vendor[]
  flags     Flag[]
  investigations Investigation[]
  reports   Report[]

  @@index([slug])
}

// Users with role-based access
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  password      String   // Hashed with bcrypt
  role          Role     @default(VIEWER)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  investigations Investigation[]
  auditLogs      AuditLog[]

  @@index([organizationId])
  @@index([email])
}

enum Role {
  ADMIN
  ANALYST
  VIEWER
}

// Departments
model Department {
  id       String @id @default(cuid())
  name     String
  code     String // e.g., "ENG", "HR"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  vendors Vendor[]
  flags   Flag[]

  @@unique([organizationId, code])
  @@index([organizationId])
}

// Vendors
model Vendor {
  id       String @id @default(cuid())
  name     String
  ein      String? // Employer ID Number
  totalSpend Float @default(0)
  transactionCount Int @default(0)
  riskScore Float @default(0) // 0-100 scale
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  departmentId String
  department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)

  transactions Transaction[]
  flags       Flag[]
  investigations Investigation[]

  @@unique([organizationId, ein])
  @@index([organizationId])
  @@index([departmentId])
}

// Red Flags (anomalies detected by analysis engine)
model Flag {
  id          String   @id @default(cuid())
  title       String
  description String
  severity    Severity @default(MEDIUM)
  riskScore   Float    // 0-100 (higher = more suspicious)

  // Context
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  departmentId   String?
  department     Department? @relation(fields: [departmentId], references: [id], onDelete: SetNull)

  vendorId       String?
  vendor         Vendor? @relation(fields: [vendorId], references: [id], onDelete: SetNull)

  // Analysis details
  anomalyType    String // e.g., "price-spike", "duplicate-payment", "outlier-vendor"
  analysisData   Json   // Statistical details: mean, std-dev, threshold, etc.
  affectedCount  Int    // Number of transactions

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  resolvedAt     DateTime?

  investigations Investigation[]
  auditLogs      AuditLog[]

  @@index([organizationId])
  @@index([vendorId])
  @@index([departmentId])
  @@index([severity])
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

// Investigations
model Investigation {
  id          String @id @default(cuid())
  title       String
  description String
  status      InvestigationStatus @default(DRAFT)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  assignedToId String
  assignedTo   User @relation(fields: [assignedToId], references: [id])

  vendorId String?
  vendor   Vendor? @relation(fields: [vendorId], references: [id], onDelete: SetNull)

  flags    Flag[]

  // FCA Complaint data
  fcaSubmissionId String?
  fcaSubmittedAt  DateTime?
  fcaAgency       String?
  estimatedLoss   Float?

  timeline      InvestigationTimeline[]
  evidence      Evidence[]
  auditLogs     AuditLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  closedAt  DateTime?

  @@index([organizationId])
  @@index([assignedToId])
  @@index([vendorId])
  @@index([status])
}

enum InvestigationStatus {
  DRAFT
  ACTIVE
  UNDER_REVIEW
  SUBMITTED
  CLOSED
}

// Investigation timeline
model InvestigationTimeline {
  id          String @id @default(cuid())
  investigationId String
  investigation   Investigation @relation(fields: [investigationId], references: [id], onDelete: Cascade)

  entry       String
  createdAt   DateTime @default(now())

  @@index([investigationId])
}

// Evidence attachments
model Evidence {
  id          String @id @default(cuid())
  investigationId String
  investigation Investigation @relation(fields: [investigationId], references: [id], onDelete: Cascade)

  filename    String
  url         String // S3 or local storage URL
  fileType    String
  fileSizeBytes Int

  createdAt DateTime @default(now())

  @@index([investigationId])
}

// Reports
model Report {
  id          String @id @default(cuid())
  title       String
  type        ReportType

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  data        Json   // Report data (summary, charts, etc.)
  exportUrl   String? // S3 URL for PDF/XLSX export

  generatedBy String
  createdAt   DateTime @default(now())

  @@index([organizationId])
  @@index([type])
}

enum ReportType {
  FRAUD_SUMMARY
  VENDOR_ANALYSIS
  DEPARTMENT_ANALYSIS
  FCA_COMPLAINT
  CUSTOM
}

// Audit logging (required for government)
model AuditLog {
  id          String @id @default(cuid())

  organizationId String
  userId      String
  user        User @relation(fields: [userId], references: [id])

  action      String // e.g., "flag_created", "investigation_updated", "fca_submitted"
  entityType  String // e.g., "flag", "investigation"
  entityId    String

  oldValues   Json?  // What changed
  newValues   Json?

  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([organizationId])
  @@index([userId])
  @@index([createdAt])
}

// Transactions for analysis (optional, if storing detailed transaction data)
model Transaction {
  id          String @id @default(cuid())

  organizationId String
  departmentId String

  vendorId    String
  vendor      Vendor @relation(fields: [vendorId], references: [id])

  amount      Float
  date        DateTime
  description String?

  createdAt   DateTime @default(now())

  @@index([organizationId])
  @@index([vendorId])
  @@index([date])
}
```

**Audit Checklist:**

- [ ] Schema enforces multi-tenancy: all tables have `organizationId` foreign key
- [ ] User role enum constrains values (ADMIN, ANALYST, VIEWER)
- [ ] `Flag.riskScore` and `Vendor.riskScore` store analysis results
- [ ] `Investigation` references related `Flag`s (one-to-many)
- [ ] `AuditLog` captures all mutations (required for government)
- [ ] Timestamps on all audit-relevant tables (`createdAt`, `updatedAt`)
- [ ] Foreign keys use `onDelete: Cascade` for cleanup
- [ ] Indexes on frequently queried columns (organizationId, userId, vendorId, date)

---

### 3.2 Database Migrations

**Run migrations in production safely:**

```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_fca_fields

# Deploy migration to production (no interactive mode)
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset
```

**Audit Checklist:**

- [ ] All migrations are idempotent (safe to run multiple times)
- [ ] Migrations include rollback strategy
- [ ] No data loss migrations without backup plan
- [ ] `npx prisma migrate deploy` runs successfully in Docker
- [ ] Database backups taken before major migrations

---

## STEP 4: NEXTAUTH SECURITY

NextAuth 5.0 requires proper configuration for multi-tenant government applications.

```typescript
// src/lib/auth.ts (or app/api/auth/[...nextauth]/route.ts)
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { env } from '@/env';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { organization: true },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          org: user.organization,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  callbacks: {
    // Add organization to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.org = user.org;
      }
      return token;
    },
    // Expose JWT data to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.org = token.org as any;
      }
      return session;
    },
    // Verify org membership
    async authorized({ auth, request }) {
      const isPublic = ['/login', '/register', '/'].includes(request.nextUrl.pathname);
      if (isPublic) return true;

      if (!auth?.user) return false;

      // Check org-scoped routes
      const orgId = request.nextUrl.searchParams.get('org');
      if (orgId && auth.user.org?.id !== orgId) {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Refresh every hour
  },
  jwt: {
    secret: env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60,
  },
  secret: env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
```

**Audit Checklist:**

- [ ] `NEXTAUTH_SECRET` is cryptographically random (32+ chars)
- [ ] Session strategy is JWT (stateless, scalable)
- [ ] Session maxAge is reasonable (24 hours for government)
- [ ] Credentials provider hashes passwords with bcrypt (salt rounds: 10+)
- [ ] No passwords logged (audit trails should not expose passwords)
- [ ] JWT includes user role and organization ID
- [ ] OAuth disabled (government clients prefer email/password or MFA)
- [ ] Callback validates org membership (multi-tenant isolation)

---

## STEP 5: PRODUCTION READINESS CHECKLIST

### 5.1 Pre-Deployment

Before deploying to production:

- [ ] Environment variables configured for production
- [ ] Database backups enabled
- [ ] HTTPS/TLS certificate installed
- [ ] Firewall rules configured (allow only necessary ports)
- [ ] Database credentials rotated (not reused from development)
- [ ] Secrets not committed to git (use `.gitignore`)
- [ ] Build succeeds: `npm run build`
- [ ] TypeScript check passes: `tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] No console.log statements in production code
- [ ] Error monitoring set up (Sentry recommended)

### 5.2 Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

---

### 5.3 Whop.com Billing Integration

WasteWatch uses Whop for payment processing:

```typescript
// src/lib/whop.ts
import { env } from '@/env';

export async function createCheckoutUrl(
  organizationId: string,
  plan: 'starter' | 'professional' | 'enterprise'
) {
  const response = await fetch('https://api.whop.com/api/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.WHOP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: getPlanProductId(plan),
      metadata: {
        organization_id: organizationId,
      },
      success_url: `${env.NEXTAUTH_URL}/settings/billing?success=true`,
      cancel_url: `${env.NEXTAUTH_URL}/settings/billing?cancel=true`,
    }),
  });

  return response.json();
}

function getPlanProductId(plan: string): string {
  const productIds: Record<string, string> = {
    starter: process.env.WHOP_STARTER_PRODUCT_ID || '',
    professional: process.env.WHOP_PROFESSIONAL_PRODUCT_ID || '',
    enterprise: process.env.WHOP_ENTERPRISE_PRODUCT_ID || '',
  };
  return productIds[plan];
}

// Webhook handler for Whop payment events
export async function verifyWhopWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', env.WHOP_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
```

**Webhook endpoint:**

```typescript
// app/api/billing/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyWhopWebhook } from '@/lib/whop';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-whop-signature');

  if (!signature || !(await verifyWhopWebhook(body, signature))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case 'payment.completed':
      // Update organization subscription
      await prisma.organization.update({
        where: { id: event.metadata.organization_id },
        data: {
          plan: event.product.plan,
          subscriptionId: event.subscription_id,
          renewalDate: new Date(event.renewal_date),
        },
      });
      break;
  }

  return NextResponse.json({ ok: true });
}
```

---

## STEP 6: MONITORING & OBSERVABILITY

### 6.1 Sentry Setup (Recommended)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
import { env } from '@/env';

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NEXT_PUBLIC_ENVIRONMENT,
    tracesSampleRate: env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration(),
    ],
  });
}

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';
import { env } from '@/env';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NEXT_PUBLIC_ENVIRONMENT,
    tracesSampleRate: env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  });
}
```

**Audit Checklist:**

- [ ] Sentry DSN configured for production
- [ ] Error tracking captures unhandled exceptions
- [ ] Performance monitoring enabled (transaction tracing)
- [ ] Release tracking set up (link to git commits)
- [ ] No sensitive data in error logs (PII filtering)
- [ ] Alert notifications configured for critical errors

---

### 6.2 Logging Strategy

```typescript
// src/lib/logger.ts
import { env } from '@/env';

const LOG_LEVEL = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVEL[env.LOG_LEVEL as keyof typeof LOG_LEVEL] || 1;

export const logger = {
  debug: (message: string, data?: any) => {
    if (currentLevel <= LOG_LEVEL.debug) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    if (currentLevel <= LOG_LEVEL.info) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    if (currentLevel <= LOG_LEVEL.warn) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    if (currentLevel <= LOG_LEVEL.error) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};
```

---

## STEP 7: CI/CD PIPELINE (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - run: tsc --noEmit
      - run: npm run test:e2e

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: |
          docker build -t wastewatch:${{ github.sha }} .
          docker tag wastewatch:${{ github.sha }} wastewatch:latest

      - name: Deploy to production
        run: |
          # Example: Push to Docker registry, deploy to K8s, etc.
          docker push wastewatch:${{ github.sha }}
```

---

## VERIFICATION CHECKLIST

- [ ] `docker-compose up` builds and starts all services
- [ ] Database migrations run automatically on startup
- [ ] `/api/health` returns 200 status
- [ ] Prisma client generated correctly
- [ ] All environment variables validated
- [ ] Whop webhook endpoint receives payment events
- [ ] Errors are logged and sent to Sentry
- [ ] CI/CD pipeline builds and deploys successfully
- [ ] Production database has backups enabled
- [ ] HTTPS certificates are valid and not expiring soon
