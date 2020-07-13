//--- Executes google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-49430345-2', 'auto');
ga('send', 'pageview');
// console.log("Google Analytics");


// Alternative to using include.js with:
// <div include="/common/menu.html"></div>
function make_menu(){
    document.write('<div id="menu">');
    document.write('<menu_title>Visual Computing @ UVic</menu_title>');    
    document.write('<ol>');
    document.write('  <li><a href="/"> Home </a></li>');
    document.write('  <li><a href="/people"> People </a></li>');
    document.write('  <li><a href="/pubs"> Publications </a></li>');
    // document.write('  <li><a href="/datasets/datasets.md"> Dataset </a></li>');
    document.write('  <li><a href="/teaching"> Teaching </a></li>');
    document.write('  <li><a href="/apply.md"> Join US!</a></li>');
    document.write('</ol>');
    document.write('</div>');
}

function make_hyperlink(url){
    var a = document.createElement('a');
    var linkText = document.createTextNode(url);
    a.appendChild(linkText);
    a.setAttribute('target', '_blank');
    a.href = url;
    return a;
}

function make_mailto(email){
    var text = document.createTextNode(email);
    var a = document.createElement("a");
    a.setAttribute('href', 'mailto:'+text.data);
    a.appendChild(text);
    return a;
}

function make_ul_li(text){
    var li = document.createElement("li");
    var text = document.createTextNode(text);
    li.appendChild(text);
    return li;
}

function toggleDetails (id) {
  var element = document.getElementById(id);
	if(element.style.display=='block')
        element.style.display = 'none';
	else
        element.style.display = 'block';
}
