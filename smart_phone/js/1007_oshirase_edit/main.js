"use strict";
//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//********************************************************************
MainClass1007.prototype.event = function() {
    const self = this;
    // *********************************
    // チェンジイベント
    // *********************************
    // タイトル
    self.ev('keydown', '#subTitle', function() {
        sessionStorage.setItem('isChange', 'true');
        self.buttonChange();
        const new_val = self.sel("#subTitle").val();
        localStorage.setItem("subTitle", JSON.stringify(new_val));
    });
    // 情報区分
    self.ev('change', '#title', function() {
        sessionStorage.setItem('isChange', 'true');
        self.buttonChange();
        const new_val = self.sel("#title").val();
        localStorage.setItem("title", JSON.stringify(new_val));
    });
    // 掲載期限
    self.ev('change', '#ym', function() {
        sessionStorage.setItem('isChange', 'true');
        self.buttonChange();
        const new_val = self.sel("#ym").val();
        localStorage.setItem("ym", JSON.stringify(new_val));
    });
    // 詳細
    self.ev('keydown', '#msgText', function() {
        sessionStorage.setItem('isChange', 'true');
        self.buttonChange();
        const new_val = self.sel("#msgText").val();
        localStorage.setItem("msgText", JSON.stringify(new_val));
    });
    // 登録・更新ボタン押下処理
    self.ev('click', '#new', function() {
        const title = self.sel("#title").val();
        const subTitle = self.sel("#subTitle").val();
        const msgText = self.sel("#msgText").val();
        const errorFlag = self.errorCheck(title, subTitle, msgText);
        if (errorFlag == true) {
            // 登録・更新処理がOKの場合
            if (confirm('お知らせ' + self.confirmMsg) == true) {
                self.eventEntry(title, subTitle, msgText);
            }
        }
    });
    // 削除ボタンが押された時
    self.ev('click', '#delete', function() {
        if (!confirm("対象のデータを削除します。よろしいですか？")) {
            return false;
        }
        self.eventDel();
        // ローカルストレージの値を削除
        localStorage.removeItem("subTitle");
        localStorage.removeItem("title");
        localStorage.removeItem("ym");
        localStorage.removeItem("msgText");
        spaHash('#1006', 'reverse');
    });
    // 戻るボタンが押された時
    function back() {
        if (sessionStorage.getItem('isChange') == 'true') {
            if (!confirm(KAKUNIN)) {
                return false;
            }
        }
        // ローカルストレージの値を削除
        localStorage.removeItem("subTitle");
        localStorage.removeItem("title");
        localStorage.removeItem("ym");
        localStorage.removeItem("msgText");
        spaHash('#1006', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
};