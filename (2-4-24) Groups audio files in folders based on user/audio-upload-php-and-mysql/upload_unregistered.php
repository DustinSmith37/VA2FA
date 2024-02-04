<?php


$file_path ='uploads/'.$_POST['userID']; //gets path of uploads folder plus userID



if (!file_exists($file_path)) {  //if the file path doesn't exist, create it
    mkdir($file_path, 0770, true);
} 



$new_audio_name = uniqid("audio-", true).'.flac'; //new audio name, gives timestamp
$audio_upload_path = $file_path.'/' .$new_audio_name;

move_uploaded_file($_FILES['file']['tmp_name'], $audio_upload_path); //moves flac file to the location



?>
