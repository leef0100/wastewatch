'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Building2, AlertTriangle, Users } from 'lucide-react';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const departments = useStore((s) => s.departments);
  const transactions = useStore((s) => s.transactions);
  const flags = useStore((s) => s.flags);
  const fiscalPeriod = useStore((s) => s.fiscalPeriod);

  const deptData = useMemo(() => {
    return departments.map((dept) => {
      const deptTxns = transactions.filter(
        (t) => t.departmentId === dept.id && (fiscalPeriod.startsWith('FY') ? t.fiscalYear === fiscalPeriod : true)
      );
      const actual = deptTxns.reduce((s, t) => s + t.amount, 0);
      const utilization = dept.allocatedBudget > 0 ? (actual / dept.allocatedBudget) * 100 : 0;
      const deptFlags = flags.filter((f) => f.affectedDepartment === dept.name && f.status !== 'dismissed' && f.status !== 'resolved');
      const waste = deptFlags.reduce((s, f) => s + f.estimatedWaste, 0);

      return { ...dept, actual, utilization, flagCount: deptFlags.length, criticalCount: deptFlags.filter((f) => f.severity === 'critical').length, waste, txnCount: deptTxns.length };
    }).sort((a, b) => b.actual - a.actual);
  }, [departments, transactions, flags, fiscalPeriod]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Departments</h1>
        <p className="text-muted-foreground text-sm">{departments.length} departments — Budget allocation and spending analysis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {deptData.map((dept) => {
          const utilizationColor = dept.utilization > 100 ? 'text-waste' : dept.utilization > 85 ? 'text-warning-accent' : 'text-savings';
          const progressColor = dept.utilization > 100 ? '[&>div]:bg-waste' : dept.utilization > 85 ? '[&>div]:bg-warning-accent' : '[&>div]:bg-savings';
          return (
            <Card key={dept.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => router.push(`/dashboard/departments/${dept.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">{dept.name}</h3></div>
                  {dept.flagCount > 0 && <Badge variant={dept.criticalCount > 0 ? 'destructive' : 'secondary'} className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />{dept.flagCount}</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><div className="text-[10px] text-muted-foreground uppercase">Budget</div><div className="text-sm font-data font-semibold">{formatCurrency(dept.allocatedBudget)}</div></div>
                  <div><div className="text-[10px] text-muted-foreground uppercase">Actual Spend</div><div className="text-sm font-data font-semibold">{formatCurrency(dept.actual)}</div></div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-muted-foreground">Budget Utilization</span><span className={cn('text-xs font-data font-semibold', utilizationColor)}>{dept.utilization.toFixed(0)}%</span></div>
                  <Progress value={Math.min(dept.utilization, 100)} className={cn('h-2', progressColor)} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {dept.headcount || '—'} staff</span>
                  <span>{dept.txnCount} transactions</span>
                  {dept.waste > 0 && <span className="text-waste font-data">{formatCurrency(dept.waste)} flagged</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
