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

// Updated: Added a variable to hold the recorded audio blob
var recordedBlob;

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

var indicator = 0; //global indicator that will determine which database


function returnto() {
	
	indicator = 0;
	location.replace('/index.html'); //returns back to the login page and changes global variable back
}


function logsdatabase() {
	
	indicator = 1; //changes global variable to 1, which will indicate that the logged user wants to view the logs data base
	
}

function userdatabase() {
	
	indicator = 2; //changes global variable to 2, which will indicate that the logged user wants to view the user data base
	
}





function login() {
    const usernameInput = document.getElementById("given_username");
    const passwordInput = document.getElementById("given_password");
    const showMessage = document.getElementById("show_message");
	

    const supplied_user = usernameInput.value;
    const supplied_pass = passwordInput.value;
    const info = { supplied_user, supplied_pass };

    fetch("http://" + parsedUrl.host + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
    })
        .then((resp) => resp.text())
        .then((data) => {
            if ('"Unauthorized"' !== JSON.stringify(data)) {
                var received_token = JSON.stringify(data);
                received_token = received_token.substring(0, received_token.length - 4);
                received_token = received_token.substring(14);

                var params = new URLSearchParams();
                params.append("Token", received_token);

                location.href = "/verify.html?" + params.toString();
            } else {
                showMessage.style.display = 'block';
                showMessage.innerHTML = JSON.stringify(data);
                showMessage.style.color = "#ff4d4d"; 
                usernameInput.style.borderColor = "#ff4d4d"; 
                passwordInput.style.borderColor = "#ff4d4d"; 
            }
        })
        .catch((err) => {
            console.log(err);
        });
}




function redirect(passed_token, params){
	
	const info2 = {passed_token}
	
	fetch("http://" + parsedUrl.host + "/redirect", {
        method: "POST",
		headers: {
             "Content-Type": "application/json",
            },
        body: JSON.stringify(info2), //passes the inputted info to the server 
		
    })
	
	.then((resp) => resp.text()) //converts repsonce to text form 
		
	.then((data) => {
		
		if(JSON.stringify(data) == '"1"'){ //changes to the funfact page if the user is not an employee 
	
			location.href = "/funfacts.html?" + params.toString() ;
		
		}
			
		else{
			
			location.href = "/query.html?" + params.toString() ;  //changes to the query page if the user is not an employee 
			
		}
		
	})

}


function startRecording() {
	console.log("recordButton clicked");

    var constraints = { audio: true, video:false }

    //Disable the record button until we get a success or fail from getUserMedia() 
	recordButton.disabled = true;
	stopButton.disabled = false;

	//Using getUserMedia to request microphone access
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

	//create the wav blob and store it
	rec.exportWAV(function(blob) {
		recordedBlob = blob;
		createDownloadLink(blob);
	});
}

function createDownloadLink(blob) {
    // Updated: Automatically trigger the download
	var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.click(); // Automatically trigger the download
}




