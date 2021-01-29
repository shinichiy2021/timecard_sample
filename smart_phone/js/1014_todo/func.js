"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*******************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1014.prototype.sel = function(selecter) {
    return $(".view1014 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1014.prototype.ev = function(eventName, selecter, func) {
    $(".view1014").on(eventName, selecter, func);
};
//=========================================
// 関数
// 関数はこのJSファイルに記入してください
// リストの表示関数
//============================================
MainClass1014.prototype.ListDisplay = function(staffID, companyID, strWhere) {
    const self = this;
    self.sel("#listTable").empty();
    self.sel("#bookMark").empty();
    self.sel("#icon").empty();
    let $html = '';
    let wright = true;
    let str = '';
    let name = '';
    const todoID = self.todoID;
    const category = self.category;
    let todoCategory = 0;
    let CT = "MK_category";
    if (category == '1') {
        CT = " (SELECT * FROM MK_category WHERE companyID = N'" + companyID + "' AND staffID = N'" + staffID + "')";
    }
    // 詳細データの取得
    const todoData = self.master.read(
        "SELECT" +
        "    DISTINCT TD.todoID," +
        "    TD.todoTitle," +
        "    TD.todo," +
        "    TD.todoDate," +
        "    TD.keisaiKigen," +
        "    TD.staffID," +
        "    ISNULL(ST.name,'削除されたスタッフ') AS name," +
        "    WK.worker," +
        "    WK.name AS wkName," +
        "    WK.statusCD," +
        "    WK.strStatus," +
        "    WK.startDate," +
        "    WK.endDate," +
        "    WK.finishDate," +
        "    ISNULL(CT.bookMark, '') AS bookMark," +
        "    TD.priorityCD" +
        " FROM MK_todo AS TD" +
        " INNER JOIN " + CT + " AS CT ON" +
        "    TD.todoID = CT.todoID AND" +
        "    TD.companyID = CT.companyID" +
        " LEFT OUTER JOIN MK_staff AS ST ON" +
        "    TD.staffID = ST.staffID AND" +
        "    TD.companyID = ST.companyID" +
        " INNER JOIN" +
        "    (" +
        "    SELECT" +
        "        CT.todoID," +
        "        CT.staffID AS worker," +
        "        ISNULL(ST.name, N'削除されたスタッフ') AS name," +
        "        CT.statusCD," +
        "        (CASE CT.statusCD WHEN 1 THEN '新着' WHEN 2 THEN '変更' WHEN 3 THEN '削除' WHEN 4 THEN '着手前' WHEN 5 THEN '対応中' WHEN 6 THEN '保留' WHEN 7 THEN '確認待ち' WHEN 8 THEN 'もう一度' ELSE '完了' END ) AS strStatus," +
        "        ISNULL(CT.startDate,'') AS startDate," +
        "        ISNULL(CT.endDate,'') AS endDate," +
        "        ISNULL(CT.finishDate,'') AS finishDate" +
        "    FROM MK_category AS CT" +
        "    LEFT OUTER JOIN MK_staff AS ST ON" +
        "        CT.staffID = ST.staffID AND" +
        "        CT.companyID = ST.companyID" +
        "    WHERE" +
        "        CT.companyID = N'" + companyID + "'" +
        "    ) AS WK ON" +
        "    TD.todoID = WK.todoID " +
        strWhere +
        " GROUP BY" +
        "    TD.todoID," +
        "    TD.todoTitle," +
        "    TD.todo," +
        "    TD.todoDate," +
        "    TD.keisaiKigen," +
        "    TD.staffID," +
        "    ST.name," +
        "    TD.priorityCD," +
        "    WK.worker," +
        "    WK.name," +
        "    WK.statusCD," +
        "    WK.strStatus," +
        "    WK.startDate," +
        "    WK.endDate," +
        "    WK.finishDate," +
        "    CT.bookMark" +
        " ORDER BY" +
        "    WK.statusCD," +
        "    finishDate," +
        "    worker ASC"
    );
    if (false === self.exception.check(
            todoData,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101401",
            "やることが取得出来ませんでした。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    const getStaffID = todoData[0].staffID;
    // bookMark    やる人のブックマークフラグ
    let bookMark = "";
    for (let s in todoData) {
        if (staffID == todoData[s].worker) {
            bookMark = todoData[s].bookMark;
        }
    }
    // priorityCD  お願いした人のブックマークフラグ
    let priorityCD = "";
    let statusCD = parseInt(todoData[0].statusCD, 10);
    let strStatus = '';
    // 表示アイコン
    const star = '<i id="star" class="material-icons">star</i>';
    if (category == "0") {
        if (staffID == getStaffID) {
            // 自分がお願いした事
            todoCategory = 1;
            priorityCD = todoData[0].priorityCD;
            self.sel("#icon").append('<img src="../img/toIcon.png" id="toIcon">');
            self.sel("#memo").css("color", "#f28d9f");
            self.sel("#sendBook").val(priorityCD);
            localStorage.setItem('sendBook', priorityCD);
        } else {
            //自分以外がお願いした事
            todoCategory = 2;
            self.sel("#icon").append('<img src="../img/othersIcon.png" id="toIcon">');
            self.sel("#memo").css("color", "yellowgreen");
        }
        if (priorityCD == "0") {
            //優先表示
            self.sel("#bookMark").empty();
            self.sel("#bookMark").append(star);
        } else {
            self.sel("#bookMark").empty();
        }
    } else {
        statusCD = parseInt(todoData[0].statusCD, 10);
        strStatus = todoData[0].strStatus;
        if (bookMark == "0") {
            //優先表示
            self.sel("#bookMark").empty();
            self.sel("#bookMark").append(star);
        } else {
            self.sel("#bookMark").empty();
        }
        if (statusCD == 0 || statusCD == 99) {
            //自分のメモ
            priorityCD = todoData[0].priorityCD;
            if (priorityCD == "0") {
                //優先表示
                self.sel("#bookMark").empty();
                self.sel("#bookMark").append(star);
            } else {
                self.sel("#bookMark").empty();
            }
            todoCategory = 3;
            self.sel("#icon").append('<i id="memo" class="material-icons">format_list_bulleted</i>');
            self.sel("#sendBook").val(priorityCD);
            localStorage.setItem('sendBook', priorityCD);
        } else {
            if (bookMark == "0") {
                //優先表示
                self.sel("#bookMark").empty();
                self.sel("#bookMark").append(star);
            } else {
                self.sel("#bookMark").empty();
            }
            todoCategory = 0;
            self.sel("#icon").append('<img src="../img/doIcon.png" id="doIcon">');
            self.sel("#memo").css("color", "#66C9DC");
        }
    }
    const todoTitle = todoData[0].todoTitle;
    const todo = todoData[0].todo;
    const todoDate = todoData[0].todoDate;
    const keisaiKigen = todoData[0].keisaiKigen;
    const startDate = todoData[0].startDate;
    const oderID = todoData[0].staffID;
    name = todoData[0].name;
    let penButton = "";
    if (staffID == oderID) {
        penButton = "<input type='button' value='編集へ→' id='edit' class='edBut'/>";
    }
    let pTag = "";
    if (statusCD <= 6 || statusCD == 8) {
        pTag = "<p class='memoLeft'>←タップして変更</p>";
    }
    // 2017/09/06  表示内容が取得出来ない項目はラベルも表示しない
    // 期限開始日
    let kaishi = "<p class='label'>開始日</p><p class='hiduke'>" + todoDate + "</p>";
    if (todoDate == "") {
        kaishi = "";
    }
    // 期限終了日
    let kigen = "<p class='label'>終了日</p><p class='hiduke'>" + keisaiKigen + "</p>";
    if (keisaiKigen == "") {
        kigen = "";
    }
    // 詳細
    let shousai = "<p class='todo'>" + todo + "</p>";
    if (todo == "") {
        shousai = "";
    }
    // 着手日
    let todoStart = "<p class='label1'>着手日</p><p class='finish'>" + startDate + "</p>";
    if (startDate == "") {
        todoStart = "";
    }
    // 終了日
    const endDate = todoData[0].endDate;
    let todoEnd = "<p class='label1'>終了日</p><p class ='finish'>" + endDate + "</p>";
    if (endDate == "") {
        todoEnd = "";
    }
    // 完了日
    const finishDate = todoData[0].finishDate;
    let todoFinish = "<p class='label1'>完了日</p><p class ='finish'>" + finishDate + "</p>";
    let kanryou = "<p class='label'>完了日</p>";
    if (finishDate == "") {
        todoFinish = "";
        kanryou = "";
    }
    $html = '';
    if (todoCategory == 0) {
        // お願いされたことの一覧
        $html = "<div class='row event'>" +
            "<div class='col s12 m6'>" +
            "<div class='card blue-grey.lighten-5'>" +
            "<div class='card-content black-text'>" +
            "<section>" + "<p class='myStatus' id='status'>" + strStatus + "</p>" +
            pTag +
            "<input class='strCD' type='hidden' value=" + statusCD + ">" +
            "<input class='todoID' type='hidden' value=" + todoID + ">" +
            "<h1 id=" + todoID + ">" + todoTitle + "</h1>" +
            "</section>" +
            kaishi +
            kigen +
            "<input class='oder' type='hidden' value=" + oderID + " id='oder'>" +
            "<p class='label'>お願いした人</p>" + "<p class='staffName'>" + name + "</p>" +
            shousai + todoStart +
            todoEnd +
            todoFinish +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
        self.sel("#listTable").append($html);
        // 自分のステイタスが新着、変更の時、着手前に更新。ヒストリーテーブルのフラグを既読にする
        let editFlg = "";
        if (statusCD == 1 || statusCD == 2 || statusCD == 8) {
            editFlg = self.master.edit(
                "MK_category",
                "",
                ["statusCD"],
                ["'4'"],
                [
                    "todoID ='" + todoID + "'",
                    "staffID = N'" + staffID + "'",
                    "companyID = N'" + companyID + "'"
                ]
            );
            if (false === self.exception.check(
                    editFlg,
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101402",
                    "カテゴリーエラー : 取得出来ませんでした。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            self.sel('#status').html("着手前");
            self.sel(".strCD").val(4);
            self.sel('#status').css('background-color', '#ff007f');
            editFlg = self.master.edit(
                "MK_history",
                "", ["flag"], ["'1'"], [
                    "externNo ='" + todoID + "'",
                    "staffID = N'" + staffID + "'",
                    "companyID = N'" + companyID + "'"
                ]
            );
            if (false === self.exception.check(
                    editFlg,
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101403",
                    "ヒストリーエラー : 取得出来ませんでした。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        }
    } else if (todoCategory == 1 || todoCategory == 2) {
        // お願いしたことの一覧
        if (statusCD != 9) {
            pTag = "<p class='memoRight'>タップして変更↓</p>";
        } else {
            pTag = "";
        }
        $html = "<div class='row event'>" +
            "<div class='col s12 m6'>" +
            "<div class='card blue-grey.lighten-5'>" +
            "<div class='card-content black-text'>" +
            "<section>" +
            "<h1 id=" + todoID + ">" + todoTitle + "</h1>" +
            "</section>" +
            kaishi +
            kigen +
            "<p class='label'>やる人</p>" +
            pTag +
            "<p class='workerName' id ='woker" + todoID + "'></p>" +
            shousai + todoFinish +
            "<input class='oder' type='hidden' value=" + oderID + " id='oder'>" +
            "<p class='label'>お願いした人</p>" + "<p class='staffName'>" + name + "</p>" +
            penButton + "<input class='eventNO' type='hidden' value=" + todoID + ">" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
        self.sel("#listTable").append($html);
    } else {
        // 自分のメモ
        $html = "<div class='row event'>" +
            "<div class='col s12 m6'>" +
            "<div class='card blue-grey.lighten-5'>" +
            "<div class='card-content black-text'>" +
            "<section>" +
            "<h1 id=" + todoID + ">" + todoTitle + "</h1>" +
            "</section>" +
            kaishi +
            kigen +
            shousai +
            kanryou +
            penButton + "<p class ='finish' id ='finish" + todoID + "'>" + finishDate + "</p>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
        self.sel("#listTable").append($html);
    }
    if (finishDate == "") {
        self.sel("#finish" + todoID).hide();
    }
    switch (statusCD) {
        case 1:
            self.sel('#status').css('background-color', '#FCC800');
            break;
        case 2:
            self.sel('#status').css('background-color', '#FCC800');
            break;
        case 3:
            self.sel('#status').css('background-color', '#FCC800');
            break;
        case 4:
            self.sel('#status').css('background-color', '#ff007f');
            break;
        case 5:
            self.sel('#status').css('background-color', '#00ff7f');
            break;
        case 6:
            self.sel('#status').css('background-color', '#c0a2c7');
            break;
        case 7:
            self.sel('#status').css('background-color', '#20B2CC');
            // self.sel('#status').css('border', '0');
            break;
        case 8:
            self.sel('#status').css('background-color', '#ff007f');
            break;
        case 9:
            self.sel('#status').css('background-color', '#c0c0c0');
            break;
    }
    wright = true;
    if (category == "0") {
        for (let s = 0; s <= todoData.length - 1; s++) {
            const todoNo = todoData[s].todoID;
            const workerID = todoData[s].worker;
            let workerName = todoData[s].wkName;
            const wokerStatus = todoData[s].strStatus;
            const wokerStatusCD = parseInt(todoData[s].statusCD, 10);
            // やる人を省略形にします
            if (workerName.length > 10) {
                workerName = workerName.substr(0, 10) + "...";
            }
            // 2017/08/25 muruata やる人のダブりを除く
            if (s > 0) {
                if (workerID == todoData[s - 1].worker) {
                    wright = false;
                } else {
                    wright = true;
                }
            }
            if (wright == true) {
                // お願いしたことの時はやる人のステイタスも書き出す
                str =
                    "<input class='todoID' type='hidden' value=" + todoNo + ">" +
                    "<p class='workStaffName'>" + workerName + "</p>" +
                    "<p class='status' id='status" + todoNo + workerID + "'>" + wokerStatus + "</p>" +
                    "<input class='workerID' type='hidden' value=" + workerID + " id='workStaff" + s + "'>" +
                    "<input class='wokerStatusCD' type='hidden' value=" + wokerStatusCD + " id='stCD" + workerID + s + "'>" +
                    "<br>";
                self.sel("#woker" + todoNo).append(str);
            }
            switch (wokerStatusCD) {
                case 1:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#FCC800');
                    break;
                case 2:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#FCC800');
                    break;
                case 3:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#FCC800');
                    break;
                case 4:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#ff007f');
                    break;
                case 5:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#00ff7f');
                    break;
                case 6:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#c0a2c7');
                    break;
                case 7:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#20B2CC');
                    break;
                case 8:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#ff007f');
                    break;
                case 9:
                    self.sel("#status" + todoNo + workerID).css('background-color', '#c0c0c0');
                    break;
            }
        }
    }
};