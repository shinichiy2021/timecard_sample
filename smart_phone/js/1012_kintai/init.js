"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1012() {
    // 初期化クラスを継承する
    Init.call(this);
    this.kintaiDate = null; // 引き継ぎ情報：申請年月日
    this.memberData = null; // メンバーのデータ
    this.nowShoninFlag = ''; // 申請フラグ
    this.nowSinseiStaff = ''; // 申請スタッフ番号
    this.nowSinseiName = ''; // 申請スタッフ氏名
    this.nowShoninStaff = ''; // 確認スタッフ番号
    this.shoninName = '';// 確認スタッフ氏名
    this.nowTodokedeName = ''; // 届出の名称
    this.nowTaishouDate = ''; // 届出の期間
    this.shoninStaffMail = ''; // 確認者のメールアドレス
    this.dakokuSinseiFlag = 0; // 0:新規申請、1:修正申請
    this.memberlist = null;
    this.messageFlg = 0;
    this.sime;
    this.intSime;
    this.ymdA;
    this.ymdB;
}
MainClass1012.prototype = {
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
        //=================================
        // ここから処理を記述してください
        self.sel('.modal').modal({
            ready: function(modal, trigger) {
            },
            complete: function() {
            }
            // Callback for Modal close
        });
        self.sel('#modal1').modal('close');
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
        // ログインスタッフのデータを取得する。マッピング情報１を参照
        self.memberData = self.master.read(
            "SELECT" +
            "   MK_staff.staffID," +
            "   MK_staff.name," +
            "   MK_staff.patternNo," +
            "   MK_post.postID," +
            "   MK_kubun.kubun AS koyou," +
            "   ISNULL(MK_kubun.kubunName, '') AS kubun," +
            "   ISNULL(MK_post.postName, '') AS syozoku," +
            "   ISNULL(MK_staff.retireDate, '') AS retireDate," +
            "   MK_pattern.startWork," +
            "   MK_pattern.endWork," +
            "   MK_pattern.startMarume," +
            "   MK_pattern.endMarume," +
            "   ISNULL(MK_pattern.endDate, '') AS endDate" +
            " FROM MK_staff" +
            " LEFT OUTER JOIN MK_kubun ON" +
            "   MK_staff.kubun=MK_kubun.kubun AND" +
            "   MK_staff.companyID=MK_kubun.companyID" +
            " LEFT OUTER JOIN MK_post ON" +
            "   MK_staff.postID=MK_post.postID AND" +
            "   MK_staff.companyID=MK_post.companyID" +
            " INNER JOIN MK_pattern ON" +
            "   MK_staff.patternNo=MK_pattern.patternNo AND" +
            "   MK_staff.companyID=MK_pattern.companyID" +
            " WHERE" +
            "   staffID='" + self.staff + "'" + " AND" +
            "   MK_staff.companyID='" + self.companyID + "'"
        );
        if (false === self.exception.check(
                self.memberData,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101201",
                "スタッフ情報が取得来ませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
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
        // 日付を取得する
        const sime = self.memberData[0].endDate;
        const intSime = parseInt(sime, 10);
        self.sime = sime;
        self.intSime = intSime;
        let y = parseInt(self.today.split("/")[0], 10);;
        let m = parseInt(self.today.split("/")[1], 10);
        let date = parseInt(self.today.split("/")[2], 10);
        if (intSime < date) {
            if (12 == m) {
                y += 1;
                m = 1;
            } else {
                m += 1;
            }
        }
        const getumatuDate = new Date(y, m, 0);
        const endDate = getumatuDate.getDate();
        const maegetumatuDate = new Date(y, m - 1, 0);
        const maeendDate = maegetumatuDate.getDate();
        let ymdA = "";
        let ymdB = "";
        self.sel("#ym").html(y + "年" + m + "月分");
        if (m == 1 && sime != 31) {
            ymdA = (y - 1) + "/" + 12 + "/" + addZero(intSime + 1);
        } else if (m != 1 && sime != 31) {
            ymdA = y + "/" + addZero(m - 1) + "/" + addZero(intSime + 1);
        }
        if (sime == 31) {
            ymdA = y + "/" + addZero(m) + "/" + addZero(1);
            ymdB = y + "/" + addZero(m) + "/" + addZero(endDate);
        } else {
            ymdB = y + "/" + addZero(m) + "/" + addZero(sime);
        }
        if (sime == 31 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        // 先月の末日が締め日と同じまたは前の日の時
        if (maeendDate <= sime) {
            ymdA = y + "/" + addZero(m) + "/" + "01";
        }
        // 設定締日が30で2月の表示の時
        if (sime == 30 && ymdA == y + "/02/31") {
            ymdA = y + "/03/01";
        }
        if (sime == 30 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        self.ymdA = ymdA;
        self.ymdB = ymdB;
        self.dateDisplay();
        // 集計の表示
        self.totalDisplay(self.ymdA, self.ymdB);
        // 一覧表示
        self.listDisplay(self.ymdA, self.ymdB, self.sime);
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
    sinseiShosaiDraw: function(paraSinseiNo, buttonFlag) {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.sinseiShosaiDraw.call(this, paraSinseiNo, buttonFlag) == false) {
            return false;
        }
    }
};