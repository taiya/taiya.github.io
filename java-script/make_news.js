// How many news items to show by default?
var news_max_items = 6;     

function more_news(){
    console.log("more news");
    
    // Reveal hidden item
    var news_list = document.getElementById('news_list');
    var news = news_list.children;
    for (var i=0; i<news.length; i++)
        news[i].style.display='block';
    
    // Hide the "more..." item
    var more_news_item = document.getElementById('more_news_item');
    more_news_item.style.display='none';
}

function make_news_callback(myjson){
    // console.log(JSON.stringify(myjson, null, 2)); //< show file on debug console
    var mynews = myjson["news"];
    var news_showall = false;

    // var imax = (news_showall==true) ? mynews.length : news_max_items;  
    var news_list = document.getElementById('news_list');  
    for (var i = 0; i < mynews.length; i++){
        var item = mynews[i]; // console.log(item);
    	if(item["author"] == filter_for_author){
    	    var news = document.createElement('li');
    	    news.innerHTML = item["date"] + ": " + item["body"];
            if(i>=news_max_items) news.style.display='none';
    	    news_list.appendChild(news);
    	}
    }
    
    // Create the more item
    // TODO: blue hyperlink?
    var more = document.createElement('li');
    more.id = 'more_news_item';
    more.innerHTML = "[CLICK HERE FOR MORE...]";
    more.setAttribute("onclick", "more_news()");
    document.getElementById('news_list').appendChild(more);
}

function make_news(){
    jQuery.getJSON("/news.json", make_news_callback)
        .fail(function(){console.error("file not found / JSON syntax incorrect");});
}

