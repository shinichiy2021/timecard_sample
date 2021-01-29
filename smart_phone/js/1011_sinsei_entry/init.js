"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1011() {
    // 初期化クラスを継承する
    Init.call(this);
    this.kakuninStaffDate = null; // 確認者のリストデータ
    this.kintaiPaternDate = null; // ログイン者の勤怠パターンデータ
    this.shukinJikan = ''; // 勤怠パターン出勤時刻
    this.taikinJikan = ''; // 勤怠パターン退勤時刻
    this.kyukeiJikan = ''; // 勤怠パターン休憩時間
    this.startMarume = ''; // 勤怠パターン出勤丸め
    this.endMarume = ''; // 勤怠パターン退勤丸め
    this.entDate = ''; // スタッフ情報入社日
    this.retireDate = ''; // スタッフ情報退職日
    this.dakokuSinseiFlag = 0; // 打刻修正新規or修正
    this.setArraySQL = [];
    this.seniFlag = '1009'; //開発デバッグ用 遷移元が申請リストの時
    // 遷移元がタイムカードの打刻修正時、期間を取得して初期表示に使用する
    this.taisyoDate = '2018/04/11'; //開発デバッグ用 打刻修正日付タップ時
    this.editFlag = false;
    this.sinseiFromDate = this.today;
}
MainClass1011.prototype = {
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
        // 引継ぎデータの取得
        self.sel("#psd").val(self._GET.psd);
        self.sel("#ped").val(self._GET.ped);
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
        // ログイン者の所属情報を取得
        const postKubun = self.master.read(
            "SELECT" +
            "    postID" +
            " FROM" +
            "    MK_post" +
            " WHERE" +
            "    postID = (" +
            " SELECT" +
            "    postID" +
            " FROM" +
            "    MK_staff" +
            " WHERE" +
            "    staffID  =N'" + self.staff + "' AND" +
            "    companyID=N'" + self.companyID + "') AND companyID = N'" + self.companyID + "'"
        );
        if (false === self.exception.check(
                postKubun,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101104",
                "ログイン者の所属情報が取得来ませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        const myPost = postKubun[0].postID;
        //*****************************
        // 確認者の取得
        //*****************************
        const shoninData = self.master.read(
            "SELECT" +
            "    MK_staff.staffID," +
            "    MK_staff.name   ," +
            "    MK_staff.postID ," +
            "    MK_staff.admCD  ," +
            "    (CASE WHEN (postID='" + myPost + "') THEN 0 ELSE 1 END) AS orderNo" +
            " FROM MK_staff" +
            " LEFT OUTER JOIN MK_smartPhone ON" +
            "    MK_staff.staffID=MK_smartPhone.staffID AND" +
            "    MK_staff.companyID=MK_smartPhone.companyID" +
            " WHERE" +
            "    (MK_staff.retireDate='' OR MK_staff.retireDate IS NULL) AND" +
            "    MK_staff.admCD<>'2' AND" +
            "    MK_staff.companyID=N'" + self.companyID + "' AND" +
            "    MK_staff.staffID<>N'" + self.staff + "'" +
            " GROUP BY" +
            "    MK_staff.staffID," +
            "    MK_staff.name   ," +
            "    MK_staff.postID ," +
            "    MK_staff.admCD" +
            " ORDER BY" +
            "    orderNo," +
            "    postID ," +
            "    admCD  ," +
            "    staffID"
        );
        if (false === self.exception.check(
                shoninData,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101105",
                "確認出来る管理者の情報が取得出来ませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.kakuninStaffDate = shoninData;
        //*****************************
        // ログイン者の勤怠パターンを取得する
        //*****************************
        const patternData = self.master.read(
            "SELECT" +
            "    *" +
            " FROM MK_pattern" +
            " INNER JOIN MK_staff ON" +
            "    MK_pattern.patternNo=MK_staff.patternNo AND" +
            "    MK_pattern.companyID=MK_staff.companyID" +
            " INNER JOIN" +
            "  (SELECT patternNo, SUM(endRest - startRest) AS restTime FROM MK_timeTable WHERE companyID=N'" + self.companyID + "' GROUP BY patternNo) AS RT ON" +
            "    MK_staff.patternNo=RT.patternNo" +
            " WHERE" +
            "    MK_staff.staffID=N'" + self.staff + "' AND" +
            "    MK_pattern.companyID=N'" + self.companyID + "'"
        );
        if (false === self.exception.check(
                patternData,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101106",
                "ログイン者の勤怠パターンが設定されていません。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.kintaiPaternDate = patternData;
        //*****************************
        // ログイン者の入社日退職日を取得する
        //*****************************
        const staffData = self.master.read(
            "SELECT" +
            "   ISNULL(entDate,'') AS entDate," +
            "    retireDate" +
            " FROM" +
            "    MK_staff" +
            " WHERE" +
            "    companyID = N'" + self.companyID + "' AND" +
            "    staffID = N'" + self.staff + "'"
        );
        if (false === self.exception.check(
                staffData,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101107",
                "スタッフ情報が取得できませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.entDate = staffData[0].entDate;
        self.retireDate = staffData[0].retireDate;
        if (self.entDate == '') {
            self.exception.check(
                null,
                ExceptionServerOff,
                ExceptionSystemOn,
                "101108",
                "スタッフ情報の入社日が登録されていません。",
                ExceptionParamToMenu
            );
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
        self.sel(".dynamic-dom").html("");
        self.sel('#sinseiKomoku').val('sentakuShitekudasai');
        self.sel('#sinseiKomokuHide').hide();
        let $html = '';
        for (let i in self.kakuninStaffDate) {
            $html +=`
                <option value="${self.kakuninStaffDate[i].staffID}">
                    ${self.kakuninStaffDate[i].name}
                </option>
            `;
        }
        self.sel("#shoninSha").html(
            '<option value="sentakuShitekudasai">選択してください</option>'
        );
        self.sel("#shoninSha").append($html);
        
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