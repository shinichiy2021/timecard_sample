<?php
  //*********************************************************/
  //* 定数定義                                               */
  //*********************************************************/
  //******************************************************************
  // 通知を送るための共通処理
  // common_push
  // 作成者：yamazaki
  // 作成日：2017/6/30
  //******************************************************************
  date_default_timezone_set('Asia/Tokyo');
  // 現在日時をUNIXタイムスタンプを秒単位で取得する
  $now = time();
  // 現在日時を YYYY/MM/DD hh:mm:ss の書式の文字列で取得する
  $now = date('Y/m/d H:i:s');
  $companyEmailAdress = $_POST["companyEmailAdress"];
  $kyotenEmailAdress  = $_POST["kyotenEmailAdress"];
  $subject  = $_POST["mailTitle"];
  $bodystructure  = $_POST["bodystructure"];
  error_log($companyEmailAdress, 0);
  error_log($kyotenEmailAdress, 0);
  error_log($now, 0);
  error_log($bodystructure, 0);
  // 変数宣言
  $companyID = "";
  $faxKyoten = "";
  $faxMode   = "";
  $sendFlag  = "";
  $maxFaxID  = "";
  // FAX受信者リスト
  $faxPushList = NULL;
  $pushJsonArray = array();
  require('common.php');
  //-----------------------------------------
  // マッピング
  // 会社番号の取得
  // 2018/05/03 yamazaki
  //-----------------------------------------
  $companyData = databaseGet(
    "SELECT".
    "    companyID".
    " FROM MK_company".
    " WHERE".
    "    faxEmail=N'".$companyEmailAdress."'",
    "gaia_ik",
    "gaia_ik"
  );
  // 存在していないときの処理
  if ($companyData == NULL) {
    echo "会社番号の取得に失敗しました。";
    die('MSSQL Serer Connect Error');
  }
  else {
    $companyID = $companyData[0]["companyID"];
  }
  error_log($companyID, 0);
  //-----------------------------------------
  // マッピング
  // 拠点情報の取得
  // 2018/05/03 yamazaki
  //-----------------------------------------
  $kyotenData = databaseGet(
    "SELECT".
    "    faxKyoten,".
    "    sendFlag".
    " FROM MK_kyoten".
    " WHERE".
    "    kyotenEmail=N'".$kyotenEmailAdress."'",
    "gaia_ik",
    "gaia_ik"
  );
  // 存在していないときの処理
  if ($kyotenData == NULL) {
    echo "拠点情報の取得に失敗しました。";
    die('MSSQL Serer Connect Error');
  }
  else {
    $faxKyoten = $kyotenData[0]["faxKyoten"];
    $sendFlag  = $kyotenData[0]["sendFlag"];
  }
  if ($sendFlag == "0") {
    $faxMode = "auto";
  } else {
    $faxMode = "hand";
  }
  error_log($faxKyoten, 0);
  error_log($sendFlag, 0);
  //-----------------------------------------
  // マッピング
  // FaxID最大値の取得
  // 2018/05/06 yamazaki
  //-----------------------------------------
  $faxIDData = databaseGet(
    "SELECT".
    "    MAX(faxID)+1 AS maxFaxID".
    " FROM MK_faxSend".
    " WHERE".
    "    companyID=N'".$companyID."'",
    "gaia_ik",
    "gaia_ik"
  );
  // 存在していないときの処理
  if ($faxIDData == NULL) {
    echo "FaxID最大値の取得に失敗しました。";
    die('MSSQL Serer Connect Error');
  }
  else {
    $maxFaxID = $faxIDData[0]["maxFaxID"];
  }
  error_log($maxFaxID, 0);
  //-----------------------------------------
  // マッピング
  // FAX受信者リストの取得
  // 2018/05/06 yamazaki
  //-----------------------------------------
  $faxPushDate = databaseGet(
    "SELECT".
    "    staffID".
    " FROM MK_staff".
    " WHERE".
    "    companyID = N'". $companyID. "' AND".
    "    faxRec = N'000'",
    "gaia_ik",
    "gaia_ik"
  );
  // 存在していないときの処理
  if ($faxPushDate == NULL) {
    echo "FAX受信者リストの取得に失敗しました。";
    die('MSSQL Serer Connect Error');
  }
  else {
    $faxPushList = $faxPushDate;
  }
  // 保存先のFAX受信リストを取得する。
  $files = glob("../../../fax_data/get/gaia_ik/".$companyID."/".$faxKyoten."/".$faxMode."/*");
  $list = array();
  foreach ($files as $file) {
    if (is_file($file)) {
      $fileNamePath = explode("/", $file);
      $fileName = $fileNamePath[9];
      $fileExte = explode(".", $fileName);
      error_log("ファイルの拡張子：".$fileExte[1], 0);
      // 拡張子がTIFの時にJPEGに変換する処理
      if ($fileExte[1] == "tif" || $fileExte[1] == "tiff"/* || $fileExte[1] == "pdf"*/) {
        $dest = "./dst/";
        $type = "jpg";
        $image = new Imagick();
        $image->readImage("C:/Inetpub/vhosts//httpdocs/timeCard/fax_data/get/gaia_ik/".$companyID."/".$faxKyoten."/".$faxMode."/".$fileName);
        $image->setImageFormat('jpg');
        $image->writeImage("C:/Inetpub/vhosts//httpdocs/timeCard/fax_data/send/gaia_ik/".$companyID."/".$faxKyoten."/".$fileExte[0].".jpg");
        // 後処理
        $image->clear();
        $image->destroy();
        // 変換前のファイルを削除する
        unlink("C:/Inetpub/vhosts//httpdocs/timeCard/fax_data/get/gaia_ik/".$companyID."/".$faxKyoten."/".$faxMode."/".$fileName);
      }
      else {
        //-----------------------------------------
        // 該当ファイルの移動
        // 1つずつ
        //-----------------------------------------
        error_log("../../../fax_data/get/gaia_ik/".$companyID."/".$faxKyoten."/".$faxMode."/".$fileName, 0);
        if (FALSE == rename(
          "../../../fax_data/get/gaia_ik/".$companyID."/".$faxKyoten."/".$faxMode."/".$fileName,
          "../../../fax_data/send/gaia_ik/".$companyID."/".$faxKyoten."/".$fileName
        )) {
          error_log("該当ファイルの移動に失敗しました。", 0);
          die('File Move Error');
        }
      }
      //-----------------------------------------
      // マッピング
      // FAX送信情報の登録
      // 2018/05/06 yamazaki
      //-----------------------------------------
      databaseSet(
        "INSERT INTO".
        " MK_faxSend(".
        "    faxDateTime,".
        "    companyID,".
        "    faxFlag,".
        "    subject,".
        "    imagePass,".
        "    faxID,".
        "    faxKyoten".
        " ) VALUES(".
        "    '".$now."',".
        "    N'".$companyID.  "',".
        "    '" .$sendFlag.   "',".
        "    N'".$subject.    "',".
        "    N'".$fileExte[0].".jpg".   "',".
        "    '" .$maxFaxID.   "',".
        "    N'".$faxKyoten.  "'".
        ")",
        "gaia_ik",
        "gaia_ik"
    );
      foreach ($faxPushList as $faxPush) {
        //-----------------------------------------
        // マッピング
        // FAX送信情報履歴の登録
        // 2018/05/06 yamazaki
        //-----------------------------------------
        error_log($faxPush["staffID"], 0);
        databaseSet(
          "INSERT INTO".
          " MK_historyOption(".
          "    companyID,".
          "    category,".
          "    ymdTime,".
          "    staffID,".
          "    flag,".
          "    externNo,".
          "    okiniFlag".
          " )".
          " VALUES(".
          "    N'".$companyID.  "',".
          "    '6',".
          "    '".$now."',".
          "    N'".$faxPush["staffID"]."',".
          "    '0',".
          "    '" .$maxFaxID.   "',".
          "    '" .$sendFlag.   "'".
          " )",
          "gaia_ik",
          "gaia_ik"
        );
        //-----------------------------------------
        // マッピング
        // スタッフIDから通知先の情報の取得
        // 2018/05/07 yamazaki
        //-----------------------------------------
        $pushData = databaseGet(
          "SELECT".
          "    registerID,".
          "    name".
          " FROM MK_smartPhone".
          " WHERE".
          "    staffID = N'".$faxPush["staffID"]."' AND".
          "    companyID = N'".$companyID."' AND".
          "    name <> N'card'",
          "gaia_ik",
          "gaia_ik"
        );
        //-----------------------------------------
        // 2018/05/15 yamazaki
        // 通知先の情報が取得できないときは何もしない
        //-----------------------------------------
        foreach ($pushData as $pushInfo) {
          error_log($pushInfo["registerID"], 0);
          error_log($pushInfo["name"], 0);
          $pushJsonArray[] = array(
            'registerID' =>$pushInfo["registerID"],
            'name' =>$pushInfo["name"]
          );
        }
      }
      $maxFaxID++;
    }
  }
  // commonPushFuncメソッドで、対象者全員に通知を送る。
  //（※FAXデータが複数存在するときに複数回通知が飛ぶこともありえる）
  header('Content-type: application/json');
  // 指定されたデータタイプに応じたヘッダーを出力する
  print(json_encode($pushJsonArray));
  exit();
?>