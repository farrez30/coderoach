/**
 * Narrative sections: the three arguments the landing page makes between the product sections.
 *
 * Each is a rich-text block in the CMS, drawn by its own composition instead of as prose. They share
 * a head (mono label, display heading, lede on the right) and the same cards, but each makes its
 * point with a different drawing: three scenes, a side-by-side with a chart, a checklist.
 *
 * The words come from the CMS. The labels and drawings around them are part of the layout.
 */
import { Icon, type IconName } from '@/lib/icons';
import { productPath } from '@/lib/opsscore/config';
import { StudioWaveBg } from '../ui/StudioWaveBg';
import { Meta } from '../ui/Meta';
import { CostChart, Glow, MissingFigure, SCENES } from './illustrations';
import { parseNarrative, splitItem, type NarrativeGroup } from './parse';

/** Position in a staggered group, read by the narrative-* animations in globals.css. */
const nth = (i: number) => ({ '--n-i': i }) as React.CSSProperties;

const SECTION = 'relative py-[clamp(72px,9vw,120px)]';
const CONTAINER = 'max-w-[1180px] mx-auto px-8 flex flex-col gap-[clamp(36px,4.5vw,56px)]';
const CARD = 'rounded-[20px] p-7 sm:p-9';
const CARD_SHADOW = 'shadow-[0_0_1px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)]';
const CARD_TITLE = 'text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.026em] leading-none m-0';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.09em]';
const ICON_BOX = 'grid size-11 shrink-0 place-items-center rounded-[10px]';

const READINESS = { label: 'Cek kesiapan (5 menit)', href: productPath() };

function Head({ label, title, lede }: { label: string; title: string; lede: string[] }) {
  return (
    <header className="reveal-stagger flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <div className="flex flex-col gap-5">
        <span className="font-mono text-xs font-medium tracking-[0.05em] text-mist-600">[ {label} ]</span>
        <h2 className="max-w-[640px] text-[clamp(36px,4.6vw,56px)] font-bold leading-[1.04] tracking-[-0.025em] text-balance m-0">
          {title}
        </h2>
      </div>
      {lede.length > 0 && (
        <div className="flex max-w-[340px] flex-col gap-3 lg:shrink-0">
          {lede.map((line) => (
            <p key={line} className="text-[17px] leading-[1.55] text-mist-600 text-pretty m-0">
              {line}
            </p>
          ))}
        </div>
      )}
    </header>
  );
}

/** "Kapan bisnis butuh sistem sendiri?" — three scenes, then the one figure none of them can give. */
export function SymptomsSection({ content }: { content: unknown }) {
  const { title, intro, items, outro } = parseNarrative(content);
  const [statement, ...explanation] = outro;

  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <Head label="Gejala" title={title} lede={intro} />

        <ol className="reveal-stagger grid grid-cols-1 gap-5 lg:grid-cols-3 list-none p-0 m-0">
          {items.map((item, i) => {
            const { text, detail } = splitItem(item);
            const scene = SCENES[i];
            return (
              <li key={item} className={`flex flex-col overflow-hidden rounded-2xl bg-white ${CARD_SHADOW}`}>
                {scene && (
                  <div
                    aria-hidden
                    className={`flex h-[196px] flex-col justify-center border-b border-paper-200 p-5 ${scene.surface}`}
                  >
                    <scene.Scene />
                  </div>
                )}
                <div className="flex flex-col gap-2.5 px-6 pt-[22px] pb-[26px]">
                  <Meta parts={[String(i + 1).padStart(2, '0'), scene?.label]} className={`${LABEL} text-mist-600`} />
                  <h3 className="text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-ink m-0">{text}</h3>
                  {detail && <p className="text-[15px] leading-[1.5] text-mist-600 m-0">{detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        {statement && (
          <div
            data-theme="dark"
            className="reveal relative isolate flex flex-col gap-8 overflow-hidden rounded-[20px] bg-ink p-7 sm:p-12 lg:flex-row lg:items-center lg:gap-10"
          >
            <Glow className="-right-[84px] -top-[160px] size-[560px]" />
            <div aria-hidden className="absolute inset-x-0 -top-10 -z-10 h-[1159px] opacity-50">
              <StudioWaveBg />
            </div>

            <div className="flex flex-1 flex-col gap-[18px]">
              <span className="font-mono text-xs font-semibold tracking-[0.1em] text-mist-500">
                [ LALU SUATU HARI ]
              </span>
              <p className="text-[clamp(24px,2.9vw,34px)] font-semibold leading-[1.2] tracking-[-0.024em] text-paper text-pretty m-0">
                {statement}
              </p>
              {explanation.map((line) => (
                <p key={line} className="text-[16px] leading-[1.55] text-mist-500 m-0">
                  {line}
                </p>
              ))}
            </div>

            <MissingFigure count={items.length} />
          </div>
        )}
      </div>
    </section>
  );
}

type Side = {
  icon: IconName;
  mark: IconName;
  tag: string;
  card: string;
  iconBox: string;
  title: string;
  tagTone: string;
  row: string;
  markTone: string;
};

const RENTED: Side = {
  icon: 'repeat',
  mark: 'minus',
  tag: 'Tagihan ∞',
  card: `bg-white ${CARD_SHADOW}`,
  iconBox: 'bg-paper text-mist-600',
  title: 'text-mist-600',
  tagTone: 'border-paper-200 text-mist-600',
  row: 'border-paper-200 text-mist-600',
  markTone: 'bg-paper text-mist-500',
};

const OWNED: Side = {
  icon: 'key',
  mark: 'check',
  tag: 'Jadi aset',
  card: 'bg-ink shadow-[0_24px_48px_rgba(8,9,10,0.2)]',
  iconBox: 'bg-electric text-white',
  title: 'text-paper',
  tagTone: 'border-white/15 text-mist-500',
  row: 'border-white/8 font-medium text-paper',
  markTone: 'bg-electric/20 text-[#6F9BFF]',
};

function LedgerSide({ group, side }: { group: NarrativeGroup; side: Side }) {
  const dark = side === OWNED;
  return (
    <article
      data-theme={dark ? 'dark' : undefined}
      className={`relative isolate flex flex-col gap-7 overflow-hidden ${CARD} ${side.card}`}
    >
      {dark && <Glow className="-right-[192px] -top-[240px] size-[480px]" />}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className={`${ICON_BOX} ${side.iconBox}`}>
            <Icon name={side.icon} size={22} />
          </span>
          <h3 className={`${CARD_TITLE} ${side.title}`}>{group.title}</h3>
        </div>
        <span className={`${LABEL} hidden rounded-full border px-3 py-1.5 whitespace-nowrap sm:block ${side.tagTone}`}>
          {side.tag}
        </span>
      </div>
      <ul className="list-none p-0 m-0">
        {group.items.map((item, i) => (
          <li key={item} className={`flex items-center gap-3.5 border-t py-[15px] text-[17px] ${side.row}`}>
            <span
              aria-hidden
              style={nth(i)}
              className={`narrative-pop grid size-6 shrink-0 place-items-center rounded-full ${side.markTone}`}
            >
              <Icon name={side.mark} size={14} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

/** "Langganan atau bangun sendiri?" — the two sides face each other, then the chart settles it. */
export function LedgerSection({ content }: { content: unknown }) {
  const { title, intro, groups } = parseNarrative(content);
  const [rented, owned, chart] = groups;

  return (
    <section className={`${SECTION} bg-paper-50 border-y border-paper-200`}>
      <div className={CONTAINER}>
        <Head label="Sewa vs Punya" title={title} lede={intro} />

        <div className="reveal-stagger relative grid grid-cols-1 gap-5 lg:grid-cols-2">
          {rented && <LedgerSide group={rented} side={RENTED} />}
          {owned && <LedgerSide group={owned} side={OWNED} />}
          {rented && owned && (
            <span
              aria-hidden
              className="absolute left-1/2 top-[34px] hidden size-12 -translate-x-1/2 place-items-center rounded-full border border-paper-200 bg-paper-50 font-mono text-xs font-bold tracking-[0.04em] text-ink lg:grid"
            >
              VS
            </span>
          )}
        </div>

        {rented && owned && chart && (
          <div className={`reveal flex flex-col gap-10 bg-white lg:flex-row lg:gap-12 ${CARD} ${CARD_SHADOW}`}>
            <div className="flex flex-col justify-between gap-8 lg:w-[320px] lg:shrink-0">
              <div className="flex flex-col gap-3.5">
                <span className={`${LABEL} text-mist-600`}>Biaya kumulatif (ilustrasi)</span>
                <h3 className="text-[26px] font-bold leading-[1.2] tracking-[-0.023em] text-ink text-balance m-0">
                  {chart.title}
                </h3>
                {chart.paragraphs[0] && (
                  <p className="text-[15px] leading-[1.55] text-mist-600 m-0">{chart.paragraphs[0]}</p>
                )}
              </div>
              <div className="flex gap-5 text-[14px] font-medium text-ink">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="size-3 rounded-[3px] bg-mist-400" />
                  {rented.title}
                </span>
                <span className="flex items-center gap-2">
                  <span aria-hidden className="size-3 rounded-[3px] bg-electric" />
                  {owned.title}
                </span>
              </div>
            </div>
            <CostChart rented={rented.title} owned={owned.title} note={chart.paragraphs[1]} />
          </div>
        )}
      </div>
    </section>
  );
}

/** "Cocok untuk siapa?" — a checklist that leads to the readiness check, and an honest "not yet". */
export function FitSection({ content }: { content: unknown }) {
  const { title, intro, groups } = parseNarrative(content);
  const [fits, doesNot] = groups;

  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <Head label="Jujur dulu" title={title} lede={intro} />

        <div className="reveal-stagger flex flex-col gap-5 lg:flex-row">
          {fits && (
            <article className={`flex flex-1 flex-col gap-7 bg-white ${CARD} ${CARD_SHADOW}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className={`${ICON_BOX} bg-electric text-white`}>
                    <Icon name="checkCircle" size={22} />
                  </span>
                  <h3 className={`${CARD_TITLE} text-ink`}>{fits.title}</h3>
                </div>
                <span
                  className={`${LABEL} hidden rounded-full bg-electric/8 px-3 py-1.5 font-semibold whitespace-nowrap text-electric sm:block`}
                >
                  Cek kesiapan
                </span>
              </div>

              <ol className="list-none p-0 m-0">
                {fits.items.map((item, i) => (
                  <li key={item} className="flex items-center gap-[18px] border-t border-paper-200 py-[18px]">
                    <span aria-hidden className="font-mono text-xs tracking-[0.05em] text-mist-500 tabular">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-[clamp(17px,1.7vw,19px)] font-medium tracking-[-0.01em] text-ink">
                      {item}
                    </span>
                    <span
                      aria-hidden
                      style={nth(i)}
                      className="narrative-pop grid size-7 shrink-0 place-items-center rounded-lg bg-electric text-white"
                    >
                      <Icon name="check" size={18} />
                    </span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-5 rounded-[14px] bg-paper p-5 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-2.5">
                  <div aria-hidden className="flex gap-1.5">
                    {fits.items.map((item, i) => (
                      <span
                        key={item}
                        style={nth(i)}
                        className={`narrative-fill h-1.5 flex-1 rounded-[3px] ${i < fits.items.length - 1 ? 'bg-electric' : 'bg-electric/25'}`}
                      />
                    ))}
                  </div>
                  {fits.paragraphs.map((line) => (
                    <p key={line} className="text-[15px] font-semibold text-ink m-0">
                      {line}
                    </p>
                  ))}
                </div>
                <a
                  href={READINESS.href}
                  className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-ink pl-5 pr-4 text-sm font-semibold text-paper hover:bg-shadow-900 transition-colors"
                >
                  {READINESS.label}
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </article>
          )}

          {doesNot && (
            <article className={`flex flex-col gap-7 border border-mist-400 lg:w-[440px] lg:shrink-0 ${CARD}`}>
              <div className="flex items-center gap-3.5">
                <span className={`${ICON_BOX} bg-ink/5 text-mist-600`}>
                  <Icon name="pause" size={20} />
                </span>
                <h3 className="text-[clamp(22px,2.4vw,26px)] font-bold leading-none tracking-[-0.023em] text-mist-600 m-0">
                  {doesNot.title}
                </h3>
              </div>

              <ul className="list-none p-0 m-0">
                {doesNot.items.map((item) => {
                  const { text, detail } = splitItem(item);
                  return (
                    <li key={item} className="flex gap-3.5 border-t border-paper-200 py-[18px]">
                      <span
                        aria-hidden
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-ink/5 text-mist-600"
                      >
                        <Icon name="x" size={13} />
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[16px] font-medium leading-[1.4] text-ink">{text}</span>
                        {detail && (
                          <span className="flex items-start gap-1.5 text-[13.5px] leading-[1.4] text-mist-600">
                            <Icon name="cornerRight" size={13} className="mt-[3px] shrink-0 text-electric" />
                            {detail}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {doesNot.paragraphs.length > 0 && (
                <div style={nth(3)} className="narrative-rise mt-auto flex flex-col gap-2">
                  {doesNot.paragraphs.map((line) => (
                    <p key={line} className="font-mono text-[11px] leading-[1.6] tracking-[0.03em] text-mist-600 m-0">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
