"use strict";
//**********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//**********************************************************************
//****************************************
// 自作セレクターメソッド
//****************************************
MainClass1002.prototype.sel = function(selecter) {
    return $(".view1002 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1002.prototype.ev = function(eventName, selecter, func) {
    $(".view1002").on(eventName, selecter, func);
};
//============================================
// リクエストメール送信処理
//============================================
MainClass1002.prototype.requestMail = function(email) {
    const self = this;
    // メールアドレスエラーチェックとスタッフデータの取得
    let sendFlag = false;
    if (self.checkAddress(email) == true) {
        const staffData = self.getStaff(email);
        if (staffData != null && staffData != false) {
            // メールの本文作成
            const text =
`
GAIA（ガイア）をご利用いただき誠にありがとうございます。
お客様のアプリ登録用情報の申請を受け付けました。
ご利用登録の内容は以下の通りです。\n
ご利用者様 ： ${staffData[0].name} 様
スタッフID ： ${staffData[0].staffID}
ご登録Eメールアドレス ： ${staffData[0].email}
ご登録パスワード ： ${staffData[0].password}\n
アプリ登録用情報
会社アカウント ： ${staffData[0].loginAccount}
アプリ登録用ID ： ${staffData[0].appTourokuID}\n
この情報は、GAIA（ガイア）にログインする時に、個人を特定するための重要な情報になります。
紛失や漏洩に十分ご注意ください。\n
尚、本メールにお心当たりがない場合は、破棄して頂きますようお願い致します。\n
※このメールは配信専用アドレスとなります。
このメールへの返信はご遠慮いただきますようお願い致します。\n
----------------------------------------------------
発信者：GAIA（ガイア）事務局
`;
            // メールの送信(申請者本人)
            const mailflg = self.mailSent.sent(
                staffData[0].email,
                "",
                "ガイア事務局からアプリ登録用情報の送信",
                text,
                false
            );
            if (mailflg == false) {
                sendFlag = false;
            } else {
                // 画面遷移する場合は、アラートのままで画面遷移する前に止めます。
                Materialize.toast('事務局からメールを送信しました。メールに記載されているアプリ登録用情報からログインをお願いします。', 3000);
                sendFlag = true;
            }
        } else {
            sendFlag = staffData;
        }
        return sendFlag;
    } else {
        return null;
    }
};
//============================================
// メールアドレスエラーチェック
//============================================
MainClass1002.prototype.checkAddress = function(email) {
    const self = this;
    // メールアドレス空白チェック
    if (email == "") {
        Materialize.toast('メールアドレスを入力してください。', 3000);
        // テキストボックスを赤枠にする
        self.sel("#mail").addClass('red-error');
        return false;
    } else
        // メールアドレス半角英数字チェック(半角英数字でない時)
        if (!email.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/)) {
            Materialize.toast('メールアドレスはメールアドレス形式で入力してください。(例:info@)', 3000);
            // テキストボックスを赤枠にする
            self.sel("#mail").addClass('red-error');
            return false;
        }
    return true;
};
//============================================
// スタッフ情報の取得
//============================================
MainClass1002.prototype.getStaff = function(email) {
    const self = this;
    const staffData = self.master.read(`
        SELECT
            MK_staff.staffID,
            MK_staff.name,
            MK_staff.email,
            MK_staff.password,
            MK_staff.appTourokuID,
            MK_company.loginAccount
        FROM MK_staff
        INNER JOIN MK_company ON
            MK_staff.companyID=MK_company.companyID
        WHERE
            MK_staff.email=N'${email}'
    `);
    // メールアドレス存在チェック
    self.exception.check(
        staffData,
        ExceptionServerOn,
        function() {
            Materialize.toast('有効なメールアドレスを入力してください。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#email").addClass('red-error');
        },
        "100202",
        "メールアドレス存在チェックに失敗しました。",
        ExceptionParamToLogin,
        self.registerID,
        self.udid
    );
    return staffData;
};