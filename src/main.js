// @ts-check

import { render_markdown } from './markdown.js';
import { make_students, make_alumni } from './people.js';
import { make_publications } from './pubs.js';
import { init_search } from './search.js';

function make_footer() {
  const text = document.createElement('span');
  const dt = new Date();
  text.textContent = "Copyright " + dt.getFullYear() + " \u2013 Andrea Tagliasacchi";
  const footer = document.getElementById("footer");
  if (footer) footer.appendChild(text);
}

document.addEventListener('DOMContentLoaded', function() {
  render_markdown("/data/1_biography.md", "biography");
  render_markdown("/data/2_contacts.md",  "contacts");
  render_markdown("/data/3_hiring.md",    "hiring");
  render_markdown("/data/4_news.md",      "news");
  render_markdown("/data/5_service.md",   "service");
  make_students();
  make_alumni();
  init_search();
  make_publications();
  make_footer();
});
