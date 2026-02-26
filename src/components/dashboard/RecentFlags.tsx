'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { Flag } from '@/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Props {
  flags: Flag[];
  limit?: number;
}

const severityConfig = {
  critical: { color: 'bg-waste/20 text-waste border-waste/30', icon: AlertTriangle },
  warning: { color: 'bg-warning-accent/20 text-warning-accent border-warning-accent/30', icon: AlertCircle },
  info: { color: 'bg-primary/20 text-primary border-primary/30', icon: Info },
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function RecentFlags({ flags, limit = 8 }: Props) {
  const router = useRouter();
  const recentFlags = [...flags]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  if (recentFlags.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No flags detected. Upload data to begin analysis.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentFlags.map((flag) => {
        const config = severityConfig[flag.severity];
        const Icon = config.icon;
        return (
          <div
            key={flag.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => router.push('/dashboard/flags')}
          >
            <div className={cn('p-1.5 rounded-md shrink-0 mt-0.5', config.color)}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium truncate">{flag.title}</span>
                <Badge
                  variant="secondary"
                  className={cn('text-[10px] px-1.5 shrink-0', config.color)}
                >
                  {flag.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{flag.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-data font-medium text-waste">
                {formatCurrency(flag.estimatedWaste)}
              </div>
              <Badge variant="outline" className="text-[10px]">
                {flag.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
