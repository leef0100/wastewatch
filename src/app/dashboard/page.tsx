'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { SpendingByDepartmentChart } from '@/components/charts/SpendingByDepartmentChart';
import { SpendingOverTimeChart } from '@/components/charts/SpendingOverTimeChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { TopVendorsTable } from '@/components/dashboard/TopVendorsTable';
import { RecentFlags } from '@/components/dashboard/RecentFlags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const router = useRouter();
  const organization = useStore((s) => s.organization);
  const transactions = useStore((s) => s.transactions);
  const departments = useStore((s) => s.departments);
  const vendors = useStore((s) => s.vendors);
  const flags = useStore((s) => s.flags);
  const fiscalPeriod = useStore((s) => s.fiscalPeriod);
  const dashboardStats = useStore((s) => s.dashboardStats);

  useEffect(() => {
    if (!organization && transactions.length === 0) {
      router.push('/');
    }
  }, [organization, transactions.length, router]);

  if (!organization) return null;

  const stats = dashboardStats();

  const filteredTransactions = fiscalPeriod.startsWith('FY')
    ? transactions.filter((t) => t.fiscalYear === fiscalPeriod)
    : fiscalPeriod.startsWith('Q')
    ? transactions.filter((t) => t.fiscalQuarter === parseInt(fiscalPeriod.replace('Q', '')))
    : transactions;

  const activeFlags = flags.filter((f) => f.status !== 'dismissed' && f.status !== 'resolved');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-0.5 bg-accent rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Platform Overview</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Command Center</h1>
            <p className="text-muted-foreground text-sm">
              Overview of spending analysis and detected anomalies
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-savings animate-pulse-dot" />
            Updated just now
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spend"
          value={stats.totalSpend}
          format="currency"
          change={stats.totalSpendChange}
          changeLabel="vs prior"
        />
        <StatCard
          title="Waste Detected"
          value={stats.wasteDetected}
          format="currency"
          change={stats.wasteDetectedChange}
          accentColor="red"
          changeLabel="vs prior"
        />
        <StatCard
          title="Savings Opportunities"
          value={stats.savingsOpportunities}
          format="currency"
          change={stats.savingsChange}
          accentColor="green"
          changeLabel="vs prior"
        />
        <StatCard
          title="Risk Score"
          value={stats.riskScore}
          format="score"
          change={stats.riskScoreChange}
          accentColor={stats.riskScore >= 60 ? 'red' : stats.riskScore >= 30 ? 'amber' : 'green'}
          changeLabel="pts"
        />
      </div>

      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Overview</TabsTrigger>
          <TabsTrigger value="flags">
            Red Flags
            {activeFlags.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full min-w-[20px] bg-waste/20 text-waste text-[10px] font-bold">
                {activeFlags.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading">Spending by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingByDepartmentChart
                    departments={departments}
                    transactions={filteredTransactions}
                    fiscalYear={fiscalPeriod.startsWith('FY') ? fiscalPeriod : undefined}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart transactions={filteredTransactions} />
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">
                Spending Over Time
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  Red dots indicate anomalous months
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingOverTimeChart transactions={transactions} />
            </CardContent>
          </Card>

          <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Top 10 Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <TopVendorsTable vendors={vendors} flags={flags} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          <Card className="rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-heading">Recent Flags & Anomalies</CardTitle>
              <button
                onClick={() => router.push('/dashboard/flags')}
                className="text-xs text-accent hover:text-accent/80 font-medium"
              >
                View all flags
              </button>
            </CardHeader>
            <CardContent>
              <RecentFlags flags={flags} limit={10} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
