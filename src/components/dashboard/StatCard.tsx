'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  value: number;
  format: 'currency' | 'number' | 'score';
  change: number;
  changeLabel?: string;
  accentColor?: 'default' | 'red' | 'green' | 'amber';
  delay?: number;
}

function formatValue(value: number, fmt: string): string {
  if (fmt === 'currency') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  if (fmt === 'score') return value.toString();
  return value.toLocaleString();
}

export function StatCard({ title, value, format: fmt, change, changeLabel, accentColor = 'default' }: Props) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const colorMap = {
    default: 'text-primary',
    red: 'text-waste',
    green: 'text-savings',
    amber: 'text-warning-accent',
  };

  const isPositiveGood = accentColor === 'green';
  const isPositiveChange = change > 0;
  const changeColor = isPositiveGood
    ? isPositiveChange ? 'text-savings' : 'text-waste'
    : isPositiveChange ? 'text-waste' : 'text-savings';

  return (
    <div className="p-5 rounded-md bg-card border border-border">
      <p className="text-sm text-muted-foreground font-medium mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <span className={cn('text-3xl font-bold font-data', colorMap[accentColor])}>
          {formatValue(displayValue, fmt)}
        </span>
        <div className={cn('flex items-center gap-1 text-xs font-medium', changeColor)}>
          {isPositiveChange ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change)}%</span>
          {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
        </div>
      </div>
    </div>
  );
}
