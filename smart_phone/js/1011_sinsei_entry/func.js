"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1011.prototype.sel = function(selecter) {
    return $(".view1011 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1011.prototype.ev = function(eventName, selecter, func) {
    $(".view1011").on(eventName, selecter, func);
};
//****************************************
// 申請データの登録
//****************************************
MainClass1011.prototype.sinseiSetDB = function(
    sinseiNo,
    companyID,
    sinseiStaffID,
    shoninStaffID,
    kintaiNo,
    shinseiKubun,
    todokedeID,
    shoninFlag,
    sinseiDate,
    taishouDate,
    hayadeFlag,
    inOffice,
    outOffice,
    restTime,
    sinseiRiyu
) {
    const self = this;
    self.setArraySQL.push(
        "INSERT INTO MK_sinsei(" +
        "sinseiNo," +
        "companyID," +
        "sinseiStaffID," +
        "shoninStaffID," +
        "kintaiNo," +
        "sinseiKubun," +
        "todokedeID," +
        "shoninFlag," +
        "sinseiDate," +
        "taishouDate," +
        "hayadeFlag," +
        "inOffice," +
        "outOffice," +
        "restTime," +
        "sinseiRiyu" +
        ")" +
        " VALUES (" +
        sinseiNo + "," +
        "N'" + companyID + "'," +
        "N'" + sinseiStaffID + "'," +
        "N'" + shoninStaffID + "'," +
        kintaiNo + "," +
        shinseiKubun + "," +
        todokedeID + "," +
        shoninFlag + "," +
        "N'" + sinseiDate + "'," +
        "N'" + taishouDate + "'," +
        hayadeFlag + "," +
        inOffice + "," +
        outOffice + "," +
        restTime + "," +
        "N'" + sinseiRiyu + "'" +
        ")"
    );
    return true;
};
//**********************************************//
// 勤務時間変更時イベント
//*********************************************//
// MainClass1011.prototype.kinmuTimeChange = function() {
//     const self = this;
//     const localFunc = function() {
//         const shukinTime = self.sel("#shukinJikan").val();
//         if (shukinTime == undefined || shukinTime == '') {
//             return true;
//         }
//         const splitShukin = shukinTime.split(":");
//         const shukinMin = parseInt(splitShukin[0], 10) * 60 + parseInt(splitShukin[1], 10);
//         const taikinJikan = self.sel("#taikinJikan").val();
//         if (taikinJikan == undefined || taikinJikan == '') {
//             return true;
//         }
//         const splitTaikin = taikinJikan.split(":");
//         if (splitTaikin[0] >= 0 && splitTaikin[0] < 5) {
//             splitTaikin[0] = splitTaikin[0] + 24;
//         }
//         const taikinMin = parseInt(splitTaikin[0], 10) * 60 + parseInt(splitTaikin[1], 10);
//         const kinmuTimeMin = taikinMin - shukinMin;
//         // 休憩時間のセット
//         let $domHTML = "";
//         for (let i = 0; i < kinmuTimeMin; i += 5) {
//             $domHTML += "<option value='" + i + "'>" + i + "</option>";
//         }
//         self.sel("#kyukeiJikan").empty();
//         self.sel("#kyukeiJikan").append($domHTML);
//     };
//     self.ev('change', '#shukinJikan', localFunc);
//     self.ev('change', '#taikinJikan', localFunc);
// };
//**********************************************//
// 時間外勤務届けのチェンジイベント
//*********************************************//
MainClass1011.prototype.initJikangaiDraw = function() {
    const self = this;
    self.sel(".sinseiDate").show();
    // 時間外勤務届けの取得
    const jikangaiData = self.master.read(
        "SELECT" +
        "    todokedeID," +
        "    todokedeName," +
        "    labelName" +
        " FROM" +
        "    MK_todokede" +
        " WHERE" +
        "    (todokedeKubun=4 OR todokedeKubun=5) AND" +
        "    companyID=N'" + self.companyID + "'" +
        " ORDER BY" +
        "    todokedeKubun DESC," +
        "    todokedeID ASC"
    );
    if (false === self.exception.check(
            jikangaiData,
            ExceptionServerOn,
            ExceptionSystemOn,
            "101109",
            "時間外勤務の種類が取得できませんでした。",
            ExceptionParamToMenu
        )) {
        return false;
    }
    let $todokedeKubunHtml = '';
    // 取得できた届出区分のリストをコンボボックスにセットする
    for (let i in jikangaiData) {
        $todokedeKubunHtml +=`
            <option value="${jikangaiData[i].todokedeID}">
                ${jikangaiData[i].labelName}
            </option>
        `;
    }
    const $html =`
        <section class="jikangaiTodoke">
            <section>
                <h1 class="Date">残業種類</h1>
                <select id="todokedeKubun">
                    ${$todokedeKubunHtml}
                </select>
            </section>
        </section>
    `;
    self.sel("#sinseiNaiyo").html($html);
    self.sel("#dakokuSinseiDate").append(`
        <section>
            <section class="zangyo">
                <h1 id="zangyoSt">時間外開始</h1>
                <input id="shukinJikan" type="time" value="">
            </section>
            <section class="zangyo">
                <h1 id="zangyoEnd">時間外終了</h1>
                <input id="taikinJikan" type="time" value="">
            </section>
        </section>
    `);
};
//**********************************************//
// 時間外勤務届の事後申請の時の勤怠データ有無チェック
//**********************************************//
MainClass1011.prototype.jikangaiCheck = function(editDate) {
    const self = this;
    const checkKintai = self.getTaikinToday(editDate);
    const checkKintaiFlag = self.exception.check(
        checkKintai,
        ExceptionServerOn,
        ExceptionSystemOff,
        "101110",
        "勤怠データ有無チェックができませんでした。",
        ExceptionParamToMenu
    );
    if (true === checkKintaiFlag) {
        return true;
    } else {
        return false;
    }
};
//**********************************************//
// 早退届の本日退勤データ
//*********************************************//
MainClass1011.prototype.getTaikinToday = function(today) {
    const self = this;
    const todayTaikin = self.master.read(
        "SELECT" +
        "    outOffice" +
        " FROM" +
        "    MK_kintai" +
        " WHERE" +
        "    companyID = N'" + self.companyID + "' AND" +
        "    staffID = N'" + self.staff + "' AND" +
        "    ymd = N'" + today + "'" +
        " ORDER BY" +
        "    kintaiNo DESC"
    );
    return todayTaikin;
};
//**********************************************//
// 遅刻届の本日出勤データ
//*********************************************//
MainClass1011.prototype.getSyukinToday = function(today) {
    const self = this;
    const todaySyukin = self.master.read(
        "SELECT" +
        "    inOffice" +
        " FROM" +
        "    MK_kintai" +
        " WHERE" +
        "    companyID = N'" + self.companyID + "' AND" +
        "    staffID = N'" + self.staff + "' AND" +
        "    ymd = N'" + today + "'" +
        " ORDER BY" +
        "    kintaiNo"
    );
    return todaySyukin;
};
//**********************************************//
// 早退届の日付け変更時の表示
//*********************************************//
MainClass1011.prototype.soutai = function(editDate, today, todayHyphen) {
    const self = this;
    let todayTaikin = '';
    self.sel("#errorArea").empty();
    self.sel("#errorArea").css('display', 'none');
    let taikin = to60(self.kintaiPaternDate[0].endWork);
    let taikinJikan = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
    if (editDate <= today) {
        // ◇本日日付以前を選択したとき（本日退勤打刻がある場合）
        todayTaikin = self.getTaikinToday(editDate);
        // 例外処理
        const todayTaikinFlag = self.exception.check(
            todayTaikin,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101111",
            "本日退勤打刻の取得ができませんでした。",
            ExceptionParamToMenu
        );
        if (false === todayTaikinFlag) {
            return false;
        }
        //  ・マッピング情報１を参照（本日日付を変更した日付にする）
        //  ◇本日より前の日付で、退勤データが無い場合
        else if (editDate < today && todayTaikinFlag == null) {
            //   ・「yyyy/mm/ddの退勤時間が存在しません。打刻修正を行ってください。」
            //     とメッセージを表示しリロードする
            self.sel("#errorArea").append(
                "<p>" + editDate + "の退勤時間が存在しません。打刻修正を行ってください。</p>"
            );
            self.sel("#errorArea").css('display', 'block');
            return false;
        } else if (editDate == today && todayTaikinFlag == null) {
            //  ◇本日日付で、退勤データが無い場合
            //   ・画面_1011_3（早退事前）を表示する
            self.sel("#taikinJikan").val(taikinJikan);
            self.sel("#taikinJikan").prop('disabled', false);
            self.sel("#dateFrom").children('h1').text('期間');
            self.sel("#sinseiFrom").next('p').show();
            self.sel("#dateTo").show();
        } else {
            //  ◇本日又は本日より前の日付で、退勤データがある場合
            //   ・画面_1011_3（早退事後）を表示する
            taikin = to60(todayTaikin[0].outOffice);
            taikinJikan = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
            self.sel("#taikinJikan").val(taikinJikan);
            self.sel("#taikinJikan").prop('disabled', true);
            self.sel("#dateFrom").children('h1').text('期間');
            self.sel("#sinseiFrom").next('p').hide();
            self.sel("#sinseiTo").val(self.sel("#sinseiFrom").val());
            self.sel("#dateTo").hide();
        }
    } else {
        // ◇本日日付以降を選択したとき（本日退勤打刻がない場合）
        //     ・画面_1011_3（早退事前）を表示する
        self.sel("#taikinJikan").val(taikinJikan);
        self.sel("#taikinJikan").prop('disabled', false);
        self.sel("#dateFrom").children('h1').text('期間');
        self.sel("#sinseiFrom").next('p').show();
        self.sel("#dateTo").show();
    }
};
//**********************************************//
// 遅刻届の日付変更時の表示
//*********************************************//
MainClass1011.prototype.tikoku = function(editDate, today, todayHyphen) {
    const self = this;
    let todayShukin = '';
    self.sel("#errorArea").empty();
    self.sel("#errorArea").css('display', 'none');
    let shukin = to60(self.kintaiPaternDate[0].startWork);
    let shukinJikan = addZero(shukin.hours) + ':' + addZero(shukin.minutes);
    if (editDate <= today) {
        // ◇ 本日日付以前を選択したとき（本日退勤打刻がある場合）
        todayShukin = self.getSyukinToday(editDate);
        // 例外処理
        const todayShukinFlag = self.exception.check(
            todayShukin,
            ExceptionServerOn,
            ExceptionSystemOff,
            "101112",
            "本日退勤打刻の取得ができませんでした。",
            ExceptionParamToMenu
        );
        if (false === todayShukinFlag) {
            return false;
        }
        //   ・マッピング情報2を参照（本日日付を変更した日付にする）
        //  ◇本日より前の日付で、出勤データが無い場合
        else if (editDate < today && todayShukinFlag == null) {
            self.sel("#errorArea").append(
                "<p>" + editDate + "の出勤時間が存在しません。打刻修正を行ってください。</p>"
            );
            self.sel("#errorArea").css('display', 'block');
            return false;
        } else if (editDate == today && todayShukinFlag == null) {
            //  ◇本日日付で、出勤データが無い場合
            //   ・画面_1011_3（遅刻事前）を表示する
            self.sel("#shukinJikan").val(shukinJikan);
            self.sel("#shukinJikan").prop('disabled', false);
            self.sel("#dateFrom").children('h1').text('期間');
            self.sel("#sinseiFrom").next('p').show();
            self.sel("#dateTo").show();
        } else {
            //  ◇本日又は本日より前の日付で、出勤データがある場合
            //   ・画面_1011_3（遅刻事後）を表示する
            shukin = to60(todayShukin[0].inOffice);
            shukinJikan = addZero(shukin.hours) + ':' + addZero(shukin.minutes);
            self.sel("#shukinJikan").val(shukinJikan);
            self.sel("#shukinJikan").prop('disabled', true);
            self.sel("#dateFrom").children('h1').text('期間');
            self.sel("#sinseiFrom").next('p').hide();
            self.sel("#sinseiTo").val(self.sel("#sinseiFrom").val());
            self.sel("#dateTo").hide();
        }
    } else {
        // ◇本日日付以降を選択したとき（本日退勤打刻がない場合）
        //     ・画面_1011_3（遅刻事前）を表示する
        self.sel("#shukinJikan").val(shukinJikan);
        self.sel("#shukinJikan").prop('disabled', false);
        self.sel("#dateFrom").children('h1').text('期間');
        self.sel("#sinseiFrom").next('p').show();
        self.sel("#dateTo").show();
    }
};
//**********************************************//
// 休日出勤届の表示処理
//*********************************************//
MainClass1011.prototype.kyushutu = function(todoke, today) {
    const self = this;
    self.sel("#furiKyu").remove();
    if (todoke == "0") {
        self.sel(".sinseiDate").append(`
            <section id="furiKyu">
                <h1>休暇取得日</h1>
                <input id="kyukaDay" type="date" value="">
        `);
        self.sel("#kyukaDay").val(today);
    }
};
//=====================================
// 打刻修正依頼の日付変更イベント
//=====================================
// MainClass1011.prototype.dataChange = function() {
//     const self = this;
//     self.sel("#kintai0").remove();
//     self.sel("#kintai01").remove();
//     self.sel("#gaishutuKinmu").remove();
//     // 打刻データの取得
//     const sinseiDate = self.sel("#sinseiFrom").val().replace(/-/g, "/");
//     const kintaiData = self.master.read(
//         "SELECT * " +
//         " FROM MK_kintai" +
//         " WHERE" +
//         "    staffID   =N'" + self.staff + "' AND" +
//         "    ymd       =N'" + sinseiDate + "' AND" +
//         "    companyID =N'" + self.companyID + "'",
//         null,
//         null
//     );
//     const $html =
//         '<table id="kintai0">' +
//         '<th>全削除</th>' +
//         '<td class="check">' +
//         "<input type='checkbox' class='checkDelete' id='checkAll'>" +
//         "<label class='ckBox' for='checkAll'></label>" +
//         '</td>' +
//         '</table>' +
//         '<table id="kintai01">' +
//         '<tr>' +
//         '<th>&nbsp;&nbsp;削除</th>' +
//         '<th>&nbsp;&nbsp;&nbsp;&nbsp;</th>' +
//         '<th>&nbsp;&nbsp;出勤</th>' +
//         '<th>&nbsp;&nbsp;退勤</th>' +
//         '</tr>' +
//         '<tr>' +
//         '<td class="check">' +
//         '<input class="checkDelete" type="checkbox" id="checkDelete0">' +
//         "<label class='ckBox'  for='checkDelete0'></label>" +
//         '</td>' +
//         '<td class="kintai"></td>' +
//         '<td class="kintai" id="shukin01">' +
//         '<input class="kintaiTime" id="shukinJikan" type="time" value="">' +
//         '</td>' +
//         '<td class="kintai" id="taikin01">' +
//         '<input class="kintaiTime" id="taikinJikan" type="time" value="">' +
//         '</td>' +
//         '</tr>' +
//         '</table>' +
//         '<hr></hr>' +
//         "<table id='gaishutuKinmu'>" +
//         "<tr>" +
//         "<td class='check'>" +
//         "<input type='checkbox' class='checkDelete' id='checkDelete1'>" +
//         "<label class='ckBox' for='checkDelete1'></label>" +
//         "</td>" +
//         '<td class="kintai">外出１</td>' +
//         "<td class='kintai'>" +
//         "<input class='kintaiTime' id='shukinJikan1' type='time' value=''>" +
//         "</td>" +
//         "<td class='kintai'>" +
//         "<input class='kintaiTime' id='taikinJikan1' type='time' value=''>" +
//         "</td>" +
//         "</tr>" +
//         "<tr>" +
//         "<td class='check'>" +
//         "<input class='checkDelete' type='checkbox' id='checkDelete2'>" +
//         "<label class='ckBox' for='checkDelete2'></label>" +
//         "</td>" +
//         '<td class="kintai">外出2</td>' +
//         "<td class='kintai'>" +
//         "<input class='kintaiTime' id='shukinJikan2' type='time' value=''>" +
//         "</td>" +
//         "<td class='kintai'>" +
//         "<input class='kintaiTime' id='taikinJikan2' type='time' value=''>" +
//         "</td>" +
//         "</tr>" +
//         "</table>";
//     self.sel("#dakokuSinseiDate").append($html);
//     // 打刻データ無い時、新規打刻追加依頼
//     if (kintaiData == null) {
//         self.sel("#shukinJikan").val(self.shukinJikan);
//         self.sel("#taikinJikan").val(self.taikinJikan);
//         self.dakokuSinseiFlag = 0;
//     } else {
//         shukin01 = to60(kintaiData[0].inOffice);
//         shukin01 = addZero(shukin01.hours) + ':' + addZero(shukin01.minutes);
//         self.sel("#shukinJikan").val(shukin01);
//         taikin01 = to60(kintaiData[0].outOffice);
//         taikin01 = addZero(taikin01.hours) + ':' + addZero(taikin01.minutes);
//         self.sel("#taikinJikan").val(taikin01);
//         // 値のセット 勤務パターン0
//         if (kintaiData.length == 2) {
//             shukin = to60(kintaiData[0].outOffice);
//             shukin = addZero(shukin.hours) + ':' + addZero(shukin.minutes);
//             taikin = to60(kintaiData[1].inOffice);
//             taikin = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
//             taikin01 = to60(kintaiData[1].outOffice);
//             taikin01 = addZero(taikin01.hours) + ':' + addZero(taikin01.minutes);
//             self.sel("#taikinJikan").val(taikin01);
//             self.sel("#shukinJikan1").val(shukin);
//             self.sel("#taikinJikan1").val(taikin);
//         } else if (kintaiData.length == 3) {
//             shukin = to60(kintaiData[0].outOffice);
//             shukin = addZero(shukin.hours) + ':' + addZero(shukin.minutes);
//             taikin = to60(kintaiData[1].inOffice);
//             taikin = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
//             shukinS = to60(kintaiData[1].outOffice);
//             shukinS = addZero(shukinS.hours) + ':' + addZero(shukinS.minutes);
//             taikinS = to60(kintaiData[2].inOffice);
//             taikinS = addZero(taikinS.hours) + ':' + addZero(taikinS.minutes);
//             taikin01 = to60(kintaiData[2].outOffice);
//             taikin01 = addZero(taikin01.hours) + ':' + addZero(taikin01.minutes);
//             self.sel("#taikinJikan").val(taikin01);
//             self.sel("#shukinJikan1").val(shukin);
//             self.sel("#taikinJikan1").val(taikin);
//             self.sel("#shukinJikan2").val(shukinS);
//             self.sel("#taikinJikan2").val(taikinS);
//         }
//         self.dakokuSinseiFlag = 1;
//     }
//     self.ev('change', '.checkDelete', function() {
//         self.editFlag = true;
//     });
//     self.ev('change', '.kintaiTime', function() {
//         self.editFlag = true;
//     });
//     self.ev('change', '#checkAll', function() {
//         if ($(this).is(':checked')) {
//             self.sel(".checkDelete").prop('checked', true);
//             self.sel(".checkDelete").val(1);
//         } else {
//             self.sel(".checkDelete").prop('checked', false);
//             self.sel(".checkDelete").val(0);
//         }
//     });
// };