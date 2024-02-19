
<!DOCTYPE html>
<html>
<head>

	<h1>Processing audio. Please be Patient</h1>
	
</head>
<body>

</body>	
</html>

<?php

session_start();


$userdata = $_SESSION["userID"];

$message = $_SESSION["message"];

$command_Message = ' "p='.$message.'"';

$command1 = "test ".$userdata." ".$command_Message;


	
$output = shell_exec("py -3.11 ./audioProcessing.py " .$command1);




if ((int)$output == 1){ //if true, succss log in
	
	header("location: successful_logged_in_view.php");
	
	
}


else{ //if false, return to login
	
	header("location: login_index.php");
	
}


?>