var PythonShell = require('python-shell');
var Gpio = require('onoff').Gpio;
var Blynk = require('blynk-library');

var AUTH = '3ea88fab89604e25b354370aad08ce00';

var blynk = new Blynk.Blynk(AUTH, options = {
  connector : new Blynk.TcpClient()
});

var single_feed_b = new blynk.VirtualPin(0);
var portion_control = new blynk.VirtualPin(2);
var num_feeds_slider = new blynk.VirtualPin(3);
var auto_feed_switch = new blynk.VirtualPin(1);
var terminal = new blynk.WidgetTerminal(5);
var next_feed_display = new blynk.WidgetTerminal(4);
var next_feed = 0;
var auto_feed_on = 0;
var time_interval = 343;
var cycles = 1;
var loop = setInterval(timeLoop, 1000);
var time_arr = [];
var two_interval = [6, 18];
var three_interval = [6, 12, 18];
var four_interval = [6, 12, 18, 24];
var demo_interval = [0,5,15,20,25,30,35,40,45,50,55];
var lastFed = 0;
var demo = 0;

single_feed_b.on('write', function(param){
	if(param[0] == '1'){
		triggerFeed();
	}
	
});

portion_control.on('write', function(param) {
	console.log(param[0]);
	// Set cycle count to number from slider
	cycles = param[0];
});

auto_feed_switch.on('write', function(param) {
	// Set boolean variable to the value of the switch
	auto_feed_on = param[0];
	console.log("autofeeding switched to: " + auto_feed_on);
});

num_feeds_slider.on('write', function(param) {
	time_interval = param[0];	
	
	switch(time_interval) {
		case "1":
			time_arr = demo_interval;
			demo = 1;
			break;
		case "2":
			time_arr = two_interval;
			demo = 0;
			break;
		case "3":
			time_arr = three_interval;
			demo = 0;
			break;
		case "4":
			time_arr = four_interval;
			demo = 0;
			break;
		default:
			console.log("Time interval " + time_interval);
			break;
	}
	console.log(time_arr);

	var hour = new Date().getHours();
	var min = new Date().getMinutes();
	for (i = 0; i < time_arr.length; i++) {
		if (demo == 0) {
			if (hour < time_arr[i]) {
				next_feed = time_arr[i];
				console.log("next feed: " + next_feed);
				next_feed_display.write("Next feed at " + next_feed + ":00\n");		
				break;
			}
			if (i == time_arr.length-1) {
				next_feed = time_arr[0];
				next_feed_display.write("Next feed at " + next_feed + ":00\n");
			}
		}
		else {
			if (min < time_arr[i]) {
				next_feed = time_arr[i];
				console.log("minute " + min);
				console.log("next feed: " + hour + ":" + next_feed);
				next_feed_display.write("Next feed at " + hour + ":" 
							+ next_feed + "\n");		
				break;
			}
			if (i == time_arr.length-1) {
				next_feed = time_arr[0];
				next_feed_display.write("Next feed at " + (hour+1) + ":00\n");
			}

		}
	}
});


function triggerFeed() {
	console.log('buzzing!');
	PythonShell.run('~/qpdir/buzz.py', function(err) {
		// Do nothing, removed error check 
	});

	var date = new Date();
	var hour = date.getHours();
	var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	var dateStr = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + 
			(hour) + ":" + minute;
	// Log the feed to the time terminal
	terminal.write("Last feed on: " + dateStr + " with portion size " + cycles + ".\n");

	//while loop, checks var portion, 
	for (i = 0; i < cycles; i++) {
		console.log('triggered one feed');
		PythonShell.run('~/qpdir/dispen_one_portion.py', function (err) {
  			if (err) throw err;
  		});
		var startTime = new Date().getTime();
		var endTime = startTime + 23000;
		while (new Date().getTime() < endTime){}
	}
}

function timeLoop() {
	if (auto_feed_on == 1) {
		setFeedTime();
		//console.log(new Date());
	}
}

var second_bool = 0;
function setFeedTime() {
	var date = new Date();
	var hour = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	for (i = 0; i < time_arr.length; i++) {
		if (demo == 0) {
			if (hour == time_arr[i] && lastFed != hour) {
				triggerFeed();
				lastFed = hour;
				next_feed = time_arr[(i+1)%time_arr.length];
				next_feed_display.write("Next feed at " + next_feed + ":00");
			}
		}
		else {

			if (minutes == time_arr[i] && lastFed != minutes) {
				console.log("Demo Feeding!");
				triggerFeed();
				lastFed = minutes;
				next_feed = hour;
				next_feed_display.write("Next feed at " + next_feed + ":" + 
							time_arr[(i+1)%time_arr.length]);
			}
		}
	}
}

