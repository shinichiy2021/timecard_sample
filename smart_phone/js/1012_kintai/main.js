"use strict";
//******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/10 yamazaki 遷移先の新規届出画面にgamenIDの引き渡し処理を追加しました。
// 2017/11/14 yamazaki listDisplay関数をファンクションへ移動しました。
//******************************************************************
MainClass1012.prototype.event = function() {
    const self = this;
    let ymdA = self.ymdA;
    let ymdB = self.ymdB;
    const sime = self.sime;
    const intSime = self.intSime;
    // 年月が変更された時
    self.ev('change', '#ym', function() {
        self.sel("#alert").text("");
        self.sel("#ym").css("border", "");
        let getumatuym = self.sel("#ym").html().split("年");
        const y = parseInt(getumatuym[0], 10);
        getumatuym = getumatuym[1].split("月");
        const m = parseInt(getumatuym[0], 10);
        // changeした月の末日を取得
        const getumatuDate = new Date(y, m, 0);
        const endDate = getumatuDate.getDate();
        const maegetumatuDate = new Date(y, m - 1, 0);
        const maeendDate = maegetumatuDate.getDate();
        if (m == 1 && sime != 31) {
            ymdA = (y - 1) + "/" + 12 + "/" + addZero(intSime + 1);
        } else if (m != 1 && sime != 31) {
            ymdA = y + "/" + addZero(m - 1) + "/" + addZero(intSime + 1);
        }
        if (sime == 31) {
            ymdA = y + "/" + addZero(m) + "/" + addZero(1);
            ymdB = y + "/" + addZero(m) + "/" + addZero(endDate);
        } else {
            ymdB = y + "/" + addZero(m) + "/" + addZero(sime);
        }
        if (sime == 31 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        // 先月の末日が締め日と同じまたは前の日の時
        if (maeendDate <= sime) {
            ymdA = y + "/" + addZero(m) + "/" + "01";
        }
        // 設定締日が30で2月の表示の時
        if (sime == 30 && ymdA == y + "/02/31") {
            ymdA = y + "/03/01";
        }
        if (sime == 30 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        self.ymdA = ymdA;
        self.ymdB = ymdB;
        self.dateDisplay();
        self.totalDisplay(ymdA, ymdB);
        self.listDisplay(ymdA, ymdB, sime);
    });
    // 前月、次月ボタンが押下時
    self.ev('click', '#Prev', function() {
    // $("#Prev").click(function() {
        self.sel("#alert").text("");
        self.sel("#ym").css("border", "");
        let getumatuym = self.sel("#ym").html().split("年");
        let y = parseInt(getumatuym[0], 10);
        getumatuym = getumatuym[1].split("月");
        let m = parseInt(getumatuym[0], 10);
        const str = getumatuym[1].substr(0, 1);
        if (str == 0) {
            m = parseInt(getumatuym[1].substr(1, 1), 10);
        }
        m = m - 1;
        if (m == 0) {
            y = y - 1;
            m = 12;
        }
        // changeした月の末日を取得
        const getumatuDate = new Date(y, m, 0);
        const endDate = getumatuDate.getDate();
        const maegetumatuDate = new Date(y, m - 1, 0);
        const maeendDate = maegetumatuDate.getDate();
        self.sel("#ym").html(y + "年" + m + "月分");
        if (m == 1 && sime != 31) {
            ymdA = (y - 1) + "/" + 12 + "/" + addZero(intSime + 1);
        } else if (m != 1 && sime != 31) {
            ymdA = y + "/" + addZero(m - 1) + "/" + addZero(intSime + 1);
        }
        if (sime == 31) {
            ymdA = y + "/" + addZero(m) + "/" + addZero(1);
            ymdB = y + "/" + addZero(m) + "/" + addZero(endDate);
        } else {
            ymdB = y + "/" + addZero(m) + "/" + addZero(sime);
        }
        if (sime == 31 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        // 先月の末日が締め日と同じまたは前の日の時
        if (maeendDate <= sime) {
            ymdA = y + "/" + addZero(m) + "/" + "01";
        }
        // 設定締日が30で2月の表示の時
        if (sime == 30 && ymdA == y + "/02/31") {
            ymdA = y + "/03/01";
        }
        if (sime == 30 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        self.ymdA = ymdA;
        self.ymdB = ymdB;
        self.dateDisplay();
        self.totalDisplay(ymdA, ymdB);
        self.listDisplay(ymdA, ymdB, sime);
    });
    self.ev('click', '#mNext', function() {
        self.sel("#alert").text("");
        self.sel("#ym").css("border", "");
        let getumatuym = self.sel("#ym").html().split("年");
        let y = parseInt(getumatuym[0], 10);
        getumatuym = getumatuym[1].split("月");
        let m = parseInt(getumatuym[0], 10);
        const str = getumatuym[1].substr(0, 1);
        if (str == 0) {
            m = parseInt(getumatuym[1].substr(1, 1), 10);
        }
        m = m + 1;
        if (m == 13) {
            y = y + 1;
            m = 1;
        }
        // changeした月の末日を取得
        const getumatuDate = new Date(y, m, 0);
        const endDate = getumatuDate.getDate();
        const maegetumatuDate = new Date(y, m - 1, 0);
        const maeendDate = maegetumatuDate.getDate();
        self.sel("#ym").html(y + "年" + m + "月分");
        if (m == 1 && sime != 31) {
            ymdA = (y - 1) + "/" + 12 + "/" + addZero(intSime + 1);
        } else if (m != 1 && sime != 31) {
            ymdA = y + "/" + addZero(m - 1) + "/" + addZero(intSime + 1);
        }
        if (sime == 31) {
            ymdA = y + "/" + addZero(m) + "/" + addZero(1);
            ymdB = y + "/" + addZero(m) + "/" + addZero(endDate);
        } else {
            ymdB = y + "/" + addZero(m) + "/" + addZero(sime);
        }
        if (sime == 31 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        // 先月の末日が締め日と同じまたは前の日の時
        if (maeendDate <= sime) {
            ymdA = y + "/" + addZero(m) + "/" + "01";
        }
        // 設定締日が30で2月の表示の時
        if (sime == 30 && ymdA == y + "/02/31") {
            ymdA = y + "/03/01";
        }
        if (sime == 30 && ymdB == y + "/02/" + addZero(intSime)) {
            ymdB = y + "/02/" + addZero(endDate);
        }
        self.ymdA = ymdA;
        self.ymdB = ymdB;
        self.dateDisplay();
        self.totalDisplay(ymdA, ymdB);
        self.listDisplay(ymdA, ymdB, sime);
    });
    // 戻るボタンが押された時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
    // 申請を出すボタン押下時
    self.ev('click', '#new', function() {
        // 2017/08/10 yamazaki 遷移先の新規届出画面にgamenIDの引き渡し処理を追加しました。
        sessionStorage.setItem('gamenID', '勤怠');
        spaHash('#1011', 'normal');
        return false;
    });
    // 日付項目押下処理
    self.ev('click', '.sinseiDate', function() {
        // 引継ぎ情報のセット
        self.kintaiDate = $(this).parents("tr.kou").find(".kintaiYmd").val();
        if (self.kintaiDate == undefined) {
            self.kintaiDate = $(this).parents("tr.kou").find(".sdData").val();
        }
        // 申請ポップアップの初期化処理
        self.sinseiPop(
            $(this).parents("tr.kou").find(".sinseiNo").val(),
            $(this).parents("tr.kou").find(".shoninFlag").val()
        );
    });
    //****************************************//
    // モーダルの閉じるボタン押下処理
    //****************************************//
    self.ev('click', '#close', function() {
        self.sel('#modal1').modal('close');
    });
};