import assert from 'node:assert/strict';
import type { LookupAddress } from 'node:dns';
import { describe, test } from 'node:test';
import { classify, extractTitle, failureReason } from './classify';
import { BlockedTarget, isPublicAddress, safeLookup, validateTarget } from './guard';
import { probe, type FetchOnce, type Hop } from './probe';

describe('validateTarget', () => {
  const blocked: Array<[string, string]> = [
    ['http://example.org/', 'not-https'],
    ['https://user:pw@coderoach.id/', 'userinfo'],
    ['https://coderoach.id:8443/', 'port'],
    ['https://127.0.0.1/', 'ip-literal'],
    ['https://2130706433/', 'ip-literal'],
    ['https://0x7f.1/', 'ip-literal'],
    ['https://[::1]/', 'ip-literal'],
    ['https://[fd12::1]/', 'ip-literal'],
    ['https://localhost/', 'single-label'],
    ['https://localhost./', 'single-label'],
    ['https://postgres.railway.internal/', 'internal-host'],
    ['https://printer.local/', 'internal-host'],
    ['https://router.home.arpa/', 'internal-host'],
    ['https://web/', 'single-label'],
    ['not a url', 'invalid-url'],
  ];
  for (const [url, reason] of blocked) {
    test(`blocks ${url}`, () => {
      assert.throws(() => validateTarget(url), (e: unknown) => e instanceof BlockedTarget && e.reason === reason);
    });
  }

  test('lets a public https URL through', () => {
    assert.equal(validateTarget('https://www.theglobal-review.com/en').hostname, 'www.theglobal-review.com');
    assert.equal(validateTarget('https://coderoach.id:443/work').port, '');
  });
});

describe('isPublicAddress', () => {
  const privateOnes = [
    '0.0.0.0', '10.1.2.3', '100.64.0.1', '127.0.0.1', '169.254.169.254', '172.16.0.1', '172.31.255.255',
    '192.0.0.8', '192.0.2.1', '192.168.1.1', '198.18.0.1', '198.51.100.7', '203.0.113.9', '224.0.0.1',
    '255.255.255.255', '::', '::1', '::ffff:127.0.0.1', '::ffff:8.8.8.8', '64:ff9b::808:808', 'fc00::1',
    'fd12:3456::1', 'fe80::1', 'ff02::1', '2001::1', '2001:db8::1', '2002:7f00:1::', 'not-an-ip',
  ];
  for (const ip of privateOnes) test(`${ip} is not public`, () => assert.equal(isPublicAddress(ip), false));

  for (const ip of ['8.8.8.8', '104.21.32.1', '172.32.0.1', '2606:4700::6810:84e5', '2400:cb00::1']) {
    test(`${ip} is public`, () => assert.equal(isPublicAddress(ip), true));
  }
});

describe('safeLookup', () => {
  const resolverWith =
    (addresses: LookupAddress[]) =>
    (_host: string, _opts: unknown, cb: (err: NodeJS.ErrnoException | null, a: LookupAddress[]) => void) =>
      cb(null, addresses);

  const lookupOnce = (addresses: LookupAddress[], options: { all?: boolean } | number | undefined) =>
    new Promise<{ err: NodeJS.ErrnoException | null; address: unknown; family?: number }>((resolve) =>
      safeLookup(resolverWith(addresses) as never)('example.org', options, (err, address, family) =>
        resolve({ err, address, family }),
      ),
    );

  test('rejects a name with any private answer, even next to a public one', async () => {
    const { err } = await lookupOnce(
      [
        { address: '93.184.216.34', family: 4 },
        { address: '10.0.0.5', family: 4 },
      ],
      { all: true },
    );
    assert.equal(err?.code, 'EBLOCKED');
  });

  test('rejects a name with no answers', async () => {
    assert.equal((await lookupOnce([], {})).err?.code, 'EBLOCKED');
  });

  test('answers in the form the caller asked for', async () => {
    const one = await lookupOnce([{ address: '93.184.216.34', family: 4 }], {});
    assert.deepEqual([one.err, one.address, one.family], [null, '93.184.216.34', 4]);
    const all = await lookupOnce([{ address: '2606:4700::6810:84e5', family: 6 }], { all: true });
    assert.deepEqual(all.address, [{ address: '2606:4700::6810:84e5', family: 6 }]);
  });
});

describe('classify', () => {
  const res = (status: number, body = '', finalUrl = 'https://example.org/', headers = {}) =>
    classify({ status, body, finalUrl, headers });

  test('a 200 page is hidup, with its title', () => {
    assert.deepEqual(res(200, '<title>The Global Review &#8211; Analisis</title>'), {
      status: 'hidup',
      title: 'The Global Review – Analisis',
    });
  });
  test('a login page is login, whichever way it shows', () => {
    assert.equal(res(200, '', 'https://app.example.org/login').status, 'login');
    assert.equal(res(200, '<form><input name="p" type="password"></form>').status, 'login');
    assert.equal(res(200, '<title>Masuk · Laporta</title>').status, 'login');
    assert.equal(res(401).status, 'login');
    assert.equal(res(403, '', undefined, { 'www-authenticate': 'Basic' }).status, 'login');
  });
  test('a Cloudflare challenge is hidup', () => {
    assert.deepEqual(res(403, '', undefined, { 'cf-mitigated': 'challenge' }), {
      status: 'hidup',
      reason: 'cf-challenge',
      title: undefined,
    });
  });
  test('errors are mati', () => {
    assert.equal(res(402).status, 'mati');
    assert.equal(res(404).reason, 'http-404');
    assert.equal(res(503).status, 'mati');
  });
  test('titles are decoded, collapsed, and capped', () => {
    assert.equal(extractTitle(`<title>\n  A &amp; B\t&lt;c&gt;  </title>`), 'A & B <c>');
    assert.equal(extractTitle(`<title>${'x'.repeat(300)}</title>`)?.length, 120);
    assert.equal(extractTitle('<html></html>'), undefined);
  });
  test('failures are named', () => {
    assert.equal(failureReason({ code: 'EBLOCKED' }), 'blocked-address');
    assert.equal(failureReason({ name: 'TimeoutError' }), 'timeout');
    assert.equal(failureReason({ code: 'ENOTFOUND' }), 'dns');
    assert.equal(failureReason({ code: 'CERT_HAS_EXPIRED' }), 'tls');
    assert.equal(failureReason(new Error('x')), 'network');
  });
});

describe('probe', () => {
  /** A scripted web: each URL answers with one hop; anything else is a DNS failure. */
  const web = (pages: Record<string, Hop>): { fetchOnce: FetchOnce; seen: string[] } => {
    const seen: string[] = [];
    return {
      seen,
      fetchOnce: async (url) => {
        seen.push(url.href);
        const page = pages[url.href];
        if (!page) throw Object.assign(new Error('nope'), { code: 'ENOTFOUND' });
        return page;
      },
    };
  };
  const redirect = (location: string): Hop => ({ status: 301, headers: { location }, body: '' });
  const page = (body: string): Hop => ({ status: 200, headers: {}, body });

  test('follows relative redirects and keeps only origin + path', async () => {
    const { fetchOnce } = web({
      'https://example.org/': redirect('/id?utm=x'),
      'https://example.org/id?utm=x': page('<title>Halo</title>'),
    });
    const r = await probe('https://example.org/', { fetchOnce });
    assert.equal(r.status, 'hidup');
    assert.equal(r.finalUrl, 'https://example.org/id');
    assert.equal(r.title, 'Halo');
  });

  test('a redirect to an internal or http target is blocked, and never fetched', async () => {
    for (const target of ['http://example.org/', 'https://10.0.0.1/', 'https://postgres.railway.internal/']) {
      const { fetchOnce, seen } = web({ 'https://example.org/': redirect(target) });
      const r = await probe('https://example.org/', { fetchOnce });
      assert.equal(r.reason, 'redirect-blocked', target);
      assert.deepEqual(seen, ['https://example.org/']);
    }
  });

  test('more than five redirects is mati', async () => {
    const pages: Record<string, Hop> = {};
    for (let i = 0; i < 10; i++) pages[`https://example.org/${i}`] = redirect(`/${i + 1}`);
    const { fetchOnce, seen } = web(pages);
    const r = await probe('https://example.org/0', { fetchOnce });
    assert.equal(r.reason, 'too-many-redirects');
    assert.equal(seen.length, 6);
  });

  test('a blocked starting URL is mati without any request', async () => {
    const { fetchOnce, seen } = web({});
    const r = await probe('https://127.0.0.1/', { fetchOnce });
    assert.deepEqual([r.status, r.reason, seen.length], ['mati', 'blocked-ip-literal', 0]);
  });

  test('a network failure is mati with its reason', async () => {
    const { fetchOnce } = web({});
    assert.equal((await probe('https://gone.example.org/', { fetchOnce })).reason, 'dns');
  });
});
