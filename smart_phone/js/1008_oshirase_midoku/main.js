"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
MainClass1008.prototype.event = function() {
    const self = this;
    // 再通知ボタンが押された時
    self.ev('click', '#notification', function() {
        // 再通知がOKの場合
        if (confirm("未読者に再通知しますか？") == true) {
            if (self.notify() == true) {
                spaHash('#1006', 'reverse');
                return false;
            }
        }
    });
    // *********************************
    // 戻るボタンが押された時
    // *********************************
    self.ev('click', '#back', function() {
        spaHash('#1006', 'reverse');
        return false;
    });
};