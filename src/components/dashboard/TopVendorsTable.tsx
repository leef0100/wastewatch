'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { Vendor, Flag } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  vendors: Vendor[];
  flags: Flag[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getRiskColor(riskScore: number): string {
  if (riskScore >= 60) return 'bg-waste';
  if (riskScore >= 30) return 'bg-warning-accent';
  return 'bg-savings';
}

function getRiskBadgeColor(riskScore: number): string {
  if (riskScore >= 60) return 'bg-waste/20 text-waste';
  if (riskScore >= 30) return 'bg-warning-accent/20 text-warning-accent';
  return 'bg-savings/20 text-savings';
}

export function TopVendorsTable({ vendors, flags }: Props) {
  const router = useRouter();

  const topVendors = [...vendors]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-muted-foreground mb-2">
        Showing {topVendors.length} of {vendors.length}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary">
            <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vendor</th>
            <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Paid</th>
            <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transactions</th>
            <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risk</th>
            <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Flags</th>
          </tr>
        </thead>
        <tbody>
          {topVendors.map((vendor, i) => {
            const vendorFlags = flags.filter((f) => f.affectedVendor === vendor.name);
            const criticalFlags = vendorFlags.filter((f) => f.severity === 'critical').length;
            const riskBadgeColor = getRiskBadgeColor(vendor.riskScore);
            const riskBarColor = getRiskColor(vendor.riskScore);
            const riskDotColor = getRiskColor(vendor.riskScore);

            return (
              <tr
                key={vendor.id}
                className={cn(
                  'border-b border-border/50 cursor-pointer hover:bg-accent-light hover:translate-x-0.5 transition-all duration-150',
                  i % 2 === 1 && 'bg-secondary/50'
                )}
                onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium flex items-center">
                    <span
                      className={cn(
                        'inline-block w-1.5 h-1.5 rounded-full mr-2',
                        riskDotColor
                      )}
                    />
                    {vendor.name}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-data">{formatCurrency(vendor.totalPaid)}</td>
                <td className="py-3 px-4 text-right font-data">{vendor.transactionCount}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col items-center gap-1">
                    <Badge
                      variant="secondary"
                      className={cn('text-xs border border-current/10', riskBadgeColor)}
                    >
                      {vendor.riskScore}
                    </Badge>
                    <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', riskBarColor)}
                        style={{ width: `${Math.min(vendor.riskScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  {vendorFlags.length > 0 ? (
                    <Badge
                      variant={criticalFlags > 0 ? 'destructive' : 'secondary'}
                      className="text-xs border border-current/10"
                    >
                      {vendorFlags.length}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
