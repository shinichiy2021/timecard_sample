<?php

// SQL文を取得
$accountName = $_POST["accountName"];
$userName    = $_POST["userName"];
$sql         = $_POST["sentSQL"];

// TimeZoneを日本時間に設定する
$org_timezone = date_default_timezone_get();
date_default_timezone_set('Asia/Tokyo');

try {

  // DBに接続
  $dbh = new PDO($dsn, $userName, $password);
  $stmt = $dbh->prepare($sql);
  $stmt->execute();

  // select要素の取得
  $output = $stmt->fetch(PDO::FETCH_ASSOC);
    
  // 取得データをjsonデータとして吐き出す
  header("Content-Type: text/xml; charset=utf-8");
 	echo $output["BODY"];

  // データベースクローズ
  $dbh = null;
    
  // TimeZoneを元に戻す
  date_default_timezone_set($org_timezone);
}
catch (PDOException $e) {
  echo 'XMLを取得できませんでした:' + $e;
}

?>




