// @ts-check
/**
 * Compare snapshots/ against snapshots-baseline/ using pixelmatch.
 *
 * Exits non-zero if any PNG whose filename contains "1280x900" has a
 * non-zero pixel difference. Other viewports are diffed for manual review
 * but do not fail the gate.
 */

import { readdirSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const BASELINE_DIR = 'snapshots-baseline';
const CURRENT_DIR  = 'snapshots';
const DIFF_DIR     = 'snapshots-diff';

/** Desktop viewport substring - only index-* files gate the build. */
const DESKTOP_VIEWPORT = '1280x900';
/**
 * Files whose filename contains this prefix are excluded from the desktop gate
 * because they embed live third-party iframes (Google Calendar) that change
 * every run and would create false positives.
 */
const LIVE_CONTENT_PREFIX = 'calendar-';

/** @param {string} dir */
function dirExists(dir) {
  try { return statSync(dir).isDirectory(); } catch { return false; }
}

/** @param {string} path */
function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

function main() {
  if (!dirExists(BASELINE_DIR)) {
    console.error(`Missing ${BASELINE_DIR}/. Run: npm run snapshot:baseline`);
    process.exit(2);
  }
  if (!dirExists(CURRENT_DIR)) {
    console.error(`Missing ${CURRENT_DIR}/. Run: npm run snapshot`);
    process.exit(2);
  }
  mkdirSync(DIFF_DIR, { recursive: true });

  const baselineFiles = readdirSync(BASELINE_DIR).filter((f) => f.endsWith('.png')).sort();
  const currentFiles  = new Set(readdirSync(CURRENT_DIR).filter((f) => f.endsWith('.png')));

  /** @type {Array<{file: string, diff: number, total: number, missing: boolean, sizeMismatch: boolean}>} */
  const rows = [];
  let desktopFail = false;

  for (const file of baselineFiles) {
    const isDesktop = file.includes(DESKTOP_VIEWPORT) && !file.startsWith(LIVE_CONTENT_PREFIX);

    if (!currentFiles.has(file)) {
      rows.push({ file, diff: 0, total: 0, missing: true, sizeMismatch: false });
      if (isDesktop) desktopFail = true;
      continue;
    }

    const base = readPng(`${BASELINE_DIR}/${file}`);
    const cur  = readPng(`${CURRENT_DIR}/${file}`);

    if (base.width !== cur.width || base.height !== cur.height) {
      rows.push({ file, diff: -1, total: base.width * base.height, missing: false, sizeMismatch: true });
      if (isDesktop) desktopFail = true;
      continue;
    }

    const { width, height } = base;
    const diff = new PNG({ width, height });
    const count = pixelmatch(base.data, cur.data, diff.data, width, height, {
      threshold: 0.1,
      alpha: 0.2,
    });
    writeFileSync(`${DIFF_DIR}/${file}`, PNG.sync.write(diff));
    rows.push({ file, diff: count, total: width * height, missing: false, sizeMismatch: false });
    if (isDesktop && count > 0) desktopFail = true;
  }

  // Print table
  const nameCol = Math.max(24, ...rows.map((r) => r.file.length));
  console.log('');
  console.log('Visual regression report');
  console.log('');
  console.log(
    'file'.padEnd(nameCol) + '  ' +
    'pixels_diff'.padStart(12) + '  ' +
    'pct'.padStart(8) + '  ' +
    'status'
  );
  console.log('-'.repeat(nameCol + 2 + 12 + 2 + 8 + 2 + 20));

  for (const r of rows) {
    const isDesktop = r.file.includes(DESKTOP_VIEWPORT);
    const gated = r.file.includes(DESKTOP_VIEWPORT) && !r.file.startsWith(LIVE_CONTENT_PREFIX);
    let status;
    if (r.missing)           status = 'MISSING';
    else if (r.sizeMismatch) status = 'SIZE MISMATCH';
    else if (r.diff === 0)   status = 'identical';
    else if (gated)          status = 'DESKTOP REGRESSION';
    else if (r.file.startsWith(LIVE_CONTENT_PREFIX)) status = 'live-content (skipped)';
    else                     status = 'changed';

    const pct = r.missing || r.sizeMismatch ? '-' : ((r.diff / r.total) * 100).toFixed(3) + '%';
    console.log(
      r.file.padEnd(nameCol) + '  ' +
      String(r.diff).padStart(12) + '  ' +
      pct.padStart(8) + '  ' +
      status
    );
  }

  console.log('');
  if (desktopFail) {
    console.error(`DESKTOP REGRESSION: the ${DESKTOP_VIEWPORT} viewport differs from baseline.`);
    console.error(`Inspect ${DIFF_DIR}/*${DESKTOP_VIEWPORT}*.png to see the change.`);
    process.exit(1);
  } else {
    console.log(`Desktop (${DESKTOP_VIEWPORT}) = baseline.`);
  }
}

main();
