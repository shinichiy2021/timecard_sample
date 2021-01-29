"use strict";
//**************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//**************************************************************
// 自作セレクターメソッド
//****************************************
MainClass10012.prototype.sel = function (selecter) {
    return $(".view10012 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass10012.prototype.ev = function (eventName, selecter, func) {
    $(".view10012").on(eventName, selecter, func);
};
//=========================================
// メールアドレスの存在チェック
//=========================================
MainClass10012.prototype.emailCheckDB = function (newEmail) {
    const self = this;
    // ログインアカウントからDB接続情報を取得する
    const infoConnectionDB = self.database.getProcedures(
        'ver_2_5_Release01', [
        self.sel("#loginAccount").val()
    ],
        false,
        'gaia_kanri',
        'gaia_kanri'
    );
    // 例外処理
    if (false == self.exception.check(
        infoConnectionDB,
        ExceptionServerOn,          // サーバーエラーの時
        function () {
            // 会社情報の取得ができなかった場合
            Materialize.toast('会社アカウントが有効ではありません。', 3000);
            self.sel("#loginAccount").addClass('red-error');
        },
        "100100",
        "DB接続情報を取得に失敗しました。管理者にお問い合わせください",
        ExceptionParamToLogin,
        self.registerID,
        self.udid
    )) {
        // システムエラーの時、処理を終了する
        return false;
    }
    // 取得した値を保存する
    self.accountName = infoConnectionDB[0].accountName;
    self.userName = infoConnectionDB[0].userName;
    // メールアドレスの存在チェック
    const mailData = self.database.getProcedures(
        'ver_2_5_GetEmail', [
        newEmail
    ],
        false,
        self.accountName,
        self.userName
    );
    if (true == self.exception.check(
        mailData,
        ExceptionServerOn,        // サーバーエラーの時
        ExceptionServerOff,
        "100106",
        "メールアドレスの存在チェックに失敗しました。",
        ExceptionParamToLogin,
        self.registerID,
        self.udid
    )) {
        // ログイン情報の取得ができなかった場合 
        Materialize.toast('既に登録済みのメールアドレスです。登録情報を忘れた場合は、管理者にお問合せください。', 3000);
        self.sel("#newEmail").addClass('red-error');
        return false;
    }
    return true;
};
//=========================================
// 新規登録のメール送信処理
//=========================================
MainClass10012.prototype.newMailSend = function (newEmail) {
    const self = this;
    // メールクラスの初期化
    const mailSent = new Mail("info@", "GAIA（ガイア）");
    const entryUrl =
        '?registerID=' + self.registerID +
        '&email=' + newEmail +
        '&udid=' + self.udid +
        '&accountName=' + self.accountName +
        '&userName=' + self.userName;
    // メールの本文作成
    self.sel("#mailSent").append(`
<div class='body' hidden>
この度はGAIA（ガイア）の新規ご利用登録のお申し込みを頂き、ありがとうございます。
以下のURLをクリック（タップ）して、新規登録画面にお進みください。
${GAIA_URL_VERSION}smart_phone/view/1003_entry.html${entryUrl}\n
このメールに心当たりが無い方は、お手数ですが、このメールは破棄してください。\n
------------------------------------------------------
レクセント株式会社
GAIA（ガイア）\n
尚、当メールは送信専用となっております。
このメールへの返信はご遠慮いただきますようお願い致します。
</div>
`);
    let text = self.sel(".body").html();
    text = text.replace(/&amp;/g, "&");
    // メールの送信
    const mailflg = mailSent.sent(
        newEmail,
        "＜＜自動返信メール＞＞",
        "ガイア事務局から新規利用登録の受付",
        text,
        false
    );
    if (mailflg == false) {
        return false;
    }
    return true;
};