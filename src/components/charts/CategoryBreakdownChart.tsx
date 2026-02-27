'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  'var(--primary)',
  'var(--savings)',
  'var(--warning-accent)',
  'var(--waste)',
  '#2563EB',
  '#0891B2',
  '#6B7B8D',
  '#D97706',
  '#059669',
  '#1B3A5C',
];

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function CategoryBreakdownChart({ transactions }: Props) {
  const categoryTotals = new Map<string, number>();
  for (const t of transactions) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
  }

  const total = Array.from(categoryTotals.values()).reduce((s, v) => s + v, 0);
  const data = Array.from(categoryTotals.entries())
    .map(([name, value]) => ({ name, value, percentage: ((value / total) * 100).toFixed(1) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '13px',
          }}
          formatter={(value) => [formatCurrency(Number(value))]}
        />
        <Legend
          formatter={(value, entry) => {
            const item = data.find((d) => d.name === value);
            return `${value} (${item?.percentage}%)`;
          }}
          wrapperStyle={{ fontSize: '11px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
