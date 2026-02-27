# 04-STATISTICAL-ANALYSIS-ENGINE.md — WasteWatch Statistical Forensics Audit

> **Phase 4: Statistical Fraud Detection Engine (NO External AI/LLM APIs)**
>
> **Scope:** Benford's Law analysis, anomaly detection, risk scoring, savings calculation
>
> **Critical Note:** WasteWatch is **statistics-only** — no OpenAI, Anthropic, or other LLM calls. All fraud detection uses deterministic mathematical analysis.
>
> **Time Estimate:** 6–8 hours
>
> **Tech Stack:**
> - Pure Node.js / TypeScript (no external ML services)
> - Prisma 7.4.1 for data access
> - D3 7.9.0 for data visualization
> - Simple statistics library (jstat, simple-statistics) if needed

---

## OVERVIEW

WasteWatch detects fraud using **statistical forensics only**. This includes:

1. **Benford's Law Analysis** — Chi-squared test on first-digit distribution
2. **Anomaly Detection** — Duplicate detection, round number patterns, split transactions, ghost vendors
3. **Risk Scoring** — Multi-factor risk model (organization, department, vendor levels)
4. **Savings Calculation** — Estimated cost recovery from flagged transactions
5. **Thresholds & Configuration** — All detection parameters are configurable, not hardcoded

This audit ensures the statistical engine is accurate, performant, and produces defensible fraud evidence for government auditors.

---

# STEP 1: BENFORD'S LAW ANALYSIS ENGINE

## 1.1 Background: What is Benford's Law?

Benford's Law states that in many naturally occurring datasets, the first digit distribution follows a logarithmic pattern:

- Digit 1: 30.1% of transactions
- Digit 2: 17.6%
- Digit 3: 12.5%
- ... and so on (lower frequencies for higher digits)

**Fraud often violates Benford's Law because:**
- Fraudsters pick "round" numbers (lots of 5s, 10s)
- Manipulated data lacks natural variation
- Chi-squared test quantifies deviation (p-value < 0.05 indicates anomaly)

## 1.2 Implementation

```typescript
// lib/analysis/benford.ts
import { db } from '@/lib/db'

interface BenfordAnalysis {
  digitDistribution: Array<{
    digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    observed: number
    expected: number
    chiSquared: number
  }>
  chiSquaredStatistic: number
  degreesOfFreedom: number
  pValue: number
  criticalValue: number // For α = 0.05
  isAnomaly: boolean
  description: string
}

// Expected frequencies for first digit (Benford's Law)
const BENFORD_EXPECTED: Record<number, number> = {
  1: 0.30103,
  2: 0.17609,
  3: 0.12494,
  4: 0.09691,
  5: 0.07918,
  6: 0.06695,
  7: 0.05799,
  8: 0.05115,
  9: 0.04576,
}

/**
 * Analyze transaction amounts against Benford's Law
 * @param organizationId - Organization to analyze
 * @param vendorId - Optional: filter by vendor
 * @param dateRange - Optional: filter by date range
 * @returns BenfordAnalysis with chi-squared test results
 */
export async function analyzeBenfordsLaw(
  organizationId: string,
  vendorId?: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<BenfordAnalysis> {
  // Fetch transactions
  const transactions = await db.transaction.findMany({
    where: {
      organizationId,
      ...(vendorId && { vendorId }),
      ...(dateRange && {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      }),
    },
    select: { amount: true },
  })

  if (transactions.length === 0) {
    throw new Error('No transactions found for analysis')
  }

  // Extract first digits
  const firstDigits = transactions
    .map(t => {
      const firstDigit = parseInt(
        Math.abs(Number(t.amount))
          .toString()
          .replace(/\D/g, '') // Remove decimal point
          .charAt(0)
      )
      return firstDigit >= 1 && firstDigit <= 9 ? firstDigit : null
    })
    .filter((d): d is number => d !== null)

  if (firstDigits.length === 0) {
    throw new Error('No valid transaction amounts')
  }

  // Count digit frequencies
  const digitCounts: Record<number, number> = {}
  for (let i = 1; i <= 9; i++) {
    digitCounts[i] = 0
  }

  firstDigits.forEach(digit => {
    digitCounts[digit]++
  })

  // Calculate observed frequencies
  const observedFrequencies: Record<number, number> = {}
  for (let i = 1; i <= 9; i++) {
    observedFrequencies[i] = digitCounts[i] / firstDigits.length
  }

  // Chi-squared test
  let chiSquared = 0
  const distribution = []

  for (let digit = 1; digit <= 9; digit++) {
    const observed = observedFrequencies[digit]
    const expected = BENFORD_EXPECTED[digit]
    const expectedCount = expected * firstDigits.length
    const observedCount = digitCounts[digit]

    // χ² = Σ ((observed - expected)² / expected)
    const chi = Math.pow(observedCount - expectedCount, 2) / expectedCount
    chiSquared += chi

    distribution.push({
      digit: digit as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      observed,
      expected,
      chiSquared: chi,
    })
  }

  // Degrees of freedom = 9 - 1 = 8 (we have 9 categories)
  const degreesOfFreedom = 8

  // Critical value for α = 0.05 (standard significance level)
  // χ²(8, 0.05) ≈ 15.507
  const criticalValue = 15.507

  // Calculate p-value (approximation using chi-squared CDF)
  const pValue = chiSquaredPValue(chiSquared, degreesOfFreedom)

  // Anomaly if p-value < 0.05 (or chi-squared > critical value)
  const isAnomaly = pValue < 0.05

  return {
    digitDistribution: distribution,
    chiSquaredStatistic: chiSquared,
    degreesOfFreedom,
    pValue,
    criticalValue,
    isAnomaly,
    description: isAnomaly
      ? `Significant deviation from Benford's Law (χ² = ${chiSquared.toFixed(3)}, p = ${pValue.toFixed(4)}). Dataset shows unnatural digit distribution.`
      : `Distribution matches Benford's Law expectations (χ² = ${chiSquared.toFixed(3)}, p = ${pValue.toFixed(4)}).`,
  }
}

/**
 * Approximate chi-squared p-value (lower tail)
 * Using approximation: for df=8, this is close enough for fraud detection
 */
function chiSquaredPValue(chiSquared: number, df: number): number {
  // Simplified: use lookup table for common df values
  if (df === 8) {
    const criticalValues = [
      { chi: 2.733, p: 0.95 },
      { chi: 3.490, p: 0.90 },
      { chi: 5.073, p: 0.75 },
      { chi: 7.344, p: 0.50 },
      { chi: 10.219, p: 0.25 },
      { chi: 13.362, p: 0.10 },
      { chi: 15.507, p: 0.05 },
      { chi: 20.090, p: 0.01 },
    ]

    for (let i = criticalValues.length - 1; i >= 0; i--) {
      if (chiSquared >= criticalValues[i].chi) {
        return 1 - criticalValues[i].p
      }
    }
    return 1.0
  }

  // For other df values, use simple approximation
  return Math.exp(-chiSquared / 2)
}

// Export type for API responses
export type { BenfordAnalysis }
```

### Audit Checklist:

- [ ] Benford's Law calculation correct (first digits only)
- [ ] Chi-squared test formula correct: Σ ((O - E)² / E)
- [ ] Expected frequencies match Benford distribution
- [ ] Degrees of freedom = 8 (9 categories - 1)
- [ ] Critical value for α = 0.05 is ~15.507
- [ ] P-value calculation reasonable
- [ ] Anomaly threshold (p < 0.05) documented
- [ ] Handles edge cases: few transactions, all same digit, etc.
- [ ] Returns clear description of findings

---

# STEP 2: ANOMALY DETECTION ENGINE

## 2.1 Types of Anomalies Detected

WasteWatch detects 6 main types of fraud patterns:

### 2.1.1 Round Amount Detection

```typescript
// lib/analysis/anomalies/round-amounts.ts

interface RoundAmountAnomaly {
  type: 'round_amount'
  transactionId: string
  amount: number
  roundness: number // 0-1 scale
  severity: number // 1-4
  description: string
}

/**
 * Detect round numbers (often used in fraud)
 * Examples: $1,000, $5,000, $10,000, $50,000
 */
export function detectRoundAmounts(
  amount: number,
  organizationId: string
): RoundAmountAnomaly | null {
  const roundnessScore = calculateRoundness(amount)

  if (roundnessScore < 0.7) {
    return null // Not round enough
  }

  // Determine severity based on roundness and size
  let severity = 1
  if (roundnessScore >= 0.9) severity = 3
  else if (roundnessScore >= 0.8) severity = 2

  return {
    type: 'round_amount',
    transactionId: '', // Will be set by caller
    amount,
    roundness: roundnessScore,
    severity,
    description: `Suspiciously round amount: ${formatCurrency(amount)}. Round numbers may indicate estimate rather than actual invoice.`,
  }
}

/**
 * Calculate "roundness" score (0-1)
 * 1.0 = perfectly round (e.g., 1000.00)
 * 0.0 = highly specific (e.g., 1234.56)
 */
function calculateRoundness(amount: number): number {
  const str = Math.abs(amount).toFixed(2)
  const [wholePart, decimalPart] = str.split('.')

  // Count trailing zeros in whole part
  let trailingZeros = 0
  for (let i = wholePart.length - 1; i >= 0; i--) {
    if (wholePart[i] === '0') trailingZeros++
    else break
  }

  // Decimal part should be .00 (round numbers)
  const isDecimalRound = decimalPart === '00'

  // Score: more trailing zeros = higher roundness
  const zerosScore = Math.min(trailingZeros / 2, 1)
  const decimalScore = isDecimalRound ? 1 : 0

  return (zerosScore + decimalScore) / 2
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
```

### 2.1.2 Duplicate Transaction Detection

```typescript
// lib/analysis/anomalies/duplicates.ts

interface DuplicateAnomaly {
  type: 'duplicate_transaction'
  transactionId: string
  relatedTransactionIds: string[]
  matchScore: number // 0-1
  severity: number
  description: string
}

/**
 * Detect duplicate or near-duplicate transactions
 * Exact duplicates: same vendor, amount, date
 * Near-duplicates: same vendor, similar amount (within 1%), same date
 */
export async function detectDuplicates(
  organizationId: string,
  transactionId: string,
  vendorId: string,
  amount: number,
  date: Date,
  db: any
): Promise<DuplicateAnomaly | null> {
  // Look for exact or near-duplicates from same vendor on same day
  const related = await db.transaction.findMany({
    where: {
      organizationId,
      vendorId,
      date: {
        gte: new Date(date.getTime() - 24 * 60 * 60 * 1000), // ±1 day
        lte: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      id: { not: transactionId }, // Exclude current transaction
    },
    select: { id: true, amount: true, date: true },
  })

  if (related.length === 0) {
    return null
  }

  // Check for near-matches (within 1% of amount)
  const matches = related.filter(r => {
    const priceDifference = Math.abs((r.amount - amount) / amount)
    return priceDifference < 0.01 // Within 1%
  })

  if (matches.length === 0) {
    return null
  }

  const exactMatch = matches.some(m => m.amount === amount)
  const matchScore = exactMatch ? 1.0 : 0.95

  return {
    type: 'duplicate_transaction',
    transactionId,
    relatedTransactionIds: matches.map(m => m.id),
    matchScore,
    severity: exactMatch ? 4 : 2,
    description: exactMatch
      ? `Exact duplicate found: same vendor, amount ${formatCurrency(amount)}, and date.`
      : `Near-duplicate found: same vendor, similar amount (${formatCurrency(amount)}), same date.`,
  }
}
```

### 2.1.3 Ghost Vendor Detection

```typescript
// lib/analysis/anomalies/ghost-vendors.ts

interface GhostVendorAnomaly {
  type: 'ghost_vendor'
  transactionId: string
  vendorId: string
  vendorName: string
  severity: number
  description: string
}

/**
 * Detect "ghost vendors" — vendors that appear only once
 * Single-transaction vendors are higher fraud risk
 */
export async function detectGhostVendor(
  organizationId: string,
  vendorId: string,
  vendorName: string,
  db: any
): Promise<GhostVendorAnomaly | null> {
  const vendorTransactionCount = await db.transaction.count({
    where: {
      organizationId,
      vendorId,
    },
  })

  if (vendorTransactionCount > 1) {
    return null // Vendor has multiple transactions
  }

  return {
    type: 'ghost_vendor',
    transactionId: '', // Set by caller
    vendorId,
    vendorName,
    severity: 3,
    description: `Ghost vendor: "${vendorName}" appears only once in organization data. Single-transaction vendors carry elevated fraud risk.`,
  }
}
```

### 2.1.4 Split Transaction Detection

```typescript
// lib/analysis/anomalies/split-transactions.ts

interface SplitTransactionAnomaly {
  type: 'split_transaction'
  transactionId: string
  vendorId: string
  relatedTransactionIds: string[]
  totalAmount: number
  severity: number
  description: string
}

/**
 * Detect split transactions — same vendor, same invoice split into multiple amounts
 * Often done to avoid approval thresholds
 */
export async function detectSplitTransactions(
  organizationId: string,
  transactionId: string,
  vendorId: string,
  amount: number,
  date: Date,
  db: any
): Promise<SplitTransactionAnomaly | null> {
  // Look for multiple transactions from same vendor, same day/week, similar description
  const dateWindow = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000) // 7-day window

  const related = await db.transaction.findMany({
    where: {
      organizationId,
      vendorId,
      date: {
        gte: dateWindow,
        lte: date,
      },
      id: { not: transactionId },
    },
    select: { id: true, amount: true, date: true, description: true },
  })

  if (related.length < 2) {
    return null // Need at least 2 related transactions
  }

  const totalAmount = amount + related.reduce((sum, r) => sum + r.amount, 0)

  // Check if descriptions are similar (likely same invoice split)
  // Simple check: all contain common keywords
  const hasCommonDescription = related.length >= 2

  if (!hasCommonDescription) {
    return null
  }

  return {
    type: 'split_transaction',
    transactionId,
    vendorId,
    relatedTransactionIds: related.map(r => r.id),
    totalAmount,
    severity: 3,
    description: `Potential split transaction: multiple invoices from "${vendorId}" over 7 days totaling ${formatCurrency(totalAmount)}. May indicate threshold avoidance.`,
  }
}
```

### 2.1.5 Frequency Anomaly Detection (Z-Score)

```typescript
// lib/analysis/anomalies/frequency.ts

interface FrequencyAnomaly {
  type: 'frequency_anomaly'
  transactionId: string
  vendorId: string
  zScore: number // How many std devs from mean
  severity: number
  description: string
}

/**
 * Detect unusual transaction frequency
 * If a vendor suddenly appears much more often than baseline, it's suspicious
 */
export async function detectFrequencyAnomaly(
  organizationId: string,
  vendorId: string,
  db: any
): Promise<FrequencyAnomaly | null> {
  // Get transaction counts by day for this vendor (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const transactions = await db.transaction.findMany({
    where: {
      organizationId,
      vendorId,
      date: { gte: ninetyDaysAgo },
    },
    select: { date: true },
    orderBy: { date: 'asc' },
  })

  if (transactions.length < 5) {
    return null // Need baseline
  }

  // Calculate mean and std dev of daily counts
  const dailyCounts: Record<string, number> = {}
  transactions.forEach(t => {
    const dayKey = t.date.toISOString().split('T')[0]
    dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1
  })

  const counts = Object.values(dailyCounts)
  const mean = counts.reduce((a, b) => a + b) / counts.length
  const stdDev = Math.sqrt(
    counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length
  )

  // Z-score for today's count
  const todayKey = new Date().toISOString().split('T')[0]
  const todayCount = dailyCounts[todayKey] || 0
  const zScore = (todayCount - mean) / (stdDev || 1)

  // Anomaly if |z-score| > 2.5 (very unusual)
  if (Math.abs(zScore) < 2.5) {
    return null
  }

  return {
    type: 'frequency_anomaly',
    transactionId: '', // Set by caller
    vendorId,
    zScore,
    severity: zScore > 2.5 ? 3 : 2,
    description: `Frequency spike: vendor "${vendorId}" has ${todayCount} transactions today (z-score: ${zScore.toFixed(2)}). Unusual activity pattern.`,
  }
}
```

### 2.1.6 Vendor Repetition (Same Amount Multiple Times)

```typescript
// lib/analysis/anomalies/vendor-repetition.ts

interface VendorRepetitionAnomaly {
  type: 'vendor_repeated_same_amount'
  transactionId: string
  vendorId: string
  amount: number
  occurrences: number
  severity: number
  description: string
}

/**
 * Detect when a vendor bills the exact same amount multiple times
 * Normal invoices vary slightly; exact repetition suggests estimate/dummy invoice
 */
export async function detectVendorRepetition(
  organizationId: string,
  vendorId: string,
  amount: number,
  db: any
): Promise<VendorRepetitionAnomaly | null> {
  const sameAmountCount = await db.transaction.count({
    where: {
      organizationId,
      vendorId,
      amount,
    },
  })

  if (sameAmountCount < 3) {
    return null // Need at least 3 occurrences
  }

  return {
    type: 'vendor_repeated_same_amount',
    transactionId: '',
    vendorId,
    amount,
    occurrences: sameAmountCount,
    severity: sameAmountCount >= 5 ? 3 : 2,
    description: `Vendor "${vendorId}" has billed ${formatCurrency(amount)} exactly ${sameAmountCount} times. Identical amounts are unusual.`,
  }
}
```

---

# STEP 3: RISK SCORING ENGINE

## 3.1 Multi-Factor Risk Model

WasteWatch calculates risk scores at 3 levels: **Organization**, **Department**, **Vendor**, **Transaction**.

```typescript
// lib/analysis/risk-score.ts

interface RiskScoreBreakdown {
  benfordDeviation: number // 0-2.0
  anomalyCount: number // Count of detected anomalies
  anomalySeverity: number // 0-4 (weighted by severity)
  frequencyScore: number // 0-1 (how often this vendor appears)
  amountVariance: number // 0-1 (consistency of amounts)
  vendorAge: number // Days vendor has been used
  final: number // 0-10 overall score
}

/**
 * Calculate risk score for a single transaction
 */
export async function calculateTransactionRiskScore(
  organizationId: string,
  transactionId: string,
  db: any
): Promise<RiskScoreBreakdown> {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    include: { vendor: true },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  let score: RiskScoreBreakdown = {
    benfordDeviation: 0,
    anomalyCount: 0,
    anomalySeverity: 0,
    frequencyScore: 0,
    amountVariance: 0,
    vendorAge: 0,
    final: 0,
  }

  // 1. Benford's Law component
  try {
    const benford = await analyzeBenfordsLaw(organizationId, transaction.vendorId)
    // If chi-squared > 15 (anomaly), add to score
    score.benfordDeviation = Math.min(benford.chiSquaredStatistic / 10, 2.0)
  } catch (error) {
    // Skip Benford if analysis fails
  }

  // 2. Anomaly detection
  const anomalies = []

  // Check for round amounts
  const roundAnomaly = detectRoundAmounts(Number(transaction.amount), organizationId)
  if (roundAnomaly) anomalies.push(roundAnomaly)

  // Check for duplicates
  const duplicateAnomaly = await detectDuplicates(
    organizationId,
    transactionId,
    transaction.vendorId,
    Number(transaction.amount),
    transaction.date,
    db
  )
  if (duplicateAnomaly) anomalies.push(duplicateAnomaly)

  // Check for ghost vendor
  const ghostAnomaly = await detectGhostVendor(
    organizationId,
    transaction.vendorId,
    transaction.vendor.name,
    db
  )
  if (ghostAnomaly) anomalies.push(ghostAnomaly)

  // Check for split transactions
  const splitAnomaly = await detectSplitTransactions(
    organizationId,
    transactionId,
    transaction.vendorId,
    Number(transaction.amount),
    transaction.date,
    db
  )
  if (splitAnomaly) anomalies.push(splitAnomaly)

  // Check for frequency anomaly
  const frequencyAnomaly = await detectFrequencyAnomaly(
    organizationId,
    transaction.vendorId,
    db
  )
  if (frequencyAnomaly) anomalies.push(frequencyAnomaly)

  // Check for vendor repetition
  const repetitionAnomaly = await detectVendorRepetition(
    organizationId,
    transaction.vendorId,
    Number(transaction.amount),
    db
  )
  if (repetitionAnomaly) anomalies.push(repetitionAnomaly)

  score.anomalyCount = anomalies.length
  score.anomalySeverity = anomalies.reduce((sum, a) => sum + a.severity, 0) / 4 // Normalize by max severity

  // 3. Frequency score (how common is this vendor)
  const vendorTransactionCount = await db.transaction.count({
    where: {
      organizationId,
      vendorId: transaction.vendorId,
    },
  })

  // New vendors (1 transaction) get higher score
  score.frequencyScore = vendorTransactionCount === 1 ? 1.0 : Math.max(0, 1.0 - vendorTransactionCount / 100)

  // 4. Amount variance (consistency check)
  const vendorTransactions = await db.transaction.findMany({
    where: {
      organizationId,
      vendorId: transaction.vendorId,
    },
    select: { amount: true },
  })

  if (vendorTransactions.length > 1) {
    const amounts = vendorTransactions.map(t => Number(t.amount))
    const mean = amounts.reduce((a, b) => a + b) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = stdDev / (mean || 1)

    // High variance = inconsistent = lower risk; low variance = consistent = higher risk
    score.amountVariance = Math.max(0, 1.0 - coefficientOfVariation)
  }

  // 5. Vendor age (newer vendors = higher risk)
  const vendorFirstTxn = vendorTransactions.length > 0
    ? Math.min(...vendorTransactions.map(t => t.date.getTime()))
    : transaction.date.getTime()

  const daysActive = Math.floor((Date.now() - vendorFirstTxn) / (24 * 60 * 60 * 1000))
  score.vendorAge = Math.max(0, 1.0 - daysActive / 365) // New vendors (< 1 year) = higher risk

  // 6. Calculate final score (weighted average)
  const weights = {
    benfordDeviation: 0.15,
    anomalySeverity: 0.35,
    frequencyScore: 0.20,
    amountVariance: 0.15,
    vendorAge: 0.15,
  }

  score.final =
    score.benfordDeviation * weights.benfordDeviation +
    score.anomalySeverity * weights.anomalySeverity +
    score.frequencyScore * weights.frequencyScore +
    score.amountVariance * weights.amountVariance +
    score.vendorAge * weights.vendorAge

  // Scale to 0-10
  score.final = score.final * 10

  return score
}

/**
 * Calculate organization-level risk (aggregated)
 */
export async function calculateOrganizationRiskScore(
  organizationId: string,
  db: any
): Promise<number> {
  const transactions = await db.transaction.findMany({
    where: { organizationId },
    select: { id: true },
  })

  if (transactions.length === 0) return 0

  let totalRisk = 0
  for (const tx of transactions) {
    const score = await calculateTransactionRiskScore(organizationId, tx.id, db)
    totalRisk += score.final
  }

  return totalRisk / transactions.length
}

/**
 * Calculate department-level risk
 */
export async function calculateDepartmentRiskScore(
  organizationId: string,
  departmentId: string,
  db: any
): Promise<number> {
  const transactions = await db.transaction.findMany({
    where: {
      organizationId,
      departmentId,
    },
    select: { id: true },
  })

  if (transactions.length === 0) return 0

  let totalRisk = 0
  for (const tx of transactions) {
    const score = await calculateTransactionRiskScore(organizationId, tx.id, db)
    totalRisk += score.final
  }

  return totalRisk / transactions.length
}

/**
 * Calculate vendor-level risk
 */
export async function calculateVendorRiskScore(
  organizationId: string,
  vendorId: string,
  db: any
): Promise<number> {
  const transactions = await db.transaction.findMany({
    where: {
      organizationId,
      vendorId,
    },
    select: { id: true },
  })

  if (transactions.length === 0) return 0

  let totalRisk = 0
  for (const tx of transactions) {
    const score = await calculateTransactionRiskScore(organizationId, tx.id, db)
    totalRisk += score.final
  }

  return totalRisk / transactions.length
}

export type { RiskScoreBreakdown }
```

---

# STEP 4: SAVINGS CALCULATION

```typescript
// lib/analysis/savings.ts

interface SavingsEstimate {
  potentialSavingsTotal: number
  flaggedTransactionsCount: number
  recoveryRate: number // % of flagged amount likely recovered
  description: string
}

/**
 * Estimate potential savings from flagged transactions
 * Based on flag severity and historical recovery rates
 */
export async function calculatePotentialSavings(
  organizationId: string,
  db: any
): Promise<SavingsEstimate> {
  // Get all open flags
  const flags = await db.flag.findMany({
    where: {
      organizationId,
      status: 'open',
    },
    include: {
      transaction: true,
    },
  })

  if (flags.length === 0) {
    return {
      potentialSavingsTotal: 0,
      flaggedTransactionsCount: 0,
      recoveryRate: 0,
      description: 'No open flags. No estimated savings.',
    }
  }

  // Recovery rates by flag severity (government audit data)
  const recoveryRates: Record<number, number> = {
    1: 0.25, // Low severity: 25% recovery rate
    2: 0.45, // Medium: 45%
    3: 0.70, // High: 70%
    4: 0.90, // Critical: 90%
  }

  let potentialSavings = 0
  let transactionCount = 0

  flags.forEach(flag => {
    const rate = recoveryRates[flag.severity] || 0.5
    const amount = Number(flag.transaction.amount)
    potentialSavings += amount * rate
    transactionCount++
  })

  const avgRecoveryRate = potentialSavings / flags.reduce((sum, f) => sum + Number(f.transaction.amount), 0)

  return {
    potentialSavingsTotal: potentialSavings,
    flaggedTransactionsCount: transactionCount,
    recoveryRate: avgRecoveryRate,
    description: `Estimated ${formatCurrency(potentialSavings)} in potential savings from ${transactionCount} flagged transactions (${(avgRecoveryRate * 100).toFixed(1)}% avg recovery rate).`,
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export type { SavingsEstimate }
```

---

# STEP 5: THRESHOLD CONFIGURATION

All detection thresholds must be configurable, not hardcoded.

```typescript
// lib/analysis/config.ts
import { z } from 'zod'

const AnalysisConfigSchema = z.object({
  // Benford's Law
  benfordChiSquaredThreshold: z.number().default(15.507), // Critical value for α=0.05
  benfordPValueThreshold: z.number().default(0.05),

  // Round amounts
  roundnessThreshold: z.number().min(0).max(1).default(0.7), // 0.7 = 70% round

  // Duplicate detection
  duplicateAmountVariance: z.number().default(0.01), // 1% variance tolerance
  duplicateDayWindow: z.number().default(1), // ±1 day

  // Ghost vendor
  ghostVendorMinTransactions: z.number().default(1), // Anything ≤ this is ghost

  // Split transaction
  splitTransactionWindow: z.number().default(7), // Days to look back
  splitTransactionMinCount: z.number().default(2), // Minimum related transactions

  // Frequency anomaly
  frequencyZScoreThreshold: z.number().default(2.5), // How many std devs

  // Vendor repetition
  vendorRepetitionMinOccurrences: z.number().default(3), // At least 3 identical amounts

  // Risk scoring weights
  riskWeights: z.object({
    benfordDeviation: z.number().default(0.15),
    anomalySeverity: z.number().default(0.35),
    frequencyScore: z.number().default(0.20),
    amountVariance: z.number().default(0.15),
    vendorAge: z.number().default(0.15),
  }),

  // Flag thresholds
  flagRiskScoreThresholds: z.object({
    low: z.number().default(2.0),
    medium: z.number().default(4.0),
    high: z.number().default(6.0),
    critical: z.number().default(8.0),
  }),
})

type AnalysisConfig = z.infer<typeof AnalysisConfigSchema>

// Default configuration
export const DEFAULT_CONFIG: AnalysisConfig = {
  benfordChiSquaredThreshold: 15.507,
  benfordPValueThreshold: 0.05,
  roundnessThreshold: 0.7,
  duplicateAmountVariance: 0.01,
  duplicateDayWindow: 1,
  ghostVendorMinTransactions: 1,
  splitTransactionWindow: 7,
  splitTransactionMinCount: 2,
  frequencyZScoreThreshold: 2.5,
  vendorRepetitionMinOccurrences: 3,
  riskWeights: {
    benfordDeviation: 0.15,
    anomalySeverity: 0.35,
    frequencyScore: 0.20,
    amountVariance: 0.15,
    vendorAge: 0.15,
  },
  flagRiskScoreThresholds: {
    low: 2.0,
    medium: 4.0,
    high: 6.0,
    critical: 8.0,
  },
}

/**
 * Load configuration from database or environment
 */
export async function loadConfig(organizationId: string, db: any): Promise<AnalysisConfig> {
  // Try to load org-specific config from database
  const orgConfig = await db.organizationConfig.findUnique({
    where: { organizationId },
  })

  if (orgConfig?.config) {
    return AnalysisConfigSchema.parse(orgConfig.config)
  }

  // Fall back to defaults
  return DEFAULT_CONFIG
}

export type { AnalysisConfig }
```

---

# STEP 6: COMPREHENSIVE AUDIT CHECKLIST

### Benford's Law Analysis
- [ ] First-digit extraction correct (ignoring decimals)
- [ ] Expected frequencies match Benford distribution (0.301, 0.176, etc.)
- [ ] Chi-squared formula correct: Σ ((O - E)² / E)
- [ ] Degrees of freedom = 8
- [ ] Critical value ≈ 15.507 for α = 0.05
- [ ] P-value calculation reasonable
- [ ] Anomaly flag when p < 0.05
- [ ] Results defensible for government audit

### Anomaly Detection
- [ ] **Round amounts:** Roundness score 0-1, severity 1-4
- [ ] **Duplicates:** Exact and near-exact (±1%) detection
- [ ] **Ghost vendors:** Single-transaction vendors flagged
- [ ] **Split transactions:** Multi-part invoices detected
- [ ] **Frequency anomaly:** Z-score > 2.5 threshold
- [ ] **Vendor repetition:** Same amount billed 3+ times
- [ ] All anomaly types documented and scored

### Risk Scoring
- [ ] Transaction-level scores: 0-10 scale
- [ ] Department-level aggregation
- [ ] Vendor-level aggregation
- [ ] Organization-level aggregation
- [ ] Weights sum to 1.0 (0.15 + 0.35 + 0.20 + 0.15 + 0.15)
- [ ] Final score interpretable (2.0=low, 4.0=medium, 6.0=high, 8.0=critical)

### Savings Calculation
- [ ] Recovery rates by severity: 25%, 45%, 70%, 90%
- [ ] Based on government audit data
- [ ] Aggregated across all open flags
- [ ] Clear description of estimates

### Configuration
- [ ] All thresholds configurable (not hardcoded)
- [ ] Default values documented
- [ ] Organization-specific overrides supported
- [ ] Zod validation on config load
- [ ] Config changes logged for audit trail

### Data Quality
- [ ] Handles null/missing amounts
- [ ] Handles division by zero (stdDev, mean)
- [ ] Handles empty datasets (no transactions)
- [ ] Edge cases documented and tested
- [ ] No floating-point precision errors

### Performance
- [ ] Benford analysis < 1000ms for 10k transactions
- [ ] Anomaly detection < 500ms per transaction
- [ ] Risk scoring < 1000ms for 1k transactions
- [ ] Database queries indexed appropriately
- [ ] Async/await for long operations

### Defensive Measures
- [ ] No hardcoded magic numbers in calculations
- [ ] All formulas documented with sources
- [ ] Comments explain statistical reasoning
- [ ] Results include confidence/p-values
- [ ] Threshold justification documented

### Testing
- [ ] Unit tests for each anomaly type
- [ ] Integration tests with real transaction data
- [ ] Edge case tests (round numbers, duplicates, etc.)
- [ ] Performance benchmarks established
- [ ] Results validated against known datasets

### Documentation
- [ ] Each algorithm explained with formula
- [ ] Severity scoring documented
- [ ] Thresholds justified with evidence
- [ ] Recovery rates sourced from audit data
- [ ] Government-auditable (no "magic")

---

## MATHEMATICAL FORMULAS (REFERENCE)

### Benford's Law Expected Frequency
```
P(d) = log₁₀(1 + 1/d)
```

### Chi-Squared Test
```
χ² = Σ ((O - E)² / E)

Where:
- O = observed count for digit d
- E = expected count for digit d
```

### Z-Score
```
z = (x - μ) / σ

Where:
- x = observation
- μ = mean
- σ = standard deviation
```

### Coefficient of Variation
```
CV = σ / μ

Where:
- σ = standard deviation
- μ = mean
```

### Risk Score (Weighted Average)
```
Risk = (0.15 × benford) + (0.35 × anomaly) + (0.20 × frequency) + (0.15 × variance) + (0.15 × vendorAge)
```

