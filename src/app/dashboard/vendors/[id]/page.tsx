'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpendingOverTimeChart } from '@/components/charts/SpendingOverTimeChart';
import { cn } from '@/lib/utils';
import { ArrowLeft, AlertTriangle, Globe, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendors = useStore((s) => s.vendors);
  const transactions = useStore((s) => s.transactions);
  const flags = useStore((s) => s.flags);
  const contracts = useStore((s) => s.contracts);

  const vendor = vendors.find((v) => v.id === params.id);

  const data = useMemo(() => {
    if (!vendor) return null;
    const vendorTxns = transactions.filter((t) => t.vendorId === vendor.id);
    const vendorFlags = flags.filter((f) => f.affectedVendor === vendor.name);
    const vendorContracts = contracts.filter((c) => c.vendorId === vendor.id);

    const deptTotals = new Map<string, { name: string; total: number; count: number }>();
    for (const t of vendorTxns) {
      const key = t.departmentId || t.department;
      if (!deptTotals.has(key)) deptTotals.set(key, { name: t.department, total: 0, count: 0 });
      const entry = deptTotals.get(key)!;
      entry.total += t.amount;
      entry.count++;
    }
    return { vendorTxns, vendorFlags, vendorContracts, deptBreakdown: Array.from(deptTotals.values()).sort((a, b) => b.total - a.total) };
  }, [vendor, transactions, flags, contracts]);

  if (!vendor || !data) return <div className="text-center py-20"><p className="text-muted-foreground">Vendor not found.</p><button onClick={() => router.back()} className="text-primary text-sm mt-2 hover:underline">Go back</button></div>;

  const { vendorTxns, vendorFlags, vendorContracts, deptBreakdown } = data;
  const isGhost = !vendor.website && !vendor.contactEmail;
  const riskColor = vendor.riskScore >= 60 ? 'text-waste' : vendor.riskScore >= 30 ? 'text-warning-accent' : 'text-savings';

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to vendors</button>
      <div><div className="flex items-center gap-2"><h1 className="font-heading text-2xl font-bold">{vendor.name}</h1>{isGhost && <Badge variant="destructive">Ghost Vendor</Badge>}</div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
          {vendor.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {vendor.address}</span>}
          {vendor.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {vendor.contactEmail}</span>}
          {vendor.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {vendor.website}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Total Paid</div><div className="text-2xl font-bold font-data">{formatCurrency(vendor.totalPaid)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Transactions</div><div className="text-2xl font-bold font-data">{vendor.transactionCount}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Risk Score</div><div className={cn('text-2xl font-bold font-data', riskColor)}>{vendor.riskScore}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-muted-foreground">Active Flags</div><div className="text-2xl font-bold font-data text-waste">{vendorFlags.filter((f) => f.status !== 'dismissed' && f.status !== 'resolved').length}</div></CardContent></Card>
      </div>

      {vendorTxns.length > 0 && <Card><CardHeader className="pb-2"><CardTitle className="text-base">Payment History</CardTitle></CardHeader><CardContent><SpendingOverTimeChart transactions={vendorTxns} /></CardContent></Card>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Payments by Department</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deptBreakdown.map((dept) => {
                const pct = vendor.totalPaid > 0 ? (dept.total / vendor.totalPaid) * 100 : 0;
                return (
                  <div key={dept.name} className="flex items-center justify-between p-2 rounded-lg border border-border/50">
                    <span className="text-sm font-medium">{dept.name}</span>
                    <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{dept.count} txns</span><span className="text-sm font-data font-semibold">{formatCurrency(dept.total)}</span><Badge variant="secondary" className="text-[10px]">{pct.toFixed(0)}%</Badge></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Contracts ({vendorContracts.length})</CardTitle></CardHeader>
          <CardContent>
            {vendorContracts.length === 0 ? <p className="text-sm text-muted-foreground py-4">No contracts on file.</p> : (
              <div className="space-y-3">
                {vendorContracts.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{c.title}</span><Badge variant="secondary" className="text-[10px]">{c.renewalStatus.replace('_', ' ')}</Badge></div>
                    <div className="text-xs text-muted-foreground">{format(new Date(c.startDate), 'MMM yyyy')} — {format(new Date(c.endDate), 'MMM yyyy')}</div>
                    <div className="text-sm font-data mt-1">{formatCurrency(c.currentValue)}{c.currentValue > c.value * 1.2 && <span className="text-waste text-xs ml-2">(+{(((c.currentValue - c.value) / c.value) * 100).toFixed(0)}% over original)</span>}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {vendorFlags.length > 0 && <Card><CardHeader className="pb-2"><CardTitle className="text-base">Flags</CardTitle></CardHeader><CardContent><div className="space-y-2">{vendorFlags.map((flag) => (
        <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => router.push('/dashboard/flags')}>
          <div className="flex items-center gap-2"><AlertTriangle className={cn('w-4 h-4', flag.severity === 'critical' ? 'text-waste' : 'text-warning-accent')} /><span className="text-sm">{flag.title}</span></div>
          <span className="text-sm font-data text-waste">{formatCurrency(flag.estimatedWaste)}</span>
        </div>
      ))}</div></CardContent></Card>}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Department</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Description</th><th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th></tr></thead>
            <tbody>{vendorTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((t, i) => (
              <tr key={t.id} className={cn('border-b border-border/50', i % 2 === 0 && 'bg-muted/30')}><td className="py-2 px-3 font-data text-xs">{format(new Date(t.date), 'MMM d, yyyy')}</td><td className="py-2 px-3 text-xs">{t.department}</td><td className="py-2 px-3 text-xs">{t.category}</td><td className="py-2 px-3 text-xs text-muted-foreground">{t.description}</td><td className="py-2 px-3 text-right font-data text-xs">${t.amount.toLocaleString()}</td></tr>
            ))}</tbody>
          </table>
          {vendorTxns.length > 20 && <p className="text-xs text-muted-foreground mt-2 text-center">Showing 20 of {vendorTxns.length} transactions</p>}
        </CardContent>
      </Card>
    </div>
  );
}
