/**
 * Rewrites seed copy that no sync owns (see src/lib/text-cleanup.ts): Site Settings, Studio, Contact,
 * and Hero globals, every page, and author roles. Run landing-sync and portfolio-sync first; they own
 * the rest of the public copy.
 *
 * Dry run by default. --apply writes a backup of every field it is about to change, then the change:
 *   npx tsx --env-file=.env.local scripts/text-cleanup.ts
 *   npx tsx --env-file=.env.local scripts/text-cleanup.ts --apply
 *   npx tsx --env-file=.env.local scripts/text-cleanup.ts --restore text-cleanup-backup-<time>.json
 *
 * In production, inside the web service (the backup lands in /app, copy it out before the next deploy):
 *   railway ssh --service web -- "cd /app && npx --yes tsx scripts/text-cleanup.ts"
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { cleanDeep, leftovers, topLevelKeys } from '../src/lib/text-cleanup';

type GlobalSlug = 'site-settings' | 'studio' | 'contact' | 'hero';
type CollectionSlug = 'pages' | 'authors';
type Backup = Array<
  | { kind: 'global'; slug: GlobalSlug; data: Record<string, unknown> }
  | { kind: 'doc'; collection: CollectionSlug; id: number | string; data: Record<string, unknown> }
>;

const GLOBALS: GlobalSlug[] = ['site-settings', 'studio', 'contact', 'hero'];
const COLLECTIONS: CollectionSlug[] = ['pages', 'authors'];

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const restoreFrom = args.includes('--restore') ? args[args.indexOf('--restore') + 1] : null;

const connection = process.env.DATABASE_URI || process.env.DATABASE_URL || '';
let host = 'unknown';
try {
  host = new URL(connection).host;
} catch {
  // Leave "unknown"; getPayload below reports the real problem.
}
console.log(`Database: ${host}`);

const payload = await getPayload({ config });
const pick = (obj: Record<string, unknown>, keys: string[]) => Object.fromEntries(keys.map((k) => [k, obj[k]]));
// Pages autosave drafts, so an update without _status would unpublish the page.
const withStatus = (collection: CollectionSlug, data: Record<string, unknown>) =>
  collection === 'pages' ? { ...data, _status: 'published' } : data;

if (restoreFrom) {
  const backup: Backup = JSON.parse(readFileSync(restoreFrom, 'utf8'));
  for (const entry of backup) {
    if (entry.kind === 'global') {
      await payload.updateGlobal({ slug: entry.slug, data: entry.data as never, overrideAccess: true });
      console.log(`restored   global  ${entry.slug} (${Object.keys(entry.data).join(', ')})`);
    } else {
      const data = withStatus(entry.collection, entry.data);
      await payload.update({ collection: entry.collection, id: entry.id, data: data as never, overrideAccess: true });
      console.log(`restored   ${entry.collection} ${entry.id} (${Object.keys(entry.data).join(', ')})`);
    }
  }
  console.log('\nRestored.');
  process.exit(0);
}

console.log(apply ? 'Applying.\n' : 'Dry run. Re-run with --apply to write.\n');
const backup: Backup = [];
const writes: Array<() => Promise<unknown>> = [];
const remaining: string[] = [];

for (const slug of GLOBALS) {
  const doc = (await payload.findGlobal({ slug, depth: 0, overrideAccess: true })) as unknown as Record<string, unknown>;
  const { value, changes } = cleanDeep(doc);
  remaining.push(...leftovers(value).map((l) => `global ${slug}: ${l}`));
  if (changes.length === 0) continue;
  for (const c of changes) console.log(`update     global  ${slug}.${c.path}\n             - ${c.before}\n             + ${c.after}`);
  const keys = topLevelKeys(changes);
  backup.push({ kind: 'global', slug, data: pick(doc, keys) });
  writes.push(() => payload.updateGlobal({ slug, data: pick(value as Record<string, unknown>, keys) as never, overrideAccess: true }));
}

for (const collection of COLLECTIONS) {
  const { docs } = await payload.find({ collection, depth: 0, limit: 500, overrideAccess: true });
  for (const doc of docs as unknown as Array<Record<string, unknown> & { id: number | string }>) {
    const { value, changes } = cleanDeep(doc);
    remaining.push(...leftovers(value).map((l) => `${collection} ${doc.id}: ${l}`));
    if (changes.length === 0) continue;
    for (const c of changes) console.log(`update     ${collection} ${doc.id} ${c.path}\n             - ${c.before}\n             + ${c.after}`);
    const keys = topLevelKeys(changes);
    backup.push({ kind: 'doc', collection, id: doc.id, data: pick(doc, keys) });
    const data = withStatus(collection, pick(value as Record<string, unknown>, keys));
    writes.push(() => payload.update({ collection, id: doc.id, data: data as never, overrideAccess: true }));
  }
}

if (remaining.length > 0) {
  console.log('\nStill to edit by hand in /admin (no seed sentence matched):');
  for (const line of remaining) console.log(`  ${line}`);
}

if (apply && writes.length > 0) {
  const file = `text-cleanup-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nBackup: ${file}`);
  for (const write of writes) await write();
}

console.log(apply ? `\nDone, ${writes.length} document(s) written.` : `\nNothing written, ${writes.length} document(s) would change.`);
process.exit(0);
