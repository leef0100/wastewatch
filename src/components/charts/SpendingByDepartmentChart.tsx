'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useRouter } from 'next/navigation';
import type { Department, Transaction } from '@/types';

interface Props {
  departments: Department[];
  transactions: Transaction[];
  fiscalYear?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function SpendingByDepartmentChart({ departments, transactions, fiscalYear = 'FY2025' }: Props) {
  const router = useRouter();

  const data = departments
    .map((dept) => {
      const deptTxns = transactions.filter(
        (t) => t.departmentId === dept.id && (!fiscalYear || t.fiscalYear === fiscalYear)
      );
      const actual = deptTxns.reduce((s, t) => s + t.amount, 0);
      return {
        name: dept.name.length > 18 ? dept.name.substring(0, 18) + '...' : dept.name,
        fullName: dept.name,
        id: dept.id,
        allocated: dept.allocatedBudget,
        actual,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        onClick={(state: any) => {
          if (state?.activePayload?.[0]?.payload?.id) {
            router.push(`/dashboard/departments/${state.activePayload[0].payload.id}`);
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '13px',
          }}
          formatter={(value, name) => [formatCurrency(Number(value)), name === 'actual' ? 'Actual Spend' : 'Budget']}
          labelFormatter={(label) => data.find((d) => d.name === label)?.fullName || label}
        />
        <Legend formatter={(value) => (value === 'allocated' ? 'Budget' : 'Actual Spend')} />
        <Bar dataKey="allocated" fill="var(--muted-foreground)" opacity={0.3} radius={[0, 4, 4, 0]} />
        <Bar dataKey="actual" fill="var(--primary)" radius={[0, 4, 4, 0]} cursor="pointer" />
      </BarChart>
    </ResponsiveContainer>
  );
}
