"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*******************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1014() {
    // 初期化クラスを継承する
    Init.call(this);
    this.todoID = '';
    this.category = '';
    this.stChangeFlag = false;
    this.sendFlag = '';
    this.sendCheck = true;
    this.selectButton = '';
    this.todoTitle = '';
    this.todo = '';
    this.todoDate = '';
    this.keisaiKigen = '';
    this.oderID = '';
    this.statusCD = '';
    this.strStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.finishDate = '';
    this.selectOder = '';    // 選択したTODOの作成者
    this.selectWorker = '';  // 選択したTODOの「やる人」
    this.strWhere = '';
}
MainClass1014.prototype = {
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
        // セッション情報の初期化
        sessionStorage.setItem('arrayStaffID', '');
        sessionStorage.setItem('isChange', 'false');
        // パラメータ取得
        self.todoID = localStorage.getItem("todoID");
        self.category = localStorage.getItem("categoryID");
        self.sel('.modal').modal({
            ready: function() {},
            complete: function() {
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
        const h = $(window).height();
        $(document.body).css("min-height", h + 'px');
        self.sel("#category").val(self.category);
        // 絞り込み条件
        if (self.category == "1") {
            self.strWhere = "WHERE (TD.todoID ='" + self.todoID + "') AND TD.companyID = N'" + self.companyID + "' AND worker = N'" + self.staff + "' ";
        } else {
            self.strWhere = "WHERE (TD.todoID ='" + self.todoID + "') AND TD.companyID = N'" + self.companyID + "' ";
        }
        self.ListDisplay(self.staff, self.companyID, self.strWhere);
        const toast = localStorage.getItem('toast');
        if (toast != '' || toast != undefined || toast != null) {
            Materialize.toast(toast, 1500);
            localStorage.removeItem('toast');
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
    }
};