<?php

// グローバル変数の宣言
$dakokuWhere = '';
//******************************************************************
// 待ち受け画面の出力データ取得関数
// 関数名：waitTopShow
// 作成者：yamazaki
// 作成日：2017/2/27
// 引数1: $datetime   : 現在日付
// 引数2: $compID     : 会社番号
// 戻り値1: kinkyuJyoho   : 緊急情報
// 戻り値2: sinchakuJyoho : 新着情報
// 戻り値3: errorData     : 打刻忘れ情報
//******************************************************************
function waitTopShow(
    $datetime, 
    $compID, 
    $accountName, 
    $userName
  ) {
  //****************************************************
  // 2017/08/11
  // yamazaki
  // SQLで緊急情報を取得する
  // 緊急情報、通常情報の取得方法を修正しました。
  //****************************************************
  $sql = <<<"EOM"
    SELECT
        eventNo AS emNo,
        title,
        subTitle,
        keisaiKigen,
        note
    FROM MK_event
    WHERE
        keisaiKigen >= N'{$datetime->format('Y/m/d')}' AND
        title       = N'緊急情報' AND
        companyID   = N'{$compID}'
    ORDER BY
        keisaiKigen ASC
EOM;
  $kinkyuJyoho = databaseGet($sql, $accountName, $userName);
  //****************************************************
  // SQLで新着情報を取得する
  //****************************************************
  // 2017/08/11 yamazaki 緊急情報、通常情報の取得方法を修正しました。
  $sql = <<<"EOM"
    SELECT
        eventNo AS emNo,
        title,
        subTitle,
        keisaiKigen,
        note
    FROM MK_event
    WHERE
        keisaiKigen >= N'{$datetime->format('Y/m/d')}' AND
        title       = N'通常情報' AND
        companyID   = N'{$compID}'
    ORDER BY
        keisaiKigen ASC
EOM;
  $sinchakuJyoho = databaseGet($sql, $accountName, $userName);
  //****************************************************
  // 打刻忘れを取得する
  //****************************************************
  $sql =
    "SELECT " .
    " MK_kintai.staffID,MK_kintai.ymd,ISNULL(MK_kintai.inOffice, '') AS inOffice, " .
    " ISNULL(MK_kintai.outOffice, '') AS outOffice, MK_staff.name " .
    " FROM " .
    " MK_kintai INNER JOIN MK_staff " .
    " ON MK_kintai.staffID = MK_staff.staffID " .
    " AND MK_kintai.companyID = MK_staff.companyID " .
    " WHERE " .
    " MK_kintai.ymd <> N'".$datetime->format('Y/m/d')."'".
    " AND ISNULL(MK_kintai.outOffice, '') = ''" .
    " AND MK_kintai.companyID=N'".$compID."'".
    $GLOBALS['dakokuWhere'].
    " ORDER BY MK_kintai.staffID ASC, MK_kintai.ymd DESC";
  $errorData = databaseGet($sql, $accountName, $userName);
  return array(
    'kinkyuJyoho'   => $kinkyuJyoho,
    'sinchakuJyoho' => $sinchakuJyoho,
    'errorData'     => $errorData,
    'zangyoData'    => $zangyoData,
    'todayKintai'   => $todayKintai
  );
}
//=========================================
// 10進数の時間を分単位に変換する
//=========================================
function toMinute($value) {
  $roudou = strval($value);
  $roudouArray = explode(".", $roudou);
  $roudouT = intval($roudouArray[0]);
  $roudouM = floatval("0." . $roudouArray[1]) * 60.0;
  $roudouM = round($roudouM);
  if ($roudouM == 0.0) {
    $roudouM = 0.0;
  }
  else if ($roudouM == 60.0) {
    if ($roudouT == 23) {
      $roudouT = 24;
    }
    else {
      $roudouT++;
    }
    $roudouM = 0.0;
  }
  return $roudouT * 60.0 + $roudouM;
}
//******************************************************************
// 勤務時間、残業時間の算出
// 関数名：keisanKintai
// 作成者：yamazaki
// 作成日：2017/2/25
// 引数1:  restTime       休憩時間
// 引数2:  maruStartTime  出勤時の丸め単位
// 引数3:  endTime        実際の退勤時刻
// 引数4:  endMarume      退勤時の丸め単位
// 引数4:  kisokuTime     就業規則の時間
// 引数5:  underTimeSum   当日の就業時間
// 戻り値1: inTime      所定時間
// 戻り値2: outTime       残業時間
//******************************************************************
function keisanKintai(
  $restTime,
  $maruStartTime,
  $endTime,
  $endMarume,
  $kisokuTime,
  $underTimeSum
) {
  // 日単位設定時の計算
  // 所定、所定外、残業の算出
  $intKisoku = $kisokuTime * 60.0;
  $minutesOutTime = 0.0;
  $minutesInTime = toMinute($endTime) - toMinute($maruStartTime) - toMinute($restTime);
  $minutesInTime = floor($minutesInTime / toMinute($endMarume)) * toMinute($endMarume);
  $minutesUnderTimeSum = $minutesInTime + toMinute($underTimeSum);

  if ($minutesUnderTimeSum > $intKisoku) {
    $minutesInTime = $intKisoku - toMinute($underTimeSum);
    $minutesOutTime = $minutesUnderTimeSum - $intKisoku;
  }
  else {
    $minutesOutTime = 0.0;
  }
  if ($minutesInTime < 0.0) {
    $minutesInTime = 0.0;
  }
  if ($minutesOutTime < 0.0) {
    $minutesInTime = 0.0;
  }
  return array(
    'inTime' => $minutesInTime / 60.0,
    'outTime' => $minutesOutTime / 60.0
  );
}
//**********************************************//
// 切り捨て処理
//**********************************************//
function kirisute($val, $powValue) {
  $value = floatval($val);
  return floatval(floor($value * pow(10, $powValue))) / pow(10, $powValue);
}
//******************************************************************
// 休憩時間の計算
// 関数名：keisanRest
// 作成者：yamazaki
// 作成日：2017/2/25
// 修正日：2017/11/02 yamazaki 夜勤対応のため取得する休憩時間から、
//         該当する夜勤勤務時間を算出する機能を追加しました
// 引数1： $timeTable  : タイムテーブル
// 引数2： $startTime  : 出勤時間（実働時間）
// 引数3： $endTime    : 退勤時間（実働時間）
// 戻り値： 計算結果（休憩時間）
//******************************************************************
function keisanRest(
  $startMarume,             // 出勤丸め時間
  $endMarume,               // 退勤丸め時間
  $timeTable,               // タイムテーブル
  $startTime,               // 出勤時間
  $endTime,                 // 退勤時間
  $patternNoneFlag,         // 勤務パターン無しフラグ
  $patternNone1,            // 勤務パターン無し時の休憩設定①
  $patternNone2,            // 退勤務パターン無し時の休憩設定②
  $patternNone3,            // 勤務パターン無し時の休憩設定③
  $kintaiNo                 // 勤怠No
) {
  $restTime       = 0.0;
  $minStartTime   = toMinute($startTime);
  $minEndTime     = toMinute($endTime);
  $minStartMarume = toMinute($startMarume);
  $minEndMarume   = toMinute($endMarume);
  $maruPatternNone1   = toMinute($patternNone1);
  $maruPatternNone2   = toMinute($patternNone2);
  $maruPatternNone3   = toMinute($patternNone3);
  $maruKintaiTime = $minEndTime - $minStartTime;
  error_log("patternNoneFlag:　".$patternNoneFlag);
  error_log("patternNone1:　".$patternNone1);
  error_log("patternNone2:　".$patternNone2);
  error_log("patternNone3:　".$patternNone3);
  error_log("kintaiNo:　".$kintaiNo);
  error_log("maruKintaiTime:　".$maruKintaiTime);
  // 勤務パターンなしの時
  if ("0" == $patternNoneFlag) {
    if ("0" == $kintaiNo) {
      // 休憩時間を計算する
      if ($maruKintaiTime > 480) {
        $restTime = $maruPatternNone3;
      } else if ($maruKintaiTime > 360) {
        $restTime = $maruPatternNone2;
      } else {
        $restTime = $maruPatternNone1;
      }
    } else {
      // 休憩時間は0とする
      $restTime = 0;
    }
  // 勤務パターン有りの時
  // タイムテーブルから休憩時間を計算する
  } else {
    for ($j = 0; $j < count($timeTable); $j++) {
      $startRest    = kirisute($timeTable[$j]["startRest"], 10);
      $endRest      = kirisute($timeTable[$j]["endRest"], 10);
      $minStartRest = toMinute($startRest);
      $minEndRest   = toMinute($endRest);
      // パターン１（休憩をとらない時）
      if ($minStartRest <= $minStartTime && $minEndRest <= $minStartTime) {
      }
      // パターン５（休憩をとらない時）
      else if ($minStartRest >= $minEndTime && $minEndRest >= $minEndTime) {
      }
      // パターン６（勤務時間内に休憩をとったとき）
      else if ($minStartTime <= $minStartRest && $minEndRest <= $minEndTime) {
        $restTime += $minEndRest - $minStartRest;   // まるめしなくてよい
      }
      // パターン２（休憩時間中に外出した時）
      // 休憩中の出勤は勤務時間とする。
      else if ($minStartTime <= $minStartRest && $minEndTime <= $minEndRest) {
        $restTime += floor(($minEndTime - $minStartRest) / $minEndMarume) * $minEndMarume;
      }
      // パターン４（休憩時間中に戻りした時）
      // 休憩中の出勤は勤務時間とする。
      else if ($minStartRest <= $minStartTime && $minEndRest <= $minEndTime) {
        $restTime += floor(($minEndRest - $minStartTime) / $minStartMarume) * $minStartMarume;
      }
      // パターン３（休憩時間内に外出、戻りをした時）
      // 休憩中の出勤は勤務時間とする。
      else {
      }
    }
  }
  error_log("休憩時間：　".$restTime);
  return ($restTime / 60.0);
}
function yakinKeisanRest(
  $startMarume,             // 出勤丸め時間
  $endMarume,               // 退勤丸め時間
  $timeTable,               // タイムテーブル
  $startTime,               // 出勤時間
  $endTime                  // 退勤時間
) {
  $restTime       = 0.0;
  $minStartTime   = toMinute($startTime);
  $minEndTime     = toMinute($endTime);
  $minStartMarume = toMinute($startMarume);
  $minEndMarume   = toMinute($endMarume);
    for ($j = 0; $j < count($timeTable); $j++) {
      $startRest    = kirisute($timeTable[$j]["startRest"], 10);
      $endRest      = kirisute($timeTable[$j]["endRest"], 10);
      $minStartRest = toMinute($startRest);
      $minEndRest   = toMinute($endRest);
      // パターン１（休憩をとらない時）
      if ($minStartRest <= $minStartTime && $minEndRest <= $minStartTime) {
      }
      // パターン５（休憩をとらない時）
      else if ($minStartRest >= $minEndTime && $minEndRest >= $minEndTime) {
      }
      // パターン６（勤務時間内に休憩をとったとき）
      else if ($minStartTime <= $minStartRest && $minEndRest <= $minEndTime) {
        $restTime += $minEndRest - $minStartRest;   // まるめしなくてよい
      }
      // パターン２（休憩時間中に外出した時）
      // 休憩中の出勤は勤務時間とする。
      else if ($minStartTime <= $minStartRest && $minEndTime <= $minEndRest) {
        $restTime += floor(($minEndTime - $minStartRest) / $minEndMarume) * $minEndMarume;
      }
      // パターン４（休憩時間中に戻りした時）
      // 休憩中の出勤は勤務時間とする。
      else if ($minStartRest <= $minStartTime && $minEndRest <= $minEndTime) {
        $restTime += floor(($minEndRest - $minStartTime) / $minStartMarume) * $minStartMarume;
      }
      // パターン３（休憩時間内に外出、戻りをした時）
      // 休憩中の出勤は勤務時間とする。
      else {
      }
  }
  error_log("夜勤休憩時間：　".$restTime);
  return ($restTime / 60.0);
}
//**********************************************//
// 打刻時間の正規化（通常）
//**********************************************//
function makeDateTimeJson($datetime) {
  $week_str_list = array( '日', '月', '火', '水', '木', '金', '土');
  $hh     = $datetime->format('H');
  $mm     = floatval($datetime->format('i'));
  $m1     = $mm / 60.0;
  $hhm1 = $hh + $m1;  // Float型に変換して計算
  $week   = $week_str_list[$datetime->format('w')];
  $return = array(
    'ymd'      => $datetime->format('Y/m/d'),
    'time'     => $hhm1,
    'week'     => $week,
    'datetime' => $datetime
  );
  return $return;
}
//**********************************************//
// 打刻時間の正規化（夜勤モード打刻の時）
//**********************************************//
function makeDateTimeJson_yakinMode($datetime) {
  $week_str_list = array( '日', '月', '火', '水', '木', '金', '土');
  $hh = $datetime->format('H');
  $mm = floatval($datetime->format('i'));
  $m1 = $mm / 60.0;
  $hhm1 = $hh + $m1;  // Float型に変換して計算
  // 今日の日付文字列を渡す前日を求める。
  $hhm1 = $hhm1 + 24.0;
  $datetime->modify('-1 days');
  $week = $week_str_list[$datetime->format('w')];
  $return = array(
    'ymd'      => $datetime->format('Y/m/d'),
    'time'     => $hhm1,
    'week'     => $week,
    'datetime' => $datetime
  );
  return $return;
}
//**********************************************//
// 2018/06/13
// yamazaki
// カード情報の取得
//**********************************************//
function getCardInfo($IDm, $accountName, $userName, $loginCompanyNo) {
  $sql =
    "SELECT".
    "    ISNULL(MK_staff.retireDate,'') AS retireDate,".
    "    ISNULL(MK_staff.entDate,'') AS entDate,".
    "    MK_staff.calendarID,".
    "    MK_smartPhone.staffID,".
    "    MK_smartPhone.registerID,".
    "    MK_smartPhone.name,".
    "    MK_smartPhone.companyID".
    " FROM MK_staff".
    " INNER JOIN MK_smartPhone ON".
    "    MK_staff.companyID=MK_smartPhone.companyID AND".
    "    MK_staff.staffID=MK_smartPhone.staffID".
    " WHERE".
    "    MK_smartPhone.staffID=(SELECT staffID FROM MK_smartPhone WHERE idm=N'" . $IDm . "') AND".
    "    MK_staff.companyID=(SELECT companyID FROM MK_smartPhone WHERE idm=N'" . $IDm . "')";
  $IDmData = databaseGet($sql, $accountName, $userName);
  if ($IDmData == NULL) {
    $json = array(
      'errorCode'=>'1', 'message'=>'カード情報が登録されていません。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  // 別会社のカードで打刻が出来てしまう時のエラーチェック #123
  if ($loginCompanyNo != $IDmData[0]['companyID']) {
    $json = array(
      'errorCode'=>'5',
      'message'=>'他の会社で使用されているカードです。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  return $IDmData;
}
//**********************************************//
// 2018/06/13
// yamazaki
// 会社マスタから時間外の算出フラグと所定時間を取得する
//**********************************************//
function getCompanyInfo($compID, $accountName, $userName) {
  $kisokuData = NULL;
  $sql =
    "SELECT".
    "    ISNULL(stopYmd,'') AS stopYmd,".
    "    presTime      ,".
    "    presFlag      ,".
    "    yakinKugiriTime".
    " FROM MK_company".
    " WHERE".
    "    companyID=N'".$compID."'";
  $kisokuData = databaseGet($sql, $accountName, $userName);
  if ($kisokuData == NULL) {
    $json = array(
      'errorCode'=>'2', 'message'=>'時間外の算出フラグと所定時間が登録されていません。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  return $kisokuData;
}
//**********************************************//
// 2018/06/14
// yamazaki
// スタッフ情報を取得する
//**********************************************//
function getStaffInfo($staffID, $compID, $accountName, $userName) {
  $sql =
    "SELECT".
    "    MK_staff.patternNo,".
    "    MK_staff.name,".
    "    MK_staff.calendarID,".
    "    MK_staff.entDate,".
    "    MK_staff.retireDate,".
    "    MK_post.postName".
    " FROM MK_staff".
    " INNER JOIN MK_post ON".
    "    MK_staff.postID=MK_post.postID AND".
    "    MK_staff.companyID=MK_post.companyID".
    " WHERE".
    "    MK_staff.staffID=N'".$staffID."' AND".
    "    MK_post.companyID=N'".$compID."'";
  $staffData = databaseGet($sql, $accountName, $userName);
  if ($staffData == NULL) {
    $json = array(
      'errorCode'=>'3', 'message'=>'スタッフ番号が存在しません。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  return $staffData[0];
}
//**********************************************//
// 2018/06/14
// yamazaki
// パターンマスターからパターンの取得
//**********************************************//
function getKintaiPattern($patternNo, $compID, $accountName, $userName) {
  $sql =
    "SELECT".
    "    startWork,".
    "    endWork,".
    "    startMarume,".
    "    endMarume,".
    "    restMarume,".
    "    endDate,".
    "    pattern_none_flag,".
    "    pattern_none_1,".
    "    pattern_none_2,".
    "    pattern_none_3".
    " FROM MK_pattern".
    " WHERE".
    "    patternNo=".$patternNo." AND".
    "    companyID=N'".$compID."'";
  $patternData = databaseGet($sql, $accountName, $userName);
  if ($patternData == NULL) {
    $json = array(
      'errorCode'=>'6', 'message'=>'勤務パターンが取得できませんでした。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  return $patternData[0];
}
//**********************************************//
// 2018/06/14
// yamazaki
// 例外チェック項目
//**********************************************//
function reigaiCheck(
  $stopYmd,
  $yymmdd,
  $staffID,
  $entDate,
  $staffData,
  $retireDate)
{
  // 有料会員又は無料期間の判定
  if ($stopYmd != "" && $stopYmd <= $yymmdd) {
    $json = array(
      'errorCode'=>'4', 'message'=>'無料利用期間が終了したため打刻できませんでした。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  // 入社日付のチェック
  if ($entDate != "" && $entDate > $yymmdd) {
    $json = array(
      'errorCode' =>'5',
      'message'   =>'スタッフ '.$staffID.' : '.$staffData["name"].' さんの入社日は （'.$entDate.'） です。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
  // 退職日付のチェック
  if ($retireDate != "" && $retireDate < $yymmdd) {
    $json = array(
      'errorCode'=>'5',
      'message'=>'スタッフ '.$staffID.' : '.$staffData["name"].' さんは退職しています。'
    );
    header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
    print(json_encode($json));
    exit();
  }
}
//**********************************************//
// 2018/06/14
// yamazaki
// 打刻処理
// 戻り値：勤怠フラグ
//**********************************************//
function dakokuShori(
  // データ
  $staffData,
  // 識別番号
  $compID,
  $calID,
  $staffID,
  // 時間関連
  $datetime,
  $presTime,
  $yakinKugiriTime,
  // 勤怠関連
  $startWork,
  $startMarume,
  $endWork,
  $endMarume,
  $patternNoneFlag,
  $patternNone1,
  $patternNone2,
  $patternNone3,
  // フラグ関連
  $presFlag,
  $yakinFlag,
  $kintaiFlag,
  $dakokuYakinFlag,
  // 位置情報
  $position,
  $positionAddress,
  // 拠点情報
  $pointNo,
  $accountName,
  $userName
) {
  $DAKOKU_WAIT_TIME = 5.0 / 60.0;  // 同一端末の打刻待ち時間（５分）
  // 日付の正規化をする
  $nowDateTime   = makeDateTimeJson($datetime);
  $nowTime       = floatval($nowDateTime["time"]);
  $yymmdd        = $nowDateTime["ymd"];
  $dw            = $nowDateTime["week"];
  $datetime      = $nowDateTime["datetime"];
  $week_str_list = array( '日', '月', '火', '水', '木', '金', '土');
  // 取得したカレンダーから休日設定の取得
  $sql =
    "SELECT".
    "    calYmd,".
    "    holiday".
    " FROM MK_calendar" .
    " WHERE".
    "    companyID=N'".$compID."' AND".
    "    number=".$calID." AND".
    "    calYmd=N'".$yymmdd."'";
  $holiday = databaseGet($sql, $accountName, $userName);
  $holidayFlag = 2;  //平日
  if ($holiday != NULL) {
    $holidayFlag = intval($holiday[0]["holiday"]);  // 休日
  }
  // タイムテーブルの取得
  $sql =
    "SELECT".
    "    timeTableNo,".
    "    startRest,".
    "    endRest".
    " FROM MK_timeTable".
    " WHERE".
    "    patternNo=".$staffData["patternNo"]." AND".
    "    companyID=N'".$compID."'";
  $timeTable = databaseGet($sql, $accountName, $userName);
  // 変数定義
  $restTime      = 0.0;
  $startTime     = 0.0;
  $maruStartTime = 0.0;
  $endTime       = 0.0;
  $maruEndTime   = 0.0;
  $underTime     = 0.0;   // 労働時間
  $inTime        = 0.0;   // 所定内
  $outTime       = 0.0;   // 所定外
  $holyTime      = 0.0;   // 法定休日勤務時間
  // $kintaiRest    = 0.0;
  $midStart      = 0.0;   // 深夜勤務時間の開始時間
  $midEnd        = 0.0;   // 深夜勤務時間の終了時間
  $midRest       = 0.0;   // 深夜勤務時間中の休憩時間
  $midnight      = 0.0;   // 休憩時間を引いた実際の深夜勤務時間
  // 直近の打刻データに夜勤打刻モードのデータがある時（マッピング情報5_1を参照）
  $yesterday = new Datetime($yymmdd);
  $yesterday->modify('-1 days');
  $whereYakinFlag = '';
  if ($yakinFlag == 0) {
    $whereYakinFlag = ' AND KINTAI.yakinFlag = 1';
  }
  $sql =
    "SELECT".
    "    KINTAI.ymd           ,".
    "    KINTAI.kintaiNo      ,".
    "    KINTAI.maruInOffice  ,".
    "    KINTAI.maruOutOffice".
    " FROM MK_kintai AS KINTAI".
    " INNER JOIN MK_company AS COMPANY ON".
    "    COMPANY.companyID=KINTAI.companyID".
    " WHERE".
    "    KINTAI.staffID=N'".$staffID."' AND".
    "    KINTAI.companyID=N'".$compID."' AND".
    "    KINTAI.ymd>=N'".$yesterday->format('Y/m/d')."'".
    $whereYakinFlag.
    " ORDER BY".
    "    KINTAI.ymd DESC,".
    "    KINTAI.kintaiNo ASC";
  $yakinModeDakokuData = databaseGet($sql, $accountName, $userName);
  if ($yakinModeDakokuData != NULL) {
    $yakinInTime = kirisute($yakinModeDakokuData[0]["maruInOffice"], 10);
    if ($yakinInTime + $yakinKugiriTime >= $nowTime + 24.0) {
        // 日付の正規化をする
        $nowDateTime     = makeDateTimeJson_yakinMode($datetime);
        $nowTime         = floatval($nowDateTime["time"]);
        $yymmdd          = $nowDateTime["ymd"];
        $dw              = $nowDateTime["week"];
        $datetime        = $nowDateTime["datetime"];
        $dakokuYakinFlag = 1;
      }
  }
  // 該当スタッフの同一日付 打刻データを取得する（マッピング情報5を参照）
  $sql =
    "SELECT".
    "    MK_kintai.kintaiNo            ,".
    "    MK_kintai.staffID             ,".
    "    MK_kintai.ymd                 ,".
    "    ISNULL(MK_kintai.inOffice     ,0)as inOffice,".
    "    ISNULL(MK_kintai.outOffice    ,0) as outOffice,".
    "    ISNULL(MK_kintai.maruInOffice ,0)as maruInOffice,".
    "    ISNULL(MK_kintai.maruOutOffice,0)as maruOutOffice,".
    "    ISNULL(MK_kintai.restTime     ,0)as restTime,".
    "    ISNULL(MK_kintai.underTime    ,0)as underTime,".
    "    ISNULL(MK_kintai.overTime     ,0)as overTime,".
    "    ISNULL(MK_kintai.midnight     ,0)as midnight".
    " FROM MK_kintai".
    " WHERE".
    "    MK_kintai.staffID=N'".$staffID."' AND".
    "    MK_kintai.ymd    =N'".$yymmdd."' AND".
    "    companyID        =N'".$compID."'".
    " ORDER BY".
    "    kintaiNo ASC";
  $kintaiData = databaseGet($sql, $accountName, $userName);
  /////////////////////////////////////////////////////
  // 3.1_出勤 or 遅刻
  // 同一ユーザー同一日付データが無い時
  /////////////////////////////////////////////////////
  if ($kintaiData == NULL) {
    // 出勤時間が勤務開始前の時は勤務出勤時間を使用する。
    if ($nowTime <= $startWork) {
      $maruStartTime = $startWork;
    }
    // 勤務時間後（遅刻）の時は丸め後の打刻時間を使用する
    else {
      $maruStartTime = ceil(kirisute($nowTime / $startMarume, 5)) * $startMarume;
    }
    // 出勤打刻処理を行う マッピング情報8を参照
    $sql =
      "INSERT INTO MK_kintai(".
      "    staffID     ,".
      "    ymd         ,".
      "    kintaiNo    ,".
      "    youbi       ,".
      "    inOffice    ,".
      "    maruInOffice,".
      "    companyID   ,".
      "    yakinFlag   ,".
      "    inPosition  ,".
      "    inPositionAdd, ".
      "    inPointNo      ".
      ")".
      " VALUES(".
      "    N'". $staffID . "'      ,".
      "    N'". $yymmdd  . "'      ,".
      "    0,".
      "    N'". $dw      . "'      ,".
      "    '" . $nowTime . "'      ,".
      "    '" . $maruStartTime   . "',".
      "    N'". $compID          . "',".
      "    N'".$dakokuYakinFlag."',".
      "    N'".$position       ."',".
      "    N'".$positionAddress."',".
      "    N'".$pointNo."'".
      ")";
    databaseSet($sql, $accountName, $userName);
    $kintaiFlag = 1;
  }
  /////////////////////////////////////////////////////
  // 勤怠データが存在する時（退勤の時、外出戻りの時）
  /////////////////////////////////////////////////////
  else {
    if ($dakokuYakinFlag == 0) {
      // 日付の正規化をする（０時から４時５９分までを前日の打刻扱いにする）
      $nowDateTime = makeDateTimeJson($datetime);
      $nowTime     = floatval($nowDateTime["time"]);
      $yymmdd      = $nowDateTime["ymd"];
      $dw          = $nowDateTime["week"];
      $datetime    = $nowDateTime["datetime"];
    }
    $i = count($kintaiData) - 1;
    $maruStartTime = kirisute($kintaiData[$i]["maruInOffice"], 10);
    $startTime     = kirisute($kintaiData[$i]["inOffice"], 10);
    $maruEndTime   = kirisute(floor($nowTime / $endMarume) * $endMarume, 10);
    $endTime       = $nowTime;
    // 同じ人が続けて打刻する場合（5分以内の打刻の時）
    if (($endTime - $startTime) <= $DAKOKU_WAIT_TIME) {
      $waitTopShowData = waitTopShow($datetime, $compID, $accountName, $userName);
      $json = array(
        'errorCode'     => '7',
        'message'       => '打刻は正しく処理されました。',
        'staffID'       => $staffID,
        'staffName'     => $staffData["name"],
        'compID'        => $compID,
        'yymmdd'        => $datetime->format('Y/m/d'),
        'dakokuTime'    => $nowTime,
        'yakinFlag'     => $yakinFlag,
        'kintaiFlag'    => $kintaiFlag,
        'IDmData'       => $staffData,
        'kinkyuJyoho'   => $waitTopShowData["kinkyuJyoho"],
        'sinchakuJyoho' => $waitTopShowData["sinchakuJyoho"],
        'errorData'     => $waitTopShowData["errorData"]
      );
      // 指定されたデータタイプに応じたヘッダーを出力する
      header('Content-type: application/json');
      print(json_encode($json));
      exit();
    }
    //-----------------------------------------------------
    // 外出時の退勤の時
    // FLOAT型は、NULLの時に0.0を返す
    //-----------------------------------------------------
    if ($kintaiData[$i]["outOffice"] == "0.0") {
      // 休憩時間の計算
      $restTime = keisanRest(
        $startMarume,
        $endMarume,
        $timeTable,    // 勤怠テーブルリスト
        $maruStartTime,//$startTime,    // 出勤時間
        $endTime,       // 退勤時間
        $patternNoneFlag,
        $patternNone1,
        $patternNone2,
        $patternNone3,
        $kintaiData[$i]["kintaiNo"]
      );
      // 勤務時間、残業時間の算出
      $hanteiTime = NULL;
      // 日単位設定の時
      if ($presFlag == 0) {
        if ($holidayFlag == 0) {
          // 法定休日の時
          $minutesInTime = toMinute($endTime) - toMinute($maruStartTime) - toMinute($restTime);
          $minutesInTime = floor($minutesInTime / toMinute($endMarume)) * toMinute($endMarume);
          $inTime        = 0.0;
          $outTime       = 0.0;
          $holyTime      = $minutesInTime / 60.0;
          $underTime     = $holyTime;
        }
        else if ($holidayFlag == 1) {
          // 公休日の時
          $minutesInTime = toMinute($endTime) - toMinute($maruStartTime) - toMinute($restTime);
          $minutesInTime = floor($minutesInTime / toMinute($endMarume)) * toMinute($endMarume);
          $inTime    = 0.0;
          $outTime   = $minutesInTime / 60.0;
          $holyTime  = 0.0;
          $underTime = $outTime;
        }
        else {
          // 平日の時
          $sql =
            "SELECT".
            "    SUM(underTime) AS max".
            " FROM MK_kintai".
            " WHERE".
            "    companyID=N'".$compID."' AND".
            "    staffID=N'".$staffID."' AND".
            "    ymd=N'".$yymmdd."'";
          $underTimeSum = databaseGet($sql, $accountName, $userName);
          $kintaiTime = keisanKintai(
            $restTime,
            $maruStartTime,
            $endTime,
            $endMarume,
            $presTime,
            floatval($underTimeSum[0]["max"])
          );
          $inTime    = kirisute($kintaiTime["inTime"], 10);
          $outTime   = kirisute($kintaiTime["outTime"], 10);
          $holyTime  = 0.0;
          $underTime = $inTime + $outTime;
        }
      }
      else {
        // 週単位所定外設定の時、前の日曜日を取得する
        $preDate = new DateTime($datetime->format('Y-m-d H:i:s'));
        if ($presFlag == 1) {
          $preDate->modify('-'.$preDate->format('w').' days');
        }
        // 週単位設定の時
        // 打刻日の週の先頭日曜日からの法定休日の勤務を除く勤務時間の集計
        $preTotal = 0.0;
        $sql =
          "SELECT".
          "    SUM(inTime + overTime) AS kinmuTime".
          " FROM MK_kintai".
          " WHERE".
          "    staffID=N'".$staffID."' AND".
          "    ymd BETWEEN N'".$preDate->format('Y/m/d')."' AND N'".$yymmdd."' AND".
          "    companyID=N'".$compID."'";
        $preTotalData = databaseGet($sql, $accountName, $userName);
        if ($preTotalData != NULL) {
          $preTotal = floatval($preTotalData[0]["kinmuTime"]);
        }
        // 打刻日の総勤務時間
        $minutesUnderTime = toMinute($endTime) - toMinute($maruStartTime) - toMinute($restTime);
        $minutesUnderTime = floor($minutesUnderTime / toMinute($endMarume)) * toMinute($endMarume);
        $underTime = kirisute($minutesUnderTime / 60.0, 10);
        // 合算した値が週単位設定の時間数を超えている場合、所定外とする
        $hanteiTime = $preTotal + $underTime;
        if ($holidayFlag == 2 || $holidayFlag == 1) {
          // 平日の時と公休日の時
          if ($hanteiTime > $presTime) {
            // 前回打刻までの合計が設定時間数以下の時
            if ($preTotal < $presTime) {
              $outTime = kirisute($hanteiTime - $presTime, 10);
              $inTime  = kirisute($underTime - $outTime, 10);
            }
            else {
              $outTime = $underTime;
            }
          }
          else {
            $inTime = $underTime;
          }
        }
        else if ($holidayFlag == 0) {
          // 法定休日の時
          $outTime = 0.0;
          $holyTime = $underTime;
        }
      }
      //================================================
      // 深夜残業の計算
      //================================================
      // パターン1（夜勤 例：20時〜33時など）
      if ($maruStartTime <= 22.0 && $nowTime >= 29.0) {
        $midnight = 7.0;
        $midStart = 22.0;
        $midEnd   = 29.0;
      }
      // パターン2（夜勤 例：20時〜24時など）
      else if ($maruStartTime <= 22.0 && $nowTime >= 22.0 && $nowTime <= 29.0) {
        $midnight = $nowTime - 22.0;
        $midStart = 22.0;
        $midEnd   = $nowTime;
      }
      // パターン3（夜勤 例：23時〜28時など）
      else if ($maruStartTime >= 22.0 && $nowTime >= 22.0 && $nowTime <= 29.0) {
        $midnight = $nowTime - $maruStartTime;
        $midStart = $maruStartTime;
        $midEnd   = $nowTime;
      }
      // パターン4（夜勤 例：0時〜3時など）
      else if ($maruStartTime >= 0.0 && $nowTime <= 5.0) {
        $midnight = $nowTime - $maruStartTime;
        $midStart = $maruStartTime;
        $midEnd   = $nowTime;
      }
      // パターン5（夜勤 例：23時〜30時など）
      else if ($maruStartTime >= 22.0 && $maruStartTime <= 29.0 && $nowTime >= 29.0) {
        $midnight = 29.0 - $maruStartTime;
        $midStart = $maruStartTime;
        $midEnd   = 29.0;
      }
      // パターン6_1（夜勤 例：0時〜3時など）
      else if ($maruStartTime >= 0.0 && $maruStartTime <= 5.0 && $nowTime < 5.0) {
        $midnight = $nowTime - $maruStartTime;
        $midStart = $maruStartTime;
        $midEnd   = $nowTime;
      }
      // パターン6_2（夜勤 例：1時〜9時など）
      else if ($maruStartTime >= 0.0 && $maruStartTime <= 5.0 && $nowTime >= 5.0) {
        $midnight = 5.0 - $maruStartTime;
        $midStart = $maruStartTime;
        $midEnd   = 5.0;
      }
      // パターン7（日勤 例：9時〜18時など、深夜勤務なし）
      else {
        $midnight = 0.0;
        $midStart = 0.0;
        $midEnd   = 0.0;
      }
      $midStart = kirisute($midStart, 10);
      $midEnd   = kirisute($midEnd, 10);
      $midRest  = yakinKeisanRest(
        $endMarume,
        $endMarume,
        $timeTable,
        $midStart,
        $midEnd
      );
      $midnight = floor((kirisute($midnight, 10) - $midRest) / $endMarume) * $endMarume;
      // 廃止した処理・・・> 外出戻りの時は、外出中の時間を休憩時間に足す&残業時間の算出
      if ($kintaiData[$i]["kintaiNo"] != "0") {
        $start = kirisute($kintaiData[$i]["inOffice"], 10);
        $end   = kirisute($kintaiData[$i - 1]["outOffice"], 10);
      }
      // 退勤時 通常退勤時間をすぎている時
      if ($nowTime >= $endWork) {
        // 退勤
        $kintaiFlag = 0;
      }
      else {
        // 外出
        $kintaiFlag = 2;
      }
      // 退勤時間、所定内時間、残業時間のUPDATE
      $sql =
        "UPDATE MK_kintai SET" .
        "    outOffice='" . $nowTime   . "'," .
        "    underTime='" . $underTime . "'," .
        "    inTime='"    . $inTime    . "'," .
        "    outTime='"   . $holyTime  . "'," .
        "    overTime='"  . $outTime   . "'," .
        "    restTime='"  . $restTime  . "'," .
        "    maruOutOffice='" . $maruEndTime . "'," .
        "    companyID=N'". $compID    . "'," .
        "    midnight='"  . $midnight  . "',".
        "    yakinFlag=N'" . $dakokuYakinFlag. "',".
        "    outPosition=N'".$position."',".
        "    outPositionAdd=N'".$positionAddress."',".
        "    outPointNo=N'".$pointNo."'".
        " WHERE" .
        "    staffID=N'"  . $staffID . "' AND" .
        "    ymd=N'"      . $yymmdd  . "' AND" .
        "    kintaiNo="   . $i       .  " AND" .
        "    companyID=N'". $compID  . "'";
      databaseSet($sql, $accountName, $userName);
    }
    ///////////////////////////////////////////////////////
    // もどりの処理
    ///////////////////////////////////////////////////////
    else {
      $outOffice = kirisute($kintaiData[$i]["outOffice"], 10);
      // endTime = 現在時刻
      if (($endTime - $outOffice) <= $DAKOKU_WAIT_TIME) {
        $waitTopShowData = waitTopShow($datetime, $compID, $accountName, $userName);
        $json = array(
          'errorCode'     => '7',
          'message'       => '打刻は正しく処理されました',
          'staffID'       => $staffID,
          'staffName'     => $staffData["name"],
          'compID'        => $compID,
          'yymmdd'        => $datetime->format('Y/m/d'),
          'dakokuTime'    => $nowTime,
          'yakinFlag'     => $yakinFlag,
          'kintaiFlag'    => $kintaiFlag,
          'IDmData'       => $staffData,
          'kinkyuJyoho'   => $waitTopShowData["kinkyuJyoho"],
          'sinchakuJyoho' => $waitTopShowData["sinchakuJyoho"],
          'errorData'     => $waitTopShowData["errorData"]
        );
        header('Content-type: application/json');   // 指定されたデータタイプに応じたヘッダーを出力する
        print(json_encode($json));
        exit();
      }
      $maruStartTime = ceil(kirisute($nowTime / $startMarume, 5)) * $startMarume;
      $sql =
        "INSERT INTO".
        "    MK_kintai(".
        "    staffID     ,".
        "    ymd         ,".
        "    kintaiNo    ,".
        "    youbi       ,".
        "    inOffice    ,".
        "    maruInOffice,".
        "    companyID   ,".
        "    yakinFlag   ,".
        "    inPosition  ,".
        "    inPositionAdd, ".
        "    inPointNo      ".
        ")".
        " VALUES(".
        "    N'".$staffID."'      ,".
        "    N'".$yymmdd."'       ,'".
        (intval($i) + 1)."'       ,".
        "    N'".$dw."'           ,".
        "    '" .$nowTime."'      ,".
        "    '" .$maruStartTime."',".
        "    N'".$compID."'       ,".
        "    N'".$dakokuYakinFlag."',".
        "    N'".$position       ."',".
        "    N'".$positionAddress."',".
        "    N'".$pointNo."'".
        ")";
      databaseSet($sql, $accountName, $userName);
      $kintaiFlag = 3;
    }
  }
  return $kintaiFlag;
}
?>