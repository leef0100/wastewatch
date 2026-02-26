'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, BarChart3, AlertTriangle, Building2, Users, TrendingDown } from 'lucide-react';
import { calculateSavings } from '@/lib/analysis/savings-calculator';
import { analyzeBenford } from '@/lib/analysis/benford-analysis';
import { format } from 'date-fns';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

const reportTemplates = [
  { id: 'executive', name: 'Executive Summary', description: 'One-page overview with key findings and risk metrics.', icon: BarChart3, sections: ['KPI Overview', 'Top Flags', 'Risk Score', 'Recommendations'] },
  { id: 'waste', name: 'Detailed Waste Analysis', description: 'Comprehensive breakdown of all detected anomalies.', icon: AlertTriangle, sections: ['All Flags', 'Transaction Details', 'Vendor Analysis'] },
  { id: 'department', name: 'Department Budget Review', description: 'Budget analysis with utilization and variance reporting.', icon: Building2, sections: ['Budget vs Actual', 'Utilization', 'Top Vendors'] },
  { id: 'vendor', name: 'Vendor Risk Assessment', description: 'Risk scoring and analysis of all vendors.', icon: Users, sections: ['Risk Scores', 'Concentration', 'Ghost Vendors'] },
  { id: 'savings', name: 'Savings Opportunities', description: 'Projected savings from implementing recommendations.', icon: TrendingDown, sections: ['Savings Breakdown', 'Priority Actions', 'ROI'] },
];

export default function ReportsPage() {
  const organization = useStore((s) => s.organization);
  const transactions = useStore((s) => s.transactions);
  const departments = useStore((s) => s.departments);
  const flags = useStore((s) => s.flags);
  const [generating, setGenerating] = useState<string | null>(null);

  const savings = calculateSavings(flags, transactions, departments);
  const benford = analyzeBenford(transactions.map((t) => t.amount));

  function exportToCSV() {
    const headers = ['Date', 'Vendor', 'Department', 'Category', 'Amount', 'Description', 'Status'];
    const rows = transactions.map((t) => [format(new Date(t.date), 'yyyy-MM-dd'), t.vendor, t.department, t.category, t.amount.toString(), t.description, t.approvalStatus]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `wastewatch-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  }

  function exportFlagsCSV() {
    const headers = ['Type', 'Severity', 'Title', 'Description', 'Estimated Waste', 'Status', 'Department', 'Vendor'];
    const rows = flags.map((f) => [f.type, f.severity, f.title, f.description, f.estimatedWaste.toString(), f.status, f.affectedDepartment || '', f.affectedVendor || '']);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `wastewatch-flags-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Flags CSV exported');
  }

  async function generateReport(templateId: string) {
    setGenerating(templateId);
    await new Promise((r) => setTimeout(r, 1500));
    const template = reportTemplates.find((t) => t.id === templateId)!;
    const activeFlags = flags.filter((f) => f.status !== 'dismissed' && f.status !== 'resolved');
    const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
    const totalWaste = activeFlags.reduce((s, f) => s + f.estimatedWaste, 0);

    let report = `WASTEWATCH REPORT: ${template.name.toUpperCase()}\nOrganization: ${organization?.name || 'N/A'}\nGenerated: ${format(new Date(), 'MMMM d, yyyy')}\n${'='.repeat(60)}\n\n`;
    report += `SUMMARY\n${'—'.repeat(40)}\nTotal Spend: ${formatCurrency(totalSpend)}\nWaste Detected: ${formatCurrency(totalWaste)}\nActive Flags: ${activeFlags.length}\nProjected Savings: ${formatCurrency(savings.totalSavings)}\n\n`;
    report += `SAVINGS BREAKDOWN\n${'—'.repeat(40)}\n`;
    for (const item of savings.breakdown) report += `  ${item.category}: ${formatCurrency(item.amount)}\n    ${item.description}\n`;
    report += `\nBENFORD'S LAW ANALYSIS\n${'—'.repeat(40)}\n${benford.summary}\n\nTOP FLAGS\n${'—'.repeat(40)}\n`;
    for (const flag of [...activeFlags].sort((a, b) => b.estimatedWaste - a.estimatedWaste).slice(0, 10)) report += `  [${flag.severity.toUpperCase()}] ${flag.title}\n    Estimated waste: ${formatCurrency(flag.estimatedWaste)}\n    ${flag.description}\n\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `wastewatch-${templateId}-${format(new Date(), 'yyyy-MM-dd')}.txt`; a.click();
    URL.revokeObjectURL(url);
    setGenerating(null);
    toast.success(`${template.name} generated`);
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Reports & Export</h1><p className="text-muted-foreground text-sm">Generate reports and export data for stakeholder review</p></div>

      <Card className="border-savings/30">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="w-4 h-4 text-savings" /> Savings Opportunities</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div className="text-3xl font-bold font-data text-savings mb-1">{formatCurrency(savings.totalSavings)}</div><p className="text-sm text-muted-foreground">Total recoverable savings identified</p><div className="text-sm font-data text-muted-foreground mt-1">Projected annual: {formatCurrency(savings.projectedAnnual)}</div></div>
            <div className="space-y-2">{savings.breakdown.map((item, i) => (<div key={i} className="flex items-center justify-between text-sm"><span>{item.category}</span><span className="font-data font-semibold text-savings">{formatCurrency(item.amount)}</span></div>))}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Benford&apos;s Law Analysis</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{benford.summary}</p>
          <div className="grid grid-cols-9 gap-2">
            {benford.results.map((r) => (
              <div key={r.digit} className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold font-data">{r.digit}</div>
                <div className="text-[10px] text-muted-foreground">Exp: {(r.expected * 100).toFixed(1)}%</div>
                <div className={cn('text-[10px] font-semibold', Math.abs(r.deviation) > 0.05 ? 'text-waste' : 'text-savings')}>Obs: {(r.observed * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
          <Badge variant="secondary" className={cn('mt-3', benford.isAnomaly ? 'bg-waste/20 text-waste' : 'bg-savings/20 text-savings')}>{benford.isAnomaly ? 'Anomaly Detected' : 'Distribution Normal'}</Badge>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <template.icon className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">{template.sections.map((s) => (<Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>))}</div>
                <button onClick={() => generateReport(template.id)} disabled={generating === template.id} className="w-full h-8 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                  {generating === template.id ? 'Generating...' : <><Download className="w-3 h-3" /> Generate Report</>}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Data Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-5 flex items-center justify-between"><div className="flex items-center gap-3"><FileSpreadsheet className="w-5 h-5 text-savings" /><div><div className="text-sm font-medium">Transactions CSV</div><div className="text-xs text-muted-foreground">{transactions.length} records</div></div></div><button onClick={exportToCSV} className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"><Download className="w-3 h-3" /></button></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center justify-between"><div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-waste" /><div><div className="text-sm font-medium">Flags CSV</div><div className="text-xs text-muted-foreground">{flags.length} flags</div></div></div><button onClick={exportFlagsCSV} className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"><Download className="w-3 h-3" /></button></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
