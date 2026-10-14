/** What the public page says about a link. The reason stays in the admin. */
export type LinkStatus = 'hidup' | 'login' | 'mati';

export type Response = {
  status: number;
  /** origin + pathname of the URL that answered, never the query string. */
  finalUrl: string;
  headers: { 'www-authenticate'?: string; 'cf-mitigated'?: string };
  /** At most the first 64 KiB of the body. */
  body: string;
};

export type Classified = { status: LinkStatus; reason?: string; title?: string };

const LOGIN_PATH = /\/(login|log-in|signin|sign-in|masuk|auth)(\/|$)/i;
const LOGIN_TITLE = /\blog ?in\b|\bsign ?in\b|\bmasuk\b/i;
const PASSWORD_INPUT = /<input\b[^>]*\btype\s*=\s*["']?password\b/i;

export function classify(res: Response): Classified {
  const title = extractTitle(res.body);
  const path = safePath(res.finalUrl);

  if (res.status >= 200 && res.status < 300) {
    if (LOGIN_PATH.test(path) || PASSWORD_INPUT.test(res.body) || (title && LOGIN_TITLE.test(title))) {
      return { status: 'login', title };
    }
    return { status: 'hidup', title };
  }
  if (res.status === 401 || (res.status === 403 && res.headers['www-authenticate'])) {
    return { status: 'login', reason: `http-${res.status}`, title };
  }
  // A Cloudflare challenge means the site is up and only the bot is being questioned.
  if ((res.status === 403 || res.status === 503) && res.headers['cf-mitigated'] === 'challenge') {
    return { status: 'hidup', reason: 'cf-challenge', title };
  }
  return { status: 'mati', reason: `http-${res.status}`, title };
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function extractTitle(html: string): string | undefined {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return undefined;
  const text = match[1]
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, entity: string) => {
      if (entity[0] === '#') {
        const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : '';
      }
      return ENTITIES[entity.toLowerCase()] ?? whole;
    })
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.slice(0, 120) : undefined;
}

function safePath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

/** Network failures, named so the admin can tell a dead site from a blocked target. */
export function failureReason(error: unknown): string {
  const code = (error as { code?: string; name?: string })?.code ?? (error as { name?: string })?.name ?? '';
  if (code === 'EBLOCKED') return 'blocked-address';
  if (code === 'ABORT_ERR' || code === 'AbortError' || code === 'TimeoutError' || code === 'ETIMEDOUT') return 'timeout';
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN' || code === 'ENODATA') return 'dns';
  if (code === 'ECONNREFUSED') return 'refused';
  if (code === 'ECONNRESET') return 'reset';
  if (/^(CERT_|ERR_TLS|UNABLE_TO|DEPTH_ZERO|SELF_SIGNED|ERR_SSL)/.test(code)) return 'tls';
  return 'network';
}
