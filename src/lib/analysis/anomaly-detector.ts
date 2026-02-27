import type { Transaction, Flag, Department, Vendor, Contract } from '@/types';

interface AnalysisInput {
  transactions: Transaction[];
  departments: Department[];
  vendors: Vendor[];
  contracts: Contract[];
  organizationId: string;
  approvalThreshold?: number;
  outlierSensitivity?: number;
}

let flagCounter = 1000;

function nextFlagId(): string {
  return `flag-auto-${String(flagCounter++).padStart(4, '0')}`;
}

function getRecommendation(type: string): string {
  const recs: Record<string, string> = {
    duplicate_payment: 'Review payment records and initiate recovery for confirmed duplicates.',
    round_number: 'Request detailed invoices and verify service delivery.',
    split_transaction: 'Review purchasing patterns and enforce approval threshold compliance.',
    vendor_concentration: 'Conduct competitive analysis and consider diversifying vendor base.',
    budget_overrun: 'Implement budget alerts at 80% and 90% thresholds.',
    ghost_vendor: 'Verify vendor legitimacy through business registration and address verification.',
    end_of_period_spike: 'Review end-of-period purchases for necessity.',
    contract_anomaly: 'Review contract terms and conduct competitive bidding for renewal.',
    outlier: 'Review transaction details and verify against contract terms.',
    benford_anomaly: 'Conduct detailed audit of transaction amounts.',
  };
  return recs[type] || 'Review and investigate flagged items.';
}

// Find duplicate payments: same vendor, same amount, within 3 days
export function findDuplicatePayments(transactions: Transaction[], organizationId: string): Flag[] {
  const flags: Flag[] = [];
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const t1 = sorted[i];
      const t2 = sorted[j];
      const daysDiff = Math.abs(new Date(t2.date).getTime() - new Date(t1.date).getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 3) break;
      if (t1.vendorId === t2.vendorId && Math.abs(t1.amount - t2.amount) < 0.01) {
        flags.push({
          id: nextFlagId(),
          organizationId,
          type: 'duplicate_payment',
          severity: t1.amount > 10000 ? 'critical' : 'warning',
          title: `Duplicate payment to ${t1.vendor}`,
          description: `Two payments of $${t1.amount.toLocaleString()} to ${t1.vendor} within ${Math.round(daysDiff)} days.`,
          estimatedWaste: t1.amount,
          status: 'new',
          affectedTransactionIds: [t1.id, t2.id],
          affectedDepartment: t1.department,
          affectedVendor: t1.vendor,
          recommendation: getRecommendation('duplicate_payment'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  return flags;
}

// Find round number transactions above threshold
export function findRoundNumbers(transactions: Transaction[], organizationId: string, threshold = 25000): Flag[] {
  return transactions
    .filter((t) => t.amount >= threshold && t.amount % 1000 === 0 && t.amount % 100 === 0)
    .map((t) => ({
      id: nextFlagId(),
      organizationId,
      type: 'round_number' as const,
      severity: t.amount >= 75000 ? 'critical' as const : 'warning' as const,
      title: `Suspiciously round payment — $${t.amount.toLocaleString()}`,
      description: `A payment of exactly $${t.amount.toLocaleString()} to ${t.vendor}. Perfectly round amounts at this scale are uncommon.`,
      estimatedWaste: t.amount * 0.05,
      status: 'new' as const,
      affectedTransactionIds: [t.id],
      affectedDepartment: t.department,
      affectedVendor: t.vendor,
      recommendation: getRecommendation('round_number'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
}

// Find split transactions just below approval threshold
export function findSplitTransactions(
  transactions: Transaction[],
  organizationId: string,
  approvalThreshold = 5000,
  windowDays = 7
): Flag[] {
  const flags: Flag[] = [];
  const lowerBound = approvalThreshold * 0.9;
  const suspects = transactions.filter((t) => t.amount >= lowerBound && t.amount < approvalThreshold);

  // Group by vendor + department
  const groups = new Map<string, Transaction[]>();
  for (const t of suspects) {
    const key = `${t.vendorId}-${t.departmentId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  for (const [, txns] of groups) {
    if (txns.length < 3) continue;
    const sorted = txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find clusters within window
    let cluster: Transaction[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const daysDiff = (new Date(sorted[i].date).getTime() - new Date(cluster[0].date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= windowDays) {
        cluster.push(sorted[i]);
      } else {
        if (cluster.length >= 3) {
          const total = cluster.reduce((s, t) => s + t.amount, 0);
          flags.push({
            id: nextFlagId(),
            organizationId,
            type: 'split_transaction',
            severity: 'critical',
            title: `Possible split purchases — ${cluster[0].vendor}`,
            description: `${cluster.length} transactions just below $${approvalThreshold.toLocaleString()} threshold. Total: $${total.toLocaleString()}.`,
            estimatedWaste: total * 0.15,
            status: 'new',
            affectedTransactionIds: cluster.map((t) => t.id),
            affectedDepartment: cluster[0].department,
            affectedVendor: cluster[0].vendor,
            recommendation: getRecommendation('split_transaction'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        cluster = [sorted[i]];
      }
    }
    if (cluster.length >= 3) {
      const total = cluster.reduce((s, t) => s + t.amount, 0);
      flags.push({
        id: nextFlagId(),
        organizationId,
        type: 'split_transaction',
        severity: 'critical',
        title: `Possible split purchases — ${cluster[0].vendor}`,
        description: `${cluster.length} transactions just below $${approvalThreshold.toLocaleString()} threshold. Total: $${total.toLocaleString()}.`,
        estimatedWaste: total * 0.15,
        status: 'new',
        affectedTransactionIds: cluster.map((t) => t.id),
        affectedDepartment: cluster[0].department,
        affectedVendor: cluster[0].vendor,
        recommendation: getRecommendation('split_transaction'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return flags;
}

// Find vendor concentration issues
export function findVendorConcentration(
  transactions: Transaction[],
  departments: Department[],
  organizationId: string,
  threshold = 0.35
): Flag[] {
  const flags: Flag[] = [];

  for (const dept of departments) {
    const deptTxns = transactions.filter((t) => t.departmentId === dept.id);
    const deptTotal = deptTxns.reduce((s, t) => s + t.amount, 0);
    if (deptTotal === 0) continue;

    const vendorTotals = new Map<string, { total: number; txns: Transaction[] }>();
    for (const t of deptTxns) {
      const key = t.vendorId || t.vendor;
      if (!vendorTotals.has(key)) vendorTotals.set(key, { total: 0, txns: [] });
      const entry = vendorTotals.get(key)!;
      entry.total += t.amount;
      entry.txns.push(t);
    }

    for (const [, data] of vendorTotals) {
      const pct = data.total / deptTotal;
      if (pct >= threshold) {
        const vendor = data.txns[0].vendor;
        flags.push({
          id: nextFlagId(),
          organizationId,
          type: 'vendor_concentration',
          severity: pct >= 0.5 ? 'critical' : 'warning',
          title: `High vendor concentration — ${vendor}`,
          description: `${vendor} received ${(pct * 100).toFixed(1)}% of ${dept.name}'s total spend ($${Math.round(data.total).toLocaleString()}).`,
          estimatedWaste: data.total * 0.1,
          status: 'new',
          affectedTransactionIds: data.txns.map((t) => t.id),
          affectedDepartment: dept.name,
          affectedVendor: vendor,
          recommendation: getRecommendation('vendor_concentration'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  return flags;
}

// Find budget overruns
export function findBudgetOverruns(
  transactions: Transaction[],
  departments: Department[],
  organizationId: string,
  fiscalYear = 'FY2025'
): Flag[] {
  const flags: Flag[] = [];

  for (const dept of departments) {
    const deptTxns = transactions.filter((t) => t.departmentId === dept.id && t.fiscalYear === fiscalYear);
    const actual = deptTxns.reduce((s, t) => s + t.amount, 0);
    const overrun = actual - dept.allocatedBudget;

    if (overrun > 0) {
      flags.push({
        id: nextFlagId(),
        organizationId,
        type: 'budget_overrun',
        severity: overrun / dept.allocatedBudget > 0.15 ? 'critical' : 'warning',
        title: `Budget exceeded — ${dept.name}`,
        description: `${dept.name} spent $${Math.round(actual).toLocaleString()} against $${dept.allocatedBudget.toLocaleString()} budget (${((overrun / dept.allocatedBudget) * 100).toFixed(1)}% over).`,
        estimatedWaste: overrun,
        status: 'new',
        affectedTransactionIds: deptTxns.map((t) => t.id),
        affectedDepartment: dept.name,
        recommendation: getRecommendation('budget_overrun'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return flags;
}

// Find end-of-period spending spikes
export function findEndOfPeriodSpikes(
  transactions: Transaction[],
  organizationId: string,
  spikeMultiplier = 2.0
): Flag[] {
  const flags: Flag[] = [];

  // Group by department and quarter
  const deptQuarterSpend = new Map<string, Map<string, { total: number; txns: Transaction[]; lastTwoWeeks: { total: number; txns: Transaction[] } }>>();

  for (const t of transactions) {
    const key = t.departmentId || t.department;
    if (!deptQuarterSpend.has(key)) deptQuarterSpend.set(key, new Map());
    const quarterKey = `${t.fiscalYear}-Q${t.fiscalQuarter}`;
    const deptMap = deptQuarterSpend.get(key)!;
    if (!deptMap.has(quarterKey)) deptMap.set(quarterKey, { total: 0, txns: [], lastTwoWeeks: { total: 0, txns: [] } });
    const entry = deptMap.get(quarterKey)!;
    entry.total += t.amount;
    entry.txns.push(t);

    // Check if in last 2 weeks of quarter
    const date = new Date(t.date);
    const month = date.getMonth();
    const day = date.getDate();
    const quarterEndMonths = [11, 2, 5, 8]; // Dec, Mar, Jun, Sep
    if (quarterEndMonths.includes(month) && day >= 15) {
      entry.lastTwoWeeks.total += t.amount;
      entry.lastTwoWeeks.txns.push(t);
    }
  }

  for (const [, quarters] of deptQuarterSpend) {
    for (const [, data] of quarters) {
      if (data.txns.length === 0) continue;
      const avgWeeklySpend = data.total / 13; // ~13 weeks per quarter
      const twoWeekAvg = avgWeeklySpend * 2;

      if (data.lastTwoWeeks.total > twoWeekAvg * spikeMultiplier && data.lastTwoWeeks.txns.length >= 3) {
        const dept = data.txns[0].department;
        flags.push({
          id: nextFlagId(),
          organizationId,
          type: 'end_of_period_spike',
          severity: 'warning',
          title: `End-of-period spending surge — ${dept}`,
          description: `${dept} spent $${Math.round(data.lastTwoWeeks.total).toLocaleString()} in the final two weeks (${data.lastTwoWeeks.txns.length} transactions), which is ${(data.lastTwoWeeks.total / twoWeekAvg).toFixed(1)}x the typical two-week average.`,
          estimatedWaste: data.lastTwoWeeks.total * 0.3,
          status: 'new',
          affectedTransactionIds: data.lastTwoWeeks.txns.map((t) => t.id),
          affectedDepartment: dept,
          recommendation: getRecommendation('end_of_period_spike'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  return flags;
}

// Find contract anomalies
export function findContractAnomalies(contracts: Contract[], organizationId: string): Flag[] {
  const flags: Flag[] = [];

  for (const c of contracts) {
    // Auto-renewed without competitive bid and value increase >20%
    if (c.renewalStatus === 'auto_renewed' && !c.competitiveBid && c.currentValue > c.value * 1.2) {
      const increase = c.currentValue - c.value;
      const pctIncrease = ((increase / c.value) * 100).toFixed(0);
      flags.push({
        id: nextFlagId(),
        organizationId,
        type: 'contract_anomaly',
        severity: 'critical',
        title: `Auto-renewed contract exceeds value — ${c.vendorName}`,
        description: `"${c.title}" was auto-renewed without competitive bidding. Value increased from $${c.value.toLocaleString()} to $${c.currentValue.toLocaleString()} (${pctIncrease}% increase).`,
        estimatedWaste: increase,
        status: 'new',
        affectedTransactionIds: [],
        affectedVendor: c.vendorName,
        recommendation: getRecommendation('contract_anomaly'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return flags;
}

// Find statistical outliers using z-scores
export function findOutliers(
  transactions: Transaction[],
  organizationId: string,
  zThreshold = 2.5
): Flag[] {
  const flags: Flag[] = [];

  // Group by category
  const categoryTxns = new Map<string, Transaction[]>();
  for (const t of transactions) {
    if (!categoryTxns.has(t.category)) categoryTxns.set(t.category, []);
    categoryTxns.get(t.category)!.push(t);
  }

  for (const [category, txns] of categoryTxns) {
    if (txns.length < 10) continue;
    const amounts = txns.map((t) => t.amount);
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length);

    if (stdDev === 0) continue;

    for (const t of txns) {
      const zScore = (t.amount - mean) / stdDev;
      if (zScore > zThreshold) {
        flags.push({
          id: nextFlagId(),
          organizationId,
          type: 'outlier',
          severity: zScore > 3.5 ? 'critical' : 'warning',
          title: `Outlier transaction in ${category}`,
          description: `$${t.amount.toLocaleString()} to ${t.vendor} is ${zScore.toFixed(1)} standard deviations above the mean ($${Math.round(mean).toLocaleString()}) for ${category}.`,
          estimatedWaste: t.amount - mean,
          status: 'new',
          affectedTransactionIds: [t.id],
          affectedDepartment: t.department,
          affectedVendor: t.vendor,
          recommendation: getRecommendation('outlier'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  return flags;
}

// Run all analysis
export function runFullAnalysis(input: AnalysisInput): Flag[] {
  const { transactions, departments, contracts, organizationId, approvalThreshold = 5000, outlierSensitivity = 2.5 } = input;

  const allFlags: Flag[] = [
    ...findDuplicatePayments(transactions, organizationId),
    ...findRoundNumbers(transactions, organizationId),
    ...findSplitTransactions(transactions, organizationId, approvalThreshold),
    ...findVendorConcentration(transactions, departments, organizationId),
    ...findBudgetOverruns(transactions, departments, organizationId),
    ...findEndOfPeriodSpikes(transactions, organizationId),
    ...findContractAnomalies(contracts, organizationId),
    ...findOutliers(transactions, organizationId, outlierSensitivity),
  ];

  return allFlags;
}
