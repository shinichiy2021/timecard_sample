"use strict";
//***********************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//****************************************
// 自作セレクターメソッド
//****************************************
MainClass1004.prototype.sel = function(selecter) {
    return $(".view1004 " + selecter);
}
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1004.prototype.ev = function(eventName, selecter, func) {
    $(".view1004").on(eventName, selecter, func);
}
//---------------------------------------
// 端末情報の取得
// 引数
//---------------------------------------
MainClass1004.prototype.getRegisterInfo = function (registerID) {
    const self = this;
    const registerData = self.database.getProcedures(
        'mappingGetRegisterInfo',
        [
            registerID,
        ],
    )
    // 取得ができなかった場合
    switch (registerData) {
        case false:
            Materialize.toast('E100402 : 端末情報の取得に失敗しました。', 3000);
            return false;
        case null:
            // Materialize.toast('端末情報の取得に失敗しました。', 3000);
            return false;
        default:
            self.admCD = registerData[0].admCD;
            self.staffName = registerData[0].name;
    }
}
//---------------------------------------
// showClock1
// 引数
//---------------------------------------
MainClass1004.prototype.showClock1 = function () {
    const self = this;
    const nowDate = new Date();
    // 日付を表示する
    self.sel("#ymd").html(dateToFormatString(nowDate, '%M%月%D%日(%w%)'));
}
//---------------------------------------
// やることの未読数の取得
// 引数
//---------------------------------------
MainClass1004.prototype.getBadgeTodo = function () {
    const self = this;
    self.database.getFetch(
        'mappingGetTodoHistoryCount',
        [
            self.companyID,
            self.staff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            self.todoMidokuCount = parseInt(data[0].noRead, 10);
            if (self.todoMidokuCount >= 100) {
                self.todoMidokuCount = 99;
            }
            if (self.todoMidokuCount > 0) {
                self.sel("#todoIcon").html(
                    _.template(self.sel("#badge").html())({
                        className: "red",
                        badgeCount: self.todoMidokuCount
                    })
                );
            }
        })
        .catch(() => {
        })
}
//---------------------------------------
// 仲間と会話の未読数の取得
// 引数 : なし
//---------------------------------------
MainClass1004.prototype.getBadgeChat = function () {
    const self = this;
    self.database.getFetch(
        'mappingGetChatHistoryCount',
        [
            self.companyID,
            self.staff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            // 仲間と会話の未読数の初期表示
            self.chatMidokuCount = parseInt(data[0].noRead, 10);
            if (self.chatMidokuCount >= 100) {
                self.chatMidokuCount = 99;
            }
            if (self.chatMidokuCount > 0) {
                self.sel("#chatIcon").html(
                    _.template(self.sel("#badge").html())({
                        className: "red",
                        badgeCount: self.chatMidokuCount
                    })
                );
            }
        })
        .catch(() => {
            // Materialize.toast('アクセスに失敗しました。ネットワークをご確認ください。', 3000);
        })
}
//---------------------------------------
// 申請したカウントを取得する
// 引数 : なし
//---------------------------------------
MainClass1004.prototype.getBadgeSinsei = function () {
    const self = this;
    self.database.getFetch(
        'mappingGetSinseiCount',
        [
            self.companyID,
            self.staff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            // 初期表示
            self.todokedeCount = parseInt(data[0].syoninMachi, 10);
            if (self.admCD < 2) {
                if (self.todokedeCount >= 100) {
                    self.todokedeCount = 99;
                }
                if (self.todokedeCount > 0) {
                    self.sel("#sinseiIcon").html(
                        _.template(self.sel("#badge").html())({
                            className: "red",
                            badgeCount: self.todokedeCount
                        })
                    );
                }
            } else {
                self.sel("#sinseiArea").remove();
            }
        })
        .catch(() => {
        })
}
//---------------------------------------
// FAXのアイコン、バッチを表示する処理
// 引数 : なし
//---------------------------------------
MainClass1004.prototype.showFaxIconBadge = async function () {
    const self = this;
    let faxDisplayData = null
    await self.database.getFetch(
        'mappingGetFaxInfo',
        [
            self.companyID,
            self.staff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            faxDisplayData = data
        })
        .catch(() => {
            faxDisplayData = false
        })
    // 取得ができなかった場合
    switch (faxDisplayData) {
        case false:
            return false;
        case null:
            Materialize.toast('E100403 : FAX送信の受信履歴の取得に失敗しました。', 3000);
            return false;
        default:
            self.faxRec = faxDisplayData[0].faxRec;
    }
    if ('-1' === self.faxRec) {
        // FAXアイコンを表示しない
        return true
    } else {
        let faxRirekiCount = null
        await self.database.getFetch(
            'mappingCountFaxHistory',
            [
                self.companyID,
                self.staff,
            ],
        ).then(response => response.json())
            .then(data => {
                console.log('Success:', data)
                faxRirekiCount = data
            })
            .catch(() => {
                Materialize.toast('E100404 : FAX送信の受信履歴の取得に失敗しました。', 3000);
                faxRirekiCount = false
            })
        // 取得ができなかった場合
        switch (faxRirekiCount) {
            case false:
                return false;
            case null:
                self.faxRirekiCount = 0
                break
            default:
                self.faxRirekiCount = parseInt(faxRirekiCount[0].fax, 10);
        }
        if (self.faxRirekiCount > 0) {
            /////////////////////////////////////////////
            // 2018/08/21
            // yamazaki
            // 手動FAXのカウント取得
            // 【DB】Group ByしてCOUNTすると０件が取得できない(NULLが返ってくる)
            // 参考サイト：http://www.ksakae1216.com/entry/2017/02/17/063000
            // 2018/11/20
            // yamazaki
            // 同期通信でよいです
            /////////////////////////////////////////////
            self.database.getFetch(
                'mappingCountFaxManual',
                [
                    self.companyID,
                    self.staff,
                ],
            ).then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                    // countFaxSyudo = data
                    // 取得ができなかった場合
                    switch (data) {
                        case null:
                            self.faxCount = 0
                            break
                        default:
                            self.faxCount = parseInt(data[0].syudo, 10);
                    }
                })
                .catch(() => {
                    Materialize.toast('E100405 : 手動FAXのカウント取得に失敗しました。', 3000);
                })
            /////////////////////////////////////////////
            // 2018/08/21
            // yamazaki
            // 自動FAXのカウント取得
            // 【DB】Group ByしてCOUNTすると０件が取得できない(NULLが返ってくる)
            // 参考サイト：http://www.ksakae1216.com/entry/2017/02/17/063000
            // 2018/11/20
            // yamazaki
            // 同期通信でよいです
            /////////////////////////////////////////////
            // let countFaxJidou = null
            self.database.getFetch(
                'mappingCountFaxAutomatic',
                [
                    self.companyID,
                    self.staff,
                ],
            ).then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                    switch (data) {
                        case null:
                            self.faxAutoCount = 0
                            break
                        default:
                            self.faxAutoCount = parseInt(data[0].jido, 10);
                    }
                })
                .catch(() => {
                    Materialize.toast('E100406 : 自動FAXのカウント取得に失敗しました。', 3000);
                })
        }
    }
    self.initShowFax();
}
//---------------------------------------
// GPSのアイコン、バッチを表示する処理
// 引数 : なし
//---------------------------------------
MainClass1004.prototype.showGPSIconBadge = async function () {
    const self = this;
    self.database.getFetch(
        'mappingGetGPSInfo',
        [
            self.companyID,
            self.staff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            switch (data) {
                case null:
                    self.sel("#gpsArea").hide();
                    break
                default:
                    self.gpsFlg = parseInt(data[0].GPS, 10);
                    //-------------------------------------------
                    // GPS打刻の表示・非表示切り替え
                    //-------------------------------------------
                    if (self.gpsFlg == 0) {
                        self.sel("#gpsArea").hide();
                    } else if (self.gpsFlg == 1) {
                        self.sel("#gpsArea").show();
                    }
            }
        })
        .catch(() => {
            Materialize.toast('E100403 : GPS打刻使用のフラグ取得に失敗しました。', 3000);
            return false;
        })
}