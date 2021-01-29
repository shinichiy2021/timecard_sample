"use strict";
//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//********************************************************************
MainClass1002.prototype.event = function() {
    const self = this;
    // ============================================
    // メールが入力された時
    // ============================================
    self.ev('keypress', '#mail', function() {
        // テキストボックス枠を通常（黒）にする
        self.sel("#mail").removeClass('red-error');
    });
    // ============================================
    // 申請処理
    // ============================================
    self.ev('click', '#entryButton', function() {
        const email = self.sel("#mail").val();
        const request = self.requestMail(email);
        switch (request) {
            case false:
                Materialize.toast('ネットワークエラーにより、弊社事務局からのメールを送信できませんでした。再度「送信」を押してください。', 3000);
                return false;
            case null:
                break;
            default:
                if (self.gamenID == '10011') {
                    setTimeout(function() {
                        spaHash('#10011', 'normal');
                    }, 3000);
                    return false;
                } else {
                    setTimeout(function() {
                        spaHash('#1022', 'normal');
                    }, 3000);
                    return false;
                }
                break;
        }
    });
    // ============================================
    // 戻るボタン押下時
    // ============================================
    self.ev('click', '#back', function() {
        if (self.gamenID == '10011') {
            spaHash('#10011', 'normal');
            return false;
        } else {
            spaHash('#1022', 'normal');
            return false;
        }
    });
};