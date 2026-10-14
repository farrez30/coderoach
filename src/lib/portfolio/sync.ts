import path from 'node:path';
import type { Payload } from 'payload';
import type { Project } from '../../payload-types';
import { gateEntry, type Grants } from './gate';
import { toFeaturedMetric } from './metrics';
import {
  HIDDEN_PROJECT_SLUGS,
  PORTFOLIO,
  toLexical,
  type PortfolioAsset,
  type PortfolioCover,
  type PortfolioEntry,
} from './projects';

type SyncOptions = {
  /** Write changes. Without it, only report what would change. */
  apply: boolean;
  /** Directory holding the files named in PORTFOLIO. */
  assetsDir: string;
  /** Permissions read from Coderoach OS (or assumed, on a local database). */
  grants: Grants;
  log?: (line: string) => void;
};

type ProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
type MediaIds = Map<string, number | undefined>;

/**
 * Writes PORTFOLIO to the database: assets into Media (matched by filename), entries into Projects
 * (matched by slug, then published), and HIDDEN_PROJECT_SLUGS back to draft without touching their copy.
 *
 * Every entry passes the permission gate first (gate.ts). An entry that may not be named goes back
 * to draft; an item that may not be shown is left out, and since the sync owns those fields, leaving
 * it out also takes it down from a page that showed it before.
 */
export async function syncPortfolio(payload: Payload, { apply, assetsDir, grants, log = console.log }: SyncOptions) {
  const { docs: services } = await payload.find({
    collection: 'services',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });
  const serviceIds = new Map(services.map((s) => [s.slug, s.id]));

  for (const original of PORTFOLIO) {
    const { entry, blocked } = gateEntry(original, grants);
    for (const line of blocked) log(`blocked    ${line}`);
    if (!entry) {
      await unpublish(payload, original.slug, { apply, log });
      continue;
    }
    const assets = await ensureAssets(payload, entry, { apply, assetsDir, grants, log });
    const data = toProjectData(entry, serviceIds.get(entry.service), assets);
    const existing = await findProject(payload, entry.slug);
    if (existing && !changedFields(existing, data).length) {
      log(`same       project ${entry.slug}`);
    } else if (existing) {
      log(`update     project ${entry.slug} (${changedFields(existing, data).join(', ')})`);
      if (apply) await payload.update({ collection: 'projects', id: existing.id, data, overrideAccess: true });
    } else {
      log(`create     project ${entry.slug}`);
      if (apply) await payload.create({ collection: 'projects', data, overrideAccess: true });
    }
  }

  for (const slug of HIDDEN_PROJECT_SLUGS) await unpublish(payload, slug, { apply, log });
}

async function unpublish(payload: Payload, slug: string, { apply, log }: { apply: boolean; log: (l: string) => void }) {
  const existing = await findProject(payload, slug);
  if (!existing) {
    log(`skip       project ${slug} (not in this database)`);
  } else if (existing._status === 'draft') {
    log(`keep       project ${slug} (already a draft)`);
  } else {
    log(`unpublish  project ${slug}`);
    if (apply) {
      await payload.update({ collection: 'projects', id: existing.id, data: { _status: 'draft' }, overrideAccess: true });
    }
  }
}

async function findProject(payload: Payload, slug: string) {
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return docs[0];
}

/** Every file an entry names, in the order the sync uploads them. */
export function assetsOf(entry: PortfolioEntry): Array<PortfolioAsset & Partial<PortfolioCover>> {
  const sc = entry.showcase;
  return [
    entry.cover,
    sc?.screen,
    sc?.screenPhone,
    sc?.loop,
    sc?.loopPoster,
    sc?.tour,
    sc?.tourPoster,
    sc?.tourCaptions,
    ...(entry.links ?? []).map((l) => l.snapshot),
    ...(entry.features ?? []).map((f) => f.screen),
  ].filter((a): a is PortfolioAsset & Partial<PortfolioCover> => Boolean(a));
}

/** Every file the entry names, uploaded once and reused by filename. */
async function ensureAssets(payload: Payload, entry: PortfolioEntry, opts: Required<SyncOptions>): Promise<MediaIds> {
  const ids: MediaIds = new Map();
  // A file used twice (a phone screen that is also a feature image) keeps its first alt text,
  // instead of flipping between the two on every sync.
  for (const f of assetsOf(entry)) if (!ids.has(f.file)) ids.set(f.file, await ensureMedia(payload, f, opts));
  return ids;
}

async function ensureMedia(
  payload: Payload,
  asset: PortfolioAsset & Partial<PortfolioCover>,
  { apply, assetsDir, log }: Required<SyncOptions>,
): Promise<number | undefined> {
  const data = { alt: asset.alt, focalX: asset.focalX ?? 50, focalY: asset.focalY ?? 50 };
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: asset.file } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const existing = docs[0];
  if (existing) {
    if (existing.alt !== data.alt || existing.focalX !== data.focalX || existing.focalY !== data.focalY) {
      log(`update     media   ${asset.file}`);
      if (apply) await payload.update({ collection: 'media', id: existing.id, data, overrideAccess: true });
    }
    return existing.id;
  }
  log(`upload     media   ${asset.file}`);
  if (!apply) return undefined;
  const created = await payload.create({
    collection: 'media',
    data,
    filePath: path.join(assetsDir, asset.file),
    overrideAccess: true,
  });
  return created.id;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const WIB_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' });

/**
 * Whether what is stored already says what the sync would write. Only the keys the sync writes are
 * compared, so array row ids and fields the admin owns don't count. Projects keep versions, and an
 * update that changes nothing would still add one to every project on every run.
 */
function same(stored: unknown, wanted: unknown): boolean {
  if (wanted === undefined || wanted === null || wanted === '') return stored === undefined || stored === null || stored === '';
  if (typeof wanted === 'string') {
    if (typeof stored !== 'string') return false;
    // A date field stores "2026-07-29" as midnight in the server's zone (17:00Z the day before in WIB).
    if (DATE_ONLY.test(wanted) && stored !== wanted && !Number.isNaN(Date.parse(stored))) {
      return WIB_DATE.format(new Date(stored)) === wanted;
    }
    return stored === wanted;
  }
  if (Array.isArray(wanted)) {
    return Array.isArray(stored) && stored.length === wanted.length && wanted.every((w, i) => same(stored[i], w));
  }
  if (typeof wanted === 'object') {
    if (typeof stored !== 'object' || stored === null) return false;
    return Object.entries(wanted).every(([k, w]) => same((stored as Record<string, unknown>)[k], w));
  }
  return stored === wanted;
}

/** Top-level fields whose stored value differs from what the sync would write. */
export function changedFields(stored: object, data: object): string[] {
  return Object.entries(data)
    .filter(([k, w]) => !same((stored as Record<string, unknown>)[k], w))
    .map(([k]) => k);
}

export function toProjectData(entry: PortfolioEntry, serviceId: number | undefined, media: MediaIds): ProjectData {
  const { featuredDetails: fd, studio } = entry;
  const id = (a?: PortfolioAsset) => (a ? (media.get(a.file) ?? null) : null);
  const coverId = entry.cover ? media.get(entry.cover.file) : undefined;
  const metrics = entry.metrics ?? [];
  const sc = entry.showcase;
  return {
    slug: entry.slug,
    kind: entry.kind,
    order: entry.order,
    featured: entry.featured ?? false,
    industry: entry.industry,
    ...(serviceId ? { service: serviceId } : {}),
    publishedYear: entry.publishedYear,
    client: entry.client,
    tagline: entry.tagline,
    meta: entry.meta,
    excerpt: entry.excerpt,
    pills: entry.pills.map((pill) => ({ pill })),
    richContent: toLexical(entry.body),
    ...(coverId ? { coverImage: coverId } : {}),
    ...(fd
      ? {
          featuredDetails: {
            badgeLabel: fd.badgeLabel,
            shippedLabel: fd.shippedLabel,
            metaLine: fd.metaLine,
            headline: fd.headline,
            description: fd.description,
            // Recomputed from the gated metrics, so a number that lost its permission leaves the card too.
            metrics: metrics.filter((m) => m.featured).map(toFeaturedMetric),
            codePanel: { tag: fd.codePanel.tag, path: fd.codePanel.path, lines: fd.codePanel.lines.map((line) => ({ line })) },
            stack: fd.stack.map((tech) => ({ tech })),
          },
        }
      : {}),
    ...(studio
      ? {
          studio: {
            vizType: studio.vizType,
            usage: studio.usage,
            externalLink: studio.externalLink ?? { label: null, href: null },
            bullets: studio.bullets.map((bullet) => ({ bullet })),
          },
        }
      : {}),
    // Owned by the sync: written empty when absent, so taking something out of projects.ts (or
    // losing its permission) also takes it off the page.
    summary: {
      problem: entry.summary?.problem ?? null,
      solution: entry.summary?.solution ?? null,
      result: entry.summary?.result ?? null,
    },
    showcase: {
      frame: sc?.frame ?? 'laptop',
      screen: id(sc?.screen),
      screenPhone: id(sc?.screenPhone),
      loop: id(sc?.loop),
      loopPoster: id(sc?.loopPoster),
      tour: id(sc?.tour),
      tourPoster: id(sc?.tourPoster),
      tourCaptions: id(sc?.tourCaptions),
      tourTranscript: sc?.tourTranscript ?? null,
      demoNote: sc?.demoNote ?? null,
    },
    links: (entry.links ?? []).map((l) => ({
      kind: l.kind,
      label: l.label,
      href: l.href,
      check: l.check ?? true,
      snapshot: id(l.snapshot),
      snapshotTakenAt: l.snapshot?.takenAt ?? null,
    })),
    metrics: metrics.map((m) => ({
      key: m.key,
      value: m.value,
      unit: m.unit,
      label: m.label,
      baselineValue: m.baseline?.value ?? null,
      baselineUnit: m.baseline?.unit ?? null,
      status: m.status,
      measuredAt: m.measuredAt,
      method: m.method,
      sourceRef: m.sourceRef ?? null,
      verifyUrl: m.verifyUrl ?? null,
      featured: m.featured ?? false,
    })),
    features: (entry.features ?? []).map((f) => ({ title: f.title, body: f.body, screen: id(f.screen) })),
    timeline: (entry.timeline ?? []).map((t) => ({
      date: t.date,
      title: t.title,
      detail: t.detail ?? null,
      sourceRef: t.sourceRef ?? null,
    })),
    darkChapter: {
      eyebrow: entry.darkChapter?.eyebrow ?? null,
      title: entry.darkChapter?.title ?? null,
      body: entry.darkChapter?.body ?? null,
    },
    testimonial: {
      quote: entry.testimonial?.quote ?? null,
      author: entry.testimonial?.author ?? null,
      role: entry.testimonial?.role ?? null,
      company: entry.testimonial?.company ?? null,
      givenAt: entry.testimonial?.givenAt ?? null,
    },
    _status: entry.hidden ? 'draft' : 'published',
  };
}
