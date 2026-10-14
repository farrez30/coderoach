import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { CLIENTS } from '../landing/copy';
import { consentAllows, isConsent, isConsentRef, type Grant } from './consent';
import { LEGACY_CLIENT_NAMES, LEGACY_ENTRIES, numericTokens } from './legacy-baseline';
import { formatMetric, metricProblems, toFeaturedMetric, type Metric } from './metrics';
import { HIDDEN_PROJECT_SLUGS, PORTFOLIO, type PortfolioEntry } from './projects';
import { assetsOf } from './sync';
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
    ...Object.values(entry.summary ?? {}),
    ...(entry.features ?? []).flatMap((f) => [f.title, f.body]),
    ...(entry.timeline ?? []).flatMap((t) => [t.title, t.detail ?? '']),
    ...Object.values(entry.darkChapter ?? {}),
    entry.showcase?.tourTranscript ?? '',
    entry.showcase?.demoNote ?? '',
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
    // Every file it names (cover, showcase, features, link snapshots), not only the cover.
    for (const entry of PORTFOLIO.filter((e) => e.kind === 'client' && e.consent === 'legacy')) {
      for (const { file } of assetsOf(entry)) assert.ok(LEGACY_ENTRIES[entry.slug].files.includes(file), `${entry.slug}: ${file}`);
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
    for (const { name } of CLIENTS) assert.ok((LEGACY_CLIENT_NAMES as readonly string[]).includes(name), name);
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

describe('portfolio story', () => {
  test('the result line quotes only numbers its metrics source', () => {
    for (const entry of PORTFOLIO) {
      if (!entry.summary?.result) continue;
      const sourced = new Set((entry.metrics ?? []).flatMap((m) => numericTokens(`${m.value} ${m.baseline?.value ?? ''}`)));
      for (const n of numericTokens(entry.summary.result)) assert.ok(sourced.has(n), `${entry.slug}: ${n} in summary.result has no metric`);
    }
  });

  test('a story page has all three parts of its summary', () => {
    for (const entry of PORTFOLIO) {
      if (!entry.summary) continue;
      assert.ok(entry.summary.problem && entry.summary.solution && entry.summary.result, entry.slug);
    }
  });
});

describe('portfolio assets', () => {
  const dir = path.join(process.cwd(), 'scripts/portfolio-assets');
  const named = PORTFOLIO.flatMap((e) => assetsOf(e).map((a) => ({ slug: e.slug, ...a })));
  // Budgets in KB: loop, tour, and poster from ADR 0006; a still loads with the page like a poster does.
  const budget = (file: string) =>
    /-loop\.v\d+\.mp4$/.test(file) ? 600 : file.endsWith('.mp4') ? 8 * 1024 : file.includes('.poster.') ? 150 : 300;

  test('every file an entry names is in the repo, has alt text, and fits its budget', () => {
    for (const a of named) {
      const file = path.join(dir, a.file);
      const bytes = statSync(file, { throwIfNoEntry: false })?.size;
      assert.ok(bytes !== undefined, `${a.slug}: ${a.file} is missing`);
      assert.ok(a.alt.trim().length >= 10, `${a.slug}: ${a.file} needs alt text`);
      const kb = Math.round(bytes / 1024);
      assert.ok(kb <= budget(a.file), `${a.slug}: ${a.file} is ${kb} KB, budget ${budget(a.file)} KB`);
    }
  });

  test('new assets are versioned, so a changed file never hides behind a cached URL', () => {
    for (const a of named) {
      if (/^portfolio-[a-z-]+\.webp$/.test(a.file)) continue; // covers from before ADR 0006
      assert.match(a.file, /\.v\d+\.(?:poster\.)?(?:webp|mp4|webm|vtt)$/, `${a.slug}: ${a.file}`);
    }
  });

  test('nothing in the folder goes unused (it is public, and every byte ships with the repo)', () => {
    const used = new Set(named.map((a) => a.file));
    for (const file of readdirSync(dir)) assert.ok(used.has(file), `${file} is not named by any entry`);
  });
});
