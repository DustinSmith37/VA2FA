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
var confirmButton = document.getElementById("confirmButton");
var denyButton = document.getElementById("denyButton");


confirmButton.disabled = true; //removes start button
confirmButton.style.display = "none";
denyButton.disabled = true; //removes start button
denyButton.style.display = "none";




var count = 0; //count to keep track of how many times user recorded audio

var user = "undefined"; //global variable, this gets replaced with the userID later






//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
startButton.addEventListener("click", startingProcess);
confirmButton.addEventListener("click", confirmAudio);
denyButton.addEventListener("click", denyAudio);


function changeText(random_phrase) {

  document.getElementById('chgtext').innerHTML = random_phrase; //changes the text to the randomly selected phrase
 
	
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

    //li.appendChild(link);
    //add the li element to the ordered list 
    recordingsList.appendChild(li);
	
	
	//recordingsList.removeChild(li);
	
	stopButton.disabled = true; //removes stop button
	stopButton.style.display = "none";
	
	recordButton.disabled = true; //removes record button
	recordButton.style.display = "none";
	
	
	
	confirmButton.disabled = false; 
	confirmButton.style.display = "unset"; //brings confirm and deny button back and visible 
	denyButton.disabled = false; 
	denyButton.style.display = "unset";
	
	//display text to ask if the individual wants to use this audio or not
	document.getElementById('Confirm_Text').innerHTML = "Are you satisfied with your recording? If so, click confirm. If not, click deny. Note: Pressing deny will generate a new phrase in which you will need to record in the former's place.".bold();
	
	
}


function switchbuttons(){
	
	
	
	stopButton.disabled = false; //brings stop button back
	stopButton.style.display = "unset";
	
	recordButton.disabled = false; //brings record button back
	recordButton.style.display = "unset";
	
	confirmButton.disabled = true; //removes confirm button
	confirmButton.style.display = "none";
	denyButton.disabled = true; //removes deny button
	denyButton.style.display = "none";
	
	
	document.getElementById('Confirm_Text').innerHTML = "";
	
	const element = document.getElementById("recordingsList"); //removes audio play back on page
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}

	
}

function confirmAudio() {
	
	switchbuttons();
	

	rec.exportWAV(sendOFF); //sends audio data off
	
}


function sendOFF(blob) {
	
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
	
	
	
	if(count < 11){
		randomPhrase();
	}
	
	user = "undefined"; //changes global variable back to undefined
	
	
	
	
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

function denyAudio() {
	
	switchbuttons();
	
	
	count--;
	randomPhrase();
	
	user = "undefined"; //changes global variable back to undefined
	
}


function query() {
    
	document.getElementById("response").innerHTML = "test";

}
