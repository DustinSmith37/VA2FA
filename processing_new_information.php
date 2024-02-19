
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

//echo $_SESSION["userID"];

$userdata = $_SESSION["userID"];

//echo $userdata;


$command1 = "process ".$userdata;
	
$output = shell_exec("py -3.11 ./audioProcessing.py " .$command1);
//echo $output;

$command2 = "train ".$userdata;

$output = shell_exec("py -3.11 ./audioProcessing.py " .$command2);
//echo $output;


header("location: login_index.php");



?>