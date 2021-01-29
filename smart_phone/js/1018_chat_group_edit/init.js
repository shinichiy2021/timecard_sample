"use strict";
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1018() {
    // 初期化クラスを継承する
    Init.call(this);
    this.img = '';
    this.cropper = null;
    this.g_memberArray = [];
    this.g_arrayStaff = '';
    this.newFlag = false;
    this.backMsg = '';
    this.group = '';
    this.count = '';
    this.memberIDdata = '';
    this.arrayStaffID = '';
    this.groupID = '';
    this.member = '';
    this.upDateUrl = '';
}
MainClass1018.prototype = {
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
        // 編集フラグの初期化
        self.sel('.modal').modal({
            ready: function() {},
            complete: function() {}
        });
        self.groupID = sessionStorage.getItem('groupID');
        self.arrayStaffID = sessionStorage.getItem('arrayStaffID');
        // スタッフ情報の配列取得処理
        sessionStorage.setItem('gamenID', '1018');
        if (self.arrayStaffID == undefined || self.arrayStaffID == null || self.arrayStaffID == "") {
            self.arrayStaffID = '';
            sessionStorage.setItem('arrayStaffID', '');
            self.newFlag = true;
        } else {
            self.g_arrayStaff = self.arrayStaffID.split(",");
        }
        // パラメーターのチェック
        if (self.groupID == "" || self.groupID == null) {
            // 画面遷移する場合は、アラートのままで画面遷移する前に止めます。
            Materialize.toast('E101801 : グループが取得できませんでした。', 3000);
            spaHash('#1004', 'reverse');
            return false;
        }
        // ローカルストレージが使用できなかったときの例外処理
        if (('localStorage' in window) && (window.localStorage !== null)) {} else {
            Materialize.toast('メンバーの変更時にデータの保持が出来ません。注意してください', 3000);
        }
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
        if (false === self.modalPopUp()) {
            return false
        }
        if (false === self.groupShow()) {
            return false
        }
        return true
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