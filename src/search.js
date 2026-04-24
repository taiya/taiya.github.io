// @ts-check

import { apply_filter } from './pubs.js';

/** @type {ReturnType<typeof setTimeout>|null} */
let _debounce_timer = null;
const DEBOUNCE_MS = 150;

/**
 * Read the initial query from the URL and return it (or empty string).
 * @returns {string}
 */
function get_url_query() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

/**
 * Push the query string into the URL without reloading the page.
 * @param {string} q
 */
function set_url_query(q) {
  const url = new URL(window.location.href);
  if (q) {
    url.searchParams.set('q', q);
  } else {
    url.searchParams.delete('q');
  }
  history.replaceState(null, '', url.toString());
}

/**
 * Inject the search bar above the publication entries (below the h1 heading)
 * and wire up the input/clear handlers.
 */
export function init_search() {
  const container = document.getElementById('pubs_list');
  if (!container) return;

  // Build the search bar DOM
  const wrapper = document.createElement('div');
  wrapper.id = 'pub_search_wrapper';

  // Inner div provides the relative positioning context for the count overlay
  const input_row = document.createElement('div');
  input_row.id = 'pub_search_input_row';

  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'pub_search_input';
  input.placeholder = 'keyword, author, year, venue\u2026';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-label', 'Search publications');

  const count = document.createElement('span');
  count.id = 'pub_search_count';

  input_row.appendChild(input);
  input_row.appendChild(count);
  wrapper.appendChild(input_row);

  // Insert immediately after the <h1> heading
  const heading = container.querySelector('h1');
  if (heading && heading.nextSibling) {
    container.insertBefore(wrapper, heading.nextSibling);
  } else {
    container.appendChild(wrapper);
  }

  // Restore from URL on load
  const initial_q = get_url_query();
  if (initial_q) {
    input.value = initial_q;
    // apply_filter will be called after pubs load; pubs.js reads the input value
    // via the exported hook below, so we trigger it once pubs are ready.
  }

  input.addEventListener('input', function() {
    const q = input.value;
    if (_debounce_timer !== null) clearTimeout(_debounce_timer);
    _debounce_timer = setTimeout(function() {
      set_url_query(q);
      apply_filter(q);
    }, DEBOUNCE_MS);
  });

  // Handle browser back/forward navigation
  window.addEventListener('popstate', function() {
    const q = get_url_query();
    input.value = q;
    apply_filter(q);
  });

  return { input, count };
}

/**
 * Update the result count label shown next to the search box.
 * Called by pubs.js after each renderer reset.
 * @param {number} shown
 * @param {number} total
 */
export function update_count(shown, total) {
  const count = document.getElementById('pub_search_count');
  if (!count) return;
  if (shown === total) {
    count.textContent = '';
  } else {
    count.textContent = shown + ' of ' + total + ' publications';
  }
}
