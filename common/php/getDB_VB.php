<?php

	$sql = $_REQUEST["sentSQL"];

	$org_timezone = date_default_timezone_get();
	date_default_timezone_set('Asia/Tokyo');

	try {

  		$dbh = new PDO($dsn, $user, $password);

		$stmt = $dbh->prepare($sql);

		$stmt -> execute();

		while($row = $stmt->fetch(PDO::FETCH_ASSOC)) $output[]=$row;

    	print(json_encode($output));

    	$dbh = null;

		date_default_timezone_set($org_timezone);

	} catch (PDOException $e) {
  		echo 'ERROR: ',  $e->getMessage(), "\n";
  		die('MSSQL Serer Connect Error');

	}

?>
