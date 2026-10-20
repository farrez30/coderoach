/**
 * Server-only helpers for the /api/opsscore route handlers.
 */
import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import type { Payload, RequiredDataFromCollectionSlug } from 'payload';
import type { Profile } from './profile';

export const SESSIONS = 'assessment-sessions' as const;
export const LEADS = 'assessment-leads' as const;

export const json = (body: Record<string, unknown>, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers });

/**
 * The visitor's address as Railway's edge reports it. X-Real-IP is set by the edge, which overwrites
 * whatever the client sent. The first X-Forwarded-For entry is the one a client can write itself, so
 * it never decides a rate limit; the last entry, appended by the hop in front of us, is the fallback.
 */
export function clientIp(req: Pick<NextRequest, 'headers'>) {
  const real = req.headers.get('x-real-ip')?.trim();
  if (real) return real;
  const chain = req.headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean);
  return chain?.at(-1) || 'unknown';
}

/**
 * In-memory, per server instance, and reset by every deploy. That is deliberate: the counters lived
 * in Postgres for one afternoon and the schema coupling took the quiz down twice. Anything that has
 * to hold across restarts belongs at the edge, where a Cloudflare rate limiting rule can refuse the
 * request before it reaches us at all.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(req: Pick<NextRequest, 'headers'>, route: string, max: number, windowMs = 10 * 60 * 1000) {
  const key = `${route}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (bucket.count >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return json({ ok: false, code: 'rate_limited' }, 429, { 'Retry-After': String(retryAfterSec) });
  }
  bucket.count += 1;
  return null;
}

/**
 * Rejects posts that come from another site. Requests without an Origin header (curl, server to
 * server) are left to the rate limits; browsers always send one on a cross-site POST.
 */
export function crossSite(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  const allowed = new Set<string>();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) allowed.add(host);
  const site = process.env.NEXT_PUBLIC_SERVER_URL;
  if (site) {
    try {
      allowed.add(new URL(site).host);
    } catch {}
  }
  try {
    if (allowed.has(new URL(origin).host)) return null;
  } catch {}
  return json({ ok: false, code: 'forbidden' }, 403);
}

const MAX_BODY_BYTES = 32 * 1024;

/** Parses a small JSON object body. Returns null for empty, oversized, or malformed bodies. */
export async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY_BYTES) return null;
  try {
    const text = await req.text();
    if (!text || text.length > MAX_BODY_BYTES) return null;
    const body = JSON.parse(text);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isSessionId = (id: string) => UUID.test(id);

// 32 characters without the 0/o and 1/l lookalikes, so a random byte masked to 5 bits stays uniform.
const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

export function newShareSlug(length = 8) {
  return Array.from(randomBytes(length), (b) => SLUG_ALPHABET[b & 31]).join('');
}

export async function findSession(payload: Payload, id: string) {
  if (!isSessionId(id)) return null;
  return payload.findByID({
    collection: SESSIONS,
    id,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
  });
}

export const truncate = (value: string | null | undefined, max = 500) => (value || '').slice(0, max);

/** True when this WhatsApp number already reached us from another session. Flagged, never blocked. */
export async function phoneSeenBefore(payload: Payload, sessionId: string, phoneE164: string) {
  const { docs } = await payload.find({
    collection: LEADS,
    where: { and: [{ phoneE164: { equals: phoneE164 } }, { session: { not_equals: sessionId } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return docs.length > 0;
}

type LeadData = RequiredDataFromCollectionSlug<'assessment-leads'>;

/**
 * Creates or updates the one lead for a session. Only fields present in `profile`/`contact` are written,
 * so a partial save never clears what an earlier section stored.
 */
export async function upsertLead(
  payload: Payload,
  sessionId: string,
  profile: Profile,
  contact: { phoneE164?: string; email?: string; consentAt?: string; repeatContact?: boolean } = {},
) {
  const data: Partial<LeadData> = {
    ...(profile.name ? { name: profile.name } : {}),
    ...(profile.brand ? { brand: profile.brand } : {}),
    ...(profile.industry ? { industry: profile.industry as LeadData['industry'] } : {}),
    ...(profile.employees ? { employees: profile.employees as LeadData['employees'] } : {}),
    ...(profile.revenue ? { revenueBand: profile.revenue as LeadData['revenueBand'] } : {}),
    ...(profile.website ? { website: profile.website } : {}),
    ...contact,
  };
  const find = () =>
    payload
      .find({ collection: LEADS, where: { session: { equals: sessionId } }, limit: 1, depth: 0, overrideAccess: true })
      .then((result) => result.docs[0] ?? null);

  const existing = await find();
  if (!Object.keys(data).length) return existing;
  if (existing) {
    return payload.update({ collection: LEADS, id: existing.id, data, overrideAccess: true, depth: 0 });
  }
  try {
    return await payload.create({
      collection: LEADS,
      data: { session: sessionId, followupStatus: 'new', ...data },
      overrideAccess: true,
      depth: 0,
    });
  } catch (err) {
    // Two saves raced (e.g. section end and tab close); the unique index let one through.
    const winner = await find();
    if (!winner) throw err;
    return payload.update({ collection: LEADS, id: winner.id, data, overrideAccess: true, depth: 0 });
  }
}
