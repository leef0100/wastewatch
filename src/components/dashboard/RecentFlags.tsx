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
  critical: {
    color: 'bg-waste/20 text-waste border-waste/30',
    borderLeft: 'border-l-waste',
    icon: AlertTriangle,
  },
  warning: {
    color: 'bg-warning-accent/20 text-warning-accent border-warning-accent/30',
    borderLeft: 'border-l-warning-accent',
    icon: AlertCircle,
  },
  info: {
    color: 'bg-primary/20 text-primary border-primary/30',
    borderLeft: 'border-l-accent',
    icon: Info,
  },
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
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
        <AlertTriangle className="w-8 h-8 mb-3 text-muted-foreground/50" />
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
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border border-border border-l-[3px] hover:bg-accent-light hover:translate-x-0.5 transition-all duration-150 cursor-pointer',
              config.borderLeft
            )}
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
                  className={cn(
                    'text-[10px] px-1.5 shrink-0 uppercase tracking-wide font-bold border border-current/10',
                    config.color
                  )}
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
