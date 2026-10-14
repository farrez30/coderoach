import https from 'node:https';
import { classify, failureReason, type LinkStatus, type Response } from './classify';
import { BlockedTarget, safeLookup, validateTarget } from './guard';

export type Hop = {
  status: number;
  headers: Response['headers'] & { location?: string };
  body: string;
};

export type FetchOnce = (url: URL, timeoutMs: number) => Promise<Hop>;

export type ProbeResult = {
  status: LinkStatus;
  httpStatus?: number;
  reason?: string;
  /** origin + pathname of where the link ended up. */
  finalUrl: string;
  title?: string;
  durationMs: number;
};

const MAX_REDIRECTS = 5;
const MAX_BODY = 64 * 1024;
const USER_AGENT = 'coderoach-linkcheck/1 (+https://coderoach.id/work)';

const originAndPath = (url: URL) => `${url.origin}${url.pathname}`;

/**
 * Follows a link by hand, at most five redirects, re-validating every hop: a public link that
 * redirects to an internal address is as dangerous as the internal address itself.
 */
export async function probe(
  raw: string,
  { fetchOnce = httpsFetchOnce, timeoutMs = 10_000, now = Date.now }: { fetchOnce?: FetchOnce; timeoutMs?: number; now?: () => number } = {},
): Promise<ProbeResult> {
  const started = now();
  const done = (r: Omit<ProbeResult, 'durationMs'>): ProbeResult => ({ ...r, durationMs: now() - started });

  let current: URL;
  try {
    current = validateTarget(raw);
  } catch (error) {
    return done({ status: 'mati', reason: blockedReason(error), finalUrl: raw.slice(0, 200) });
  }

  for (let hop = 0; ; hop++) {
    let res: Hop;
    try {
      res = await fetchOnce(current, timeoutMs);
    } catch (error) {
      return done({ status: 'mati', reason: failureReason(error), finalUrl: originAndPath(current) });
    }
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      if (hop >= MAX_REDIRECTS) {
        return done({ status: 'mati', reason: 'too-many-redirects', httpStatus: res.status, finalUrl: originAndPath(current) });
      }
      try {
        current = validateTarget(new URL(res.headers.location, current));
      } catch {
        return done({ status: 'mati', reason: 'redirect-blocked', httpStatus: res.status, finalUrl: originAndPath(current) });
      }
      continue;
    }
    const verdict = classify({ status: res.status, headers: res.headers, body: res.body, finalUrl: originAndPath(current) });
    return done({ ...verdict, httpStatus: res.status, finalUrl: originAndPath(current) });
  }
}

function blockedReason(error: unknown): string {
  return error instanceof BlockedTarget ? `blocked-${error.reason}` : 'invalid-url';
}

/**
 * One GET with the address guard on the socket. No cookies, no compression (identity keeps the
 * 64 KiB cap a real cap), and the body is read only when it can say something: a title or a
 * password field.
 */
export const httpsFetchOnce: FetchOnce = (url, timeoutMs) =>
  new Promise<Hop>((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'GET',
        agent: false,
        lookup: safeLookup() as never,
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*;q=0.8', 'accept-encoding': 'identity' },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const header = (name: string) => {
          const value = res.headers[name];
          return Array.isArray(value) ? value[0] : value;
        };
        const headers = {
          location: header('location'),
          'www-authenticate': header('www-authenticate'),
          'cf-mitigated': header('cf-mitigated'),
        };
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ status, headers, body: '' });
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          resolve({ status, headers, body: Buffer.concat(chunks).toString('utf8') });
        };
        res.on('data', (chunk: Buffer) => {
          const room = MAX_BODY - size;
          if (room > 0) chunks.push(chunk.subarray(0, room));
          size += chunk.length;
          if (size >= MAX_BODY) {
            finish();
            res.destroy();
          }
        });
        res.on('end', finish);
        res.on('error', (error) => (finished ? undefined : reject(error)));
      },
    );
    req.on('error', reject);
    req.end();
  });
