import type { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  SESSIONS,
  clientIp,
  crossSite,
  findSession,
  json,
  phoneSeenBefore,
  rateLimited,
  readJson,
  upsertLead,
} from '@/lib/opsscore/api';
import { emailDomain, isDisposableEmail, normalizeEmail } from '@/lib/opsscore/email';
import { domainAcceptsMail } from '@/lib/opsscore/email-server';
import { normalizePhone } from '@/lib/opsscore/phone';
import { sanitizeProfile } from '@/lib/opsscore/profile';
import { serviceClass, type Scores } from '@/lib/opsscore/scoring';
import { verifyTurnstile } from '@/lib/turnstile';

/**
 * Gate: the profile is already saved during the quiz, so this only needs WhatsApp and consent.
 * Any profile fields in the body are a fallback for saves that never reached the server.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = crossSite(req) ?? rateLimited(req, 'opsscore:gate', 10);
  if (blocked) return blocked;

  const { id } = await params;
  const body = await readJson(req);
  if (!body) return json({ ok: false, code: 'invalid_body' }, 400);

  // Honeypot — bots fill it; pretend it worked.
  if (body.company_url) return json({ ok: true });

  const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const phoneE164 = normalizePhone(rawPhone);
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  const email = rawEmail ? normalizeEmail(rawEmail) : null;
  const errors: Record<string, string> = {};
  if (!phoneE164) errors.phone = rawPhone ? 'phone' : 'required';
  if (rawEmail && !email) errors.email = 'email';
  else if (email && isDisposableEmail(email)) errors.email = 'emailDisposable';
  if (body.consent !== true) errors.consent = 'consent';
  if (Object.keys(errors).length) return json({ ok: false, code: 'invalid', errors }, 400);

  const humanCheck = await verifyTurnstile(body.turnstileToken, clientIp(req));
  if (humanCheck !== 'passed') {
    const turnstile = humanCheck === 'missing' ? 'turnstileMissing' : 'turnstile';
    return json({ ok: false, code: 'invalid', errors: { turnstile } }, 400);
  }

  if (email && !(await domainAcceptsMail(emailDomain(email)))) {
    return json({ ok: false, code: 'invalid', errors: { email: 'emailDomain' } }, 400);
  }

  try {
    const payload = await getPayload({ config });
    const session = await findSession(payload, id);
    if (!session) return json({ ok: false, code: 'not_found' }, 404);
    if (session.status === 'gated') return json({ ok: true });
    if (session.status !== 'completed' || !session.scores) {
      return json({ ok: false, code: 'not_completed' }, 409);
    }

    const now = new Date().toISOString();
    const lead = await upsertLead(payload, id, sanitizeProfile(body.profile), {
      phoneE164: phoneE164!,
      consentAt: now,
      repeatContact: await phoneSeenBefore(payload, id, phoneE164!),
      ...(email ? { email } : {}),
    });

    // Normally already final at completion; recomputed in case team size only arrived with this request.
    const scores = session.scores as Scores;
    const cls = serviceClass({ areas: scores.areas, phase: scores.phase, employees: lead?.employees ?? undefined });
    await payload.update({
      collection: SESSIONS,
      id,
      data: {
        scores: { ...scores, serviceClass: cls, cta: cls === 'READY' ? 'automation' : 'brief' },
        status: 'gated',
        gatedAt: now,
      },
      overrideAccess: true,
      depth: 0,
    });
    return json({ ok: true });
  } catch (err) {
    console.error('[opsscore] gate failed', err);
    return json({ ok: false, code: 'server_error' }, 500);
  }
}
