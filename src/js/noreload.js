// SETTINGS
//you can create your own animations, name is the classname and duration is the time it takes for the animation to fully hide the page
var noreload_animations = [{name: 'fade', duration: 0.5},
                            {name: 'left-right', duration: 0.9},
                            {name: 'top-bottom', duration: 0.9},
                            {name: 'left-bottom', duration: 1}
                            ];
// set animation, if left empty you it will ure a random one every time
//example: var animation = 0;
var noreload_set_animation;

//REQUIREMENTS
/*
//you'll want to load the script and stylesheet once per page reload, this PHP code makes sure the script doesn't load these twice
if (!isset($_POST['src'])||$_POST['src']!='noreload') {
    echo '<script src="js/noreload.js"></script>
    <link rel="stylesheet" href="css/noreload.css">';
    //the container also needs to be added to insert the elements into
    echo '<div class="noreload_container">';
}
//place the code to display different items like the nav bar and the page
if (!isset($_POST['src'])||$_POST['src']!='noreload') {
//now we close the div
echo '</div>';
}
 */
//other than that i've tried my best to make everything as easy for you as including these files and thats it


// setup
var noreload_lastAnimation = noreload_animations[(noreload_set_animation!=undefined)?noreload_set_animation:Math.floor(Math.random() * noreload_animations.length)];

var noreload_cover;
var noreload_xhttp = new XMLHttpRequest();
// setting listeners on <a> tags
function noreload_setListeners() {
    var currentHref = window.location.href;
    var n2 = currentHref.indexOf('#');
    currentHref = n2 != -1 ? currentHref.substr(0, n2) : currentHref;
    var hrefs = document.getElementsByTagName('a');
    for (var i = 0; i < hrefs.length; i++) {
        var href = hrefs[i];
        var n1 = href.href.indexOf('#');
        var hrefW = n1 != -1 ? href.href.substr(0, n1) : href.href;
        if ((hrefW != currentHref && hrefW.indexOf(document.location.origin) !== -1)||(hrefW == currentHref&&href.href.indexOf('#') == -1)) {
            href.onclick = function (e) {
                e.preventDefault();
                noreload_loadPage(e.target.href);
                return false;
            };
        }
    }
}
// using animation to block view of page while loading
function noreload_loadPage(url) {
    //select animation
    var currentAnimation = noreload_animations[(noreload_set_animation!=undefined)?noreload_set_animation:Math.floor(Math.random() * noreload_animations.length)];
    //setting values to decide wether the side loaded before the animation
    var loadingOver = 0;
    var timeoutOver = 0;
    //removing old classes and animations
    noreload_cover.classList.remove('loaded');
    noreload_cover.classList.remove(noreload_lastAnimation.name);
    //adding new animation and start loading
    noreload_cover.classList.add(currentAnimation.name);
    noreload_cover.classList.add('loading');
    //set last animation for it to be removed next
    noreload_lastAnimation = currentAnimation;
    //changing url for sharing, reloading etc.
    history.replaceState(null, null, url);
    noreload_xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //check if animation is over and if so load the new page
            if (timeoutOver) {
                noreload_loaded(this.responseText);
            }
            //letting the script know it's done loading
            loadingOver = 1;
        } else if (this.readyState == 4) {
            //if loading failed redirect to the page to the page to show the appropriate message
            window.location.href = url;
        }
    };
    //sending a request with a post to let any script know it's the noreload engine
    noreload_xhttp.open("POST", url, true);
    noreload_xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    noreload_xhttp.send("src=noreload");
    //setting the timeout
    setTimeout(function () {
        //if loading is done before the animation load it in
        if (loadingOver) {
            noreload_loaded(noreload_xhttp.responseText);
        }
        //let the script know the timeout is finished
        timeoutOver = 1;
    }, currentAnimation.duration*1000);
}
//load data and set animations
function noreload_loaded(data) {
    //remove logs from old pages
    console.clear();
    //get data to activate scripts
    var parser = new DOMParser();
    var dataDoms = parser.parseFromString(data, "text/html");
    var elements = dataDoms.body.getElementsByTagName('script');
    //remove old page
    while (document.getElementsByClassName('noreload_container')[0].firstChild) document.getElementsByClassName('noreload_container')[0].removeChild(document.getElementsByClassName('noreload_container')[0].firstChild);
    while (document.getElementsByClassName('noreload_item')[0]) document.getElementsByClassName('noreload_item')[0].parentNode.removeChild(document.getElementsByClassName('noreload_item')[0]);
    //add new page
    document.getElementsByClassName('noreload_container')[0].innerHTML = data;
    //add both scripts
    noreload_placetags(elements);
    //run eventlisteners over the new page
    noreload_setListeners();
    // since the page has loaded remove loading and launch loaded animation
    noreload_cover.classList.remove('loading');
    noreload_cover.classList.add('loaded');
}
//function to take the element strings, turn them into elements and append them to the head
function noreload_placetags(elements) {
    //run over every element
    for (var i = 0; i < elements.length; i++) {
        var head = document.head;
        //create corresponding element
        var script = document.createElement(elements[i].tagName.toLowerCase());
        //get all valid attributes and parse them to the newly created element
        for (var att, j = 0, atts = elements[i].attributes, n = atts.length; j < n; j++) {
            att = atts[j];
            script[att.nodeName] = att.nodeValue;
        }
        script.innerHTML = elements[i].innerHTML;
        //add class to later remove these
        script.classList.add('noreload_item');
        // append them to the head
        head.appendChild(script);
    }
}
//add the cover and set the listeners to the <a> tags
window.addEventListener('load', function (ev) {
    noreload_cover = document.getElementsByClassName('noreload_cover')[0];
    if (noreload_cover==undefined){
        noreload_cover = document.createElement('div');
        document.body.appendChild(noreload_cover);
    }
    noreload_cover.classList.add('noreload_cover');
    noreload_cover.classList.add(noreload_lastAnimation.name);
    noreload_cover.classList.add('loaded');
    noreload_setListeners();
});
