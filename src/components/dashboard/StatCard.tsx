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

type AccentColor = NonNullable<Props['accentColor']>;

function formatValue(value: number, fmt: Props['format']): string {
  if (fmt === 'currency') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  if (fmt === 'score') return value.toString();
  return value.toLocaleString();
}

const colorMap: Record<AccentColor, string> = {
  default: 'text-primary',
  red: 'text-waste',
  green: 'text-savings',
  amber: 'text-warning-accent',
};

const barColorMap: Record<AccentColor, string> = {
  default: 'var(--color-accent)',
  red: 'var(--color-waste)',
  green: 'var(--color-savings)',
  amber: 'var(--color-warning-accent)',
};

export function StatCard({ title, value, format: fmt, change, changeLabel, accentColor = 'default' }: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const [barFilled, setBarFilled] = useState(false);

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

  // Trigger progress bar animation after mount
  useEffect(() => {
    const timeout = setTimeout(() => setBarFilled(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const isPositiveGood = accentColor === 'green';
  const isPositiveChange = change > 0;

  const changeColor = isPositiveGood
    ? isPositiveChange ? 'text-savings' : 'text-waste'
    : isPositiveChange ? 'text-waste' : 'text-savings';

  const changeBgColor = isPositiveGood
    ? isPositiveChange ? 'bg-savings/10' : 'bg-waste/10'
    : isPositiveChange ? 'bg-waste/10' : 'bg-savings/10';

  const barColor = barColorMap[accentColor];

  return (
    <div
      className={cn(
        'relative overflow-hidden group',
        'p-5 rounded-xl bg-card border border-border',
        'transition-all duration-200 hover:-translate-y-0.5',
      )}
      style={{ boxShadow: 'var(--shadow-md)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-hover, var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.12)))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Accent top border — draws in from the left on hover */}
      <div
        className="absolute top-0 left-0 h-0.5 bg-accent transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100 w-full rounded-t-xl"
      />

      <p className="uppercase tracking-wider text-[11px] font-semibold text-muted-foreground mb-2">
        {title}
      </p>

      <div className="flex items-end justify-between">
        <span className={cn('text-3xl font-bold font-data', colorMap[accentColor])}>
          {formatValue(displayValue, fmt)}
        </span>

        {/* Trend badge pill */}
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold',
            changeColor,
            changeBgColor,
          )}
        >
          {isPositiveChange ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change)}%</span>
          {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-[3px] bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: barFilled ? '75%' : '0%',
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}
