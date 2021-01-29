<?php

  // SQL文を取得
  $accountName = $_POST["accountName"];
  $userName    = $_POST["userName"];
  $sql         = $_POST["sentSQL"];
//  $sql         = mb_convert_encoding($_POST["sentSQL"], "ISO-2022-JP-ms", "UTF-8");

  // TimeZoneを日本時間に設定する
  $org_timezone = date_default_timezone_get();
  date_default_timezone_set('Asia/Tokyo');

//  mb_internal_encoding('UTF-8');

  try {

    // DBに接続
    $dbh = new PDO($dsn, $userName, $password);
    $stmt = $dbh->prepare($sql);

    $stmt->execute();
    // if ($stmt->execute()) {
    //   print 'true';
    // }
    // else {
    //   print 'false';
    // }

    // データベースクローズ
    $dbh = null;

    // TimeZoneを元に戻す
    date_default_timezone_set($org_timezone);

  //  echo "正常にDBが実行されました。";
  }
  catch (PDOException $e) {
    echo 'DBを取得できませんでした:' + $e;
  }

?>




