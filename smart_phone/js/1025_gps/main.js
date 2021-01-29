"use strict";
//**********************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki  ヘッダーに変更履歴を追加しました。
// 2017/08/10 shinya    お知らせの未読のみの抽出条件追加
// 2017/08/21     アラートをフレームワーク統一に変更
// 2017/08/31     新規端末登録者の未読も取得出来るように絞込を修正
// 2018/04/19     FAX機能追加
// 2019/07/22   　夜勤打刻対応
//**********************************************************
$(document).ready(function() {
    const self = new MainClass();
    if (self.maeShori() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    if (self.checkGetData() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    if (self.initShow() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    if (self.atoShori() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    // OKボタン押下処理
    $("#okBtn").click(function() {
        // 打刻処理
        self.gpsEntry();
        return false;
    });
    // キャンセルボタン押下処理
    $("#cancelBtn").click(function() {
        if (confirm('打刻情報は保存されません。よろしいですか？') == true) {
            // ◇OKの時
            // ・メニュー画面に遷移する
            location.href = "1001_login.html#1004";
            return false;
        } else {
            // ◇キャンセルの時
        }
    });
    //再取得ボタン押下処理
    $("#getBtn").click(function() {
        location.reload();
        return false;
    });

    // 夜勤打刻モード切替
    $("#yakinOff").click(function() {
        self.yakinFlag = 1;
        $("#yakinOff").hide();
        $("#yakinOn").show();
        $("#yakinMsg").text(self.strYakinMode);
        return false;
    });
    $("#yakinOn").click(function() {
        self.yakinFlag = 0;
        $("#yakinOff").show();
        $("#yakinOn").hide();
        $("#yakinMsg").text("");
        return false;
    });
});