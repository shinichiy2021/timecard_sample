"use strict";
//*****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass10012() {
    // 初期化クラスを継承する
    Init.call(this);
    this.hatena1 = false; // はてなの非表示フラグ
    this.hatena2 = false; // はてなの非表示フラグ
    this.mainClass10011 = new MainClass10011();
    this.accountName = "";
    this.userName = "";
}
MainClass10012.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        sessionStorage.setItem('carousel', 'reverse');
        self.registerID = localStorage.getItem('registerID');
        self.udid = localStorage.getItem('udid');
        return true;
    },
    //=========================================
    // チェック＆取得
    // データベースのチェック＆取得処理を記述してください。
    //=========================================
    checkGetData: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.checkGetData.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.initShow.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        $('footer').hide();
        self.sel("#exhatena1").hide();
        self.sel("#exhatena2").hide();
        return true;
    },
    //=========================================
    // 後処理
    // 引き渡し情報の取得処理を記述してください。
    //=========================================
    atoShori: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.atoShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    }
};