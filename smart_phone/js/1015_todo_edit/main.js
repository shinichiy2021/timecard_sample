"use strict";
//****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/22  アラートをフレームワーク統一に変更
// 2017/09/01  絵文字チェック追加
//****************************************************************
MainClass1015.prototype.event = function() {
    const self = this;
    const todoID = self.todoID;
    let arrayStaffID = self.arrayStaffID;
    let g_memberArray = self.g_memberArray;
    const bfMember = self.bfMember;
    // *********************************
    // チェンジイベント
    // *********************************
    // 依頼のチェックボックスが変更された時
    self.ev('change', '#irai', function() {
        sessionStorage.setItem('isChange', 'true');
        self.buttonChange();
        if ($(this).is(':checked')) {
            $(this).val(1);
        } else {
            $(this).val(0);
        }
        let array = '';
        // チェックされていたらメンバーボタンを活性化する
        if ($(this).is(':checked')) {
            self.sel("#memberArea").show();
            if (arrayStaffID == '' && self.g_memberArray.length != 0 && self.newFlag == true) {
                for (let i in self.g_memberArray) {
                    if (i == 0) {
                        array = self.g_memberArray[i].staffID;
                    } else {
                        array = array + "," + self.g_memberArray[i].staffID;
                    }
                }
            }
            if (self.bfMember != '') {
                array = self.bfMember;
            }
            if (self.bfMember != arrayStaffID) {
                array = arrayStaffID;
            }
            if (array != '') {
                sessionStorage.setItem('arrayStaffID', array);
            }
        } else {
            sessionStorage.setItem('arrayStaffID', '');
            self.sel("#memberArea").hide();
            localStorage.removeItem("iraiCheck");
        }
    });
    //****************************************//
    // メンバーボタン押下処理
    //****************************************//
    self.ev('click', '#memberSelect', function() {
        let array = '';
        const newFlag = self.newFlag;
        if (arrayStaffID == "" && g_memberArray.length != 0 && newFlag == true) {
            for (let i in g_memberArray) {
                if (i == 0) {
                    array = g_memberArray[i].staffID;
                } else {
                    array = array + "," + g_memberArray[i].staffID;
                }
            }
        }
        if (bfMember != "") {
            array = bfMember;
        }
        if (bfMember != arrayStaffID) {
            array = arrayStaffID;
        }
        if (array != '') {
            sessionStorage.setItem('arrayStaffID', array);
        }
        // ローカルストレージへ情報をセット
        if (self.session) {
            localStorage.setItem('title', JSON.stringify(self.sel("#title").val()));
            localStorage.setItem('ym1', JSON.stringify(self.sel("#ym1").val()));
            localStorage.setItem('ym2', JSON.stringify(self.sel("#ym2").val()));
            localStorage.setItem('meisai', JSON.stringify(self.sel("#meisai").val()));
            localStorage.setItem('bfMember', JSON.stringify(array));
            localStorage.setItem('iraiCheck', JSON.stringify('1'));
        }
        spaHash('#1019', 'normal');
        return false;
    });
    //****************************************//
    // 更新ボタン押下処理
    //****************************************//
    self.ev('click', '#update', function() {
        if (self.sel("#irai").is(':checked')) {
        } else {
            arrayStaffID = '';
            g_memberArray = null;
        }
        // エラーチェック
        if (self.errorCheck() == false) {
            return false;
        }
        // 確認ダイアログを表示
        const res = confirm("変更内容を更新します。よろしいですか？");
        // 選択結果で分岐
        if (res == false) {
            return false;
        }
        const upDateFlg = self.todoUpDate();
        switch(upDateFlg){
            case false:
            return false;
            case null:
            break;
            default:
                localStorage.setItem('categoryID', self.category);
            break;
        }
        // ローカルストレージの値を削除
        localStorage.removeItem("title");
        localStorage.removeItem("priority");
        localStorage.removeItem("ym1");
        localStorage.removeItem("ym2");
        localStorage.removeItem("meisai");
        localStorage.removeItem("bfMember");
        localStorage.removeItem("category");
        localStorage.removeItem("iraiCheck");
        localStorage.removeItem("sendBook");
        spaHash('#1014', 'reverse');
        return false;
    });
    //****************************************//
    // 削除ボタン押下処理
    //****************************************//
    self.ev('click', '#delete', function() {
        // 確認ダイアログを表示
        const res = confirm("この「やること」を削除します。よろしいですか？");
        // 選択結果で分岐
        if (res == true) {
            if(self.todoDel() == false){
                return false;
            }
            // ローカルストレージの値を削除
            localStorage.removeItem("title");
            localStorage.removeItem("priority");
            localStorage.removeItem("ym1");
            localStorage.removeItem("ym2");
            localStorage.removeItem("meisai");
            localStorage.removeItem("bfMember");
            localStorage.removeItem("category");
            localStorage.removeItem("iraiCheck");
            spaHash('#1013', 'reverse');
            return false;
        }
    });
    self.ev('change', '#title', function() {
        self.buttonChange();
    });
    self.ev('change', '#ym1', function() {
        self.buttonChange();
    });
    self.ev('change', '#ym2', function() {
        self.buttonChange();
    });
    self.ev('change', '#meisai', function() {
        self.buttonChange();
    });
    //****************************************//
    // 戻るボタン押下処理
    //****************************************//
    function back() {
        if (sessionStorage.getItem('isChange') == 'true') {
            if (!confirm(self.backMsg + "よろしいですか？")) {
                return false;
            }
        }
        // ローカルストレージの値を削除
        localStorage.removeItem("title");
        localStorage.removeItem("priority");
        localStorage.removeItem("ym1");
        localStorage.removeItem("ym2");
        localStorage.removeItem("meisai");
        localStorage.removeItem("bfMember");
        localStorage.removeItem("category");
        localStorage.removeItem("iraiCheck");
        localStorage.removeItem("sendBook");
        if (todoID == '') {
            spaHash('#1013', 'reverse');
            return false;
        } else {
            spaHash('#1014', 'reverse');
            return false;
        }
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
};