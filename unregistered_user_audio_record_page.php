<?php

session_start();


?>


<!DOCTYPE html>






<html>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.png">
	<link type="text/css" rel="stylesheet" href="style.css">
	
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
				
				
				
				<i id="lock" class="material-icons" style="font-size: 56px; color:white;">lock_outline</i>
				
				
				
				<br></br> 
				<div id="chgtext">When re1ady, press the Start button. You will then be prompted to record yourself reciting the listed phrase. You will conduct this exercise 10 times.</div>

				
				
				<br></br> 
				
				
				
				
				<button id ="startButton" class="button" >Start</button>
				<br></br>
				<br></br>
				<div class="button-container">
                	<button id="recordButton" class="button record-button">Record</button>
					<button id="stopButton" data-name= "<?php echo $_SESSION["userID"];?>" class="button stop-button" >Stop</button>
            	
					<button id="confirmButton" class="button record-button">Confirm</button>
					<button id="denyButton" class="button stop-button" >Deny</button>
				
				</div>

				<br></br>
				<div id="Confirm_Text"></div>
				<br></br> 


				<br></br>
				
				
				<ol id="recordingsList"></ol>
				<script src="https://cdn.rawgit.com/mattdiamond/Recorderjs/08e7abd9/dist/recorder.js"></script>
   				<script src="common_unregistered.js"></script>
				
				
				<br></br>
				<button class="button" onclick="Return_to_Login_Page()">Return</button>
				
					
				
				<br></br>
				
				
				
				
				
				
				
				<p></p>
				
				<p></p>
				
				

			</div>	
			
		

		</div>
	
    </body>
	
</html>