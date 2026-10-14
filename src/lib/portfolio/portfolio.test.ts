import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import { CLIENTS } from '../landing/copy';
import { consentAllows, isConsent, isConsentRef, type Grant } from './consent';
import { LEGACY_CLIENT_NAMES, LEGACY_ENTRIES, numericTokens } from './legacy-baseline';
import { formatMetric, metricProblems, toFeaturedMetric, type Metric } from './metrics';
import { HIDDEN_PROJECT_SLUGS, PORTFOLIO, type PortfolioEntry } from './projects';
import { INDUSTRIES, RETIRED_INDUSTRIES, industryLabel } from './taxonomy';

/** Static segments under /work that a project slug must never shadow. */
const RESERVED_SLUGS = ['presentasi'];

const todayWib = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

function blockText(block: PortfolioEntry['body'][number]): string {
  return typeof block === 'string' ? block : Object.values(block).join(' ');
}

/** Every piece of copy an entry puts on the page, without URLs (links are their own permission). */
function copyOf(entry: PortfolioEntry): string {
  const fd = entry.featuredDetails;
  return [
    entry.client,
    entry.tagline,
    entry.meta,
    entry.excerpt,
    entry.publishedYear,
    ...entry.pills,
    ...entry.body.map(blockText),
    ...(fd ? [fd.badgeLabel, fd.metaLine, fd.headline, fd.description, ...fd.stack] : []),
    ...(entry.studio ? [entry.studio.usage, ...entry.studio.bullets] : []),
  ].join(' ');
}

describe('portfolio consent', () => {
  test('every entry carries a consent', () => {
    for (const entry of PORTFOLIO) assert.ok(isConsent(entry.consent), `${entry.slug}: ${entry.consent}`);
  });

  test('legacy consent is only for entries that were live before the rule', () => {
    for (const entry of PORTFOLIO.filter((e) => e.consent === 'legacy')) {
      assert.ok(LEGACY_ENTRIES[entry.slug], `${entry.slug} was not on the site on 14 Oct 2026`);
    }
  });

  test('studio consent is only for studio and lab entries', () => {
    for (const entry of PORTFOLIO.filter((e) => e.consent === 'studio')) {
      assert.notEqual(entry.kind, 'client', `${entry.slug} is a client case study`);
    }
  });

  test('a client entry on legacy consent adds no new numbers', () => {
    for (const entry of PORTFOLIO.filter((e) => e.kind === 'client' && e.consent === 'legacy')) {
      const allowed = new Set(LEGACY_ENTRIES[entry.slug].numbers);
      const added = numericTokens(copyOf(entry)).filter((n) => !allowed.has(n));
      assert.deepEqual(added, [], `${entry.slug} needs a permission (IZN-…) for ${added.join(', ')}`);
    }
  });

  test('a client entry on legacy consent adds no new images', () => {
    for (const entry of PORTFOLIO.filter((e) => e.kind === 'client' && e.consent === 'legacy' && e.cover)) {
      assert.ok(LEGACY_ENTRIES[entry.slug].files.includes(entry.cover!.file), `${entry.slug}: ${entry.cover!.file}`);
    }
  });

  test('a metric on a client entry has its own permission', () => {
    for (const entry of PORTFOLIO.filter((e) => e.kind === 'client')) {
      for (const metric of entry.metrics ?? []) {
        const legacyOk =
          metric.consent === 'legacy' &&
          numericTokens(`${metric.value} ${metric.baseline?.value ?? ''}`).every((n) =>
            LEGACY_ENTRIES[entry.slug]?.numbers.includes(n),
          );
        assert.ok(isConsentRef(metric.consent) || legacyOk, `${entry.slug}/${metric.key}`);
      }
    }
  });

  test('the hero marquee only names clients already shown before the rule', () => {
    for (const name of CLIENTS) assert.ok((LEGACY_CLIENT_NAMES as readonly string[]).includes(name), name);
  });

  test('consentAllows needs a granted, in-scope permission, and the metric key for numbers', () => {
    const grants = new Map<string, Grant>([
      [
        'IZN-2026-001',
        { ref: 'IZN-2026-001', status: 'diberikan', cakupan: ['nama', 'angka'], kunciMetrik: ['a'], slugSitus: 'x', kedaluwarsa: null },
      ],
      [
        'IZN-2026-002',
        { ref: 'IZN-2026-002', status: 'dicabut', cakupan: ['nama'], kunciMetrik: [], slugSitus: 'x', kedaluwarsa: null },
      ],
      [
        'IZN-2026-003',
        { ref: 'IZN-2026-003', status: 'kedaluwarsa', cakupan: ['logo'], kunciMetrik: [], slugSitus: 'x', kedaluwarsa: '2026-01-01' },
      ],
    ]);
    assert.equal(consentAllows('studio', 'angka', grants), true);
    assert.equal(consentAllows('legacy', 'nama', grants), true);
    assert.equal(consentAllows('IZN-2026-001', 'nama', grants), true);
    assert.equal(consentAllows('IZN-2026-001', 'angka', grants, 'a'), true);
    assert.equal(consentAllows('IZN-2026-001', 'angka', grants, 'b'), false);
    assert.equal(consentAllows('IZN-2026-001', 'logo', grants), false);
    assert.equal(consentAllows('IZN-2026-002', 'nama', grants), false);
    assert.equal(consentAllows('IZN-2026-003', 'logo', grants), false);
    assert.equal(consentAllows('IZN-2026-999', 'nama', grants), false);
  });

  test('consent refs have the Coderoach OS shape', () => {
    assert.equal(isConsentRef('IZN-2026-001'), true);
    assert.equal(isConsentRef('IZN-26-1'), false);
    assert.equal(isConsent('granted'), false);
  });
});

describe('portfolio metrics', () => {
  const all = PORTFOLIO.flatMap((e) => (e.metrics ?? []).map((m) => [e.slug, m] as const));

  test('every metric is fit to publish', () => {
    for (const [slug, metric] of all) assert.deepEqual(metricProblems(metric, todayWib), [], `${slug}/${metric.key}`);
  });

  test('metric keys are unique per project, and at most three are featured', () => {
    for (const entry of PORTFOLIO) {
      const keys = (entry.metrics ?? []).map((m) => m.key);
      assert.equal(new Set(keys).size, keys.length, entry.slug);
      assert.ok((entry.metrics ?? []).filter((m) => m.featured).length <= 3, entry.slug);
    }
  });

  test('the home page card shows exactly the featured, sourced metrics', () => {
    for (const entry of PORTFOLIO.filter((e) => e.featuredDetails)) {
      const expected = (entry.metrics ?? []).filter((m) => m.featured).map(toFeaturedMetric);
      assert.deepEqual(entry.featuredDetails!.metrics, expected, entry.slug);
    }
  });

  test('a target is never written as a result', () => {
    const base: Metric = {
      key: 'tutup-buku',
      value: '2',
      unit: 'hari kerja',
      label: 'Tutup buku',
      status: 'target',
      measuredAt: '2026-05-05',
      method: 'Target di PRD: dari 5–7 hari ke paling lama 2 hari kerja.',
      sourceRef: 'laporta_v2/docs/prd.md',
      consent: 'studio',
    };
    assert.equal(formatMetric(base), 'Target 2 hari kerja');
    assert.match(toFeaturedMetric(base).num, /^Target /);
    assert.deepEqual(metricProblems({ ...base, status: 'measured' }, todayWib), [
      'reads like a target but is marked measured',
    ]);
  });

  test('metricProblems catches the usual mistakes', () => {
    const bad: Metric = {
      key: 'Bad Key',
      value: '1.5',
      unit: '',
      label: '',
      status: 'measured',
      measuredAt: '2999-01-01',
      method: 'short',
      verifyUrl: 'http://example.com',
      consent: 'studio',
    };
    assert.equal(metricProblems(bad, todayWib).length, 6);
  });

  test('no unsourced claim from before the rule comes back', () => {
    const copy = readFileSync(new URL('./projects.ts', import.meta.url), 'utf8');
    assert.doesNotMatch(copy, /∞|CUT BUDGET|budget salary|belasan outlet/i);
  });
});

describe('portfolio entries', () => {
  test('slugs are unique and never shadow a route under /work', () => {
    const slugs = [...PORTFOLIO.map((e) => e.slug), ...HIDDEN_PROJECT_SLUGS];
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) assert.ok(!RESERVED_SLUGS.includes(slug), slug);
  });

  test('every industry is one the site can label', () => {
    const known = new Set<string>([...INDUSTRIES.map((i) => i.value), ...RETIRED_INDUSTRIES]);
    for (const entry of PORTFOLIO) assert.ok(known.has(entry.industry), `${entry.slug}: ${entry.industry}`);
    assert.equal(industryLabel('fb'), 'F&B dan restoran');
    assert.equal(industryLabel('nonsense'), 'Lainnya');
  });

  test('numericTokens reads Indonesian numbers', () => {
    assert.deepEqual(numericTokens('Rp33,9 juta, 397 invoice, 2.736 ms, 20,3 → 9,4 MB'), ['33,9', '397', '2.736', '20,3', '9,4']);
  });
});
