// @ts-check

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
      // @ts-ignore — commonmark loaded as a classic script before this module
      const reader = new commonmark.Parser();
      // @ts-ignore
      const writer = new commonmark.HtmlRenderer();
      const parsed = reader.parse(file);
      const html = writer.render(parsed);
      const element = document.getElementById(id);
      const div = document.createElement("div");
      div.style.textAlign = "justify";
      div.innerHTML = html;
      if (element) element.appendChild(div);
    });
}
