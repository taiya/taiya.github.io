function make_service_callback(myjson){
    // console.log( "make_service_callback" )
    // console.log(JSON.stringify(myjson, null, 2)); //< show file on debug console
    var list = myjson["service"];    
    var html_list = document.getElementById('service_list');
    for (var i = 0; i < list.length; i++){
        var item = list[i]; // console.log(item);
    	if(item["author"] == filter_for_author){
    	    var news = document.createElement('li');
    	    news.innerHTML = item["role"] + " &#8210; " + item["venue"];
    	    html_list.appendChild(news);
        }
    }
}

function make_service(){
    // console.log(window.location.pathname);
    jQuery.getJSON(window.location.pathname+"db_service.json", make_service_callback)
        .fail(function(){console.error("file not found / JSON syntax incorrect");}); 
}

