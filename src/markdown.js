// @ts-check
import parse from '/javascript/snarkdown.js';

/**
 * Fetch a markdown file and render it into the given DOM element id.
 * @param {string} url
 * @param {string} id
 * @returns {Promise<void>}
 */
export function render_markdown(url, id) {
  return fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(file) {
      const html = parse(file);
      const element = document.getElementById(id);
      const div = document.createElement("div");
      div.style.textAlign = "justify";
      div.innerHTML = html;
      if (element) element.appendChild(div);
    });
}
