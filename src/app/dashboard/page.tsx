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
import { motion } from 'framer-motion';

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
        <h1 className="text-2xl font-bold">Command Center</h1>
        <p className="text-muted-foreground text-sm">
          Overview of spending analysis and detected anomalies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spend"
          value={stats.totalSpend}
          format="currency"
          change={stats.totalSpendChange}
          changeLabel="vs prior"
          delay={0}
        />
        <StatCard
          title="Waste Detected"
          value={stats.wasteDetected}
          format="currency"
          change={stats.wasteDetectedChange}
          accentColor="red"
          changeLabel="vs prior"
          delay={0.1}
        />
        <StatCard
          title="Savings Opportunities"
          value={stats.savingsOpportunities}
          format="currency"
          change={stats.savingsChange}
          accentColor="green"
          changeLabel="vs prior"
          delay={0.2}
        />
        <StatCard
          title="Risk Score"
          value={stats.riskScore}
          format="score"
          change={stats.riskScoreChange}
          accentColor={stats.riskScore >= 60 ? 'red' : stats.riskScore >= 30 ? 'amber' : 'green'}
          changeLabel="pts"
          delay={0.3}
        />
      </div>

      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Overview</TabsTrigger>
          <TabsTrigger value="flags">
            Red Flags
            {activeFlags.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-waste/20 text-waste text-[10px] font-bold">
                {activeFlags.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Spending by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingByDepartmentChart
                    departments={departments}
                    transactions={filteredTransactions}
                    fiscalYear={fiscalPeriod.startsWith('FY') ? fiscalPeriod : undefined}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdownChart transactions={filteredTransactions} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 10 Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <TopVendorsTable vendors={vendors} flags={flags} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Flags & Anomalies</CardTitle>
                <button
                  onClick={() => router.push('/dashboard/flags')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View all flags
                </button>
              </CardHeader>
              <CardContent>
                <RecentFlags flags={flags} limit={10} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
