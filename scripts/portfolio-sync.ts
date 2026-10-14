/**
 * Writes the portfolio in src/lib/portfolio/projects.ts to the database: covers from
 * scripts/portfolio-assets into Media, entries into Projects (matched by slug), and the
 * retired entries back to draft.
 *
 * Dry run by default. Nothing is written without --apply:
 *   npx tsx --env-file=.env.local scripts/portfolio-sync.ts
 *   npx tsx --env-file=.env.local scripts/portfolio-sync.ts --apply
 *
 * Production keeps uploads on the Railway volume at /app/media, so run it inside the web
 * service, where both the volume and the private database are reachable:
 *   railway ssh --service web -- "npx tsx scripts/portfolio-sync.ts --apply"
 *
 * Permissions (ADR 0009/0010): every IZN-… reference is checked against Coderoach OS through
 * CODEROACH_OS_URL and CODEROACH_OS_TOKEN; if that fails, nothing is written. On a local
 * database only (SEED_TARGET=local), --assume-consents treats every reference as granted.
 */
import path from 'node:path';
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { refsIn } from '../src/lib/portfolio/gate';
import { assumedGrants, loadGrants } from '../src/lib/portfolio/grants';
import { PORTFOLIO } from '../src/lib/portfolio/projects';
import { syncPortfolio } from '../src/lib/portfolio/sync';

const apply = process.argv.includes('--apply');
const assume = process.argv.includes('--assume-consents');
if (assume && process.env.SEED_TARGET !== 'local') {
  console.error('--assume-consents is for a local database only (SEED_TARGET=local).');
  process.exit(1);
}

const connection = process.env.DATABASE_URI || process.env.DATABASE_URL || '';
let host = 'unknown';
try {
  host = new URL(connection).host;
} catch {
  // Leave "unknown"; getPayload below reports the real problem.
}
console.log(`Database: ${host}`);
console.log(`Media storage: ${path.resolve(process.cwd(), 'media')}`);
console.log(apply ? 'Applying.\n' : 'Dry run. Re-run with --apply to write.\n');

const refs = refsIn(PORTFOLIO);
const grants = assume
  ? assumedGrants(refs, PORTFOLIO.flatMap((e) => (e.metrics ?? []).map((m) => m.key)))
  : await loadGrants(refs, { baseUrl: process.env.CODEROACH_OS_URL, token: process.env.CODEROACH_OS_TOKEN });
console.log(`Permissions: ${refs.length ? `${grants.size} of ${refs.length} references found` : 'none needed'}${assume ? ' (assumed, local)' : ''}\n`);

const payload = await getPayload({ config });
await syncPortfolio(payload, {
  apply,
  assetsDir: path.resolve(process.cwd(), 'scripts/portfolio-assets'),
  grants,
});

console.log(apply ? '\nDone.' : '\nNothing written.');
process.exit(0);
