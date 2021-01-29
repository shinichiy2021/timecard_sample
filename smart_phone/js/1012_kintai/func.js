"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1012.prototype.sel = function(selecter) {
    return $(".view1012 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1012.prototype.ev = function(eventName, selecter, func) {
    $(".view1012").on(eventName, selecter, func);
};
//---------------------------------------
// リストの表示関数
// 引数
// 戻り値
//---------------------------------------
MainClass1012.prototype.listDisplay = function(ymdA, ymdB, sime) {
    const self = this;
    const w = ["日", "月", "火", "水", "木", "金", "土"];
    const sd = new Date(ymdA);
    const ed = new Date(ymdB);
    const intSime = parseInt(sime, 10);
    // メンバーデータの取り直し
    const memberData = self.memberData;
    // 対象スタッフの該当月の勤怠データを取得する
    const kintaiList = self.master.read(
        "SELECT" +
        "    ymd," +
        "    kintaiNo," +
        "    youbi," +
        "    ISNULL(inOffice,'') AS inOffice," +
        "    outOffice," +
        "    restTime," +
        "    ISNULL(underTime,'') AS underTime," +
        "    ISNULL(overTime,'') AS overTime," +
        "    ISNULL(inTime,'') AS inTime," +
        "    ISNULL(outTime,'') AS outTime," +
        "    ISNULL((underTime + outTime + overTime),'') AS totalRoudou," +
        "    ISNULL(maruInOffice, '') AS maruInOffice," +
        "    ISNULL(maruOutOffice, '') AS maruOutOffice" +
        " FROM MK_kintai" +
        " WHERE" +
        "    MK_kintai.ymd>='" + ymdA + "' AND" +
        "    MK_kintai.ymd<='" + ymdB + "' AND" +
        "    MK_kintai.staffID=N'" + self.staff + "' AND" +
        "    MK_kintai.companyID=N'" + self.companyID + "'"
    );
    if (false === self.exception.check(
            kintaiList,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101204",
            "対象スタッフの該当月の勤怠データを取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 対象スタッフの休日カレンダーデータを取得する
    const calHoliday = self.master.read(
        "SELECT" +
        "    MK_calendar.calYmd," +
        "    MK_calendar.holiday" +
        " FROM MK_calendar" +
        " INNER JOIN MK_calManager ON" +
        "    MK_calendar.number=MK_calManager.number AND" +
        "    MK_calendar.companyID=MK_calManager.companyID" +
        " WHERE" +
        "    MK_calManager.companyID=N'" + self.companyID + "' AND" +
        "    MK_calendar.number= (SELECT" +
        "                          calendarID" +
        "                         FROM MK_staff" +
        "                         WHERE companyID=N'" + self.companyID + "' AND" +
        "                               staffID=N'" + self.staff + "') AND" +
        "    MK_calendar.calYmd>='" + ymdA + "' AND" +
        "    MK_calendar.calYmd<='" + ymdB + "'" +
        " GROUP BY" +
        "    MK_calendar.calYmd," +
        "    MK_calendar.holiday"
    );
    if (false === self.exception.check(
            calHoliday,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101205",
            "対象スタッフの休日カレンダーデータ取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    // 申請データの取得
    const sinseiData = self.master.read(
        "SELECT" +
        "    sinseiTable.sinseiNo," +
        "    CASE sinseiTable.sinseiKubun WHEN '0' THEN '打刻修正' WHEN '1' THEN '打刻修正' WHEN '2' THEN '打刻修正' ELSE todokedeTable.todokedeName END AS sinseiName," +
        "    sinseiTable.shoninFlag," +
        "    sinseiTable.taishouDate" +
        " FROM MK_sinsei AS sinseiTable" +
        " LEFT OUTER JOIN MK_todokede AS todokedeTable ON" +
        "    sinseiTable.todokedeID=todokedeTable.todokedeID AND" +
        "    sinseiTable.companyID=todokedeTable.companyID" +
        " WHERE" +
        "    sinseiTable.taishouDate>='" + ymdA + "' AND" +
        "    sinseiTable.taishouDate<='" + ymdB + "' AND" +
        "    sinseiTable.sinseiStaffID=N'" + self.staff + "' AND" +
        "    sinseiTable.companyID=N'" + self.companyID + "'" +
        " ORDER BY" +
        "    sinseiTable.taishouDate ASC," +
        "    sinseiTable.id DESC"
    );
    if (false === self.exception.check(
            sinseiData,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101206",
            "申請データの取得に失敗しました。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    self.sel('#list').empty();
    // HTMLへの書き込み
    // 日付の取得
    const endDate = getLastDayOfMonth(sd).getDate();
    // 開始月末
    let month = sd.getMonth() + 1;
    // 開始月
    let year = sd.getFullYear();
    // 開始年
    const syuryobi = getLastDayOfMonth(ed).getDate();
    let endFlg = false;
    // 締め日まで1月分ループする
    const day = ymdA.split("/");
    let kaisibi = parseInt(day[2], 10);
    if (sime == 30 && self.sel("#ym").html() == year + "年03" + "月分") {
        kaisibi = 1;
        endFlg = true;
    }
    // 当日日付の取得
    const nowYMD = new Date();
    const nowYear = nowYMD.getFullYear();
    const nowDate = nowYMD.getDate();
    const nowMonth = nowYMD.getMonth() + 1;
    let inputFlg = 0;
    for (let i = kaisibi; true; i++) {
        let $shift_th = '<th class="value shift"></th>';
        if (i > endDate) {
            if (month == 12) {
                year = year + 1;
                month = 1;
                i = 0;
            } else {
                month = month + 1;
                i = 0;
            }
        }
        // DBに勤怠リストが存在するかの確認
        const ymd = year + "/" + addZero(month) + "/" + addZero(i);
        // 曜日の取得
        const myDay = new Date(year, month - 1, i);
        const youbi = w[myDay.getDay()];
        let weekColor;
        weekColor = '<th class="value listDate">' + month + "/" + i + "(" + youbi + ")" + '</th>';
        if (calHoliday != null) {
            for (let p = 0; p < calHoliday.length; p++) {
                if (calHoliday[p].calYmd == year + "/" + addZero(month) + "/" + addZero(i)) {
                    if (calHoliday[p].holiday == "0") {
                        weekColor = '<th class="value listDate weekColor">' + month + "/" + i + "(" + youbi + ")" + '</th>';
                    } else {
                        weekColor = '<th class="value listDate weekBlue">' + month + "/" + i + "(" + youbi + ")" + '</th>';
                    }
                    break;
                } else {
                    weekColor = '<th class="value listDate">' + month + "/" + i + "(" + youbi + ")" + '</th>';
                }
            }
        } else {
            weekColor = '<th class="value listDate">' + month + "/" + i + "(" + youbi + ")" + '</th>';
        }
        if (year == nowYear && month == nowMonth && i == nowDate) {
            weekColor = '<th class="value listDate nowColor">' + month + "/" + i + "(" + youbi + ")" + '</th>';
        }
        let sinseiFlg = '';
        // 申請データがあるかどうか確認
        if (sinseiData != null) {
            for (let sdcount = 0; sdcount < sinseiData.length; sdcount++) {
                // 挿入日に申請データがある場合
                let checkFlag = true;
                if (sdcount != 0) {
                    if (sinseiData[sdcount].taishouDate == sinseiData[sdcount - 1].taishouDate) {
                        checkFlag = false;
                    }
                }
                if (checkFlag == true) {
                    if (ymd == sinseiData[sdcount].taishouDate) {
                        const sdNo = sinseiData[sdcount].sinseiNo;
                        sinseiFlg = 1;
                        if (sinseiData[sdcount].shoninFlag == 0) {
                            // 確認待ちの時
                            // 背景色を変えて押下できるようにする
                            weekColor = '<th class="value listDate wait">';
                        } else if (sinseiData[sdcount].shoninFlag == 1) {
                            // 確認済みの時
                            // 背景色を変えて押下できるようにする
                            weekColor = '<th class="value listDate syonin">';
                        } else {
                            // 取り消しの時
                            // 背景色を変えて押下できるようにする
                            weekColor = '<th class="value listDate kyakka">';
                        }
                        weekColor +=`
                            <a href="javascript:void(0)" class="sinseiDate">
                            ${ month }/${ i }(${ youbi })
                            </a>
                            <input class="value sinseiNo" type="hidden" value="${ sdNo }">
                            <input class="value shoninFlag" type="hidden" value="${ sinseiData[sdcount].shoninFlag }">
                            </th>
                        `;
                    }
                }
            }
        }
        // 入力できるかできないかのフラグ
        const todayFlg = new Date();
        const ymdFlg = new Date(ymd);
        if (todayFlg < ymdFlg) {
            inputFlg = 1;
        }
        const arrayDay = [];
        let countDay = 0;
        let rest = '';
        let restTime = '';
        // リスト要素の数だけ書き出しのループ
        for (let j in kintaiList) {
            if (ymd == kintaiList[j].ymd) {
                //出勤60進化
                const inOffice = kintaiList[j].inOffice;
                const inT = to60(inOffice).hours;
                const inM = to60(inOffice).minutes;
                //出勤丸め
                const maruInOffice = kintaiList[j].maruInOffice;
                //退勤60進化
                const outOffice = kintaiList[j].outOffice;
                let outT = '';
                let outM = '';
                let forgetColor = '';
                if (outOffice != null) {
                    outT = to60(outOffice).hours;
                    outM = to60(outOffice).minutes;
                    forgetColor = '<td class = "value outOffice waku">' + outT + ":" + outM + '</td>';
                } else {
                    if (inOffice != null) {
                        if (self.today != ymd) {
                            forgetColor = '<td class = "value outOffice forgetColor waku">:</td>';
                        } else {
                            forgetColor = '<td class = "value outOffice waku">:</td>';
                        }
                    } else {
                        forgetColor = '<td class = "value outOffice waku">:</td>';
                    }
                }
                if (outT == 0 && outM == "00") {
                    if (self.today != ymd) {
                        forgetColor = '<td class = "value outOffice waku">' + outT + ":" + outM + '</td>';
                    }
                }
                // 退勤丸め
                const maruOutOffice = kintaiList[j].maruOutOffice;
                // 休憩を60進して分合計に変換
                if (j - 1 == -1) {
                    // 休憩を60進して分合計に変換
                    restTime = kintaiList[j].restTime;
                    if (restTime != null) {
                        if (restTime.match(/E/)) {
                            restTime = parseInt(restTime, 10) / 100;
                        }
                        const restT = parseInt(to60(restTime).hours, 10) * 60;
                        const restM = parseInt(to60(restTime).minutes, 10);
                        rest = restT + restM;
                    } else {
                        rest = '';
                    }
                } else {
                    restTime = kintaiList[j].restTime;
                    if (restTime != null) {
                        if (restTime.match(/E/)) {
                            restTime = parseInt(restTime, 10) / 100;
                        }
                        if (parseInt(kintaiList[j].kintaiNo, 10) > 0) {
                            const restT = parseInt(to60(restTime).hours, 10) * 60;
                            const restM = parseInt(to60(restTime).minutes, 10);
                            rest = (restT + restM);
                            if (rest < 0) {
                                rest = 0;
                            }
                        } else if (parseInt(kintaiList[j].kintaiNo, 10) == 0) {
                            const restT = parseInt(to60(restTime).hours, 10) * 60;
                            const restM = parseInt(to60(restTime).minutes, 10);
                            rest = restT + restM;
                        }
                    } else {
                        rest = "";
                    }
                }
                // 所定の60進化
                const inTime = kintaiList[j].inTime;
                const shoteiT = to60(inTime).hours;
                const shoteiM = to60(inTime).minutes;
                const overTime = kintaiList[j].overTime;
                const overT = to60(overTime).hours;
                const overM = to60(overTime).minutes;
                // 労働時間の60進化
                const underTime = kintaiList[j].underTime;
                const totalT = to60(underTime).hours;
                const totalM = to60(underTime).minutes;
                const startTime = memberData[0].startWork;
                // シフト出勤時間
                const shiftShow = "";
                // 表示用
                $shift_th = "";
                if (calHoliday != null) {
                    for (let p = 0; p < calHoliday.length; p++) {
                        if (calHoliday[p].calYmd == year + "/" + addZero(month) + "/" + addZero(i)) {
                            $shift_th = '<th class="value shift holidayColor' + calHoliday[p].holiday + '">' + shiftShow + '</th>';
                            // 当日のシフト
                            break;
                        } else {
                            $shift_th = '<th class="value shift">' + shiftShow + '</th>';
                            // 当日のシフト
                        }
                    }
                } else {
                    $shift_th = '<th class="value shift">' + shiftShow + '</th>';
                    // 当日のシフト
                }
                const $kintaiDom =`
                    ${ $shift_th }
                    <td class="value inOffice waku">${ inT }:${ inM }</td>
                    ${forgetColor}
                    <td class="value restTime waku">${ rest }</td>
                    <th class="value inTime">${ shoteiT }:${ shoteiM }</th>
                    <th class="value overTime">${ overT }:${ overM }</th>
                    <th class="value underTime">${ totalT }:${ totalM }</th>
                    <input class="value startMarume" type="hidden" value="${ maruInOffice }">
                    <input class="value endMarume" type="hidden" value="${ maruOutOffice }">
                    <input class="value marumeS" type="hidden" value="${ memberData[0].startMarume }">
                    <input class="value marumeE" type="hidden" value="${ memberData[0].endMarume }">
                    <input class="value startWork" type="hidden" value="${ startTime }">
                    <input class="value kintaiNo" type="hidden" value="${ kintaiList[j].kintaiNo }">
                    <input class="value kintaiYmd" type="hidden" value="${ kintaiList[j].ymd }">
                    </tr>
                `;
                // 同日データの取得
                arrayDay[countDay++] = $kintaiDom;
            }
        }
        // 申請がない時、または確認済みの時の処理
        if (calHoliday != null && $shift_th == '<th class="value shift"></th>') {
            for (let p = 0; p < calHoliday.length; p++) {
                if (calHoliday[p].calYmd == year + "/" + addZero(month) + "/" + addZero(i)) {
                    $shift_th = '<th class="value shift holidayColor' + calHoliday[p].holiday + '"></th>';
                    // 当日のシフト
                    break;
                } else {
                    $shift_th = '<th class="value shift"></th>';
                    // 当日のシフト
                }
            }
        } else {
            $shift_th = '<th class="value shift"></th>';
            // 当日のシフト
        }
        if (i != 0) {
            if (arrayDay.length != 0) {
                for (let k in arrayDay) {
                    // リスト表示
                    self.sel('#list').append(`
                        <tr class="kou">
                        <th class="delete">
                            <input type="checkbox" class="value removeList">
                        </th>
                        <th class="plusth">
                            <input type="button" class="plus" value="+">
                        </th>
                        ${ weekColor }
                        ${ arrayDay[k] }
                    `);
                }
            } else {
                if (inputFlg == 1) {
                    // リスト表示
                    self.sel('#list').append('<tr class="kou"><th class="delete"></th>' + '<th class="plusth"><input type="button" class="plus" value="+"></th>' + // 日付
                        weekColor + $shift_th + // 当日のシフト
                        '<td class="value inOffice dis"></td>' + '<td class="value outOffice dis"></td>' + '<td class="value restTime dis"></td>' + '<th class="value inTime"></th>' + '<th class="value overTime"></th>' + '<th class="value underTime"></th>' + '<input class="value startMarume" type="hidden">' + //出勤丸め
                        '<input class="value endMarume" type="hidden">' + //退勤丸め
                        '<input class="value marumeS" type="hidden" value=' + memberData[0].startMarume + '>' + //丸め単位出勤
                        '<input class="value marumeE" type="hidden" value=' + memberData[0].endMarume + '>' + //丸め単位退勤
                        '<input class="value startWork" type="hidden" value=' + memberData[0].startWork + '>' + //出勤時間
                        '<input class="value kintaiNo" type="hidden" value="0">' + //勤怠No
                        '<input class="value kintaiYmd" type="hidden" value="' + ymd + '">' + //勤怠YMD
                        '</tr>');
                } else {
                    // リスト表示
                    self.sel('#list').append('<tr class="kou"><th class="delete"></th>' + '<th class="plusth"><input type="button" class="plus" value="+"></th>' + // 日付
                        weekColor + $shift_th + // 当日のシフト
                        '<td class="value inOffice waku">:</td>' + '<td class="value outOffice waku">:</td>' + '<td class="value restTime waku"></td>' + '<th class="value inTime">:</th>' + '<th class="value overTime">:</th>' + '<th class="value underTime">:</th>' + '<input class="value startMarume" type="hidden">' + //出勤丸め
                        '<input class="value endMarume" type="hidden">' + //退勤丸め
                        '<input class="value marumeS" type="hidden" value=' + memberData[0].startMarume + '>' + //丸め単位出勤
                        '<input class="value marumeE" type="hidden" value=' + memberData[0].endMarume + '>' + //丸め単位退勤
                        '<input class="value startWork" type="hidden" value=' + memberData[0].startWork + '>' + //出勤時間
                        '<input class="value kintaiNo" type="hidden" value="0">' + //勤怠No
                        '<input class="value kintaiYmd" type="hidden" value="' + ymd + '">' + //勤怠YMD
                        '</tr>');
                }
            }
        }
        if (intSime == 30 && self.sel("#ym").html() == year + "年02" + "月分" && i == syuryobi) {
            break;
        } else if (intSime == 31 && i == endDate) {
            break;
        } else if (intSime != 31 && i == intSime) {
            break;
        }
    }
};
//============================================
// 日付表示関数
//============================================
MainClass1012.prototype.dateDisplay = function() {
    const self = this;
    const ymdA = self.ymdA;
    const ymdB = self.ymdB;
    const w = ["日", "月", "火", "水", "木", "金", "土"];
    const sd = new Date(ymdA);
    const ed = new Date(ymdB);
    self.sel("#displayDate").html(ymdA + "(" + w[sd.getDay()] + ")～" + ymdB + "(" + w[ed.getDay()] + ")");
    self.ymdA = ymdA;
    self.ymdB = ymdB;
};
//============================================
// 集計部分表示関数
//============================================
MainClass1012.prototype.totalDisplay = function(ymdA, ymdB) {
    const self = this;
    const total = self.master.read(
        "SELECT" +
        "    COUNT(MK_kintai.kintaiNo) AS kinmuDay," +
        "    SUM(CASE WHEN MK_kintai.overTime > 0 then 1 ELSE 0 END) AS outTimeDay," +
        "    ISNULL(SUM(MK_kintai.underTime),'') AS underTime," + //労働合計
        "    ISNULL(SUM(MK_kintai.inTime),'') AS inTime," + //所定合計
        "    ISNULL(SUM(MK_kintai.outTime),'') AS outTime," + //法定休日合計
        "    ISNULL(SUM(MK_kintai.overTime),'') AS overTime," + //所定外合計
        "    ISNULL(SUM(MK_kintai.midnight),'') AS nightTime" + //深夜労働合計
        " FROM MK_kintai" +
        " INNER JOIN MK_staff ON" +
        "    MK_kintai.staffID=MK_staff.staffID AND" +
        "    MK_kintai.companyID=MK_staff.companyID" +
        " WHERE" +
        "    MK_kintai.ymd>='" + ymdA + "' AND" +
        "    MK_kintai.ymd<='" + ymdB + "' AND" +
        "    MK_kintai.staffID=N'" + self.staff + "' AND" +
        "    MK_kintai.companyID=N'" + self.companyID + "'"
    );
    switch (self.exception.check(
        total,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101207",
        "集計部分の取得に失敗しました。",
        ExceptionParamToMenu
    )) {
        case false:
            return false;
        case null:
            //実働日数
            self.sel("#kinmuDay").html("0");
            //休日出勤日数
            self.sel("#HkinmuDay").html("0");
            //実労働合計
            self.sel("#under").html("00:00");
            //所定労働合計
            self.sel("#inTime").html("00:00");
            //所定外勤務合計
            self.sel("#overTime").html("00:00");
            //休日労働合計
            self.sel("#Hwork").html("00:00");
            //休日労働合計
            self.sel("#nightTime").html("00:00");
            //法定休日合計
            self.sel("#outTime").html("00:00");
            break;
        case true:
            // 実働日数
            const workDay = parseFloat(total[0].kinmuDay);
            // 実労働合計の60進化
            const allTime = parseFloat(total[0].underTime);
            const allT = to60(allTime).hours;
            const allM = to60(allTime).minutes;
            // 所定労働合計の60進化
            const totalInTime = parseFloat(total[0].inTime);
            const shoteiInTime = totalInTime;
            const shoteiT = to60(shoteiInTime).hours;
            const shoteiM = to60(shoteiInTime).minutes;
            // 実残業合計の60進化
            const totalZangyo = parseFloat(total[0].overTime);
            const shoteiOverTime = totalZangyo;
            const zangyoT = to60(shoteiOverTime).hours;
            const zangyoM = to60(shoteiOverTime).minutes;
            // 法定休日合計
            const houtei = parseFloat(total[0].outTime);
            const houteiT = to60(houtei).hours;
            const houteiM = to60(houtei).minutes;
            // 実働日数
            self.sel("#kinmuDay").html(workDay);
            // 総合計勤務時間
            self.sel("#under").html(allT + ":" + allM);
            // 所定内勤務時間
            self.sel("#overTime").html(shoteiT + ":" + shoteiM);
            // 所定外勤務時間
            self.sel("#Hwork").html(zangyoT + ":" + zangyoM);
            // 法定休日時間
            self.sel("#outTime").html(houteiT + ":" + houteiM);
            break;
    }
};