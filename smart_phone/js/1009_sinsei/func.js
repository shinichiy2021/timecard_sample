"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
const SINSEI_SHOW_LENGTH = 150;
// 自作セレクターメソッド
//****************************************
MainClass1009.prototype.sel = function(selecter) {
    return $(".view1009 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1009.prototype.ev = function(eventName, selecter, func) {
    $(".view1009").on(eventName, selecter, func);
};
//---------------------------------------
// リストの表示関数
// 引数
// sinseiWhereFlag :ポップアップの絞り込み条件
// dateOrderByFlag :ポップアップの並び替え条件
//---------------------------------------
MainClass1009.prototype.listDisplay = function(sinseiWhereFlag, dateOrderByFlag) {
    let html = null;
    let sinseiList = null;
    let whereSQL = '';
    const loginStaffID = this.staff;
    const companyID = this.companyID;
    // 絞り込み条件の作成
    if (sinseiWhereFlag == 0) {
        if (this.admCD == '0') {
            // 全権限者の時は全てを表示する
            whereSQL = '';
        } else if (this.admCD == '1') {
            // 管理権限者の時はsinseiWhereFlagが1と2の条件を表示する
            whereSQL = " AND (SI.sinseiStaffID=N'" + loginStaffID + "'";
            whereSQL += " OR SI.shoninStaffID=N'" + loginStaffID + "')";
        } else if (this.admCD == '2') {
            // 一般権限者の時はsinseiWhereFlagが1の条件を表示する
            whereSQL = " AND SI.sinseiStaffID=N'" + loginStaffID + "'";
        }
    } else if (sinseiWhereFlag == 1) {
        whereSQL = " AND SI.sinseiStaffID=N'" + loginStaffID + "'";
    } else if (sinseiWhereFlag == 2) {
        whereSQL = " AND SI.shoninStaffID=N'" + loginStaffID + "'";
    } else if (sinseiWhereFlag == 3) {
        whereSQL = " AND (SI.sinseiStaffID<>N'" + loginStaffID + "'";
        whereSQL += " AND SI.shoninStaffID<>N'" + loginStaffID + "')";
    }
    this.sel("#list").empty();
    this.sel("#compList").empty();
    sinseiList = this.master.read(
        "SELECT" +
        // "    DISTINCT TOP " + SINSEI_SHOW_LENGTH +
        "    ISNULL(TD.labelName, '打刻修正日') AS labelName," +
        "    SI.sinseiNo," +
        "    SI.taishouDate ," +
        "    SI.endDate," +
        "    SI.sinseiStaffID ," +
        "    MK_staff.name AS sinseiName," +
        "    SI.shoninStaffID," +
        "    kanriST.name AS shoninName," +
        "    SI.shoninFlag," +
        "    TD.todokedeName" +
        " FROM" +
        "    (SELECT" +
        "        sinseiNo," +
        "        MIN(taishouDate) AS taishouDate," +
        "        MAX(taishouDate) AS endDate ," +
        "        sinseiStaffID," +
        "        shoninStaffID," +
        "        shoninFlag," +
        "        companyID," +
        "        todokedeId," +
        "        commitStaffID " +
        "      FROM MK_sinsei" +
        "      WHERE companyID=N'" + companyID + "'" +
        "      GROUP BY sinseiNo," +
        "        sinseiStaffID," +
        "        shoninStaffID," +
        "        shoninFlag," +
        "        companyID," +
        "        todokedeId," +
        "        commitStaffID) AS SI" +
        " INNER JOIN MK_staff ON" +
        "    SI.companyID=MK_staff.companyID AND" +
        "    SI.sinseiStaffID=MK_staff.staffID" +
        " INNER JOIN" +
        "   (SELECT staffID, name,email FROM MK_staff AS MK_staff_1 WHERE companyID=N'" + companyID + "') AS kanriST ON" +
        "    SI.shoninStaffID=kanriST.staffID" +
        " LEFT OUTER JOIN" +
        "   (SELECT staffID,name FROM MK_staff AS MK_staff_2 WHERE companyID=N'" + companyID + "') AS commitST ON" +
        "    SI.commitStaffID=commitST.staffID" +
        " LEFT OUTER JOIN" +
        "    MK_todokede AS TD ON SI.todokedeID=TD.todokedeID AND" +
        "    SI.companyID=TD.companyID" +
        " WHERE" +
        "    SI.companyID=N'" + companyID + "'" +
        whereSQL +
        " ORDER BY" +
        "    SI.taishouDate ASC," +
        "    SI.sinseiNo ASC"
    );
    // 処理済みを表示するボタンを表示する
    this.sel('#switchBtn').show();
    const sinseiListFlag = this.exception.check(
        sinseiList,
        ExceptionServerOn,
        ExceptionSystemOff,
        "100901",
        "リストの表示データが存在しません。",
        ExceptionParamToMenu
    );
    if (sinseiListFlag == false) {
        return false;
    }
    if (sinseiListFlag == null) {
        html = "<p class='noList'>表示する届出がありません。</p>";
        this.sel("#list").append(html);
        this.sel('#switchBtn').hide();
    } else {
        const drawDisplay = i => {
            const sinseiNo = sinseiList[i].sinseiNo;
            const kaishiDate = sinseiList[i].taishouDate;
            const endDate = sinseiList[i].endDate;
            const sinseiStaff = sinseiList[i].sinseiStaffID;
            const sinseiName = sinseiList[i].sinseiName;
            const shoninStaff = sinseiList[i].shoninStaffID;
            const shoninName = sinseiList[i].shoninName;
            const shoninFlag = sinseiList[i].shoninFlag;
            let todokedeName = sinseiList[i].todokedeName;
            if (todokedeName == null) {
                todokedeName = "修正";
            }
            // 取得したデータの1レコードごとに表示する。
            let $html = null;
            let $compHtml = null;
            const writing = true;
            let taishouDate = '';
            if (kaishiDate == endDate) {
                taishouDate = this.dateFormat(kaishiDate);
            } else {
                taishouDate = this.dateFormat(kaishiDate) + "～" + this.dateFormat(endDate);
            }
            if (writing == true) {
                let statusIconPath = '';
                let showName = '';
                // 条件によって表示を切り替える
                // 自分で提出した届出の時（ログイン者が申請者であるとき）
                if (loginStaffID == sinseiStaff) {
                    statusIconPath = 'toIcon.png';
                    showName = shoninName;
                }
                // 自分が受け取った届出の時（ログイン者が確認者であるとき）
                else if (loginStaffID == shoninStaff) {
                    statusIconPath = 'doIcon.png';
                    showName = sinseiName;
                }
                // 確認済みの届出の時
                else {
                    statusIconPath = 'otherIcon.png';
                    showName = sinseiName;
                }
                // 期間情報
                let classDateColor = '';
                if (kaishiDate != "") {
                    if (new Date(kaishiDate) > new Date()) {
                        classDateColor += 'Kigen';
                    } else {
                        classDateColor += 'kigenGire';
                    }
                }
                // 申請リストの表示開始
                if (shoninFlag == '0') {
                    // 届出が確認待ちの時
                    $html = 
                        _.template(this.sel("#sinsei-list").html())({
                            listCSS: "wait",
                            statusIconPath: statusIconPath,
                            lineThrough: "",
                            todokedeName: todokedeName,
                            counter: i,
                            showName: showName,
                            classDateColor: classDateColor,
                            taishouDate: taishouDate,
                            sinseiNo: sinseiNo
                        });
                } else if (shoninFlag == '1') {
                    // 届出が確認済の時
                    $compHtml = 
                        _.template(this.sel("#sinsei-list").html())({
                            listCSS: "sumi",
                            statusIconPath: statusIconPath,
                            lineThrough: "",
                            todokedeName: todokedeName,
                            counter: i,
                            showName: showName,
                            classDateColor: "",
                            taishouDate: taishouDate,
                            sinseiNo: sinseiNo
                        });
                } else {
                    // 申請が取り下げの時
                    $compHtml = 
                        _.template(this.sel("#sinsei-list").html())({
                            listCSS: "sumi",
                            statusIconPath: statusIconPath,
                            lineThrough: "line-through",
                            todokedeName: todokedeName,
                            counter: i,
                            showName: showName,
                            classDateColor: "",
                            taishouDate: taishouDate,
                            sinseiNo: sinseiNo
                        });
                }
            }
            this.sel("#list").append($html);
            this.sel("#compList").prepend($compHtml);
            this.sel('#showName' + i).flowtype({
                maximum: 65,
                minimum: 10,
                maxFont: 6,
                minFont: 2.8,
                fontRatio: this.sel('#showName' + i).text().length + 2
            });
        }
        // 並び替え条件の作成
        let startCount = sinseiList.length - SINSEI_SHOW_LENGTH;
        if (0 > startCount) {
            startCount = 0;
        }
        for (let i = startCount; i <  sinseiList.length; i++) {
            drawDisplay(i);
        }
        if (this.sel('#compList tr').length == 0) {
            this.sel('#switchBtn').hide();
        }
    }
};