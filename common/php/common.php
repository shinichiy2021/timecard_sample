<?php
//*********************************************************/
//* 定数定義                                               */
//*********************************************************/
//**********************************************************
// データベース取得の関数
// 関数名：databaseGet
// 作成者：yamazaki
// 作成日：2018/05/03
// 引数1： $sql       : 取得用のSQL
// 引数2： $dsn       : データベースのパス
// 引数3： $userName  : ログインユーザーネーム
// 引数4： $password  : ログインパスワード
// 戻り値： 取得したデータ配列
//**********************************************************
function databaseGet($sql, $accountName, $userName) {
  try {
    $dbh = new PDO(
      $userName, 
      $GLOBALS['password']
    );
    $stmt = $dbh->prepare($sql);
    $stmt -> execute();
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $getData[] = $row;
    }
    $dbh = null;
    date_default_timezone_set($org_timezone);
    return $getData;
  }
  catch (PDOException $e) {
    echo 'Error : ',  $e->getMessage(), "\n";
    die('MSSQL Serer Connect Error');
  }
}
//**********************************************************
// データベース取得の関数
// 関数名：databaseSet
// 作成者：yamazaki
// 作成日：2018/05/03
// 引数1： $sql       : 更新用のSQL
// 引数2： $dsn       : データベースのパス
// 引数3： $userName  : ログインユーザーネーム
// 引数4： $password  : ログインパスワード
//**********************************************************
function databaseSet($sql, $accountName, $userName) {
  try {
    $dbh = new PDO(
      $userName, 
      $GLOBALS['password']
    );
    $stmt = $dbh->prepare($sql);
    if ($stmt->execute()) {
    }
    else {
    }
    $dbh = null;
    date_default_timezone_set($org_timezone);
  }
  catch (PDOException $e) {
    echo 'Error : ',  $e->getMessage(), "\n";
    die('MSSQL Serer Connect Error');
  }
}
?>