// Benford's Law Analysis
// Expected first-digit distribution according to Benford's Law
const BENFORD_EXPECTED = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

export interface BenfordResult {
  digit: number;
  expected: number;
  observed: number;
  deviation: number;
}

export interface BenfordAnalysis {
  results: BenfordResult[];
  chiSquared: number;
  pValue: number;
  isAnomaly: boolean;
  summary: string;
}

function getFirstDigit(n: number): number {
  const abs = Math.abs(n);
  if (abs < 1) return 0;
  const str = abs.toString().replace(/[^0-9]/g, '');
  for (const ch of str) {
    const d = parseInt(ch);
    if (d > 0) return d;
  }
  return 0;
}

export function analyzeBenford(amounts: number[]): BenfordAnalysis {
  // Filter out amounts < 10 (need at least 2 digits for Benford's to apply)
  const valid = amounts.filter((a) => Math.abs(a) >= 10);
  const n = valid.length;

  if (n < 50) {
    return {
      results: BENFORD_EXPECTED.slice(1).map((exp, i) => ({
        digit: i + 1,
        expected: exp,
        observed: 0,
        deviation: 0,
      })),
      chiSquared: 0,
      pValue: 1,
      isAnomaly: false,
      summary: 'Insufficient data for Benford analysis (need at least 50 transactions).',
    };
  }

  // Count first digits
  const counts = new Array(10).fill(0);
  for (const amount of valid) {
    const d = getFirstDigit(amount);
    if (d >= 1 && d <= 9) counts[d]++;
  }

  const total = counts.slice(1).reduce((s, c) => s + c, 0);

  // Calculate observed proportions and chi-squared
  let chiSquared = 0;
  const results: BenfordResult[] = [];

  for (let d = 1; d <= 9; d++) {
    const observed = counts[d] / total;
    const expected = BENFORD_EXPECTED[d];
    const deviation = observed - expected;
    const chiComponent = ((counts[d] - total * expected) ** 2) / (total * expected);
    chiSquared += chiComponent;

    results.push({ digit: d, expected, observed, deviation });
  }

  // Chi-squared critical values for 8 degrees of freedom
  // p=0.05 → 15.507, p=0.01 → 20.090
  const isAnomaly = chiSquared > 15.507;
  const pValue = chiSquared > 20.09 ? 0.01 : chiSquared > 15.507 ? 0.05 : 0.1;

  const maxDeviation = Math.max(...results.map((r) => Math.abs(r.deviation)));
  const worstDigit = results.find((r) => Math.abs(r.deviation) === maxDeviation)!;

  const summary = isAnomaly
    ? `Transaction amounts show significant deviation from Benford's Law (χ²=${chiSquared.toFixed(1)}, p<${pValue}). Digit ${worstDigit.digit} appears ${(worstDigit.observed * 100).toFixed(1)}% of the time vs expected ${(worstDigit.expected * 100).toFixed(1)}%. This may indicate data manipulation.`
    : `Transaction amounts follow Benford's Law distribution within expected parameters (χ²=${chiSquared.toFixed(1)}). No significant anomalies detected.`;

  return { results, chiSquared, pValue, isAnomaly, summary };
}
