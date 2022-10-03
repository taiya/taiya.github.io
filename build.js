//--- Executes google analytics
(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-49430345-2', 'auto');
ga('send', 'pageview');

function markdown2html(file, id) {
  var reader = new commonmark.Parser();
  var writer = new commonmark.HtmlRenderer();
  var parsed = reader.parse(file);
  var html = writer.render(parsed);
  var element = document.getElementById(id);
  var div = document.createElement("div");
  div.style = "text-align:justify";
  div.innerHTML = html;
  element.appendChild(div)
  // alert(html) //< causes popup showing generated html
}

function make_students_callback(myjson) {
  // console.log(JSON.stringify(myjson, null, 2)); //< show file on debug console
  var people = myjson["current"];

  // var imax = (news_showall==true) ? mynews.length : news_max_items;  
  var students_list = document.getElementById('students_list');
  for (var i = 0; i < people.length; i++) {
    var person = people[i];
    // console.log(person);
    var person_li = document.createElement('li');
    person_li.innerHTML = "<a href='" + person["homepage"] + "'>" + person["name"] + "</a>" +
      " – " + person["degree"] + " @ " + person["currently"]
    if (!(person["coadvisors"] === undefined)){
      person_li.innerHTML += " – co-advised with: " + person["coadvisors"];
    }
    students_list.appendChild(person_li);
  }
}
function make_students() {
  jQuery.getJSON("/people.json", make_students_callback)
    .fail(function () { console.error("file not found / JSON syntax incorrect"); });
}

function make_alumni_callback(myjson) {
  // console.log(JSON.stringify(myjson, null, 2)); //< show file on debug console
  var people = myjson["alumni"];

  // var imax = (news_showall==true) ? mynews.length : news_max_items;  
  var alumni_list = document.getElementById('alumni_list');
  for (var i = 0; i < people.length; i++) {
    var person = people[i];
    var person_li = document.createElement('li');
    person_li.innerHTML = "<a href='" + person["homepage"] + "'>" + person["name"] + "</a>" +
      " – " + person["degree"] + " (" + person["time"] + ") " +
      "co-advised with: " + person["coadvisors"] +
      " – currently " + person["currently"];
    alumni_list.appendChild(person_li);
  }
}
function make_alumni() {
  jQuery.getJSON("/people.json", make_alumni_callback)
    .fail(function () { console.error("file not found / JSON syntax incorrect"); });
}

function make_footer() {
  var text = document.createElement('span');
  var dt = new Date();
  text.innerHTML = "Copyright " + dt.getFullYear() + " – Andrea Tagliasacchi";
  document.getElementById("footer").appendChild(text);
}

//Check if file exists
function IfUrlExists(url, callback) {
  var http = new XMLHttpRequest();
  http.open('HEAD', url, true);
  http.onreadystatechange = function (event) {
    if (http.status != 404) {
      callback();
    }
  };
  http.send();
}

function make_pub(entry) {
  // Ensure this author is required (specify somewhere `var filter_for_author = "Tagliasacchi"`)
  // console.log( entry["author"] + pAuthor + entry["author"].indexOf(pAuthor) );
  // if( entry["author"].indexOf(filter_for_author) == -1 )
  // return;

  var pub = document.createElement('div');
  pub.className = 'publication';
  document.getElementById('pubs_list').appendChild(pub);

  var pub_content = document.createElement('div');
  pub_content.className = 'publication_content';
  pub.appendChild(pub_content);

  var pub_info = document.createElement('div');
  pub_info.className = 'publication_information';

  // Image
  var image = document.createElement('div');
  image.className = 'publication_image';
  var img = document.createElement('img');

  // TODO: video icon
  // <video width="100%" playsinline="" autoplay="" loop="" preload="" muted="">
  //   <source src="ndfs/thumbnail.mp4" type="video/mp4">
  // </video>

  // --- add icon
  icon = entry["icon"];
  if (icon == undefined)
    icon = "/images/placeholder.jpg"
  img.setAttribute('src', icon)
  img.setAttribute('height', '100%');
  image.appendChild(img);
  pub_content.appendChild(image);
  pub_content.appendChild(pub_info);

  // --- Title + Special
  var title = document.createElement('div');
  title.className = 'publication_title';
  special = entry["special"];
  if (special != undefined)
    title.innerHTML = entry['title'] + ' &mdash; <reddish>' + special;
  else
    title.innerHTML = entry['title'];
  pub_info.appendChild(title);

  // Authors
  var authors = document.createElement('div');
  authors.className = 'publication_authors';
  authors.innerHTML = entry["authors"].toString().replace(/,/g, ", ");
  pub_info.appendChild(authors);

  // Venue
  var venue = document.createElement('div');
  venue.className = 'publication_venue';
  // either use the journal or the booktitle field
  if (entry["journal"] != undefined) {
    venue.innerHTML = entry["journal"];
  } else {
    venue.innerHTML = entry["booktitle"];
  }
  pub_info.appendChild(venue);

  // Links
  var links = document.createElement('ul');
  links.className = 'publication_links';
  pub_info.appendChild(links);
  {

    // PDF
    if (entry["pdf"] != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = entry["pdf"];
      a.target = "New"
      a.innerHTML = "pdf"
      li.appendChild(a);
      links.insertBefore(li, links.firstChild);
    }

    // arXiv
    if (entry["arxiv"] != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = entry["arxiv"];
      a.target = "New"
      a.innerHTML = "arxiv"
      li.appendChild(a);
      links.appendChild(li);
    }

    // --- Bibtex
    blacklist = ["key", "special", "source", "slides", "video", "datasets", "pdf", "homepage", "icon", "type"];
    var bibtex_text = "@" + entry['type'] + "{" + entry['key'];
    for (var tag_name in entry) {
      if (entry.hasOwnProperty(tag_name) && !blacklist.includes(tag_name)) {
        value = entry[tag_name]
        if (tag_name == "authors")
          value = value.toString().replace(/,/g, " and ");
        bibtex_text += ",\n  " + tag_name + "={" + value + "}";
      }
    }
    bibtex_text += "\n}";
    bibtex_area = document.createElement('pre');
    bibtex_area.className = 'publication_bibtex';
    var bibtex_text_box = document.createElement('p');
    bibtex_text_box.className = 'publication_text_box';
    bibtex_text_box.innerText = bibtex_text;
    bibtex_area.appendChild(bibtex_text_box);
    pub.appendChild(bibtex_area);

    li = document.createElement('li');
    li.className = 'publication_link';
    a = document.createElement('a');
    a.onclick = (function (bibtex_area) {
      var open = false;

      return function () {
        if (open) {
          bibtex_area.style.maxHeight = "0em";
          bibtex_area.style.overflowX = "hidden";
        } else {
          bibtex_area.style.maxHeight = "30em";
          bibtex_area.style.overflowX = "auto";
        }
        open = !open;
      };
    })(bibtex_area);

    a.target = "New";
    a.innerHTML = "bibtex";
    li.appendChild(a);
    links.appendChild(li);

    // Video
    link = entry["video"];
    if (link != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = link;
      a.target = "New"
      a.innerHTML = "youtube"
      li.appendChild(a);
      links.appendChild(li);
    }

    // Slides (PDF)
    link = entry["slides"];
    if (link != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = link;
      a.target = "New"
      a.innerHTML = "slides"
      li.appendChild(a);
      links.appendChild(li);
    }

    // Source Code
    link = entry["source"];
    if (link != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = link
      a.target = "New"
      a.innerHTML = "source"
      li.appendChild(a);
      links.appendChild(li);
    }

    // Datasets
    link = entry["datasets"];
    if (link != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = link
      a.target = "New"
      a.innerHTML = "dataset"
      li.appendChild(a);
      links.appendChild(li);
    }

    // Homepage
    link = entry["homepage"];
    if (link != undefined) {
      li = document.createElement('li');
      li.className = 'publication_link';
      a = document.createElement('a');
      a.href = link;
      a.target = "New"
      a.innerHTML = "homepage"
      li.appendChild(a);
      links.appendChild(li);
    }
  }
}

// --- TODO: replace the expansion area w/ copy/paste
// function copy_bibtex(bibtex) {
//   navigator.clipboard.writeText(bibtex)
//     .then(() => alert('Successfully copied Bibtex'));
// } 

function make_pubs_callback(pubs) {
  for (var i = 0; i < pubs.length; i++) {
    make_pub(pubs[i])
  }
}

function make_publications() {
  //--- Download the bibfile
  jQuery.get("/pubs.json", make_pubs_callback);
}
