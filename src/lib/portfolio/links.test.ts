import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { linkState, safeHref, STALE_AFTER_MS } from './links';

describe('linkState', () => {
  const now = Date.parse('2026-10-14T10:00:00Z');

  test('a fresh check is shown as it is', () => {
    const latest = { status: 'hidup' as const, checkedAt: '2026-10-14T05:17:00Z' };
    assert.deepEqual(linkState(latest, now), latest);
  });

  test('a check older than 48 hours, or none at all, claims nothing', () => {
    const old = new Date(now - STALE_AFTER_MS - 1000).toISOString();
    assert.equal(linkState({ status: 'hidup', checkedAt: old }, now), null);
    assert.equal(linkState(undefined, now), null);
    assert.equal(linkState({ status: 'mati', checkedAt: 'bukan tanggal' }, now), null);
  });
});

describe('safeHref', () => {
  test('keeps https links', () => {
    assert.equal(safeHref('https://laporta.example/masuk'), 'https://laporta.example/masuk');
  });

  test('drops anything a click could abuse', () => {
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', 'http://plain.example', '//evil.example', 'https://user:pw@x.example', '', null]) {
      assert.equal(safeHref(bad), null, String(bad));
    }
  });
});
