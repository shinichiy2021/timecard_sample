<?php

  // SQL文を取得
  $accountName = $_POST["accountName"];
  $userName    = $_POST["userName"];
  $arraySQL    = $_POST["sentSQL"];

  // TimeZoneを日本時間に設定する
  $org_timezone = date_default_timezone_get();
  date_default_timezone_set('Asia/Tokyo');


  try {

    // DBに接続
    $dbh = new PDO($dsn, $userName, $password);

    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();

    foreach ($arraySQL as $sql) {
      $dbh->exec($sql);
      // $stmt = $dbh->prepare($sql);
      // $stmt->execute();
    }
    $dbh->commit();

    // データベースクローズ
    $dbh = null;

    // TimeZoneを元に戻す
    date_default_timezone_set($org_timezone);

    // echo "正常にDBが実行されました。";
  }
  catch (Exception $e) {
    $dbh->rollBack();
    echo 'DBを取得できませんでした:' + $e;
  }
?>




