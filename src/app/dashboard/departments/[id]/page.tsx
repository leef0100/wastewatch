'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { SpendingOverTimeChart } from '@/components/charts/SpendingOverTimeChart';
import { cn } from '@/lib/utils';
import { ArrowLeft, Building2, AlertTriangle } from 'lucide-react';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departments = useStore((s) => s.departments);
  const transactions = useStore((s) => s.transactions);
  const flags = useStore((s) => s.flags);
  const fiscalPeriod = useStore((s) => s.fiscalPeriod);

  const dept = departments.find((d) => d.id === params.id);

  const deptData = useMemo(() => {
    if (!dept) return null;
    const deptTxns = transactions.filter((t) => t.departmentId === dept.id && (fiscalPeriod.startsWith('FY') ? t.fiscalYear === fiscalPeriod : true));
    const actual = deptTxns.reduce((s, t) => s + t.amount, 0);
    const utilization = dept.allocatedBudget > 0 ? (actual / dept.allocatedBudget) * 100 : 0;
    const deptFlags = flags.filter((f) => f.affectedDepartment === dept.name && f.status !== 'dismissed' && f.status !== 'resolved');

    const vendorTotals = new Map<string, { name: string; id: string; total: number; count: number }>();
    for (const t of deptTxns) {
      const key = t.vendorId || t.vendor;
      if (!vendorTotals.has(key)) vendorTotals.set(key, { name: t.vendor, id: t.vendorId || '', total: 0, count: 0 });
      const entry = vendorTotals.get(key)!;
      entry.total += t.amount;
      entry.count++;
    }
    const topVendors = Array.from(vendorTotals.values()).sort((a, b) => b.total - a.total).slice(0, 10);

    return { deptTxns, actual, utilization, deptFlags, topVendors };
  }, [dept, transactions, flags, fiscalPeriod]);

  if (!dept || !deptData) return <div className="text-center py-20"><p className="text-muted-foreground">Department not found.</p><button onClick={() => router.back()} className="text-primary text-sm mt-2 hover:underline">Go back</button></div>;

  const { deptTxns, actual, utilization, deptFlags, topVendors } = deptData;
  const utilizationColor = utilization > 100 ? 'text-waste' : utilization > 85 ? 'text-warning-accent' : 'text-savings';

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to departments</button>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Building2 className="w-5 h-5 text-primary" /></div>
        <div><h1 className="text-2xl font-bold">{dept.name}</h1><p className="text-muted-foreground text-sm">{dept.headcount} employees</p></div>
        {deptFlags.length > 0 && <Badge variant="destructive" className="ml-2"><AlertTriangle className="w-3 h-3 mr-1" /> {deptFlags.length} flags</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Budget</div><div className="text-2xl font-bold font-data">{formatCurrency(dept.allocatedBudget)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Actual Spend</div><div className="text-2xl font-bold font-data">{formatCurrency(actual)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Utilization</div><div className={cn('text-2xl font-bold font-data', utilizationColor)}>{utilization.toFixed(1)}%</div><Progress value={Math.min(utilization, 100)} className="h-1.5 mt-1" /></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Flagged Waste</div><div className="text-2xl font-bold font-data text-waste">{formatCurrency(deptFlags.reduce((s, f) => s + f.estimatedWaste, 0))}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Monthly Spending Trend</CardTitle></CardHeader><CardContent><SpendingOverTimeChart transactions={deptTxns} /></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Spending by Category</CardTitle></CardHeader><CardContent><CategoryBreakdownChart transactions={deptTxns} /></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Top Vendors</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left py-3 px-4 text-muted-foreground font-medium">Vendor</th><th className="text-right py-3 px-4 text-muted-foreground font-medium">Total Paid</th><th className="text-right py-3 px-4 text-muted-foreground font-medium">Transactions</th><th className="text-right py-3 px-4 text-muted-foreground font-medium">% of Dept</th></tr></thead>
            <tbody>
              {topVendors.map((v, i) => {
                const pct = actual > 0 ? (v.total / actual) * 100 : 0;
                return (
                  <tr key={v.id || i} className={cn('border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors', i % 2 === 0 && 'bg-muted/30')} onClick={() => v.id && router.push(`/dashboard/vendors/${v.id}`)}>
                    <td className="py-3 px-4 font-medium">{v.name}</td>
                    <td className="py-3 px-4 text-right font-data">{formatCurrency(v.total)}</td>
                    <td className="py-3 px-4 text-right font-data">{v.count}</td>
                    <td className="py-3 px-4 text-right"><span className={cn('font-data', pct > 40 ? 'text-waste font-semibold' : '')}>{pct.toFixed(1)}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {deptFlags.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Department Flags</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deptFlags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => router.push('/dashboard/flags')}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('w-4 h-4', flag.severity === 'critical' ? 'text-waste' : 'text-warning-accent')} />
                    <span className="text-sm font-medium">{flag.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{flag.type.replace(/_/g, ' ')}</Badge>
                  </div>
                  <span className="text-sm font-data text-waste">{formatCurrency(flag.estimatedWaste)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
