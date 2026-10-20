'use client';
import { useEffect, useState } from 'react';
import { CtaLabel } from './ui/CtaLabel';

type NavData = {
  siteName?: string | null;
  logo?: { url?: string | null; alt?: string | null } | null;
  navCta?: { label?: string | null; href?: string | null } | null;
};

const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/work' },
  { label: 'Process', href: '/#process' },
  { label: 'Studio', href: '/studio' },
  { label: 'Notes', href: '/notes' },
  { label: 'FAQ', href: '/#faq' },
];

export function Nav({ data }: { data: NavData | null }) {
  const [open, setOpen] = useState(false);
  const siteName = data?.siteName || 'Studio';
  const logoUrl = data?.logo?.url || '/assets/coderoach_logo.svg';
  const parts = siteName.trim().split(/\s+/);
  const line1 = parts[0] ?? siteName;
  const line2 = parts.slice(1).join(' ');

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="sticky top-0 z-40 bg-paper-100/85 backdrop-blur-md border-b border-paper-200">
      <div className="max-w-[1180px] mx-auto px-8 h-[72px] flex items-center justify-between gap-8">
        <a
          href="/"
          aria-label={`${siteName}, home`}
          className="flex items-center gap-[10px]"
          onClick={close}
        >
          <img src={logoUrl} alt="" className="h-8 w-auto" />
          <span className="flex flex-col leading-none tracking-[-0.02em] gap-[2px] text-ink">
            <span className="font-sans text-[14px] font-semibold lowercase">{line1}</span>
            {line2 && <span className="font-sans text-[14px] font-normal lowercase">{line2}</span>}
          </span>
        </a>

        <nav className="hidden md:flex gap-7 items-center">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium hover:text-electric transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {data?.navCta?.href && (
            <a
              href={data.navCta.href}
              className="hidden sm:inline-flex h-9 px-3.5 rounded-md bg-electric text-paper text-[13px] font-semibold items-center justify-center hover:bg-[#2562E0] transition-colors"
            >
              <CtaLabel label={data.navCta.label} />
            </a>
          )}
          <button
            type="button"
            className="md:hidden relative w-11 h-11 flex flex-col items-center justify-center -mr-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
          >
            <span
              className={`absolute w-5 h-0.5 bg-ink transition-transform duration-200 ease-out ${
                open ? 'rotate-45' : '-translate-y-[6px]'
              }`}
            />
            <span
              className={`absolute w-5 h-0.5 bg-ink transition-opacity duration-200 ease-out ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute w-5 h-0.5 bg-ink transition-transform duration-200 ease-out ${
                open ? '-rotate-45' : 'translate-y-[6px]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Backdrop scrim — closes drawer when tapped */}
      <button
        type="button"
        aria-label="Tutup menu"
        tabIndex={open ? 0 : -1}
        onClick={close}
        className={`md:hidden fixed inset-x-0 top-[72px] bottom-0 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        aria-hidden={!open}
        className={`md:hidden absolute inset-x-0 top-full bg-paper-100 border-b border-paper-200 shadow-[0_12px_32px_-12px_rgba(8,9,10,0.18)] origin-top transition-all duration-200 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <nav className="px-8 py-2 flex flex-col">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="text-[17px] font-medium text-ink py-4 border-b border-paper-200 last:border-b-0 hover:text-electric transition-colors flex items-center justify-between"
            >
              <span>{l.label}</span>
              <span aria-hidden className="text-mist-500 text-base">→</span>
            </a>
          ))}
          {data?.navCta?.href && (
            <a
              href={data.navCta.href}
              onClick={close}
              className="my-4 h-12 px-4 rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center justify-center hover:bg-[#2562E0] transition-colors"
            >
              <CtaLabel label={data.navCta.label} />
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
