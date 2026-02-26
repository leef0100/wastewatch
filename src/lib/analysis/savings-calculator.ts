import type { Flag, Transaction, Department } from '@/types';

export interface SavingsBreakdown {
  category: string;
  amount: number;
  description: string;
}

export interface SavingsReport {
  totalSavings: number;
  breakdown: SavingsBreakdown[];
  projectedAnnual: number;
}

export function calculateSavings(
  flags: Flag[],
  transactions: Transaction[],
  departments: Department[]
): SavingsReport {
  const activeFlags = flags.filter((f) => f.status !== 'dismissed' && f.status !== 'resolved');
  const breakdown: SavingsBreakdown[] = [];

  // Duplicate payment recovery
  const dupFlags = activeFlags.filter((f) => f.type === 'duplicate_payment');
  if (dupFlags.length > 0) {
    const total = dupFlags.reduce((s, f) => s + f.estimatedWaste, 0);
    breakdown.push({
      category: 'Duplicate Payment Recovery',
      amount: total,
      description: `${dupFlags.length} duplicate payments identified for recovery`,
    });
  }

  // Split transaction tightening
  const splitFlags = activeFlags.filter((f) => f.type === 'split_transaction');
  if (splitFlags.length > 0) {
    const total = splitFlags.reduce((s, f) => s + f.estimatedWaste, 0);
    breakdown.push({
      category: 'Approval Threshold Enforcement',
      amount: total,
      description: `${splitFlags.length} instances of potential split purchasing identified`,
    });
  }

  // Vendor consolidation savings
  const concFlags = activeFlags.filter((f) => f.type === 'vendor_concentration');
  if (concFlags.length > 0) {
    const total = concFlags.reduce((s, f) => s + f.estimatedWaste, 0);
    breakdown.push({
      category: 'Vendor Diversification',
      amount: total,
      description: 'Competitive bidding could reduce costs through vendor diversification',
    });
  }

  // Contract renegotiation
  const contractFlags = activeFlags.filter((f) => f.type === 'contract_anomaly');
  if (contractFlags.length > 0) {
    const total = contractFlags.reduce((s, f) => s + f.estimatedWaste, 0);
    breakdown.push({
      category: 'Contract Renegotiation',
      amount: total,
      description: `${contractFlags.length} contracts identified for competitive rebidding`,
    });
  }

  // Budget optimization
  const overrunFlags = activeFlags.filter((f) => f.type === 'budget_overrun');
  if (overrunFlags.length > 0) {
    const total = overrunFlags.reduce((s, f) => s + f.estimatedWaste, 0);
    breakdown.push({
      category: 'Budget Optimization',
      amount: total * 0.5,
      description: 'Budget reallocation and spending controls could reduce overruns',
    });
  }

  // End-of-period waste reduction
  const eopFlags = activeFlags.filter((f) => f.type === 'end_of_period_spike');
  if (eopFlags.length > 0) {
    const total = eopFlags.reduce((s, f) => s + f.estimatedWaste, 0);
    breakdown.push({
      category: 'End-of-Period Spending Controls',
      amount: total,
      description: 'Implementing spending freezes could prevent unnecessary year-end purchases',
    });
  }

  const totalSavings = breakdown.reduce((s, b) => s + b.amount, 0);

  return {
    totalSavings,
    breakdown,
    projectedAnnual: totalSavings * 1.2, // Project forward with improvements
  };
}
