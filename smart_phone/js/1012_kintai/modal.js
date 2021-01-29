"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
MainClass1012.prototype.sinseiPop = function(sinseiNo, shoninFlag) {
    const self = this;
    // モーダルエリアの初期設定
    // モーダルを表示する
    self.sel('#modal1').modal('open');
    //*****************************
    // 初期表示処理
    //*****************************
    const todokedeName = self.sinseiShosaiDraw(sinseiNo, false);
    if (todokedeName == false) {
        self.sel('#modal1').modal('close');
        // 集計の表示
        self.totalDisplay(self.ymdA, self.ymdB);
        // 一覧表示
        self.listDisplay(self.ymdA, self.ymdB, self.sime);
    }
    //****************************************//
    // 取り下げボタン押下処理
    // 不承認の届出も取り下げられるようにする 2020/09/04 
    //****************************************//
    // if (shoninFlag == '2') {
    //     self.sel('#del').hide();
    // } else {
    //     self.sel('#del').show();
    //     self.ev('click', '#del', function() {
    //         // 取り下げが成功した時
    //         if (true == self.torisageButton(sinseiNo)) {
    //             return true;
    //         }
    //         // 取り下げに失敗した時
    //         else {
    //             return false;
    //         }
    //     });
    // }
    self.sel('#del').show();
    self.ev('click', '#del', function() {
        // 取り下げが成功した時
        if (true == self.torisageButton(sinseiNo)) {
            return true;
        }
        // 取り下げに失敗した時
        else {
            return false;
        }
    });
};
//---------------------------------------
// 取り下げボタン押下時の処理
// 引数 paraSinseiNo : 申請No
// 届出を取り下げた時、DBより削除する 2020/09/04 
//---------------------------------------
MainClass1012.prototype.torisageButton = function(paraSinseiNo) {
    const self = this;
    const msg = "届出が取り下げられました";
    const kousinStaffID = self.nowShoninStaff;
    if (confirm("対象の届け出を取り下げます。よろしいですか？") == false) {
        return false;
    }
    const deleteFlag = self.master.del(
        "MK_sinsei",
        "", [
            "sinseiNo  = '" + paraSinseiNo + "'",
            "companyID = '" + self.companyID + "'"
        ]
    );
    switch (self.exception.check(
        deleteFlag,
        ExceptionServerOn,
        ExceptionSystemOn,
        "101202",
        "対象の届け出を取り下げに失敗しました。",
        ExceptionParamToMenu
    )) {
        case false:
            return false;
        case null:
            return false;
        default:
            break;
    }
    // const editFlag = self.master.edit(
    //     "MK_sinsei",
    //     false, [
    //         "shoninDate",
    //         "commitStaffID",
    //         "shoninFlag",
    //         "kyakkaRiyu"
    //     ], [
    //         "N'" + self.today + "'",
    //         "N'" + self.staff + "'",
    //         "'" + shoninFlag + "'",
    //         "''"
    //     ], [
    //         "sinseiNo='" + paraSinseiNo + "'",
    //         "companyID=N'" + self.companyID + "'"
    //     ]
    // );
    // switch (self.exception.check(
    //     editFlag,
    //     ExceptionServerOn,
    //     ExceptionSystemOn,
    //     "101202",
    //     "対象の届け出を取り下げに失敗しました。",
    //     ExceptionParamToMenu
    // )) {
    //     case false:
    //         return false;
    //     case null:
    //         return false;
    //     default:
    //         break;
    // }
    // 申請者の登録済み端末のレジスタIDを全て取得する
    const regData = [];
    const nameData = [];
    const tanmatuData = self.master.read(`
        SELECT
            registerID,
            name
        FROM MK_smartPhone
        WHERE
            staffID=N'${kousinStaffID}' AND
            companyID=N'${self.companyID}' AND
            name<>N'card' AND
            registerID<>N'' AND
            registerID<>N'logout' AND
            registerID IS NOT NULL
    `);
    if (false === self.exception.check(
            tanmatuData,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101203",
            "申請者の登録済み端末の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    for (let i in tanmatuData) {
        regData.push(tanmatuData[i].registerID);
        nameData.push(tanmatuData[i].name);
    }
    commonPushFunc(
        "",
        regData,
        self.companyID,
        self.nowSinseiStaff,
        msg,
        "mode=5",
        "",
        nameData,
        false
    );
    self.sel('#modal1').modal('close');
    // 集計の表示
    self.totalDisplay(self.ymdA, self.ymdB);
    // 一覧表示
    self.listDisplay(self.ymdA, self.ymdB, self.sime);
    return true;
};