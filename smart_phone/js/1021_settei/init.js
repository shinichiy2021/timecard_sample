"use strict";
//***************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//***************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1021() {
    // 初期化クラスを継承する
    Init.call(this);
    this.staffData = null;
    this.msg = null;
}
MainClass1021.prototype = {
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
        self.msg = sessionStorage.getItem('alert');
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
        const staffData = self.master.read(
            "SELECT" +
            "    DISTINCT MK_staff.staffID," +
            "    MK_staff.name," +
            "    MK_staff.entDate," +
            "    MK_staff.url," +
            "    MK_staff.email," +
            "    MK_post.postName," +
            "    MK_kubun.kubunName," +
            "    MK_pattern.startWork," +
            "    MK_pattern.endWork," +
            "    MK_kojinSet.startPermit," +
            "    MK_kojinSet.endPermit," +
            "    ISNULL(MK_kojinSet.holiday,'0') AS holiday," +
            "    ISNULL(MK_kojinSet.weekday,'0') AS weekday" +
            " FROM MK_staff" +
            " INNER JOIN MK_post ON" +
            "    MK_staff.postID=MK_post.postID AND" +
            "    MK_staff.companyID=MK_post.companyID" +
            " INNER JOIN MK_kubun ON" +
            "    MK_staff.kubun=MK_kubun.kubun AND" +
            "    MK_staff.companyID=MK_kubun.companyID" +
            " INNER JOIN MK_pattern ON" +
            "    MK_staff.patternNo=MK_pattern.patternNo AND" +
            "    MK_staff.companyID=MK_pattern.companyID" +
            " LEFT OUTER JOIN MK_kojinSet ON" +
            "    MK_staff.staffID = MK_kojinSet.staffID AND" +
            "    MK_staff.companyID = MK_kojinSet.companyID",
            [
                "MK_staff.staffID='" + self.staff + "'",
                "MK_staff.companyID='" + self.companyID + "'"
            ],
            null
        );
        if (false === self.exception.check(
                staffData,
                true, // サーバーエラーの時
                true, // システムエラーの時
                "102101",
                "スタッフ情報の取得に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.staffData = staffData;
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
        if (Init.prototype.header.call(this) == false) {
            return false;
        }
        const h = $(window).height();
        $(document.body).css("min-height", h + 'px');
        // const html = "";
        let holi = "";
        let notifyTime = "勤務時間内";
        let notifyHoliday = "休日通知許可しない";
        let email = "";
        self.sel('#naviSettei img').attr('src', '../img/settei_on.png');
        self.sel('#naviSettei p').css('color', '#00ffff');
        self.sel('#naviSettei p').css('font-weight', 'bold');
        if (self.staffData[0].email == "" || self.staffData[0].email == null) {
            // 2017/08/28 yamazaki
            // 画面遷移する場合は、アラートのままで画面遷移する前に止めます。
            alert('Eメールアドレスが管理者によって変更されました。');
            // 個人設定編集画面に遷移
            spaHash('#1004', 'reverse');
            return false;
        } else {
            email = self.staffData[0].email;
            self.sel("#email").text(email);
        }
        self.sel("#staffInfo").text(self.staffData[0].staffID + ' - ' + self.staffData[0].name);
        // スタッフ番号
        self.sel("#post").text(self.staffData[0].kubunName); // 部署
        self.sel("#kubun").text(self.staffData[0].postName); // スタッフ種別（雇用）
        // 勤務時間の60進化と～を付けた変換と書き出し
        let inOffice = to60(self.staffData[0].startWork);
        inOffice = inOffice.hours + ":" + inOffice.minutes + "～";
        let outOffice = to60(self.staffData[0].endWork);
        outOffice = outOffice.hours + ":" + outOffice.minutes;
        self.sel("#kinmuTime").text(inOffice + outOffice);
        // 通知許可の書き出し
        let weekdayFlag = 0;
        holi = self.staffData[0].holiday;
        weekdayFlag = parseInt(self.staffData[0].weekday, 10);
        switch (weekdayFlag) {
            case 0:
                notifyTime = "勤務時間内";
                break;
            case 1:
                notifyTime = "終日許可";
                break;
            case 2:
                notifyTime = "夜間通知しない";
                break;
        }
        if (holi == "0" || holi == "") {
            notifyHoliday = "休日通知許可しない";
        } else {
            notifyHoliday = "休日通知許可する";
        }
        self.sel("#notify").text(notifyTime);
        self.sel("#holiday").text(notifyHoliday);
        // 入社日の整形と書き出し
        const entday = self.staffData[0].entDate.split("/");
        const y = parseInt(entday[0], 10);
        const m = parseInt(entday[1], 10);
        const d = parseInt(entday[2], 10);
        self.sel("#entDay").text(y + "年" + m + "月" + d + "日");
        // 現在のアイコン（チャットに出るアイコンの設定）の書き出し
        let img = self.staffData[0].url;
        if (img == "") {
            img = "../../common/photo/buddyGreen.png";
        }
        self.sel("#nowIcon").attr("src", img);
        // アイコン選択エリアの初期値の設定
        if (img.match("../../common/photo/buddyGreen.png")) {
            self.sel("#radio1").attr("checked", true);
            self.sel("#green").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/buddyPink.png")) {
            self.sel("#radio2").attr("checked", true);
            self.sel("#pink").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/buddyYellow.png")) {
            self.sel("#radio3").attr("checked", true);
            self.sel("#yellow").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/buddyBlue.png")) {
            self.sel("#radio4").attr("checked", true);
            self.sel("#blue").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/boy.png")) {
            self.sel("#radio5").attr("checked", true);
            self.sel("#boy").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/boy2.png")) {
            self.sel("#radio6").attr("checked", true);
            self.sel("#boy2").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/girl.png")) {
            self.sel("#radio7").attr("checked", true);
            self.sel("#girl").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        } else if (img.match("../../common/photo/girl2.png")) {
            self.sel("#radio8").attr("checked", true);
            self.sel("#girl2").css("border", "8px solid blue");
            self.sel(".iconList").css("box-sizing", "border-box");
        }
        if (self.msg != null) {
            Materialize.toast(self.msg, 3000);
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
        sessionStorage.removeItem('alert');
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