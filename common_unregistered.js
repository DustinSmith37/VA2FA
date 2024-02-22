//Resource: https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/



var parsedUrl = new URL(window.location.href);
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var startButton = document.getElementById("startButton");

var count = 0; //count to keep track of how many times user recorded audio

var user = "undefined"; //global variable, this gets replaced with the userID later




var NumArr = [1,2,3,4,5, 6, 7, 8, 9, 10]; //number array; this will helps us with the random phrases

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
startButton.addEventListener("click", startingProcess);


function changeText(random_phrase) {

  document.getElementById('chgtext').innerHTML = random_phrase; //changes the text to the randomly selected phrase
 
	
}

function Return_to_Login_Page(){
	
	location.href = "http://localhost/audio-upload-php-and-mysql/login_index.php"; //returns to login page if clicked
	
}

function startingProcess() {
	
	startButton.disabled = true; //removes start button
	startButton.style.display = "none";
	
	let currentIndex = NumArr.length,  randomIndex;

  // While there remain elements to shuffle.
	while (currentIndex > 0) { //shuffles the entire number array around in a random order

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [NumArr[currentIndex], NumArr[randomIndex]] = [
      NumArr[randomIndex], NumArr[currentIndex]]; 
  }

	
	
	
	randomPhrase(); //runs random phrase function
	
	
}


function randomPhrase(){
	
	
	random_phrase = "";
	random_number = NumArr[0]; //gets first element in the number array
	
	if(random_number == 1){ // series of if statements to determine what the first number in the array is. The first number correlates with a random phrase. 
		
		
		random_phrase = "The sky is blue, the grass is green, the sun is yellow, and the stop sign is red.";	
		
	}
	
	
	else if (random_number == 2){
			
		random_phrase =	"1, 2 buckle my shoe; 3,4 shut the door; 5,6 pick up some sticks; 7,8 set them straight; 9,10 that's the end.";
			
	}
	
	else if (random_number == 3){
			
		random_phrase = "The average distance between the Earth and the Moon is 238,855 miles or 384,400 km.";
			
	}
	
	else if (random_number == 4){
			
		random_phrase =	"As of the year 2023, scientists have confirmed there are currently over 6,000 different species of frogs.";
			
	}
	
	else if (random_number == 5){
			
		random_phrase =	"As of the year 2023, scientists have confirmed there are currently over 6,000 different species of frogs.";
			
	}
	
	else if (random_number == 6){
			
		random_phrase =	"The sunblock was handed to the girl before practice, but the burned skin was proof she did not apply it.";
			
	}
	
	else if (random_number == 7){
			
		random_phrase =	"The gruff old man sat in the back of the bait shop grumbling to himself as he scooped out a handful of worms.";
			
	}
	
	else if (random_number == 8){
			
		random_phrase =	"The father handed each child a roadmap at the beginning of the 2-day road trip and explained it was so they could find their way home.";
			
	}
	
	else if (random_number == 9){
			
		random_phrase =	"It was difficult for Mary to admit that most of her workout consisted of exercising poor judgment.";
			
	}
		
	else{
			
		random_phrase =	"Put on your shirt; put on your pants; put on your socks; tie your shoes; grab a jacket; and enjoy your day.";
			
	}
	
	
	
	
	
	
	
	NumArr.shift(); //shift the array over by 1, get rid of the first number, removing the chance of repeating phrases again. 
	changeText(random_phrase);
	count++; //increase count by 1
	
	
}

function startRecording() {
	console.log("recordButton clicked");
	document.getElementById("lock").style.color = "#3498db";
    var constraints = { audio: true, video:false }

    //Disable the record button until we get a success or fail from getUserMedia() 
	recordButton.disabled = true;
	stopButton.disabled = false;
	

	
	//Using getUserMedia to request microphonne access
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

	
		//create an audio context after getUserMedia is called
		//sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
		//the sampleRate defaults to the one set in your OS for your playback device
		audioContext = new AudioContext();

		//assign to gumStream for later use
		gumStream = stream;
		
		//use the stream
		input = audioContext.createMediaStreamSource(stream);
 
		//Create the Recorder object and configure to record mono sound (1 channel)
		//Recording 2 channels will double the file size
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
		//display if getUserMedia fails
		console.error("getUserMedia failed:", err);
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	
	});
}


function stopRecording() {
	console.log("stopButton clicked");
	document.getElementById("lock").style.color = "white";
	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	
	user = this.getAttribute('data-name'); //changes global variable to the users ID.
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();
	

	//document.getElementById("response").innerHTML = name;
	
	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}


function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    //link the a element to the blob 
    link.href = url;
	var file_name = new Date().toISOString() + '.wav';
    link.download = file_name;
    link.innerHTML = link.download;
	
	
	//add the new audio and a elements to the li element 
    li.appendChild(au);

    li.appendChild(link);
    //add the li element to the ordered list 
    recordingsList.appendChild(li);
	
	
	var data = new FormData();
    data.append('file', blob); //sends audio blob and userID in post request to unpload_unregistered page
	data.append("userID", user);

    // Make the HTTP request
    var oReq = new XMLHttpRequest();

    // POST the data to upload.php
    oReq.open("POST", 'http://localhost/audio-upload-php-and-mysql/upload_unregistered.php', true);
    oReq.onload = function(oEvent) {
      // Data has been uploaded
    };
    oReq.send(data);
	
	
	
	randomPhrase();
	
	user = "undefined"; //changes global variable back to undefined
	
	//document.getElementById("response").innerHTML = "audio_sent";
	
	
	if(count == 11){ //currently, once 11 audios are recorded the page will change
		
		
		
		recordButton.disabled = true;
    	stopButton.disabled = true;
		recordButton.style.display = "none";
		stopButton.style.display = "none";
		
		
		changeText("Processing Audio Files, Please be Patient."); 
		
		
		setTimeout(function() {
                window.location.href="processing_new_information.php"; //wait half a second to change page back to login page, gives audio blob time to transfer. 
            }, 500);
			
	};
	
}

function query() {
    
	document.getElementById("response").innerHTML = "test";

}
