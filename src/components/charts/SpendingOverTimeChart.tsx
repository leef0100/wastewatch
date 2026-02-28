'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { Transaction } from '@/types';
import { format } from 'date-fns';

interface Props {
  transactions: Transaction[];
}

interface MonthlyDataPoint {
  month: string;
  amount: number;
  isAnomaly: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function SpendingOverTimeChart({ transactions }: Props) {
  // Aggregate by month
  const monthlySpend = new Map<string, number>();
  for (const t of transactions) {
    const month = format(new Date(t.date), 'yyyy-MM');
    monthlySpend.set(month, (monthlySpend.get(month) || 0) + t.amount);
  }

  const sorted = Array.from(monthlySpend.entries()).sort(([a], [b]) => a.localeCompare(b));
  const amounts = sorted.map(([, v]) => v);
  const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);

  const data: MonthlyDataPoint[] = sorted.map(([month, amount]) => ({
    month: format(new Date(month + '-01'), 'MMM yyyy'),
    amount,
    isAnomaly: amount > mean + 1.5 * stdDev,
  }));

  const anomalies = data.filter((d) => d.isAnomaly);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1d6ce0" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1d6ce0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#637083' }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11, fill: '#637083' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.05)',
            padding: '12px 16px',
            fontSize: '13px',
          }}
          formatter={(value) => [formatCurrency(Number(value)), 'Spend']}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#1d6ce0"
          fillOpacity={1}
          fill="url(#colorSpend)"
          strokeWidth={2}
          isAnimationActive={true}
          animationDuration={800}
        />
        {anomalies.map((a, i) => (
          <ReferenceDot
            key={i}
            x={a.month}
            y={a.amount}
            r={5}
            fill="#c4161c"
            stroke="#c4161c"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
