"use strict";
//*********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 初期化クラス
// イベント処理を記述してください
//=========================================
MainClass10012.prototype.event = function() {
    const self = this;
    //============================================
    // 変更処理
    //============================================
    self.ev('keypress', '#loginAccount', function() {
        // テキストボックス枠を通常（黒）にする
        $(this).removeClass('red-error');
    });
    self.ev('keypress', '#newEmail', function() {
        // テキストボックス枠を通常（黒）にする
        $(this).removeClass('red-error');
    });
    //============================================
    // 送信ボタン押下時
    //============================================
    self.ev('click', '#btnSend', function() {
        // 会社アカウントのエラーチェック
        if (self.mainClass10011.commonCheck("会社アカウント", "#loginAccount", self) != true) {
            // 処理を終了する
            return false;
        }
        const newEmail = self.sel("#newEmail").val();
        if (self.mainClass10011.mailErCheck(newEmail, self.sel("#newEmail")) != true) {
            // 処理を終了する
            return false;
        }
        // メールアドレスの存在チェック
        if (self.emailCheckDB(newEmail) == true) {
            if (self.newMailSend(newEmail) == true) {
                Materialize.toast('事務局からメールを送信しました。メールに記載されているURLから新規登録をお願いします。', 3000);
                setTimeout(function() {
                    self.sel("#newEmail").val('');
                    spaHash('#10011', 'normal');
                }, 3000);
            } else {
                Materialize.toast('ネットワークエラーにより、事務局からのメールを送信できませんでした。再度「送信」を押してください。', 3000);
            }
        }
    });
    //============================================
    // hatena1押下時 説明文の表示切替
    //============================================
    self.ev('click', '#hatena1', function() {
        if (self.hatena1 == false) {
            // hatena1が非表示の場合表示にする
            self.hatena1 = true;
            self.sel("#exhatena1").show();
            self.hatena1 = true;
        } else if (self.hatena1 == true) {
            // hatena1が表示の場合非表示にする
            self.sel("#exhatena1").hide();
            self.hatena1 = false;
        }
    });
    //============================================
    // hatena2押下時 説明文の表示切替
    //============================================
    self.ev('click', '#hatena2', function() {
        if (self.hatena2 == false) {
            // hatena2が非表示の場合表示にする
            self.hatena2 = true;
            self.sel("#exhatena2").show();
            self.hatena2 = true;
        } else if (self.hatena2 == true) {
            // hatena2が表示の場合非表示にする
            self.sel("#exhatena2").hide();
            self.hatena2 = false;
        }
    });
    return true;
};