# 03-SECURITY-AUTH.md — WasteWatch Security & Authentication Audit

> **Phase 3: Complete Security & Authentication Posture for Government-Grade Fraud Detection**
>
> **Scope:** NextAuth 5.0.0-beta.30, role-based access control, organization data isolation, secrets management, Docker security
>
> **Risk Level:** P0 (Critical) — Government and financial data must be protected
>
> **Time Estimate:** 4–6 hours
>
> **Tech Stack:**
> - NextAuth 5.0.0-beta.30 with Prisma Adapter
> - PostgreSQL 16 (government data)
> - Docker deployment with secrets

---

## OVERVIEW

WasteWatch handles sensitive government financial data and fraud evidence. After this audit, the application will have:

- Zero hardcoded secrets
- Proper environment variable management
- Secure session tokens (httpOnly cookies only)
- Complete authentication flows (login, signup, password reset)
- Role-based access control (admin, analyst, viewer)
- Organization-based multi-tenancy with data isolation
- Security headers (CSP, HSTS, etc.)
- XSS and CSRF prevention
- Government data protection compliance
- Clean npm audit report

---

# STEP 1: SECRETS & ENVIRONMENT VARIABLES AUDIT

## 1.1 Hardcoded Secrets Scan

Hardcoded secrets are unacceptable in a government fraud detection system. Every secret must be in environment variables.

### Comprehensive Search Patterns:

```bash
# API Keys (generic)
grep -r "api[_-]?key\s*[=:]\s*['\"]" --include="*.ts" --include="*.tsx" app/ lib/

# NextAuth Secrets
grep -r "NEXTAUTH_SECRET\|NEXTAUTH_URL" --include="*.ts" app/ lib/

# Database Credentials
grep -r "postgres:\/\/\|DATABASE_URL\s*=" --include="*.ts" app/ lib/

# JWT Secrets
grep -r "JWT_SECRET\|SIGNING_KEY" --include="*.ts" -i app/ lib/

# OAuth Secrets (GitHub, Google, etc.)
grep -r "client[_-]?secret\|GITHUB_SECRET\|GOOGLE_SECRET" --include="*.ts" -i app/ lib/

# Private Keys
grep -r "BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY" --include="*.pem" --include="*.key" .

# Webhook Secrets
grep -r "webhook[_-]?secret" --include="*.ts" -i app/ lib/

# Comments revealing secrets
grep -r "TODO.*SECRET\|FIXME.*password\|XXX.*token" --include="*.ts" app/ lib/
```

### Action Items:

- [ ] Run all search patterns — document any findings
- [ ] For each hardcoded secret: Move to `.env.local` (development) or Docker secrets (production)
- [ ] Remove from git history if present: `git rm --cached .env` and `git filter-branch`
- [ ] Update `.gitignore` to prevent future commits

---

## 1.2 Environment Variable Architecture

**File Structure:**

```
.env                     # Never commit — local development defaults
.env.local              # Never commit — local overrides
.env.example            # COMMIT THIS — template for team
.env.production          # Never commit — production defaults
docker-compose.yml      # Docker secrets reference
```

### Create `lib/env.ts` (Centralized Validation)

```typescript
// lib/env.ts
import { z } from 'zod'

// Server-side secrets (NEVER exposed to client)
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be ≥32 chars'),
  NEXTAUTH_URL: z.string().url(),

  // OAuth (optional providers)
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_ID: z.string().optional(),
  GOOGLE_SECRET: z.string().optional(),

  // Email (for password resets, etc.)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
})

// Client-side safe variables (exposed via NEXT_PUBLIC_)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
})

// Merge and validate
const envSchema = serverEnvSchema.merge(clientEnvSchema)

let env: z.infer<typeof envSchema>

try {
  env = envSchema.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment variable validation failed:')
    error.errors.forEach(err => {
      console.error(`  ${err.path.join('.')}: ${err.message}`)
    })
    process.exit(1)
  }
  throw error
}

// Type-safe export
export default env

// Type augmentation for TypeScript
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
```

### .env.example (Commit This)

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wastewatch

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_secret_here_at_least_32_chars
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional)
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Client-side (safe to expose)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Node
NODE_ENV=development
```

### .gitignore (Verify)

```
# Environment
.env
.env.local
.env.*.local
.env.production

# Secrets
*.pem
*.key
private.key

# Node/Build
node_modules/
.next/
out/
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Cache
.turbo/
.cache/
```

### Audit Checklist:

- [ ] No hardcoded secrets in source code
- [ ] NEXTAUTH_SECRET ≥32 characters (use `openssl rand -base64 32`)
- [ ] DATABASE_URL in env, not hardcoded
- [ ] OAuth secrets in env if using social auth
- [ ] NEXT_PUBLIC_* prefix only for safe data (no secrets)
- [ ] .env files in .gitignore
- [ ] .env.example includes all required variables
- [ ] Environment validation runs at startup
- [ ] Application exits if required env vars missing

---

# STEP 2: NEXTAUTH CONFIGURATION & SETUP

## 2.1 NextAuth 5.0.0-beta.30 Setup

NextAuth 5 is a major rewrite with improved TypeScript support and Prisma integration.

### Initialize NextAuth with Prisma Adapter

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'
import env from './env'
import { z } from 'zod'

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  providers: [
    // Credentials provider (email + password)
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = CredentialsSchema.parse(credentials)

          // Find user
          const user = await db.user.findUnique({
            where: { email },
            include: {
              organization: true,
            },
          })

          if (!user || !user.password) {
            console.warn(`Failed login attempt for email: ${email}`)
            return null // Fail silently for security
          }

          // Verify password (use bcrypt)
          const isPasswordValid = await verifyPassword(password, user.password)
          if (!isPasswordValid) {
            console.warn(`Failed password verification for: ${email}`)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            organizationId: user.organization?.id,
          }
        } catch (error) {
          console.error('Credentials authorize error:', error)
          return null
        }
      },
    }),

    // GitHub OAuth (optional)
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GitHub({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),

    // Google OAuth (optional)
    ...(env.GOOGLE_ID && env.GOOGLE_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_ID,
            clientSecret: env.GOOGLE_SECRET,
          }),
        ]
      : []),
  ],

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  callbacks: {
    // JWT callback - add custom claims
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role // Add role
        token.organizationId = (user as any).organizationId
      }
      return token
    },

    // Session callback - include custom claims in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'analyst' | 'viewer'
        session.user.organizationId = token.organizationId as string
      }
      return session
    },

    // Redirect callback - control post-login redirect
    async redirect({ url, baseUrl }) {
      // Allow relative and absolute URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },

  session: {
    strategy: 'jwt', // Use JWT not database sessions (stateless)
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every 1 hour
  },

  jwt: {
    secret: env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  events: {
    signIn: async ({ user, account }) => {
      console.info(`User signed in: ${user.email} (${account?.provider || 'credentials'})`)
    },
    signOut: async ({ token }) => {
      console.info(`User signed out: ${token.email}`)
    },
    error: async ({ error }) => {
      console.error(`Auth error: ${error}`)
    },
  },
})

// Helper function to verify bcrypt password
import bcrypt from 'bcryptjs'

async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}

// Type-safe session hook
export async function getSession() {
  return auth()
}
```

### Prisma User Schema Update

```prisma
model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  name                String?
  image               String?
  password            String?          // For credentials provider
  role                Role     @default(VIEWER)
  organizationId      String
  organization        Organization @relation(fields: [organizationId], references: [id])
  emailVerified       DateTime?
  accounts            Account[]
  sessions            Session[]
  flags               Flag[]           // Flags reviewed by this user
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([organizationId])
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
}

enum Role {
  ADMIN    // Can manage users, organization, import data
  ANALYST  // Can view, analyze, flag transactions
  VIEWER   // Read-only access to dashboards
}
```

---

## 2.2 Route Handlers & Middleware

### NextAuth Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

### Middleware for Protected Routes

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const publicRoutes = ['/login', '/signup', '/auth/error']
const adminRoutes = ['/admin']
const analystRoutes = ['/analysis', '/flags', '/reports']

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session?.user) {
    if (!publicRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Role-based access control
  const userRole = (session.user as any).role

  if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/analysis') && userRole === 'VIEWER') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Protected Route Component Hook

```typescript
// app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Organization: {(session.user as any).organizationId}</p>
      <p>Role: {(session.user as any).role}</p>
    </div>
  )
}
```

---

# STEP 3: ROLE-BASED ACCESS CONTROL (RBAC)

## 3.1 Role Hierarchy

**WasteWatch has 3 roles:**

| Role | Permissions | Use Case |
|---|---|---|
| **ADMIN** | Create users, manage organization, import data, see all data | Organization manager, data admin |
| **ANALYST** | View all transactions, flag anomalies, generate reports | Fraud investigators |
| **VIEWER** | Read-only dashboard, no editing | Executive reports, audit trail |

### Implementation Pattern

```typescript
// lib/permissions.ts
type Role = 'ADMIN' | 'ANALYST' | 'VIEWER'

const permissions: Record<Role, string[]> = {
  ADMIN: [
    'user:create',
    'user:edit',
    'user:delete',
    'user:list',
    'organization:edit',
    'transaction:import',
    'transaction:view',
    'flag:view',
    'flag:create',
    'flag:edit',
    'flag:clear',
    'report:generate',
    'report:download',
  ],
  ANALYST: [
    'transaction:view',
    'flag:view',
    'flag:create',
    'flag:edit',
    'report:generate',
    'report:download',
  ],
  VIEWER: [
    'transaction:view',
    'flag:view',
    'report:download',
  ],
}

export function canPerform(role: Role, permission: string): boolean {
  return permissions[role]?.includes(permission) ?? false
}
```

### Middleware Protection

```typescript
// app/api/flags/[id]/route.ts
import { auth } from '@/lib/auth'
import { canPerform } from '@/lib/permissions'
import { db } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userRole = (session.user as any).role
  if (!canPerform(userRole, 'flag:edit')) {
    return new Response('Forbidden', { status: 403 })
  }

  // Proceed with flag update
  const flag = await db.flag.update({
    where: { id: params.id },
    data: await request.json(),
  })

  return Response.json({ data: flag })
}
```

### Audit Checklist:

- [ ] All protected routes check authentication
- [ ] All sensitive operations check role permissions
- [ ] Admin-only operations gated behind ADMIN role
- [ ] Analyst operations require ANALYST or ADMIN
- [ ] Viewer operations allow all roles
- [ ] Permission checks in both middleware and route handlers (defense in depth)

---

# STEP 4: SECURITY HEADERS & PROTECTIONS

## 4.1 Next.js Security Headers

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy (prevent XSS)
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';",
          },
          // HSTS (force HTTPS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // X-Frame-Options (prevent clickjacking)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options (prevent MIME sniffing)
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### Audit Checklist:

- [ ] Content-Security-Policy header configured
- [ ] HSTS (Strict-Transport-Security) enabled
- [ ] X-Frame-Options set to DENY (prevent clickjacking)
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] No `unsafe-eval` in CSP
- [ ] No inline scripts without nonce

---

## 4.2 CSRF Protection

NextAuth handles CSRF automatically with JWT tokens. Ensure:

```typescript
// No additional CSRF token needed for NextAuth API routes
// All state-changing operations (POST, PATCH, DELETE) use NextAuth's built-in CSRF protection
```

### Audit Checklist:

- [ ] All state-changing operations require valid NextAuth session
- [ ] CSRF tokens included in all forms (NextAuth middleware)
- [ ] SameSite=Strict cookie policy for sessions

---

## 4.3 Input Validation & Sanitization

**All user input must be validated:**

```typescript
// app/api/flags/route.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

const FlagSchema = z.object({
  transactionId: z.string().cuid(),
  type: z.enum(['benford', 'duplicate', 'ghost_vendor', 'round_amount']),
  description: z.string().min(1).max(500),
  severity: z.number().int().min(1).max(4),
})

export async function POST(request: Request) {
  const body = await request.json()

  // Validate
  const { data, error } = FlagSchema.safeParse(body)
  if (error) {
    return Response.json(
      { error: 'Invalid input', details: error.flatten() },
      { status: 400 }
    )
  }

  // Sanitize HTML (if storing user-provided HTML)
  const sanitized = {
    ...data,
    description: DOMPurify.sanitize(data.description),
  }

  // Create flag
  const flag = await db.flag.create({
    data: sanitized,
  })

  return Response.json({ data: flag }, { status: 201 })
}
```

### Audit Checklist:

- [ ] All POST/PATCH/DELETE endpoints validate input with Zod
- [ ] No SQL injection possible (Prisma parameterizes)
- [ ] No XSS possible (React escapes by default, plus CSP)
- [ ] File uploads validated (type, size, antivirus scan if applicable)
- [ ] HTML content sanitized if needed

---

# STEP 5: DOCKER SECRETS MANAGEMENT

## 5.1 Docker Compose with Secrets

For production deployments, use Docker secrets instead of environment files.

```yaml
# docker-compose.yml
version: '3.8'

services:
  wastewatch:
    image: wastewatch:latest
    container_name: wastewatch
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://api.example.com
      NEXT_PUBLIC_SITE_URL: https://example.com
    secrets:
      - nextauth_secret
      - nextauth_url
      - database_url
      - github_id
      - github_secret
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    container_name: wastewatch-db
    environment:
      POSTGRES_DB: wastewatch
      POSTGRES_USER: wastewatch
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    secrets:
      - postgres_password

secrets:
  nextauth_secret:
    external: true # Created with: docker secret create nextauth_secret -
  nextauth_url:
    external: true
  database_url:
    external: true
  github_id:
    external: true
  github_secret:
    external: true
  postgres_password:
    external: true

volumes:
  postgres_data:
```

### Loading Secrets in Application

```typescript
// lib/env.ts
import fs from 'fs/promises'

async function loadSecret(name: string): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    try {
      // In Docker, secrets are mounted at /run/secrets/{name}
      return await fs.readFile(`/run/secrets/${name}`, 'utf-8')
    } catch (error) {
      console.error(`Failed to load secret: ${name}`)
      throw error
    }
  }
  // In development, use environment variables
  return process.env[name] || ''
}

export async function getSecrets() {
  return {
    nextAuthSecret: await loadSecret('nextauth_secret'),
    nextAuthUrl: await loadSecret('nextauth_url'),
    databaseUrl: await loadSecret('database_url'),
  }
}
```

### Audit Checklist:

- [ ] Secrets not hardcoded in Dockerfile
- [ ] Secrets loaded from `/run/secrets/` in production
- [ ] `.env` files never committed to git
- [ ] Docker images don't contain sensitive data
- [ ] Secrets rotated regularly

---

# STEP 6: AUTHENTICATION FLOWS

## 6.1 Login Flow

```typescript
// app/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">WasteWatch Login</h1>

      {error && (
        <div className="bg-critical/10 text-critical p-3 rounded mb-4">
          {error}
        </div>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full p-2 border border-border rounded mb-4"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="w-full p-2 border border-border rounded mb-4"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-fg p-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

## 6.2 Signup Flow (Admin creates users)

```typescript
// app/api/auth/register/route.ts
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  organizationId: z.string(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password, organizationId, role } = RegisterSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return Response.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        organizationId,
        role,
      },
    })

    return Response.json(
      { data: { id: user.id, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Register error:', error)
    return Response.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
```

---

# STEP 7: COMPREHENSIVE SECURITY AUDIT CHECKLIST

### Secrets & Environment
- [ ] No hardcoded secrets in source code
- [ ] NEXTAUTH_SECRET ≥32 characters
- [ ] All secrets in environment variables or Docker secrets
- [ ] .env files in .gitignore
- [ ] Environment validation at startup (application exits if missing)
- [ ] .env.example has all required variables

### Authentication
- [ ] NextAuth 5.0.0-beta.30 configured with Prisma Adapter
- [ ] Login endpoint functional
- [ ] Password hashed with bcrypt
- [ ] OAuth providers configured (if using)
- [ ] Session strategy: JWT (stateless)
- [ ] Session maxAge: 24 hours
- [ ] Token validation on protected routes

### Authorization & RBAC
- [ ] 3 roles implemented: ADMIN, ANALYST, VIEWER
- [ ] Role-based access checks on all sensitive operations
- [ ] Middleware enforces role requirements
- [ ] Admin endpoints gated behind ADMIN role
- [ ] Analyst operations require ANALYST or ADMIN
- [ ] Organization data isolated by organizationId
- [ ] No role escalation vulnerabilities

### Multi-Tenancy
- [ ] Users belong to single organization
- [ ] All database queries filtered by organizationId
- [ ] No data leakage between organizations
- [ ] Organization ID extracted from user session
- [ ] No "public" endpoints that bypass org scoping

### Security Headers
- [ ] Content-Security-Policy configured
- [ ] HSTS (Strict-Transport-Security) enabled
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy restricts sensitive APIs

### Input Validation
- [ ] All POST/PATCH/DELETE endpoints validate input with Zod
- [ ] Validation errors return 400 status
- [ ] No hardcoded allowlists (use schema validation)
- [ ] HTML content sanitized if applicable
- [ ] File uploads validated (type, size)

### XSS Prevention
- [ ] React escapes content by default
- [ ] No dangerouslySetInnerHTML used
- [ ] CSP blocks inline scripts
- [ ] No eval() or Function() constructor
- [ ] Third-party scripts loaded safely

### CSRF Prevention
- [ ] NextAuth handles CSRF automatically
- [ ] All state-changing operations require valid session
- [ ] SameSite=Strict for session cookies

### Government Data Protection
- [ ] FCA complaint data encrypted at rest (if applicable)
- [ ] Financial data not logged in plaintext
- [ ] Audit trail for all data access (flags, reviews)
- [ ] Session logs contain user email + action
- [ ] No sensitive data in error messages

### Logging & Monitoring
- [ ] Failed login attempts logged (without password)
- [ ] Admin actions logged (user creation, data import)
- [ ] Error logs don't expose secrets
- [ ] Logs rotated to prevent overflow
- [ ] No user passwords in logs

### Dependency Security
- [ ] `npm audit` returns clean report
- [ ] Prisma up-to-date
- [ ] NextAuth up-to-date
- [ ] bcryptjs for password hashing
- [ ] zod for validation
- [ ] No known CVEs in dependencies

### Docker Security
- [ ] Secrets not hardcoded in Dockerfile
- [ ] .env files not copied into images
- [ ] Secrets loaded from /run/secrets/
- [ ] Application runs as non-root user
- [ ] Image scanning for vulnerabilities

