"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
MainClass1006.prototype.event = function() {
    const self = this;
    // 新規ボタンが押された時の処理。
    self.ev('click', '#new', function() {
        spaHash('#1007', 'normal');
        return false;
    });
    // 戻るボタンが押された時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
    // 詳しく見るクリックイベント
    self.ev('click', '.collapsible-header', function() {
        if (self.browsEv($(this).find('.brows')) == false) {
            return false;
        }
    });
    // 未読者ボタンクリックイベント
    self.ev('click', '.midokuButton', function() {
        // 未読者画面へ
        const msgNo = $(this).parents(".event").find(".eventNO").val();
        sessionStorage.setItem('msgID', msgNo);
        spaHash('#1008', 'normal');
        return false;
    });
    // 編集ボタンクリックイベント
    self.ev('click', '.edBut', function() {
        // 編集画面へ
        const msgNo = $(this).parent().find(".eventNO").val();
        sessionStorage.setItem('msgID', msgNo);
        if (self.editEv($(this)) == false) {
            return false;
        }
        spaHash('#1007', 'normal');
        return false;
    });
};