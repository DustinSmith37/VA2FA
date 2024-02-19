<?php 
	session_start();
	
	include("db.php");
	
	$data = "there steve";
	
	$output = shell_exec("py -3.11 ./test.py " .$data);
	echo $output;
	
	
	
	if($_SERVER['REQUEST_METHOD'] == "POST")
	{
		
		$email = $_POST['mail'];
		$password = $_POST['pass'];
		
		
		if(!empty($email) && !empty($password) && !is_numeric($email))
			
		{
			$query = "select * from	form where email = '$email' limit 1";
			$result = mysqli_query($con, $query);	
			

			if($result)
				
				{
					
					if($result && mysqli_num_rows($result) > 0)
					{
						
						$user_data = mysqli_fetch_assoc($result);
						
						if($user_data['pass'] == $password)
							
							{
								
								
								
								$_SESSION["userID"] = $user_data['userID'];
								header("location: registered_user_audio_record_page.php");
								die;
							}
						
					}
					
					
				}
				echo "<script type='text/javascript'> alert('wrong username or password')</script>";

			
		}
		
		else{
			
			echo "<script type='text/javascript'> alert('wrong username or password')</script>";
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

	<div class = "Login">
		<h1>Login</h1>
		<form method = "POST">
			<label>Email</label>
			<input type="email" name = "mail" required>
			<label>Password</label>
			<input type="password" name = "pass" required>
			<input type="submit" name = "" value = "Submit">
		</form>
		<p>Not have an account? <a href = "signup.php">Sign Up Here</a></p>
		
	</div>
</body>	
</html>