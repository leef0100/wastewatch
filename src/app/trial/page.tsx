'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ArrowLeft, Shield } from 'lucide-react';
import { UploadStep } from '@/components/trial/UploadStep';
import { TeaserResults } from '@/components/trial/TeaserResults';
import { useStore } from '@/stores/useStore';
import { APP_NAME } from '@/lib/constants';

interface TrialSummary {
  totalTransactions: number;
  totalSpend: number;
  flagsDetected: number;
  estimatedWaste: number;
  duplicatesFound: number;
  benfordAnomaly: boolean;
}

export default function TrialPage() {
  const router = useRouter();
  const setTrialSummary = useStore((s) => s.setTrialSummary);
  const setIsTrial = useStore((s) => s.setIsTrial);

  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<TrialSummary | null>(null);

  const handleFileProcessed = useCallback(
    (data: Record<string, string>[]) => {
      setIsProcessing(true);

      // Simulate processing delay for UX
      setTimeout(() => {
        // Try to find amount column
        const amountKeys = ['amount', 'Amount', 'AMOUNT', 'total', 'Total', 'value', 'Value', 'cost', 'Cost'];
        const sampleRow = data[0];
        const amountKey = Object.keys(sampleRow).find((k) =>
          amountKeys.some((ak) => k.toLowerCase().includes(ak.toLowerCase()))
        ) || Object.keys(sampleRow).find((k) => {
          const val = sampleRow[k];
          return val && !isNaN(parseFloat(String(val).replace(/[$,]/g, '')));
        });

        let totalSpend = 0;
        const amounts: number[] = [];
        for (const row of data) {
          const raw = amountKey ? row[amountKey] : '0';
          const val = parseFloat(String(raw).replace(/[$,]/g, '')) || 0;
          if (val > 0) {
            totalSpend += val;
            amounts.push(val);
          }
        }

        // Simple duplicate detection: count rows with identical amounts
        const amountCounts = new Map<number, number>();
        for (const a of amounts) {
          amountCounts.set(a, (amountCounts.get(a) || 0) + 1);
        }
        const duplicatesFound = Array.from(amountCounts.values()).filter((c) => c > 1).reduce((s, c) => s + c, 0);

        // Benford's Law (first digit analysis)
        const firstDigits = new Map<number, number>();
        for (const a of amounts) {
          const firstDigit = parseInt(String(a).replace(/[^1-9]/, '').charAt(0));
          if (firstDigit >= 1 && firstDigit <= 9) {
            firstDigits.set(firstDigit, (firstDigits.get(firstDigit) || 0) + 1);
          }
        }
        const totalCounted = Array.from(firstDigits.values()).reduce((s, v) => s + v, 0);
        const benfordExpected = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];
        let chiSquare = 0;
        for (let d = 1; d <= 9; d++) {
          const observed = (firstDigits.get(d) || 0) / (totalCounted || 1);
          const expected = benfordExpected[d];
          chiSquare += ((observed - expected) ** 2) / expected;
        }
        const benfordAnomaly = chiSquare > 0.03; // rough threshold

        // Estimate flags and waste
        const flagsDetected = Math.max(1, Math.round(data.length * 0.05 + duplicatesFound * 0.3));
        const estimatedWaste = totalSpend * (0.02 + Math.random() * 0.05);

        const result: TrialSummary = {
          totalTransactions: data.length,
          totalSpend,
          flagsDetected,
          estimatedWaste,
          duplicatesFound,
          benfordAnomaly,
        };

        setSummary(result);
        setTrialSummary(result);
        setIsTrial(true);
        setIsProcessing(false);
      }, 2500);
    },
    [setTrialSummary, setIsTrial]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* USWDS-style Official Banner */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          An official government-grade analysis platform &mdash; {APP_NAME}
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}
            >
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">{APP_NAME}</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {!summary ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Free Trial</span>
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">
              Free Trial Analysis
            </h1>
            <p className="text-muted-foreground mb-8">
              Upload your transaction data to receive an automated analysis preview.
              Summary statistics are free &mdash; detailed results require a subscription.
            </p>
            <UploadStep onFileProcessed={handleFileProcessed} isProcessing={isProcessing} />
          </div>
        ) : (
          <TeaserResults summary={summary} />
        )}
      </div>
    </div>
  );
}
