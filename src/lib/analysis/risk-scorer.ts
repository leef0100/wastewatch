import type { Flag, Vendor, Department, Transaction } from '@/types';

export interface DepartmentRisk {
  departmentId: string;
  departmentName: string;
  riskScore: number;
  flagCount: number;
  criticalCount: number;
  budgetUtilization: number;
  topRisk: string;
}

export interface VendorRisk {
  vendorId: string;
  vendorName: string;
  riskScore: number;
  flagCount: number;
  concentration: number;
  isGhostVendor: boolean;
}

export function calculateOrganizationRisk(flags: Flag[], totalBudget: number): number {
  const activeFlags = flags.filter((f) => f.status !== 'dismissed' && f.status !== 'resolved');
  const totalWaste = activeFlags.reduce((s, f) => s + f.estimatedWaste, 0);
  const criticalCount = activeFlags.filter((f) => f.severity === 'critical').length;

  // Weighted scoring
  const wasteRatio = totalBudget > 0 ? (totalWaste / totalBudget) * 100 : 0;
  const criticalPenalty = criticalCount * 3;
  const flagPenalty = activeFlags.length * 0.5;

  return Math.min(100, Math.round(wasteRatio * 5 + criticalPenalty + flagPenalty));
}

export function calculateDepartmentRisks(
  departments: Department[],
  transactions: Transaction[],
  flags: Flag[]
): DepartmentRisk[] {
  return departments.map((dept) => {
    const deptFlags = flags.filter(
      (f) => f.affectedDepartment === dept.name && f.status !== 'dismissed' && f.status !== 'resolved'
    );
    const deptTxns = transactions.filter((t) => t.departmentId === dept.id);
    const actual = deptTxns.reduce((s, t) => s + t.amount, 0);
    const utilization = dept.allocatedBudget > 0 ? actual / dept.allocatedBudget : 0;
    const criticalCount = deptFlags.filter((f) => f.severity === 'critical').length;

    const riskScore = Math.min(
      100,
      Math.round(
        criticalCount * 15 +
        deptFlags.length * 5 +
        (utilization > 1 ? (utilization - 1) * 100 : 0)
      )
    );

    const topRisk = deptFlags.length > 0
      ? deptFlags.sort((a, b) => b.estimatedWaste - a.estimatedWaste)[0].type.replace(/_/g, ' ')
      : 'None';

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      riskScore,
      flagCount: deptFlags.length,
      criticalCount,
      budgetUtilization: utilization,
      topRisk,
    };
  });
}

export function calculateVendorRisks(
  vendors: Vendor[],
  transactions: Transaction[],
  flags: Flag[]
): VendorRisk[] {
  return vendors.map((vendor) => {
    const vendorFlags = flags.filter(
      (f) => f.affectedVendor === vendor.name && f.status !== 'dismissed' && f.status !== 'resolved'
    );
    const isGhost = vendorFlags.some((f) => f.type === 'ghost_vendor');
    const vendorTxns = transactions.filter((t) => t.vendorId === vendor.id);
    const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
    const concentration = totalSpend > 0 ? vendor.totalPaid / totalSpend : 0;

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      riskScore: vendor.riskScore,
      flagCount: vendorFlags.length,
      concentration,
      isGhostVendor: isGhost,
    };
  });
}
