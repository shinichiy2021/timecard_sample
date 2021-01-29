<?php
  //*********************************************************/
  //* 定数定義                                               */
  //*********************************************************/
  // 開発環境の定数
  $accountName = $_POST["accountName"];
  $userName = $_POST["userName"];
  //******************************************************************
  // 通知を送るための共通処理
  // common_push
  // 作成者：yamazaki
  // 作成日：2017/6/30
  //******************************************************************
  date_default_timezone_set('Asia/Tokyo');
  $idm        = $_POST["idm"];
  $registerID = $_POST["registerID"];
  $companyID  = $_POST["companyID"];
  $staffID    = $_POST["staffID"];
  $msg        = $_POST["msg"];
  $mode       = $_POST["mode"];
  $groupID    = $_POST["groupID"];
  $smartPhoneName = $_POST["smartPhoneName"];
  $silentMode = $_POST["silentMode"];
  $pushInfo = $_POST["pushInfo"];
  $inputCsv   = '';
  $arrayMode  = explode("=", $mode);
  $viewMode   = $arrayMode[1];
  error_log($idm, 0);
  error_log($registerID, 0);
  error_log($registerID[1], 0);
  error_log($companyID, 0);
  error_log($staffID, 0);
  error_log($msg, 0);
  error_log($mode, 0);
  error_log($groupID, 0);
  error_log($smartPhoneName, 0);
  error_log($inputCsv, 0);
  error_log($viewMode, 0);
  $datetime = new DateTime();
  $today = $datetime->format('Y/m/d');
  //---------------------------------------------------------
  // 2018/05/08
  // yamazaki
  // 社長FAXから呼び出されたとき、転送情報の生成（JSON→1次元配列）
  //---------------------------------------------------------
  if ($registerID == "-1") {
    $decodeJson = json_decode($smartPhoneName, true);
    error_log($decodeJson, 0);
    error_log($decodeJson[0]["registerID"], 0);
    error_log($decodeJson[0]["name"], 0);
    $registerID = array();
    $smartPhoneName = array();
    foreach ($decodeJson as $decodeInfo) {
      $registerID[] = $decodeInfo["registerID"];
      $smartPhoneName[] = $decodeInfo["name"];
      error_log($decodeInfo["registerID"]);
      error_log($decodeInfo["name"]);
    }
  }
  for ($i = count($registerID) - 1; $i >= 0; $i--) {
    // レジスタIDから対象スタッフIDを取得
    // registerIDが存在していないときの処理
    if ($registerID[$i] == '' && $registerID[$i] == NULL) {
      continue;
    }
    $sendStaff = databaseGet(
      "SELECT".
      "  staffID,".
      "  companyID".
      " FROM".
      "  MK_smartPhone".
      " WHERE".
      "  registerID=N'".$registerID[$i]."'",
      $dsn,
      $userName,
      $password
    );
    // registerIDが存在していないときの処理
    if ($sendStaff == NULL) {
      break;
    }
    $companyID = $sendStaff[0]["companyID"];
    $staffID = $sendStaff[0]["staffID"];
    error_log($companyID, 0);
    error_log($staffID, 0);
    if ($viewMode == "0" || permit(
        $registerID[$i],
        $userName,
        $dsn,
        $password,
        $companyID,
        $staffID
        ) == true)
    {
      // 変数定義
      $tokenCode  = $registerID[$i];  //@$_REQUEST['tanmatuid'];
      $msgText    = $msg;
      // LINEと連携している場合
      if ($smartPhoneName[$i] == "LINE") {
        $access_token_rexcent = 'G2A2sb//5Of/Cp48uGsHyU8pAIXbs8N+Inhxy88vTiNEz3qtxvdnjSdG4gTLLxqVUBR1M9pV8pKToGlSoA8Eht7U5PiiftDyHoq2KJEToRp+gQ2aWWbkuABYvcOA+7Wv9JeB1IQk4qLaDM7s2z2F4AdB04t89/1O/w1cDnyilFU=';
        //==============================================================
        // UserInfoの取得
        //==============================================================
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $tokenCode));
        curl_setopt($ch, CURLOPT_URL, 'https://api.line.me/v2/profile');
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $userdata = json_decode($response);
        // $lineUserName = $userdata -> displayName; //表示名
        $userId = $userdata -> userId; //ユーザーID
        $userIcon = $userdata -> pictureUrl; //プロフィール画像URL
        curl_close($ch);

        //==============================================================
        // 通知の送信　ログインした人に個別で通知を送る処理
        //==============================================================
        $text = array(
            array(
            'type' => 'text',
            'text' => $msgText
            )
          );
        $lineMessage = array(
            'to' => $userId,
            'messages' => $text,
            'client_id'     => '1654480333',
            'client_secret' => 'e83b3f1a0ed4896eebfe53d742cba1fc'
        );
        $lineMessage = json_encode($lineMessage);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $access_token_rexcent, 'Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_URL, 'https://api.line.me/v2/bot/message/push');
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $lineMessage);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $lineMessage = curl_exec($ch);
        curl_close($ch);
      }
      // iPhone
      else if ($smartPhoneName[$i] == "iPhone") {
        $inputCsv   = $idm.",".$staffID.",".$groupID;   //@$_REQUEST['inputCsv'];
        error_reporting(-1);
        require_once 'ApnsPHP/Autoload.php';
        $push = new ApnsPHP_Push(
          ApnsPHP_Abstract::ENVIRONMENT_PRODUCTION,     // 製品用
          $pushInfo
        );
        $push->setRootCertificationAuthority('entrust_root_certification_authority.pem');
        try {
          $push->connect();
        } catch (Exception $e) {
            echo '捕捉した例外: ',  $e->getMessage(), "\n";
        }
        //==============================
        // バッチカウントの取得
        // 申請のバッチ
        // 2018/04/20
        // yamazaki
        //==============================
        $badgeCount = 0;
        $misyouninCount = databaseGet(
          "SELECT" .
          "    ISNULL(SUM(CASE WHEN sub1.shoninFlag = 0 THEN 1 END), 0) AS syoninMachi," .
          "    ISNULL(SUM(CASE WHEN sub1.shoninFlag = 1 THEN 1 END),0) AS syoninZumi," .
          "    ISNULL(SUM(CASE WHEN sub1.shoninFlag = 2 THEN 1 END), 0) AS syoninKyakka" .
          " FROM" .
          "    (SELECT" .
          "       shoninFlag" .
          "     FROM" .
          "       MK_sinsei" .
          "     WHERE" .
          "       (sinseiStaffID=N'" . $staffID . "' OR" .
          "        shoninStaffID=N'" . $staffID . "') AND" .
          "       companyID=N'" . $companyID . "'" .
          "     GROUP BY" .
          "       sinseiNo," .
          "       shoninFlag" .
          "    ) AS sub1",
          $dsn,
          $userName,
          $password
        );
        $badgeCount += intval($misyouninCount[0]["syoninMachi"]);
        error_log("sinseiCount :".intval($misyouninCount[0]["syoninMachi"]), 0);
        //==============================
        // バッチカウントの取得
        // やることの未読数の取得
        // 2018/04/20
        // yamazaki
        //==============================
        $todoNoReadCount = databaseGet(
            "SELECT" .
            "    COUNT(historyNo) AS noRead" .
            " FROM MK_history" .
            " WHERE" .
            "    category=0 AND" .
            "    staffID=N'" . $staffID . "' AND" .
            "    companyID=N'" . $companyID . "' AND" .
            "    flag=0",
          $dsn,
          $userName,
          $password
        );
        $badgeCount += intval($todoNoReadCount[0]["noRead"]);
        error_log("todoCount :".intval($todoNoReadCount[0]["noRead"]), 0);
        //==============================
        // バッチカウントの取得
        // 会話の未読数の取得
        // 2018/04/20
        // yamazaki
        //==============================
        $chatNoReadCount = databaseGet(
            "SELECT" .
            "    COUNT(historyNo) AS noRead" .
            " FROM MK_history" .
            " WHERE" .
            "    category  =1 AND" .
            "    staffID   =N'" . $staffID . "' AND" .
            "    companyID =N'" . $companyID . "' AND" .
            "    flag      =0",
          $dsn,
          $userName,
          $password
        );
        $badgeCount += intval($chatNoReadCount[0]["noRead"]);
        error_log("chatCount :".intval($chatNoReadCount[0]["noRead"]), 0);
        //==============================
        // バッチカウントの取得
        // お知らせの情報を取得
        // 2018/04/20
        // yamazaki
        //==============================
        $oshiraseCount = databaseGet(
          "SELECT" .
          "    COUNT(EV.eventNo) AS noRead" .
          " FROM (SELECT eventNo,staffID,title,subTitle,note,keisaiKigen FROM MK_event WHERE companyID=N'" . $companyID . "' AND keisaiKigen >=N'" . $today . "') AS EV" .
          " LEFT OUTER JOIN (SELECT externNo,staffID,flag FROM MK_history WHERE staffID=N'" . $staffID . "' AND companyID=N'" . $companyID . "' AND category ='2') AS HT ON" .
          "    EV.eventNo=HT.externNo" .
          " LEFT OUTER JOIN (SELECT name,staffID FROM MK_staff WHERE (MK_staff.companyID = N'" . $companyID . "')) AS CO ON" .
          "    EV.staffID=CO.staffID" .
          " WHERE" .
          "    (HT.flag='0' OR HT.flag='2')",
          $dsn,
          $userName,
          $password
        );
        $badgeCount += intval($oshiraseCount[0]["noRead"]);
        error_log("oshiraseCount :".intval($oshiraseCount[0]["noRead"]), 0);
        //==============================
        // バッチカウントの取得
        // FAX受信者の判定
        // 2018/04/20
        // yamazaki
        //==============================
        $faxHandCount = databaseGet(
          "SELECT" .
            "    COUNT(MK_historyOption.staffID) AS handCount" .
            " FROM" .
            "    MK_faxSend INNER JOIN" .
            "    MK_historyOption ON MK_faxSend.companyID = MK_historyOption.companyID AND" .
            "    MK_faxSend.faxID = MK_historyOption.externNo" .
            " WHERE" .
            "    MK_faxSend.faxFlag = 1 AND" .
            "    MK_historyOption.category = 6 AND" .
            "    MK_historyOption.flag = 0 AND" .
            "    MK_faxSend.companyID = N'" . $companyID . "' AND" .
            "    MK_historyOption.staffID = N'" . $staffID . "'" .
            " GROUP BY" .
            "    MK_historyOption.staffID," .
            "    MK_historyOption.flag",
          $dsn,
          $userName,
          $password
        );
        $badgeCount += intval($faxHandCount[0]["handCount"]);
        error_log("faxHandCount :".intval($faxHandCount[0]["handCount"]), 0);
        //------------------------------------
        // 通知処理
        //------------------------------------
        $message = new ApnsPHP_Message($tokenCode);
        $message->setCustomIdentifier("Message-Badge-1");
        $message->setBadge($badgeCount);
        if ($silentMode == "true") {
          //---------------------------------------------------
          // 2018/07/24
          // yamazaki
          // サイレント通知を送信する（※通知はされずにバッチのみ更新される）
          // 現状はiPhoneのみの対応とする
          //---------------------------------------------------
        } else {
          // 通常の通知を送信する
          $message->setText($msgText);
          $message->setSound();
        }
        $message->setCustomProperty('acme2', array('bang', 'whiz'));
        $message->setCustomProperty('acme3', array('bing', 'bong'));
        $message->setCustomProperty('viewMode', $mode);
        $message->setCustomProperty('inputCsv', $inputCsv);
        $message->setCustomProperty('IDm', $idm);
        $message->setExpiry(30);
        $push->add($message);
        $push->send();
        $push->disconnect();
        $aErrorQueue = $push->getErrors();
        if (!empty($aErrorQueue)) {
          var_dump($aErrorQueue);
        }
      }
      // Android
      else if ($smartPhoneName[$i] == "Android") {
        $messageText = $idm;
        $api_key  = "AIzaSyBMaqVhRkCiF8zQIazQy9WPFW-QOX75SLs";
        $base_url = "https://fcm.googleapis.com/fcm/send";
        // toに指定しているのはトピック名:testに対して一括送信するという意味
        // 個別に送信したい場合はここに端末に割り振られたトークンIDを指定する
        $data = array(
            "to"           => $tokenCode
            ,"priority"     => "high"
            ,"data" => array(
              "title" => "GAIA"
              ,"titleText" => $msgText
              ,"mode"    => $mode
              ,"message" => $messageText
            )
        );
        $header = array(
            "Content-Type:application/json"
            ,"Authorization:key=".$api_key
        );
        $context = stream_context_create(array(
            "http" => array(
                'method' => 'POST'
                ,'header' => implode("\r\n",$header)
                ,'content'=> json_encode($data)
            )
        ));
        file_get_contents($base_url,false,$context);
      }
    }
  }
//**********************************************************
// データベース取得の関数
//
// 作成者：yamazaki
// 作成日：2017/2/23
//
// 引数1： $sql       : 取得用のSQL
// 引数2： $dsn       : データベースのパス
// 引数3： $userName  : ログインユーザーネーム
// 引数4： $password  : ログインパスワード
//
// 戻り値： 取得したデータ配列
//**********************************************************
function databaseGet($sql, $dsn, $userName, $password) {
  $getData = NULL;
  try {
    $dbh = new PDO($dsn, $userName, $password);
    $stmt = $dbh->prepare($sql);
    $stmt -> execute();
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $getData[] = $row;
    }
    $dbh = NULL;
    return $getData;
  }
  catch (PDOException $e) {
    echo 'Error : ',  $e->getMessage(), "\n";
    die('MSSQL Serer Connect Error');
  }
}
//**********************************************************
// 通知可・不可の判定処理
//
// 作成者：yamazaki
// 作成日：2017/07/05
//
// 引数1： $register  : 端末識別番号
//**********************************************************
function permit(
  $register,
  $userName,
  $dsn,
  $password,
  $companyID,
  $staffID
) {
  $datetime = new DateTime();
  $today = $datetime->format('Y/m/d');
  $hh = $datetime->format('H');
  $mm = floatval($datetime->format('i'));
  $m1 = $mm / 60.0;
  $nowTime = $hh + $m1;  // Float型に変換して計算
  $calNo      = "";
  $holidayFlg = 0;
  $startPermit= "";
  $holi       = "";
  // カレンダーデータの取得
  $staffParam = databaseGet(
    "SELECT".
    "  calendarID" .
    " FROM".
    "  MK_staff" .
    " WHERE".
    "  staffID=N'".$staffID."' AND".
    "  companyID=N'".$companyID."'",
    $dsn,
    $userName,
    $password
  );
  if ($staffParam == NULL) {
    return false;
  }
  $calNo = $staffParam[0]["calendarID"];
  // 休日データの取得
  $holidayData = databaseGet(
    "SELECT".
    "  number,".
    "  calYmd,".
    "  holiday,".
    "  companyID".
    " FROM".
    "  MK_calendar".
    " WHERE".
    "  calYmd='".$today."' AND".
    "  companyID=N'".$companyID."' AND".
    "  number='".$calNo."'",
    $dsn,
    $userName,
    $password
  );
  if ($holidayData == NULL) {
    $holidayFlg = 0; // 平日
  }
  else {
    $holidayFlg = 1; // 休日
  }
  // 該当スタッフの情報を取得する
  $kojinData = databaseGet(
    "SELECT".
    "  DISTINCT MK_staff.staffID,".
    "  MK_staff.name,".
    "  MK_staff.entDate,".
    "  MK_staff.url,".
    "  MK_post.postName,".
    "  MK_kubun.kubunName,".
    "  MK_pattern.startWork,".
    "  MK_pattern.endWork".
    " FROM".
    "  MK_staff INNER JOIN".
    "  MK_post ON MK_staff.postID = MK_post.postID AND".
    "  MK_staff.companyID = MK_post.companyID INNER JOIN".
    "  MK_kubun ON MK_staff.kubun = MK_kubun.kubun AND".
    "  MK_staff.companyID = MK_kubun.companyID INNER JOIN".
    "  MK_pattern ON MK_staff.patternNo = MK_pattern.patternNo AND".
    "  MK_staff.companyID = MK_pattern.companyID".
    " WHERE".
    "  MK_staff.staffID=N'".$staffID."' AND".
    "  MK_staff.companyID=N'".$companyID."'",
    $dsn,
    $userName,
    $password
  );
  if ($kojinData == NULL) {
    return false;
  }
  else {
    $startPermit = $kojinData[0]["startWork"];
    $endPermit = $kojinData[0]["endWork"];
  }
  // 通知設定の取得
  $notifyData = databaseGet(
    "SELECT ".
    "  startPermit,".
    "  endPermit,".
    "  holiday,".
    "  weekday".
    " FROM".
    "  MK_kojinSet".
    " WHERE".
    "  staffID='".$staffID."' AND".
    "  companyID='".$companyID."'",
    $dsn,
    $userName,
    $password
  );
  $weekdayFlag = 0;
  if($notifyData == NULL){
    $holi = "0";
  }else{
      $holi = $notifyData[0]["holiday"];
      $weekdayFlag = intval($notifyData[0]["weekday"]);
      switch ($weekdayFlag) {
      case 0:
        $startPermit = $startPermit;
        $endPermit = $endPermit;
        break;
      case 1:
        $startPermit = "0.0";
        $endPermit = "0.0";
        break;
      case 2:
        $startPermit = "5.0";
        $endPermit = "22.0";
        break;
    }
  }
  // 最終判定
  if ($holidayFlg == 1) {
    // 休日の時
    if ($holi == "0") {
      // 休日通知無し設定の時
      return false;
    }
    else {
      // 休日通知する設定の時で現在時刻が通知可能時刻範囲の時
      if (('0' == $startPermit && '0' == $endPermit) ||         // 終日許可の判定
        ($nowTime >= $startPermit && $nowTime <= $endPermit))   // 勤務時間内の判定
      {
        return true;
      }
      else {
        // 通知可能時間を過ぎている時
        return false;
      }
    }
  }
  else {
    // 平日の時
    if (('0' == $startPermit && '0' == $endPermit) ||           // 終日許可の判定
        ($nowTime >= $startPermit && $nowTime <= $endPermit))   // 勤務時間内の判定
    {
        return true;
    }
    else {
      // 通知可能時間を過ぎている時
      return false;
    }
  }
  return true;
}

?>