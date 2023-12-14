var opts = { // https://bernii.github.io/gauge.js/
    angle: 0, // The span of the gauge arc
    lineWidth: 0.31, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
      length: 0.54, // // Relative to gauge radius
      strokeWidth: 0.088, // The thickness
      color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    
  };
window.onload = init;
var gauge
var textValue
var polygon
function init() {
    var target = document.getElementById('bar'); // your canvas element
    polygon = document.getElementById('polygon');
    textValue = document.getElementById('value-text');
    gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
    gauge.maxValue = 5; // set max gauge value
    gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
    gauge.animationSpeed = 32; // set animation speed (32 is default value)
    gauge.set(5); // set actual value
}

//const intervalID = setInterval(myCallback, 100);

function myCallback() {
  // Your code here
  
  if (socket != null) {
    socket.send(0);
    socket.send(1);
    socket.send(2);
    socket.send(3);
    socket.send(4);
    socket.send(5);
  }
}

const intervalID = setInterval(polygonupdate, 100);

// x,y
var array1 = ['0,-100', '100,-100', '100,-100', '50,70', '40,50', '0,-100'];
function polygonupdate() {
    if (array1.length > 99) {
    //    array1.shift()
    }
    //array1.push(lastValue * 100)
    var str = ""
    for (let i = array1.length; i < array1.length + 99; i++) {
        str = str + i + "," + 0 + " "
    } 
    for (let i = 0; i < array1.length; i++) {
        str = str + i + "," + lastValue * 100 + " "
    } 
    
    polygon.setAttribute("points", array1);
}

// Create WebSocket connection.
const socket = new WebSocket("ws://esp32.local:81");

// Connection opened
socket.addEventListener("open", (event) => {
  socket.send("0");
});

var dict = {
    'addrup' : '0',
    'addrdown' : '1',
    'MSB' : '2',
    'LSB' : '3',
    'graphon' : '4',
    'graphoff' : '5'
};

var lastValue = 0
// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
  var value = dict[event.data]
  gauge.set(value); // set actual value
  textValue.innerHTML = value
  lastValue = value
});
