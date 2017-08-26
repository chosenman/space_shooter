
// self invocing function starts


// taking dimensions of the window
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    window_x = w.innerWidth || e.clientWidth || g.clientWidth,
    window_y = w.innerHeight|| e.clientHeight|| g.clientHeight;

var spaceship   = document.querySelector('#spaceship');
var movezone = document.querySelector('#movezone');
var output = document.querySelector('#output');
var pageone = document.querySelector('#pageone');

    pageone.style.width = window_x+'px';
    movezone.style.width = window_x-10+"px";
    // spaceship.style.left = window_x/2+"px";

var maxX = movezone.clientHeight - spaceship.clientWidth;
var maxY = movezone.clientHeight - spaceship.clientWidth;

var topFire, leftFire;
function handleOrientation(event) {
    var x = event.beta;  // In degree in the range [-180,180]
    var y = event.gamma * 3; // In degree in the range [-90,90]

    // output.innerHTML  = "beta : " + x + "\n";
    // output.innerHTML += "gamma: " + y + "\n";



    // Because we don't want to have the device upside down
    // We constrain the x value to the range [-90,90]
    // if (x >  90) { x =  90};
    // if (x < -90) { x = -90};


    // To make computation easier we shift the range of
    // x and y to [0,180]
    // x += 90;
    y += 90;

    // 30 is half the size of the spaceship
    // -90 = 0      => -90/2 + 45 = 0
    // 0 = 45       =>  x + 45  = 45
    // 90 = 90      =>  90/2  + 45 = 90
    // It center the positioning point to the center of the spaceship
    var top = Math.abs(x/2 + 45); //
    // var top =  ( Math.abs(maxY*x/180) - 30 ); //
    var left = (Math.abs(maxX*y/180) - 30 );
    if(top < 0 || left < 0) {
        top = Math.abs(top);
        left = Math.abs(left);
    }

    if (top > 90) { top = 90};
    if (left > (window_x - 30) )  { left = window_x - 40};
    // output.innerHTML += "top: " + top + "\n";
    topFire = top;
    leftFire = left;

    // output.innerHTML += "top: " + top + "\n";
    // output.innerHTML += "left: " + left + "\n";

    spaceship.style.top  = top + "px";
    spaceship.style.left = left + "px";
}

window.addEventListener('deviceorientation', handleOrientation);


// Touch stuff:
var fire   = document.querySelector('#fire');

fire.addEventListener('touchstart', function() {
    var seconds = new Date().getTime();
    var seconds_d = Math.floor(seconds);
    leftFire = leftFire + 30;
    topFire = window_y - (150 - topFire);
    var bullet = `
           <div id="bullet${seconds_d}">
           <svg width="${window_x}" height="${window_y}" 
           style="position:absolute; top:0;left:0">
           <circle id="orange-circle${seconds_d}" r="5" cx="${leftFire}" cy="${topFire}" fill="orange" />
           <animate 
           xlink:href="#orange-circle${seconds_d}"
           attributeName="cy"
           from="${topFire}"
           to="-20" 
           dur="2s"
           begin="0s"
           repeatCount="1"
           fill="freeze" 
           id="circ-anim"/>
           </div>
        `
    // the user touched the screen!
    $('body').prepend(bullet);
    setTimeout(function () {
        var element = document.getElementById(`bullet${seconds_d}`);
        element.outerHTML = "";
        delete element;
    },2000)

});


$( document ).ready(function() {
    $("#fire").on("tap",function(){



        // $('.outputTouched').prepend("  - ")
        // $('body').prepend(bullet)
    });
});


// self invocing function ends
