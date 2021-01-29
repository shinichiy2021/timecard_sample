"use strict";
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1019() {
    // 初期化クラスを継承する
    Init.call(this);
    this.gamenID = '';
    this.groupID = '';
    this.sessionChange = '';
    this.memberArray = [];       // メンバーの配列データ
    this.arrayStaffID = '';      // メンバーの文字データ
    this.memberData = null;      // 初期表示時取得一覧
}
MainClass1019.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.maeShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // パラメータ取得（社員ID)
        self.arrayStaffID = sessionStorage.getItem('arrayStaffID');
        self.gamenID = sessionStorage.getItem('gamenID');
        self.groupID = sessionStorage.getItem('groupID');
        self.sessionChange = JSON.parse(localStorage.getItem("meDel"));
        // モーダルの初期設定
        self.sel('.modal').modal({
            ready: function() {},
            complete: function() {
                // モーダルの表示初期化
                self.sel('#sPost').empty();
            }
        });
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
        if (sessionStorage.getItem('isChange') == "true") {
            self.sel("#invitation").show();
        } else {
            self.sel("#invitation").hide();
        }
        // メンバーリストの表示
        if (false === self.setMember()) {
            return false
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
    asyncAvailable: function () {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.asyncAvailable.call(this) == false) {
            return false;
        }
    },
};