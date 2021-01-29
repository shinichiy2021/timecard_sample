<?php
require('common.php');
require('4000_dakoku_common.php');

/////////////////////////////////////////
// テスト用コード
const NowDateTime = '';
// const NowDateTime = '2019-07-24 13:00:00';

//**********************************************************
// 打刻用のPHP
//   ファイル名：4003_read_GPS.php
// 作成者： yamazaki
// 作成日： 2018/06/14
// 戻り値1： エラー発生時は、エラーコードとメッセージを返します
//**********************************************************
// パラメータ情報の取得
$staffID          = $_POST["staffID"];
$companyID        = $_POST["companyID"];
$position         = $_POST["position"];
$positionAddress  = $_POST["positionAdd"];
$yakinFlag        = $_POST["yakinFlag"];
$accountName      = $_POST["accountName"];
$userName         = $_POST["userName"];
$org_timezone     = date_default_timezone_get();
date_default_timezone_set('Asia/Tokyo');
//*********************************************************/
//* 初期表示                                               */
//*********************************************************/
$startMarume = 0.25;
$endMarume   = 0.25;
$restMarume  = 0.166666667;
$restTime    = (60.0 / 60.0);
$startWork   = 0.0;
$endWork     = 0.0;
$data        = NULL;
$registerID  = "";
$staffData   = NULL;     // 社員データ
$kintaiData  = NULL;     // 勤怠データ
$patternData = NULL;     // 勤務パターンデータ
$tabletFlg   = NULL;
$kintaiFlag  = -1;       // 1 : 出勤、0 : 退勤、２：外出、３：戻り
$tanmatuName = "";       // 端末名
$entDate     = "";       // 入社日付
$retireDate  = "";       // 退職日付
$stopYmd     = "";       // 無料期間終了日付
$calID       = "";       // カレンダーID
$strMsg      = "";
$presTime   = 0.0;
$presFlag   = 0;
$yakinKugiriTime     = "";  // 夜勤区切り時間
// 日付の正規化をする
$nowDateTime   = makeDateTimeJson(new DateTime(NowDateTime));
$nowTime       = floatval($nowDateTime["time"]);
$yymmdd        = $nowDateTime["ymd"];
$dw            = $nowDateTime["week"];
$datetime      = $nowDateTime["datetime"];
$week_str_list = array( '日', '月', '火', '水', '木', '金', '土');
$nowTime       = kirisute($nowTime, 10);
//-----------------------------
// 会社マスタから時間外の算出フラグと所定時間を取得する
//-----------------------------
$kisokuData       = getCompanyInfo($companyID, $accountName, $userName);
$presTime         = floatval($kisokuData[0]["presTime"]);
$presFlag         = intval($kisokuData[0]["presFlag"]);
$stopYmd          = $kisokuData[0]["stopYmd"];
$yakinKugiriTime  = floatval($kisokuData[0]["yakinKugiriTime"]);
//-----------------------------
// スタッフ情報を取得する
//-----------------------------
$staffData = getStaffInfo($staffID, $companyID, $accountName, $userName);
$calID        = $staffData["calendarID"];
$entDate      = $staffData["entDate"];
$retireDate   = $staffData["retireDate"];
if ($calID == NULL || $calID == "") {
  $calID = "1";
}
//-----------------------------
// パターンマスターからパターンの取得
//-----------------------------
$patternData = getKintaiPattern($staffData["patternNo"], $companyID, $accountName, $userName);
$startMarume = kirisute($patternData["startMarume"], 10);
$endMarume   = kirisute($patternData["endMarume"], 10);
$restMarume  = kirisute($patternData["restMarume"], 10);
$startWork   = kirisute($patternData["startWork"], 10);
$endWork     = kirisute($patternData["endWork"], 10);
$patternNoneFlag     = $patternData["pattern_none_flag"];
$patternNone1     = kirisute($patternData["pattern_none_1"], 10);
$patternNone2     = kirisute($patternData["pattern_none_2"], 10);
$patternNone3     = kirisute($patternData["pattern_none_3"], 10);
//-----------------------------
// 例外チェック項目
//-----------------------------
reigaiCheck(
  $stopYmd,
  $yymmdd,
  $staffID,
  $entDate,
  $staffData,
  $retireDate
);
$datetime = NULL;
$dakokuYakinFlag = 0;
// 勤怠フラグを初期化する
$kintaiFlag = -1;
$datetime = new DateTime(NowDateTime);
$dakokuYakinFlag = $yakinFlag;
$kintaiFlag = dakokuShori(
  $staffData,
  $companyID,
  $calID,
  $staffID,
  $datetime,
  $presTime,
  $yakinKugiriTime,
  $startWork,
  $startMarume,
  $endWork,
  $endMarume,
  $patternNoneFlag,
  $patternNone1,
  $patternNone2,
  $patternNone3,
  $presFlag,
  $yakinFlag,
  $kintaiFlag,
  $dakokuYakinFlag,
  $position,
  $positionAddress,
  '',
  $accountName,
  $userName
);
// 打刻者の通知情報の取得
$sql =
  "SELECT".
  "    name,".
  "    registerID".
  " FROM".
  "    MK_smartPhone".
  " WHERE".
  "    companyID = N'".$companyID."' AND".
  "    staffID = N'".$staffID."' AND".
  "    name <> N'card'";
$IDmData = databaseGet($sql, $accountName, $userName);
if ($IDmData == NULL) {
  $json = array(
    'errorCode'=>'1', 'message'=>'通知情報取得ができませんでした。'
  );
  // 指定されたデータタイプに応じたヘッダーを出力する
  header('Content-type: application/json');
  print(json_encode($json));
  exit();
}
$json = array(
  'errorCode'     => '0',
  'message'       => '正常に打刻されました。',
  'IDmData'       => $IDmData,
  'dakokuTime'    => $nowTime
);
// 指定されたデータタイプに応じたヘッダーを出力する
header('Content-type: application/json');
print(json_encode($json));
exit();
?>