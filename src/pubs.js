// @ts-check
/// <reference path="../types.d.ts" />

import { make_link } from './dom.js';

/** @type {Publication[]} */
let _all_pubs = [];
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
  document.getElementById('pubs_list').appendChild(pub);

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
    const source = document.createElement('source');
    source.setAttribute('type', "video/mp4");
    video.appendChild(source);
    let videoLoaded = false;
    pub.addEventListener("mouseover", function() {
      if (!videoLoaded) {
        source.src = entry.icon;
        video.load();
        videoLoaded = true;
      }
      video.play();
    });
    pub.addEventListener("mouseleave", function() { video.pause(); });
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
 * Render the next CHUNK_SIZE publications and reposition the sentinel.
 */
function render_next_chunk() {
  const end = Math.min(_rendered_count + CHUNK_SIZE, _all_pubs.length);
  for (let i = _rendered_count; i < end; i++) {
    make_pub(_all_pubs[i]);
  }
  _rendered_count = end;

  const container = document.getElementById('pubs_list');
  // Remove old sentinel if present
  const old = document.getElementById('_pub_sentinel');
  if (old) old.remove();

  if (_rendered_count < _all_pubs.length) {
    const sentinel = document.createElement('div');
    sentinel.id = '_pub_sentinel';
    container.appendChild(sentinel);
    if (_sentinel_observer) _sentinel_observer.observe(sentinel);
  } else {
    // All rendered — disconnect observer
    if (_sentinel_observer) { _sentinel_observer.disconnect(); _sentinel_observer = null; }
  }
}

/**
 * @param {Publication[]} pubs
 */
function on_pubs_loaded(pubs) {
  _all_pubs = pubs.filter(function(p) { return p.type !== 'patent'; });
  _rendered_count = 0;

  _sentinel_observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) render_next_chunk();
  }, { rootMargin: '200px' });

  render_next_chunk();
}

export function make_publications() {
  fetch("/data/pubs.json")
    .then(function(r) { return r.json(); })
    .then(on_pubs_loaded);
}
