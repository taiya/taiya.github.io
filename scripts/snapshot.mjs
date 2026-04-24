// @ts-check
/**
 * Visual-regression screenshot harness.
 *
 * Spawns a local http.server, opens `/` and `/calendar.html` in headless
 * Chromium at several viewport widths, and writes full-page PNGs to
 * snapshots/<page>-<w>x<h>.png.
 *
 * Usage:
 *   npm run snapshot                          # writes to snapshots/
 *   OUT_DIR=snapshots-baseline npm run snapshot    # writes baseline
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import http from 'node:http';

const PORT = 8899;
const HOST = '127.0.0.1';
const OUT_DIR = process.env.OUT_DIR || 'snapshots';

const PAGES = [
  { name: 'index',    path: '/' },
  { name: 'calendar', path: '/calendar.html' },
];

const VIEWPORTS = [
  { name: '1280x900', width: 1280, height: 900  }, // desktop baseline (hard gate)
  { name: '820x1024', width: 820,  height: 1024 }, // upper mid-range (just below 1000)
  { name: '560x900',  width: 560,  height: 900  }, // lower mid-range (just below 600)
  { name: '390x844',  width: 390,  height: 844  }, // phone (iPhone 14)
];

/**
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<void>}
 */
async function waitForServer(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          res.on('end', () => resolve(undefined));
        });
        req.on('error', reject);
      });
      return;
    } catch {
      await sleep(200);
    }
  }
  throw new Error(`Server did not come up at ${url} within ${timeoutMs}ms`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', HOST], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });

  let failed = false;
  try {
    await waitForServer(`http://${HOST}:${PORT}/`);
    console.log(`server up at http://${HOST}:${PORT}`);

    const browser = await chromium.launch();
    try {
      for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        const page = await ctx.newPage();

        for (const p of PAGES) {
          const url = `http://${HOST}:${PORT}${p.path}`;
          try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
          } catch {
            // calendar.html embeds a Google Calendar iframe whose subrequests
            // never fully idle; fall back to 'load'.
            await page.goto(url, { waitUntil: 'load', timeout: 15000 });
          }

          // Wait for the markdown sections to render (all pages that have /data/ fetches)
          if (p.name === 'index') {
            await page.waitForFunction(() => {
              const pubs = document.getElementById('pubs_list');
              return pubs && pubs.querySelectorAll('.publication').length > 0;
            }, { timeout: 10000 });

            // Walk the page top to bottom to trigger every IntersectionObserver
            // (lazy publication chunks + per-card video .src assignment) so the
            // screenshot is deterministic across runs.
            await page.evaluate(async () => {
              const step = 400;
              const pause = (ms) => new Promise((r) => setTimeout(r, ms));
              let y = 0;
              let stableCount = 0;
              let lastHeight = 0;
              while (stableCount < 5) {
                window.scrollTo(0, y);
                await pause(80);
                const h = document.documentElement.scrollHeight;
                if (h === lastHeight && y >= h) stableCount += 1;
                else stableCount = 0;
                lastHeight = h;
                y += step;
                if (y > h + 2000) y = h; // clamp
                if (y >= h && stableCount >= 5) break;
                if (y > 200000) break; // safety
              }
              window.scrollTo(0, 0);
              await pause(150);
            });
          }

          // Final stabilization
          await sleep(300);

          const out = `${OUT_DIR}/${p.name}-${vp.name}.png`;
          await page.screenshot({ path: out, fullPage: true });
          console.log(`  wrote ${out}`);
        }

        await ctx.close();
      }
    } finally {
      await browser.close();
    }
  } catch (e) {
    failed = true;
    console.error(e);
  } finally {
    server.kill();
  }

  if (failed) process.exit(1);
}

main();
