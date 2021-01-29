"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*******************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1015.prototype.sel = function(selecter) {
    return $(".view1015 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1015.prototype.ev = function(eventName, selecter, func) {
    $(".view1015").on(eventName, selecter, func);
};
//---------------------------------------
// 時刻カウントファンクション
// 引数
//---------------------------------------
MainClass1015.prototype.buttonChange = function() {
    const self = this;
    if (self.todoID != "") {
        sessionStorage.setItem('isChange', 'true');
        self.sel("#update").attr("disabled", false);
    }
};
//=========================================
// やることマスタの更新
// 2017/08/31  優先表示はリストで切り替えるのみとする。
//=========================================
MainClass1015.prototype.todoUpDate = function() {
    const self = this;
    let flag = false;
    let arrayStaffID = self.arrayStaffID;
    if (arrayStaffID == "memberNot") {
        arrayStaffID = "";
    }
    const g_arrayStaff = self.g_arrayStaff;
    const g_memberArray = self.g_memberArray;
    const staffID = self.staff;
    const todoID = self.todoID;
    const today = self.today;
    let msg = '';
    if (false === self.exception.check(
            self.master.edit(
                "MK_todo",
                false, [
                    "todoDate",
                    "keisaiKigen",
                    "todoTitle",
                    "todo"
                ], [
                    "N'" + self.g_startYmd + "'",
                    "N'" + self.g_endYmd + "'",
                    "N'" + self.sel("#title").val() + "'",
                    "N'" + self.sel("#meisai").val() + "'"
                ], [
                    "todoID='" + todoID + "'",
                    "companyID=N'" + self.companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101503",
            "更新処理に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 依頼チェック外れたら
    const irai = self.sel("#irai").val();
    if (irai == "0") {
        self.category = '1';
        // 自分のデータの存在チェックして、無ければ自分のデータを追加
        for (let i in g_memberArray) {
            if (false === self.exception.check(
                    self.master.del(
                        "MK_category",
                        "", [
                            "companyID = N'" + self.companyID + "'",
                            "todoID = '" + todoID + "'",
                            "staffID = N'" + g_memberArray[i].staffID + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101504",
                    "更新処理に失敗しました（依頼チェック）。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            // 通知履歴の削除
            if (false === self.exception.check(
                    self.master.del(
                        "MK_history",
                        "", [
                            "externNo = '" + todoID + "'",
                            "companyID = N'" + self.companyID + "'",
                            "staffID = N'" + g_memberArray[i].staffID + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101505",
                    "更新処理に失敗しました（通知履歴の削除）。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            if (g_memberArray[i].staffID != staffID) {
                // 通知を行う
                msg = "削除";
                if (false === self.noticication(g_memberArray[i].staffID, todoID, today, msg)) {
                    return false;
                }
            }
        }
        // カテゴリーテーブルに自分をメンバーに追加する
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
                        "'" + todoID + "'",
                        "N'" + staffID + "'",
                        "'0'",
                        "N'" + self.companyID + "'",
                        "'" + self.sendBook + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOff,
                // メンバーに自分が含まれていない場合もあるため、登録できなくてもそのまま流す
                "101506",
                "更新処理に失敗しました（自分の追加）。",
                ExceptionParamToMenu
            )) {
            return false;
        }
    } else {
        // カテゴリテーブルの編集
        // パラメータ"arrayStaffID"が存在するとき
        if (arrayStaffID != "") {
            // 追加メンバーの抽出
            for (let j = 0; j < g_arrayStaff.length; j++) {
                for (let i in g_memberArray) {
                    if (String(g_arrayStaff[j]) == String(g_memberArray[i].staffID)) {
                        flag = true;
                    }
                }
                if (flag == false) {
                    // データの追加
                    if (false === self.exception.check(
                            self.master.entry(
                                "MK_category",
                                false, [
                                    "todoID",
                                    "staffID",
                                    "statusCD",
                                    "bookMark",
                                    "companyID"
                                ], [
                                    "'" + todoID + "'",
                                    "N'" + g_arrayStaff[j] + "'",
                                    "'1'",
                                    "'1'",
                                    "N'" + self.companyID + "'"
                                ]
                            ),
                            ExceptionServerOn,
                            ExceptionSystemOn,
                            "101507",
                            "更新処理に失敗しました（データの追加）。",
                            ExceptionParamToMenu
                        )) {
                        return false;
                    }
                    if (g_arrayStaff[j] != staffID) {
                        // 通知を行う
                        if (false === self.noticication(g_arrayStaff[j], todoID, today, "追加")) {
                            return false;
                        }
                    }
                }
                flag = false;
            }
            // データの削除
            if (false === self.exception.check(
                    self.master.del(
                        "MK_category",
                        "", [
                            "companyID = N'" + self.companyID + "'",
                            "todoID = '" + todoID + "'",
                            "staffID = N'" + staffID + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOff,
                    // メンバーに自分が含まれていない場合もあるため、削除できなくてもそのまま流す
                    "101508",
                    "更新処理に失敗しました（データの削除）。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            self.category = '0';
            // 削除メンバーの抽出
            for (let i in g_memberArray) {
                for (let j = 0; j < g_arrayStaff.length; j++) {
                    if (String(g_arrayStaff[j]) == String(g_memberArray[i].staffID)) {
                        flag = true;
                    }
                    if (g_memberArray[i].staffID == staffID) {
                        flag = false;
                    }
                }
                if (flag == false) {
                    // データの削除
                    if (false === self.exception.check(
                            self.master.del(
                                "MK_category",
                                "", [
                                    "companyID = N'" + self.companyID + "'",
                                    "todoID = '" + todoID + "'",
                                    "staffID = N'" + g_memberArray[i].staffID + "'"
                                ]
                            ),
                            ExceptionServerOn,
                            ExceptionSystemOn,
                            "101509",
                            "更新処理に失敗しました（データの削除）。",
                            ExceptionParamToMenu
                        )) {
                        return false;
                    }
                    // 通知履歴の削除
                    if (false === self.exception.check(
                            self.master.del(
                                "MK_history",
                                "", [
                                    "externNo = '" + todoID + "'",
                                    "companyID = N'" + self.companyID + "'",
                                    "staffID = N'" + g_memberArray[i].staffID + "'"
                                ]
                            ),
                            ExceptionServerOn,
                            ExceptionSystemOn,
                            "101510",
                            "更新処理に失敗しました（ヒストリー）。",
                            ExceptionParamToMenu
                        )) {
                        return false;
                    }
                    if (g_memberArray[i].staffID != staffID) {
                        // 通知を行う
                        msg = "削除";
                        if (false === self.noticication(g_memberArray[i].staffID, todoID, today, msg)) {
                            return false;
                        }
                    }
                } else {
                    if (g_memberArray[i].staffID != self.staff) {
                        // データの更新
                        if (false === self.exception.check(
                                self.master.edit(
                                    "MK_category",
                                    false, [
                                        "statusCD"
                                    ], [
                                        "'2'"
                                    ], [
                                        "todoID='" + todoID + "'",
                                        "companyID=N'" + self.companyID + "'",
                                        "staffID = N'" + g_memberArray[i].staffID + "'"
                                    ]
                                ),
                                ExceptionServerOn,
                                ExceptionSystemOn,
                                "101511",
                                "データの更新に失敗しました。",
                                ExceptionParamToMenu
                            )) {
                            return false;
                        }
                        if (g_memberArray[i].staffID != staffID) {
                            // 通知を行う
                            msg = "更新";
                            if (false === self.noticication(g_memberArray[i].staffID, todoID, today, msg)) {
                                return false;
                            }
                        }
                    }
                }
                flag = false;
            }
        } else {
            // ＤＢのデータのみの場合
            for (let i in g_memberArray) {
                // データの更新
                if (false === self.exception.check(
                        self.master.edit(
                            "MK_category",
                            false, [
                                "statusCD"
                            ], [
                                "'2'"
                            ], [
                                "todoID='" + todoID + "'",
                                "companyID=N'" + self.companyID + "'",
                                "staffID = N'" + g_memberArray[i].staffID + "'"
                            ]
                        ),
                        ExceptionServerOn,
                        ExceptionSystemOn,
                        "101512",
                        "更新処理に失敗しました（ＤＢのデータのみ）。",
                        ExceptionParamToMenu
                    )) {
                    return false;
                }
                if (g_memberArray[i].staffID != staffID) {
                    // 通知を行う
                    msg = "更新";
                    if (false === self.noticication(g_memberArray[i].staffID, todoID, today, msg)) {
                        return false;
                    }
                }
            }
        }
    }
    localStorage.setItem("toast", "変更内容を保存しました。");
};
//=========================================
// やることマスタの削除
//=========================================
MainClass1015.prototype.todoDel = function() {
    const self = this;
    if (false === self.exception.check(
            self.master.del(
                "MK_todo",
                "",
                [
                    "todoID='" + self.todoID + "'",
                    "companyID=N'" + self.companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101513",
            "削除処理に失敗しました。（やること）",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // カテゴリーの削除
    const category = self.master.read(
        "SELECT staffID,categoryNo" +
        " FROM MK_category " +
        " WHERE" +
        "    companyID=N'" + self.companyID + "' AND " +
        "    todoID='" + self.todoID + "'"
    );
    if (false === self.exception.check(
            category,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101514",
            "削除処理に失敗しました。（カテゴリーの削除）",
            ExceptionParamToMenu
        )) {
        return false;
    }
    for (let i in category) {
        // 対象データの削除
        if (false === self.exception.check(
                self.master.del(
                    "MK_category",
                    "", [
                        "companyID = N'" + self.companyID + "'",
                        "todoID = '" + self.todoID + "'",
                        "staffID = N'" + category[i].staffID + "'",
                        "categoryNo = '" + category[i].categoryNo + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOn,
                "101515",
                "削除処理に失敗しました。（カテゴリーの削除）",
                ExceptionParamToMenu
            )) {
            return false;
        }
        // 通知履歴の削除
        if (false === self.exception.check(
                self.master.del(
                    "MK_history",
                    "", [
                        "externNo = '" + self.todoID + "'",
                        "companyID = N'" + self.companyID + "'",
                        "staffID = N'" + category[i].staffID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOff, // メンバーに自分が含まれているいない場合もあるため、削除できなくてもそのまま流す
                "101516",
                "削除処理に失敗しました。（通知履歴の削除）",
                ExceptionParamToMenu
            )) {
            return false;
        }
        // 通知を行う
        const msg = "削除";
        if (false === self.noticication(
            category[i].staffID,
            self.todoID,
            self.today,
            msg
        )) {
            return false;
        }
    }
    localStorage.setItem("toast", "削除しました。");
};
//****************************************//
// エラーチェック
//****************************************//
MainClass1015.prototype.errorCheck = function() {
    const self = this;
    const title = self.sel("#title").val();
    const meisai = self.sel("#meisai").val();
    const ym1 = self.sel("#ym1").val();
    let ym = ym1;
    const irai = self.sel("#irai").val();
    // タイトル空白チェック
    if (title.trim() == "") {
        // 必須チェック
        Materialize.toast('やること（題名）を入力してください', 3000);
        return false;
    }
    const tlen = title.length;
    // タイトル文字数チェック
    if (tlen > 255) {
        // 必須チェック
        Materialize.toast('やること（題名）の文字数は２５５文字以内で入力してください', 3000);
        return false;
    }
    // 2017/09/01  絵文字チェック追加
    // タイトルに絵文字が含まれている場合。
    if (title.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('やること（題名）に使用できない絵文字が含まれています。', 3000);
        return false;
    }
    //依頼人数チェック
    if (irai == '1') {
        if (self.sel("#member").text() == "0名") {
            Materialize.toast('依頼する人が選択されていません。', 3000);
            return false;
        }
    }
    // 作成日付空白チェック
    if (ym == "") {
        self.g_startYmd = "";
        // 必須チェック
    } else {
        if (self.dateCheck(ym) == false) {
            return false;
        }
        const getumatuym = ym.split('-');
        const y = parseInt(getumatuym[0], 10);
        let m = parseInt(getumatuym[1], 10);
        let d = parseInt(getumatuym[2], 10);
        const str = getumatuym[1].substr(0, 1);
        const strD = getumatuym[2].substr(0, 1);
        if (str == 0) {
            m = parseInt(getumatuym[1].substr(1, 1), 10);
        }
        if (strD == 0) {
            d = parseInt(getumatuym[2].substr(1, 1), 10);
        }
        const ym1 = y + "/" + addZero(m) + "/" + addZero(d);
        self.g_startYmd = ym1;
    }
    const ym2 = self.sel("#ym2").val();
    ym = ym2;
    // 掲載日付空白チェック
    if (ym == "") {
        self.g_endYmd = "";
        // 必須チェック
    } else {
        if (self.dateCheck(ym) == false) {
            return false;
        }
        const getumatuym = ym.split('-');
        const y = parseInt(getumatuym[0], 10);
        let m = parseInt(getumatuym[1], 10);
        let d = parseInt(getumatuym[2], 10);
        const str = getumatuym[1].substr(0, 1);
        const strD = getumatuym[2].substr(0, 1);
        if (str == 0) {
            m = parseInt(getumatuym[1].substr(1, 1), 10);
        }
        if (strD == 0) {
            d = parseInt(getumatuym[2].substr(1, 1), 10);
        }
        const ym2 = y + "/" + addZero(m) + "/" + addZero(d);
        self.g_endYmd = ym2;
    }
    // 作成日付と掲載日付のチェック
    if (new Date(ym1) > new Date(ym2)) {
        Materialize.toast('「終了日」の日付に「開始日」の日付より前の日付は入力できません。', 3500);
        return false;
    }
    const len = meisai.length;
    //明細文字数チェック
    if (len > 255) {
        // 必須チェック
        Materialize.toast('To do（やること）の文字数は２５５文字以内で入力してください', 3000);
        return false;
    }
    // 2017/09/01  絵文字チェック追加
    // 本文に絵文字が含まれている場合。
    if (meisai.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('To do（やること）に使用できない絵文字が含まれています。', 3000);
        return false;
    }
    return true;
};
//****************************************//
// 日付チェック      //
//****************************************//
MainClass1015.prototype.dateCheck = function(ym) {
    const self = this;
    if (!ym.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
        Materialize.toast('yyyy-MM-ddの形式で入力してください。', 3000);
        return false;
    }
    const getumatuym = ym.split("-");
    const y = parseInt(getumatuym[0], 10);
    let m = parseInt(getumatuym[1], 10);
    let d = parseInt(getumatuym[2], 10);
    const str = getumatuym[1].substr(0, 1);
    const strD = getumatuym[2].substr(0, 1);
    if (str == 0) {
        m = parseInt(getumatuym[1].substr(1, 1), 10);
    }
    if (strD == 0) {
        d = parseInt(getumatuym[2].substr(1, 1), 10);
    }
    if (getumatuym.length != 3) {
        Materialize.toast('年月はyyyy-MM-ddの形式で入力してください。', 3000);
        return false;
    }
    if (m > 12 || m == 0) {
        Materialize.toast('存在しない日付です。', 3000);
        return false;
    }
    if (m == 4 || m == 6 || m == 9 || m == 11) {
        if (d > 30) {
            Materialize.toast('存在しない日付です。', 3000);
            return false;
        }
    } else if (m == 2 && (0 == y % 400 || (0 == y % 4 && 0 != y % 100))) {
        if (d > 29) {
            Materialize.toast('存在しない日付です。', 3000);
            return false;
        }
    } else if (m == 2) {
        if (d > 28) {
            Materialize.toast('存在しない日付です。', 3000);
            return false;
        }
    } else {
        if (d > 31) {
            Materialize.toast('存在しない日付です。', 3000);
            return false;
        }
    }
};
//****************************************************
// 通知処理
//****************************************************
MainClass1015.prototype.noticication = function(staffID, todoID, today, msg) {
    const self = this;
    // 現在時刻の取得
    const talkTime = g_getTalkTime();
    // 端末情報の取得
    const tanmatuData = self.master.read(`
        SELECT
            registerID,
            name
        FROM MK_smartPhone
        WHERE
            staffID=N'${staffID}' AND
            companyID=N'${self.companyID}' AND
            name<>N'card' AND
            registerID<>N'' AND
            registerID<>N'logout' AND
            registerID IS NOT NULL
    `);
    switch (self.exception.check(
        tanmatuData,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101517",
        "端末情報の取得に失敗しました。",
        ExceptionParamToMenu
    )) {
        case false:
            return false;
        case null:
            // 端末情報の取得できなくてもそのまま流す
            break;
        case true:
            const regData = [];
            const nameData = [];
            for (let s in tanmatuData) {
                regData.push(tanmatuData[s].registerID);
                nameData.push(tanmatuData[s].name);
            }
            // 対象者に通知を送る
            commonPushFunc(
                tanmatuData[0].idm,
                regData,
                self.companyID,
                staffID,
                "やることが" + msg + "されました",
                "mode=3",
                todoID,
                nameData,
                false
            );
            break;
    }
    // 更新履歴をDBに挿入する。
    if (msg == '追加') {
        const flg = newHistory(
            0,
            talkTime,
            staffID,
            todoID,
            self.companyID
        );
        if (false === self.exception.check(
                flg,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101518",
                "更新履歴をDBに挿入に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
    }
    return true;
};