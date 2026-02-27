'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { generateDemoData } from '@/lib/data/demo-generator';
import {
  Eye,
  ArrowRight,
  Shield,
  AlertTriangle,
  Upload,
  BarChart3,
  FileText,
  Loader2,
  Lock,
  Globe,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { WHOP_URL, APP_NAME } from '@/lib/constants';

export default function LandingPage() {
  const router = useRouter();
  const loadDemoData = useStore((s) => s.loadDemoData);
  const [loading, setLoading] = useState(false);

  function handleTryDemo() {
    setLoading(true);
    setTimeout(() => {
      const data = generateDemoData();
      loadDemoData(data);
      router.push('/dashboard');
    }, 50);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* USWDS-style Official Banner */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          An official government-grade analysis platform &mdash; {APP_NAME}
        </span>
      </div>

      {/* Nav */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">{APP_NAME}</span>
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
              onClick={() => router.push('/trial')}
              className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5 tracking-tight text-foreground">
            Government-Grade Fraud Detection
            <br className="hidden sm:block" />
            & Waste Analysis
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload your financial data. Receive automated anomaly detection, Benford&apos;s Law
            analysis, vendor risk scoring, and actionable reports &mdash; in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/trial')}
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              Upload Your Data
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleTryDemo}
              disabled={loading}
              className="w-full sm:w-auto h-11 px-8 border border-border text-foreground font-semibold rounded-md hover:bg-accent transition-colors text-base cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading Demo...
                </>
              ) : (
                'View Live Demo'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-14 px-4 sm:px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-2 text-center">
            Platform Capabilities
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Statistical forensics and AI-powered analysis for public and private sector organizations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-md overflow-hidden">
            {[
              {
                icon: AlertTriangle,
                title: 'Anomaly Detection',
                description:
                  'Identifies duplicate payments, split transactions, round-number abuse, ghost vendors, and end-of-period spending spikes.',
              },
              {
                icon: Shield,
                title: "Benford's Law Forensics",
                description:
                  'Applies first-digit distribution analysis to detect manipulated financial records and synthetic transaction data.',
              },
              {
                icon: BarChart3,
                title: 'Vendor & Department Risk Scoring',
                description:
                  'Scores vendors by flag history and concentration risk. Benchmarks departments by budget utilization and waste density.',
              },
              {
                icon: FileText,
                title: 'Automated Report Generation',
                description:
                  'Produces executive summaries, detailed waste analyses, savings projections, and draft False Claims Act complaints.',
              },
            ].map((capability, i) => (
              <div
                key={i}
                className="bg-card p-6 flex gap-4"
              >
                <capability.icon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{capability.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 px-4 sm:px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-10 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload',
                description:
                  'Upload your transaction data as CSV or Excel. No formatting required — WasteWatch maps your columns automatically.',
              },
              {
                step: '02',
                icon: BarChart3,
                title: 'Analyze',
                description:
                  'The engine scans for duplicates, Benford anomalies, vendor risk, budget overruns, and statistical outliers in under 60 seconds.',
              },
              {
                step: '03',
                icon: FileText,
                title: 'Report',
                description:
                  'Review interactive dashboards, drill into flagged transactions, and export PDF/CSV reports for stakeholder review.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-xs text-gold font-semibold font-data tracking-wider mb-1">
                  STEP {item.step}
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-14 px-4 sm:px-6 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-2 text-center">
            Case Study: Medicare Fraud Detection
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            WasteWatch analyzed 47,832 Medicare claims and identified a $31.2M fraud network
            involving shell companies, kickback payments, and falsified billing records.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { value: '$31.2M', label: 'Fraud identified' },
              { value: '12', label: 'Entities mapped' },
              { value: '$93.6M', label: 'Treble damages (FCA)' },
            ].map((stat, i) => (
              <div key={i} className="border border-border rounded-md p-4 text-center bg-background">
                <div className="text-2xl font-bold font-data text-waste mb-0.5">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={handleTryDemo}
              disabled={loading}
              className="h-10 px-6 border border-border text-foreground font-medium rounded-md hover:bg-accent transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Explore Full Investigation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Pricing / Subscribe CTA */}
      <section className="py-14 px-4 sm:px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold mb-3">
            Subscribe for Full Access
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Start with a free trial analysis of your data. Unlock full flag details,
            department breakdowns, export capabilities, and investigation tools with a subscription.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/trial')}
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={WHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-11 px-8 border border-gold text-gold font-semibold rounded-md hover:bg-gold/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              View Pricing
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 px-4 sm:px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-medium">
            Security & Compliance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: Lock, label: 'SOC 2 Type II' },
              { icon: Shield, label: 'FedRAMP Ready' },
              { icon: Globe, label: 'WCAG 2.1 AA' },
              { icon: CheckCircle2, label: '256-bit Encryption' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground"
              >
                <badge.icon className="w-3.5 h-3.5" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{APP_NAME}</span>
          </div>
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
