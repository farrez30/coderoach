/**
 * Drawings for the narrative sections: the three scenes a visitor should recognise, the figure
 * nobody can produce from them, and the cost chart.
 *
 * These are illustrations, not data. Nothing here is read from the CMS, and every amount is masked
 * or unlabelled because the site publishes no prices.
 */
import { Icon, type IconName } from '@/lib/icons';

const SHEET_ROWS = [
  { sku: 'AYM-01', qty: '142', broken: false },
  { sku: 'AYM-02', qty: '#REF!', broken: true },
  { sku: 'BMB-07', qty: '38?', broken: true },
  { sku: 'KMS-11', qty: '—', broken: true },
];

function SheetScene() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-paper-200 bg-white font-mono text-[10px] text-ink">
      <div className="flex items-center gap-1.5 border-b border-paper-200 bg-paper-50 px-3 py-2">
        <Icon name="fileSheet" size={13} className="shrink-0 text-[#1E8A56]" />
        stok_final_v3_REVISI.xlsx
      </div>
      {SHEET_ROWS.map((row) => (
        <div key={row.sku} className="flex border-b border-paper-200 last:border-b-0">
          <span className="flex-1 border-r border-paper-200 px-3 py-[7px]">{row.sku}</span>
          <span className={`w-[90px] px-3 py-[7px] ${row.broken ? 'bg-warning/15 text-[#B36B00]' : ''}`}>
            {row.qty}
          </span>
        </div>
      ))}
    </div>
  );
}

const APPS: { icon: IconName; name: string; bill: string }[] = [
  { icon: 'calculator', name: 'Akuntansi', bill: 'Rp ···· /bln' },
  { icon: 'cart', name: 'Kasir', bill: 'Rp ···· /bln' },
  { icon: 'users', name: 'HR', bill: 'Rp ···· × 32 org' },
];

function AppsScene() {
  return (
    <div className="flex flex-col gap-1.5">
      {APPS.map((app) => (
        <div
          key={app.name}
          className="flex items-center gap-2.5 rounded-[10px] border border-paper-200 bg-white px-3 py-[7px]"
        >
          <span className="grid size-[26px] shrink-0 place-items-center rounded-md bg-paper text-ink">
            <Icon name={app.icon} size={14} />
          </span>
          <span className="flex-1 text-[13px] font-medium text-ink">{app.name}</span>
          <span className="font-mono text-[10px] text-mist-600">{app.bill}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-1 py-0.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-mist-600">Tagihan / bulan</span>
        <span className="text-[13px] font-bold text-[#D9480F]">naik terus ↑</span>
      </div>
    </div>
  );
}

const CHAT = [
  { text: 'Stok ayam cabang Bekasi sisa berapa?', mine: false },
  { text: 'Nanti saya cek dulu 🙏', mine: true },
  { text: 'Foto nota kemarin yang mana ya?', mine: false },
  { text: 'Ketimpa pesan lain 😅', mine: false },
];

function ChatScene() {
  return (
    <div className="flex flex-col gap-2">
      {CHAT.map((message) => (
        <div key={message.text} className={`flex ${message.mine ? 'justify-end' : ''}`}>
          <span
            className={`rounded-[10px] px-[11px] py-[7px] text-[12px] text-ink ${message.mine ? 'bg-[#D9FDD3]' : 'bg-white'}`}
          >
            {message.text}
          </span>
        </div>
      ))}
    </div>
  );
}

/** One scene per symptom, in the order the symptoms are written. */
export const SCENES: {
  label: string;
  /** How the missing-figure tile names this scene as a data source. */
  source: string;
  icon: IconName;
  surface: string;
  Scene: () => React.ReactElement;
}[] = [
  { label: 'Gudang', source: 'Sheet', icon: 'fileSheet', surface: 'bg-paper', Scene: SheetScene },
  { label: 'Keuangan', source: 'Akuntansi', icon: 'calculator', surface: 'bg-paper', Scene: AppsScene },
  { label: 'Lapangan', source: 'Chat', icon: 'message', surface: 'bg-[#EFEAE2]', Scene: ChatScene },
];

/** The brand's blue glow, placed by the caller inside a dark, clipped panel. */
export function Glow({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -z-10 rounded-full blur-[40px] bg-[radial-gradient(circle,rgba(44,112,254,0.35)_0%,transparent_60%)] ${className}`}
    />
  );
}

/** The number the owner asks for and none of the scenes can answer. */
export function MissingFigure({ count }: { count: number }) {
  const sources = SCENES.slice(0, count);
  return (
    <div
      aria-hidden
      className="flex w-full flex-col gap-[18px] rounded-2xl border border-white/10 bg-shadow-900/90 p-6 backdrop-blur-[12px] lg:w-[392px] lg:shrink-0"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-mist-500">
          Laba bersih · semua cabang
        </span>
        <Icon name="syncOff" size={16} className="shrink-0 text-mist-500" />
      </div>
      <div className="flex items-end gap-2.5">
        <span className="text-[22px] font-semibold text-mist-500">Rp</span>
        <span className="text-[52px] font-bold leading-none tracking-[-0.02em] text-paper">? ? ?</span>
      </div>
      <div className="flex items-center gap-2 self-start rounded-lg bg-warning/12 px-3 py-2 text-[13px] font-medium text-warning">
        <span className="size-2 shrink-0 rounded-full bg-warning" />
        {sources.length} sumber data belum nyambung
      </div>
      <div className="flex gap-2 border-t border-white/8 pt-4">
        {sources.map((scene) => (
          <span
            key={scene.source}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 font-mono text-[10px] text-mist-500"
          >
            <Icon name={scene.icon} size={13} className="shrink-0" />
            {scene.source}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Bar heights in px, inside a 240px plot. The shape is the argument; the amounts are not given. */
const COST = [
  { label: 'Bln 1', rented: 12, owned: 126 },
  { label: 'Thn 1', rented: 44, owned: 139 },
  { label: 'Thn 2', rented: 82, owned: 151 },
  { label: 'Thn 3', rented: 126, owned: 162 },
  { label: 'Thn 4', rented: 174, owned: 172 },
  { label: 'Thn 5', rented: 228, owned: 181 },
];

/** Cumulative cost of renting against owning. Owning turns solid from the point renting passes it. */
export function CostChart({ rented, owned, note }: { rented: string; owned: string; note?: string }) {
  const turn = COST.findIndex((point) => point.rented >= point.owned);
  return (
    <div className="flex flex-1 flex-col justify-end gap-3">
      <div
        role="img"
        aria-label={`Ilustrasi biaya kumulatif. ${rented} naik terus dan melewati ${owned} di ${COST[turn].label}.`}
        className="flex h-[240px] items-end border-b border-paper-200"
      >
        {COST.map((point, i) => (
          <div key={point.label} className="flex flex-1 items-end justify-center gap-1.5">
            <span className="w-full max-w-7 rounded-t-md bg-mist-400" style={{ height: point.rented }} />
            <span
              className={`w-full max-w-7 rounded-t-md ${i >= turn ? 'bg-electric' : 'bg-electric/60'}`}
              style={{ height: point.owned }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex font-mono text-[11px] text-mist-600">
        {COST.map((point, i) => (
          <span key={point.label} className={`flex-1 text-center ${i === turn ? 'font-semibold text-ink' : ''}`}>
            {point.label}
          </span>
        ))}
      </div>
      {note && (
        <p className="m-0 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-full bg-electric/8 px-3 py-1.5 text-[13px] font-medium text-electric">
            <Icon name="trendDown" size={14} className="shrink-0" />
            {note}
          </span>
        </p>
      )}
    </div>
  );
}
