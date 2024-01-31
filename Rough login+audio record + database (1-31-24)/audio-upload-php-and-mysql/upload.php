<?php


include "db_conn.php"; 
    		
$new_audio_name = uniqid("audio-", true). '.'.'.flac'; //new audio name, gives timestamp
$audio_upload_path = 'uploads/'.$new_audio_name;
move_uploaded_file($_FILES['file']['tmp_name'], $audio_upload_path); //moves to uploads folder

$sql = "INSERT INTO audios(audio_url) 
                   VALUES('$new_audio_name')"; //adds new file to data base
mysqli_query($conn, $sql); //actually adds new file to data base 

?>
