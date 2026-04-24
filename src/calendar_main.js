// @ts-check

function make_footer() {
  const text = document.createElement('span');
  const dt = new Date();
  text.textContent = "Copyright " + dt.getFullYear() + " \u2013 Andrea Tagliasacchi";
  const footer = document.getElementById("footer");
  if (footer) footer.appendChild(text);
}

document.addEventListener('DOMContentLoaded', make_footer);
