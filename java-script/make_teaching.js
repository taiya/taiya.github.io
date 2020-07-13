function make_hyperlink(title,url){
    var a = document.createElement('a');
    var linkText = document.createTextNode(title);
    a.appendChild(linkText);
    a.setAttribute('target', '_blank');
    a.href = url;
    return a;
}

function make_teaching_callback(myjson){
    // console.log( "make_teaching_callback" )
    // console.log(JSON.stringify(myjson, null, 2)); //< show file on debug console
    var list = myjson["teaching"];
    var hlist = document.getElementById('teaching_list');
    for (var i = 0; i < list.length; i++){
        var item = list[i]; // console.log(item);
    	var hitem = document.createElement('li');
    	hitem.innerHTML = item["term"] + " &#8210; " + item["id"] + " &#8210; " + item["course"] + " &#8210; ";

        // Add links
        hitem.innerHTML += "(";
        hitem.appendChild( make_hyperlink("homepage", item["homepage"]) );
        hitem.innerHTML += ", "
        hitem.appendChild( make_hyperlink("syllabus", item["syllabus"]) );
        hitem.innerHTML += ", "
        hitem.appendChild( make_hyperlink("calendar", item["calendar"]) );
        hitem.innerHTML += ")";
                
    	hlist.appendChild(hitem);
    }
}

function make_teaching(){
    jQuery.getJSON(window.location.pathname+"db_teaching.json", make_teaching_callback)
        .fail(function(){console.error("file not found / JSON syntax incorrect");}); 
}

