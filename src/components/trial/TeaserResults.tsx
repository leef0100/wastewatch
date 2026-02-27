'use client';

import { Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { WHOP_URL } from '@/lib/constants';

interface TrialSummary {
  totalTransactions: number;
  totalSpend: number;
  flagsDetected: number;
  estimatedWaste: number;
  duplicatesFound: number;
  benfordAnomaly: boolean;
}

interface Props {
  summary: TrialSummary;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function TeaserResults({ summary }: Props) {
  return (
    <div className="space-y-6">
      {/* Visible summary stats */}
      <div>
        <h2 className="font-heading text-xl font-bold mb-4">Analysis Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="text-xs text-muted-foreground mb-1">Transactions Scanned</div>
            <div className="text-2xl font-bold font-data">{summary.totalTransactions.toLocaleString()}</div>
          </div>
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="text-xs text-muted-foreground mb-1">Total Spend</div>
            <div className="text-2xl font-bold font-data">{formatCurrency(summary.totalSpend)}</div>
          </div>
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="text-xs text-muted-foreground mb-1">Flags Detected</div>
            <div className="text-2xl font-bold font-data text-waste">{summary.flagsDetected}</div>
          </div>
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="text-xs text-muted-foreground mb-1">Estimated Waste</div>
            <div className="text-2xl font-bold font-data text-waste">{formatCurrency(summary.estimatedWaste)}</div>
          </div>
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="text-xs text-muted-foreground mb-1">Duplicates Found</div>
            <div className="text-2xl font-bold font-data">{summary.duplicatesFound}</div>
          </div>
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="text-xs text-muted-foreground mb-1">Benford&apos;s Law</div>
            <div className={`text-lg font-bold ${summary.benfordAnomaly ? 'text-waste' : 'text-savings'}`}>
              {summary.benfordAnomaly ? 'Anomaly Detected' : 'Normal'}
            </div>
          </div>
        </div>
      </div>

      {/* Locked: Flag Details */}
      <div className="relative">
        <div className="trial-blur">
          <div className="border border-border rounded-md p-4 bg-card space-y-3">
            <h3 className="font-semibold text-base">Flag Details</h3>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="space-y-1">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card border border-border rounded-md p-6 text-center max-w-xs">
            <Lock className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Flag Details Locked</p>
            <p className="text-xs text-muted-foreground mb-3">
              Subscribe to see individual flag descriptions, affected vendors, and recommended actions.
            </p>
            <a
              href={WHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Unlock Full Analysis
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Locked: Department Breakdown */}
      <div className="relative">
        <div className="trial-blur">
          <div className="border border-border rounded-md p-4 bg-card space-y-3">
            <h3 className="font-semibold text-base">Department Breakdown</h3>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="space-y-1">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card border border-border rounded-md p-6 text-center max-w-xs">
            <Lock className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Department Data Locked</p>
            <p className="text-xs text-muted-foreground">
              Subscribe to view department-level analysis and budget utilization.
            </p>
          </div>
        </div>
      </div>

      {/* Locked: Export */}
      <div className="relative">
        <div className="trial-blur">
          <div className="border border-border rounded-md p-4 bg-card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Export Reports</h3>
              <p className="text-sm text-muted-foreground">Download CSV, PDF, and executive summaries</p>
            </div>
            <div className="h-9 w-24 bg-muted rounded-md" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card border border-border rounded-md p-4 text-center">
            <Lock className="w-5 h-5 text-gold mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Export requires subscription</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="border border-gold/30 rounded-md p-6 text-center bg-gold/5">
        <h3 className="font-heading text-lg font-bold mb-2">Unlock Your Full Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Get complete flag details, department breakdowns, vendor risk scores,
          export capabilities, and investigation tools.
        </p>
        <a
          href={WHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
        >
          Subscribe on Whop
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
