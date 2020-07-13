function make_people_alumni(item){
    var ul_item = make_ul_li( item["name"] );
    ul_item.innerHTML += " &mdash; ";
    ul_item.innerHTML += item.role + " ";
    ul_item.innerHTML += "supervised by ";
    var supers = item["supervisors"];
    for (var supid=0; supid<supers.length; supid++){
        ul_item.innerHTML += supers[supid];
        ul_item.innerHTML += (((supid+1)<supers.length)?", ":"");
    }
    if(item.hasOwnProperty("currently")){
        ul_item.innerHTML += " &mdash; ";
        ul_item.innerHTML += "now at " + item["currently"];
    }
    document.getElementById('people_list_alumni').appendChild(ul_item);
}

function make_people_active(item){
    var div = document.createElement('div');
    div.className = 'people';
    {
        var people_image = document.createElement('div');
        {
            people_image.className = 'people_image';
            var img = document.createElement('img');
            img.src="snaps/placeholder.jpg";
            if(item.hasOwnProperty("image"))
                img.src=item["image"];
            img.setAttribute("width","100%");
            img.setAttribute("height","100%");
            people_image.appendChild(img);
        }
        div.appendChild(people_image);

        var people_info = document.createElement('div');
        {
            people_info.className="people_info";
            var people_name = document.createElement('div');
            people_name.className = "people_name";
            people_name.innerHTML = item["name"];
            if(item.hasOwnProperty("title"))
                people_name.innerHTML += " &mdash; "+item["title"];
            people_info.appendChild(people_name);

            var ul = document.createElement('ul');
            {
                if(item.hasOwnProperty("supervisors")){
                    var home_li = make_ul_li("Supervisors: ");
                    var supers = item["supervisors"];
                    for (var supid=0; supid<supers.length; supid++){
                        home_li.innerHTML += supers[supid];
                        home_li.innerHTML += (((supid+1)<supers.length)?", ":"");
                    }
                    ul.appendChild( home_li );
                }
                ul.appendChild( make_ul_li("Interests: " + item["research"]) );
                if(item.hasOwnProperty("office"))
                    ul.appendChild( make_ul_li("Office: " + item["office"]) );
                if(item.hasOwnProperty("affiliation"))
                    ul.appendChild( make_ul_li("Affiliation: " + item["affiliation"]) );
                {
                    var email_li = make_ul_li("Contacts: ");
                    email_li.appendChild( make_mailto(item["email"]) );
                    if(item.hasOwnProperty("telephone"))
                    {
                        email_li.innerHTML += " &mdash; ";
                        email_li.innerHTML += item["telephone"];
                    }
                    ul.appendChild(email_li);
                }
                if(item.hasOwnProperty("homepage")){
                    var homepage_li = make_ul_li("Homepage: ");
                    homepage_li.appendChild( make_hyperlink(item["homepage"]) );
                    ul.appendChild(homepage_li);
                }
            }
            people_info.appendChild(ul);
        }
        div.appendChild(people_info);
    }
    // console.log(div);
    /// Add entry to the rigth section
    document.getElementById('people_list_'+item.type).appendChild(div);
}

function make_people_callback(myjson){
    // console.log("make_people_callback")
    // console.log(JSON.stringify(myjson, null, 2)); //< show file on debug

    var list = myjson["people"];
    for (var i = 0; i < list.length; i++){
        var item = list[i];
        if( item.type == "alumni")
            make_people_alumni(item);
        else
            make_people_active(item);
    }
}

function make_people(){
    // console.log(window.location.pathname);
    jQuery.getJSON(window.location.pathname+"db_people.json", make_people_callback)
        .fail(function(){console.error("file not found / JSON syntax incorrect");});
}
