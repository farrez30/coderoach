import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { clientIp, rateLimited } from './api';

const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

describe('clientIp', () => {
  test('trusts the X-Real-IP the edge sets over anything in X-Forwarded-For', () => {
    assert.equal(clientIp(req({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '1.2.3.4, 203.0.113.7' })), '203.0.113.7');
  });

  test('never takes the first X-Forwarded-For entry, which the client can write', () => {
    assert.equal(clientIp(req({ 'x-forwarded-for': '1.2.3.4, 198.51.100.9' })), '198.51.100.9');
  });

  test('falls back to "unknown"', () => {
    assert.equal(clientIp(req({})), 'unknown');
  });
});

describe('rateLimited', () => {
  test('a forged X-Forwarded-For does not buy a fresh bucket', () => {
    const route = `test:${Math.random()}`;
    const from = (forged: string) => req({ 'x-real-ip': '203.0.113.50', 'x-forwarded-for': `${forged}, 203.0.113.50` });
    assert.equal(rateLimited(from('10.0.0.1'), route, 2), null);
    assert.equal(rateLimited(from('10.0.0.2'), route, 2), null);
    const blocked = rateLimited(from('10.0.0.3'), route, 2);
    assert.equal(blocked?.status, 429);
    assert.ok(Number(blocked?.headers.get('Retry-After')) > 0);
  });
});
