<?php

	$sql = $_POST["sentSQL"];

	$org_timezone = date_default_timezone_get();
	date_default_timezone_set('Asia/Tokyo');


	try {

  		$dbh = new PDO($dsn, $user, $password);
    	$stmt = $dbh->prepare($sql);

      if ($stmt->execute()) {
        echo "true";
      }
      else {
        echo "false";
      }

  	$dbh = null;

  	date_default_timezone_set($org_timezone);
	}
	catch (PDOException $e) {
  	echo 'ERROR:' + $e;
	}

?>




