<?php

//*********************************************************/
//* クラスの定義
//*********************************************************/
class Database {
  const DEVELOPER_PASS = 'gaia_release';
  //**********************************************************
  // データベース取得
  // get
  // 作成者：yamazaki
  // 作成日：2019/11/11
  // 引数1： $sql : 取得用のSQL
  // 戻り値： 取得したデータ配列
  //**********************************************************
  public function get($sql) {
    try {
      $dbh = new PDO(self::$dsn, self::$userName, self::$password);
      $stmt = $dbh->prepare($sql);
      $stmt -> execute();
      while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getData[] = $row;
      }
      $dbh = null;
      date_default_timezone_set(self::org_timezone);
      return $getData;
    }
    catch (PDOException $e) {
      echo 'Error : ',  $e->getMessage(), "\n";
      die('MSSQL Serer Connect Error');
    }
  }
  //**********************************************************
  // データベース取得
  // 関数名：set
  // 作成者：yamazaki
  // 作成日：2019/11/11
  // 引数1： $sql : 更新用のSQL
  //**********************************************************
  public function set($sql) {
    try {
      $dbh = new PDO(self::$dsn, self::$userName, self::$password);
      $stmt = $dbh->prepare($sql);
      if ($stmt->execute()) {
      }
      else {
      }
      $dbh = null;
      date_default_timezone_set(self::org_timezone);
    }
    catch (PDOException $e) {
      echo 'Error : ',  $e->getMessage(), "\n";
      die('MSSQL Serer Connect Error');
    }
  }
}

?>