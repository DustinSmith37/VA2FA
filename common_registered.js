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

var passed_message = "";

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
startButton.addEventListener("click", startingProcess);





function changeText(random_phrase) {

  document.getElementById('chgtext').innerHTML = random_phrase; //changes the text to the randomly selected phrase
  passed_message = random_phrase;

}

function Return_to_Login_Page(){
	
	location.href = "http://localhost/audio-upload-php-and-mysql/login_index.php"; //returns to login page if clicked
	
}

function startingProcess() {
	
	startButton.disabled = true; //removes start button
	startButton.style.display = "none";
	
	randomPhrase(); //runs random phrase function
	
	
}


async function randomPhrase(){
	try {
		// Fetch the file contents
		const response = await fetch("sentences.txt");
		const text = await response.text();
		
		// Split the text into an array of lines
		const lines = text.split('\n');
		
		// Generate a random index to select a random line
		const randomIndex = Math.floor(Math.random() * lines.length);
		
		// Set random phrase
		random_phrase = lines[randomIndex];
	  } catch (error) {
		console.error('Error reading file:', error);
		
	  }
	
	

	
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
    data.append('file', blob); //Post method sending audio blob and userID
	data.append("userID", user);
	data.append("message",passed_message);

    // Make the HTTP request
    var oReq = new XMLHttpRequest();

    // POST the data to upload.php
    oReq.open("POST", 'http://localhost/audio-upload-php-and-mysql/upload_registered.php', true);
    oReq.onload = function(oEvent) {
      // Data has been uploaded
    };
    oReq.send(data);
	
	
	user = "undefined";
	
	//document.getElementById("response").innerHTML = "audio_sent";
	
	
		
		
		
	recordButton.disabled = true;
    stopButton.disabled = true;
	recordButton.style.display = "none";
	stopButton.style.display = "none";
	changeText("Processing Audio File, Please be Patient."); 
	
	setTimeout(function() {
            window.location.href="processing_registered_information.php"; //wait half a second before changing pages 
        }, 500);
		
		
}



function query() {
    
		document.getElementById("response").innerHTML = "test";

}