<?php 
	session_start();
	
	include("db.php");
	
	if($_SERVER['REQUEST_METHOD'] == "POST")
		
		{
			
			$email = $_POST['mail']; //gets inputted email and password
			$password = $_POST['pass'];
			$passwordhash = password_hash($password, PASSWORD_DEFAULT);
			
			if(!empty($email) && !empty($password) && !is_numeric($email))
				if(strlen($password) < 8) {
					echo "<script type='text/javascript'> alert('Password must be at least 8 characters long')</script>";
				}
				else
				{
					
					$userID = substr($email, 0, 3) . (string)rand(100,999); //creates a userID from the first 3 letters of the email and 3 random numbers
					
					$query = "insert into form (email, passHash, userID) values ('$email', '$passwordhash', '$userID')"; //phrase to insert the email, password, and userID in the database
					
					mysqli_query($con, $query); //insert the email, password, and userID in the database
					
					$_SESSION["userID"] = $userID; //creates a session and stores the userID
					header("location: unregistered_user_audio_record_page.php");
					
				}
				
			else {
				
				echo "<script type='text/javascript'> alert('Please Enter Valid Information')</script>";
				
			}	
			
		}

?>


<!DOCTYPE html>
<html>
<head>

	<meta charset= "utf-8">
	<meta name = "viewport" content = "width=device-width, initial-scale=1">
	<title> Form Login and Register </title>
	<link rel ="stylesheet" href= "style.css">
	
</head>
<body>

	<div class = "content">
		<div class='choice_options'>
			<h1>Sign Up</h1>
			<h4>It's free and only takes a minute</h4>
			<form method = "POST">
				<input type="email" name = "mail" placeholder = "Email" center rows="20" cols="45" required><br>
				<input type="password" name = "pass" placeholder = "Password" center rows="20" cols="45" required><br>
				<input type="submit" class="button" name = "" value = "Submit">
			</form>
			
			<p>Already have an account? <a href = "login_index.php">Login Here</a></p>
		</div>
	</div>
</body>	
</html>

	