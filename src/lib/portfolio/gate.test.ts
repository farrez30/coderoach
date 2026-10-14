import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { Grant } from './consent';
import { gateEntry, refsIn } from './gate';
import { assumedGrants, loadGrants } from './grants';
import type { Metric } from './metrics';
import type { PortfolioEntry } from './projects';
import { changedFields, toProjectData } from './sync';

const metric = (key: string, consent: Metric['consent'], featured = false): Metric => ({
  key,
  value: '1,7',
  unit: 'layar',
  label: key,
  status: 'measured',
  measuredAt: '2026-07-29',
  method: 'Diukur dari layar crew sebelum dan sesudah perubahan.',
  sourceRef: 'repo@abc1234',
  consent,
  featured,
});

const base: PortfolioEntry = {
  slug: 'contoh',
  consent: 'IZN-2026-001',
  order: 1,
  kind: 'client',
  client: 'Contoh',
  tagline: 'Tagline',
  meta: 'META',
  industry: 'fb',
  service: 'build',
  publishedYear: '2026',
  pills: [],
  excerpt: 'Excerpt',
  body: ['Paragraf.'],
  metrics: [metric('a', 'IZN-2026-001', true), metric('b', 'IZN-2026-001', true), metric('c', 'studio')],
  links: [
    { kind: 'live', label: 'Situs', href: 'https://contoh.example', consent: 'IZN-2026-001' },
    { kind: 'repo', label: 'Repo', href: 'https://github.com/contoh', consent: 'IZN-2026-002' },
  ],
  showcase: { frame: 'laptop', screen: { file: 'x.v1.webp', alt: 'x' }, tour: { file: 't.v1.mp4', alt: 't' }, consent: 'IZN-2026-001' },
  testimonial: { quote: 'Q', author: 'A', role: 'R', company: 'C', givenAt: '2026-10-01', consent: 'IZN-2026-002' },
  featuredDetails: {
    badgeLabel: '',
    shippedLabel: '',
    metaLine: '',
    headline: '',
    description: '',
    metrics: [],
    codePanel: { tag: '', path: '', lines: [] },
    stack: [],
  },
};

const grant = (over: Partial<Grant>): Grant => ({
  ref: 'IZN-2026-001',
  status: 'diberikan',
  cakupan: ['nama', 'angka', 'link', 'tangkapan'],
  kunciMetrik: ['a'],
  slugSitus: 'contoh',
  kedaluwarsa: null,
  ...over,
});

describe('gateEntry', () => {
  test('an entry without permission to be named is left out entirely', () => {
    assert.equal(gateEntry(base, new Map()).entry, null);
  });

  test('items keep only what their permission covers', () => {
    const { entry, blocked } = gateEntry(base, new Map([['IZN-2026-001', grant({})]]));
    assert.deepEqual(entry?.metrics?.map((m) => m.key), ['a', 'c']);
    assert.deepEqual(entry?.links?.map((l) => l.kind), ['live']);
    assert.equal(entry?.testimonial, undefined);
    assert.equal(entry?.showcase?.screen?.file, 'x.v1.webp');
    assert.equal(entry?.showcase?.tour, undefined, 'tangkapan without video keeps stills, drops the tour');
    assert.equal(blocked.length, 4);
  });

  test('a revoked permission takes the entry down', () => {
    assert.equal(gateEntry(base, new Map([['IZN-2026-001', grant({ status: 'dicabut' })]])).entry, null);
  });

  test('refsIn lists every reference once', () => {
    assert.deepEqual(refsIn([base]).sort(), ['IZN-2026-001', 'IZN-2026-002']);
  });
});

describe('loadGrants', () => {
  const answer = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

  test('asks nothing when no reference is used', async () => {
    const grants = await loadGrants([], { fetchImpl: (() => assert.fail('no request expected')) as typeof fetch });
    assert.equal(grants.size, 0);
  });

  test('fails closed without configuration, on an error status, or on an odd answer', async () => {
    await assert.rejects(loadGrants(['IZN-2026-001'], {}), /CODEROACH_OS_URL/);
    await assert.rejects(loadGrants(['IZN-2026-001'], { baseUrl: 'https://os.example', token: 't', fetchImpl: answer(401, {}) }), /401/);
    await assert.rejects(loadGrants(['IZN-2026-001'], { baseUrl: 'https://os.example', token: 't', fetchImpl: answer(200, {}) }), /Unexpected/);
  });

  test('maps the answer by reference', async () => {
    const grants = await loadGrants(['IZN-2026-001'], {
      baseUrl: 'https://os.example',
      token: 't',
      fetchImpl: answer(200, { izin: [grant({})] }),
    });
    assert.equal(grants.get('IZN-2026-001')?.status, 'diberikan');
  });

  test('assumed grants cover every scope, for a local database', () => {
    const grants = assumedGrants(['IZN-2026-001'], ['a', 'b']);
    const { blocked } = gateEntry(base, grants);
    // Only IZN-2026-001 is assumed; the repo link and the testimonial use IZN-2026-002.
    assert.equal(blocked.length, 2);
    assert.ok(blocked.every((b) => b.includes('IZN-2026-002')));
  });
});

describe('toProjectData', () => {
  test('owned fields are written empty when absent, so taking them out takes them down', () => {
    const data = toProjectData({ ...base, metrics: undefined, links: undefined, showcase: undefined, testimonial: undefined }, 1, new Map());
    assert.deepEqual(data.metrics, []);
    assert.deepEqual(data.links, []);
    assert.equal(data.showcase?.screen, null);
    assert.equal(data.testimonial?.quote, null);
    assert.equal(data.summary?.problem, null);
  });

  test('the home card shows only the featured metrics that survived the gate', () => {
    const { entry } = gateEntry(base, new Map([['IZN-2026-001', grant({})]]));
    const data = toProjectData(entry!, 1, new Map([['x.v1.webp', 7]]));
    assert.deepEqual(data.featuredDetails?.metrics?.map((m) => m.label), ['A']);
    assert.equal(data.showcase?.screen, 7);
  });
});

describe('changedFields', () => {
  const data = toProjectData({ ...base, consent: 'studio' }, 1, new Map());

  test('a stored copy of the same data, with row ids and timestamps, is unchanged', () => {
    const stored = JSON.parse(JSON.stringify(data));
    stored.id = 9;
    stored.updatedAt = '2026-10-14T10:00:00.000Z';
    stored.pills = stored.pills.map((p: object, i: number) => ({ ...p, id: `row-${i}` }));
    // Midnight WIB, the way a date field on a server in Jakarta stores "2026-07-29".
    stored.metrics = stored.metrics.map((m: object) => ({ ...m, measuredAt: '2026-07-28T17:00:00.000Z' }));
    stored.summary.problem = '';
    assert.deepEqual(changedFields(stored, data), []);
  });

  test('names the fields that differ, including a removed row', () => {
    const stored = JSON.parse(JSON.stringify(data));
    stored.tagline = 'Tagline lama';
    stored.metrics = [...stored.metrics, stored.metrics[0]];
    assert.deepEqual(changedFields(stored, data), ['tagline', 'metrics']);
  });
});
