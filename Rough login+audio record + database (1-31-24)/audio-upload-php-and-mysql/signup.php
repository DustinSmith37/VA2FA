<?php 
	session_start();
	
	include("db.php");
	
	if($_SERVER['REQUEST_METHOD'] == "POST")
		
		{
			
			$email = $_POST['mail'];
			$password = $_POST['pass'];
			
			
			if(!empty($email) && !empty($password) && !is_numeric($email))
				
				{
					
					$query = "insert into form (email, pass) values ('$email', '$password')"; 
					
					mysqli_query($con, $query);
					
					echo "<script type='text/javascript'> alert('Successfully Register')</script>";
					
					
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

	<div class = "signup">
		<h1>Sign Up</h1>
		<h4>It's free and only takes a minute</h4>
		<form method = "POST">
			<label>Email</label>
			<input type="email" name = "mail" required>
			<label>Password</label>
			<input type="password" name = "pass" required>
			<input type="submit" name = "" value = "Submit">
		</form>
		<p>By clicking the Sign Up button, you agree to our<br>
		<a href = "">Terms and Condition</a> and <a href="#">Policy Privacy </a>
		</p>
		<p>Already have an account? <a href = "login.php">Login Here</a></p>
		
	</div>
</body>	
</html>

	