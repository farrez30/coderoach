import type { Consent } from './consent';

/**
 * A number shown on the portfolio. PRODUCT.md: every claim can be traced to a system that runs, a
 * client who can be named, or a number in a repository. So a metric carries where it came from,
 * when it was measured, how, and who allowed it to be shown.
 */
export type Metric = {
  /** Stable id, also what a permission in Coderoach OS lists in kunci_metrik. */
  key: string;
  /** As it reads in Indonesian: decimal comma, en dash for ranges, e.g. "1,7", "76–101", "14/14". */
  value: string;
  unit: string;
  label: string;
  /** The "before" side, when the number is an improvement. */
  baseline?: { value: string; unit: string };
  /** A target is never written as a result; formatMetric() labels it. */
  status: 'measured' | 'target';
  /** ISO date the number was measured (or, for a target, set). */
  measuredAt: string;
  /** How it was measured, in a sentence a prospect can follow. */
  method: string;
  /** Where to verify it: `repo@commit`, or a document path. */
  sourceRef?: string;
  /** Public page where anyone can check it (PageSpeed, Wayback, GitHub). */
  verifyUrl?: string;
  consent: Consent;
  /** Shown on the home page's featured card (at most three per project). */
  featured?: boolean;
};

const VALUE = /^(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d+)?(?:(?:–|\/)(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d+)?)?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TARGET_WORDS = /\b(target|rencana|prd|proyeksi|estimasi|diharapkan)\b/i;

/** Problems with a metric, empty when it is fit to publish. `today` is an ISO date (WIB). */
export function metricProblems(m: Metric, today: string): string[] {
  const problems: string[] = [];
  if (!KEY.test(m.key)) problems.push(`key "${m.key}" is not kebab-case`);
  if (!VALUE.test(m.value)) problems.push(`value "${m.value}" is not an Indonesian number, range, or fraction`);
  if (m.baseline && !VALUE.test(m.baseline.value)) problems.push(`baseline "${m.baseline.value}" is not a number`);
  if (!m.label.trim()) problems.push('label is empty');
  if (!ISO_DATE.test(m.measuredAt) || Number.isNaN(Date.parse(m.measuredAt))) {
    problems.push(`measuredAt "${m.measuredAt}" is not an ISO date`);
  } else if (m.status === 'measured' && m.measuredAt > today) {
    problems.push(`measuredAt ${m.measuredAt} is in the future`);
  }
  if (m.method.trim().length < 20) problems.push('method must say how the number was measured');
  if (m.status === 'measured' && TARGET_WORDS.test(`${m.label} ${m.method}`)) {
    problems.push('reads like a target but is marked measured');
  }
  if (!m.sourceRef && !m.verifyUrl) problems.push('needs a sourceRef or a verifyUrl');
  if (m.verifyUrl && !m.verifyUrl.startsWith('https://')) problems.push('verifyUrl must be https');
  return problems;
}

/** The number as a sentence fragment. Targets always say so. */
export function formatMetric(m: Pick<Metric, 'value' | 'unit' | 'baseline' | 'status'>): string {
  const value = [m.value, m.unit].filter(Boolean).join(' ');
  const from = m.baseline ? ` (dari ${[m.baseline.value, m.baseline.unit].filter(Boolean).join(' ')})` : '';
  return `${m.status === 'target' ? 'Target ' : ''}${value}${from}`;
}

/** Shape of featuredDetails.metrics on the home page card, derived so it can't drift from the source. */
export function toFeaturedMetric(m: Metric): { num: string; accent: string; label: string } {
  const from = m.baseline ? ` (DARI ${[m.baseline.value, m.baseline.unit].filter(Boolean).join(' ')})` : '';
  return {
    num: m.status === 'target' ? `Target ${m.value}` : m.value,
    accent: m.unit ? ` ${m.unit}` : '',
    label: `${m.label}${from}`.toUpperCase(),
  };
}
