'use client';
import { useEffect, useState } from 'react';
import { CtaLabel } from './ui/CtaLabel';

type TopBarData = {
  enabled?: boolean | null;
  tag?: string | null;
  message?: string | null;
  link?: { label?: string | null; href?: string | null } | null;
};

const STORAGE_KEY = 'coderoach.topbar.dismissed';

export function TopBar({ data }: { data: TopBarData | null }) {
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mobileDismissed, setMobileDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setMobileDismissed(true);
      return;
    }
    const t = setTimeout(() => setMobileVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  const dismissMobile = () => {
    setMobileVisible(false);
    setMobileDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  };

  if (!data?.enabled || !data.message) return null;

  return (
    <>
      {/* Desktop & tablet: inline horizontal banner */}
      <div className="hidden md:flex flex-wrap justify-center gap-x-6 gap-y-1 bg-electric text-paper text-center font-mono text-xs font-medium tracking-wide py-3 px-6 relative z-[5] tabular">
        {data.tag && <span className="opacity-90">{data.tag}</span>}
        <span>{data.message}</span>
        {data.link?.href && (
          <a href={data.link.href} className="font-semibold underline underline-offset-[3px]">
            <CtaLabel label={data.link.label} />
          </a>
        )}
      </div>

      {/* Mobile: floating popup card, bottom-right, dismissible */}
      {!mobileDismissed && (
        <div
          role="status"
          aria-live="polite"
          className={`md:hidden fixed bottom-4 left-4 right-4 z-30 transition-all duration-300 ease-out ${
            mobileVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <div className="bg-electric text-paper rounded-xl shadow-[0_18px_36px_-12px_rgba(8,9,10,0.4)] px-4 py-3.5 flex items-start gap-3 max-w-[420px] mx-auto">
            <div className="flex-1 min-w-0">
              {data.tag && (
                <div className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase opacity-90 mb-1.5 tabular">
                  {data.tag}
                </div>
              )}
              <p className="text-[13px] leading-[1.45] m-0 font-medium">{data.message}</p>
              {data.link?.href && (
                <a
                  href={data.link.href}
                  onClick={dismissMobile}
                  className="inline-flex items-center gap-1 mt-2 text-[13px] font-semibold underline underline-offset-[3px] hover:opacity-90 transition-opacity"
                >
                  <CtaLabel label={data.link.label} />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={dismissMobile}
              aria-label="Tutup pengumuman"
              className="flex-shrink-0 w-7 h-7 rounded-full bg-paper/15 hover:bg-paper/25 transition-colors flex items-center justify-center text-paper text-base leading-none -mt-0.5 -mr-1"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
