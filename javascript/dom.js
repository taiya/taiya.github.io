// @ts-check

/**
 * Create a link list-item for the publication links row.
 * @param {string} href
 * @param {string} label
 * @returns {HTMLLIElement}
 */
export function make_link(href, label) {
  const li = document.createElement('li');
  li.className = 'publication_link';
  const a = document.createElement('a');
  a.href = href;
  a.target = "New";
  a.textContent = label;
  li.appendChild(a);
  return li;
}
