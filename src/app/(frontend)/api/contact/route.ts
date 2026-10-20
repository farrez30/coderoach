import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { clientIp, crossSite, findSession, rateLimited } from '@/lib/opsscore/api';
import { verifyTurnstile } from '@/lib/turnstile';

const ALLOWED_SCOPES = new Set([
  'Build',
  'Automate',
  'Intelligence',
  'Augment',
  'Belum yakin',
  'Other',
]);

const MAX_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  const foreign = crossSite(req);
  if (foreign) return foreign;

  const ip = clientIp(req);

  // Same per-instance counter as the OpsScore routes (lib/opsscore/api.ts), with this form's wording.
  const limited = rateLimited(req, 'contact', MAX_PER_WINDOW);
  if (limited) {
    const retryAfterSec = Number(limited.headers.get('Retry-After')) || 60;
    const minutes = Math.ceil(retryAfterSec / 60);
    return NextResponse.json(
      {
        ok: false,
        code: 'rate_limited',
        error: `Anda sudah mencapai batas ${MAX_PER_WINDOW} pengiriman dalam 10 menit terakhir. Coba lagi dalam ${minutes} menit, atau email langsung agar kami segera proses.`,
        retryAfterSec,
      },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const humanCheck = await verifyTurnstile(body?.turnstileToken, ip);
  if (humanCheck !== 'passed') {
    const error =
      humanCheck === 'missing'
        ? 'Verifikasi keamanan tidak termuat di browser ini. Matikan pemblokir untuk halaman ini lalu muat ulang, atau kirim brief lewat email.'
        : 'Verifikasi keamanan gagal. Muat ulang halaman, lalu coba lagi.';
    return NextResponse.json({ ok: false, code: 'turnstile', error }, { status: 400 });
  }

  // Honeypot: a filled field means a bot, answered with a quiet success and nothing saved.
  if (body?.company_url) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body?.email || '').trim();
  const scope = String(body?.scope || '').trim();
  const brief = String(body?.brief || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, code: 'invalid_email', error: 'Format email tidak valid. Pastikan menggunakan format email standar (mis. nama@perusahaan.com).' }, { status: 400 });
  }
  if (brief.length < 10) {
    return NextResponse.json({ ok: false, code: 'brief_too_short', error: 'Brief terlalu pendek. Minimal 10 karakter agar kami punya konteks awal yang cukup untuk merespons.' }, { status: 400 });
  }
  if (brief.length > 5000) {
    return NextResponse.json({ ok: false, code: 'brief_too_long', error: 'Brief terlalu panjang. Maksimal 5000 karakter.' }, { status: 400 });
  }
  const finalScope = ALLOWED_SCOPES.has(scope) ? scope : 'Other';
  const hasilId = typeof body?.hasil_id === 'string' ? body.hasil_id : '';

  try {
    const payload = await getPayload({ config });
    // Brief sent from an OpsScore report: link it, but never fail the brief over a bad id.
    const assessment = hasilId ? await findSession(payload, hasilId).catch(() => null) : null;
    await payload.create({
      collection: 'submissions',
      data: {
        email,
        scope: finalScope as 'Build' | 'Automate' | 'Intelligence' | 'Augment' | 'Belum yakin' | 'Other',
        brief,
        userAgent: req.headers.get('user-agent') || '',
        referrer: req.headers.get('referer') || '',
        submittedAt: new Date().toISOString(),
        status: 'new',
        ...(assessment ? { assessmentSession: assessment.id } : {}),
      },
      overrideAccess: true,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, code: 'server_error', error: 'Gagal menyimpan brief. Server sedang bermasalah, coba lagi sebentar lagi atau email langsung agar kami segera proses.' },
      { status: 500 },
    );
  }
}
