'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Search, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getRiskDotColor(riskScore: number): string {
  if (riskScore >= 60) return 'var(--waste)';
  if (riskScore >= 30) return 'var(--warning-accent)';
  return 'var(--savings)';
}

const renewalColors: Record<string, string> = {
  active: 'bg-savings/20 text-savings',
  expired: 'bg-muted text-muted-foreground',
  auto_renewed: 'bg-warning-accent/20 text-warning-accent',
  pending_renewal: 'bg-primary/20 text-primary',
};

export default function VendorsPage() {
  const router = useRouter();
  const vendors = useStore((s) => s.vendors);
  const flags = useStore((s) => s.flags);
  const contracts = useStore((s) => s.contracts);
  const [search, setSearch] = useState('');

  const filteredVendors = useMemo(() => {
    const sorted = [...vendors].sort((a, b) => b.totalPaid - a.totalPaid);
    if (!search) return sorted;
    return sorted.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) || (v.address && v.address.toLowerCase().includes(search.toLowerCase())));
  }, [vendors, search]);

  const totalContractValue = contracts.reduce((s, c) => s + c.currentValue, 0);
  const activeContracts = contracts.filter((c) => c.renewalStatus === 'active').length;
  const autoRenewed = contracts.filter((c) => c.renewalStatus === 'auto_renewed').length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-0.5 bg-accent rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">VENDOR MANAGEMENT</span>
        </div>
        <h1 className="font-heading text-2xl font-bold">Vendors & Contracts</h1>
        <p className="text-muted-foreground text-sm">{vendors.length} vendors — {contracts.length} contracts tracked</p>
      </div>

      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList><TabsTrigger value="vendors">Vendor Directory</TabsTrigger><TabsTrigger value="contracts">Contracts</TabsTrigger></TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="pl-9 h-9 max-w-md" /></div>
          <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vendor</th>
                    <th className="text-left py-3 px-4 bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</th>
                    <th className="text-right py-3 px-4 bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Paid</th>
                    <th className="text-right py-3 px-4 bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transactions</th>
                    <th className="text-center py-3 px-4 bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risk</th>
                    <th className="text-center py-3 px-4 bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor, i) => {
                    const vendorFlags = flags.filter((f) => f.affectedVendor === vendor.name);
                    const riskColor = vendor.riskScore >= 60 ? 'bg-waste/20 text-waste' : vendor.riskScore >= 30 ? 'bg-warning-accent/20 text-warning-accent' : 'bg-savings/20 text-savings';
                    const riskDotColor = getRiskDotColor(vendor.riskScore);
                    const isGhost = !vendor.website && !vendor.contactEmail;
                    return (
                      <tr key={vendor.id} className={cn('border-b border-border/50 cursor-pointer hover:bg-accent-light hover:translate-x-0.5 transition-all duration-150', i % 2 === 0 && 'bg-muted/30', isGhost && 'border-l-2 border-l-waste')} onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: riskDotColor }} />
                            <span className="font-medium">{vendor.name}</span>
                            {isGhost && <Badge variant="destructive" className="text-[10px]">Ghost</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs max-w-[200px] truncate">{vendor.address || '—'}</td>
                        <td className="py-3 px-4 text-right font-data">{formatCurrency(vendor.totalPaid)}</td>
                        <td className="py-3 px-4 text-right font-data">{vendor.transactionCount}</td>
                        <td className="py-3 px-4 text-center"><Badge variant="secondary" className={cn('text-xs', riskColor)}>{vendor.riskScore}</Badge></td>
                        <td className="py-3 px-4 text-center">{vendorFlags.length > 0 ? <Badge variant="destructive" className="text-xs">{vendorFlags.length}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-muted-foreground">Total Contracts</div>
                <div className="text-2xl font-bold font-data">{contracts.length}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold font-data">{formatCurrency(totalContractValue)}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-muted-foreground">Active</div>
                <div className="text-2xl font-bold font-data text-savings">{activeContracts}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-muted-foreground">Auto-Renewed</div>
                <div className="text-2xl font-bold font-data text-warning-accent">{autoRenewed}</div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            {contracts.map((contract) => {
              const isOverBudget = contract.currentValue > contract.value * 1.2;
              return (
                <Card
                  key={contract.id}
                  className={cn(
                    'rounded-xl',
                    isOverBudget && 'border-l-[3px] border-l-waste'
                  )}
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div><h3 className="font-semibold text-sm">{contract.title}</h3><p className="text-xs text-muted-foreground">{contract.vendorName}</p></div>
                      <Badge variant="secondary" className={cn('text-xs', renewalColors[contract.renewalStatus])}>{contract.renewalStatus.replace('_', ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div><div className="text-[10px] text-muted-foreground">Original Value</div><div className="text-sm font-data">{formatCurrency(contract.value)}</div></div>
                      <div><div className="text-[10px] text-muted-foreground">Current Value</div><div className={cn('text-sm font-data', isOverBudget && 'text-waste font-semibold')}>{formatCurrency(contract.currentValue)}{isOverBudget && <span className="text-[10px] ml-1">(+{(((contract.currentValue - contract.value) / contract.value) * 100).toFixed(0)}%)</span>}</div></div>
                      <div><div className="text-[10px] text-muted-foreground">Start</div><div className="text-sm font-data">{format(new Date(contract.startDate), 'MMM d, yyyy')}</div></div>
                      <div><div className="text-[10px] text-muted-foreground">End</div><div className="text-sm font-data">{format(new Date(contract.endDate), 'MMM d, yyyy')}</div></div>
                    </div>
                    {!contract.competitiveBid && <div className="mt-2"><Badge variant="secondary" className="text-[10px] bg-waste/10 text-waste"><AlertTriangle className="w-3 h-3 mr-1" /> No competitive bid</Badge></div>}
                    <p className="text-xs text-muted-foreground mt-2">{contract.deliverables}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
