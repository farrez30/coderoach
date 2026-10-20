'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GATE_COPY } from '@/lib/opsscore/copy';
import { normalizeEmail, suggestEmail } from '@/lib/opsscore/email';
import { normalizePhone } from '@/lib/opsscore/phone';
import { formatPhoneInput } from '@/lib/opsscore/profile';
import { track } from '@/lib/opsscore/track';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';
import { TurnstileField, type TurnstileHandle } from '../../_components/TurnstileField';
import { JUST_GATED_KEY } from './RevealReport';

type Field = 'phone' | 'email' | 'consent' | 'turnstile';
type Errors = Partial<Record<Field, keyof typeof GATE_COPY.errors>>;

/**
 * The gate, shown before any result. Name, business, industry, revenue, and team size were collected
 * during the quiz, so the last thing asked is WhatsApp and consent.
 */
export function GateForm({
  sessionId,
  phase,
  revenueBand,
  className = '',
}: {
  sessionId: string;
  phase: number;
  revenueBand?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileBroken, setTurnstileBroken] = useState(false);
  const turnstile = useRef<TurnstileHandle | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  const phoneValid = Boolean(normalizePhone(phone));
  const emailValid = !email.trim() || Boolean(normalizeEmail(email));
  const emailFix = suggestEmail(email);
  const ready = phoneValid && consent;
  const busy = submitting || refreshing;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const found: Errors = {};
    if (!phone.trim()) found.phone = 'required';
    else if (!phoneValid) found.phone = 'phone';
    if (email.trim() && !emailValid) found.email = 'email';
    if (!consent) found.consent = 'consent';
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) {
      document.getElementById(`gate-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    // Turnstile answers on its own within a moment; only a click that beats it lands here. A widget
    // that gave up (blocked script, extension) will never send a token, and the server refuses a
    // post without one, so say so here instead of sending.
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      if (turnstileBroken) {
        setErrors({ turnstile: 'turnstileMissing' });
        return;
      }
      setFormError(GATE_COPY.errors.turnstilePending);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/opsscore/sessions/${sessionId}/gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, consent, turnstileToken, company_url: honeypot }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        track('assessment_gate_submit', { fase: phase, revenue_band: revenueBand });
        try {
          sessionStorage.setItem(JUST_GATED_KEY, sessionId);
        } catch {}
        startRefresh(() => router.refresh());
        return;
      }
      turnstile.current?.reset();
      if (body.code === 'invalid' && body.errors) setErrors(body.errors);
      else setFormError(res.status === 429 ? GATE_COPY.errors.rateLimited : GATE_COPY.errors.server);
    } catch {
      turnstile.current?.reset();
      setFormError(GATE_COPY.errors.server);
    }
    setSubmitting(false);
  };

  return (
    <form noValidate onSubmit={onSubmit} className={`relative flex flex-col gap-5 max-w-[480px] ${className}`}>
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        aria-hidden
        className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
      />

      <div>
        <label htmlFor="gate-phone" className="block text-[13px] font-semibold text-ink mb-1.5">
          {GATE_COPY.phoneLabel}
        </label>
        <div className="relative">
          <input
            id="gate-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={GATE_COPY.phonePlaceholder}
            value={phone}
            onChange={(e) => {
              setPhone(formatPhoneInput(e.target.value));
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'gate-phone-error' : undefined}
            className={`block w-full h-14 pl-4 pr-12 rounded-md border bg-paper-100 text-[18px] tabular tracking-[0.01em] text-ink placeholder:text-mist-500 outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgba(44,112,254,0.14)] ${
              errors.phone ? 'border-error' : phoneValid ? 'border-success' : 'border-paper-200 focus:border-electric'
            }`}
          />
          {phoneValid && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-hidden>
              <span className="ops-pop w-6 h-6 rounded-full bg-success text-paper grid place-items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            </span>
          )}
        </div>
        {errors.phone && <FieldError id="gate-phone-error">{GATE_COPY.errors[errors.phone]}</FieldError>}
      </div>

      <div>
        <label htmlFor="gate-email" className="block text-[13px] font-semibold text-ink mb-1.5">
          {GATE_COPY.emailLabel}
        </label>
        <input
          id="gate-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={GATE_COPY.emailPlaceholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'gate-email-error' : 'gate-email-hint'}
          className={`block w-full h-12 px-4 rounded-md border bg-paper-100 text-[15px] text-ink placeholder:text-mist-500 outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgba(44,112,254,0.14)] ${
            errors.email ? 'border-error' : 'border-paper-200 focus:border-electric'
          }`}
        />
        {errors.email ? (
          <FieldError id="gate-email-error">{GATE_COPY.errors[errors.email]}</FieldError>
        ) : emailFix ? (
          <p className="mt-1.5 mb-0 text-[12px] leading-[1.45] text-mist-600">
            <button
              type="button"
              onClick={() => setEmail(emailFix)}
              className="font-medium text-electric underline underline-offset-2"
            >
              {GATE_COPY.emailSuggestion(emailFix)}
            </button>
          </p>
        ) : (
          <p id="gate-email-hint" className="mt-1.5 mb-0 text-[12px] leading-[1.45] text-mist-600">
            {GATE_COPY.emailHint}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="gate-consent" className="flex items-start gap-3 cursor-pointer">
          <input
            id="gate-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'gate-consent-error' : undefined}
            className="mt-0.5 w-5 h-5 shrink-0 accent-electric"
          />
          <span className="text-[14px] leading-[1.5] text-ink">{GATE_COPY.consent}</span>
        </label>
        {errors.consent && <FieldError id="gate-consent-error">{GATE_COPY.errors[errors.consent]}</FieldError>}
      </div>

      <TurnstileField
        onToken={setTurnstileToken}
        onUnavailable={() => setTurnstileBroken(true)}
        handleRef={turnstile}
      />
      {errors.turnstile && <FieldError id="gate-turnstile-error">{GATE_COPY.errors[errors.turnstile]}</FieldError>}

      <div className="flex flex-col gap-3 pt-1">
        <button
          type="submit"
          disabled={busy}
          aria-disabled={!ready}
          className={`self-start h-[52px] px-[22px] rounded-md text-[15px] font-semibold inline-flex items-center gap-2 transition-[background-color,color,box-shadow,transform] duration-200 disabled:cursor-wait ${
            ready
              ? 'bg-electric text-paper shadow-[0_10px_28px_-12px_rgba(44,112,254,0.75)] hover:bg-[#2562E0] active:scale-[0.98]'
              : 'bg-paper-200 text-mist-600'
          }`}
        >
          {busy ? GATE_COPY.submitting : GATE_COPY.submit}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
        {formError && (
          <p role="alert" className="text-[13px] font-medium text-error m-0">
            {formError}
          </p>
        )}
      </div>
    </form>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[12px] font-medium text-error m-0">
      {children}
    </p>
  );
}
