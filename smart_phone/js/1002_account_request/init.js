"use strict";
//*********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*********************************************************************
//=========================================
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1002() {
    // 初期化クラスを継承する
    Init.call(this);
    this.mailSent = new Mail("info@", "GAIA（ガイア）");
    this.gamenID = "";
}
MainClass1002.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // 遷移元が設定編集かどうか
        sessionStorage.setItem('carousel', 'reverse');
        self.registerID = localStorage.getItem('registerID');
        self.udid = localStorage.getItem('udid');
        self.gamenID = localStorage.getItem('gamenID');
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
        // ===================================
        // ログイン画面から遷移してきたとき
        // ===================================
        if (self.gamenID == '10011') {
            // registerIDにスペースがある場合、取り除く
            if (self.registerID == undefined || self.registerID == 'undefined' || self.registerID == "") {
                // ローカルストレージのregisterIDが取得できない場合
                // アプリを終了メッセージ画面を表示する「スタッフ情報が取得出来ませんでした」
                self.exception.check(
                    ExceptionSystemError,
                    ExceptionServerOff,
                    ExceptionSystemOn,
                    "100201",
                    "スマホ識別番号データの取得に失敗しました。",
                    ExceptionParamToLogin,
                    self.registerID,
                    self.udid
                );
                return false;
            } else {
                self.registerID = self.registerID.replace(/\s+/g, "");
            }
            if (self.udid == undefined) {
                self.udid = "";
            } else {
                if (self.udid == "undefined") {
                    self.udid = "";
                }
            }
        }
        // ===================================
        // 個人設定編集画面から遷移してきたとき
        // ===================================
        else {
            self.sel("#back").html('←個人設定へ戻る');
        }
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
    },
    //=========================================
    // 利用可能期間のチェック
    //=========================================
    available: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.available.call(this) == false) {
            return false;
        }
    }
};