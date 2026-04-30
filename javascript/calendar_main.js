// @ts-check

import './menu.js';

/* ---------------------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------------------- */

/**
 * Browser API key from a Google Cloud project (Calendar API enabled).
 * Restrict it to the deploying domain in the Cloud console.
 *
 * While left at the placeholder value below, the page renders with mocked
 * demo data so the layout and styling can be previewed without any setup.
 */
const API_KEY = 'AIzaSyC6_UR63L9TKs9g-ixsY4YgNwu_5Wlc7RA';

/** Public Google Calendar shared with full event details. */
const EVENTS_CALENDAR_ID = 'taiya@theialab.ca';

/** Public Google Calendar shared as free/busy only (no titles). */
const BUSY_CALENDAR_ID = 'andrea.tagliasacchi@wayve.ai';

const EVENTS_COLOR = '#039BE5';
const BUSY_COLOR   = '#F4511E';

const HAS_API_KEY = API_KEY && !API_KEY.startsWith('REPLACE_WITH_');

/* ---------------------------------------------------------------------------
 * Live data: free/busy event source for the busy-only calendar.
 *
 * The Google Calendar `events.list` endpoint returns nothing for a calendar
 * shared as free/busy only, so we hit the dedicated `freeBusy` endpoint and
 * project the resulting intervals into FullCalendar event objects.
 * ------------------------------------------------------------------------- */

/**
 * @param {{ startStr: string, endStr: string }} info
 * @returns {Promise<Array<object>>}
 */
async function busyEventSource(info) {
  const url = `https://www.googleapis.com/calendar/v3/freeBusy?key=${encodeURIComponent(API_KEY)}`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeMin: info.startStr,
        timeMax: info.endStr,
        items: [{ id: BUSY_CALENDAR_ID }],
      }),
    });
  } catch (err) {
    console.warn('freeBusy request errored:', err);
    return [];
  }
  if (!response.ok) {
    console.warn('freeBusy fetch failed:', response.status, await response.text());
    return [];
  }
  const data = await response.json();
  const bucket = data.calendars && data.calendars[BUSY_CALENDAR_ID];
  if (!bucket || !Array.isArray(bucket.busy)) return [];
  return bucket.busy.map((/** @type {{start: string, end: string}} */ b) => ({
    title: 'Busy',
    start: b.start,
    end: b.end,
    color: BUSY_COLOR,
    display: 'block',
  }));
}

/* ---------------------------------------------------------------------------
 * Demo data: shown only when no API key has been configured, so the page
 * still renders something representative for local previewing.
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

/* FullCalendar's `events` function option requires either a callback-style
 * signature or a Promise return; a synchronous array return silently hangs
 * the source. Both demo helpers below are therefore declared `async`. */

async function demoDetailedEvents() {
  const evt = (
    /** @type {number} */ d,
    /** @type {number} */ sh, /** @type {number} */ sm,
    /** @type {number} */ eh, /** @type {number} */ em,
    /** @type {string} */ title,
  ) => ({
    title,
    start: dayOfThisWeek(d, sh, sm),
    end:   dayOfThisWeek(d, eh, em),
  });
  return [
    evt(1,  9,  0, 10,  0, 'Group meeting'),
    evt(1, 14,  0, 14, 30, 'Office hours'),
    evt(2, 11,  0, 12,  0, 'Reading group'),
    evt(2, 16,  0, 17,  0, 'Student 1:1'),
    evt(3, 10, 30, 12,  0, 'Vision seminar'),
    evt(3, 15,  0, 16,  0, 'PhD committee'),
    evt(4, 13,  0, 14,  0, 'Collaborator lunch'),
  ];
}

async function demoBusyBlocks() {
  const block = (
    /** @type {number} */ d,
    /** @type {number} */ sh, /** @type {number} */ sm,
    /** @type {number} */ eh, /** @type {number} */ em,
  ) => ({
    title: 'Busy',
    start: dayOfThisWeek(d, sh, sm),
    end:   dayOfThisWeek(d, eh, em),
    color: BUSY_COLOR,
    display: 'block',
  });
  return [
    block(0,  9, 0, 12, 0),
    block(0, 13, 0, 17, 0),
    block(1,  8, 0,  9, 0),
    block(2, 14, 0, 15, 30),
    block(3,  9, 0, 10, 0),
    block(4,  9, 0, 17, 0),
  ];
}

/* ---------------------------------------------------------------------------
 * Initialisation
 * ------------------------------------------------------------------------- */

function init_calendar() {
  const el = document.getElementById('calendar');
  const FC = /** @type {any} */ (window).FullCalendar;
  if (!el || !FC) return;

  const eventSources = HAS_API_KEY
    ? [
        { googleCalendarId: EVENTS_CALENDAR_ID, color: EVENTS_COLOR },
        { events: busyEventSource },
      ]
    : [
        { events: demoDetailedEvents, color: EVENTS_COLOR },
        { events: demoBusyBlocks },
      ];

  const calendar = new FC.Calendar(el, {
    initialView: 'timeGridWeek',
    timeZone: 'America/Vancouver',
    firstDay: 1,
    nowIndicator: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    expandRows: true,
    height: 1000,
    googleCalendarApiKey: HAS_API_KEY ? API_KEY : undefined,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,dayGridMonth',
    },
    businessHours: {
      daysOfWeek: [2, 3, 4],
      startTime: '08:00',
      endTime: '18:30',
    },
    eventSources,
  });
  calendar.render();
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
