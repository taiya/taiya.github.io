// @ts-check
/// <reference path="./types.d.ts" />

import { make_link } from './dom.js';
import { update_count } from './search.js';

/** Full list loaded from pubs.json (patents excluded). @type {Publication[]} */
let _all_pubs = [];

/** Active (possibly filtered) list driving the lazy renderer. @type {Publication[]} */
let _active_pubs = [];

/** @type {number} */
let _rendered_count = 0;
const CHUNK_SIZE = 15;

/** @type {IntersectionObserver|null} */
let _sentinel_observer = null;

/**
 * Build and append one publication entry to #pubs_list.
 * @param {Publication} entry
 */
function make_pub(entry) {
  const pub = document.createElement('div');
  pub.setAttribute('id', entry.key);
  pub.className = 'publication';
  const pubs_list = document.getElementById('pubs_list');
  if (!pubs_list) return;
  pubs_list.appendChild(pub);

  const pub_content = document.createElement('div');
  pub_content.className = 'publication_content';
  pub.appendChild(pub_content);

  const pub_info = document.createElement('div');
  pub_info.className = 'publication_information';

  if (entry.icon != undefined && entry.icon.endsWith(".mov")) {
    const video = document.createElement('video');
    video.className = 'publication_image';
    video.loop = true;
    video.muted = true;
    video.preload = 'none';
    // playsinline is required so that iOS Safari plays the video inline
    // inside the card instead of taking over the screen. It's harmless on
    // other browsers.
    video.setAttribute('playsinline', '');
    video.playsInline = true;
    const source = document.createElement('source');
    source.setAttribute('type', "video/mp4");
    video.appendChild(source);

    // Start downloading as soon as the card scrolls into view, but never
    // before. On touch devices (phones/tablets) there's no hover event,
    // so we instead auto-play whenever the card is actually visible and
    // pause when it leaves the viewport to save battery and data.
    const is_touch = window.matchMedia('(hover: none)').matches;

    const load_observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        source.src = /** @type {string} */ (entry.icon);
        video.load();
        load_observer.disconnect();
      }
    }, { rootMargin: '200px' });
    load_observer.observe(pub);

    if (is_touch) {
      const play_observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(function() {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.25 });
      play_observer.observe(pub);
    } else {
      pub.addEventListener("mouseover", function() { video.play(); });
      pub.addEventListener("mouseleave", function() { video.pause(); });
    }
    pub_content.appendChild(video);
    pub_content.appendChild(pub_info);
  } else {
    const image = document.createElement('div');
    image.className = 'publication_image';
    const img = document.createElement('img');
    const icon = entry.icon == undefined ? "/images/placeholder.jpg" : entry.icon;
    img.setAttribute('src', icon);
    img.setAttribute('height', '100%');
    img.setAttribute('alt', entry.title);
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.onerror = function() { img.src = '/images/placeholder.jpg'; };
    image.appendChild(img);
    pub_content.appendChild(image);
    pub_content.appendChild(pub_info);
  }

  // Title + Special badge
  const title_div = document.createElement('div');
  title_div.className = 'publication_title';
  if (entry.special != undefined) {
    title_div.appendChild(document.createTextNode(entry.title + ' \u2014 '));
    const badge = document.createElement('reddish');
    badge.textContent = entry.special;
    title_div.appendChild(badge);
  } else {
    title_div.textContent = entry.title;
  }
  pub_info.appendChild(title_div);

  // Authors
  const authors = document.createElement('div');
  authors.className = 'publication_authors';
  authors.textContent = entry.authors.toString().replace(/,/g, ", ");
  pub_info.appendChild(authors);

  // Venue
  if (entry.venue != undefined) {
    const venue = document.createElement('div');
    venue.className = 'publication_venue';
    venue.textContent = entry.venue;
    pub_info.appendChild(venue);
  }

  // Links row
  const links = document.createElement('ul');
  links.className = 'publication_links';
  pub_info.appendChild(links);

  if (entry.pdf != undefined)     links.insertBefore(make_link(entry.pdf, "pdf"), links.firstChild);
  if (entry.arxiv != undefined)   links.appendChild(make_link(entry.arxiv, "arxiv"));

  // Bibtex toggle
  const blacklist = ["key", "special", "source", "slides", "video", "datasets", "pdf", "homepage", "icon", "type", "media"];
  let bibtex_text = "@" + entry.type + "{" + entry.key;
  for (const tag_name in entry) {
    if (Object.prototype.hasOwnProperty.call(entry, tag_name) && !blacklist.includes(tag_name)) {
      /** @type {any} */
      let value = (/** @type {any} */ (entry))[tag_name];
      if (tag_name === "authors")
        value = value.toString().replace(/,/g, " and ");
      bibtex_text += ",\n  " + tag_name + "={" + value + "}";
    }
  }
  bibtex_text += "\n}";
  const bibtex_area = document.createElement('pre');
  bibtex_area.className = 'publication_bibtex';
  const bibtex_text_box = document.createElement('p');
  bibtex_text_box.className = 'publication_text_box';
  bibtex_text_box.innerText = bibtex_text;
  bibtex_area.appendChild(bibtex_text_box);
  pub.appendChild(bibtex_area);

  const bibtex_li = document.createElement('li');
  bibtex_li.className = 'publication_link';
  const bibtex_a = document.createElement('a');
  let bibtex_open = false;
  bibtex_a.onclick = function() {
    if (bibtex_open) {
      bibtex_area.style.maxHeight = "0em";
      bibtex_area.style.overflowX = "hidden";
    } else {
      bibtex_area.style.maxHeight = "30em";
      bibtex_area.style.overflowX = "auto";
    }
    bibtex_open = !bibtex_open;
  };
  bibtex_a.target = "New";
  bibtex_a.textContent = "bibtex";
  bibtex_li.appendChild(bibtex_a);
  links.appendChild(bibtex_li);

  if (entry.video != undefined)    links.appendChild(make_link(entry.video,    "youtube"));
  if (entry.slides != undefined)   links.appendChild(make_link(entry.slides,   "slides"));
  if (entry.source != undefined)   links.appendChild(make_link(entry.source,   "source"));
  if (entry.datasets != undefined) links.appendChild(make_link(entry.datasets, "dataset"));
  if (entry.media != undefined)    links.appendChild(make_link(entry.media,    "media coverage"));
  if (entry.homepage != undefined) links.appendChild(make_link(entry.homepage, "homepage"));
}

/**
 * Clear rendered publications and re-start the lazy renderer over `list`.
 * @param {Publication[]} list
 */
function restart_renderer(list) {
  // Disconnect existing observer
  if (_sentinel_observer) { _sentinel_observer.disconnect(); _sentinel_observer = null; }

  // Clear all rendered publication nodes (keep the <h1> heading)
  const container = document.getElementById('pubs_list');
  if (!container) return;
  // Remove only rendered publication cards and the sentinel — leaves the
  // <h1> heading and #pub_search_wrapper untouched.
  container.querySelectorAll('.publication, #_pub_sentinel').forEach(function(el) {
    el.remove();
  });

  _active_pubs = list;
  _rendered_count = 0;

  // Update count label
  update_count(list.length, _all_pubs.length);

  _sentinel_observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) render_next_chunk();
  }, { rootMargin: '200px' });

  render_next_chunk();
}

/**
 * Render the next CHUNK_SIZE publications from _active_pubs and reposition
 * the scroll sentinel.
 */
function render_next_chunk() {
  const end = Math.min(_rendered_count + CHUNK_SIZE, _active_pubs.length);
  for (let i = _rendered_count; i < end; i++) {
    make_pub(_active_pubs[i]);
  }
  _rendered_count = end;

  const container = document.getElementById('pubs_list');
  const old = document.getElementById('_pub_sentinel');
  if (old) old.remove();

  if (_rendered_count < _active_pubs.length && container) {
    const sentinel = document.createElement('div');
    sentinel.id = '_pub_sentinel';
    container.appendChild(sentinel);
    if (_sentinel_observer) _sentinel_observer.observe(sentinel);
  } else {
    if (_sentinel_observer) { _sentinel_observer.disconnect(); _sentinel_observer = null; }
  }
}

/**
 * Apply a search filter over the full list and restart the renderer.
 * Pass an empty string to restore the full list.
 * @param {string} query
 */
export function apply_filter(query) {
  const q = query.trim().toLowerCase();
  const filtered = q === ''
    ? _all_pubs
    : _all_pubs.filter(function(p) {
        const haystack = [
          p.title,
          p.authors.join(' '),
          p.venue || '',
          p.year,
          p.special || ''
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      });
  restart_renderer(filtered);
}

/**
 * @param {Publication[]} pubs
 */
function on_pubs_loaded(pubs) {
  _all_pubs = pubs.filter(function(p) { return p.type !== 'patent'; });
  // Apply any query already present in the URL or search input
  const input = /** @type {HTMLInputElement|null} */ (document.getElementById('pub_search_input'));
  const initial_q = (input ? input.value : '') ||
    new URLSearchParams(window.location.search).get('q') || '';
  apply_filter(initial_q);
}

export function make_publications() {
  fetch("/data/pubs.json")
    .then(function(r) { return r.json(); })
    .then(on_pubs_loaded);
}
