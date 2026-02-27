'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

interface CategoryDataPoint {
  name: string;
  value: number;
  percentage: string;
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface CustomLegendEntry {
  value: string;
  color: string;
}

function renderCustomLegend(props: { payload?: CustomLegendEntry[] }, data: CategoryDataPoint[]) {
  const { payload } = props;
  if (!payload) return null;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '11px' }}>
      {payload.map((entry, index) => {
        const item = data.find((d) => d.name === entry.value);
        return (
          <li
            key={`legend-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
              color: 'var(--foreground)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 500 }}>{entry.value}</span>
            <span style={{ color: 'var(--muted-foreground)' }}>({item?.percentage}%)</span>
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryBreakdownChart({ transactions }: Props) {
  const categoryTotals = new Map<string, number>();
  for (const t of transactions) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
  }

  const total = Array.from(categoryTotals.values()).reduce((s, v) => s + v, 0);
  const data: CategoryDataPoint[] = Array.from(categoryTotals.entries())
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
          cornerRadius={4}
          isAnimationActive={true}
          animationDuration={800}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.05)',
            padding: '12px 16px',
            fontSize: '13px',
          }}
          formatter={(value) => [formatCurrency(Number(value))]}
        />
        <Legend content={(props) => renderCustomLegend(props as { payload?: CustomLegendEntry[] }, data)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
