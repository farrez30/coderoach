import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { cleanDeep, cleanString, leftovers, topLevelKeys } from './text-cleanup';

describe('text cleanup', () => {
  test('rewrites a seed sentence and leaves an edited one alone', () => {
    assert.equal(cleanString('Bukan menjual jam — kami menjual hasil yang terukur.', 'lede'), 'Bukan menjual jam. Kami menjual hasil yang terukur.');
    assert.equal(cleanString('Bukan menjual jam — kami menjual dampak.', 'lede'), 'Bukan menjual jam — kami menjual dampak.');
  });

  test('drops a trailing arrow from labels only', () => {
    assert.equal(cleanString('Kirim brief →', 'submit'), 'Kirim brief');
    assert.equal(cleanString('Mulai brief →', 'label'), 'Mulai brief');
    assert.equal(cleanString('Langkah 1 →', 'heading'), 'Langkah 1 →');
  });

  test('walks nested blocks and reports what changed and what is left', () => {
    const page = {
      id: 7,
      layout: [{ id: 'a', blockType: 'cta', cta: { label: 'Mulai brief proyek →', href: '/#contact' } }],
      meta: { metaTitle: 'About — Coderoach Studio', metaDescription: 'Ditulis ulang — oleh admin.' },
    };
    const { value, changes } = cleanDeep(page);
    assert.deepEqual(
      changes.map((c) => c.path),
      ['layout[0].cta.label', 'meta.metaTitle'],
    );
    assert.deepEqual(topLevelKeys(changes), ['layout', 'meta']);
    assert.equal((value as typeof page).id, 7);
    assert.deepEqual(leftovers(value), ['meta.metaDescription: Ditulis ulang — oleh admin.']);
  });

  test('every rewrite matches what src/lib/seed.ts now says', () => {
    // A fragment's "after" must exist in the seed, so a fresh database and a cleaned one read the same.
    const seed = readFileSync(path.join(import.meta.dirname, 'seed.ts'), 'utf8');
    const source = readFileSync(path.join(import.meta.dirname, 'text-cleanup.ts'), 'utf8');
    const afters = [...source.matchAll(/\['[^']*', '([^']*)'\]/g)].map((m) => m[1]);
    assert.ok(afters.length > 30);
    assert.deepEqual(afters.filter((a) => !seed.includes(a)), []);
  });
});
