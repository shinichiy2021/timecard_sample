"use strict";
//****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/18         仕様変更に伴い表示とパラメータ取得の変更
// 2017/08/22  アラートをフレームワーク統一に変更
// 2017/08/25 muruata やる人のダブりを除く
// 2017/09/01        モーダルエリアの修正
//****************************************************************
MainClass1014.prototype.event = function() {
    const self = this;
    // 送信ボタン押下処理
    self.ev('click', '#send', function() {
        const myStatus = $(this).next(".workerID").next(".wokerStatusCD").val();
        const clickId = $(this);
        if (self.statusChange(clickId, self.todoID, myStatus) == false) {
            return false;
        }
    });
    // 通知するチェックボックスチェンジイベント
    self.ev('change', '#chkInfo', function() {
        if ($(this).is(":checked")) {
            self.sendCheck = true;
        } else {
            self.sendCheck = false;
        }
    });
    // ステイタスダイアログの閉じるボタン押下時
    self.ev('click', '#closeTop', function() {
        self.sel("body").css('overflow', 'auto');
        self.selectButton = "";
        self.sel('#modal1').modal('close');
    });
    // 戻るボタンが押された時
    function back() {
        self.sel("#page").val("todo");
        spaHash('#1013', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
    // 編集アイコン押下時
    self.ev('click', '#edit', function() {
        // todoIDを渡して編集画面開く
        spaHash('#1015', 'normal');
        return false;
    });
    // 自分のステイタス押下時
    self.ev('click', '.myStatus', function() {
        const myStatus = parseInt($(this).parents(".event").find(".strCD").val(), 10);
        if (myStatus == 7 || myStatus == 9) {
            self.sel("body").css('overflow', 'auto');
            self.sel("body").css('position', 'absolute');
        }
        self.selectOder = $(this).parents(".event").find(".oder").val();
        self.selectWorker = self.staff;
        self.sendFlag = "oder";
        // 新着～保留とやり直しの時ダイアログオープン
        self.sel("#info-in").empty();
        if (myStatus <= 6 || myStatus == 8) {
            let $infoHtml = "";
            if (myStatus == 5) {
                $infoHtml =
                    "<section class='info'>" +
                    "<button class='titleButton' id='info2' type='button' value='6'>保留</button>" +
                    "<button class='titleButton' id='info3' type='button' value='7'>作業を終わりました</button>" +
                    "</section>";
            } else
            if (myStatus == 6) {
                $infoHtml =
                    "<section class='info'>" +
                    "<button class='titleButton' id='info1' type='button' value='5'>作業を始めました</button>" +
                    "<button class='titleButton' id='info3' type='button' value='7'>作業を終わりました</button>" +
                    "</section>";
            } else {
                $infoHtml =
                    "<section class='info'>" +
                    "<button class='titleButton' id='info1' type='button' value='5'>作業を始めました</button>" +
                    "<button class='titleButton' id='info2' type='button' value='6'>保留</button>" +
                    "<button class='titleButton' id='info3' type='button' value='7'>作業を終わりました</button>" +
                    "</section>";
            }
            self.sel("#info-in").append($infoHtml);
            self.sel("#info1").css('background-color', 'white');
            self.sel("#info2").css('background-color', 'white');
            self.sel("#info3").css('background-color', 'white');
            self.sel('#modal1').modal('open');
            self.buttonSelect();
        }
    });
    // 管理者モードで作業者のステイタス押下時
    self.ev('click', '.status', function() {
        const myStatus = parseInt($(this).next(".workerID").next(".wokerStatusCD").val(), 10);
        if (myStatus == 7 || myStatus == 9) {
            // バック画面がスクロールしないようにする。
            self.sel("body").css('overflow', 'auto');
            self.sel("body").css('position', 'absolute');
        }
        self.selectOder = $(this).parents(".event").find(".oder").val();
        self.selectWorker = $(this).next(".workerID").val();
        self.sendFlag = "woker";
        // 保留と確認待ちの時ダイアログオープン
        self.sel("#info-in").empty();
        if (myStatus != 9) {
            let $infoHtml = "";
            if (myStatus == 6) {
                $infoHtml =
                    "<section class='info'>" +
                    "<button class='titleButton' id='info2' type='button' value='9'>確認</button>" +
                    "<button class='titleButton' id='info3' type='button' value='8'>もう一度</button>" +
                    "</section>";
                self.sel("#info-in").append($infoHtml);
                self.sel("#info1").css('background-color', 'white');
                self.sel("#info2").css('background-color', 'white');
                self.sel("#info3").css('background-color', 'white');
            } else if (myStatus == 8) {
                $infoHtml =
                    "<section class='info'>" +
                    "<button class='titleButton' id='info1' type='button' value='6'>保留</button>" +
                    "<button class='titleButton' id='info2' type='button' value='9'>確認</button>" +
                    "</section>";
                self.sel("#info-in").append($infoHtml);
                self.sel("#info1").css('background-color', 'white');
                self.sel("#info2").css('background-color', 'white');
                self.sel("#info3").css('background-color', 'white');
            } else {
                $infoHtml =
                    "<section class='info'>" +
                    "<button class='titleButton' id='info1' type='button' value='6'>保留</button>" +
                    "<button class='titleButton' id='info2' type='button' value='9'>確認</button>" +
                    "<button class='titleButton' id='info3' type='button' value='8'>もう一度</button>" +
                    "</section>";
                self.sel("#info-in").append($infoHtml);
                self.sel("#info1").css('background-color', 'white');
                self.sel("#info2").css('background-color', 'white');
                self.sel("#info3").css('background-color', 'white');
            }
            self.sel('#modal1').modal('open');
            self.buttonSelect();
        }
    });
};