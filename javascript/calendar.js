// @ts-check

import './menu.js';

/* ===========================================================================
 * Configuration
 *
 * Each entry in CALENDARS describes one public Google Calendar shared as
 * free/busy only. They're queried via the dedicated `freeBusy` endpoint and
 * rendered as anonymous "Busy" blocks in the configured color. The list is
 * iterated at fetch time, so adding a new source is a single-entry change.
 *
 * Each `apiKey` must come from a Google Cloud project with the Calendar API
 * enabled, and must be restricted to the deploying domain (HTTP referrers)
 * and to the Calendar API (api-target). Keys can come from the same project
 * or different ones — they are independent per entry. While a key is left
 * at its placeholder value, that source falls back to demo data so the page
 * still renders without any cloud setup.
 *
 * ---------------------------------------------------------------------------
 * How to obtain an API key (one per CALENDARS entry below)
 * ---------------------------------------------------------------------------
 * The Calendar API is free and does not require a billing account. Steps
 * assume macOS + Homebrew; only step 2 opens a browser, the rest is
 * terminal-only.
 *
 * 1. Install the gcloud CLI (skip if already installed):
 *
 *      brew install --cask google-cloud-sdk
 *      gcloud --version
 *
 * 2. Sign in:
 *
 *      gcloud auth login
 *
 * 3. Create a fresh project (one project can host multiple keys, but a
 *    fresh one keeps blast radius small):
 *
 *      PROJECT_ID="taiya-calendar-$(date +%Y%m%d)"
 *      gcloud projects create "$PROJECT_ID" --name="taiya-calendar"
 *      gcloud config set project "$PROJECT_ID"
 *
 * 4. Enable the Calendar API in that project:
 *
 *      gcloud services enable calendar-json.googleapis.com
 *
 * 5. Create a domain-restricted, API-target-restricted browser key. The
 *    HTTP-referrer restriction is what makes the key safe to ship in plain
 *    JavaScript — Google rejects requests from any other origin. Drop the
 *    localhost entry once you've verified prod (see the TODO below):
 *
 *      gcloud services api-keys create \
 *        --display-name="taiya-calendar-web" \
 *        --allowed-referrers="https://theialab.ca/*,https://taiya.github.io/*,http://localhost:8000/*" \
 *        --api-target=service=calendar-json.googleapis.com
 *
 * 6. Read the key string (single AIzaSy… token):
 *
 *      KEY_NAME=$(gcloud services api-keys list \
 *        --filter="displayName:taiya-calendar-web" \
 *        --format="value(name)" --limit=1)
 *      gcloud services api-keys get-key-string "$KEY_NAME" \
 *        --format="value(keyString)"
 *
 * 7. Paste it into the matching entry in CALENDARS below. Reload the page;
 *    calendars with a real key swap from demo to live data automatically.
 *
 * Useful follow-ups (rotate, retarget, or revoke a key):
 *
 *      gcloud services api-keys list
 *      gcloud services api-keys update "$KEY_NAME" \
 *        --allowed-referrers="https://theialab.ca/*,https://taiya.github.io/*"
 *      gcloud services api-keys delete "$KEY_NAME"
 *
 * ---------------------------------------------------------------------------
 * Rate limits / quota
 * ---------------------------------------------------------------------------
 * The Calendar API is *free* — no billing account, no per-call charges,
 * even if quotas are exceeded (Google just throttles, never bills). Quota
 * is enforced PER MINUTE PER PROJECT (Google moved off the old per-day
 * model in May 2021), with a separate per-user-per-project sliding window.
 * Defaults aren't published, but the per-project limit is in the
 * multi-hundred-requests-per-minute range — comfortably above what a
 * static personal site sees in practice (each visitor triggers N requests
 * per week-view navigation, where N = number of CALENDARS entries; a few
 * thousand visitors/day stays well under the cap).
 *
 * If quota is exceeded, the API returns 403/429 with a `usageLimits`
 * reason and the calendar momentarily falls back to whatever was
 * previously cached/rendered. No data is lost, no money is spent.
 *
 * Inspect or raise the limit for a project (requires linking a billing
 * account to the project, though usage itself stays free):
 *
 *      open "https://console.cloud.google.com/apis/api/calendar-json.googleapis.com/quotas?project=$PROJECT_ID"
 *
 * The HTTP-referrer restriction from step 5 is what protects this quota
 * from being burned by an attacker spoofing `Referer` outside the listed
 * origins — without it, anyone could DoS the page by hammering the
 * freeBusy endpoint with the leaked key.
 *
 * ---------------------------------------------------------------------------
 * TODO: once the site is verified live on the public domains, drop
 * `http://localhost:8000/*` from the allowed-referrers list of every key
 * (or split into separate dev/prod keys) so production keys can't be used
 * from a local dev server by anyone who scrapes them out of the bundle.
 * ========================================================================= */

/**
 * @typedef {Object} CalendarConfig
 * @property {string} calId  Public Google Calendar identifier.
 * @property {string} apiKey Browser-restricted Calendar API key.
 * @property {string} color  CSS color used for this calendar's busy blocks.
 */

/** @type {Array<CalendarConfig>} */
const CALENDARS = [
  {
    calId:  'taiya@theialab.ca',
    apiKey: 'AIzaSyAEWsjI-w-PzdYNF4tVqt_2G3y4eV3b7ig',
    color:  '#CC0633', // SFU brand red (Pantone 200)
  },
  {
    calId:  'andrea.tagliasacchi@wayve.ai',
    apiKey: 'AIzaSyC6_UR63L9TKs9g-ixsY4YgNwu_5Wlc7RA',
    color:  '#039BE5', // Google Calendar default "Peacock" blue
  },
];

/** A key is "real" once it's no longer the placeholder string. */
const isRealKey = (/** @type {string} */ k) => !!k && !k.startsWith('REPLACE_WITH_');

/* ---------------------------------------------------------------------------
 * Timezone: the calendar's primary axis is permanently in PRIMARY_TZ so
 * events never visually shift when the visitor changes the selector. The
 * picker only controls the SECONDARY column rendered in the time axis.
 *
 * FullCalendar v6 only does timezone math out-of-the-box for 'local' and
 * 'UTC'. Named zones like 'America/Vancouver' silently fall back to UTC
 * unless a timezone plugin is loaded — calendar.html loads Luxon and the
 * @fullcalendar/luxon3 global plugin to enable real named-zone handling.
 * ------------------------------------------------------------------------- */

const PRIMARY_TZ     = 'America/Vancouver';
const TZ_STORAGE_KEY = 'taiya_calendar_secondary_tz';

/** Currently-selected secondary timezone (changes on selector input). */
let secondaryTz = loadSavedTz();

const TZ_OPTIONS = [
  { value: 'America/Vancouver', label: 'Vancouver (PT)'           },
  { value: 'America/Toronto',   label: 'Toronto / New York (ET)'  },
  { value: 'Europe/London',     label: 'London (GMT/BST)'         },
  { value: 'Europe/Berlin',     label: 'Berlin / Zurich (CET)'    },
  { value: 'Asia/Tokyo',        label: 'Tokyo (JST)'              },
  { value: 'Australia/Sydney',  label: 'Sydney (AET)'             },
];

function detectLocalTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

function loadSavedTz() {
  try {
    return localStorage.getItem(TZ_STORAGE_KEY) || detectLocalTz();
  } catch (e) {
    return detectLocalTz();
  }
}

function saveTz(/** @type {string} */ tz) {
  try { localStorage.setItem(TZ_STORAGE_KEY, tz); } catch (e) { /* private mode */ }
}

/**
 * 3-letter abbreviation of a timezone, derived from the city portion.
 * 'America/Vancouver' → 'Van', 'Europe/London' → 'Lon', etc.
 *
 * @param {string} tz
 */
function shortTzLabel(tz) {
  const city = (tz.split('/').pop() || tz).replace(/_/g, ' ');
  return city.slice(0, 3);
}

/**
 * Build the HTML for one slot label in the time axis. When a secondary
 * timezone is selected, lays the two times side-by-side as
 * `[secondary] [primary]`, matching Google Calendar's world-clock axis.
 *
 * @param {{ date: Date }} arg
 */
function buildSlotLabelHtml(arg) {
  const luxon = /** @type {any} */ (window).luxon;
  if (!luxon) return { html: '' };

  /* `arg.date` is a JS Date whose millisecond value is the actual UTC
   * instant of this slot. We convert via Luxon to produce wall-clock
   * formatted strings in each target zone. */
  const instant = luxon.DateTime.fromMillis(arg.date.valueOf());
  const primaryStr = instant.setZone(PRIMARY_TZ).toFormat('h a');

  if (!secondaryTz || secondaryTz === PRIMARY_TZ) {
    return { html: `<span class="tz-primary">${primaryStr}</span>` };
  }
  const secondaryStr = instant.setZone(secondaryTz).toFormat('h a');
  return {
    html:
      `<div class="tz-slot">` +
        `<span class="tz-secondary">${secondaryStr}</span>` +
        `<span class="tz-primary">${primaryStr}</span>` +
      `</div>`,
  };
}

/**
 * Inject "[Lon] [Van]" abbreviations into the top-left axis corner so the
 * two slot-label columns are clearly identified. Idempotent — must be
 * re-called on every FC re-render (handled via the `datesSet` callback).
 *
 * @param {HTMLElement} root
 */
function refreshAxisHeader(root) {
  const cell = root.querySelector('.fc-col-header .fc-timegrid-axis .fc-timegrid-axis-frame');
  if (!cell) return;
  if (!secondaryTz || secondaryTz === PRIMARY_TZ) {
    cell.innerHTML = '';
    return;
  }
  cell.innerHTML =
    `<div class="tz-axis-header">` +
      `<span>${shortTzLabel(secondaryTz)}</span>` +
      `<span>${shortTzLabel(PRIMARY_TZ)}</span>` +
    `</div>`;
}

/**
 * Populate the <select id="tz_select"> with the curated list, prepended by
 * the auto-detected local timezone. Marks `currentTz` as selected; if it's
 * not in the standard list, appends it at the bottom so it's still visible.
 *
 * @param {string} currentTz
 */
function populateTzSelector(currentTz) {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById('tz_select'));
  if (!sel) return;

  const localTz = detectLocalTz();
  const seen = new Set();
  const opts = [{ value: localTz, label: `Browser local (${localTz})` }];
  seen.add(localTz);
  for (const opt of TZ_OPTIONS) {
    if (!seen.has(opt.value)) { opts.push(opt); seen.add(opt.value); }
  }
  if (!seen.has(currentTz)) {
    opts.push({ value: currentTz, label: currentTz });
  }

  sel.innerHTML = '';
  for (const { value, label } of opts) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    if (value === currentTz) o.selected = true;
    sel.appendChild(o);
  }
}

/* ---------------------------------------------------------------------------
 * Per-calendar fetch: returns busy intervals projected into FullCalendar
 * event objects. Falls back to demo data when the key is a placeholder.
 * ------------------------------------------------------------------------- */

/**
 * @param {CalendarConfig} cal
 * @param {{ start: Date, end: Date }} info
 * @returns {Promise<Array<object>>}
 */
async function fetchBusyForCalendar(cal, info) {
  if (!isRealKey(cal.apiKey)) {
    return demoBusyForColor(cal.color);
  }
  const url = `https://www.googleapis.com/calendar/v3/freeBusy?key=${encodeURIComponent(cal.apiKey)}`;
  /* `info.startStr` / `info.endStr` are formatted in the calendar's display
   * timezone and lack a UTC suffix (e.g. "2026-04-27T00:00:00"), which the
   * freeBusy API rejects with HTTP 400. The Date objects round-trip through
   * `toISOString()` to proper RFC 3339 UTC strings ("…Z") instead. */
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: info.start.toISOString(),
      timeMax: info.end.toISOString(),
      items: [{ id: cal.calId }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`freeBusy(${cal.calId}) HTTP ${res.status}: ${body}`);
  }
  const data = await res.json();
  const bucket = data.calendars && data.calendars[cal.calId];
  const busy = (bucket && Array.isArray(bucket.busy)) ? bucket.busy : [];
  return busy.map((/** @type {{start: string, end: string}} */ b) => ({
    title: 'Busy',
    start: b.start,
    end: b.end,
    color: cal.color,
    display: 'block',
  }));
}

/* ---------------------------------------------------------------------------
 * Demo data: shown only when an entry's API key is still placeholder.
 * ------------------------------------------------------------------------- */

/**
 * Returns a Date pinned to the current week, with `dayIndex` = 0 (Monday) ..
 * 6 (Sunday) and the requested wall-clock time in local browser timezone.
 *
 * @param {number} dayIndex
 * @param {number} hour
 * @param {number} [minute]
 */
function dayOfThisWeek(dayIndex, hour, minute = 0) {
  const now = new Date();
  const dow = now.getDay();
  const mondayOffset = (dow + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - mondayOffset);
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayIndex);
  target.setHours(hour, minute, 0, 0);
  return target;
}

/** @type {Array<[number, number, number, number, number]>} */
const DEMO_BLOCKS = [
  [0,  9, 0, 12,  0],
  [0, 13, 0, 17,  0],
  [1,  8, 0,  9,  0],
  [2, 14, 0, 15, 30],
  [3,  9, 0, 10,  0],
  [4,  9, 0, 17,  0],
];

/** @param {string} color */
function demoBusyForColor(color) {
  return DEMO_BLOCKS.map(([d, sh, sm, eh, em]) => ({
    title: 'Busy',
    start: dayOfThisWeek(d, sh, sm),
    end:   dayOfThisWeek(d, eh, em),
    color,
    display: 'block',
  }));
}

/* ---------------------------------------------------------------------------
 * Initialisation
 * ------------------------------------------------------------------------- */

function init_calendar() {
  const el = document.getElementById('calendar');
  const FC = /** @type {any} */ (window).FullCalendar;
  if (!el) { console.error('[calendar] #calendar element not found'); return; }
  if (!FC) { console.error('[calendar] window.FullCalendar global not loaded — CDN script tag missing or blocked'); return; }

  populateTzSelector(secondaryTz);
  console.log('[calendar] initialising', {
    fcVersion: FC.version,
    calendars: CALENDARS.length,
    primaryTz: PRIMARY_TZ,
    secondaryTz,
  });

  const calendar = new FC.Calendar(el, {
    initialView: 'timeGridWeek',
    timeZone: PRIMARY_TZ,
    firstDay: 1,
    nowIndicator: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    /* `height: 'auto'` lets the calendar grow to fit its content, so we
     * never get FC's internal scrollbar — which would otherwise appear
     * when toggling between single- and dual-timezone slot labels (the
     * dual layout is ~1px taller per row, just enough to overflow a
     * fixed pixel height). The page's outer scrollbar handles overflow. */
    height: 'auto',
    dayHeaderFormat: { weekday: 'short', month: 'short', day: 'numeric' },
    /* Two-line label for the all-day row (FC's default is the single
     * string "all-day"). Centered + small via the `.fc-allday-label` CSS. */
    allDayContent: { html: '<span class="fc-allday-label">all day<br>events</span>' },
    slotLabelContent: buildSlotLabelHtml,
    /* Re-inject the corner [Lon][Van] labels whenever FC re-renders the
     * header (initial load, prev/next/today, view switches, refetch). */
    datesSet: function () { refreshAxisHeader(el); },
    headerToolbar: {
      left: 'prev,next today',
      center: '',
      right: 'timeGridDay,timeGridWeek,dayGridMonth',
    },
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '18:30',
    },
    events: function (
      /** @type {{ start: Date, end: Date, startStr: string, endStr: string }} */ info,
      /** @type {(events: Array<object>) => void} */ successCallback,
      /** @type {(err: Error) => void} */ failureCallback,
    ) {
      console.log('[calendar] fetching events', info.start.toISOString(), '→', info.end.toISOString());
      Promise.all(CALENDARS.map((cal) => fetchBusyForCalendar(cal, info)))
        .then((buckets) => {
          const merged = buckets.flat();
          console.log('[calendar] fetched', merged.length, 'busy blocks across', buckets.length, 'calendars',
                      buckets.map((b) => b.length));
          successCallback(merged);
        })
        .catch((err) => {
          console.error('[calendar] events fetch failed:', err);
          failureCallback(err);
        });
    },
  });
  calendar.render();
  console.log('[calendar] rendered');

  /* Relocate the timezone widget into the FC toolbar's center chunk (which
   * is empty since we removed the title). The widget starts `hidden` in the
   * page so there's no flash before it lands in its final position. */
  const tzWidget = document.getElementById('tz_widget');
  const centerChunk = el.querySelector('.fc-header-toolbar .fc-toolbar-chunk:nth-child(2)');
  if (tzWidget && centerChunk) {
    centerChunk.appendChild(tzWidget);
    tzWidget.removeAttribute('hidden');
  }

  /* Initial inject of corner labels (datesSet may have fired before our
   * function definition was reachable; running once more here is harmless). */
  refreshAxisHeader(el);

  /* Wire the selector via document-level delegation so the listener
   * survives any FC toolbar reconciliation that might destroy/replace the
   * <select> element. We update the slot-label callback with a *fresh*
   * function reference each time — FC skips re-rendering when the option's
   * value is `===` to the previous one, so passing the same function ref
   * would silently do nothing. The corner labels are refreshed via
   * `queueMicrotask` so we run after FC's synchronous re-render finishes. */
  document.addEventListener('change', (ev) => {
    const target = /** @type {HTMLSelectElement | null} */ (ev.target);
    if (!target || target.id !== 'tz_select') return;
    secondaryTz = target.value;
    saveTz(secondaryTz);
    console.log('[calendar] secondary timezone changed to', secondaryTz);
    calendar.setOption('slotLabelContent', function (/** @type {{date: Date}} */ arg) { return buildSlotLabelHtml(arg); });
    queueMicrotask(() => refreshAxisHeader(el));
  });
}

function make_footer() {
  const text = document.createElement('span');
  const dt = new Date();
  text.textContent = "Copyright " + dt.getFullYear() + " \u2013 Andrea Tagliasacchi";
  const footer = document.getElementById("footer");
  if (footer) footer.appendChild(text);
}

document.addEventListener('DOMContentLoaded', () => {
  make_footer();
  init_calendar();
});
