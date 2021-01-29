<?php 
// Formデータから取得
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
function get_request() {
    $content_type = explode(';', trim(strtolower($_SERVER['CONTENT_TYPE'])));
    $media_type = $content_type[0];

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $media_type == 'application/json') {
        // application/json で送信されてきた場合の処理
        $request = json_decode(file_get_contents('php://input'), true);
    } else {
        // application/x-www-form-urlencoded で送信されてきた場合の処理
        // REQUESTのjsonが多層の時はうまく行かない
        $request = $_REQUEST;

        // REQUESTのjsonが多層の場合に対応
        foreach ($_REQUEST as $key => $value) {
            $request[$key] = json_decode($value, true);

            // json_decodeはクォートされていない文字列がnullになるので戻す
            if ($request[$key] == null) {
                $request[$key] = $value;
            }
        }
    }
    return $request;
}
$hoge = get_request();
var_dump($hoge);

// データベースへ接続
$accountName = $hoge.params.formdata.accountName;
$userName    = $hoge.params.formdata.userName;
$mappingName = $hoge.params.formdata.mappingName;
$prepare     = $hoge.params.formdata.prepare;
$org_timezone = date_default_timezone_get();
date_default_timezone_set('Asia/Tokyo');
try {
  $dbh = new PDO($dsn,$userName, $password);
  $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE , PDO::FETCH_ASSOC);
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
  error_log($stringPrepare);
  $stmt = $dbh->prepare($stringPrepare);
  for ($i=0; $i < count($prepare); $i++) {
    # code...
    $stmt->bindParam($i+1, $prepare[$i], PDO::PARAM_STR);
  }
  $stmt->execute();
  while ($row = $stmt->fetch()) {
    $output[] = $row;
  }
  print(json_encode($output));
  $dbh = null;
  date_default_timezone_set($org_timezone);
}
catch (PDOException $e) {
  echo 'Error : ',  $e->getMessage(), "\n";
  die('MSSQL Serer Connect Error');
}
