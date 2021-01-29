"use strict";
//************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1013.prototype.sel = function(selecter) {
    return $(".view1013 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1013.prototype.ev = function(eventName, selecter, func) {
    $(".view1013").on(eventName, selecter, func);
};
//=========================================
// バイト数文字列切り出し関数
// text：対象文字列
// len：有効バイト数
// truncation：末尾文字列
//=========================================
MainClass1013.prototype.byteSubstr = function(text, len, truncation) {
    const self = this;
    if (truncation === undefined) { truncation = ''; }
    const text_array = text.split('');
    let count = 0;
    let str = '';
    for (let i = 0; i < text_array.length; i++) {
        const n = encodeURIComponent(text_array[i]);
        if (n.length < 4) {
            count++;
        } else {
            count += 2;
        }
        if (count > len) {
            return str + truncation;
        }
        str += text.charAt(i);
    }
    return text;
};
//*************************************
// DBデータ取得
// pAdmCD:管理者コード
// pShi:絞り込み
// pSort:ソート
//*************************************
MainClass1013.prototype.getYarukoto = function (
    pAdmCD,
    pShi,
    pSort
) {
    const self = this;
    let dbGetList = "";
    let where = "";
    let sort = "";
    if (pShi == "" || pShi == "0") {
        // 絞り込み条件が無い、または新規作成の場合
        switch (pAdmCD) {
            // 全権限者
            case "0":
                where = " WHERE   (MK_todo.companyID = N'" + self.companyID + "') ";
                break;
                // 管理者
            case "1":
                where = " WHERE   (MK_todo.companyID = N'" + self.companyID + "') AND (MK_todo.staffID = N'" + self.staff + "' OR MK_category.staffID = N'" + self.staff + "') ";
                break;
                // 一般
            case "2":
                where = " WHERE   (MK_todo.companyID = N'" + self.companyID + "') AND (MK_category.staffID = N'" + self.staff + "') ";
                break;
            default:
                return false
        }
        //新規作成の絞り込み条件
        if (pShi == "0") {
            where += " AND (CS.staffID  IS NOT NULL AND CT.myStatus = '1' ) ";
        }
    } else {
        switch (pShi) {
            // お願いされた事
            case "1":
                where = "WHERE   (MK_todo.companyID = N'" + self.companyID + "') AND (CS.staffID = N'" + self.staff + "' AND MK_todo.staffID <> CS.staffID)";
                break;
                // お願いした事
            case "2":
                where = "WHERE   (MK_todo.companyID = N'" + self.companyID + "') AND (MK_todo.staffID = N'" + self.staff + "' AND CS.staffID IS NULL)";
                break;
                // 自分以外がお願いした事
            case "3":
                where = "WHERE   (MK_todo.companyID = N'" + self.companyID + "') AND (MK_todo.staffID <> N'" + self.staff + "' AND CS.staffID IS NULL)";
                break;
                // 自分のメモ
            case "4":
                where = "WHERE   (MK_todo.companyID = N'" + self.companyID + "') AND (MK_todo.staffID = N'" + self.staff + "' AND CS.staffID = N'" + self.staff + "')";
                break;
        }
    }
    switch (pSort) {
        // 初期表示時（又は優先度順）
        case "":
            sort = " ORDER BY bookMark, orderNo, keisaiKigen, todoTitle ASC ";
            break;
            // 期限日付順
        case "0":
            sort = " ORDER BY keisaiKigen ASC ";
            break;
            // 50音順
        case "1":
            sort = " ORDER BY todoTitle ASC ";
            break;
    }
    dbGetList = self.master.read(
        " SELECT" +
        "    MK_todo.todoID, ISNULL(CS.bookMark, MK_todo.priorityCD) AS bookMark, MK_todo.todoTitle, MK_todo.staffID, MK_todo.keisaiKigen, " +
        "    CT.statusCD,ISNULL(CS.staffID, '') AS doStaff ,ISNULL(CT.myStatus,'') AS myStatus,COUNT(MK_category.staffID) AS doCount, " +
        "    (CASE WHEN (CS.staffID = N'" + self.staff + "' AND CT.statusCD = '1') THEN '0'" +
        "    WHEN MK_todo.staffID = N'" + self.staff + "' THEN '1' WHEN  CS.staffID = N'" + self.staff + "' THEN '1' ELSE '2' END ) AS orderNo" +
        " FROM" +
        "    MK_todo LEFT OUTER JOIN " +
        "      (SELECT MK_category.todoID, MIN(MK_category.statusCD) AS statusCD, myCT.statusCD AS myStatus " +
        "       FROM MK_category LEFT OUTER JOIN " +
        "      (SELECT todoID, statusCD FROM MK_category WHERE  (companyID = N'" + self.companyID + "') AND (staffID = N'" + self.staff + "')) AS myCT ON " +
        "       MK_category.todoID = myCT.todoID " +
        "       WHERE (MK_category.companyID = N'" + self.companyID + "') " +
        "       GROUP BY MK_category.todoID, myCT.statusCD) AS CT ON MK_todo.todoID = CT.todoID  LEFT OUTER JOIN " +
        "      (SELECT todoID, staffID, ISNULL(bookMark,'1') AS bookMark  FROM MK_category WHERE staffID = N'" + self.staff + "' AND companyID = N'" + self.companyID + "') AS CS " +
        "    ON MK_todo.todoID = CS.todoID LEFT OUTER JOIN " +
        "    MK_category ON MK_todo.todoID = MK_category.todoID  AND MK_category.companyID = MK_todo.companyID " +
        where +
        " GROUP BY" +
        "    MK_todo.todoID, MK_todo.priorityCD, MK_todo.todoTitle,MK_todo.staffID, MK_todo.keisaiKigen, CT.statusCD,CS.staffID, CS.bookMark ,CT.myStatus " +
        sort
    );
    self.beforList = [];
    self.afterList = [];
    const noTodoList = [];
    switch (self.exception.check(
        dbGetList,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101301",
        "やることリストの取得に失敗しました。",
        ExceptionParamToMenu
    )) {
        case false:
            return false;
        case null:
            // データが取得できない時は、何も出力しない
            self.sel('#myTodoList').empty();
            self.sel('#myCompList').empty();
            self.sel("#switchBtn").hide();
            return false;
    }
    for (let i in dbGetList) {
        if (dbGetList[i].doCount == "0") {
            noTodoList.push(dbGetList[i].todoID);
        } else {
            // 使用ステータス判定
            let statusCD = "";
            if (dbGetList[i].doStaff != "") {
                statusCD = dbGetList[i].myStatus;
            } else {
                statusCD = dbGetList[i].statusCD;
            }
            // 未完・完了判定
            if (statusCD != "9" && statusCD != "99") {
                //新着(myStatus==1)の物が有ったら、配列の先頭に入れる。
                if (dbGetList[i].myStatus == "1") {
                    self.beforList.unshift(dbGetList[i]);
                } else {
                    self.beforList.push(dbGetList[i]);
                }
            } else {
                self.afterList.push(dbGetList[i]);
            }
        }
    }
    if (noTodoList != null) {
        for (let s in noTodoList) {
            self.master.del(
                "MK_todo",
                "", [ "todoID = N'" + noTodoList[s] + "'", "companyID = N'" + self.companyID + "'" ]
            );
        }
    }
    //****************************************//
    // リストの表示
    //****************************************//
    if (self.beforList == null) {
        self.sel('#myTodoList').empty();
    } else if (self.beforList.length == 0) {
        self.sel('#myTodoList').empty();
    } else {
        self.sel('#myTodoList').empty();
        self.bfListDisplay(self.beforList);
    }
    //完了済みデータが存在しない時は、完了済みボタンを非表示にする
    if (self.afterList == null) {
        // 非表示処理
        self.sel("#switchBtn").hide();
        self.sel('#myCompList').empty();
        self.compFlag = false;
        self.aftListDisplay(self.afterList);
    } else if (self.afterList.length == 0) {
        // 非表示処理
        self.sel("#switchBtn").hide();
        self.sel('#myCompList').empty();
        self.compFlag = false;
        self.aftListDisplay(self.afterList);
    } else {
        // 表示処理
        self.sel("#switchBtn").show();
        // 完了フラグとの同期
        if (self.compFlag == true) {
            self.sel('#myCompList').empty();
            self.aftListDisplay(self.afterList);
        }
    }
};
//*************************************
// 完了リストの表示
//*************************************
MainClass1013.prototype.aftListDisplay = function(afterList) {
    const self = this;
    if (afterList.length == 0) {
        self.compFlag = false;
        // 完了済みを閉じる
        self.sel('#myCompList').empty();
        self.sel("#switchBtn").val("完了済みを表示する");
        self.preComplete();
        self.completeFunc();
        return false;
    }
    for (let j = 0; j < afterList.length; j++) {
        let afTodo = afterList[j].todoTitle;
        const todoBM = afterList[j].bookMark;
        let todoSCD = afterList[j].statusCD;
        const todoSID = afterList[j].staffID;
        const todoDS = afterList[j].doStaff;
        const todoMSCD = afterList[j].myStatus;
        let strBookMark = '';
        let StrCheck = '';
        let flagList = true;
        // バイト数にて不要部分を削除
        afTodo = self.byteSubstr(afTodo, 24, "...");
        // ステータス判定
        if (todoDS != "") {
            todoSCD = todoMSCD;
        }
        // 行追加の可否
        if (todoSID != self.staff && todoDS == '' && todoSCD == 99) {
            flagList = false;
        }
        // 新規作成
        if (todoSCD == "1" && todoDS == self.staff) {
            StrCheck = "<td class='mIcon'>" +
                "<label id='newIcon' class='material-icons'>fiber_new</label>" +
                "</td>";
            // お願いされた事
        } else if (todoDS == self.staff && todoSID != todoDS) {
            StrCheck = "<td class='mIcon'>" +
                "<img src='../img/doIcon.png' id='toIcon'>" +
                "</td>";
            // お願いした事
        } else if (todoSID == self.staff && todoSID != todoDS) {
            StrCheck = "<td class='mIcon'>" +
                "<img src='../img/toIcon.png' id='fromIcon'>" +
                "</td>";
            // 自分以外がお願いした事
        } else if (todoSID != self.staff && todoDS == "" && todoSCD != 99) {
            StrCheck = "<td class='mIcon'>" +
                "<img src='../img/othersIcon.png' id='anotherIcon'>" +
                "</td>";
            // 自分のメモ
        } else if (todoSID == todoDS) {
            StrCheck = "<td class='check' id='afthch" + [j] + "'>" +
                "<input type='checkbox' id='afCheck" + [j] + "' checked='checked'>" +
                "<label for='afCheck" + [j] + "'></label>" +
                "</td>";
        }
        // ブックマーク表示処理
        // 自分以外がお願いした事はブックマーク無し
        if (todoSID != self.staff && todoDS == "") {
            strBookMark = "";
            // ステータスコードが1～9の場合
        } else if (todoSCD >= 1 && todoSCD <= 9) {
            // ブックマークしない
            if (todoBM == "1") {
                strBookMark = "<p id='bookMarkOffButton' class='material-icons'>star_border</p>";
                // ブックマークする
            } else {
                strBookMark = "<p id='bookMarkOnButton' class='material-icons'>star</p>";
            }
        } else if (todoSID == todoDS || todoSCD == 0) {
            // ブックマークしない
            if (todoBM == "1") {
                strBookMark = "<p id='bookMarkOffButton' class='material-icons'>star_border</p>";
                // ブックマークする
            } else {
                strBookMark = "<p id='bookMarkOnButton' class='material-icons'>star</p>";
            }
        }
        // 行出力判定true:表示true 非表示:false
        if (flagList == true) {
            $("<tr>" +
                StrCheck +
                "<td class='kanryo' id='afStr" + [j] + "'>" +
                "<p class='after listData'>" + afTodo + "</p>" +
                "</td>" +
                "<td class='bmButton' id='af" + [j] + "'>" +
                strBookMark +
                "</td>" +
                "</tr>").appendTo("#myCompList").css({ opacity: 0.5 }).animate({ opacity: 1 }, 750);
            self.sel(".after").css({
                'text-decoration': 'line-through'
            });
        } else {
            // 行追加不許可処理
            $("<tr></tr>").appendTo("#myCompList").css({ 'display': 'none' });
        }
    }
    self.preComplete();
    self.completeFunc();
};
//*************************************
// 未完了リストの表示
//*************************************
MainClass1013.prototype.bfListDisplay = function(beforList) {
    const self = this;
    for (let j = 0; j < beforList.length; j++) {
        let todo = beforList[j].todoTitle;
        const todoBM = beforList[j].bookMark;
        let todoSCD = beforList[j].statusCD;
        const todoSID = beforList[j].staffID;
        const todoDS = beforList[j].doStaff;
        const todoKK = beforList[j].keisaiKigen;
        const todoMSCD = beforList[j].myStatus;
        let strBookMark = "";
        let StrCheck = "";
        let StrKeisai = "";
        let flagList = true;
        let keisaiDate = "";
        let todayDate = "";
        let dispDate = "";
        let tomorrow = "";
        let yesterday = "";
        if (todoKK != "") {
            keisaiDate = new Date(todoKK);
            todayDate = new Date(self.today);
            tomorrow = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1);
            tomorrow = tomorrow.getFullYear() + "/" + addZero(tomorrow.getMonth() + 1) + "/" + addZero(tomorrow.getDate());
            yesterday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1);
            yesterday = yesterday.getFullYear() + "/" + addZero(yesterday.getMonth() + 1) + "/" + addZero(yesterday.getDate());
            // 2017/09/06 修正：本日の比較が同一判定されていなかった
            if (todoKK == self.today) {
                dispDate = "今日";
            } else if (todoKK == tomorrow) {
                dispDate = "明日";
            } else if (todoKK == yesterday) {
                dispDate = "昨日";
            } else {
                dispDate += keisaiDate.getMonth() + 1;
                dispDate += "月";
                dispDate += keisaiDate.getDate();
                dispDate += "日";
                switch (keisaiDate.getDay()) {
                    case 0:
                        dispDate += "(日)";
                        break;
                    case 1:
                        dispDate += "(月)";
                        break;
                    case 2:
                        dispDate += "(火)";
                        break;
                    case 3:
                        dispDate += "(水)";
                        break;
                    case 4:
                        dispDate += "(木)";
                        break;
                    case 5:
                        dispDate += "(金)";
                        break;
                    case 6:
                        dispDate += "(土)";
                        break;
                }
            }
        }
        // バイト数にて不要部分を削除
        todo = self.byteSubstr(todo, 24, "...");
        // ステータス判定
        if (todoDS != "") {
            todoSCD = todoMSCD;
        }
        // 行追加の可否
        if (todoSID != self.staff && todoDS == "" && todoSCD == 0) {
            flagList = false;
        }
        // 新規作成
        if (todoSCD == "1" && todoDS == self.staff) {
            StrCheck = "<td class='mIcon'>" +
                "<label id='newTodoIcon' class='material-icons'>fiber_new</label>" +
                "</td>";
            // お願いされた事
        } else if (todoDS == self.staff && todoSID != todoDS) {
            StrCheck = "<td class='mIcon'>" +
                "<img src='../img/doIcon.png' id='toIcon'>" +
                "</td>";
            // お願いした事
        } else if (todoSID == self.staff && todoSID != todoDS) {
            StrCheck = "<td class='mIcon'>" +
                "<img src='../img/toIcon.png' id='fromIcon'>" +
                "</td>";
            // 自分以外がお願いした事
        } else if (todoSID != self.staff && todoDS == "" && todoSCD != 0) {
            StrCheck = "<td class='mIcon'>" +
                "<img src='../img/othersIcon.png' id='fromIcon'>" +
                "</td>";
            // 自分のメモ
        } else if (todoSID == todoDS) {
            StrCheck = "<td class='check' id='thch" + [j] + "'>" +
                "<input type='checkbox' id='check" + [j] + "'>" +
                "<label for='check" + [j] + "'></label>" +
                "</td>";
        }
        // ブックマーク表示処理
        // 自分以外がお願いした事はブックマーク無し
        if (todoSID != self.staff && todoDS == "") {
            strBookMark = "";
            // ステータスコードが1～9の場合
        } else if (todoSCD >= 1 && todoSCD <= 9) {
            // ブックマークしない
            if (todoBM == "1") {
                strBookMark = "<p id='bookMarkOffButton' class='material-icons'>star_border</p>";
                // ブックマークする
            } else {
                strBookMark = "<p id='bookMarkOnButton' class='material-icons'>star</p>";
            }
        } else if (todoSID == todoDS || todoSCD == 0) {
            // ブックマークしない
            if (todoBM == "1") {
                strBookMark = "<p id='bookMarkOffButton' class='material-icons'>star_border</p>";
                // ブックマークする
            } else {
                strBookMark = "<p id='bookMarkOnButton' class='material-icons'>star</p>";
            }
        }
        // 掲載期限情報
        if (todoKK != "") {
            if (new Date(todoKK) > new Date(self.today)) {
                StrKeisai = "<p class='listData Kigen'>" + dispDate + "</p>";
            } else {
                StrKeisai = "<p class='listData kigenGire'>" + dispDate + "</p>";
            }
        }
        // 行出力判定true:表示true 非表示:false
        if (flagList == true) {
            $("<tr>" +
                StrCheck +
                "<td class='mikanryo' id='bfStr" + [j] + "'>" +
                "<p class='listData'>" + todo + "</p>" +
                StrKeisai +
                "</td>" +
                "<td class='bmButton' id='bf" + [j] + "'>" +
                strBookMark +
                "</td>" +
                "</tr>").appendTo("#myTodoList").css({ opacity: 0.5 }).animate({ opacity: 1 }, 750);
        } else {
            // 行追加不許可処理
            $("<tr></tr>").appendTo("#myTodoList").css({ 'display': 'none' });
        }
    }
    self.preComplete();
    self.completeFunc();
};
//*************************************
// 新規テキスト追加処理
//*************************************
MainClass1013.prototype.textInsert = function() {
    const self = this;
    // 入力チェック
    if (self.sel("#newText").val().trim() == "") {
        Materialize.toast('やることを入力してください。', 3000);
        return false;
        // 文字数チェック
    } else if (self.sel("#newText").val().length > 255) {
        Materialize.toast('やることは255文字以内で入力してください。', 3000);
        return false;
    }
    // 2017/09/01  絵文字チェック追加
    // タイトルに絵文字が含まれている場合。
    if (self.sel("#newText").val().match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('使用できない絵文字が含まれています。', 3000);
        return false;
    }
    // 新しい番号の取得
    const getNewID = self.master.read(
        "SELECT" +
        "    ISNULL(MAX(todoID)+1,0) AS newID" +
        " FROM MK_todo" +
        " WHERE" +
        "    companyID=N'" + self.companyID + "'",
        null,
        null
    );
    let todoMax = 0;
    switch (self.exception.check(
        getNewID,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101302",
        "新しい番号の取得に失敗しました。",
        ExceptionParamToMenu
    )) {
        case false:
            return false;
        case null:
            todoMax = 0;
            break;
        case true:
            todoMax = getNewID[0].newID;
            break;
    }
    // 取得できているか判定
    // やることリストマスタに追加
    if (false === self.exception.check(
            self.master.entry(
                "MK_todo",
                false, [
                    "todoID",
                    "todoDate",
                    "todoTitle",
                    "todo",
                    "keisaiKigen",
                    "companyID",
                    "staffID",
                    "priorityCD"
                ], [
                    "'" + todoMax + "'",
                    "N''",
                    "N'" + self.sel("#newText").val() + "'",
                    "N''",
                    "N''",
                    "N'" + self.companyID + "'",
                    "N'" + self.staff + "'",
                    "'1'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101303",
            "新規リスト追加に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 個人設定マスタに追加
    if (false === self.exception.check(
            self.master.entry(
                "MK_category",
                false, [
                    "todoID",
                    "staffID",
                    "statusCD",
                    "companyID",
                    "bookMark"
                ], [
                    "'" + todoMax + "'",
                    "N'" + self.staff + "'",
                    "'0'",
                    "N'" + self.companyID + "'",
                    "'1'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101304",
            "新規リスト追加に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    const beforData = [];
    beforData.todoID = todoMax;
    beforData.bookMark = "1";
    beforData.todoTitle = self.sel("#newText").val();
    beforData.staffID = self.staff;
    beforData.keisaiKigen = "";
    beforData.statusCD = "0";
    beforData.doStaff = self.staff;
    // 新しいデータをリストに追加
    self.beforList.unshift(beforData);
    // 新しい配列でテーブルのリスト表示をする。
    self.sel('#myTodoList').empty();
    self.bfListDisplay(self.beforList);
    self.preComplete();
    self.completeFunc();
    self.sel("#newText").val("");
    self.sel("#newText").blur();
};
//*************************************
//未完了⇒完了
//*************************************
MainClass1013.prototype.completeFunc = function() {
    const self = this;
    self.sel("#myTodoList >  tr > .check").change(function() {
        if ($(this).is(':checked')) {
            $(this).val(1);
        } else {
            $(this).val(0);
        }
        let checkedStr;
        let checkedList = [];
        // チェックの入った明細を未完了の配列から削除
        self.sel("#myTodoList tr").each(function(i) {
            // チェックされているか判定
            if (self.sel("#check" + i).prop('checked') == true) {
                checkedStr = self.sel("#bfStr" + i).text();
                // 完了になるデータを取得・未完完了データから削除
                checkedList = self.beforList[i];
                self.beforList.splice(i, 1);
            }
        });
        // チェックの入った明細を完了の配列の先頭に追加
        if (checkedList.length != 0) {
            // 未完データを完了に変更
            if (false === self.exception.check(
                    self.master.edit(
                        "MK_category",
                        false, [
                            "statusCD",
                            "finishDate"
                        ], [
                            "'99'",
                            "N'" + self.today + "'"
                        ], [
                            "companyID = N'" + self.companyID + "'",
                            "todoID = '" + checkedList.todoID + "'",
                            "staffID = N'" + self.staff + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101305",
                    "完了処理に失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            // 先頭に完了データを追加する
            self.afterList.unshift(checkedList);
        }
        // 表示の書き換え
        // 新しい配列でテーブルのリスト表示をする。
        self.sel('#myTodoList').empty();
        self.bfListDisplay(self.beforList);
        if (self.compFlag == true) {
            self.sel('#myCompList').empty();
            self.aftListDisplay(self.afterList);
        }
        // 完了表示・非表示変更
        if (self.afterList.length == 0) {
            self.sel("#switchBtn").hide();
        } else {
            self.sel("#switchBtn").show();
        }
    });
};
//*************************************
// 完了⇒未完了
//*************************************
MainClass1013.prototype.preComplete = function() {
    const self = this;
    self.sel("#myCompList > tr > .check").change(function() {
        if ($(this).is(':checked')) {
            $(this).val(1);
        } else {
            $(this).val(0);
        }
        let checkedList = [];
        // チェックが外れた明細を完了の配列から削除
        self.sel("#myCompList tr").each(function(i) {
            // チェックされていないか判定を行う
            if (self.sel("#afCheck" + i).prop('checked') == false) {
                // 未完了になるデータを取得・完了データから削除
                checkedList = self.afterList[i];
                self.afterList.splice(i, 1);
            }
        });
        // チェックが外れた明細を未完了の配列の先頭に追加
        if (checkedList.length != 0) {
            if (false === self.exception.check(
                    self.master.edit(
                        "MK_category",
                        false, [
                            "statusCD",
                            "finishDate"
                        ], [
                            "'0'",
                            "N''"
                        ], [
                            "companyID = N'" + self.companyID + "'",
                            "todoID = '" + checkedList.todoID + "'",
                            "staffID = N'" + self.staff + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101306",
                    "未完了に戻す処理に失敗しました",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            // 先頭に未完データを追加する
            self.beforList.unshift(checkedList);
        }
        // 新しい配列でテーブルのリスト表示をする。
        self.sel('#myTodoList').empty();
        self.bfListDisplay(self.beforList);
        self.sel('#myCompList').empty();
        self.aftListDisplay(self.afterList);
        // 完了表示・非表示変更
        if (self.afterList.length == 0) {
            self.sel("#switchBtn").hide();
        } else {
            self.sel("#switchBtn").show();
        }
    });
};