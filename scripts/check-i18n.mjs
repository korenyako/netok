#!/usr/bin/env node
/**
 * i18n drift checker.
 *
 * Verifies that every locale file in ui/src/i18n/ has exactly the same set of
 * translation keys as the English source of truth (en.json), and that each
 * key's interpolation variables ({{var}} / {var}) match English. Exits non-zero
 * on any drift so it can gate commits (pre-commit hook) and CI.
 *
 * Usage: node scripts/check-i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'ui', 'src', 'i18n');
const SOURCE = 'en.json';

/** Flatten a nested translation object into dotted keys. */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

/** Collect interpolation variable names from a string value. */
function vars(value) {
  if (typeof value !== 'string') return [];
  const found = [...value.matchAll(/\{\{?\s*([a-zA-Z0-9_]+)\s*\}?\}/g)].map((m) => m[1]);
  return [...new Set(found)].sort();
}

if (!fs.existsSync(path.join(dir, SOURCE))) {
  console.error(`✖ Source locale not found: ${path.join(dir, SOURCE)}`);
  process.exit(2);
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(dir, SOURCE), 'utf8')));
const enKeys = new Set(Object.keys(en));

const locales = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json') && f !== SOURCE)
  .sort();

let failed = false;

for (const file of locales) {
  const flat = flatten(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
  const keys = new Set(Object.keys(flat));

  const missing = [...enKeys].filter((k) => !keys.has(k));
  const orphaned = [...keys].filter((k) => !enKeys.has(k));
  const interp = [...enKeys].filter(
    (k) => keys.has(k) && vars(en[k]).join(',') !== vars(flat[k]).join(',')
  );

  if (missing.length || orphaned.length || interp.length) {
    failed = true;
    console.error(`✖ ${file}`);
    if (missing.length) console.error(`    missing (${missing.length}): ${missing.join(', ')}`);
    if (orphaned.length) console.error(`    orphaned (${orphaned.length}): ${orphaned.join(', ')}`);
    if (interp.length)
      console.error(
        `    interpolation mismatch (${interp.length}): ` +
          interp.map((k) => `${k} [en: ${vars(en[k]).join('|')} ≠ ${vars(flat[k]).join('|')}]`).join(', ')
      );
  } else {
    console.log(`✓ ${file} (${keys.size} keys)`);
  }
}

if (failed) {
  console.error(`\ni18n check FAILED — locales must match ${SOURCE} exactly.`);
  process.exit(1);
}
console.log(`\ni18n check passed — ${locales.length} locales match ${SOURCE} (${enKeys.size} keys).`);
