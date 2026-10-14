import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import config from '../../payload.config';
import { describeSchema, nonAdditiveChanges, type SchemaShape } from './describe';

const baseline: SchemaShape = JSON.parse(readFileSync(new URL('./baseline.json', import.meta.url), 'utf8'));

describe('payload schema', () => {
  test('only grows, so a dev push never stops at a prompt or drops data', async () => {
    const current = describeSchema((await config) as never);
    assert.deepEqual(nonAdditiveChanges(baseline, current), []);
  });

  test('nonAdditiveChanges catches what a push cannot do quietly', () => {
    const before: SchemaShape = {
      'collection:x.kind': { type: 'select', options: ['a', 'b'] },
      'collection:x.title': { type: 'text' },
      'collection:x.tags': { type: 'relationship', relationTo: 'tags', hasMany: true },
    };
    const after: SchemaShape = {
      'collection:x.kind': { type: 'select', options: ['a', 'c'] },
      'collection:x.title': { type: 'textarea', required: true },
      'collection:x.tags': { type: 'relationship', relationTo: 'labels' },
      'collection:x.added': { type: 'text', required: true },
    };
    assert.deepEqual(nonAdditiveChanges(before, after), [
      'collection:x.kind: options removed (b)',
      'collection:x.title: type text → textarea',
      'collection:x.title: became required',
      'collection:x.tags: hasMany changed',
      'collection:x.tags: relationTo tags → labels',
      'collection:x.added: new field is required (NOT NULL on existing rows)',
    ]);
  });
});
