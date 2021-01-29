"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1010.prototype.sel = function(selecter) {
    return $(".view1010 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1010.prototype.ev = function(eventName, selecter, func) {
    $(".view1010").on(eventName, selecter, func);
};
//---------------------------------------
// 確認ボタン押下時の処理
// 引数 paraSinseiNo : 申請No
// 引数 shoninFlag   : 確認フラグ
//---------------------------------------
MainClass1010.prototype.kousinButton = function(paraSinseiNo, shoninFlag) {
    const self = this;
    let msg = "";
    let kousinStaffID = "";
    
    switch(shoninFlag){
        case '0':
            // 確認済みの申請を確認待ちにする時
            msg = "届出が確認待ちになりました";
            kousinStaffID = self.nowSinseiStaff;
            if (confirm("対象の届け出を確認待ちにします。よろしいですか？") == false) {
                return false;
            }
            self.editSinsei(shoninFlag,paraSinseiNo,msg,kousinStaffID);
        break;
        case '1':
            // 申請を確認した時
            msg = "届出が承認されました";
            kousinStaffID = self.nowSinseiStaff;
            if (confirm("対象の届け出を承認します。よろしいですか？") == false) {
                return false;
            }
            self.editSinsei(shoninFlag,paraSinseiNo,msg,kousinStaffID);
        break;
        case '2':
            // 申請を不承認にする時
            msg = "届出が承認されませんでした";
            kousinStaffID = self.nowSinseiStaff;
            if (confirm("対象の届け出を不承認にします。よろしいですか？") == false) {
                return false;
            }
            self.editSinsei(shoninFlag,paraSinseiNo,msg,kousinStaffID);
        break;
        default:
            // 自分の申請を取り下げた時
            msg = "届出が取り下げられました";
            kousinStaffID = self.nowShoninStaff;
            if (confirm("対象の届け出を取り下げます。よろしいですか？") == false) {
                return false;
            }
            self.systemDelete(paraSinseiNo);
        break;
    }
    // // 申請を確認した時
    // if (shoninFlag == '1') {
    //     msg = "届出が確認されました";
    //     kousinStaffID = self.nowSinseiStaff;
    //     if (confirm("対象の届け出を確認済にします。よろしいですか？") == false) {
    //         return false;
    //     }
    // }
    // // 申請を取り下げた時
    // else {
    //     msg = "届出が取り下げられました";
    //     kousinStaffID = self.nowShoninStaff;
    //     if (confirm("対象の届け出を取り下げます。よろしいですか？") == false) {
    //         return false;
    //     }
    // }
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
    // if (false === self.exception.check(
    //         editFlag,
    //         ExceptionServerOn,
    //         ExceptionSystemOn,
    //         "101001",
    //         "更新処理に失敗しました。",
    //         ExceptionParamToMenu
    //     )) {
    //     return false;
    // }
    // // 申請者の登録済み端末のレジスタIDを全て取得する
    // const regData = [];
    // const nameData = [];
    // const tanmatuData = self.master.read(`
    //     SELECT
    //         registerID,
    //         name
    //     FROM MK_smartPhone
    //     WHERE
    //         staffID=N'${kousinStaffID}' AND
    //         companyID=N'${self.companyID}' AND
    //         name<>N'card' AND
    //         registerID<>N'' AND
    //         registerID<>N'logout' AND
    //         registerID IS NOT NULL
    // `);
    // const tanmatuDataFlag = self.exception.check(
    //     tanmatuData,
    //     ExceptionServerOn,
    //     ExceptionSystemOff,
    //     "101002",
    //     "登録済み端末が存在しません。",
    //     ExceptionParamToMenu
    // );
    // if (tanmatuDataFlag == false) {
    //     return false;
    // }
    // // 上記で取得した端末全てに通知を送る
    // // （通知が送れたかどうかのチェックはしない）
    // for (let i in tanmatuData) {
    //     regData.push(tanmatuData[i].registerID);
    //     nameData.push(tanmatuData[i].name);
    // }
    // commonPushFunc(
    //     '',
    //     regData,
    //     self.companyID,
    //     self.nowSinseiStaff,
    //     msg,
    //     'mode=5',
    //     '',
    //     nameData,
    //     false
    // );
    // spaHash('#1009', 'reverse');
    // return false;
};
//---------------------------------------
// 申請データの更新処理
//---------------------------------------
MainClass1010.prototype.editSinsei = function(shoninFlag,paraSinseiNo,msg,kousinStaffID) {
    const self = this;
    let commitStaffID = self.staff;
    let todayDate = self.today;
    if(shoninFlag === "0"){ 
        commitStaffID = "";
        todayDate = "";
    }
    const editFlag = self.master.edit(
        "MK_sinsei",
        false, [
            "shoninDate",
            "commitStaffID",
            "shoninFlag",
            "kyakkaRiyu"
        ], [
            "N'" + todayDate + "'",
            "N'" + commitStaffID + "'",
            "'" + shoninFlag + "'",
            "''"
        ], [
            "sinseiNo='" + paraSinseiNo + "'",
            "companyID=N'" + self.companyID + "'"
        ]
    );
    if (false === self.exception.check(
            editFlag,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101001",
            "更新処理に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
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
    const tanmatuDataFlag = self.exception.check(
        tanmatuData,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101002",
        "登録済み端末が存在しません。",
        ExceptionParamToMenu
    );
    if (tanmatuDataFlag == false) {
        return false;
    }
    // 上記で取得した端末全てに通知を送る
    // （通知が送れたかどうかのチェックはしない）
    for (let i in tanmatuData) {
        regData.push(tanmatuData[i].registerID);
        nameData.push(tanmatuData[i].name);
    }
    commonPushFunc(
        '',
        regData,
        self.companyID,
        self.nowSinseiStaff,
        msg,
        'mode=5',
        '',
        nameData,
        false
    );
    let mailMsg = "承認されました。";
    if(shoninFlag == "2"){
        mailMsg = "不承認になりました。"
    }
    let mailFlag = true;
    let mailName = '';
    self.nowTaishouDate = self.sel(".startEndDate").text();
    if(tanmatuData === null){
        if (self.sinseiStaffMail(mailMsg) == false) {
            mailName += " " + self.nowSinseiName + 'さん,';
            mailFlag = false;
        }
    }
    if(self.nowShoninStaff != self.staff){
        if (self.kakuninStaffMail(mailMsg) == false) {
            mailName += " " + self.shoninName + 'さん,';
            mailFlag = false;
        }
    }
    if (false === self.kanriStaffMail(mailMsg)) {
        mailName += " 会社代表メール" + ',';
        mailFlag = false;
    }
    if (mailName != '') {
        //最後のカンマを取り除く
        mailName = mailName.slice(0, -1);
    }
    // 正常終了
    if (mailFlag == true) {
        spaHash('#1009', 'reverse');
        return false;
    } else {
        return false;
    }
    // spaHash('#1009', 'reverse');
    // return false;
}
//---------------------------------------
// 自身の所属する会社の代表メールアドレスを取得
//---------------------------------------
MainClass1010.prototype.compEmail = function() {
    const self = this;
    const lMemberData = self.master.read(`
        SELECT
            MK_company.email
        FROM MK_staff
        INNER JOIN MK_company ON
            MK_staff.companyID=MK_company.companyID
        WHERE
            MK_staff.staffID=N'${self.staff}' AND
            MK_staff.companyID=N'${self.companyID}'
    `);
    if (false === self.exception.check(
            lMemberData,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101003",
            "代表メールアドレスが取得来ませんでした。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    return lMemberData[0].email;
};
//---------------------------------------
// 引数 paraSinseiNo : 申請No
//---------------------------------------
MainClass1010.prototype.systemDelete = function(paraSinseiNo) {
    const self = this;
    self.nowTaishouDate = self.sel(".startEndDate").text();
    // if (confirm("対象の届け出を削除します。よろしいですか？") == false) {
    //     // 以下の処理を行わない
    //     return false;
    // }
    const deleteFlag = self.master.del(
        "MK_sinsei",
        "", [
            "sinseiNo  = '" + paraSinseiNo + "'",
            "companyID = '" + self.companyID + "'"
        ]
    );
    if (false === self.exception.check(
            deleteFlag,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101004",
            "取り下げ処理に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    let mailFlag = true;
    let mailName = '';
    const mailMsg = "取り下げられました。";
    // 削除された事を知らせるメールを申請者に送る
    if (self.sinseiStaffMail(mailMsg) == false) {
        mailName += " " + self.nowSinseiName + 'さん,';
        mailFlag = false;
    }
    // 削除された事を知らせるメールを承認者に送る
    if (self.kakuninStaffMail(mailMsg) == false) {
        mailName += " " + self.shoninName + 'さん,';
        mailFlag = false;
    }
    // 削除された事を知らせるメールを代表メールに送る
    if (false === self.kanriStaffMail(mailMsg)) {
        mailName += " 会社代表メール" + ',';
        mailFlag = false;
    }
    if (mailName != '') {
        //最後のカンマを取り除く
        mailName = mailName.slice(0, -1);
    }
    // 正常終了
    if (mailFlag == true) {
        spaHash('#1009', 'reverse');
        return false;
    } else {
        return false;
    }
};
//=============================================
// メールアドレスの取得(該当の届出を提出した人)
//=============================================
MainClass1010.prototype.getStaffEmail = function() {
    const self = this;
    // 届出を提出した人のメールアドレスを取得する
    const teishutuStaffInfo = self.master.read(`
        SELECT
            email
        FROM MK_staff
        WHERE
            companyID=N'${self.companyID}' AND
            staffID=N'${self.nowSinseiStaff}'
    `);
    if (false === self.exception.check(
            teishutuStaffInfo,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101005",
            "該当の届出を提出した人の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    return teishutuStaffInfo[0].email;
};
//=============================================
// メールの送信(該当の届出を提出した人)
//=============================================
MainClass1010.prototype.sinseiStaffMail = function(mailMsg) {
    const self = this;
    const mailSent = new Mail("info@", "GAIA（ガイア）");
    const sinseiStaffAdd = self.getStaffEmail();
    if (false === sinseiStaffAdd) {
        return false;
    }
    const flg = mailSent.sent(
        sinseiStaffAdd,
        '',
        "届出についてのお知らせです",
`
${self.nowSinseiName} さんが申請した
${self.nowTaishouDate} 分の ${self.nowTodokedeName} は、\n
${self.staffName} さんによって${mailMsg}\n\n
/////////////////////////////////////////////////////////\n\n
このメールはGAIA（ガイア）より送信されました。返信はできません。
`,
        false
    );
    return flg;
};
//=============================================
// メールの送信(該当の届出の確認者)
//=============================================
MainClass1010.prototype.kakuninStaffMail = function(mailMsg) {
    const self = this;
    const mailSent = new Mail("info@", "GAIA（ガイア）");
    const flg = mailSent.sent(
        self.shoninStaffMail,
        '',
        "届出についてのお知らせです",
`
${self.nowSinseiName} さんが申請した
${self.nowTaishouDate} 分の ${self.nowTodokedeName} は、\n
${self.staffName} さんによって${mailMsg}\n\n
/////////////////////////////////////////////////////////\n\n
このメールはGAIA（ガイア）より送信されました。返信はできません。
`,
    false
    );
    return flg;
};
//=============================================
// メールの送信(システム管理者＝会社の代表メール)
//=============================================
MainClass1010.prototype.kanriStaffMail = function(mailMsg) {
    const self = this;
    const emailAddress = self.compEmail();
    if (false === emailAddress) {
        return false;
    }
    const mailSent = new Mail("info@", "GAIA（ガイア）");
    const flg = mailSent.sent(
        emailAddress,
        '',
        "届出についてのお知らせです",
`
${self.nowSinseiStaff}:${self.nowSinseiName} さんが申請した
${self.nowTaishouDate} 分の ${self.nowTodokedeName} は、\n
${self.staffName} さんによって${mailMsg}\n\n
/////////////////////////////////////////////////////////\n\n
このメールはGAIA（ガイア）より送信されました。返信はできません。
`,
        false
    );
    return flg;
};