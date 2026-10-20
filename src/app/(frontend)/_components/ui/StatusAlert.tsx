'use client';

import { useEffect } from 'react';
import { formatChipLabel } from './chipLabel';

type Tone = 'success' | 'error' | 'warning' | 'info';

const TONE_STYLES: Record<
  Tone,
  { iconBg: string; iconColor: string; ring: string; chip: string; chipText: string }
> = {
  success: {
    iconBg: 'bg-[#5DD79A]/12',
    iconColor: 'text-[#3FAE7A]',
    ring: 'ring-[#5DD79A]/20',
    chip: 'bg-[#5DD79A]/[0.16] border-[#5DD79A]/30',
    chipText: 'text-[#3FAE7A]',
  },
  error: {
    iconBg: 'bg-[#E5484D]/12',
    iconColor: 'text-[#C13439]',
    ring: 'ring-[#E5484D]/20',
    chip: 'bg-[#E5484D]/[0.16] border-[#E5484D]/30',
    chipText: 'text-[#C13439]',
  },
  warning: {
    iconBg: 'bg-[#F5A524]/12',
    iconColor: 'text-[#A47A14]',
    ring: 'ring-[#F5A524]/20',
    chip: 'bg-[#F5A524]/[0.16] border-[#F5A524]/30',
    chipText: 'text-[#A47A14]',
  },
  info: {
    iconBg: 'bg-electric/12',
    iconColor: 'text-electric',
    ring: 'ring-electric/20',
    chip: 'bg-electric/[0.10] border-electric/30',
    chipText: 'text-electric',
  },
};

export function StatusAlert({
  open,
  tone = 'info',
  badge,
  title,
  message,
  primaryLabel = 'Tutup',
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
  details,
}: {
  open: boolean;
  tone?: Tone;
  badge?: string;
  title: string;
  message?: string;
  details?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  const t = TONE_STYLES[tone];
  const handlePrimary = onPrimary || onClose;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="status-alert-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-6 animate-[fadeIn_180ms_ease-out]"
    >
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55 backdrop-blur-md cursor-default"
      />
      <div className="relative w-full max-w-[440px] bg-paper rounded-xl border border-paper-200 shadow-[0_24px_60px_-20px_rgba(8,9,10,0.45)] overflow-hidden animate-[scaleIn_240ms_var(--ease-out-quint)]">
        {badge && (
          <div className="px-6 pt-6">
            <span
              className={`h-6 px-2.5 rounded-full inline-flex items-center whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.2em] tabular border ${t.chip} ${t.chipText}`}
            >
              {formatChipLabel(badge)}
            </span>
          </div>
        )}
        <div className="px-6 pt-5 pb-5 flex gap-4 items-start">
          <div
            className={`w-11 h-11 rounded-full grid place-items-center ${t.iconBg} ${t.iconColor} flex-shrink-0 ring-4 ${t.ring}`}
          >
            <ToneIcon tone={tone} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              id="status-alert-title"
              className="text-[18px] font-bold tracking-[-0.01em] m-0 mb-1.5 text-ink leading-tight"
            >
              {title}
            </h3>
            {message && (
              <p className="text-[14px] leading-[1.55] text-mist-600 m-0">{message}</p>
            )}
            {details && (
              <pre className="mt-3 px-3 py-2 rounded-md bg-paper-100 border border-paper-200 font-mono text-[11px] text-mist-700 whitespace-pre-wrap break-words m-0 tabular">
                {details}
              </pre>
            )}
          </div>
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-2 flex-wrap">
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="h-10 px-4 rounded-md text-[13px] font-semibold text-mist-600 hover:text-ink transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handlePrimary}
            className="h-10 px-4 rounded-md bg-ink text-paper text-[13px] font-semibold hover:bg-shadow-800 transition-colors"
            autoFocus
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToneIcon({ tone }: { tone: Tone }) {
  switch (tone) {
    case 'success':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case 'error':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6" />
          <path d="M9 9l6 6" />
        </svg>
      );
    case 'warning':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}
