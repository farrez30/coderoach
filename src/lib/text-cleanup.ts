/**
 * Rewrites copy that the first seed put in the database and no sync owns: the Site Settings, Studio,
 * Contact, and Hero globals, the pages (About), and author roles. Run by scripts/text-cleanup.ts.
 *
 * Each fragment is a seed sentence and its rewrite (the same edit made to src/lib/seed.ts), so a value
 * someone already changed in /admin no longer matches and is left alone. Labels lose a trailing arrow;
 * the site draws it now. Whatever still holds " — " or an arrow afterwards is listed for a hand edit.
 */
const FRAGMENTS: Array<[string, string]> = [
  ['Sourcing → contract → live tracking dalam satu workspace.', 'Sourcing, contract, sampai live tracking dalam satu workspace.'],
  ['alur Petty Cash → Stock Opname → Waste yang', 'alur Petty Cash, Stock Opname, lalu Waste yang'],
  ['kuartal ini — mulai dari diskusi 30 menit.', 'kuartal ini. Mulai dari diskusi 30 menit.'],
  ['dashboard analitik bisnis Anda — dari company website', 'dashboard analitik bisnis Anda, dari company website'],
  ['sampai dashboard analitik — F&B, marketing agency', 'sampai dashboard analitik untuk F&B, marketing agency'],
  ['tanpa lapisan terjemahan — satu titik akuntabilitas', 'tanpa lapisan terjemahan. Satu titik akuntabilitas'],
  ['dalam operasional harian — bukan deliverable', 'dalam operasional harian, bukan deliverable'],
  ['bukan masalah yang terselesaikan — sehingga proses', 'bukan masalah yang terselesaikan, sehingga proses'],
  ['yang juga melakukan scoping — Izzul (Product & Frontend)', 'yang juga melakukan scoping: Izzul (Product & Frontend)'],
  ['operasi F&B multi-cabang — memangkas 50%', 'operasi F&B multi-cabang, memangkas 50%'],
  ['Empat pintu masuk — Build, Automate, Intelligence, Augment — dengan', 'Empat pintu masuk (Build, Automate, Intelligence, Augment) dengan'],
  ['ingin Anda bangun — setiap brief dibaca', 'ingin Anda bangun. Setiap brief dibaca'],
  ['Terima kasih — brief Anda sudah masuk.', 'Terima kasih, brief Anda sudah masuk.'],
  ['Coderoach Studio — jasa pembuatan website,', 'Coderoach Studio: jasa pembuatan website,'],
  ['dipakai tim Anda harian — dari company website', 'dipakai tim Anda harian, dari company website'],
  ['Bisa — React Native untuk cross-platform,', 'Bisa. React Native untuk cross-platform,'],
  ['otomasi yang reliable — lengkap dengan audit log', 'otomasi yang reliable, lengkap dengan audit log'],
  ['dipakai harian — kami membangun pipeline-nya', 'dipakai harian, kami membangun pipeline-nya'],
  ['benar-benar berdampak — internal search,', 'benar-benar berdampak: internal search,'],
  ['AI yang berdampak nyata — bukan chatbot demo.', 'AI yang berdampak nyata, bukan chatbot demo.'],
  ['Ads data warehouse — Meta, TikTok, Google Ads', 'Ads data warehouse: Meta, TikTok, Google Ads'],
  ['End-to-end KOL OS — sourcing, contracts, live performance.', 'End-to-end KOL OS: sourcing, contracts, live performance.'],
  ['partner support — bukan dependency permanen.', 'partner support, bukan dependency permanen.'],
  ['di awal — bukan setelah proyek berjalan.', 'di awal, bukan setelah proyek berjalan.'],
  ['freelancer tepercaya — kadang kami refer langsung.', 'freelancer tepercaya, kadang kami refer langsung.'],
  ['"pool of hours" — kami tetap scope per cycle', '"pool of hours". Kami tetap scope per cycle'],
  ['Asia Tenggara — kami biasa berkolaborasi', 'Asia Tenggara. Kami biasa berkolaborasi'],
  ['ke tim internal — pilihan ada di tangan Anda.', 'ke tim internal. Pilihan ada di tangan Anda.'],
  ['dan data pipeline — fondasi yang menentukan', 'dan data pipeline, fondasi yang menentukan'],
  ['Bukan menjual jam — kami menjual hasil yang terukur.', 'Bukan menjual jam. Kami menjual hasil yang terukur.'],
  ['telah berjalan — dari company website sampai data pipeline.', 'telah berjalan, dari company website sampai data pipeline.'],
  ['bukan brief klien — melainkan produk sendiri', 'bukan brief klien, melainkan produk sendiri'],
  ['stack berbeda — disiplin shipping tetap konsisten.', 'stack berbeda, disiplin shipping tetap konsisten.'],
  ['About — Coderoach Studio', 'About | Coderoach Studio'],
  ['remote-first dari Jakarta — build, automate,', 'remote-first dari Jakarta: build, automate,'],
];

/** Fields that hold a link or button label, where a trailing arrow is now drawn by the component. */
const LABEL_KEYS = new Set(['label', 'submit']);

export type Change = { path: string; before: string; after: string };

export function cleanString(value: string, key: string): string {
  let out = value;
  for (const [from, to] of FRAGMENTS) out = out.split(from).join(to);
  if (LABEL_KEYS.has(key)) out = out.replace(/\s*[→←]\s*$/, '');
  return out;
}

/** Returns a cleaned copy of `value` and the strings it changed. Ids and other non-strings pass through. */
export function cleanDeep(value: unknown, path = '', key = ''): { value: unknown; changes: Change[] } {
  if (typeof value === 'string') {
    const after = cleanString(value, key);
    return { value: after, changes: after === value ? [] : [{ path, before: value, after }] };
  }
  if (Array.isArray(value)) {
    const parts = value.map((v, i) => cleanDeep(v, `${path}[${i}]`, key));
    return { value: parts.map((p) => p.value), changes: parts.flatMap((p) => p.changes) };
  }
  if (value && typeof value === 'object') {
    const changes: Change[] = [];
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const part = cleanDeep(v, path ? `${path}.${k}` : k, k);
      out[k] = part.value;
      changes.push(...part.changes);
    }
    return { value: out, changes };
  }
  return { value, changes: [] };
}

/** Strings a person still has to look at: an em dash joining a sentence, or an arrow or check mark. */
export function leftovers(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return / — |→|←|✓/.test(value) ? [`${path}: ${value}`] : [];
  if (Array.isArray(value)) return value.flatMap((v, i) => leftovers(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leftovers(v, path ? `${path}.${k}` : k));
  }
  return [];
}

/** The top-level fields a list of changes touches, e.g. "layout[2].lede" -> "layout". */
export const topLevelKeys = (changes: Change[]) => [...new Set(changes.map((c) => c.path.split(/[.[]/)[0]))];
