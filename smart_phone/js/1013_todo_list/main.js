"use strict";
//****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/04 yamazaki materialize.cssのフレームワークを適用させました
// 2017/08/23  アラートをフレームワーク統一に変更
// 2017/09/01  絵文字チェック追加
//****************************************************************
MainClass1013.prototype.event = function() {
    const self = this;
    // イベントの初期化
    // 新規TODO追加処理
    self.ev('click', '#new', function() {
        if (self.textInsert() == false) {
            return false;
        }
    });
    // 実行キー押された時
    self.ev('keydown', '#newText', function(e) {
        if (e.keyCode === 13) {
            if (self.textInsert() == false) {
                return false;
            }
        }
    });
    // 完了済み表示と非表示
    self.ev('click', '#switchBtn', function() {
        // 再取得
        if (self.compFlag == false) {
            // 完了済みを開く
            if (self.afterList == null) {
                self.sel('#myCompList').empty();
                Materialize.toast('完了済みは0件です', 3000);
            } else if (self.afterList.length == 0) {
                self.sel('#myCompList').empty();
                Materialize.toast('完了済みは0件です', 3000);
            } else {
                self.compFlag = true;
                self.sel('#myCompList').empty();
                self.aftListDisplay(self.afterList);
                self.sel("#switchBtn").val("完了済みを非表示にする");
            }
        } else {
            self.compFlag = false;
            // 完了済みを閉じる
            self.sel('#myCompList').empty();
            self.sel("#switchBtn").val("完了済みを表示する");
        }
        self.preComplete();
        self.completeFunc();
    });
    ///*************************************
    // 新規作成絞り込み
    //*************************************
    self.ev('click', '#newTodo', function() {
        self.shimeCD = '0';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // お願いされたこと絞り込み
    //*************************************
    self.ev('click', '#todo', function() {
        self.shimeCD = '1';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // お願いしたこと絞り込み
    //*************************************
    self.ev('click', '#request', function() {
        self.shimeCD = '2';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // 自分以外がお願いしたこと絞り込み
    //*************************************
    self.ev('click', '#another', function() {
        self.shimeCD = '3';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // 自分のメモ絞り込み
    //*************************************
    self.ev('click', '#myTodo', function() {
        self.shimeCD = '4';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // 絞り込み解除
    //*************************************
    self.ev('click', '#reset', function() {
        self.shimeCD = '';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // ブックマーク優先表示
    //*************************************
    self.ev('click', '#bookmark', function() {
        self.sortCD = '';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // 期限順表示
    //*************************************
    self.ev('click', '#kigen', function() {
        self.sortCD = '0';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    ///*************************************
    // 五十音順表示
    //*************************************
    self.ev('click', '#goju', function() {
        self.sortCD = '1';
        self.getYarukoto(self.admCD, self.shimeCD, self.sortCD);
    });
    //*************************************
    // ブックマーク On←→Off
    //*************************************
    self.ev('click', '#myTodoList > tr > .bmButton', function() {
        const thisID = $(this).attr("id");
        let checkedList = [];
        // ブックマークの表示・非表示設定
        const tr = self.sel("#myTodoList tr");
        // 全行を取得
        for (let i = 0, l = tr.length; i < l; i++) {
            if (thisID == "bf" + i) {
                checkedList = self.beforList[i];
                if (self.beforList[i].bookMark == "1") {
                    checkedList.bookMark = "0";
                    self.beforList.splice(i, 1);
                    self.beforList.unshift(checkedList);
                } else {
                    checkedList.bookMark = "1";
                    self.beforList[i].bookMark = "1";
                }
            }
        }
        // DB書き換え処理
        const todoSID = checkedList.staffID;
        const todoDS = checkedList.doStaff;
        const todoBM = checkedList.bookMark;
        const todoID = checkedList.todoID;
        // お願いされた事
        if (todoDS == self.staff) {
            if (false === self.exception.check(
                    self.master.edit(
                        "MK_category",
                        "",
                        [ "bookMark" ],
                        [ "'" + todoBM + "'" ],
                        [
                            "companyID = N'" + self.companyID + "'",
                            "todoID = '" + todoID + "'",
                            "staffID = N'" + self.staff + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101307",
                    "ブックマークの処理失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        }
        // お願いした事
        if (todoSID == self.staff) {
            if (false === self.exception.check(
                    self.master.edit(
                        "MK_todo",
                        "",
                        [ "priorityCD" ],
                        [ "'" + todoBM + "'" ],
                        [
                            "companyID = N'" + self.companyID + "'",
                            "todoID = '" + todoID + "'",
                            "staffID = N'" + self.staff + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101308",
                    "ブックマークの処理失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        }
        // 表示の書き換え
        // 新しい配列でテーブルのリスト表示をする。
        if (todoBM == '0') {
            $(this).parents('tr').animate({ "marginTop": "-5vh" }, 200);
            // first jump
            setTimeout(logresult, 500);
            return false;
        } else {
            logresult();
            return false;
        }
    });
    function logresult() {
        self.sel('#myTodoList').empty();
        self.bfListDisplay(self.beforList);
        if (self.compFlag == true) {
            self.sel('#myCompList').empty();
            self.aftListDisplay(self.afterList);
        }
        if (self.afterList.length == 0) {
            self.sel("#switchBtn").hide();
        } else {
            self.sel("#switchBtn").show();
        }
    }
    //*************************************
    // 画面遷移（未完了）
    //*************************************
    self.ev('click', '#myTodoList > tr > .mikanryo', function() {
        const thisID = $(this).attr("id");
        let checkedList = [];
        // ブックマークの表示・非表示設定
        self.sel("#myTodoList tr").each(function(i) {
            if (thisID == "bfStr" + i) {
                checkedList = self.beforList[i];
            }
        });
        const todoSID = checkedList.staffID;
        const todoDS = checkedList.doStaff;
        const todoID = checkedList.todoID;
        let categoryID = "0";
        // お願いされた事
        if (todoDS == self.staff && todoSID != todoDS) {
            categoryID = "1";
            // お願いした事
        } else if (todoSID == self.staff && todoSID != todoDS) {
            categoryID = "0";
            // 自分以外がお願いした事
        } else if (todoSID != self.staff && todoDS == "") {
            categoryID = "0";
            // 自分のメモ
        } else if (todoSID == todoDS) {
            categoryID = "1";
        }
        localStorage.setItem('todoID', todoID);
        localStorage.setItem('categoryID', categoryID);
        spaHash('#1014', 'normal');
        return false;
    });
    //*************************************
    // 画面遷移（完了）
    //*************************************
    self.ev('click', '#myCompList > tr > .kanryo', function() {
        const thisID = $(this).attr("id");
        let checkedList = [];
        // ブックマークの表示・非表示設定
        self.sel("#myCompList tr").each(function(i) {
            if (thisID == "afStr" + i) {
                checkedList = self.afterList[i];
            }
        });
        const todoSID = checkedList.staffID;
        const todoDS = checkedList.doStaff;
        const todoID = checkedList.todoID;
        let categoryID = "0";
        // お願いされた事
        if (todoDS == self.staff && todoSID != todoDS) {
            categoryID = "1";
            // お願いした事
        } else if (todoSID == self.staff && todoSID != todoDS) {
            categoryID = "0";
            // 自分以外がお願いした事
        } else if (todoSID != self.staff && todoDS == "") {
            categoryID = "0";
            // 自分のメモ
        } else if (todoSID == todoDS) {
            categoryID = "1";
        }
        localStorage.setItem('todoID', todoID);
        localStorage.setItem('categoryID', categoryID);
        spaHash('#1014', 'normal');
        return false;
    });
    // 2018/11/27 yamazaki 戻るボタンを追加しました（メニューへ）
    // 戻るボタンが押された時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    self.ev('click', '#back', back);
};