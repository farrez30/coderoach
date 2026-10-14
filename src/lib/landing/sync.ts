import type { Payload } from 'payload';
import { toLexical } from '../lexical';
import { planClientsSync } from './clients';
import {
  BLOCK_COPY,
  CLIENTS,
  FAQS,
  HERO,
  METADATA,
  PROCESS_PHASES,
  SECTIONS,
  SERVICES,
  TENETS,
  TOP_BAR,
} from './copy';

type SyncOptions = {
  /** Write changes. Without it, only report what would change. */
  apply: boolean;
  log?: (line: string) => void;
};

/**
 * Writes the landing copy to the database: the top bar, the home page's blocks (including the
 * rich-text sections that don't exist yet), and the collections those blocks read.
 *
 * Only the fields named in copy.ts are touched. Anything else on those documents is left alone.
 */
export async function syncLanding(payload: Payload, { apply, log = console.log }: SyncOptions) {
  await syncTopBar(payload, { apply, log });
  await syncMetadata(payload, { apply, log });
  await syncServices(payload, { apply, log });
  await replaceAll(payload, 'process-phases', PROCESS_PHASES, { apply, log });
  await replaceAll(payload, 'tenets', TENETS, { apply, log });
  await replaceAll(payload, 'faqs', FAQS, { apply, log });
  await syncClients(payload, { apply, log });
  await syncHomePage(payload, { apply, log });
}

async function syncTopBar(payload: Payload, { apply, log }: Required<SyncOptions>) {
  log('update     global  top-bar');
  if (apply) await payload.updateGlobal({ slug: 'top-bar', data: TOP_BAR, overrideAccess: true });
}

/** The <title> is built from the (unrendered) hero global; the description comes from site settings. */
async function syncMetadata(payload: Payload, { apply, log }: Required<SyncOptions>) {
  log('update     global  hero (page title only)');
  if (apply) {
    await payload.updateGlobal({
      slug: 'hero',
      data: { headline: METADATA.heroHeadline },
      overrideAccess: true,
    });
  }
  log('update     global  site-settings (meta description)');
  if (apply) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { siteDescription: METADATA.siteDescription },
      overrideAccess: true,
    });
  }
}

async function syncServices(payload: Payload, { apply, log }: Required<SyncOptions>) {
  for (const service of SERVICES) {
    const { docs } = await payload.find({
      collection: 'services',
      where: { slug: { equals: service.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const data = {
      order: service.order,
      tag: service.tag,
      title: service.title,
      tagline: service.tagline,
      blurb: service.blurb,
      heroLede: service.heroLede,
      list: service.list.map((item) => ({ item })),
    };
    if (!docs[0]) {
      log(`skip       service ${service.slug} (not in this database)`);
      continue;
    }
    log(`update     service ${service.slug} → ${service.title}`);
    if (apply) await payload.update({ collection: 'services', id: docs[0].id, data, overrideAccess: true });
  }
  const { docs: extras } = await payload.find({
    collection: 'services',
    where: { slug: { not_in: SERVICES.map((s) => s.slug) } },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });
  for (const extra of extras) {
    log(`keep       service ${extra.slug} (page stays, but it is off the landing)`);
  }
}

/** Content collections whose every row is copy, with nothing set in the admin: clear them and write the new set. */
async function replaceAll(
  payload: Payload,
  collection: 'process-phases' | 'tenets' | 'faqs',
  rows: Record<string, unknown>[],
  { apply, log }: Required<SyncOptions>,
) {
  const { docs } = await payload.find({ collection, limit: 200, depth: 0, overrideAccess: true });
  log(`replace    ${collection} (${docs.length} → ${rows.length})`);
  if (!apply) return;
  for (const doc of docs) {
    await payload.delete({ collection, id: doc.id, overrideAccess: true });
  }
  for (const data of rows) {
    await payload.create({ collection, data: data as never, overrideAccess: true });
  }
}

/** Clients carry logos set in the admin, so they are matched by name instead of cleared (see clients.ts). */
async function syncClients(payload: Payload, { apply, log }: Required<SyncOptions>) {
  const { docs } = await payload.find({ collection: 'clients', limit: 200, depth: 0, overrideAccess: true });
  const plan = planClientsSync(
    docs.map((d) => ({ id: d.id, name: d.name, order: d.order, hasAdminData: Boolean(d.logo || d.logoDark || d.website) })),
    CLIENTS,
  );
  for (const row of plan.create) {
    log(`create     client  ${row.name}`);
    if (apply) await payload.create({ collection: 'clients', data: row, overrideAccess: true });
  }
  for (const row of plan.reorder) {
    log(`reorder    client  ${row.name} → ${row.order}`);
    if (apply) await payload.update({ collection: 'clients', id: row.id, data: { order: row.order }, overrideAccess: true });
  }
  for (const row of plan.remove) {
    log(`delete     client  ${row.name} (not in copy.ts)`);
    if (apply) await payload.delete({ collection: 'clients', id: row.id, overrideAccess: true });
  }
  for (const row of plan.extra) {
    log(`keep       client  ${row.name} (not in copy.ts, but has a logo or website; remove it in the admin if it should go)`);
  }
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Shallow merge so a partial group (e.g. formLabels.submit) keeps its other keys. */
function mergeInto(target: Record<string, any>, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    target[key] = isPlainObject(value) && isPlainObject(target[key]) ? { ...target[key], ...value } : value;
  }
}

async function syncHomePage(payload: Payload, { apply, log }: Required<SyncOptions>) {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const page = docs[0];
  if (!page) {
    log('skip       page    home (not in this database)');
    return;
  }

  const layout: Record<string, any>[] = JSON.parse(JSON.stringify(page.layout ?? []));

  for (const block of layout) {
    if (block.blockType === 'hero') {
      mergeInto(block, HERO);
      log('update     block   hero');
      continue;
    }
    const patch = BLOCK_COPY[block.blockType];
    if (patch) {
      mergeInto(block, patch);
      log(`update     block   ${block.blockType}`);
    }
  }

  const serviceList = layout.find((b) => b.blockType === 'serviceList');
  if (serviceList) {
    const { docs: services } = await payload.find({
      collection: 'services',
      where: { slug: { in: SERVICES.map((s) => s.slug) } },
      limit: 10,
      depth: 0,
      overrideAccess: true,
    });
    const bySlug = new Map(services.map((s) => [s.slug, s.id]));
    serviceList.services = SERVICES.map((s) => bySlug.get(s.slug)).filter(Boolean);
    log(`update     block   serviceList → ${serviceList.services.length} services`);
  }

  for (const section of SECTIONS) {
    const block = {
      blockType: 'richText',
      blockName: section.name,
      maxWidth: section.maxWidth,
      content: toLexical(section.body),
    };
    const existing = layout.findIndex((b) => b.blockName === section.name);
    if (existing >= 0) {
      layout[existing] = { ...block, id: layout[existing].id };
      log(`update     block   richText "${section.name}"`);
      continue;
    }
    const anchor = layout.findIndex((b) => b.blockName === section.after || b.blockType === section.after);
    const at = anchor >= 0 ? anchor + 1 : layout.length;
    layout.splice(at, 0, block);
    log(`insert     block   richText "${section.name}" after ${section.after}`);
  }

  if (apply) {
    // Pages autosave drafts, so an update without _status would unpublish the homepage.
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout, _status: 'published' } as never,
      overrideAccess: true,
    });
  }
}
