"use strict";
//********************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// canvasを動的に書き換えている処理をコメントアウトしました。
// canvasに関しては常にDOMが存在している状態で、使用しない時は非表示で対応してください。
// 2017/08/03 村田追記 画像の編集処理
// 2017/08/16 yamazaki 画像再読みの際にcropper.jsの初期化を追加しました
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/08/23  画像の回転
//********************************************************************
function MainClass1022() {
    // 初期化クラスを継承する
    Init.call(this);
    this.img = '';
    this.cropper = null;
    this.staffData = null;
    this.moduleFlg = '';
    // モーダルフラグ変数（どのモーダルが開いているかどうかの情報）
    this.fileName = '';
}
MainClass1022.prototype = {
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
        localStorage.setItem("gamenID", '1022');
        self.sel('.modal').modal({
            ready: function() {},
            complete: function() {}
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
        // 該当スタッフの情報を取得する。マッピング情報１を参照
        const kojinData = self.master.read(
            "SELECT" +
            "    MK_staff.url," +
            "    MK_staff.email," +
            "    MK_staff.password," +
            "    ISNULL(MK_kojinSet.weekday,'0') AS weekday," +
            "    ISNULL(MK_kojinSet.holiday,'0') AS holiday" +
            " FROM MK_staff" +
            " LEFT OUTER JOIN MK_kojinSet ON" +
            "    MK_staff.staffID=MK_kojinSet.staffID AND" +
            "    MK_staff.companyID=MK_kojinSet.companyID", [
                "MK_staff.staffID='" + self.staff + "'",
                "MK_staff.companyID='" + self.companyID + "'"
            ],
            null
        );
        if (false === self.exception.check(
                kojinData,
                ExceptionServerOn,
                ExceptionSystemOn,
                "102204",
                "スタッフ情報が存在しません。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.staffData = kojinData;
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
        // 共通処理の描画
        // 画像の編集処理 2017/08/03 村田追記
        //**********************************
        // モーダル非表示
        self.sel('#modal1').modal('close');
        // 更新ボタン初期非活性
        self.sel("#update").attr('disabled', 'disabled');
        let notifyTime = "0";
        let notifyHoliday = "0";
        const email = self.staffData[0].email;
        // メールアドレス初期値書き出し
        if (email != "" || email != null) {
            self.sel("#mail").html(email);
        }
        // 通知時間帯設定
        notifyTime = self.staffData[0].weekday;
        self.sel("#notifyTime").val(notifyTime);
        // 休日通知の許可設定の選択
        notifyHoliday = self.staffData[0].holiday;
        self.sel("#holiday").val(notifyHoliday);
        // 現在のアイコン（チャットに出るアイコンの設定）の書き出し
        let img = self.staffData[0].url;
        if (img == "") {
            img = "../../common/photo/buddyGreen.png";
        }
        self.sel("#nowIcon").attr("src", img);
        // アイコン選択エリアの初期値の設定
        if (img.match("../../common/photo/buddyGreen.png")) {
            self.sel("#radio1").attr("checked", true);
            self.sel("#green").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/buddyPink.png")) {
            self.sel("#radio2").attr("checked", true);
            self.sel("#pink").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/buddyYellow.png")) {
            self.sel("#radio3").attr("checked", true);
            self.sel("#yellow").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/buddyBlue.png")) {
            self.sel("#radio4").attr("checked", true);
            self.sel("#blue").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/boy.png")) {
            self.sel("#radio5").attr("checked", true);
            self.sel("#boy").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/boy2.png")) {
            self.sel("#radio6").attr("checked", true);
            self.sel("#boy2").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/girl.png")) {
            self.sel("#radio7").attr("checked", true);
            self.sel("#girl").parents(".iconTable").css("background", "#fa8072");
        } else if (img.match("../../common/photo/girl2.png")) {
            self.sel("#radio8").attr("checked", true);
            self.sel("#girl2").parents(".iconTable").css("background", "#fa8072");
        }
        //===============================================
        // 画像選択処理
        //===============================================
        self.modalPopUp();
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