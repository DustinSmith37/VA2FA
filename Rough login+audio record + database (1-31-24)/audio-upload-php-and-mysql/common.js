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




//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);


function transferPage(){
	
	location.href = "http://localhost/audio-upload-php-and-mysql/view.php";
	
}

function startRecording() {
	console.log("recordButton clicked");

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

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	
	
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
    data.append('file', blob);

    // Make the HTTP request
    var oReq = new XMLHttpRequest();

    // POST the data to upload.php
    oReq.open("POST", 'http://localhost/audio-upload-php-and-mysql/upload.php', true);
    oReq.onload = function(oEvent) {
      // Data has been uploaded
    };
    oReq.send(data);
	
	
	
	document.getElementById("response").innerHTML = "file_sent";
}


function query() {
    //fetch("http://" + parsedUrl.host + "/query", {
        //method: "GET",
        //mode: "no-cors",
    //})
    //.then((resp) => resp.text())
    //.then((data) => {
        //document.getElementById("response").innerHTML = data;
		document.getElementById("response").innerHTML = "test";
    //})
    //.catch((err) => {
        //console.log(err);
    //})
}