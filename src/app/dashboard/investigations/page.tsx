'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import {
  Shield,
  DollarSign,
  Calendar,
  ChevronRight,
  FileText,
  Users,
  Scale,
  AlertTriangle,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-waste/10 text-waste',
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-primary/10 text-primary',
  closed: 'bg-savings/10 text-savings',
};

const TYPE_LABELS: Record<string, string> = {
  fca: 'False Claims Act',
  fraud: 'Fraud Investigation',
  waste: 'Waste Analysis',
  abuse: 'Program Abuse',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function InvestigationsPage() {
  const router = useRouter();
  const investigations = useStore((s) => s.investigations);
  const organization = useStore((s) => s.organization);

  if (!organization) {
    router.push('/');
    return null;
  }

  const totalFraud = investigations.reduce((s, i) => s + i.totalFraudAmount, 0);
  const totalEntities = investigations.reduce((s, i) => s + i.entities.length, 0);
  const totalDocuments = investigations.reduce((s, i) => s + i.documents.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Investigations</h1>
        <p className="text-muted-foreground mt-1">
          Active fraud investigations with AI-powered analysis and evidence management
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Cases', value: investigations.filter((i) => i.status === 'active').length.toString(), icon: Shield, color: 'text-primary' },
          { label: 'Total Fraud Identified', value: formatCurrency(totalFraud), icon: DollarSign, color: 'text-waste' },
          { label: 'Entities Under Investigation', value: totalEntities.toString(), icon: Users, color: 'text-warning-accent' },
          { label: 'Evidence Documents', value: totalDocuments.toString(), icon: FileText, color: 'text-savings' },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-md p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold font-data">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Investigation list */}
      <div className="space-y-4">
        {investigations.map((investigation) => (
          <div
            key={investigation.id}
            onClick={() => router.push(`/dashboard/investigations/${investigation.id}`)}
            className="bg-card border border-border rounded-md p-6 hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Scale className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="font-semibold text-lg truncate">{investigation.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{investigation.summary}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-sm text-xs font-medium ${STATUS_STYLES[investigation.status]}`}>
                    {investigation.status.charAt(0).toUpperCase() + investigation.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                    {TYPE_LABELS[investigation.type]}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {investigation.entities.length} entities
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {investigation.documents.length} documents
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Opened {new Date(investigation.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold font-data text-waste">
                  {formatCurrency(investigation.totalFraudAmount)}
                </div>
                <div className="text-xs text-muted-foreground">estimated fraud</div>
                {investigation.complaint && (
                  <div className="text-xs text-primary mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Treble: {formatCurrency(investigation.complaint.trebleDamages)}
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-3 ml-auto group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        ))}

        {investigations.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No investigations yet</p>
            <p className="text-sm">Investigations will appear here when created from flagged anomalies.</p>
          </div>
        )}
      </div>
    </div>
  );
}
