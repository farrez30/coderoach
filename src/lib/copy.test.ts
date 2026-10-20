/**
 * Punctuation rules for the words visitors read. Sentences use commas and full stops, not " — " or
 * " · ", because the part after the symbol drops to its own line on a phone and screen readers say
 * the symbol out loud. Arrows and check marks are drawn in an aria-hidden element, never typed into
 * the text. A short instrument meta line ("F&B OPS · STUDIO PRODUCT") keeps its dot: <Meta> renders it.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import * as landing from './landing/copy';
import * as opsscore from './opsscore/copy';
import { PORTFOLIO } from './portfolio/projects';

const SRC = path.join(import.meta.dirname, '..');

/** Every string reachable from a value, with the path that leads to it. */
function strings(value: unknown, at = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[at, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${at}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, `${at}.${k}`));
  return [];
}

const SYMBOLS = /→|←|↳|✓/;
const DASH = / — /;

function offenders(entries: Array<[string, string]>, pattern: RegExp) {
  return entries.filter(([, s]) => pattern.test(s)).map(([at, s]) => `${at}: ${s}`);
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : full.endsWith('.tsx') ? [full] : [];
  });
}

const isComment = (line: string) => /^\s*(\/\/|\*|\/\*|\{\/\*)/.test(line);

describe('copy synced to the database', () => {
  // ADMIN_COPY is the two-person admin screen, not public copy.
  const { ADMIN_COPY: _admin, ...publicOpsscore } = opsscore;
  const copy = [...strings(landing, 'landing'), ...strings(PORTFOLIO, 'portfolio'), ...strings(publicOpsscore, 'opsscore')];

  test('has no arrows or check marks typed into the text', () => {
    assert.deepEqual(offenders(copy, SYMBOLS), []);
  });

  test('joins sentences with commas and full stops, not em dashes', () => {
    assert.deepEqual(offenders(copy, DASH), []);
  });
});

describe('seed data', () => {
  // seed.ts runs on import, so its string literals are read from the file. Log lines are skipped.
  const lines = readFileSync(path.join(SRC, 'lib/seed.ts'), 'utf8').split('\n');
  const literals = lines.flatMap((line, i) =>
    isComment(line) || line.includes('console.log')
      ? []
      : [...line.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m): [string, string] => [`seed.ts:${i + 1}`, m[1]]),
  );

  test('has no arrows, check marks, or em dashes in its copy', () => {
    assert.deepEqual([...offenders(literals, SYMBOLS), ...offenders(literals, DASH)], []);
  });
});

describe('page components', () => {
  const files = [...filesUnder(path.join(SRC, 'app/(frontend)')), ...filesUnder(path.join(SRC, 'app/(presentasi)'))];

  test('draw arrows and check marks in an aria-hidden or aria-labelled element', () => {
    const bad: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (!SYMBOLS.test(line) || isComment(line)) return;
        // The symbol sits in a field the component renders aria-hidden (consoles), or a nearby
        // opening tag hides it or gives the element its own name.
        if (/\b(mark|prefix):\s*'/.test(line) || file.endsWith('CtaLabel.tsx')) return;
        if (/aria-hidden|aria-label/.test(lines.slice(Math.max(0, i - 4), i + 1).join('\n'))) return;
        bad.push(`${path.relative(SRC, file)}:${i + 1}: ${line.trim()}`);
      });
    }
    assert.deepEqual(bad, []);
  });

  test('separate page titles with " | "', () => {
    const bad: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (/(title\s*[:=]|document\.title).*( · | — )/.test(line)) bad.push(`${path.relative(SRC, file)}:${i + 1}: ${line.trim()}`);
        });
    }
    assert.deepEqual(bad, []);
  });
});
