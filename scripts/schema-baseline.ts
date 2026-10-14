/**
 * Records the current Payload schema as src/lib/schema/baseline.json, the shape production is known
 * to have. Run it only after a schema change has been pushed to production (docs/portfolio-ops.md),
 * so schema.test.ts measures the next change against what the database really holds.
 *
 *   npx tsx scripts/schema-baseline.ts
 */
import { writeFileSync } from 'node:fs';
import config from '../src/payload.config';
import { describeSchema } from '../src/lib/schema/describe';

const shape = describeSchema((await config) as never);
writeFileSync(new URL('../src/lib/schema/baseline.json', import.meta.url), `${JSON.stringify(shape, null, 1)}\n`);
console.log(`${Object.keys(shape).length} fields written to src/lib/schema/baseline.json`);
process.exit(0);
