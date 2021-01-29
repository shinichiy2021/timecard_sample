"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*******************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1007.prototype.sel = function(selecter) {
    return $(".view1007 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1007.prototype.ev = function(eventName, selecter, func) {
    $(".view1007").on(eventName, selecter, func);
};
//=========================================
// 関数
// 関数はこのJSファイルに記入してください
// ボタンチェンジ関数
//=========================================
MainClass1007.prototype.buttonChange = function() {
    const self = this;
    if (self.msgNo != '' && self.msgNo != null) {
        self.sel("#new").attr("disabled", false);
    }    
};
//=========================================
// 入力エラーチェック
//=========================================
MainClass1007.prototype.errorCheck = function(title, subTitle, msgText) {
    const self = this;
    // 必須項目エラーチェック
    // タイトルが入力されていること
    if (subTitle.trim() == "") {
        Materialize.toast('タイトルを入力してください', 3000);
        return false;
    }
    // タイトルが全角で255文字以内でない場合。
    if (subTitle.length > 255) {
        Materialize.toast('タイトルは全角255文字以内で入力してください。', 3000);
        return false;
    }
    // タイトルに絵文字が含まれている場合。
    if (subTitle.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('タイトルに使用できない絵文字が含まれています。', 3000);
        return false;
    }
    // 情報区分が選択されていること
    if (title == "選択してください") {
        Materialize.toast('情報区分を選択してください。', 3000);
        return false;
    }
    // 日付エラーチェック
    const YM = new Date();
    const Y = YM.getFullYear();
    const M = YM.getMonth() + 1;
    const DA = YM.getDate();
    const hiduke = self.sel("#ym").val();
    const hidukeArray = hiduke.split("-");
    const yy = hidukeArray[0];
    const mm = hidukeArray[1];
    const dd = hidukeArray[2];
    self.keisaikigen = yy + "/" + mm + "/" + dd;
    // 日付形式
    if (!hiduke.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
        Materialize.toast('掲載期限はyyyy-MM-ddの形式で入力してください。', 3000);
        return false;
    }
    // システム日付本日以前エラー
    if (Y < parseInt(yy, 10)) {} else if (
        (Y > parseInt(yy, 10) || (Y <= parseInt(yy, 10) && M > parseInt(mm, 10))) ||
        (Y <= parseInt(yy, 10) && M >= parseInt(mm, 10) && DA > parseInt(dd, 10))) {
        Materialize.toast('掲載期限は本日以降の日付を入力してください。', 3000);
        return false;
    }
    //-------------------------------
    // 2018/08/09
    // yamazaki
    // 存在しない年月は日付形式でエラーが出るため下記のエラー処理は削除しました
    //-------------------------------
    // 本文が入力されていること
    if (msgText.trim() == "") {
        Materialize.toast('本文を入力してください。', 3000);
        return false;
    }
    // 本文が255文字以内でない場合
    if (msgText.length > 255) {
        Materialize.toast('本文は全角255文字以内で入力してください。', 3000);
        return false;
    }
    // 本文に絵文字が含まれている場合。
    if (msgText.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('本文に使用できない絵文字が含まれています。', 3000);
        return false;
    }
    return true;
};
//=========================================
// 登録・更新処理
//=========================================
MainClass1007.prototype.eventEntry = function(title, subTitle, msgText) {
    const self = this;
    //----------------------------------------------
    // 2018/04/13 nishio
    // マッピング情報2
    // スマホマスタの抽出
    //----------------------------------------------
    const sMaster = self.master.read(`
        SELECT
            idm,
            staffID,
            registerID,
            name
        FROM MK_smartPhone
        WHERE
            companyID=N'${self.companyID}' AND
            name<>N'card' AND
            registerID<>N'' AND
            registerID<>N'logout' AND
            registerID IS NOT NULL
    `);
    const sMasterFlag = self.exception.check(
        sMaster,
        ExceptionServerOn,
        ExceptionSystemOff,
        "100702",
        "スマホマスタの抽出が取得出来ませんでした。",
        ExceptionParamToMenu
    );
    if (false === sMasterFlag) {
        return false;
    }
    // 現在日付時間を取得
    if (self.msgNo != '' && self.msgNo != null) {
        self.editEvent(
            title,
            subTitle,
            self.keisaikigen,
            msgText,
            self.today,
            sMaster
        );
    } else {
        // 新規登録
        self.shinkiEntry(
            title,
            subTitle,
            self.keisaikigen,
            msgText,
            self.today,
            sMaster
        );
    }
};
//----------------------------------------------
// マッピング情報3
// 新規登録
//----------------------------------------------
MainClass1007.prototype.shinkiEntry = function(
    title,
    subTitle,
    keisaikigen,
    msgText,
    todayNow,
    sMaster
) {
    const self = this;
    let sMstaff = "";
    let sMidm = "";
    const sMregisterID = [];
    const sMname = [];
    const mode = "4";
    const entFlg = self.master.entry(
        "MK_event",
        "", [
            "staffID",
            "title",
            "subTitle",
            "keisaiKigen",
            "note",
            "companyID",
            "sakuseiDate"
        ], [
            "N'" + self.staff + "'",
            "N'" + title + "'",
            "N'" + subTitle + "'",
            "N'" + keisaikigen + "'",
            "N'" + msgText + "'",
            "N'" + self.companyID + "'",
            "'" + todayNow + "'"
        ]
    );
    if (false === self.exception.check(
            entFlg,
            ExceptionServerOn,
            ExceptionSystemOff,
            "100703",
            "お知らせの登録に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    //----------------------------------------------
    // マッピング情報4
    // 新規登録したイベントナンバーの取得
    //----------------------------------------------
    const list = self.master.read(`
        SELECT
            eventNo
        FROM MK_event
        WHERE
            companyID=N'${self.companyID}'  AND
            staffID=N'${self.staff}' AND
            sakuseiDate=N'${todayNow}'
    `);
    if (false === self.exception.check(
            list,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100704",
            "登録したお知らせの取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    const eventNo = list[0].eventNo;
    // 通知履歴の新規登録 （スマホマスタ件数分処理を行う）
    let staffCache = '';
    for (let i in sMaster) {
        sMstaff = sMaster[i].staffID;
        sMidm = sMaster[i].idm;
        let midokuFlag = 0;
        if (sMstaff == self.staff) {
            midokuFlag = 1;
        } else {
            // 通知する情報をADDする。
            sMregisterID.push(sMaster[i].registerID);
            sMname.push(sMaster[i].name);
        }
        //----------------------------------------------
        // マッピング情報5
        // 通知履歴の新規登録
        //----------------------------------------------
        const histryFlg = self.master.entry(
            "MK_history",
            "", [
                "category",
                "ymdTime",
                "staffID",
                "companyID",
                "flag",
                "externNo"
            ], [
                "'2'",
                "N'" + todayNow + "'",
                "N'" + sMstaff + "'",
                "N'" + self.companyID + "'",
                "'" + midokuFlag + "'",
                "N'" + eventNo + "'"
            ]
        );
        if (false === self.exception.check(
                histryFlg,
                ExceptionServerOn,
                ExceptionSystemOff,
                "100705",
                "通知履歴の登録に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        staffCache = sMstaff;
        // チェンジフラグをfalseにする
    }
    // 自分以外のスマホ所持者に通知を送る
    commonPushFunc(
        sMidm,
        sMregisterID,
        self.companyID,
        sMstaff,
        "お知らせが追加されました",
        "mode=" + mode,
        "",
        sMname,
        false
    );
    spaHash('#1006', 'reverse');
    return false;
};
//----------------------------------------------
// マッピング情報7
// イベントのアップデート
//----------------------------------------------
MainClass1007.prototype.editEvent = function(
    title,
    subTitle,
    keisaikigen,
    msgText,
    todayNow,
    sMaster
) {
    const self = this;
    let sMstaff = "";
    let sMidm = "";
    const sMregisterID = [];
    const sMname = [];
    const mode = "4";
    let msg = "";
    const eventEdit = self.master.edit(
        "MK_event",
        "", [
            "title",
            "subTitle",
            "keisaiKigen",
            "note",
            "staffID"
        ], [
            "N'" + title + "'",
            "N'" + subTitle + "'",
            "N'" + keisaikigen + "'",
            "N'" + msgText + "'",
            "N'" + self.staff + "'"
        ], [
            "companyID = '" + self.companyID + "'",
            "eventNo = '" + self.msgNo + "'"
        ]
    );
    if (false === self.exception.check(
            eventEdit,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100706",
            "お知らせの更新に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 通知履歴のアップデート
    // スマホマスター分繰り返す
    let staffCache = '';
    for (let s in sMaster) {
        sMstaff = sMaster[s].staffID;
        sMidm = sMaster[s].idm;
        // 通知履歴にスタッフIDがある場合、通知履歴を更新
        let midokuFlag = 0;
        if (sMstaff == self.staff) {
            midokuFlag = 1;
        } else {
            // 通知する情報をADDする。
            sMregisterID.push(sMaster[s].registerID);
            sMname.push(sMaster[s].name);
        }
        //----------------------------------------------
        // マッピング情報8
        // 通知履歴のアップデート
        //----------------------------------------------
        const historyEd = self.master.edit(
            "MK_history",
            "", [
                "ymdTime",
                "flag"
            ], [
                "N'" + todayNow + "'",
                "'" + midokuFlag + "'"
            ], [
                "companyID = N'" + self.companyID + "'",
                "staffID = N'" + sMstaff + "'",
                "externNo = '" + self.msgNo + "'",
                "category = '2'"
            ]
        );
        const historyEdFlag = self.exception.check(
            historyEd,
            ExceptionServerOn,
            ExceptionSystemOff,
            "100707",
            "通知履歴の更新に失敗しました。",
            ExceptionParamToMenu
        );
        if (historyEdFlag == false) {
            return false;
        }
        if (historyEdFlag == null) {
            // 新規通知履歴挿入
            const histryFlg = self.master.entry(
                "MK_history",
                "", [
                    "category",
                    "ymdTime",
                    "staffID",
                    "companyID",
                    "flag",
                    "externNo"
                ], [
                    "'2'",
                    "N'" + todayNow + "'",
                    "N'" + sMstaff + "'",
                    "N'" + self.companyID + "'",
                    "'" + midokuFlag + "'",
                    "N'" + self.msgNo + "'"
                ]
            );
            if (false === self.exception.check(
                    histryFlg,
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "100708",
                    "通知履歴の登録に失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        }
        msg = "お知らせが更新されました";
        staffCache = sMstaff;
    }
    // 通知を送る。
    commonPushFunc(
        sMidm,
        sMregisterID,
        self.companyID,
        sMstaff,
        msg,
        "mode=" + mode,
        "",
        sMname,
        false
    );
    // ローカルストレージの値を削除
    localStorage.removeItem("subTitle");
    localStorage.removeItem("title");
    localStorage.removeItem("ym");
    localStorage.removeItem("msgText");
    spaHash('#1006', 'reverse');
    return false;
};
//----------------------------------------------
// イベントの削除
//----------------------------------------------
MainClass1007.prototype.eventDel = function() {
    const self = this;
    //----------------------------------------------
    // イベントテーブルの削除
    //----------------------------------------------
    const eventDelete = self.master.del(
        "MK_event ",
        "", [
            "companyID = N'" + self.companyID + "'",
            "eventNo = '" + self.msgNo + "'"
        ]
    );
    if (false === self.exception.check(
            eventDelete,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100709",
            "お知らせ削除に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 履歴テーブルの削除テーブルの削除
    const historyDelete = self.master.del(
        "MK_history ",
        "", [
            "companyID = N'" + self.companyID + "'",
            "externNo = '" + self.msgNo + "'",
            "category = '2'"
        ]
    );
    if (false === self.exception.check(
            historyDelete,
            ExceptionServerOn,
            ExceptionSystemOff,
            "100710",
            "お知らせ削除に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
};