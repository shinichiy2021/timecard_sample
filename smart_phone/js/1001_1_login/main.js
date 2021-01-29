"use strict";
//=========================================
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 初期化クラス
// イベント処理を記述してください
//=========================================
MainClass10011.prototype.event = function() {
    const self = this;
    //===================================
    // ログインボタン押下時
    //===================================
    self.ev('click', '#btnLogin', function() {
        self.asyncLogin()
    })
    //============================================
    // 変更処理
    //============================================
    self.ev('keypress', '#loginAccount', function() {
        // テキストボックス枠を通常（黒）にする
        $(this).removeClass('red-error');
    });
    self.ev('keypress', '#email', function() {
        // テキストボックス枠を通常（黒）にする
        $(this).removeClass('red-error');
    });
    self.ev('keypress', '#passWord', function() {
        // テキストボックス枠を通常（黒）にする
        $(this).removeClass('red-error');
    });
    return true;
};