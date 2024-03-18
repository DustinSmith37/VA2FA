
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


//$command_test = "test ".$userdata;

//$output = shell_exec("py -3.11 ./python_test.py " .$command_test);
//echo $output;







//$file_path2 ='uploads/'.$userdata.'/test';


//if (!file_exists($file_path2)) {  //if the file path doesn't exist, create it
    //mkdir($file_path2, 0770, true);
//} 



$file_path ='uploads/'.$userdata;

$files = glob($file_path.'/*.flac'); //get all file names
foreach($files as $file){
    if(is_file($file))
    unlink($file); //delete file
}



header("location: login_index.php");





?>