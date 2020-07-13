function make_layout(){
    //-- Attaches this line at the end of the document
    var space = document.createElement('div');
    space.id = "newline_10"
    var text = document.createElement('div');
    text.id = "footer"
    var dt = new Date()
    text.innerHTML = "Visual Computing | UVic | " + dt.getFullYear()
    document.getElementById('container').appendChild(space);
    document.getElementById('container').appendChild(text);
    // console.log(document.getElementById('container'));
    // console.log("HERE");
}
