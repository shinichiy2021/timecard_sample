<?php
  $params = json_decode(file_get_contents('php://input'), true);
  $accountName = $params["accountName"];
  $userName    = $params["userName"];
  $mappingName = $params["mappingName"];
  $prepare     = $params["prepare"];
  $org_timezone = date_default_timezone_get();
  date_default_timezone_set('Asia/Tokyo');
  try {
    $dbh = new PDO($dsn,$userName, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE , PDO::FETCH_ASSOC);
    if ('null' != json_encode($prepare)) {
      // ステートメント準備
      $stringPrepare = "{CALL ".$mappingName."(";
      foreach ($prepare as $key => $value) {
        # code...
        $stringPrepare = $stringPrepare."?,";
      }
      error_log(count($prepare));
      if (count($prepare) != 0) {
        $stringPrepare = substr($stringPrepare, 0, -1);   // 最後尾の文字を削除する
      }
      $stringPrepare = $stringPrepare.")}";
      error_log(json_encode($prepare));
      $stmt = $dbh->prepare($stringPrepare);
      for ($i=0; $i < count($prepare); $i++) {
        # code...
        $stmt->bindParam($i+1, $prepare[$i], PDO::PARAM_STR);
      }
    } else {
      // ステートメントなし
      $stringPrepare = "{CALL ".$mappingName."()}";
      error_log(json_encode($prepare));
      $stmt = $dbh->prepare($stringPrepare);
    }
    $stmt->execute();
    while ($row = $stmt->fetch()) {
      $output[] = $row;
    }
    echo json_encode($output);
    $dbh = null;
    date_default_timezone_set($org_timezone);
  }
  catch (PDOException $e) {
    echo 'Error : ',  $e->getMessage(), "\n";
    die('MSSQL Serer Connect Error');
  }
?>