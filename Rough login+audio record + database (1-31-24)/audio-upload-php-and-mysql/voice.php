<!DOCTYPE html>

<html>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.png">
	<link type="text/css" rel="stylesheet" href="common.css">
	
    <head>
        <title>
            Voice Recording Demo
        </title>
		<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    </head>

    <body>
	
        <div class="content">
		
			<div class='choice_options'>
				
				<br></br> 
				<i class="material-icons" style="font-size: 56px; color:black;">lock_outline</i>
				<p><strong class="bigtext">Two Factor Authentication</strong></p>

				
				
				<br></br> 
				
				<button id ="recordButton" class="button" >Record</button>
				<br></br>
				<button id ="stopButton" class="button" >Stop</button>
				<br></br>
				<button class="button" onclick="transferPage()">View Recodings Page</button>
				<p><strong style="font-family: Arial, Helvetica, sans-serif ;"><i class="material-icons" style="font-size: 16px; color:black;">lock</i> Simple Voice Recording Demo, to be used with 2FA. Voice recording stored in .wav filetype</strong></p>
				<h3><u>Recordings:</u></h3>
				<ol id="recordingsList"></ol>
				<script src="https://cdn.rawgit.com/mattdiamond/Recorderjs/08e7abd9/dist/recorder.js"></script>
   				<script src="common.js"></script>
				
				
				<p></p>
				
				<p></p>
				
				
			<button class="button" onclick="query()">Query</button>
            <p></p>
            <textarea id="response" rows="20" cols="45" placeholder="Database Results"></textarea>	
			

			</div>	
			
		

		</div>
	
    </body>
	
</html>