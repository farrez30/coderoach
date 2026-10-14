/**
 * One list of industries ("bidang") for Projects and Clients.
 *
 * The values are stored: as Payload select values here, and as klien.bidang in Coderoach OS,
 * which the portfolio sync reads. They never change once used; the labels can.
 */
export const INDUSTRIES = [
  { value: 'fb', label: 'F&B dan restoran' },
  { value: 'manufacturing', label: 'Manufaktur pangan dan agribisnis' },
  { value: 'legal', label: 'Jasa profesional dan legal' },
  { value: 'media', label: 'Media dan riset' },
  { value: 'health', label: 'Kesehatan dan kecantikan' },
  { value: 'education', label: 'Pendidikan dan SDM' },
  { value: 'finance', label: 'Keuangan dan koperasi' },
  { value: 'construction', label: 'Konstruksi dan properti' },
  { value: 'travel', label: 'Perjalanan' },
  { value: 'community', label: 'Organisasi dan komunitas' },
  { value: 'technology', label: 'Teknologi' },
  { value: 'other', label: 'Lainnya' },
] as const;

export type Industry = (typeof INDUSTRIES)[number]['value'];

/**
 * Values the Projects column held before this list. No project uses them, but a Postgres enum
 * can only gain values, so they stay valid and are simply never offered.
 */
export const RETIRED_INDUSTRIES = ['logistics', 'agency', 'vc'] as const;

const LABELS: Record<string, string> = Object.fromEntries(INDUSTRIES.map((i) => [i.value, i.label]));

export function industryLabel(value: string | null | undefined): string {
  if (!value) return LABELS.other;
  return LABELS[value] ?? LABELS.other;
}

export const KIND_LABELS = {
  client: 'Klien',
  studio: 'Produk studio',
  lab: 'Lab',
} as const;

export type Kind = keyof typeof KIND_LABELS;
