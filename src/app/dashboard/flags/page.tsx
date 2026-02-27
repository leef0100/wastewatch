'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/stores/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import type { FlagStatus, FlagType } from '@/types';

const severityConfig = {
  critical: { color: 'bg-waste/20 text-waste border-waste/30', icon: AlertTriangle, label: 'Critical' },
  warning: { color: 'bg-warning-accent/20 text-warning-accent border-warning-accent/30', icon: AlertCircle, label: 'Warning' },
  info: { color: 'bg-primary/20 text-primary border-primary/30', icon: Info, label: 'Info' },
};

const statusConfig: Record<FlagStatus, { color: string; icon: React.ElementType; label: string }> = {
  new: { color: 'bg-waste/20 text-waste', icon: AlertCircle, label: 'New' },
  under_review: { color: 'bg-warning-accent/20 text-warning-accent', icon: Clock, label: 'Under Review' },
  resolved: { color: 'bg-savings/20 text-savings', icon: CheckCircle2, label: 'Resolved' },
  dismissed: { color: 'bg-muted text-muted-foreground', icon: XCircle, label: 'Dismissed' },
};

const flagTypeLabels: Record<FlagType, string> = {
  duplicate_payment: 'Duplicate Payment',
  round_number: 'Round Number',
  split_transaction: 'Split Transaction',
  vendor_concentration: 'Vendor Concentration',
  budget_overrun: 'Budget Overrun',
  ghost_vendor: 'Ghost Vendor',
  end_of_period_spike: 'End-of-Period Spike',
  contract_anomaly: 'Contract Anomaly',
  outlier: 'Statistical Outlier',
  benford_anomaly: "Benford's Law",
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function FlagsPage() {
  const flags = useStore((s) => s.flags);
  const updateFlagStatus = useStore((s) => s.updateFlagStatus);
  const transactions = useStore((s) => s.transactions);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;
      if (typeFilter !== 'all' && f.type !== typeFilter) return false;
      return true;
    });
  }, [flags, search, severityFilter, statusFilter, typeFilter]);

  const totalWaste = filteredFlags.reduce((s, f) => s + f.estimatedWaste, 0);
  const criticalCount = filteredFlags.filter((f) => f.severity === 'critical').length;
  const newCount = filteredFlags.filter((f) => f.status === 'new').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Red Flags & Anomalies</h1>
        <p className="text-muted-foreground text-sm">
          {flags.length} flags detected across all departments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-4"><div className="text-sm text-muted-foreground">Total Flags</div><div className="text-2xl font-bold font-data">{filteredFlags.length}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-sm text-muted-foreground">Estimated Waste</div><div className="text-2xl font-bold font-data text-waste">{formatCurrency(totalWaste)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-sm text-muted-foreground">Critical</div><div className="text-2xl font-bold font-data text-waste">{criticalCount}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-sm text-muted-foreground">Needs Review</div><div className="text-2xl font-bold font-data text-warning-accent">{newCount}</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flags..." className="pl-9 h-9" />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Flag Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(flagTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredFlags.map((flag) => {
          const config = severityConfig[flag.severity];
          const status = statusConfig[flag.status];
          const Icon = config.icon;
          const isExpanded = expandedFlag === flag.id;
          const affectedTxns = flag.affectedTransactionIds.map((id) => transactions.find((t) => t.id === id)).filter(Boolean);

          return (
            <Card key={flag.id} className={cn('transition-colors', flag.severity === 'critical' && flag.status === 'new' && 'border-waste/30')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedFlag(isExpanded ? null : flag.id)}>
                  <div className={cn('p-2 rounded-md shrink-0', config.color)}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm">{flag.title}</h3>
                      <Badge variant="secondary" className={cn('text-[10px]', config.color)}>{config.label}</Badge>
                      <Badge variant="secondary" className={cn('text-[10px]', status.color)}>{status.label}</Badge>
                      <Badge variant="outline" className="text-[10px]">{flagTypeLabels[flag.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{flag.description}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <div className="text-sm font-data font-semibold text-waste flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />{formatCurrency(flag.estimatedWaste)}
                      </div>
                      {flag.affectedDepartment && <div className="text-[10px] text-muted-foreground">{flag.affectedDepartment}</div>}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recommendation</h4>
                            <p className="text-sm">{flag.recommendation}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Details</h4>
                            <div className="text-sm space-y-1">
                              {flag.affectedVendor && <p>Vendor: <span className="font-medium">{flag.affectedVendor}</span></p>}
                              {flag.affectedDepartment && <p>Department: <span className="font-medium">{flag.affectedDepartment}</span></p>}
                              <p>Affected transactions: <span className="font-data">{flag.affectedTransactionIds.length}</span></p>
                            </div>
                          </div>
                        </div>

                        {affectedTxns.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Affected Transactions</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead><tr className="border-b border-border">
                                  <th className="text-left py-2 px-2 text-muted-foreground">Date</th>
                                  <th className="text-left py-2 px-2 text-muted-foreground">Vendor</th>
                                  <th className="text-left py-2 px-2 text-muted-foreground">Department</th>
                                  <th className="text-right py-2 px-2 text-muted-foreground">Amount</th>
                                </tr></thead>
                                <tbody>
                                  {affectedTxns.slice(0, 10).map((t) => (
                                    <tr key={t!.id} className="border-b border-border/50">
                                      <td className="py-2 px-2 font-data">{new Date(t!.date).toLocaleDateString()}</td>
                                      <td className="py-2 px-2">{t!.vendor}</td>
                                      <td className="py-2 px-2">{t!.department}</td>
                                      <td className="py-2 px-2 text-right font-data">${t!.amount.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {affectedTxns.length > 10 && <p className="text-xs text-muted-foreground mt-2">...and {affectedTxns.length - 10} more</p>}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {flag.status === 'new' && (
                            <button onClick={(e) => { e.stopPropagation(); updateFlagStatus(flag.id, 'under_review'); }} className="px-3 py-1.5 text-xs font-medium bg-warning-accent/20 text-warning-accent rounded-md hover:bg-warning-accent/30 transition-colors">
                              Start Review
                            </button>
                          )}
                          {(flag.status === 'new' || flag.status === 'under_review') && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); updateFlagStatus(flag.id, 'resolved'); }} className="px-3 py-1.5 text-xs font-medium bg-savings/20 text-savings rounded-md hover:bg-savings/30 transition-colors">Resolve</button>
                              <button onClick={(e) => { e.stopPropagation(); updateFlagStatus(flag.id, 'dismissed'); }} className="px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">Dismiss</button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
        {filteredFlags.length === 0 && <div className="text-center py-16 text-muted-foreground">No flags match the current filters.</div>}
      </div>
    </div>
  );
}
