"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1008.prototype.sel = function(selecter) {
    return $(".view1008 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1008.prototype.ev = function(eventName, selecter, func) {
    $(".view1008").on(eventName, selecter, func);
};
//=========================================
// 関数
// 関数はこのJSファイルに記入してください
//=========================================
MainClass1008.prototype.notify = function() {
// MainClass.prototype.notify = function() {
    const self = this;
    // 現在日付時間を取得
    const todayNow = self.getTodayNow();
    const mapping2_Data = self.getHistory();
    if (false === self.exception.check(
            mapping2_Data,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100802",
            "通知履歴データが存在しません。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 通知履歴データの取得できた場合
    self.mapping2_Data = mapping2_Data;
    const mapping3_Data = self.getSmaho();
    if (false === self.exception.check(
            mapping3_Data,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100803",
            "スマートフォン登録者の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // スマホマスタの抽出データの取得できた場合
    self.mapping3_Data = mapping3_Data;
    let sMstaff = '';
    let sMidm = '';
    const sMregisterID = [];
    const sMname = [];
    const msg = "お知らせが更新されました。";
    const mode = "4";
    // 通知履歴にスマホマスタのスタッフIDがあるかどうか
    for (let i in self.mapping3_Data) {
        for (let s in self.mapping2_Data) {
            const filtered = $.grep(self.mapping3_Data, function(elem, index) {
                return (elem.staffID == self.mapping3_Data[i].staffID);
            });
            sMstaff = self.mapping3_Data[i].staffID;
            const mpStaff = self.mapping2_Data[s].staffID;
            if (sMstaff == mpStaff) {
                // 通知履歴にスタッフIDがない場合、通知を送らない
                if (filtered.length != 0) {
                    sMidm = self.mapping3_Data[i].idm;
                    sMregisterID.push(self.mapping3_Data[i].registerID);
                    sMname.push(self.mapping3_Data[i].name);
                    //----------------------------------------------
                    // マッピング情報4
                    // 通知履歴にスタッフIDがある場合、通知履歴を更新
                    //----------------------------------------------
                    const historyEd = self.master.edit(
                        "MK_history",
                        "", [
                            "ymdTime",
                            "flag"
                        ], [
                            "N'" + todayNow + "'",
                            "'0'"
                        ], [
                            "companyID = '" + self.companyID + "'",
                            "externNo = '" + self.msgNo + "'",
                            "category = '2'",
                            "staffID = '" + sMstaff + "'"
                        ]
                    );
                    if (false === self.exception.check(
                            historyEd,
                            ExceptionServerOn,
                            ExceptionSystemOn,
                            "100804",
                            "通知履歴データの更新に失敗しました。",
                            ExceptionParamToMenu
                        )) {
                        return false;
                    }
                }
            }
        }
    }
    if (sMregisterID.length == 0) {
        Materialize.toast('スマートフォン登録情報が取得出来ません。再通知を中断します。', 3000);
        return false;
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
    return true;
};
MainClass1008.prototype.getTodayNow = function() {
    const NowYMDT = new Date();
    const NowY = NowYMDT.getFullYear();
    const NowM = NowYMDT.getMonth() + 1;
    const NowD = NowYMDT.getDate();
    const Nowhour = NowYMDT.getHours();
    const Nowminute = NowYMDT.getMinutes();
    const Nowsecond = NowYMDT.getSeconds();
    const todayNow = NowY + "/" + ("0" + (parseInt(NowM, 10))).slice(-2) + "/" + ("0" + parseInt(NowD, 10)).slice(-2) + " " + ("0" + parseInt(Nowhour, 10)).slice(-2) + ":" + ("0" + parseInt(Nowminute, 10)).slice(-2) + ":" + ("0" + parseInt(Nowsecond, 10)).slice(-2);
    return todayNow;
};
//----------------------------------------------
// マッピング情報2
// 通知履歴テーブルのデータを抽出する。
//----------------------------------------------
MainClass1008.prototype.getHistory = function() {
    const self = this;
    const mapping2_Data = self.master.read(
        " SELECT" +
        "    MK_history.historyNo," +
        "    MK_history.companyID," +
        "    MK_history.category," +
        "    MK_history.ymdTime," +
        "    MK_history.staffID," +
        "    MK_history.groupID," +
        "    MK_history.flag," +
        "    MK_history.externNo" +
        " FROM MK_history" +
        " INNER JOIN  MK_staff ON" +
        "    MK_history.staffID = MK_staff.staffID AND" +
        "    MK_history.companyID = MK_staff.companyID" +
        " WHERE MK_history.companyID = N'" + self.companyID + "' AND" +
        "    MK_history.externNo = '" + self.msgNo + "' AND" +
        "    MK_history.category = '2' AND" +
        "    flag = '0' AND" +
        "    ((MK_staff.retireDate > N'" + self.today + "') OR" +
        "    (MK_staff.retireDate IS NULL) OR" +
        "    (MK_staff.retireDate =''))"
    );
    return mapping2_Data;
};
//----------------------------------------------
// マッピング情報3
// スマホマスタの抽出
//----------------------------------------------
MainClass1008.prototype.getSmaho = function() {
    const self = this;
    const mapping3_Data = self.master.read(`
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
    return mapping3_Data;
};