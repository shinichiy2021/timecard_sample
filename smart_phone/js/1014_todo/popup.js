"use strict";
//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/04/26  ポップアップ処理を分離しました。
//********************************************************************
MainClass1014.prototype.buttonSelect = function() {
    const self = this;
    // ステイタスダイアログの処理
    self.ev('click', '#info1', function() {
        self.selectButton = self.sel("#info1").val();
        self.sel("#info1").css('background-color', '#66C9DC');
        self.sel("#info2").css('background-color', 'white');
        self.sel("#info3").css('background-color', 'white');
    });
    self.ev('click', '#info2', function() {
        self.selectButton = self.sel("#info2").val();
        self.sel("#info1").css('background-color', 'white');
        self.sel("#info2").css('background-color', '#66C9DC');
        self.sel("#info3").css('background-color', 'white');
    });
    self.ev('click', '#info3', function() {
        self.selectButton = self.sel("#info3").val();
        self.sel("#info1").css('background-color', 'white');
        self.sel("#info2").css('background-color', 'white');
        self.sel("#info3").css('background-color', '#66C9DC');
    });
};
MainClass1014.prototype.statusChange = function(clickId, todoID, myStatus) {
    const self = this;
    const today = self.today;
    // 空白エラーチェック
    if (self.selectButton == "") {
        alert("状態が選択されていません。");
        return false;
    }
    // 表示中ステイタスと同一で無い時以下の処理を実施する
    if (myStatus != self.selectButton) {
        // 存在チェック
        const sonzaiTodo = self.master.read(
            "SELECT" +
            "     todoID" +
            " FROM MK_todo" +
            " WHERE" +
            "     todoID ='" + todoID + "' AND" +
            "     companyID = N'" + self.companyID + "'"
        );
        if (false === self.exception.check(
                sonzaiTodo,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101404",
                "ステータスの更新に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        let msg = '';
        let hairetuA;
        let hairetuB;
        const status = parseInt(self.selectButton, 10);
        switch (status) {
            case 5:
                msg = "【対応中】に変更されました";
                hairetuA = ["statusCD", "startDate"];
                hairetuB = ["'5'", "N'" + today + "'"];
                break;
            case 6:
                msg = "【保留】に変更されました";
                hairetuA = ["statusCD"];
                hairetuB = ["'6'"];
                break;
            case 7:
                msg = "【確認待ち】に変更されました";
                hairetuA = [ "statusCD", "endDate" ];
                hairetuB = [ "'7'", "N'" + today + "'" ];
                break;
            case 8:
                msg = "【もう一度】に変更されました";
                hairetuA = [ "statusCD", "startDate", "endDate", "finishDate" ];
                hairetuB = [ "'8'", "N''", "N''", "N''" ];
                break;
            case 9:
                msg = "【完了】に変更されました";
                hairetuA = [ "statusCD", "finishDate" ];
                hairetuB = [ "'9'", "N'" + today + "'" ];
                break;
            default:
                Materialize.toast('更新に失敗しました。', 3000);
                spaHash('#1013', 'reverse');
                return false;
        }
        const editFlg = self.master.edit(
            "MK_category",
            "",
            hairetuA,
            hairetuB, [
                "todoID ='" + todoID + "'",
                "staffID = N'" + self.selectWorker + "'",
                "companyID = N'" + self.companyID + "'"
            ]
        );
        if (false === self.exception.check(
                editFlg,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101405",
                "ステータスの更新に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        // 更新成功
        Materialize.toast(msg, 3000);
        // チェックボックスがチェックされていたら、対象者に通知する。
        if (self.sendCheck == true) {
            let sendList;
            let idm;
            // let registerID;
            // let smartPhoneName;
            let sendStaff;
            if (self.sendFlag == "oder") {
                // 作成者に通知の時
                // 作成者のスマホ情報を取得
                sendStaff = self.selectOder;
            } else {
                // やる人に通知の時
                sendStaff = self.selectWorker;
            }
            sendList = self.master.read(`
                SELECT
                    idm,
                    registerID,
                    name
                FROM MK_smartPhone
                WHERE
                    staffID=N'${sendStaff}' AND
                    companyID=N'${self.companyID}' AND
                    name<>N'card' AND
                    registerID<>N'' AND
                    registerID<>N'logout' AND
                    registerID IS NOT NULL
            `);
            switch (self.exception.check(
                sendList,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101406",
                "通知端末情報取得の失敗しました。",
                ExceptionParamToMenu
            )) {
                case false:
                    return false;
                case null:
                    break;
                case true:
                    const regData = [];
                    const nameData = [];
                    for (let s in sendList) {
                        regData.push(sendList[s].registerID);
                        nameData.push(sendList[s].name);
                    }
                    idm = sendList[0].idm;
                    commonPushFunc(
                        idm,                    //   引数１：idm        ： カード情報
                        regData,           //   引数２：registerID ： スマホ識別番号
                        self.companyID,
                        sendStaff,        //   引数３：staffID    ： スタッフ番号
                        "やることリストの進捗状態が変更されました", //   引数４：通知メッセージ内容
                        "mode=3",       //   引数５：通知モード（1：チャット、2：グループリスト、３：やることリスト、4：お知らせ）
                        "",                        //   引数６：対象グループID
                        nameData,       //   引数７：スマートフォンの種類
                        false
                    );
                    break;
            }
        }
        self.sel('#modal1').modal('close');
        self.ListDisplay(
            self.staff,
            self.companyID,
            self.strWhere
        );
        self.sel(".accordionIn").hide();
    }
};