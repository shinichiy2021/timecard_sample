"use strict";
//******************************************************************************
// 関数
// 関数はこのJSファイルに記入してください
//****************************************
// 自作セレクターメソッド
//****************************************
MainClass1018.prototype.sel = function(selecter) {
    return $(".view1018 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1018.prototype.ev = function(eventName, selecter, func) {
    $(".view1018").on(eventName, selecter, func);
};
MainClass1018.prototype.uploadFile = function(filePass, fileName) {
    const self = this;
    const base64 = self.cropper.getCroppedCanvas().toDataURL("image/jpeg");
    self.sel("#nowIcon").attr("src", base64);
    self.sel(".iconTable").css("background", "none");
    self.sel('#loader-bg').delay(300).fadeOut(300);
    // ここから画像の送信処理です
    // （ログでは無く、サーバー上のフォルダに画像を送信する処理）
    $.ajax({
            url: "../php/upload.php",
            type: "POST",
            data: {
                "image": base64,
                "filePass": filePass,
                "fileName": fileName
            },
            cache: false,
            dataType: "html",
            async: true
        })
        .done(function(data, textStatus, jqXHR) {})
        .fail(function(jqXHR, textStatus, errorThrown) {
            Materialize.toast('ファイルのアップロードに失敗しました。', 3000);
        });
};
//*****************************************
// エラーチェック
//*****************************************
MainClass1018.prototype.errorCheck = function(title, member) {
    const self = this;
    // タイトル空白チェック
    if (title.trim() == "") {
        Materialize.toast('グループ名を入力してください', 3000);
        return false;
    }
    if (title.length > 255) {
        Materialize.toast('グループ名は255文字以内で登録してください', 3000);
        return false;
    }
    // 絵文字が含まれている場合。
    if (title.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
        Materialize.toast('グループ名に使用できない絵文字が含まれています。', 3000);
        return false;
    }
    if (member < 3) {
        Materialize.toast('メンバーは最低３人以上で登録してください', 3000);
        return false;
    }
    return true;
};
//*****************************************
// 端末情報取得
//*****************************************
MainClass1018.prototype.getSmartPhone = function(staffID, companyID, smartPhone) {
    const self = this;
    // 端末情報の設定
    const data = self.master.read(`
        SELECT
            registerID,
            name,
            idm
        FROM MK_smartPhone
        WHERE
            staffID=N'${staffID}' AND
            companyID=N'${companyID}' AND
            name<>N'card' AND
            registerID<>N'' AND
            registerID<>N'logout' AND
            registerID IS NOT NULL
    `);
    if (false === self.exception.check(
            data,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101801",
            "端末情報の取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    for (let i in data) {
        self.item = {
            "idm": data[i].idm,
            "registerID": data[i].registerID,
            "name": data[i].name
        };
        smartPhone[i] = self.item;
    }
    return true;
};
//*****************************************
// グループの存在チェック
//*****************************************
MainClass1018.prototype.groupShow = async function() {
    const self = this;
    const staffID = self.staff;
    let member = '';
    let img = '';
    // メッセージの初期化
    self.sel("#editMsg").html('');
    // アイコンの選択を初期化
    self.sel(".iconTable").css("background", "none");
    const meDel = JSON.parse(localStorage.getItem("meDel"));
    if (meDel == '1') {
        sessionStorage.setItem('isChange', 'true');
    }
    // グループＩＤにより処理を変更する
    if (self.groupID == "new") {
        // 新規登録
        self.backMsg = "登録ボタンをタップするまで新規グループは追加されません。";
        self.sel("#editMsg").append("<p>登録ボタンをタップするまでメンバーは確定されません</p>");
        // タイトルの変更
        self.sel(".mainTitle h2").text('グループの追加');
        // ボタンの制御
        self.sel("#regist").show();
        self.sel("#update").hide();
        self.sel("#delete").hide();
        // セッションストレージからグループ名の取得
        self.sel("#title_text").val(JSON.parse(localStorage.getItem("title_text")));
        img = JSON.parse(localStorage.getItem("nowIcon"));
        // 登録人数の取得
        if ("" == self.arrayStaffID) {
            member = "登録人数：1名";
        } else {
            if (self.staff === self.arrayStaffID) {
                member = "登録人数：1名";
            } else {
                self.count = self.arrayStaffID.split(',').length;
                member = "登録人数：" + (self.count + 1) + "名";
            }
        }
        // 登録人数の表示
        self.sel('#member_su').empty();
        self.sel("#member_su").append("<div>" + member + "</div>");
    } else {
        let groupInfoData = null
        await self.database.getFetch(
            'mappingGetGroupInfo',
            [
                self.companyID,
                self.groupID,
            ],
        ).then(response => response.json())
            .then(data => {
                console.log('Success:', data)
                groupInfoData = data
            })
            .catch(() => {
                Materialize.toast('E101601 : グループの存在チェックに失敗しました。', 3000);
                groupInfoData = false
            })
        // 取得ができなかった場合
        switch (groupInfoData) {
            case false:
                spaHash('#1004', 'reverse');
                return false;
            case null:
                Materialize.toast('E101601 : 該当のグループが存在しません。', 3000)
                spaHash('#1004', 'reverse');
                return false
            default:
                self.memberIDdata = groupInfoData;
                self.count = groupInfoData.length;
        }
        // 編集更新の時
        self.backMsg = "更新ボタンを押すまで編集内容は更新されません。";
        self.sel("#editMsg").append("<p>更新ボタンを押すまでメンバーは確定されません。</p>");
        // タイトルの変更
        self.sel(".mainTitle h2").text('グループの編集');
        // ボタンの制御
        self.sel("#regist").hide();
        self.sel("#update").show();
        self.sel("#delete").show();
        if (sessionStorage.getItem('isChange') == 'false') {
            self.sel("#update").attr('disabled', true);
        } else {
            self.sel("#update").attr('disabled', false);
        }
        // セッションデータの復帰
        const title_text = JSON.parse(localStorage.getItem("title_text"));
        img = JSON.parse(localStorage.getItem("nowIcon"));
        // グループ内容の適応
        if (title_text == null) {
            self.sel("#title_text").val(self.memberIDdata[0].groupName);
        } else {
            self.sel("#title_text").val(title_text);
        }
        setTimeout(function () {
            self.sel('#title_text').trigger('autoresize');
        }, 500);
        if (img == null || img == '') {
            img = self.memberIDdata[0].icon;
        }
        // 配列をセッションにセットする
        if ('' == self.arrayStaffID) {
            let j = 0;
            self.g_memberArray = [];
            // DBから取得したデータの取得
            for (let i in self.memberIDdata) {
                if (self.memberIDdata[i].memberID != staffID) {
                    const item = {
                        "staffID": self.memberIDdata[i].memberID
                    };
                    self.g_memberArray[j] = item;
                    j++;
                }
            }
            // セションに保存するための加工処理
            for (let j = 0; j < self.g_memberArray.length; j++) {
                if (j == self.g_memberArray.length - 1) {
                    self.arrayStaffID += self.g_memberArray[j].staffID;
                } else {
                    self.arrayStaffID += self.g_memberArray[j].staffID + ",";
                }
            }
            sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
        } else {
            self.count = self.arrayStaffID.split(',').length + 1;
        }
        // 登録人数の取得
        if (meDel != '1') {
            member = "登録人数：" + self.count + "名";
        } else {
            member = "登録人数：" + (self.count - 1) + "名";
        }
        // 登録人数の表示
        self.sel('#member_su').empty();
        self.sel("#member_su").append("<div>" + member + "</div>");
    }
    self.mamber = member;
    if (img == "" || img == null) {
        img = "../../common/photo/nakama1.jpg";
    }
    self.sel("#nowIcon").attr("src", img);
    localStorage.setItem("nowIcon", JSON.stringify(img));
    return true
};
//*****************************************
// グループＩＤの最大値を取得
//*****************************************
MainClass1018.prototype.getGroupMax = async function() {
    const self = this;
    // let maxData = await self.database.getFetch(
    //     'mappingGetGroupMax',
    //     [
    //         self.companyID,
    //     ],
    // ).then(response => response.json())
    //     .then(data => {
    //         console.log('Success:', data)
    //         maxData = data
    //     })
    //     .catch(() => {
    //         Materialize.toast('E101801 : グループＩＤの最大値を取得に失敗しました。', 3000);
    //         maxData = false
    //     })
    // // 取得ができなかった場合
    // switch (maxData) {
    //     case false:
    //         spaHash('#1004', 'reverse');
    //         return false;
    //     case null:
    //         Materialize.toast('E101801 : グループＩＤの最大値を取得に失敗しました。', 3000);
    //         spaHash('#1004', 'reverse');
    //         return false
    //     default:
    //         return maxData[0].maxID
    // }
// let groupMAX = self.master.read(
//         "SELECT" +
//         "    ISNULL(MAX(groupID)+1,'1') AS maxID" +
//         " FROM MK_group" +
//         " WHERE" +
//         "    companyID= N'" + self.companyID + "'"
//     );
//     if (false === self.exception.check(
//             groupMAX,
//             ExceptionServerOn,
//             ExceptionSystemOn,
//             "101803",
//             "グループＩＤの最大値を取得に失敗しました。",
//             ExceptionParamToMenu
//         )) {
//         return false;
//     }
//     return groupMAX[0].maxID;
};
//*****************************************
// 新規グループ登録
//*****************************************
MainClass1018.prototype.groupEntry = async function(talkTime, upDateUrl) {
    const self = this;
    const staffID = self.staff;
    const companyID = self.companyID;
    const g_arrayStaff = self.g_arrayStaff;
    const title = self.sel("#title_text").val();
    // グループＩＤの最大値を取得
    let groupMaxCount = 1
    let groupMaxData = null
    await self.database.getFetch(
        'mappingGetGroupMax',
        [
            self.companyID,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            groupMaxData = data
        })
        .catch(() => {
            Materialize.toast('E101801 : グループＩＤの最大値を取得に失敗しました。', 3000);
            groupMaxData = false
        })
    // 取得ができなかった場合
    switch (groupMaxData) {
        case false:
            spaHash('#1004', 'reverse');
            return false;
        case null:
            Materialize.toast('E101801 : グループＩＤの最大値を取得に失敗しました。', 3000);
            spaHash('#1004', 'reverse');
            return false
        default:
            groupMaxCount = groupMaxData[0].maxID
    }






    
    if (false === self.exception.check(
            self.master.entry(
                "MK_group",
                "", [
                    "groupID",
                    "groupName",
                    "icon",
                    "companyID"
                ], [
                    "'" + groupMaxCount + "'",
                    "N'" + title + "'",
                    "N'" + upDateUrl + "'",
                    "N'" + companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101804",
            "新規グループの登録に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // メンバーの追加
    for (let i = 0; i < g_arrayStaff.length; i++) {
        // メンバーの追加
        if (false === self.exception.check(
                self.master.entry(
                    "MK_member",
                    "", [
                        "memberID",
                        "groupID",
                        "companyID"
                    ], [
                        "N'" + g_arrayStaff[i] + "'",
                        "'" + groupMaxCount + "'",
                        "N'" + companyID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOn,
                "101805",
                "メンバーの追加に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        // 自分以外のメンバーに通知
        if (staffID != g_arrayStaff[i]) {
            // 端末情報の取得
            const tanmatuData = self.master.read(`
                SELECT
                    registerID,
                    name,
                    idm
                FROM MK_smartPhone
                WHERE
                    staffID=N'${g_arrayStaff[i]}' AND
                    companyID=N'${companyID}' AND
                    name<>N'card' AND
                    registerID<>N'' AND
                    registerID<>N'logout' AND
                    registerID IS NOT NULL
            `);
            switch (self.exception.check(
                tanmatuData,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101806",
                "グループの作成に失敗しました。",
                ExceptionParamToMenu
            )) {
                case false:
                    return false;
                case null:
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
                        g_arrayStaff[i],
                        "グループが作成されました",
                        "mode=2&groupID=" + groupMaxCount,
                        groupMaxCount,
                        nameData,
                        false
                    );
                    switch (self.exception.check(
                        newHistory(1, talkTime, g_arrayStaff[i], groupMaxCount, companyID),
                        ExceptionServerOn,
                        ExceptionSystemOff,
                        "101807",
                        "グループの登録に失敗しました。",
                        ExceptionParamToMenu
                    )) {
                        case false:
                            return false;
                        case null:
                            //登録失敗時
                            break;
                        case true:
                            //正常終了時
                            break;
                    }
                    break;
            }
        }
    }
    // 自分の追加
    if (false === self.exception.check(
            self.master.entry(
                "MK_member",
                "", [
                    "memberID",
                    "groupID",
                    "companyID"
                ], [
                    "N'" + staffID + "'",
                    "'" + groupMaxCount + "'",
                    "N'" + companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101808",
            "自分の追加に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // チャットのメッセージ設定
    if (false === self.msgEntry(groupMaxCount, "新規グループが作成されました。", companyID)) {
        return false;
    }
    return true;
};
//*********************************************
// お知らせメッセージをチャット履歴にインサートする
//*********************************************
// データベースに登録
// 現在時刻の取得
MainClass1018.prototype.msgEntry = function(gID, text, compId) {
    const self = this;
    const nowDate = new Date();
    const year = nowDate.getFullYear();
    let month = nowDate.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let day = nowDate.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    let hour = nowDate.getHours();
    if (hour < 10) {
        hour = "0" + hour;
    }
    let minute = nowDate.getMinutes();
    if (minute < 10) {
        minute = "0" + minute;
    }
    let second = nowDate.getSeconds();
    if (second < 10) {
        second = "0" + second;
    }
    const talkTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    if (false === self.exception.check(
            self.master.entry(
                "MK_chat",
                "", [
                    "groupID",
                    "memberID",
                    "chatDateTime",
                    "chatLog",
                    "companyID"
                ], [
                    "N'" + gID + "'",
                    "N'msg'",
                    "N'" + talkTime + "'",
                    "N'" + text + "'",
                    "N'" + compId + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101809",
            "チャットのメッセージ設定に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    return true;
};
//*****************************************
// グループの更新
//*****************************************
MainClass1018.prototype.groupEdit = function(
    talkTime,
    upDateUrl,
    groupID,
    staffName,
    companyID,
    group,
    g_arrayStaff,
    g_memberArray,
    meDel
) {
    const self = this;
    const title = self.sel("#title_text").val();
    const staffID = self.staff;
    let henkou = false;
    // グループの更新
    if (false === self.exception.check(
            self.master.edit(
                "MK_group",
                "", [
                    "groupName",
                    "icon"
                ], [
                    "N'" + title + "'",
                    "N'" + upDateUrl + "'"
                ], [
                    "CompanyID=N'" + companyID + "'",
                    "groupID='" + groupID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101810",
            "グループの編集に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    if (title != group[0].groupName) {
        // ログ挿入
        if (false === self.msgEntry(groupID, staffName + "さんがグループ名を変更しました。", companyID)) {
            return false;
        }
        henkou = true;
    }
    if (upDateUrl != group[0].icon) {
        //ログ挿入
        if (false === self.msgEntry(groupID, staffName + "さんがグループアイコンを変更しました。", companyID)) {
            return false;
        }
        henkou = true;
    }
    let flag = false;
    const tanmatu = [];
    // パラメータ"arrayStaffID"が存在するとき
    if (self.arrayStaffID != "") {
        // 追加メンバーの抽出
        for (let j = 0; j < g_arrayStaff.length; j++) {
            for (let i in g_memberArray) {
                if (String(g_arrayStaff[j]) == String(g_memberArray[i].staffID)) {
                    flag = true;
                }
            }
            if (flag == false) {
                // 追加メッセージを送る
                if (false === self.getSmartPhone(g_arrayStaff[j], companyID, tanmatu)) {
                    return false;
                }
                if (tanmatu.length !== 0) {
                    const regData = [];
                    const nameData = [];
                    for (let s in tanmatu) {
                        regData.push(tanmatu[s].registerID);
                        nameData.push(tanmatu[s].name);
                    }
                    let invitation = null;
                    if (g_arrayStaff[j] != staffID) {
                        const data = self.master.read(
                            "SELECT" +
                            "    name" +
                            " FROM" +
                            "    MK_staff" +
                            " WHERE" +
                            "    staffID = N'" + g_arrayStaff[j] + "' AND" +
                            "    companyID =N'" + companyID + "'"
                        );
                        if (false === self.exception.check(
                                data,
                                ExceptionServerOn,
                                ExceptionSystemOn,
                                "101811",
                                "追加スタッフ情報の取得に失敗しました。",
                                ExceptionParamToMenu
                            )) {
                            return false;
                        }
                        invitation = data[0].name;
                        commonPushFunc(
                            tanmatu[0].idm,
                            regData,
                            self.companyID,
                            g_arrayStaff[j],
                            "グループに招待されました",
                            "mode=2&groupID=" + groupID,
                            groupID,
                            nameData,
                            false
                        );
                        if (false === self.msgEntry(groupID, self.staffName + "さんが" + invitation + "さんを招待しました。", companyID)) {
                            return false;
                        }
                    }
                    switch (self.exception.check(
                        newHistory(1, talkTime, g_arrayStaff[j], groupID, companyID),
                        ExceptionServerOn,
                        ExceptionSystemOff,
                        "101812",
                        "グループの登録に失敗しました。",
                        ExceptionParamToMenu
                    )) {
                        case false:
                            return false;
                        case null:
                            // 登録失敗時
                            break;
                        case true:
                            // 正常終了時
                            break;
                    }
                }
            }
            flag = false;
        }
        // 削除メンバーの抽出
        for (let i in g_memberArray) {
            for (let j = 0; j < g_arrayStaff.length; j++) {
                if (String(g_arrayStaff[j]) == String(g_memberArray[i].staffID)) {
                    flag = true;
                }
            }
            if (flag == false) {
                // 削除メッセージを送る
                if (false === self.getSmartPhone(g_memberArray[i].staffID, companyID, tanmatu)) {
                    return false;
                }
                if (tanmatu.length !== 0) {
                    const regData = [];
                    const nameData = [];
                    for (let s in tanmatu) {
                        regData.push(tanmatu[s].registerID);
                        nameData.push(tanmatu[s].name);
                    }
                    let away = null;
                    if (g_memberArray[i].staffID != staffID) {
                        const data = self.master.read(
                            "SELECT" +
                            "    name" +
                            " FROM" +
                            "    MK_staff" +
                            " WHERE" +
                            "    staffID = N'" + g_memberArray[i].staffID + "' AND" +
                            "    companyID =N'" + companyID + "'"
                        );
                        if (false === self.exception.check(
                                data,
                                ExceptionServerOn,
                                ExceptionSystemOn,
                                "101813",
                                "グループを退席に失敗しました。",
                                ExceptionParamToMenu
                            )) {
                            return false;
                        }
                        away = data[0].name;
                        if (tanmatu.length !== 0) {
                            commonPushFunc(
                                tanmatu[0].idm,
                                regData,
                                self.companyID,
                                g_memberArray[i].staffID,
                                "グループを退席しました",
                                "mode=2&groupID=" + groupID,
                                groupID,
                                nameData,
                                false
                            );
                        } else {
                            // 通知先の端末が存在しない時は何もしない
                        }
                        if (false === self.msgEntry(groupID, self.staffName + "さんが" + away + "さんを退席させました。", companyID)) {
                            return false;
                        }
                        // 削除者の未読履歴を削除する
                        if (false === self.exception.check(
                                self.master.del(
                                    "MK_history",
                                    "", [
                                        "category = 1",
                                        "staffID =N'" + g_memberArray[i].staffID + "'",
                                        "externNo ='" + groupID + "'",
                                        "companyID =N'" + companyID + "'"
                                    ]
                                ),
                                ExceptionServerOn,
                                ExceptionSystemOn,
                                "101814",
                                "削除者の未読履歴を削除に失敗しました。",
                                ExceptionParamToMenu
                            )) {
                            return false;
                        }
                    }
                }
            } else {
                if (false === self.getSmartPhone(g_memberArray[i].staffID, companyID, tanmatu)) {
                    return false;
                }
                if (tanmatu.length !== 0) {
                    const regData = [];
                    const nameData = [];
                    for (let s in tanmatu) {
                        regData.push(tanmatu[s].registerID);
                        nameData.push(tanmatu[s].name);
                    }
                    if (g_memberArray[i].staffID != staffID) {
                        commonPushFunc(
                            tanmatu[0].idm,
                            regData,
                            self.companyID,
                            g_memberArray[i].staffID,
                            "グループに変更が有ります",
                            "mode=2&groupID=" + groupID,
                            groupID,
                            nameData,
                            false
                        );
                        switch (self.exception.check(
                            newHistory(1, talkTime, g_memberArray[i].staffID, groupID, companyID),
                            ExceptionServerOn,
                            ExceptionSystemOff,
                            "101815",
                            "グループの登録に失敗しました。",
                            ExceptionParamToMenu
                        )) {
                            case false:
                                return false;
                            case null:
                                //登録失敗時
                                break;
                            case true:
                                //正常終了時
                                break;
                        }
                    }
                }
            }
            flag = false;
        }
        // メンバーの更新
        // 一旦全メンバーを削除する
        if (false === self.exception.check(
                self.master.del(
                    "MK_member",
                    "", [
                        "groupID ='" + groupID + "'",
                        "companyID =N'" + companyID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOn,
                "101816",
                "一旦全メンバーを削除に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        for (let i = 0; i < g_arrayStaff.length; i++) {
            // メンバーの追加
            if (false === self.exception.check(
                    self.master.entry(
                        "MK_member",
                        "", [
                            "memberID",
                            "groupID",
                            "companyID"
                        ], [
                            "N'" + g_arrayStaff[i] + "'",
                            "'" + groupID + "'",
                            "N'" + companyID + "'"
                        ]
                    ),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101817",
                    "グループの編集に失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        }
        // 自分のデータの追加
        if (false === self.exception.check(
                self.master.entry(
                    "MK_member",
                    "", [
                        "memberID",
                        "groupID",
                        "companyID"
                    ], [
                        "N'" + staffID + "'",
                        "'" + groupID + "'",
                        "N'" + companyID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOn,
                "101818",
                "グループの編集に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
    } else {
        // 2017/08/25  グループ名又はグループアイコンに変更が有った時の通知処理
        for (let i in g_memberArray) {
            if (false === self.getSmartPhone(g_memberArray[i].staffID, companyID, tanmatu)) {
                return false;
            }
            if (henkou == true) {
                if (tanmatu.length !== 0) {
                    const regData = [];
                    const nameData = [];
                    for (let s in tanmatu) {
                        regData.push(tanmatu[s].registerID);
                        nameData.push(tanmatu[s].name);
                    }
                    if (g_memberArray[i].staffID != staffID) {
                        commonPushFunc(
                            tanmatu[0].idm,
                            regData,
                            self.companyID,
                            g_memberArray[i].staffID,
                            "グループに変更が有ります",
                            "mode=2&groupID=" + groupID,
                            groupID,
                            nameData,
                            false
                        );
                        switch (self.exception.check(
                            newHistory(1, talkTime, g_memberArray[i].staffID, groupID, companyID),
                            ExceptionServerOn,
                            ExceptionSystemOff,
                            "101819",
                            "グループの登録に失敗しました。",
                            ExceptionParamToMenu
                        )) {
                            case false:
                                return false;
                            case null:
                                //登録失敗時
                                break;
                            case true:
                                //正常終了時
                                break;
                        }
                    }
                }
            }
        }
    }
    // 自身がグループから抜ける時
    if (meDel == '1') {
        if (false === self.exception.check(
                self.master.del(
                    "MK_member",
                    "", [
                        "memberID =N'" + staffID + "'",
                        "groupID ='" + groupID + "'",
                        "companyID =N'" + companyID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOff,
                "101820",
                "自身がグループから抜けるに失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        if (false === self.exception.check(
                self.master.del(
                    "MK_history",
                    "", [
                        "category = 1",
                        "staffID =N'" + staffID + "'",
                        "externNo ='" + groupID + "'",
                        "companyID =N'" + companyID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOff,
                "101821",
                "自身がグループから抜けるに失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        if (false === self.msgEntry(groupID, self.staffName + "さんが退席しました。", companyID)) {
            return false;
        }
    }
    return true;
};
//*****************************************
// グループの削除
//*****************************************
MainClass1018.prototype.groupDel = function(companyID, groupID, staffID) {
    const self = this;
    // 各データの消去
    // グループの削除
    if (false === self.exception.check(
            self.master.del(
                "MK_group",
                "", [
                    "groupID ='" + groupID + "'",
                    "companyID =N'" + companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101822",
            "グループの削除に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    if (false === self.exception.check(
            self.master.del(
                "MK_chat",
                "", [
                    "groupID ='" + groupID + "'",
                    "companyID =N'" + companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101823",
            "会話の削除に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    if (false === self.exception.check(
            self.master.del(
                "MK_history",
                "", [
                    "category = 1",
                    "externNo ='" + groupID + "'",
                    "companyID =N'" + companyID + "'"
                ]
            ),
            ExceptionServerOn,
            ExceptionSystemOn,
            "101824",
            "会話履歴の削除に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // DB登録されたメンバーの取得
    let memberList = null;
    if (staffID != "") {
        memberList = self.master.read(
            "SELECT" +
            "    memberID" +
            " FROM" +
            "    MK_member" +
            " WHERE" +
            "    (companyID = N'" + companyID + "')  AND" +
            "    (groupID = '" + groupID + "')"
        );
        if (false === self.exception.check(
                memberList,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101825",
                "DB登録されたメンバーの取得に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
    }
    if (memberList != null) {
        if (false === self.exception.check(
                self.master.del(
                    "MK_member",
                    "", [
                        "groupID ='" + groupID + "'",
                        "companyID =N'" + companyID + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOn,
                "101826",
                "DB登録されたメンバーの削除に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        for (let i in memberList) {
            // 自分以外のメンバーに通知
            if (staffID != memberList[i].memberID) {
                // 端末情報の取得
                const tanmatuData = self.master.read(`
                    SELECT
                        registerID,
                        name,
                        idm
                    FROM MK_smartPhone
                    WHERE
                        staffID=N'${memberList[i].memberID}' AND
                        companyID=N'${companyID}' AND
                        name<>N'card' AND
                        registerID<>N'' AND
                        registerID<>N'logout' AND
                        registerID IS NOT NULL
                `);
                if (false === self.exception.check(
                        tanmatuData,
                        ExceptionServerOn,
                        ExceptionSystemOff,
                        "101827",
                        "DB登録されたメンバーの削除に失敗しました。",
                        ExceptionParamToMenu
                    )) {
                    return false;
                }
                if (tanmatuData != null) {
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
                        memberList[i].memberID,
                        "グループが削除されました",
                        "mode=2&groupID=" + groupID,
                        groupID,
                        nameData,
                        false
                    );
                }
            }
        }
    }
}
MainClass1018.prototype.buttonChange = function() {
    const self = this;
    if (self.groupID != "new") {
        self.sel("#update").attr('disabled', false);
        // self.sel("#delete").attr('disabled', true);
    }
}