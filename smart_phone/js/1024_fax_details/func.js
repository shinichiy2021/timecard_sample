"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加fしました。
//******************************************************************************
//****************************************
// 自作セレクターメソッド
//****************************************
MainClass1024.prototype.sel = function(selecter) {
    return $(".view1024 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1024.prototype.ev = function(eventName, selecter, func) {
    $(".view1024").on(eventName, selecter, func);
};
//*************************************
// ブックマーク切り替え
//*************************************
MainClass1024.prototype.bookMarkEvent = function(selecter) {
    const self = this;
    const thisID = selecter.attr("id");
    const faxID = thisID.slice(3);
    const pTag = self.sel("#" + thisID).children('p');
    // ブックマークの状態を取得
    const bookm = pTag.attr("id");
    // FAXフラグを取得
    const thisFlag = self.sel("#" + thisID).find('input').val();
    // ブックマークのテキスト表示のIDを取得
    // const textID = self.sel("#" + bookm).children('p').attr("id");
    // ◇☆マークが白の場合
    if (bookm == "bookMarkOffButton") {
        // ・マッピング情報４ .FAXお気に入りフラグ更新処理（【お気に入りにする】）を行う。
        const editFlg = self.master.edit(
            "MK_historyOption",
            false, [
                "okiniFlag"
            ], [
                "'" + 1 + "'"
            ], [
                "MK_historyOption.category='" + 6 + "'",
                "MK_historyOption.externNo='" + faxID + "'",
                "MK_historyOption.companyID=N'" + self.companyID + "'",
                "MK_historyOption.staffID = N'" + self.staff + "'"
            ]
        );
        switch (editFlg) {
            case false:
                return false;
            case null:
                return null;
            default:
                break;
        }
        // ◇faxFlag = 1(手動送信) の場合
        if (thisFlag == "1") {
            //    ・【赤★重要】と表示する
            self.sel("#" + thisID).children(".material-icons").attr('id', 'bookMarkRdButton');
            self.sel("#" + thisID).children(self.sel("#" + bookm)).text("star");
            self.sel("#" + thisID).children(".bm").text('重要');
        } else {
            //  ◇faxFlag = 0(自動送信)の場合
            //    ・【黄☆お気に入り】と表示する
            self.sel("#" + thisID).children(".material-icons").attr('id', 'bookMarkYLButton');
            self.sel("#" + thisID).children(self.sel("#" + bookm)).text("star");
            self.sel("#" + thisID).children(".bm").text('お気に入り');
        }
    } else {
        // ◇赤★or黄☆の場合
        //  ・マッピング情報４ .FAXお気に入りフラグ更新処理（【お気に入りにしない】）を行う。
        const editFlg = self.master.edit(
            "MK_historyOption",
            false, [
                "okiniFlag"
            ], [
                "'" + 0 + "'"
            ], [
                "MK_historyOption.category='" + 6 + "'",
                "MK_historyOption.externNo='" + faxID + "'",
                "MK_historyOption.companyID=N'" + self.companyID + "'",
                "MK_historyOption.staffID = N'" + self.staff + "'"
            ]
        );
        switch (editFlg) {
            case false:
                return false;
            case null:
                return null;
            default:
                break;
        }
        // 【白☆】と表示する
        if (bookm == "bookMarkRdButton") {
            self.sel("#" + thisID).children(".material-icons").attr('id', 'bookMarkOffButton');
            self.sel("#" + thisID).children(self.sel("#" + bookm)).text("star_border");
            self.sel("#" + thisID).children(".bm").text('');
        } else {
            self.sel("#" + thisID).children(".material-icons").attr('id', 'bookMarkOffButton');
            self.sel("#" + thisID).children(self.sel("#" + bookm)).text("star_border");
            self.sel("#" + thisID).children(".bm").text('');
        }
    }
    return true;
};
//*************************************
// 既読処理
//*************************************
MainClass1024.prototype.faxReadEvent = function(selecter) {
    const self = this;
    // 未読バッチの取得
    const midoku = selecter.parent('div').children('.icon').children('.badge').children('span').attr('class');
    // faxIDの取得
    let faxID = selecter.parent().find('.bmButton').attr('id');
    faxID = faxID.slice(3);
    if (midoku != undefined) {
        // 既読フラグを立てる
        if (false === self.exception.check(
                self.master.edit(
                    "MK_historyOption",
                    false, [
                        "flag"
                    ], [
                        "'" + 1 + "'"
                    ], [
                        "MK_historyOption.category='" + 6 + "'",
                        "MK_historyOption.externNo='" + faxID + "'",
                        "MK_historyOption.companyID=N'" + self.companyID + "'",
                        "MK_historyOption.staffID = N'" + self.staff + "'"
                    ]
                ),
                ExceptionServerOn,
                ExceptionSystemOn,
                "102403",
                "既読処理ができませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        // 未読バッジを消す
        selecter.parent('div').children('.icon').children('.badge').children('span').remove();
    }
};