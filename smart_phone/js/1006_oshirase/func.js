"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1006.prototype.sel = function(selecter) {
    return $(".view1006 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1006.prototype.ev = function(eventName, selecter, func) {
    $(".view1006").on(eventName, selecter, func);
};
//****************************************
// 詳しく見るクリックイベント
//****************************************
MainClass1006.prototype.browsEv = function(selecter) {
    const self = this;
    // 赤丸表示の場合、赤丸を消す。
    const maru = selecter.parents(".event").find(".redCircle").html();
    if (maru == "●") {
        //赤丸ボタンの削除
        selecter.parents(".event").find(".redCircle").empty();
    }
    // イベントナンバーの取得
    const no = selecter.parents(".event").find(".eventNO").val();
    // 通知履歴のフラグ取得
    const hflag = selecter.parents(".event").find(".flag").val();
    // フラグが0の時アップデート、2の時インサートする。
    if (hflag == 0) {
        if (false === self.exception.check(
                self.editHistory(no),
                ExceptionServerOn,
                ExceptionSystemOn,
                "100602",
                "未読フラグの更新に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
    }
    let midokuCount;
    const midoku = self.master.read(
        "SELECT" +
        "    COUNT(flag) AS midoku" +
        " FROM" +
        "    MK_history" +
        " WHERE" +
        "    externNo = '" + no + "' AND" +
        "    category = 2 AND" +
        "    flag = 0"
    );
    if (false === self.exception.check(
            midoku,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100603",
            "未読者数の再取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 正常終了時
    midokuCount = midoku[0].midoku;
    selecter.parents(".event").find(".AllReadSum").text(midokuCount + '名');
    const subTitle = selecter.parents(".event").find(".subTitle").html();
    const strSubTitle = selecter.parents(".kurasikuMiru").find(".str").val();
    // 他のリストの表示も元に戻す処理
    const $msgList = self.sel("#msgList li");
    $msgList.each(function(index, element) {
        const test = $(element).find(".brows");
        if (test.html() == "表示を戻す▲") {
            test.html("詳しく見る▼");
        }
    });
    // 詳しく見るを表示しない。
    const strBrows = selecter.parents(".event").find(".brows").html();
    if (strBrows == "詳しく見る▼") {
        selecter.parents(".event").find(".brows").html("表示を戻す▲");
    } else {
        selecter.parents(".event").find(".brows").html("詳しく見る▼");
    }
    if (strSubTitle != subTitle) {
        selecter.parents(".event").find(".subTitle").html('');
        selecter.parents(".event").find(".subTitle").append(strSubTitle);
        selecter.parents(".kurasikuMiru").find(".str").val(subTitle);
    }
    // 新着情報を通常情報に変更する。
    const eventname = selecter.parents(".event").find("h1").html();
    if (eventname == "新着情報") {
        selecter.parents(".event").find("h1").html("通常情報");
        selecter.parents(".event").find("h1").attr('class', "normalEvent");
    }
};
//*****************************************
// 編集ボタンクリックイベント
//*****************************************
MainClass1006.prototype.editEv = function(selecter) {
    const self = this;
    // 赤丸表示の場合、赤丸を消す。
    const maru = selecter.parents(".event").find(".redCircle").html();
    if (maru == "●") {
        // 赤丸ボタンの削除
        selecter.parents(".event").find(".redCircle").empty();
        // イベントナンバーの取得
        const no = selecter.parents(".event").find(".eventNO").val();
        // 通知履歴のフラグ取得
        const hflag = selecter.parents(".event").find(".flag").val();
        // フラグが0の時アップデート、2の時インサートする。
        if (hflag == 0) {
            if (false === self.exception.check(
                    self.editHistory(no),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "100604",
                    "未読フラグの更新に失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        } else if (hflag == 2) {
            if (false === self.exception.check(
                    self.entryHistory(no),
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "100605",
                    "未読フラグの既読処理に失敗しました。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
        }
    }
};
//----------------------------------------------
// マッピング情報2
// 既読処理アップデートをする。
//----------------------------------------------
MainClass1006.prototype.editHistory = function(no) {
    const self = this;
    const flag = self.master.edit(
        "MK_history",
        "", ["flag"], ["'1'"], [
            "companyID=N'" + self.companyID + "'",
            "staffID=N'" + self.staff + "'",
            "category='2'",
            "externNo='" + no + "'"
        ]
    );
    return flag;
};
//----------------------------------------------
// マッピング情報3
// 既読処理インサートをする。
//----------------------------------------------
MainClass1006.prototype.entryHistory = function(no) {
    const self = this;
    self.master.entry(
        "MK_history",
        "", [
            "companyID",
            "category",
            "ymdTime",
            "staffID",
            "flag",
            "externNo"
        ], [
            "N'" + self.companyID + "'",
            "'2'",
            "N'" + self.yyyymmdd + "'",
            "N'" + self.staff + "'",
            "'1'",
            "'" + no + "'"
        ]
    );
};