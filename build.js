function markdown2html(file, id) {
  const reader = new commonmark.Parser();
  const writer = new commonmark.HtmlRenderer();
  const parsed = reader.parse(file);
  const html = writer.render(parsed);
  const element = document.getElementById(id);
  const div = document.createElement("div");
  div.style = "text-align:justify";
  div.innerHTML = html;
  element.appendChild(div);
}

function make_students_callback(myjson) {
  const people = myjson["current"];
  const students_list = document.getElementById('students_list');
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const person_li = document.createElement('li');
    const link = document.createElement('a');
    link.href = person["homepage"];
    link.textContent = person["name"];
    person_li.appendChild(link);
    person_li.appendChild(document.createTextNode(
      " \u2013 " + person["degree"] + " @ " + person["currently"]
    ));
    if (person["coadvisors"] !== undefined) {
      person_li.appendChild(document.createTextNode(" \u2013 co-advised with: " + person["coadvisors"]));
    }
    students_list.appendChild(person_li);
  }
}
function make_students() {
  fetch("/data/people.json")
    .then(function(r) { return r.json(); })
    .then(make_students_callback)
    .catch(function() { console.error("people.json: file not found / JSON syntax incorrect"); });
}

function make_alumni_callback(myjson) {
  const people = myjson["alumni"];
  const alumni_list = document.getElementById('alumni_list');
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const person_li = document.createElement('li');
    const link = document.createElement('a');
    link.href = person["homepage"];
    link.textContent = person["name"];
    person_li.appendChild(link);
    person_li.appendChild(document.createTextNode(
      " \u2013 " + person["degree"] + " (" + person["time"] + ") " +
      "co-advised with: " + person["coadvisors"] +
      " \u2013 currently " + person["currently"]
    ));
    alumni_list.appendChild(person_li);
  }
}
function make_alumni() {
  fetch("/data/people.json")
    .then(function(r) { return r.json(); })
    .then(make_alumni_callback)
    .catch(function() { console.error("people.json: file not found / JSON syntax incorrect"); });
}

function make_footer() {
  const text = document.createElement('span');
  const dt = new Date();
  text.textContent = "Copyright " + dt.getFullYear() + " \u2013 Andrea Tagliasacchi";
  document.getElementById("footer").appendChild(text);
}

function make_link(href, label) {
  const li = document.createElement('li');
  li.className = 'publication_link';
  const a = document.createElement('a');
  a.href = href;
  a.target = "New";
  a.textContent = label;
  li.appendChild(a);
  return li;
}

function make_pub(entry) {
  const pub = document.createElement('div');
  pub.setAttribute('id', entry['key']);
  pub.className = 'publication';
  document.getElementById('pubs_list').appendChild(pub);

  const pub_content = document.createElement('div');
  pub_content.className = 'publication_content';
  pub.appendChild(pub_content);

  const pub_info = document.createElement('div');
  pub_info.className = 'publication_information';

  if (entry["icon"] != undefined && entry["icon"].endsWith(".mov")) {
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
        source.src = entry["icon"];
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
    const icon = entry["icon"] == undefined ? "/images/placeholder.jpg" : entry["icon"];
    img.setAttribute('src', icon);
    img.setAttribute('height', '100%');
    img.setAttribute('alt', entry['title']);
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    image.appendChild(img);
    pub_content.appendChild(image);
    pub_content.appendChild(pub_info);
  }

  // Title + Special badge
  const title = document.createElement('div');
  title.className = 'publication_title';
  const special = entry["special"];
  if (special != undefined) {
    title.appendChild(document.createTextNode(entry['title'] + ' \u2014 '));
    const badge = document.createElement('reddish');
    badge.textContent = special;
    title.appendChild(badge);
  } else {
    title.textContent = entry['title'];
  }
  pub_info.appendChild(title);

  // Authors
  const authors = document.createElement('div');
  authors.className = 'publication_authors';
  authors.textContent = entry["authors"].toString().replace(/,/g, ", ");
  pub_info.appendChild(authors);

  // Venue
  if (entry["venue"] != undefined) {
    const venue = document.createElement('div');
    venue.className = 'publication_venue';
    venue.textContent = entry["venue"];
    pub_info.appendChild(venue);
  }

  // Links
  const links = document.createElement('ul');
  links.className = 'publication_links';
  pub_info.appendChild(links);

  if (entry["pdf"] != undefined) {
    links.insertBefore(make_link(entry["pdf"], "pdf"), links.firstChild);
  }
  if (entry["arxiv"] != undefined) {
    links.appendChild(make_link(entry["arxiv"], "arxiv"));
  }

  // Bibtex toggle
  const blacklist = ["key", "special", "source", "slides", "video", "datasets", "pdf", "homepage", "icon", "type", "media"];
  let bibtex_text = "@" + entry['type'] + "{" + entry['key'];
  for (const tag_name in entry) {
    if (entry.hasOwnProperty(tag_name) && !blacklist.includes(tag_name)) {
      let value = entry[tag_name];
      if (tag_name == "authors")
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

  if (entry["video"] != undefined)    links.appendChild(make_link(entry["video"],    "youtube"));
  if (entry["slides"] != undefined)   links.appendChild(make_link(entry["slides"],   "slides"));
  if (entry["source"] != undefined)   links.appendChild(make_link(entry["source"],   "source"));
  if (entry["datasets"] != undefined) links.appendChild(make_link(entry["datasets"], "dataset"));
  if (entry["media"] != undefined)    links.appendChild(make_link(entry["media"],    "media coverage"));
  if (entry["homepage"] != undefined) links.appendChild(make_link(entry["homepage"], "homepage"));
}

function make_pubs_callback(pubs) {
  for (let i = 0; i < pubs.length; i++) {
    if (pubs[i]['type'] != 'patent') {
      make_pub(pubs[i]);
    }
  }
}

function make_publications() {
  fetch("/data/pubs.json")
    .then(function(r) { return r.json(); })
    .then(make_pubs_callback);
}
