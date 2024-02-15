<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>View</title>
	<style>
		body {
		    display: flex;
			justify-content: center;
			align-items: center;
			flex-wrap: wrap;
			min-height: 100vh;
		}
		video {
			width: 640px;
			height: 360px;
		}
		a {
			text-decoration: none;
			color: #006CFF;
			font-size: 1.5rem;
		}
	</style>
</head>
<body>
	<a href="login_index.php">Return</a>

	<div class="alb">
		<?php 
		 
		 
		 session_start();

		 
		 $file_path ='uploads/'.$_SESSION["userID"]; 
		 
		 
		 $scanned_directory = array_diff(scandir($file_path), array('..', '.')); //gets array of all files in users folder
		 
		 foreach($scanned_directory as &$value){ //process to embedded each audio file into the webpage that belongs to the user
		 
	

		 ?>


		<audio src="<?=$file_path?>/<?=$value?>" 
	        	   controls>
	        	
	        </audio>
			
			
			
			
		 		
		<?php 
	     }
		 
		 unset($value);
		 
		 ?>	

	    
	</div>
</body>
</html>