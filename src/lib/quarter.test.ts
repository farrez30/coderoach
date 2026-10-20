import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jakartaQuarter } from './quarter';

test('names the quarter in Jakarta time, not UTC', () => {
  assert.equal(jakartaQuarter(new Date('2026-10-20T03:00:00Z')), 'Q4 2026');
  // 31 March 20:00 UTC is already 1 April in Jakarta.
  assert.equal(jakartaQuarter(new Date('2026-03-31T20:00:00Z')), 'Q2 2026');
  assert.equal(jakartaQuarter(new Date('2026-03-31T16:00:00Z')), 'Q1 2026');
});
