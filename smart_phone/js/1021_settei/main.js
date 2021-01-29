"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/09/09 yamazaki 会話グループのメンバーから除外する処理を追加しました。
//*******************************************************************
MainClass1021.prototype.event = function() {
    const self = this;
    // アイコンクリック時編集画面に遷移する
    self.ev('click', '#nowIcon', function() {
        spaHash('#1022', 'normal');
        return false;
    });
    // 編集ボタン押下時
    self.ev('click', '#update', function() {
        spaHash('#1022', 'normal');
        return false;
    });
    // 戻るボタン押下時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    self.ev('click', '#back', back);
    //==================================================
    // ログアウトボタン押下時
    //==================================================
    self.ev('click', '#logout', function() {
        if (confirm("ログアウトします。よろしいですか？") == true) {
            if (false == self.logout()) {
                return false;
            }
        }
    });
};