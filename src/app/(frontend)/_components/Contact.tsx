'use client';

import { useEffect, useRef, useState } from 'react';
import { TurnstileField, type TurnstileHandle } from './TurnstileField';
import { DeployConsole } from './DeployConsole';
import { CtaLabel } from './ui/CtaLabel';
import { Meta } from './ui/Meta';
import { StatusAlert } from './ui/StatusAlert';
import { useToast } from './ui/Toast';

type ContactData = {
  sectionMarker?: string | null;
  heading?: { line1?: string | null; line2Accent?: string | null } | null;
  lede?: string | null;
  scopes?: Array<{ scope: string }> | null;
  formLabels?: {
    email?: string | null;
    scope?: string | null;
    brief?: string | null;
    submit?: string | null;
    emailFallback?: string | null;
  } | null;
  successHeading?: string | null;
};

const formatStamp = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return [`${y}-${m}-${day}`, `${hh}:${mm} WIB`];
};

export function Contact({ data }: { data: ContactData | null }) {
  const [email, setEmail] = useState('');
  const [brief, setBrief] = useState('');
  const [scope, setScope] = useState('');
  const [focused, setFocused] = useState<'email' | 'scope' | 'brief' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstile = useRef<TurnstileHandle | null>(null);
  // Set when the visitor arrives from an OpsScore report (/?hasil_id=…#contact).
  const [hasilId, setHasilId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    tone: 'success' | 'error' | 'warning' | 'info';
    badge?: string;
    title: string;
    message?: string;
    primaryLabel?: string;
    secondaryLabel?: string;
    onSecondary?: () => void;
    onPrimary?: () => void;
  } | null>(null);
  const toast = useToast();

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('hasil_id');
    setHasilId(id);
    // The streamed homepage does not jump to #contact on load, so do it for OpsScore visitors.
    if (id && window.location.hash === '#contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const completion =
    (emailValid ? 40 : 0) +
    (scope ? 20 : 0) +
    (brief.length >= 80 ? 40 : Math.floor((Math.min(brief.length, 80) / 80) * 40));

  return (
    <section
      id="contact"
      data-theme="dark"
      className="relative overflow-hidden pt-[120px] pb-24 isolate"
    >
      <DeployConsole open={submitting} email={email} scope={scope} />
      {alert && (
        <StatusAlert
          open={alert.open}
          tone={alert.tone}
          badge={alert.badge}
          title={alert.title}
          message={alert.message}
          primaryLabel={alert.primaryLabel}
          onPrimary={alert.onPrimary || (() => setAlert(null))}
          secondaryLabel={alert.secondaryLabel}
          onSecondary={alert.onSecondary}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="absolute inset-0 -z-[2] bg-ink pointer-events-none" />
      {/* Hero bg — atmospheric halftone image, anchored right */}
      <div
        className="absolute inset-0 -z-[1] bg-no-repeat pointer-events-none opacity-[0.28]"
        style={{
          backgroundImage: 'url(/assets/texture-halftone-dark.png)',
          backgroundPosition: 'right -4% center',
          backgroundSize: '85% auto',
        }}
      />
      {/* Vignette — radial darken so image stays atmospheric, not overwhelming */}
      <div
        aria-hidden
        className="absolute inset-0 -z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,9,10,0.55)_60%,rgba(8,9,10,0.95)_100%)]"
      />
      {/* Top fade — softens entry from FAQ section above */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-40 -z-[1] pointer-events-none bg-gradient-to-b from-ink to-transparent"
      />
      {/* Bottom fade — blends into solid ink before footer */}
      <div
        aria-hidden
        className="absolute left-0 right-0 bottom-0 h-56 -z-[1] pointer-events-none bg-gradient-to-b from-transparent to-ink"
      />

      <div className="max-w-[1180px] mx-auto px-8 relative z-[1] text-paper">
        <div className="max-w-[760px] mx-auto mb-16 text-center reveal">
          <span className="font-mono text-xs font-medium tracking-wider uppercase inline-flex items-center gap-2 flex-wrap text-mist-500 tabular justify-center">
            [ CONTACT ]
          </span>
          {data?.heading && (
            <h2 className="text-[clamp(48px,6vw,72px)] leading-[1.02] tracking-[-0.025em] font-bold mt-[18px] mb-6 text-balance">
              {data.heading.line1}
              <br />
              <span className="text-electric">{data.heading.line2Accent}</span>
            </h2>
          )}
          {data?.lede && (
            <p className="text-[17px] leading-[1.55] text-mist-500 m-0 mx-auto max-w-[620px] text-pretty">
              {data.lede}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start reveal">
            {/* Left — conversational prose form (with subtle electric rail for visual anchor) */}
            <form
              className="relative flex flex-col gap-9 lg:pl-8"
              onSubmit={async (e) => {
                e.preventDefault();
                if (submitting) return;
                // Client-side validation — show toast for quick fixes
                if (!emailValid) {
                  toast.warning('Email belum valid', 'Pastikan format email-nya benar, mis. nama@perusahaan.com.');
                  return;
                }
                if (brief.trim().length < 10) {
                  toast.warning('Brief terlalu pendek', 'Tuliskan minimal 10 karakter agar kami punya konteks awal.');
                  return;
                }
                setSubmitting(true);
                setSubmitError(null);
                // Keep the deploy console visible long enough for the full
                // streaming log to play out (~3.8s) — avoids a flash on fast
                // networks and lets the user feel the process happen.
                const minVisible = new Promise<void>((r) => setTimeout(r, 3800));
                try {
                  const fetchTask = fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email,
                      scope,
                      brief,
                      company_url: honeypot,
                      turnstileToken,
                      hasil_id: hasilId ?? undefined,
                    }),
                  });
                  const [res] = await Promise.all([fetchTask, minVisible]);
                  const json = await res.json().catch(() => ({}));
                  setSubmitting(false);
                  if (res.ok && json?.ok) {
                    setAlert({
                      open: true,
                      tone: 'success',
                      badge: '[ 200 OK · DELIVERED ]',
                      title: 'Brief Anda sudah masuk.',
                      message:
                        'Tim senior akan membaca brief dan membalas dalam 48 jam kerja. Kami akan menghubungi via email yang Anda kirim.',
                      primaryLabel: 'Selesai',
                      onPrimary: () => {
                        setAlert(null);
                        // Reset form to clean state — modal already confirmed delivery
                        setEmail('');
                        setScope('');
                        setBrief('');
                        setHoneypot('');
                        setFocused(null);
                      },
                    });
                  } else {
                    const code = json?.code as string | undefined;
                    const errMsg = json?.error || 'Gagal kirim. Coba lagi sebentar lagi atau email langsung.';
                    setSubmitError(errMsg);
                    if (code === 'rate_limited') {
                      setAlert({
                        open: true,
                        tone: 'warning',
                        badge: '[ 429 · RATE LIMITED ]',
                        title: 'Pengiriman terlalu sering.',
                        message: errMsg,
                        primaryLabel: 'Mengerti',
                        secondaryLabel: 'Email langsung',
                        onSecondary: () => {
                          window.location.href = `mailto:${data?.formLabels?.emailFallback || 'hello@coderoach.studio'}`;
                          setAlert(null);
                        },
                      });
                    } else if (code === 'invalid_email' || code === 'brief_too_short' || code === 'brief_too_long') {
                      setAlert({
                        open: true,
                        tone: 'warning',
                        badge: '[ 400 · VALIDATION ]',
                        title: 'Brief belum siap dikirim.',
                        message: errMsg,
                        primaryLabel: 'Perbaiki',
                      });
                    } else {
                      setAlert({
                        open: true,
                        tone: 'error',
                        badge: '[ 500 · SERVER ERROR ]',
                        title: 'Pengiriman gagal.',
                        message: errMsg,
                        primaryLabel: 'Coba lagi',
                        secondaryLabel: 'Email langsung',
                        onSecondary: () => {
                          window.location.href = `mailto:${data?.formLabels?.emailFallback || 'hello@coderoach.studio'}`;
                          setAlert(null);
                        },
                      });
                    }
                  }
                } catch {
                  await minVisible;
                  setSubmitting(false);
                  setSubmitError('Gagal kirim. Cek koneksi dan coba lagi.');
                  setAlert({
                    open: true,
                    tone: 'error',
                    badge: '[ NETWORK ERROR ]',
                    title: 'Tidak bisa terhubung ke server.',
                    message:
                      'Cek koneksi internet Anda lalu coba kirim lagi. Kalau masih bermasalah, kirim brief langsung via email.',
                    primaryLabel: 'Coba lagi',
                    secondaryLabel: 'Email langsung',
                    onSecondary: () => {
                      window.location.href = `mailto:${data?.formLabels?.emailFallback || 'hello@coderoach.studio'}`;
                      setAlert(null);
                    },
                  });
                }
              }}
            >
              <TurnstileField onToken={setTurnstileToken} handleRef={turnstile} theme="dark" />
              {/* Honeypot — hidden from real users; bots that fill it get silently rejected */}
              <input
                type="text"
                name="company_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
              {/* Vertical accent rail */}
              <span
                aria-hidden
                className="hidden lg:block absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-electric/30 to-transparent"
              />
              {/* Brief — the main shipping ask */}
              <div className="flex flex-col gap-2">
                <label htmlFor="brief" className="text-[15px] leading-[1.6] text-mist-400 font-medium">
                  Hai <span className="text-paper">👋</span>, aku mau bangun
                </label>
                <textarea
                  id="brief"
                  rows={3}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  onFocus={() => setFocused('brief')}
                  onBlur={() => setFocused(null)}
                  placeholder="dashboard analitik untuk tim performance marketing kami…"
                  className="block w-full text-[22px] leading-[1.4] bg-transparent border-0 border-b border-shadow-700 focus:border-electric outline-none resize-none transition-colors text-paper placeholder:text-mist-600 py-2 px-0 caret-electric font-medium tracking-[-0.01em]"
                />
              </div>

              {/* Scope — inline chips */}
              {data?.scopes && data.scopes.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-[15px] leading-[1.6] text-mist-400 font-medium">
                    Kemungkinan ini
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.scopes.map((s) => (
                      <button
                        key={s.scope}
                        type="button"
                        onClick={() => {
                          setScope(s.scope);
                          setFocused('scope');
                        }}
                        className={`h-[38px] px-4 rounded-full border font-mono text-xs font-medium tracking-wider uppercase cursor-pointer active:scale-[0.97] transition-[color,border-color,background,transform]
                          ${
                            scope === s.scope
                              ? 'text-electric border-electric bg-electric/[0.10]'
                              : 'text-mist-500 border-shadow-700 bg-transparent hover:text-paper hover:border-mist-600'
                          }`}
                      >
                        {s.scope}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Email — inline with prompt text */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <label htmlFor="email" className="text-[15px] leading-[1.6] text-mist-400 font-medium shrink-0">
                  Hubungi aku di
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="anda@perusahaan.id"
                  className="flex-1 min-w-[200px] text-[22px] leading-[1.3] bg-transparent border-0 border-b border-shadow-700 focus:border-electric outline-none transition-colors text-paper placeholder:text-mist-600 py-2 px-0 caret-electric font-medium tracking-[-0.01em]"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4 flex-wrap pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-disabled={!emailValid || brief.trim().length < 10}
                  className={`h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center hover:bg-[#2562E0] active:scale-[0.98] transition-[background,transform] disabled:cursor-not-allowed disabled:hover:bg-electric ${
                    !emailValid || brief.trim().length < 10 ? 'opacity-60' : ''
                  } ${submitting ? 'opacity-40' : ''}`}
                >
                  {submitting ? 'Deploying…' : <CtaLabel label={data?.formLabels?.submit ?? 'Kirim brief'} />}
                </button>
                {submitError && (
                  <span className="text-[12px] text-[#E5484D] font-medium">
                    {submitError}
                  </span>
                )}
                <span className="font-mono text-xs tracking-wide text-mist-600">
                  // atau email langsung ke{' '}
                  <a
                    href={`mailto:${data?.formLabels?.emailFallback}`}
                    className="text-mist-400 border-b border-current pb-px hover:text-electric"
                  >
                    {data?.formLabels?.emailFallback}
                  </a>
                </span>
              </div>
            </form>

            {/* Right — live brief preview (operator console) */}
            <BriefPreview
              email={email}
              scope={scope}
              brief={brief}
              focused={focused}
              completion={completion}
              now={now}
            />
          </div>
      </div>
    </section>
  );
}

function BriefPreview({
  email,
  scope,
  brief,
  focused,
  completion,
  now,
}: {
  email: string;
  scope: string;
  brief: string;
  focused: 'email' | 'scope' | 'brief' | null;
  completion: number;
  now: Date | null;
}) {
  const hasAny = email.length > 0 || scope.length > 0 || brief.length > 0;
  return (
    <div className="lg:sticky lg:top-24 relative">
      {/* Postal stamp at top-right corner — small detail giving the letter character */}
      <div
        aria-hidden
        className="absolute -top-3 right-6 z-[2] h-12 w-12 rounded-sm bg-electric text-paper flex items-center justify-center font-mono text-[10px] font-bold tracking-wider uppercase rotate-[6deg] shadow-[0_4px_12px_-4px_rgba(44,112,254,0.6)]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(244,247,245,0.06) 0 2px, transparent 2px 4px)',
        }}
      >
        DRAFT
      </div>

      {/* The letter — paper-light against the dark section */}
      <div className="relative bg-paper text-shadow-900 rounded-[3px] px-9 py-9 shadow-[0_30px_60px_-25px_rgba(8,9,10,0.7),0_8px_24px_-8px_rgba(8,9,10,0.5)] overflow-hidden">
        {/* Subtle paper grain — top edge soft shading */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-12 pointer-events-none bg-gradient-to-b from-shadow-900/[0.03] to-transparent"
        />

        {/* Letterhead */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" aria-hidden />
            <span className="text-shadow-700 text-[10px] tracking-[0.18em] uppercase font-semibold">
              Draft buat coderoach studio
            </span>
          </div>
          <span className="text-shadow-700/60 text-[10px] tracking-wider tabular">
            {now ? <Meta parts={formatStamp(now)} /> : '—'}
          </span>
        </div>

        {/* Header — letterhead key/value */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px] mb-6">
          <LetterRow label="To" value="coderoach.studio" muted={false} />
          <LetterRow
            label="From"
            value={email || 'menunggu…'}
            muted={!email}
            active={focused === 'email'}
          />
          <LetterRow
            label="Re"
            value={scope || 'belum dipilih'}
            muted={!scope}
            active={focused === 'scope'}
            accent={!!scope}
          />
        </dl>

        <div className="border-t border-shadow-200 mb-6" />

        {/* Letter body */}
        <div className="min-h-[180px] mb-7">
          {brief ? (
            <p className="text-shadow-900 text-[15.5px] leading-[1.65] whitespace-pre-wrap m-0 break-words">
              {brief}
              {focused === 'brief' && (
                <span
                  aria-hidden
                  className="inline-block w-[2px] h-[1.1em] bg-electric align-[-2px] ml-0.5 animate-pulse"
                />
              )}
            </p>
          ) : (
            <p className="text-mist-500 italic text-[15px] leading-[1.65] m-0">
              Brief Anda akan muncul di sini, persis seperti yang akan kami baca.
            </p>
          )}
        </div>

        {/* Sign-off + status */}
        <div className="flex items-end justify-between gap-4 flex-wrap pt-5 border-t border-shadow-200">
          <div>
            <p className="text-shadow-700 text-[12px] m-0 mb-1 tracking-[0.04em]">
              Dikirim dari <span className="text-shadow-900 font-medium">{email || '—'}</span>
            </p>
            <p className="text-mist-500 text-[10px] uppercase tracking-[0.18em] m-0">
              {hasAny ? 'balas dalam 48 jam' : 'menunggu input'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="relative flex-1 h-[3px] rounded-full bg-shadow-200 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-electric transition-[width] duration-300 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-shadow-700 text-[10px] tabular tracking-wider w-9 text-right">
              {completion}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LetterRow({
  label,
  value,
  muted,
  active,
  accent,
}: {
  label: string;
  value: string;
  muted: boolean;
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <>
      <dt
        className={`text-[10px] uppercase tracking-[0.18em] font-semibold pt-1 transition-colors ${
          active ? 'text-electric' : 'text-shadow-700'
        }`}
      >
        {label}
      </dt>
      <dd
        className={`m-0 leading-[1.4] truncate ${
          muted
            ? 'text-mist-500 italic'
            : accent
            ? 'text-electric font-medium'
            : 'text-shadow-900 font-medium'
        }`}
      >
        {value}
      </dd>
    </>
  );
}

