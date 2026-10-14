import type { Grant } from './consent';
import type { Grants } from './gate';

/**
 * Reads the permissions behind the IZN-… references from Coderoach OS (ADR 0010). Only the sync
 * calls this; pages never do. It fails closed: an unreachable endpoint, a wrong token, or an
 * unexpected answer stops the sync before it writes anything.
 */
export async function loadGrants(
  refs: string[],
  { baseUrl, token, fetchImpl = fetch }: { baseUrl?: string; token?: string; fetchImpl?: typeof fetch },
): Promise<Grants> {
  if (refs.length === 0) return new Map();
  if (!baseUrl || !token) {
    throw new Error(`The portfolio uses ${refs.join(', ')}, so CODEROACH_OS_URL and CODEROACH_OS_TOKEN must be set.`);
  }
  const res = await fetchImpl(new URL('/api/portofolio/izin', baseUrl), {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Coderoach OS answered ${res.status} for /api/portofolio/izin; nothing was synced.`);
  const body = (await res.json()) as { izin?: Grant[] };
  if (!Array.isArray(body.izin)) throw new Error('Unexpected answer from /api/portofolio/izin; nothing was synced.');
  return new Map(body.izin.map((g) => [g.ref, g]));
}

/**
 * For a local database only: every reference counts as granted for everything it is used for, so
 * a seeded copy shows the whole portfolio. The caller checks SEED_TARGET=local first.
 */
export function assumedGrants(refs: string[], metricKeys: string[]): Grants {
  return new Map(
    refs.map((ref) => [
      ref,
      {
        ref,
        status: 'diberikan',
        cakupan: ['nama', 'logo', 'angka', 'tangkapan', 'testimoni', 'video', 'link'],
        kunciMetrik: metricKeys,
        slugSitus: null,
        kedaluwarsa: null,
      } satisfies Grant,
    ]),
  );
}
