//=========================================
// メールクラス
// メール送信に関する命令をまとめる
// address : 送る側のアドレス
// name    : 送る側の名前
//=========================================
class Mail {
    constructor(fromAddress, fromName) {
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }
    //=========================================
    // クラスメソッド
    // メールを送信する
    // address : 送り先アドレス
    // name    : 送り先の名前
    // subject : 件 名
    // body    : 本 文
    // successMessage : 送信成功時のメッセージ
    //=========================================
    sent(sentAddress, sentName, subject, body, successMessage) {
        let retFlg = true;
        $.ajax({
            type: "POST",
            async: false,
            cache: false,
            url: "../../common/php/mail_sent.php",
            data: {
                fromAddress: this.fromAddress,
                fromName: this.fromName,
                sentAddress: sentAddress,
                sentName: sentName,
                subject: subject,
                body: body
            },
            dataType: "html",
            // 成功時の処理
            success: function (data) {
                if (successMessage != false) {
                    alert(successMessage);
                }
            },
            // エラー処理
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                retFlg = false;
            }
        });
        return retFlg;
    }
}