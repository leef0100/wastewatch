'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
  '#1d6ce0',
  '#c4161c',
  '#0a7b3e',
  '#b47a0a',
  '#7c3aed',
  '#0891b2',
  '#d946ef',
  '#ea580c',
  '#4f46e5',
  '#059669',
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
  const data: CategoryDataPoint[] = Array.from(categoryTotals.entries())
    .map(([name, value]) => ({ name, value, percentage: ((value / total) * 100).toFixed(1) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut chart */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            cornerRadius={3}
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
              padding: '8px 12px',
              fontSize: '12px',
            }}
            formatter={(value) => [formatCurrency(Number(value))]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend — separate from chart */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5 px-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-foreground truncate">{item.name}</span>
            <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
