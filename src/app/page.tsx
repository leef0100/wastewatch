'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { generateDemoData } from '@/lib/data/demo-generator';
import { motion } from 'framer-motion';
import {
  Eye,
  ArrowRight,
  Shield,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Zap,
  Lock,
  Globe,
  Loader2,
  Scale,
  Network,
  FileText,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const loadDemoData = useStore((s) => s.loadDemoData);
  const [loading, setLoading] = useState(false);

  function handleTryDemo() {
    setLoading(true);
    // Defer heavy work so the spinner renders first
    setTimeout(() => {
      const data = generateDemoData();
      loadDemoData(data);
      router.push('/dashboard');
    }, 50);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">WasteWatch</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleTryDemo}
              disabled={loading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:block"
            >
              Live Demo
            </button>
            <button
              onClick={() => router.push('/onboarding')}
              className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Enterprise-grade waste detection
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
              Every dollar wasted is a dollar{' '}
              <span className="text-primary">stolen</span> from your mission
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              WasteWatch analyzes your spending data to uncover fraud, waste, and
              inefficiency — automatically. Upload a spreadsheet and get actionable
              insights in 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={handleTryDemo}
                disabled={loading}
                className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Demo...
                  </>
                ) : (
                  <>
                    Try Live Demo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="w-full sm:w-auto h-12 px-8 border border-border text-foreground font-semibold rounded-lg hover:bg-accent transition-colors text-base cursor-pointer"
              >
                Start Free Analysis
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { value: '$2.4M', label: 'Average waste identified per customer', sub: 'within 30 days' },
              { value: '47%', label: 'Of organizations have duplicate payments', sub: 'in their records' },
              { value: '< 60s', label: 'Time to first insight', sub: 'from data upload' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card border border-border text-center"
              >
                <div className="text-3xl font-bold font-data text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">
              How WasteWatch protects your budget
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful analysis engine with zero configuration required
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: 'Anomaly Detection',
                description:
                  'Automatically flags duplicate payments, split transactions, and suspicious patterns using statistical analysis.',
                color: 'text-waste',
              },
              {
                icon: BarChart3,
                title: 'Spending Intelligence',
                description:
                  'Real-time dashboards showing spending by department, vendor, and category with drill-down capability.',
                color: 'text-primary',
              },
              {
                icon: TrendingDown,
                title: 'Savings Calculator',
                description:
                  'Quantifies recoverable waste and projects annual savings from implementing recommendations.',
                color: 'text-savings',
              },
              {
                icon: Shield,
                title: "Benford's Law Analysis",
                description:
                  'Advanced forensic technique that detects manipulated financial data by analyzing digit distribution patterns.',
                color: 'text-primary',
              },
              {
                icon: CheckCircle2,
                title: 'Vendor Risk Scoring',
                description:
                  'Scores vendors based on flag history, concentration risk, and contract compliance to prioritize reviews.',
                color: 'text-savings',
              },
              {
                icon: Globe,
                title: 'Department Benchmarking',
                description:
                  'Compares spending efficiency across departments to identify operational improvements.',
                color: 'text-warning-accent',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <feature.icon className={`w-6 h-6 ${feature.color} mb-3`} />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medicare Investigation Showcase */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-waste/10 text-waste text-sm font-medium mb-4">
              <Scale className="w-3.5 h-3.5" />
              Featured Case Study
            </div>
            <h2 className="text-3xl font-bold mb-3">
              $31.2M Medicare Fraud — Exposed in Minutes
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how WasteWatch analyzed 47,832 claims, mapped a shell company network,
              and generated a draft FCA complaint — work that normally takes months.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Network,
                title: 'Entity Network Graph',
                description: 'Interactive D3 visualization maps 12 entities and 18 connections including shell companies, kickback flows, and hidden ownership.',
                stat: '12 entities mapped',
                color: 'text-primary',
              },
              {
                icon: FileText,
                title: 'AI Document Analysis',
                description: '6 evidence documents analyzed by AI with 20 critical findings, risk scores, and suggested enforcement actions.',
                stat: '20 findings identified',
                color: 'text-warning-accent',
              },
              {
                icon: Scale,
                title: 'FCA Complaint Generator',
                description: 'Auto-generates a draft False Claims Act complaint with specific factual allegations, statutory citations, and treble damages.',
                stat: '$93.6M treble damages',
                color: 'text-waste',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                <div className="text-sm font-data font-semibold text-primary">{item.stat}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleTryDemo}
              disabled={loading}
              className="h-12 px-8 bg-waste text-white font-semibold rounded-lg hover:bg-waste/90 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Explore the Medicare Investigation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              Full interactive demo with entity graph, evidence analysis, and complaint generator
            </p>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">
            Enterprise Security & Compliance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Lock, label: 'SOC 2 Type II' },
              { icon: Shield, label: 'FedRAMP Ready' },
              { icon: Globe, label: 'WCAG 2.1 AA' },
              { icon: CheckCircle2, label: '256-bit Encryption' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground"
              >
                <badge.icon className="w-4 h-4" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop waste before it stops your mission
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join government agencies and Fortune 500 companies using WasteWatch
            to protect their budgets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={handleTryDemo}
              disabled={loading}
              className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading Demo...
                </>
              ) : (
                <>
                  Try Live Demo
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full sm:w-auto h-12 px-8 border border-border text-foreground font-semibold rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>WasteWatch</span>
          </div>
          <p>&copy; {new Date().getFullYear()} WasteWatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
