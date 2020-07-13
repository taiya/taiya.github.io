//Check if file exists
function IfUrlExists(url, callback)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, true);
	http.onreadystatechange = function(event) {
		if (http.status != 404) {
			callback();
		}
	};
    http.send();
}

function make_pub(key,tags,type) {
    // Ensure this author is required
    // console.log( tags["author"] + pAuthor + tags["author"].indexOf(pAuthor) );
    if( tags["author"].indexOf(filter_for_author) == -1 )
        return;

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
    var img=document.createElement('img');
    var basepath = '/pubs/'+tags['year']+'/'+key;
    // console.log(basepath);

	imgpath = basepath + '/icon.jpg';
    IfUrlExists(imgpath, (function(img, imgpath) { return function() {
		img.setAttribute('src', imgpath);
	};})(img, imgpath));

	imgpath = basepath + '/icon.jpeg';
    IfUrlExists(imgpath, (function(img, imgpath) { return function() {
		img.setAttribute('src', imgpath);
	};})(img, imgpath));

	imgpath = basepath + '/icon.png';
    IfUrlExists(imgpath, (function(img, imgpath) { return function() {
		img.setAttribute('src', imgpath);
	};})(img, imgpath));

	imgpath = '/pubs/placeholder.jpg';
    img.setAttribute('src', imgpath);
    img.setAttribute('width','128px');
    image.appendChild(img);
    pub_content.appendChild(image);
	pub_content.appendChild(pub_info);

    // Title + Special
    var title = document.createElement('p');
    title.className = 'publication_title';
    special = tags["special"];
    if(special != undefined)
        title.innerHTML = tags['title'] + ' &mdash; <reddish>' + special;
    else
        title.innerHTML = tags['title'];
    pub_info.appendChild(title);

    // Authors
    var authors = document.createElement('p');
    authors.className = 'publication_authors';
    authors.innerHTML = tags["author"];
    pub_info.appendChild(authors);

    // Venue
    var venue = document.createElement('p');
    venue.className = 'publication_venue';
    // either use the journal or the booktitle field
    if(tags["journal"] != undefined){
	venue.innerHTML = tags["journal"];
    } else {
	venue.innerHTML = tags["booktitle"];
    }
    pub_info.appendChild(venue);

    // Links
    var links = document.createElement('ul');
    links.className = 'publication_links';
    pub_info.appendChild(links);
    {

        // PDF
		li = document.createElement('li');
		li.className = 'publication_link';
        a = document.createElement('a');
        local_link = basepath+'/paper.pdf';
    	// Make it only when it is there
    	IfUrlExists(local_link, (function(li, a, local_link) {return function() {
            a.href = local_link;
    	    a.target = "New"
    	    a.innerHTML = "PDF"
			li.appendChild(a);
    	    links.insertBefore(li, links.firstChild);
        };})(li, a, local_link));

        // Allow external PDF links
		li = document.createElement('li');
		li.className = 'publication_link';
        a = document.createElement('a');
        jQuery.get(basepath+'/paper.url', (function(li, a) {return function(url) {
            a.href = url;
    	    a.target = "New"
    	    a.innerHTML = "PDF"
			li.appendChild(a);
    	    links.insertBefore(li, links.firstChild);
        };})(li, a));

		blacklist = ["special", "source", "slides", "video", "datasets"];

		var bibtex_text = "@" + type + "{" + key;
		for (var tag_name in tags) {
			if (tags.hasOwnProperty(tag_name) && !blacklist.includes(tag_name)) {
				bibtex_text += ",\n  " + tag_name + "={" + tags[tag_name] + "}";
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
		a.onclick = (function(bibtex_area) {
			var open = false;

			return function() {
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
	    a.innerHTML = "BibTex";
		li.appendChild(a);
    	links.appendChild(li);

        // Video
        link = tags["video"];
        if(link != undefined){
			li = document.createElement('li');
			li.className = 'publication_link';
            a = document.createElement('a');
            a.href = link;
            a.target = "New"
            a.innerHTML = "Video"
            li.appendChild(a);
			links.appendChild(li);
        }

        // Slides (PDF)
        link = tags["slides"];
        if(link != undefined){
            li = document.createElement('li');
			li.className = 'publication_link';
			a = document.createElement('a');
            a.href = link;
            a.target = "New"
            a.innerHTML = "Slides"
            li.appendChild(a);
			links.appendChild(li);
        }

        // Source Code
        link = tags["source"];
        if(link != undefined){
            li = document.createElement('li');
			li.className = 'publication_link';
			a = document.createElement('a');
            a.href = link
            a.target = "New"
            a.innerHTML = "Code"
            li.appendChild(a);
			links.appendChild(li);
        }

        // Datasets
        link = tags["datasets"];
        if(link != undefined){
            li = document.createElement('li');
			li.className = 'publication_link';
			a = document.createElement('a');
            a.href = link
            a.target = "New"
            a.innerHTML = "Datasets"
            li.appendChild(a);
			links.appendChild(li);
        }

        // Homepage
        link = tags["homepage"];
        if(link != undefined){
            li = document.createElement('li');
			li.className = 'publication_link';
			a = document.createElement('a');
            a.href = link;
            a.target = "New"
            a.innerHTML = "Project Page"
            li.appendChild(a);
			links.appendChild(li);
        }
    }
}

function make_pubs_callback(bibfile){
    // console.log("here");

    //--- Parse bib file to a JSON
    myjson = bibtexParse.toJSON(bibfile);
    // console.log(JSON.stringify(myjson, null, 2));

    //--- Build the publication entries
    for (var i = 0; i < myjson.length; i++){
        var pub = myjson[i];
        var key = pub["citationKey"];
        var tags = pub["entryTags"];
		var type = pub["entryType"];
        make_pub(key,tags,type)
    }
}

function make_pubs(){
    //--- Download the bibfile
    jQuery.get("/pubs/bibtex.bib", make_pubs_callback);
}
