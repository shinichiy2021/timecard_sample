<?php

//=============================================================
// メール送信
//
// 文字コード定義(phpソースやHTMLのソースに合わせて設定してください)
// 以下の定義しないと、文字化けの原因になります。
//=============================================================

// 文字エンコードの登録
mb_language("japanese");
mb_internal_encoding("UTF-8");

// ポストデータを取得
$fromAddress = $_POST["fromAddress"];
$fromName    = $_POST["fromName"];
$sentAddress = $_POST["sentAddress"];
$sentName    = $_POST["sentName"];
$subject     = $_POST["subject"];
$body        = $_POST["body"];

// 本文の作成
$body = $sentName . "\n\n". $body;

// 送り元の作成
$from_name_enc = mb_encode_mimeheader($fromName, "UTF-8");
$from          = "$from_name_enc<$fromAddress>";

// メールの送信
if (mb_send_mail($sentAddress, $subject, $body, "From:".$from, "-f shinichiy2011@gmail.com")) {
  echo "メール送信完了しました。";
}
else {
  echo "メール送信できませんでした。アドレスが正しいか確認してください。";
}

?>


