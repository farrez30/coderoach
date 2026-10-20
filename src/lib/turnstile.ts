/**
 * Cloudflare Turnstile for the two public forms (the OpsScore gate and the brief).
 *
 * Both keys come from the Cloudflare dashboard. While they are unset the checks are skipped, so
 * local work, previews, and the current production deploy keep working until the keys are added.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileResult = 'passed' | 'missing' | 'failed';

/**
 * Server side of the check, with three answers instead of two:
 *
 * - `passed`: verified, or not configured, or Cloudflare could not be reached.
 * - `missing`: the visitor sent no token. Refused: a script that posts straight to the API never
 *   loads the widget, so accepting these would leave the check guarding nothing. A visitor whose
 *   blocker stops the widget is told so in the form and pointed to email instead.
 * - `failed`: Cloudflare looked at the token and rejected it. Refused too.
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return 'passed';
  if (typeof token !== 'string' || !token) return 'missing';

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5000) });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) console.warn('[turnstile] rejected', data['error-codes']);
    return data.success ? 'passed' : 'failed';
  } catch (err) {
    console.error('[turnstile] verification unreachable, letting the submission through', err);
    return 'passed';
  }
}
