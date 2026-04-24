// @ts-check
import parse from '/javascript/snarkdown.js';

/**
 * snarkdown omits <p> tags for top-level paragraph text.
 * This restores parity with CommonMark by wrapping bare text runs
 * (text that appears between block-level elements, or at start/end)
 * in <p> tags.
 * @param {string} html
 * @returns {string}
 */
function paragraphify(html) {
  const BLOCK_CLOSE = /<\/(?:h[1-6]|ul|ol|blockquote|pre)>/gi;
  const BLOCK_OPEN  = /<(?:h[1-6]|ul|ol|blockquote|pre)[^>]*>/i;

  // Split on closing block tags; each segment is: closing-tag + any trailing text
  return html.replace(
    /((?:^|<\/(?:h[1-6]|ul|ol|blockquote|pre)>))([\s\S]*?)(?=<(?:h[1-6]|ul|ol|blockquote|pre)[^>]*>|$)/gi,
    (_match, prefix, content) => {
      // Strip leading/trailing whitespace and stray <br /> from the text run
      const trimmed = content.replace(/^(?:\s|<br \/>)+|(?:\s|<br \/>)+$/g, '');
      if (!trimmed) return prefix;
      // Double <br /> = blank-line paragraph break → </p><p>
      return prefix + '<p>' + trimmed.replace(/<br \/><br \/>/g, '</p><p>') + '</p>';
    }
  );
}

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
      const html = paragraphify(parse(file));
      const element = document.getElementById(id);
      const div = document.createElement("div");
      div.style.textAlign = "justify";
      div.innerHTML = html;
      if (element) element.appendChild(div);
    });
}
