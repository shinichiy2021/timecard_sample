"use strict";
//**************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/12/08 yamazaki 届出を提出する際の処理をこのファイルに転記しました。
//**************************************************************
// 届出提出ボタン押下処理
//**************************************************************
MainClass1011.prototype.todokedeNewButton = function () {
    const self = this;
    const sinseiKomoku = self.sel("#sinseiKomoku").val();
    let msg = '';
    //**************************************************************
    // 申請ボタン押下処理
    //エラー表示の有る時は申請出させないようにする。
    const errorText = self.sel("#errorArea").html();
    if (errorText != '') {
        Materialize.toast(errorText, 3000);
        return false;
    }
    // 申請項目の必須チェック
    if (sinseiKomoku == "sentakuShitekudasai") {
        Materialize.toast('届出項目を選択してください', 3000);
        return false;
    }
    if (self.sel("#sinseiFrom").val() == '') {
        if (sinseiKomoku == 4) {
            Materialize.toast('期間を入力してください', 3000);
        } else {
            Materialize.toast('期間開始日を入力してください', 3000);
        }
        return false;
    }
    if (self.sel("#sinseiTo").val() == '') {
        Materialize.toast('期間終了日を入力してください', 3000);
        return false;
    }
    if (self.sel("#kyusitubi").val() == '') {
        Materialize.toast('休日出勤の日付を入力してください', 3000);
        return false;
    }
    // 相関チェック
    let shukinM = 0;
    let taikinM = 0;
    let sinseiDateFrom = new Date(self.sel("#sinseiFrom").val());
    let sinseiDateTo = new Date(self.sel("#sinseiTo").val());
    const kyusituDate = new Date(self.sel("#kyusitubi").val());
    const entDate = new Date(self.entDate);
    const retireDate = new Date(self.retireDate);
    if (sinseiKomoku == '0' && self.sel("#kyukaShurui").val() == '7') {
        // 休暇取得日が出勤日付と同一の時
        if (self.sel("#kyusitubi").val() == self.sel("#sinseiFrom").val()) {
            Materialize.toast('期間は出勤する日と同じ日付で申請できません', 3000);
            return false;
        }
    }
    if (sinseiKomoku != 4 && self.sel("#kyukaShurui").val() != '7') {
        if (sinseiDateFrom > sinseiDateTo) {
            Materialize.toast('期間終了日には開始日より前の日付を設定できません', 3000);
            return false;
        }
    }
    // 入社日チェック 入社日より前のとき 入社日より前の申請はできません。
    if (sinseiDateFrom < entDate) {
        Materialize.toast('入社日より前の申請はできません', 3000);
        return false;
    }
    if (kyusituDate < entDate) {
        Materialize.toast('入社日より前の申請はできません', 3000);
        return false;
    }
    // 退職日チェック 退職日より後のとき 退職日より後の申請はできません。
    if (self.retireDate != '') {
        if (sinseiDateFrom > retireDate) {
            Materialize.toast('退職日より後の申請はできません', 3000);
            return false;
        }
        if (sinseiDateTo > retireDate) {
            Materialize.toast('退職日より後の申請はできません', 3000);
            return false;
        }
        if (kyusituDate > retireDate) {
            Materialize.toast('退職日より後の申請はできません', 3000);
            return false;
        }
    }
    if (self.sel("#kyukaShurui").val() == "sentakuShitekudasai") {
        Materialize.toast('休暇種類を選択してください', 3000);
        return false;
    }
    // 残業種類のチェック
    // if (self.sel("#todokedeKubun").val() == "sentakuShitekudasai") {
    //     Materialize.toast('残業種類を選択してください', 3000);
    //     return false;
    // }
    if (sinseiKomoku == 0) {
        // 何もしない
    } else if (sinseiKomoku == 3) {
        if (self.sel("#todokedeKubun").val() == '4') {
            if (self.sel("#shukinJikan").val() == '') {
                Materialize.toast('開始時刻を入力してください', 3000);
                return false;
            }
            if (to10(self.sel("#shukinJikan").val()) >= to10(self.shukinJikan)) {
                if (confirm('勤務開始時間以降の時間が入力されています。早出残業で良いですか？') == false) {
                    return false;
                }
            }
        } else {
            if (self.sel("#taikinJikan").val() == '') {
                Materialize.toast('終了時刻を入力してください', 3000);
                return false;
            }
            if (to10(self.sel("#taikinJikan").val()) <= to10(self.taikinJikan)) {
                if (confirm('勤務終了時間以前の時間が入力されています。普通残業で良いですか？') == false) {
                    self.sel("#shukinJikan").focus();
                    return false;
                }
            }
        }
    } else {
        if (self.sel("#shukinJikan").val() == '') {
            Materialize.toast('出勤時刻を入力してください', 3000);
            return false;
        }
        if (self.sel("#taikinJikan").val() == '') {
            Materialize.toast('退勤時刻を入力してください', 3000);
            return false;
        }
    }
    const taikinTime = [];
    const shukinTime = [];
    const rest = [];
    if (sinseiKomoku > 0) {
        rest[0] = parseFloat(self.sel("#kyukeiJikan").val());
    }
    // 相関チェック
    if (sinseiKomoku == 0 ||
        sinseiKomoku == 1 ||
        sinseiKomoku == 2 ||
        sinseiKomoku == 3 ||
        sinseiKomoku == 99) {
        // 休暇届け、早退届け、遅刻届け、その他届け、はチェックしない
    } else if (sinseiKomoku == 4) {
        // 休暇取得日必須チェック
        // 「年/月/日」のとき 休暇取得日を入力してください
        if (self.sel("#kyukaDay").val() == '') {
            Materialize.toast('休暇取得日を入力してください', 3000);
            return false;
        } else {
            const kyukaDay = new Date(self.sel("#kyukaDay").val());
            // 入社日チェック 入社日より前のとき 入社日より前の申請はできません。
            if (kyukaDay < entDate) {
                Materialize.toast('入社日より前の申請はできません', 3000);
                return false;
            }
            // 退職日チェック 退職日より後のとき 退職日より後の申請はできません。
            if (self.retireDate != '') {
                if (kyukaDay > retireDate) {
                    Materialize.toast('退職日より後の申請はできません', 3000);
                    return false;
                }
            }
        }
        // 休暇取得日が期間と同一の時
        if (self.sel("#kyukaDay").val() == self.sel("#sinseiFrom").val()) {
            Materialize.toast('休暇の取得日は休日出勤する日と同じ日付で申請できません', 3000);
            return false;
        }
    } else {
        shukinM = toMinute(to10(self.sel("#shukinJikan").val()));
        shukinM = toMinute(to10(self.sel("#shukinJikan").val()));
        shukinTime[0] = to10(self.sel("#shukinJikan").val());
        taikinTime[0] = to10(self.sel("#taikinJikan").val());
        if (taikinTime[0] >= 0 && taikinTime[0] < 5) {
            taikinTime[0] = taikinTime[0] + 24;
        }
        taikinM = toMinute(taikinTime[0]);
        if (self.sel("#shukinJikan").val() != undefined && self.sel("#taikinJikan").val() != undefined && shukinM >= taikinM) {
            Materialize.toast('退勤時刻には出勤時刻以前の時刻を設定できません', 3000);
            return false;
        }
        if (self.sel("#shukinJikan").val() != undefined && self.sel("#taikinJikan").val() != undefined) {
            // 5分チェック
            if ((taikinM - shukinM) < 1) {
                Materialize.toast('退勤時刻は出勤時刻より1分以上後の時刻を設定してください', 3000);
                return false;
            }
        }
    }
    // 確認者の必須チェック
    if (self.sel("#shoninSha").val() == "sentakuShitekudasai") {
        Materialize.toast('確認者を選択してください', 3000);
        return false;
    }
    // 届出事由の必須チェック
    let shinseiJiyu = "";
    if($("#reason").val()==="0"){
        shinseiJiyu = "私用";
        self.sel("#shinseiJiyu textarea").val("私用");
    }else{
        shinseiJiyu = self.sel("#shinseiJiyu textarea").val();
    }
    if (shinseiJiyu.trim() == '') {
        Materialize.toast('申請事由を入力してください', 3000);
        return false;
    }
    // 申請事由の文字数チェック
    if (shinseiJiyu.length > 100) {
        Materialize.toast('申請事由は１００文字以内で入力してください', 3000);
        return false;
    }    // 申請事由に絵文字が含まれている場合。
    if (shinseiJiyu.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('申請事由に使用できない絵文字が含まれています', 3000);
        return false;
    }
    if (sinseiKomoku == '1') {
        const taikinJikan = to10(self.taikinJikan);
        const shukinJikan = to10(self.shukinJikan);
        taikinTime[0] = to10(self.sel("#taikinJikan").val());
        if (taikinTime[0] >= 0 && taikinTime[0] < 5) {
            taikinTime[0] = taikinTime[0] + 24;
        }
        msg = '';
        if (taikinTime[0] >= taikinJikan) {
            msg = '退勤時刻に勤務パターンの退勤時刻以降の時間が入力されています。\n';
        } else
            if (taikinTime[0] <= shukinJikan) {
                Materialize.toast('退勤時刻に勤務パターンの出勤時刻以前の時間が入力されています。', 3000);
                return false;
            }
    }
    if (sinseiKomoku == '2') {
        const taikinJikan = to10(self.taikinJikan);
        const shukinJikan = to10(self.shukinJikan);
        shukinTime[0] = to10(self.sel("#shukinJikan").val());
        msg = '';
        if (shukinTime[0] <= shukinJikan) {
            msg = '出勤時刻に勤務パターンの出勤時刻以前の時間が入力されています。\n';
        } else
            if (shukinTime[0] >= taikinJikan) {
                Materialize.toast('出勤時刻に勤務パターンの退勤時刻以降の時間が入力されています。', 3000);
                return false;
            }
    }
    // 同じ届出が既に提出されている時
    if (sinseiKomoku == '0') {
        const todokedeCheck = self.master.read(
            "SELECT" +
            "   sinseiNo," +
            "   taishouDate" +
            " FROM" +
            "   MK_sinsei" +
            " WHERE" +
            "   (companyID = N'" + self.companyID + "') AND" +
            "   (sinseiStaffID = N'" + self.staff + "') AND" +
            "   (shoninFlag <> 2) AND" +
            "   (taishouDate BETWEEN N'" + dateToFormatString(new Date(self.sel("#sinseiFrom").val()), '%YYYY%/%MM%/%DD%') + "' AND" +
            "                        N'" + dateToFormatString(new Date(self.sel("#sinseiTo").val()), '%YYYY%/%MM%/%DD%') + "')"
        );
        switch (self.exception.check(
            todokedeCheck,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101113",
            "同じ届出の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
            case false:
                return false;
            case null:
                break;
            case true:
                if (true === confirm('すでに同じ日の届出が提出されています。届出の内容を確認しますか？')) {
                    sessionStorage.setItem('sinseiNo', todokedeCheck[0].sinseiNo);
                    spaHash('#1010', 'reverse');
                }
                return false;
        }
    } else if (sinseiKomoku == '1') {
        // 早退届
        const todokedeCheck = self.master.read(
            "SELECT" +
            "    MK_sinsei.sinseiNo," +
            "    MK_sinsei.taishouDate" +
            " FROM" +
            "    MK_sinsei INNER JOIN" +
            "    MK_todokede ON MK_sinsei.todokedeID = MK_todokede.todokedeID AND" +
            "    MK_sinsei.companyID = MK_todokede.companyID" +
            " WHERE" +
            "    MK_sinsei.companyID = N'" + self.companyID + "' AND" +
            "    (MK_todokede.todokedeKubun = 0 OR MK_todokede.todokedeKubun = 1 OR MK_todokede.todokedeKubun = 5 OR MK_todokede.todokedeKubun = 7) AND" +
            "    MK_sinsei.sinseiStaffID = N'" + self.staff + "' AND" +
            "   (shoninFlag <> 2) AND" +
            "    MK_sinsei.taishouDate BETWEEN N'" + dateToFormatString(new Date(self.sel("#sinseiFrom").val()), '%YYYY%/%MM%/%DD%') + "' AND" +
            "                                  N'" + dateToFormatString(new Date(self.sel("#sinseiTo").val()), '%YYYY%/%MM%/%DD%') + "'"
        );
        switch (self.exception.check(
            todokedeCheck,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101114",
            "同じ届出の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
            case false:
                return false;
            case null:
                break;
            case true:
                if (true === confirm('すでに同じ日の届出が提出されています。届出の内容を確認しますか？')) {
                    sessionStorage.setItem('sinseiNo', todokedeCheck[0].sinseiNo);
                    spaHash('#1010', 'reverse');
                }
                return false;
        }
    } else if (sinseiKomoku == '2') {
        // 遅刻届
        const todokedeCheck = self.master.read(
            "SELECT" +
            "    MK_sinsei.sinseiNo," +
            "    MK_sinsei.taishouDate" +
            " FROM" +
            "    MK_sinsei INNER JOIN" +
            "    MK_todokede ON MK_sinsei.todokedeID = MK_todokede.todokedeID AND" +
            "    MK_sinsei.companyID = MK_todokede.companyID" +
            " WHERE" +
            "    MK_sinsei.companyID = N'" + self.companyID + "' AND" +
            "    (MK_todokede.todokedeKubun = 0 OR MK_todokede.todokedeKubun = 2 OR MK_todokede.todokedeKubun = 4 OR MK_todokede.todokedeKubun = 7) AND" +
            "    MK_sinsei.sinseiStaffID = N'" + self.staff + "' AND" +
            "   (shoninFlag <> 2) AND" +
            "    MK_sinsei.taishouDate BETWEEN N'" + dateToFormatString(new Date(self.sel("#sinseiFrom").val()), '%YYYY%/%MM%/%DD%') + "' AND" +
            "                                  N'" + dateToFormatString(new Date(self.sel("#sinseiTo").val()), '%YYYY%/%MM%/%DD%') + "'"
        );
        switch (self.exception.check(
            todokedeCheck,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101115",
            "同じ届出の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
            case false:
                return false;
            case null:
                break;
            case true:
                if (true === confirm('すでに同じ日の届出が提出されています。届出の内容を確認しますか？')) {
                    sessionStorage.setItem('sinseiNo', todokedeCheck[0].sinseiNo);
                    spaHash('#1010', 'reverse');
                }
                return false;
        }
    } else if (sinseiKomoku == '3') {
        // 時間外勤務届
        let todokedeCheck = '';
        if (sinseiKomoku == '4') {
            todokedeCheck = self.master.read(
                "SELECT" +
                "    MK_sinsei.sinseiNo," +
                "    MK_sinsei.taishouDate" +
                " FROM" +
                "    MK_sinsei INNER JOIN" +
                "    MK_todokede ON MK_sinsei.todokedeID = MK_todokede.todokedeID AND" +
                "    MK_sinsei.companyID = MK_todokede.companyID" +
                " WHERE" +
                "    MK_sinsei.companyID = N'" + self.companyID + "' AND" +
                "    (MK_todokede.todokedeKubun = 0 OR MK_todokede.todokedeKubun = 2 OR MK_todokede.todokedeKubun = 4 OR" +
                "    MK_todokede.todokedeKubun = 7) AND" +
                "    MK_sinsei.sinseiStaffID = N'" + self.staff + "' AND" +
                "   (shoninFlag <> 2) AND" +
                "    MK_sinsei.taishouDate BETWEEN N'" + dateToFormatString(new Date(self.sel("#sinseiFrom").val()), '%YYYY%/%MM%/%DD%') + "' AND" +
                "                                  N'" + dateToFormatString(new Date(self.sel("#sinseiTo").val()), '%YYYY%/%MM%/%DD%') + "'"
            );
            switch (self.exception.check(
                todokedeCheck,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101116",
                "同じ届出の取得に失敗しました。",
                ExceptionParamToMenu
            )) {
                case false:
                    return false;
                case null:
                    break;
                case true:
                    if (true === confirm('すでに同じ日の届出が提出されています。届出の内容を確認しますか？')) {
                        sessionStorage.setItem('sinseiNo', todokedeCheck[0].sinseiNo);
                        spaHash('#1010', 'reverse');
                    }
                    return false;
            }
        } else {
            todokedeCheck = self.master.read(
                "SELECT" +
                "    MK_sinsei.sinseiNo," +
                "    MK_sinsei.taishouDate" +
                " FROM" +
                "    MK_sinsei" +
                " INNER JOIN" +
                "    MK_todokede ON MK_sinsei.todokedeID = MK_todokede.todokedeID AND" +
                "    MK_sinsei.companyID = MK_todokede.companyID" +
                " WHERE" +
                "    MK_sinsei.companyID = N'" + self.companyID + "' AND" +
                "    (MK_todokede.todokedeKubun = 0 OR MK_todokede.todokedeKubun = 1 OR MK_todokede.todokedeKubun = 5 OR" +
                "    MK_todokede.todokedeKubun = 7) AND" +
                "    MK_sinsei.sinseiStaffID = N'" + self.staff + "' AND" +
                "   (shoninFlag <> 2) AND" +
                "    MK_sinsei.taishouDate BETWEEN N'" + dateToFormatString(new Date(self.sel("#sinseiFrom").val()), '%YYYY%/%MM%/%DD%') + "' AND" +
                "                                  N'" + dateToFormatString(new Date(self.sel("#sinseiTo").val()), '%YYYY%/%MM%/%DD%') + "'"
            );
        }
        switch (self.exception.check(
            todokedeCheck,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101117",
            "同じ届出の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
            case false:
                return false;
            case null:
                break;
            case true:
                if (true === confirm('すでに同じ日の届出が提出されています。届出の内容を確認しますか？')) {
                    sessionStorage.setItem('sinseiNo', todokedeCheck[0].sinseiNo);
                    spaHash('#1010', 'reverse');
                }
                return false;
        }
    } else if (sinseiKomoku == '4') {
        // 休日出勤届
        const todokedeCheck = self.master.read(
            "SELECT" +
            "   sinseiNo," +
            "   taishouDate" +
            " FROM" +
            "    MK_sinsei INNER JOIN" +
            "    MK_todokede ON MK_sinsei.todokedeID = MK_todokede.todokedeID AND" +
            "    MK_sinsei.companyID = MK_todokede.companyID" +
            " WHERE" +
            "    MK_sinsei.companyID = N'" + self.companyID + "' AND" +
            "    (MK_todokede.todokedeKubun = 0 OR MK_todokede.todokedeKubun = 6 OR MK_todokede.todokedeKubun = 7) AND" +
            "   (sinseiStaffID = N'" + self.staff + "') AND" +
            "   (shoninFlag <> 2) AND" +
            "   (taishouDate = N'" + dateToFormatString(new Date(self.sel("#sinseiFrom").val()), '%YYYY%/%MM%/%DD%') + "')"
        );
        switch (self.exception.check(
            todokedeCheck,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101118",
            "同じ届出の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
            case false:
                return false;
            case null:
                break;
            case true:
                if (true === confirm('すでに同じ日の届出が提出されています。届出の内容を確認しますか？')) {
                    sessionStorage.setItem('sinseiNo', todokedeCheck[0].sinseiNo);
                    spaHash('#1010', 'reverse');
                }
                return false;
        }
    }
    // 申請後のアラート表示
    if (confirm(msg + "この届出を申請します。よろしいですか？") == false) {
        return false;
    }
    // 早出フラグの取得
    //====================================
    // 申請テーブルへのインサート
    //====================================
    sinseiDateFrom = new Date(self.sel("#sinseiFrom").val());
    sinseiDateTo = new Date(self.sel("#sinseiTo").val());
    let sinseiDateCount = ((sinseiDateTo - sinseiDateFrom) / 86400000) + 1;
    if (sinseiKomoku == '4') {
        sinseiDateCount = 1;
    }
    if (sinseiKomoku == '7') {
        sinseiDateCount = 1;
    }
    let sinseiMax = 0;
    // 該当の会社の申請No最大値を取得する
    const sinseiCountData = self.master.read(
        "SELECT" +
        "    COUNT(sinseiNo) AS sinseiCount" +
        " FROM MK_sinsei" +
        " WHERE" +
        "    companyID=N'" + self.companyID + "'"
    );
    if (false === self.exception.check(
        sinseiCountData,
        ExceptionServerOn,
        ExceptionSystemOn,
        "101119",
        "申請数の取得に失敗しました。",
        ExceptionParamToMenu
    )) {
        return false;
    }
    // 申請が存在しないとき
    if (sinseiCountData[0].sinseiCount == '0') {
        sinseiMax = 1;
    }
    // 申請が存在するときに申請Noの最大値＋1を取得する
    else {
        const sinseiMaxData = self.master.read(
            "SELECT" +
            "    ISNULL(MAX(sinseiNo),0) AS sinseiMax" +
            " FROM MK_sinsei" +
            " WHERE" +
            "    companyID=N'" + self.companyID + "'"
        );
        if (false === self.exception.check(
            sinseiMaxData,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101120",
            "申請No最大値＋1の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
            return false;
        }
        sinseiMax = parseInt(sinseiMaxData[0].sinseiMax, 10) + 1;
    }
    // フォームロード時の日付の取得
    const YM = new Date();
    const yyyy = YM.getFullYear();
    const mm = addZero(YM.getMonth() + 1);
    const dd = addZero(YM.getDate());
    const todayDate = yyyy + "/" + mm + "/" + dd;
    const sinseiFromDate = new Date(self.sel("#sinseiFrom").val());
    // SQLを保存する配列の初期化
    self.setArraySQL = [];
    for (let i = 0; i < sinseiDateCount; i++) {
        const yyyy = sinseiFromDate.getFullYear();
        const mm = addZero(sinseiFromDate.getMonth() + 1);
        const dd = addZero(sinseiFromDate.getDate());
        // 欠勤届けのDBインサート
        if (sinseiKomoku == '0') {
            // 通常勤務時間
            self.sinseiSetDB(
                sinseiMax, // 申請ナンバーMAX
                self.companyID, // 会社番号
                self.staff, // 申請者のスタッフ番号
                self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                0, // 勤怠ナンバー
                3, // 届出区分
                self.sel("#kyukaShurui").val(), // 届出ID
                0, // 確認フラグ
                todayDate, // 申請日
                yyyy + "/" + mm + "/" + dd, // 対象日
                0, // 早出フラグ
                0, // 出勤時間
                0, // 退勤時間
                0, // 休憩時間
                self.sel("#shinseiJiyu textarea").val() // 申請の理由
            );
        }
        // 早退届けのDBインサート
        else if (sinseiKomoku == '1') {
            // 通常勤務時間
            self.sinseiSetDB(
                sinseiMax, // 申請ナンバーMAX
                self.companyID, // 会社番号
                self.staff, // 申請者のスタッフ番号
                self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                0, // 勤怠ナンバー
                3, // 届出区分
                1, // 届出ID
                0, // 確認フラグ
                todayDate, // 申請日
                yyyy + "/" + mm + "/" + dd, // 対象日
                0, // 早出フラグ
                0, // 出勤時間
                to10(self.sel("#taikinJikan").val()), // 退勤時間
                0,
                // parseFloat(self.sel("#kyukeiJikan").val()) / 60.0, // 休憩時間
                self.sel("#shinseiJiyu textarea").val() // 申請の理由
            );
        }
        // 遅刻届けのDBインサート
        else if (sinseiKomoku == '2') {
            // 通常勤務時間
            self.sinseiSetDB(
                sinseiMax, // 申請ナンバーMAX
                self.companyID, // 会社番号
                self.staff, // 申請者のスタッフ番号
                self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                0, // 勤怠ナンバー
                3, // 届出区分
                2, // 届出ID
                0, // 確認フラグ
                todayDate, // 申請日
                yyyy + "/" + mm + "/" + dd, // 対象日
                0, // 早出フラグ
                to10(self.sel("#shukinJikan").val()), // 出勤時間
                0, // 退勤時間
                0,
                // parseFloat(self.sel("#kyukeiJikan").val()) / 60.0, // 休憩時間
                self.sel("#shinseiJiyu textarea").val() // 申請の理由
            );
        }
        // 時間外勤務届けのDBインサート
        else if (sinseiKomoku == '3') {
            let kaishiTime = 0;
            let syuryoTime = 0;
            if (self.sel("#todokedeKubun").val() == '4') {
                kaishiTime = to10(self.sel("#shukinJikan").val());
                syuryoTime = to10(self.shukinJikan);
            } else {
                kaishiTime = to10(self.taikinJikan);
                syuryoTime = to10(self.sel("#taikinJikan").val());
            }
            // 通常勤務時間
            self.sinseiSetDB(
                sinseiMax, // 申請ナンバーMAX
                self.companyID, // 会社番号
                self.staff, // 申請者のスタッフ番号
                self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                0, // 勤怠ナンバー
                3, // 届出区分
                self.sel("#todokedeKubun").val(), // 届出ID
                0, // 確認フラグ
                todayDate, // 申請日
                yyyy + "/" + mm + "/" + dd, // 対象日
                0, // 早出フラグ
                kaishiTime, // 開始時間
                syuryoTime, // 終了時間
                0, // 休憩時間
                self.sel("#shinseiJiyu textarea").val() // 申請の理由
            );
        }
        // 休日出勤届けのDBインサート
        else if (sinseiKomoku == '4') {
            // 通常勤務時間
            self.sinseiSetDB(
                sinseiMax, // 申請ナンバーMAX
                self.companyID, // 会社番号
                self.staff, // 申請者のスタッフ番号
                self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                0, // 勤怠ナンバー
                3, // 届出区分
                6, // 届出ID
                0, // 確認フラグ
                todayDate, // 申請日
                yyyy + "/" + mm + "/" + dd, // 対象日
                0, // 早出フラグ
                0, // 出勤時間
                0, // 退勤時間
                0, // 休憩時間
                // parseFloat(self.sel("#kyukeiJikan").val()) / 60.0, // 休憩時間
                self.sel("#shinseiJiyu textarea").val() // 申請の理由
            );
            if (self.sel("#kyuka").val() == '0') {
                // 休暇タイプが振休の場合休暇申請を行う
                const kyukabi = new Date(self.sel("#kyukaDay").val());
                const kyukaNen = kyukabi.getFullYear();
                const kyukaTuki = addZero(kyukabi.getMonth() + 1);
                const kyukaHi = addZero(kyukabi.getDate());
                self.sinseiSetDB(
                    sinseiMax + 1, // 申請ナンバーMAX
                    self.companyID, // 会社番号
                    self.staff, // 申請者のスタッフ番号
                    self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                    0, // 勤怠ナンバー
                    3, // 届出区分
                    8, // 届出ID
                    0, // 確認フラグ
                    todayDate, // 申請日
                    kyukaNen + '/' + kyukaTuki + '/' + kyukaHi, // 対象日
                    0, // 早出フラグ
                    0, // 出勤時間
                    0, // 退勤時間
                    0, // 休憩時間
                    // parseFloat(self.sel("#kyukeiJikan").val()) / 60.0, // 休憩時間
                    self.sel("#shinseiJiyu textarea").val() // 申請の理由
                );
            }
        } else if (sinseiKomoku == '5') {
            // 未実装
        }
        // その他届けのDBインサート
        else if (sinseiKomoku == '99') {
            self.sinseiSetDB(
                sinseiMax, // 申請ナンバーMAX
                self.companyID, // 会社番号
                self.staff, // 申請者のスタッフ番号
                self.sel("#shoninSha").val(), // 確認者のスタッフ番号
                0, // 勤怠ナンバー
                99, // 届出区分
                99, // 届出ID
                0, // 確認フラグ
                todayDate, // 申請日
                yyyy + "/" + mm + "/" + dd, // 対象日
                0, // 早出フラグ
                0, // 出勤時間
                0, // 退勤時間
                0, // 休憩時間
                self.sel("#shinseiJiyu textarea").val() // 申請の理由
            );
        }
        // 日付のカウントアップ
        sinseiFromDate.setDate(sinseiFromDate.getDate() + 1);
    }
    // 申請された届出を期間分だけまとめてコミットする
    const errorLog = self.database.setArray(self.setArraySQL, false);
    if (false === self.exception.check(
        errorLog,
        ExceptionServerOn,
        ExceptionSystemOn,
        "101121",
        "新規申請の登録に失敗しました。",
        ExceptionParamToMenu
    )) {
        return false;
    }
    //====================================
    // 通知の送信処理
    //====================================
    // 通知先の情報を取得する
    const tutiData = self.master.read(`
        SELECT
            registerID,
            name
        FROM MK_smartPhone
        WHERE
            staffID=N'${self.sel("#shoninSha").val()}' AND
            companyID=N'${self.companyID}' AND
            name<>N'card' AND
            registerID<>N'' AND
            registerID<>N'logout' AND
            registerID IS NOT NULL
    `);
    switch (self.exception.check(
        tutiData,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101122",
        "同じ届出の取得に失敗しました。",
        ExceptionParamToMenu
    )) {
        case false:
            return false;
        case null:
            break;
        case true:
            // 通知を送る
            const regData = [];
            const nameData = [];
            for (let i in tutiData) {
                regData.push(tutiData[i].registerID);
                nameData.push(tutiData[i].name);
            }
            commonPushFunc(
                '',
                regData,
                self.companyID,
                self.sel("#shoninSha").val(),
                "新規届出が申請されました",
                "mode=",
                '',
                nameData,
                false
            );
    }
    // 権限によって遷移先を分岐する処理
    if ('2' == self.admCD) {
        spaHash('#1012', 'reverse');
    } else {
        spaHash('#1009', 'reverse');
    }
    return false;
};