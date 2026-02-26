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

export function TopVendorsTable({ vendors, flags }: Props) {
  const router = useRouter();

  const topVendors = [...vendors]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vendor</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Total Paid</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Transactions</th>
            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Risk</th>
            <th className="text-center py-3 px-4 text-muted-foreground font-medium">Flags</th>
          </tr>
        </thead>
        <tbody>
          {topVendors.map((vendor, i) => {
            const vendorFlags = flags.filter((f) => f.affectedVendor === vendor.name);
            const criticalFlags = vendorFlags.filter((f) => f.severity === 'critical').length;
            const riskColor = vendor.riskScore >= 60 ? 'bg-waste/20 text-waste' : vendor.riskScore >= 30 ? 'bg-warning-accent/20 text-warning-accent' : 'bg-savings/20 text-savings';

            return (
              <tr
                key={vendor.id}
                className={cn(
                  'border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors',
                  i % 2 === 0 && 'bg-muted/30'
                )}
                onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{vendor.name}</div>
                </td>
                <td className="py-3 px-4 text-right font-data">{formatCurrency(vendor.totalPaid)}</td>
                <td className="py-3 px-4 text-right font-data">{vendor.transactionCount}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant="secondary" className={cn('text-xs', riskColor)}>
                    {vendor.riskScore}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  {vendorFlags.length > 0 ? (
                    <Badge variant={criticalFlags > 0 ? 'destructive' : 'secondary'} className="text-xs">
                      {vendorFlags.length}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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
