//******************************************************************
// 休憩時間の計算
// input:  timeTable  タイムテーブル
// input:  startTime  出勤時間（実働時間）
// input:  endTime    退勤時間（実働時間）
// output: restTime   計算結果（休憩時間）
//******************************************************************
function keisanRest(
    startMarume,
    endMarume,
    timeTable,
    startTime,
    endTime
) {
    var restTime = 0.0;
    for (var j = 0 in timeTable) {
        var startRest = kirisute(timeTable[j]["startRest"], 10);
        var endRest = kirisute(timeTable[j]["endRest"], 10);
        // パターン１（休憩をとらない時）
        if (startRest <= startTime && endRest <= startTime) {
            //
        }
        // パターン５（休憩をとらない時）
        else if (startRest >= endTime && endRest >= endTime) {
            //
        }
        // パターン６（勤務時間内に休憩をとったとき）
        else if (startTime <= startRest && endRest <= endTime) {
            restTime += endRest - startRest; // まるめしなくてよい
        }
        // パターン２（休憩時間中に外出した時）
        // 休憩中の出勤は勤務時間とする。
        else if (startTime <= startRest && endTime <= endRest) {
            restTime += Math.floor((endTime - startRest) / endMarume) * endMarume;
        }
        // パターン４（休憩時間中に戻りした時）
        // 休憩中の出勤は勤務時間とする。
        else if (startRest <= startTime && endRest <= endTime) {
            restTime += Math.floor((endRest - startTime) / startMarume) * startMarume;
        }
        // パターン３（休憩時間内に外出、戻りをした時）
        // 休憩中の出勤は勤務時間とする。
        else {
            // restTime += endTime - startTime;
        }
    }
    return restTime;
}
//============================================
// テーブル編集の関数
//============================================
function inOfficeToggleFunction(e) {
    $("#daialog").dialog({
        autoOpen: false,
        modal: true,
        height: 250,
        width: 500
    });
    $("#alert").text("");
    $("#output").attr('disabled', 'disabled');
    var tagTR = $(this).parents("tr");
    var syukkin = tagTR.find("td.inOffice input");
    var taikin = tagTR.find("td.outOffice");
    var kyukei = tagTR.find("td.restTime");
    var self = $(this).parents("tr");
    var weekColor = self.find("input.holidayColor0").val();
    var weekBlue = self.find("input.holidayColor1").val();
    var holiday = 2; // 平日
    if (weekColor != undefined) {
        holiday = 0; //法定休日
    } else if (weekBlue != undefined) {
        holiday = 1; //公休日
    }
    var match = tagTR.find("th.shift").html();
    if (match == undefined) {
        match = "";
    }
    var kintaiNo = tagTR.find("input.kintaiNo").val();
    var presTime = parseFloat($("#presTime").val());
    var presFlag = parseInt($("#presFlag").val(), 10);
    // 自動計算の許可を求める。
    if (e.keyCode == 13 || e.keyCode == 27 || e.which == 0) {
        //********************************
        // 書式チェック
        //********************************
        if (syukkin.val() == "" || syukkin.val() == ":") {
            tagTR.find("td.inOffice").html(":");
            tagTR.find("th.inTime").html(":");
            tagTR.find("th.overTime").html(":");
            tagTR.find("th.outTime").html(":");
            tagTR.find("th.underTime").html(":");
            if (match.indexOf('外出') == -1) {
                tagTR.find("th.shift").removeClass('black');
                tagTR.find("th.shift").html("");
            }
            return false;
        } else {
            var str = syukkin.val();
            str = str.replace(/[Ａ-Ｚａ-ｚ０-９－：]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) - 65248);
            });
            str = str.replace(/:/g, '');
            var strH = "";
            var strM = "";
            if (str.match(/^[0-9]+/) && str.length == 4) {
                //：を含まずstrが数字4桁の時
                strH = addZero(str.substring(0, 2));
                strM = addZero(str.substring(2, 4));
                str = strH + ":" + strM;
            } else if (str.match(/^[0-9]+/) && str.length == 3) {
                //strが3桁の時
                strH = addZero(str.substring(0, 1));
                strM = addZero(str.substring(1, 3));
                str = strH + ":" + strM;
            } else if (str.match(/^[0-9]+/) && str.length == 2) {
                //strが2桁の時
                str = "00:" + str;
            } else if (str.match(/^[0-9]+/) && str.length == 1) {
                //strが1桁の時
                str = "00:0" + str;
            }
            syukkin.val(str);
            if (!str.match(/^\d{1,2}\:\d{1,2}$/) || parseInt(str.split(':')[1], 10) > 59) {
                alert("出勤時間は、HH:MMの形式で入力してください。");
                syukkin.val("");
                return false;
            } else {
                var syukkinSplit = syukkin.val().split(":");
                var syukkinH = parseInt(syukkinSplit[0], 10);
                var syukkinM = parseInt(syukkinSplit[1], 10);
            }
            // 出勤が当日の1つ前のデータの退勤を超えていた時エラー
            if (kintaiNo != 0) {
                // var gaishutuS = tagTR.prevAll().find("td.outOffice").html().split(":");
                var gaishutuS = tagTR.prev().find("td.outOffice").html().split(":");
                gaishutuH = parseInt(gaishutuS[0], 10);
                gaishutuM = parseInt(gaishutuS[1], 10);
                if (gaishutuH > syukkinH) {
                    alert("出勤、退勤、休憩時間を正しく入力してください。");
                    syukkin.val("");
                    return false;
                } else if (gaishutuH == syukkinH) {
                    if (gaishutuM > syukkinM) {
                        alert("出勤、退勤、休憩時間を正しく入力してください。");
                        syukkin.val("");
                        return false;
                    }
                }
            } else {
                // 次の行の日付を取得。当日かどうかの判定。
                var nextDate = tagTR.next().find('th.listDate').html();
                if (nextDate == self.find('th.listDate').html()) {
                    // 同一日付の次の行と比較し、出勤時間が次の表の出勤時間を超えていた時エラー
                    var gaishutuS = tagTR.next().find("td.inOffice").html().split(":");
                    gaishutuH = parseInt(gaishutuS[0], 10);
                    gaishutuM = parseInt(gaishutuS[1], 10);
                    if (gaishutuH < syukkinH) {
                        alert("出勤、退勤、休憩時間を正しく入力してください。");
                        syukkin.val("");
                        return false;
                    } else if (gaishutuH == syukkinH) {
                        if (gaishutuM < syukkinM) {
                            alert("出勤、退勤、休憩時間を正しく入力してください。");
                            syukkin.val("");
                            return false;
                        }
                    }
                }
            }
        }
        var startWork = kirisute(self.find("input.startWork").val(), 10);
        var endWork = kirisute(self.find("input.endWork").val(), 10);
        var maruS = tagTR.find("input.marumeS");
        var nowTime = kirisute(syukkinH + (syukkinM / 60.0), 10);
        // 隠し項目（丸め出勤時間に値を割り当てる
        maruStartTime = Math.ceil(nowTime / maruS.val()) * maruS.val();
        // 隠し項目のセット
        tagTR.find("input.startMarume").val(maruStartTime);
        // 労働時間の計算
        var roudo = "";
        var zangyo = "";
        if (self.find("input.startMarume").val()) {
            var syukkinMaru = maruStartTime; // 丸め出勤時間
            if (self.find("td.outOffice").html() == ":") {
                if (match.indexOf('外出') == -1 && startWork > maruStartTime) {
                    if (confirm("出勤時間を通常扱いで計算します。早出扱いにしたいときはキャンセルを押してください。") == false) {
                        if (startWork < maruStartTime) {
                            tagTR.find("th.shift").html(to60(maruStartTime)["hours"] + ':' + to60(maruStartTime)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        } else if (startWork > maruStartTime) {
                            tagTR.find("th.shift").html(to60(maruStartTime)["hours"] + ':' + to60(maruStartTime)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        } else {
                            tagTR.find("th.shift").html(to60(startWork)["hours"] + ':' + to60(startWork)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        }
                    } else {
                        if (startWork < maruStartTime) {
                            tagTR.find("th.shift").html(to60(maruStartTime)["hours"] + ':' + to60(maruStartTime)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        } else {
                            maruStartTime = startWork;
                            tagTR.find("th.shift").html(to60(startWork)["hours"] + ':' + to60(startWork)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        }
                    }
                }
            } else {
                var outOffice = to10(self.find("td.outOffice").html()); // 実際の退勤時間
                if (self.find("td.restTime").html() == "") {
                    var kyukei10 = 0;
                } else {
                    var kyukei10 = kirisute(parseFloat(self.find("td.restTime").html()) / 60.0, 10);
                }
                // 労働時間の計算は退勤時間 - 丸め出勤時間 - 休憩時間
                var roudoTime = kirisute(outOffice - syukkinMaru - kyukei10, 10);
                if (roudoTime <= 0) {
                    alert("出勤、退勤、休憩時間を正しく入力してください。");
                    syukkin.val("");
                    return false;
                }
                if (match.indexOf('外出') == -1 && startWork > maruStartTime) {
                    if (confirm("出勤時間を通常扱いで計算します。早出扱いにしたいときはキャンセルを押してください。") == false) {
                        if (startWork < maruStartTime) {
                            tagTR.find("th.shift").html(to60(maruStartTime)["hours"] + ':' + to60(maruStartTime)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        } else if (startWork > maruStartTime) {
                            tagTR.find("th.shift").html(to60(maruStartTime)["hours"] + ':' + to60(maruStartTime)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        } else {
                            tagTR.find("th.shift").html(to60(startWork)["hours"] + ':' + to60(startWork)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        }
                    } else {
                        if (startWork < maruStartTime) {
                            tagTR.find("th.shift").html(to60(maruStartTime)["hours"] + ':' + to60(maruStartTime)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                        } else {
                            tagTR.find("th.shift").html(to60(startWork)["hours"] + ':' + to60(startWork)["minutes"] + '～' +
                                to60(endWork)["hours"] + ':' + to60(endWork)["minutes"]);
                            tagTR.find("th.shift").addClass('black');
                            if (maruStartTime < startWork) {
                                maruStartTime = startWork;
                                syukkinMaru = maruStartTime;
                                // 労働時間の計算は丸め退勤時間 - 丸め出勤時間 - 休憩時間
                                roudoTime = kirisute(outOffice - syukkinMaru - kyukei10, 10);
                            }
                        }
                    }
                }
                var marumeS = kirisute(self.find("input.marumeS").val(), 10);
                var marumeE = kirisute(self.find("input.marumeE").val(), 10);
                roudoTime = to60(Math.floor(roudoTime / marumeE) * marumeE);
                var roudoH = roudoTime["hours"];
                var roudoM = addZero(roudoTime["minutes"]);
                if (outOffice >= 0 && kyukei10 >= 0) {
                    roudo = roudoH + ":" + roudoM;
                }
                var roudoNo = tagTR.find("input.kintaiNo").val();
                var roudoYmd = tagTR.find("th.listDate").html();
                var roudoRest = 0.0;
                var roudoZan = 0.0;
                var roudoTotal = 0.0;
                var roudo60 = 0.0;
                if (roudoNo == 0) {
                    roudo60 = (roudoTime["hours"] * 60) + parseInt(roudoTime["minutes"], 10);
                } else {
                    for (var i = 0; i < $("#list").children().length; i++) {
                        if ($("#list tr:eq(" + i + ")").find("th.listDate").html() == roudoYmd && $("#list tr:eq(" + i + ")").find("input.kintaiNo").val() != roudoNo) {
                            //休憩
                            roudoRest = roudoRest + $("#list tr:eq(" + i + ")").find("th.restTime").html();
                            //合計
                            roudoTotal = roudoTotal + to10($("#list tr:eq(" + i + ")").find("th.underTime").html());
                            //残業
                            roudoZan = roudoZan + to10($("#list tr:eq(" + i + ")").find("th.overTime").html());
                        }
                        if ($("#list tr:eq(" + i + ")").find("th.listDate").html() == roudoYmd && $("#list tr:eq(" + i + ")").find("input.kintaiNo").val() == roudoNo) {
                            break;
                        }
                    }
                    roudoRest = roudoRest + self.find("td.restTime").html();
                    roudoRest = to60(roudoRest);
                    var roudoR = (roudoRest["hours"] * 60) + parseInt(roudoTotal["minutes"], 10);
                    roudoTotal = roudoTotal + to10(roudo);
                    roudoTotal = to60(roudoTotal);
                    var roudoT = (roudoTotal["hours"] * 60) + parseInt(roudoTotal["minutes"], 10);
                    roudoZan = to60(roudoZan);
                    var roudoZ = (roudoZan["hours"] * 60) + parseInt(roudoZan["minutes"], 10);
                    roudo60 = roudoT - roudoZ;
                }
                if (syukkin.val() != "" && syukkin.val() != ":" && taikin.text() != ":" && kyukei.text() != "") {
                    if (roudo60 >= marumeE * 60) {
                        self.find("th.underTime").html(roudo); // 労働時間表示
                    } else {
                        alert("労働時間が０以下になります。入力できません。");
                        taikin.val("");
                        return false;
                    }
                    roudo = to10(roudo);
                    var shotei = roudo - zangyo;
                    shotei = to60(shotei);
                    var shoteiH = shotei["hours"];
                    var shoteiM = shotei["minutes"];
                    shotei = shoteiH + ":" + shoteiM;
                    //日単位設定の時
                    if (presFlag == 0) {
                        var setteiTime = presTime * 60;
                        if (roudo60 > setteiTime) {
                            var zangyoH = Math.floor((roudo60 - setteiTime) / 60); // 労働時間(時)
                            var zangyoM = addZero((roudo60 - setteiTime) % 60); // 労働時刻(分)
                            zangyo = zangyoH + ":" + zangyoM;
                        } else {
                            zangyo = "0:00";
                        }
                        if (holiday == 1) {
                            zangyo = to60(roudo);
                            var overT = zangyo["hours"];
                            var overM = zangyo["minutes"];
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                            self.find("th.overTime").html(overT + ":" + overM); //休日労働を所定外に表示する
                            self.find("th.outTime").html("0:00");
                            zangyo = to10(zangyo["hours"] + ":" + zangyo["minutes"]);
                        } else if (holiday == 0) {
                            zangyo = to60(roudo);
                            var overT = zangyo["hours"];
                            var overM = zangyo["minutes"];
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                            self.find("th.overTime").html("0:00");
                            self.find("th.outTime").html(overT + ":" + overM); //休日労働を法定休日に表示する
                            zangyo = to10(zangyo["hours"] + ":" + zangyo["minutes"]);
                        } else {
                            zangyo = to10(zangyo);
                            var shotei = roudo - zangyo;
                            shotei = to60(shotei);
                            var shoteiH = shotei["hours"];
                            var shoteiM = shotei["minutes"];
                            shotei = shoteiH + ":" + shoteiM;
                            zangyo = to60(zangyo);
                            zangyo = zangyo["hours"] + ":" + zangyo["minutes"];
                            self.find("th.outTime").html("0:00");
                            self.find("th.overTime").html(zangyo);
                            self.find("th.inTime").html(shotei); // 所定時間表示
                        }
                    } else {
                        // 週単位設定の時
                        if (holiday == 0) {
                            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
                            $("#alert").css("color", "blue");
                            zangyo = to10("0:00");
                            self.find("th.outTime").html(shotei);
                            self.find("th.overTime").html("0:00");
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                        } else {
                            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
                            $("#alert").css("color", "blue");
                            zangyo = to10("0:00");
                            self.find("th.outTime").html("0:00");
                            self.find("th.overTime").html("0:00");
                            self.find("th.inTime").html(shotei); // 所定時間表示
                        }
                    }
                }
            }
            // 隠し項目のセット
            self.find("input.startMarume").val(maruStartTime);
        }
        var split = syukkin.val().split(":");
        self.find("td.inOffice").html(split[0] + ":" + addZero(split[1]));
    }
    if (presFlag == 1) {
        $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
        $("#alert").css("color", "blue");
    }
}
//***************************************************
// （１）出勤項目が選択された時
//  出勤時間の編集
//***************************************************
function inOffice_toggle() {
    return function () {
        if ($(this).hasClass('dis') != true && $(this).text() != '') {
            var syukkin = $("<input>").attr("type", "text").val($(this).text());
            $(this).html(syukkin);
            $(this).find("input").select();
            $("input", this).focus().blur(inOfficeToggleFunction);
            $("input", this).keydown(inOfficeToggleFunction);
        }
    }
}
//***************************************************
// （２）退勤項目が選択された時
//  退勤時間の編集
//***************************************************
function outOfficeToggleFunction(e) {
    $("#alert").text("");
    $("#output").attr('disabled', 'disabled');
    var tagTR = $(this).parents("tr");
    var syukkin = tagTR.find("td.inOffice");
    var taikin = tagTR.find("td.outOffice input");
    var kyukei = tagTR.find("td.restTime");
    var self = $(this).parents("tr");
    var weekColor = self.find("input.holidayColor0").html();
    var weekBlue = self.find("input.holidayColor1").html();
    var holiday = 2;
    var presTime = parseFloat($("#presTime").val());
    var presFlag = parseInt($("#presFlag").val(), 10);
    if (weekColor != undefined) {
        holiday = 0;
    } else if (weekBlue != undefined) {
        holiday = 1;
    }
    // 自動計算の許可を求める。
    if (e.keyCode == 13 || e.keyCode == 27 || e.which == 0) {
        //********************************
        // 書式チェック
        //********************************
        if (taikin.val() == "" || taikin.val() == ":") {
            tagTR.find("td.outOffice").html(":");
            tagTR.find("td.restTime").html("");
            tagTR.find("th.inTime").html(":");
            tagTR.find("th.overTime").html(":");
            tagTR.find("th.outTime").html(":");
            tagTR.find("th.underTime").html(":");
            return false;
        } else {
            var str = taikin.val();
            str = str.replace(/[Ａ-Ｚａ-ｚ０-９－：]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) - 65248);
            });
            str = str.replace(/:/g, '');
            var strH = "";
            var strM = "";
            if (str.match(/^[0-9]+/) && str.length == 4) {
                //：を含まずstrが数字4桁の時
                strH = str.substring(0, 2);
                strM = str.substring(2, 4);
                str = strH + ":" + strM;
            } else if (str.match(/^[0-9]+/) && str.length == 3) {
                //strが3桁の時
                strH = str.substring(0, 1);
                strM = str.substring(1, 3);
                str = strH + ":" + strM;
            } else if (str.match(/^[0-9]+/) && str.length == 2) {
                //strが2桁の時
                str = "00:" + str;
            } else if (str.match(/^[0-9]+/) && str.length == 1) {
                //strが1桁の時
                str = "00:0" + str;
            }
            taikin.val(str);
            if (!str.match(/^\d{1,2}\:\d{1,2}$/) || parseInt(str.split(':')[1], 10) > 59) {
                alert("退勤時間は、HH:MMの形式で入力してください。");
                taikin.val("");
                return false;
            } else {
                var taikinSplit = taikin.val().split(":");
                var taikinH = parseInt(taikinSplit[0], 10);
                var taikinM = parseInt(taikinSplit[1], 10);
            }
            // 退勤が当日の次の行のデータの出勤を超えていた時エラー
            //次の行の日付を取得。当日かどうかの判定。
            var nextDate = tagTR.next().find('th.listDate').html();
            if (nextDate == self.find('th.listDate').html()) {
                //同一日付の次の行と比較し、出勤時間が次の表の出勤時間を超えていた時エラー
                var gaishutuS = tagTR.next().find("td.inOffice").html().split(":");
                gaishutuH = parseInt(gaishutuS[0], 10);
                gaishutuM = parseInt(gaishutuS[1], 10);
                if (gaishutuH < taikinH) {
                    alert("出勤、退勤、休憩時間を正しく入力してください。");
                    taikin.val("");
                    return false;
                } else if (gaishutuH == taikinH) {
                    if (gaishutuM < taikinM) {
                        alert("出勤、退勤、休憩時間を正しく入力してください。");
                        taikin.val("");
                        return false;
                    }
                }
            }
        }
        // 隠し項目（丸め退勤時間に値を割り当てる :現時点は丸めてないので、共通関数化出来たら丸め時間を充てる事）
        var maruE = tagTR.find("input.marumeE");
        var nowEtime = kirisute(taikinH + (taikinM / 60.0), 10);
        maruEndTime = Math.floor(nowEtime / maruE.val()) * maruE.val();
        // 隠し項目のセット
        tagTR.find("input.endMarume").val(maruEndTime);
        // 労働時間の計算
        var roudo = "";
        var zangyo = "";
        var startWork = parseFloat(self.find("input.startWork").val());
        if (self.find("input.endMarume").val()) {
            var outOffice = to10(taikin.val()); // 実際の退勤時間
            if (self.find("input.startMarume").val() != ":") {
                var syukkinMaru = parseFloat(self.find("input.startMarume").val()); // 丸め出勤時間
                var kyukei10 = kirisute(self.find("td.restTime").html() / 60, 10)
                // 労働時間の計算は退勤時間-丸め出勤時間-休憩時間
                var roudoTime = kirisute(outOffice - syukkinMaru - kyukei10, 10);
                if (roudoTime <= 0) {
                    var taikinTime = to60(outOffice + 24);
                    taikin.val(taikinTime["hours"] + ":" + addZero(taikinTime["minutes"]));
                    taikin.focus();
                    return false;
                }
                var marumeS = kirisute(self.find("input.marumeS").val(), 10);
                var marumeE = kirisute(self.find("input.marumeE").val(), 10);
                roudoTime = to60(Math.floor(roudoTime / marumeE) * marumeE);
                var roudoH = roudoTime["hours"];
                var roudoM = addZero(roudoTime["minutes"]);
                if (syukkinMaru >= 0 && kyukei10 >= 0) {
                    roudo = roudoH + ":" + roudoM;
                }
                var roudoNo = tagTR.find("input.kintaiNo").val();
                var roudoYmd = tagTR.find("th.listDate").html();
                var roudoRest = 0.0;
                var roudoZan = 0.0;
                var roudoTotal = 0.0;
                var roudo60 = 0.0;
                if (roudoNo == 0) {
                    roudo60 = (roudoTime["hours"] * 60) + parseInt(roudoTime["minutes"], 10);
                } else {
                    for (var i = 0; i < $("#list").children().length; i++) {
                        if ($("#list tr:eq(" + i + ")").find("th.listDate").html() == roudoYmd && $("#list tr:eq(" + i + ")").find("input.kintaiNo").val() != roudoNo) {
                            //休憩
                            roudoRest = roudoRest + $("#list tr:eq(" + i + ")").find("th.restTime").html();
                            //合計
                            roudoTotal = roudoTotal + to10($("#list tr:eq(" + i + ")").find("th.underTime").html());
                            //残業
                            roudoZan = roudoZan + to10($("#list tr:eq(" + i + ")").find("th.overTime").html());
                        }
                        if ($("#list tr:eq(" + i + ")").find("th.listDate").html() == roudoYmd && $("#list tr:eq(" + i + ")").find("input.kintaiNo").val() == roudoNo) {
                            break;
                        }
                    }
                    roudoRest = roudoRest + self.find("td.restTime").html();
                    roudoRest = to60(roudoRest);
                    var roudoR = (roudoRest["hours"] * 60) + parseInt(roudoTotal["minutes"], 10);
                    roudoTotal = roudoTotal + to10(roudo);
                    roudoTotal = to60(roudoTotal);
                    var roudoT = (roudoTotal["hours"] * 60) + parseInt(roudoTotal["minutes"], 10);
                    roudoZan = to60(roudoZan);
                    var roudoZ = (roudoZan["hours"] * 60) + parseInt(roudoZan["minutes"], 10);
                    roudo60 = roudoT - roudoZ;
                }
                if (syukkin.text() != ":" && taikin.val() != "" && taikin.val() != ":" && kyukei.text() != "") {
                    if (roudo60 >= marumeE * 60) {
                        self.find("th.underTime").html(roudo); // 労働時間表示
                    } else {
                        alert("労働時間が０以下になります。入力できません。");
                        taikin.val("");
                        return false;
                    }
                    roudo = to10(roudo);
                    var shotei = roudo - zangyo;
                    shotei = to60(shotei);
                    var shoteiH = shotei["hours"];
                    var shoteiM = shotei["minutes"];
                    shotei = shoteiH + ":" + shoteiM;
                    // 日単位設定の時
                    if (presFlag == 0) {
                        var setteiTime = presTime * 60;
                        if (roudo60 > setteiTime) {
                            var zangyoH = Math.floor((roudo60 - setteiTime) / 60); // 労働時間(時)
                            var zangyoM = addZero((roudo60 - setteiTime) % 60); // 労働時刻(分)
                            zangyo = zangyoH + ":" + zangyoM;
                        } else {
                            zangyo = "0:00";
                        }
                        if (holiday == 1) {
                            zangyo = to60(roudo);
                            var overT = zangyo["hours"];
                            var overM = zangyo["minutes"];
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                            self.find("th.overTime").html(overT + ":" + overM); //休日労働を所定外に表示する
                            self.find("th.outTime").html("0:00");
                            zangyo = to10(zangyo["hours"] + ":" + zangyo["minutes"]);
                        } else if (holiday == 0) {
                            zangyo = to60(roudo);
                            var overT = zangyo["hours"];
                            var overM = zangyo["minutes"];
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                            self.find("th.overTime").html("0:00");
                            self.find("th.outTime").html(overT + ":" + overM); //休日労働を法定休日に表示する
                            zangyo = to10(zangyo["hours"] + ":" + zangyo["minutes"]);
                        } else {
                            zangyo = to10(zangyo);
                            var shotei = roudo - zangyo;
                            shotei = to60(shotei);
                            var shoteiH = shotei["hours"];
                            var shoteiM = shotei["minutes"];
                            shotei = shoteiH + ":" + shoteiM;
                            zangyo = to60(zangyo);
                            zangyo = zangyo["hours"] + ":" + zangyo["minutes"];
                            self.find("th.outTime").html("0:00");
                            self.find("th.overTime").html(zangyo);
                            self.find("th.inTime").html(shotei); // 所定時間表示
                        }
                    } else {
                        //週単位設定の時
                        if (holiday == 0) {
                            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
                            $("#alert").css("color", "blue");
                            zangyo = to10("0:00");
                            self.find("th.outTime").html(shotei);
                            self.find("th.overTime").html("0:00");
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                        } else {
                            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
                            $("#alert").css("color", "blue");
                            zangyo = to10("0:00");
                            self.find("th.outTime").html("0:00");
                            self.find("th.overTime").html("0:00");
                            self.find("th.inTime").html(shotei); // 所定時間表示
                        }
                    }
                }
            }
            // 隠し項目のセット
            self.find("input.endMarume").val(maruEndTime);
        }
        var split = taikin.val().split(":");
        self.find("td.outOffice").html(split[0] + ":" + addZero(split[1]));
    }
    if (presFlag == 1) {
        $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
        $("#alert").css("color", "blue");
    }
}
function outOffice_toggle() {
    return function () {
        if ($(this).hasClass('dis') != true && $(this).text() != '') {
            var taikin = $("<input>").attr("type", "text").val($(this).text());
            $(this).html(taikin);
            $(this).find("input").select();
            $("input", this).focus().blur(outOfficeToggleFunction);
            $("input", this).keydown(outOfficeToggleFunction);
        }
    }
}
//***************************************************
// （３）休憩項目が選択された時
//  休憩時間の編集
//***************************************************
function restToggleFunction(e) {
    $("#alert").text("");
    $("#output").attr('disabled', 'disabled');
    var presTime = parseFloat($("#presTime").val());
    var presFlag = parseInt($("#presFlag").val(), 10);
    //===============================
    // 休憩時間の入力チェック
    //===============================
    // 休憩時間の型式チェック
    var tagTR = $(this).parents("tr");
    var syukkin = tagTR.find("td.inOffice");
    var taikin = tagTR.find("td.outOffice");
    var kyukei = tagTR.find("td.restTime input");
    if (e.keyCode == 13 || e.keyCode == 27 || e.which == 0) {
        if (kyukei.val() == "") {
            tagTR.find("td.restTime").html("");
            tagTR.find("th.inTime").html(":");
            tagTR.find("th.overTime").html(":");
            tagTR.find("th.outTime").html(":");
            tagTR.find("th.underTime").html(":");
        } else {
            var str = kyukei.val();
            str = str.replace(/[Ａ-Ｚａ-ｚ０-９－：]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) - 65248);
            });
            kyukei.val(str);
            if (!kyukei.val().match(/^\d{1,3}$/)) {
                alert("休憩時間は、3桁の整数で入力してください。");
                kyukei.val("");
                return false;
            }
            if (parseFloat(str) % 5 != 0) {
                alert("休憩時間は、５分単位で入力してください。");
                kyukei.val("");
                return false;
            }
            // 労働時間の計算
            var roudo = "";
            var zangyo = "";
            var self = $(this).parents("tr");
            var weekColor = self.find("input.holidayColor0").html();
            var weekBlue = self.find("input.holidayColor1").html();
            var holiday = 2;
            if (weekColor != undefined) {
                holiday = 0;
            } else if (weekBlue != undefined) {
                holiday = 1;
            }
            if (self.find("input.startMarume").val() != "" && self.find("td.outOffice").html() != ":") {
                var syukkinMaru = parseFloat(self.find("input.startMarume").val()); //丸め出勤時間
                var outOffice = to10(self.find("td.outOffice").html()); // 実際の退勤時間
                var taikinMaru = self.find("input.endMarume").val(); // 丸め退勤時間
                var kyukei10 = kirisute(kyukei.val() / 60.0, 10);
                var startWork = parseFloat(self.find("input.startWork").val());

                // 労働時間の計算は退勤時間-丸め出勤時間-休憩時間
                var marumeS = kirisute(self.find("input.marumeS").val(), 10);
                var marumeE = kirisute(self.find("input.marumeE").val(), 10);
                var roudoTime = kirisute(outOffice - syukkinMaru - kyukei10, 10);
                if (roudoTime <= 0) {
                    alert("出勤、退勤、休憩時間を正しく入力してください。");
                    kyukei.val("");
                    return false;
                }
                roudoTime = to60(Math.floor(roudoTime / marumeE) * marumeE);
                var roudoH = roudoTime["hours"];
                var roudoM = addZero(roudoTime["minutes"]);
                if (syukkinMaru >= 0 && taikinMaru >= 0) {
                    roudo = roudoH + ":" + roudoM;
                }
                var roudoNo = tagTR.find("input.kintaiNo").val();
                var roudoYmd = tagTR.find("th.listDate").html();
                var roudoRest = 0.0;
                var roudoZan = 0.0;
                var roudoTotal = 0.0;
                var roudo60 = 0.0;
                if (roudoNo == 0) {
                    roudo60 = (roudoTime["hours"] * 60) + parseInt(roudoTime["minutes"], 10);
                } else {
                    for (var i = 0; i < $("#list").children().length; i++) {
                        if ($("#list tr:eq(" + i + ")").find("th.listDate").html() == roudoYmd && $("#list tr:eq(" + i + ")").find("input.kintaiNo").val() != roudoNo) {
                            //休憩
                            roudoRest = roudoRest + $("#list tr:eq(" + i + ")").find("th.restTime").html();
                            //合計
                            roudoTotal = roudoTotal + to10($("#list tr:eq(" + i + ")").find("th.underTime").html());
                            //残業
                            roudoZan = roudoZan + to10($("#list tr:eq(" + i + ")").find("th.overTime").html());
                        }
                        if ($("#list tr:eq(" + i + ")").find("th.listDate").html() == roudoYmd && $("#list tr:eq(" + i + ")").find("input.kintaiNo").val() == roudoNo) {
                            break;
                        }
                    }
                    roudoRest = roudoRest + self.find("td.restTime").html();
                    roudoRest = to60(roudoRest);
                    var roudoR = (roudoRest["hours"] * 60) + parseInt(roudoTotal["minutes"], 10);
                    roudoTotal = roudoTotal + to10(roudo);
                    roudoTotal = to60(roudoTotal);
                    var roudoT = (roudoTotal["hours"] * 60) + parseInt(roudoTotal["minutes"], 10);
                    roudoZan = to60(roudoZan);
                    var roudoZ = (roudoZan["hours"] * 60) + parseInt(roudoZan["minutes"], 10);
                    roudo60 = roudoT - roudoZ;
                }
                if (syukkin.text() != ":" && taikin.text() != ":" && kyukei.val() != "") {
                    if (roudo60 >= marumeE * 60) {
                        self.find("th.underTime").html(roudo); // 労働時間表示
                    } else {
                        alert("労働時間が０以下になります。入力できません。");
                        kyukei.val("");
                        return false;
                    }
                    roudo = to10(roudo);
                    var shotei = roudo - zangyo;
                    shotei = to60(shotei);
                    var shoteiH = shotei["hours"];
                    var shoteiM = shotei["minutes"];
                    shotei = shoteiH + ":" + shoteiM;
                    // 日単位設定の時
                    if (presFlag == 0) {
                        var setteiTime = presTime * 60;
                        if (roudo60 > setteiTime) {
                            var zangyoH = Math.floor((roudo60 - setteiTime) / 60); // 労働時間(時)
                            var zangyoM = addZero((roudo60 - setteiTime) % 60); // 労働時刻(分)
                            zangyo = zangyoH + ":" + zangyoM;
                        } else {
                            zangyo = "0:00";
                        }
                        if (holiday == 1) {
                            zangyo = to60(roudo);
                            var overT = zangyo["hours"];
                            var overM = zangyo["minutes"];
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                            self.find("th.overTime").html(overT + ":" + overM); //休日労働を所定外に表示する
                            self.find("th.outTime").html("0:00");
                            zangyo = to10(zangyo["hours"] + ":" + zangyo["minutes"]);
                        } else if (holiday == 0) {
                            zangyo = to60(roudo);
                            var overT = zangyo["hours"];
                            var overM = zangyo["minutes"];
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                            self.find("th.overTime").html("0:00");
                            self.find("th.outTime").html(overT + ":" + overM); //休日労働を法定休日に表示する
                            zangyo = to10(zangyo["hours"] + ":" + zangyo["minutes"]);
                        } else {
                            zangyo = to10(zangyo);
                            var shotei = roudo - zangyo;
                            shotei = to60(shotei);
                            var shoteiH = shotei["hours"];
                            var shoteiM = shotei["minutes"];
                            shotei = shoteiH + ":" + shoteiM;
                            zangyo = to60(zangyo);
                            zangyo = zangyo["hours"] + ":" + zangyo["minutes"];
                            self.find("th.outTime").html("0:00");
                            self.find("th.overTime").html(zangyo);
                            self.find("th.inTime").html(shotei); // 所定時間表示
                        }
                    } else {
                        //週単位設定の時
                        if (holiday == 0) {
                            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
                            $("#alert").css("color", "blue");
                            zangyo = to10("0:00");
                            self.find("th.outTime").html(shotei);
                            self.find("th.overTime").html("0:00");
                            self.find("th.inTime").html("0:00"); // 所定時間表示
                        } else {
                            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
                            $("#alert").css("color", "blue");
                            zangyo = to10("0:00");
                            self.find("th.outTime").html("0:00");
                            self.find("th.overTime").html("0:00");
                            self.find("th.inTime").html(shotei); // 所定時間表示
                        }
                    }
                }
            }
            self.find("td.restTime").html(kyukei.val());
        }
        if (presFlag == 1) {
            $("#alert").text("所定外勤務時間は更新ボタンを押した後に再計算されます。");
            $("#alert").css("color", "blue");
        }
    }
}
function rest_toggle() {
    return function () {
        if ($(this).hasClass('dis') != true/* && $(this).text() != ''*/) {
            var kyukei = $("<input>").attr("type", "text").val($(this).text());
            $(this).html(kyukei);
            $(this).find("input").select();
            $("input", this).focus().blur(restToggleFunction);
            $("input", this).keydown(restToggleFunction);
        }
    }
}
//============================================
// DB存在チェック
//============================================
function checkDB(staffID, ymd, KintaiNo) {
    var kintai = null;
    database.get(
        "SELECT staffID, ymd, kintaiNo FROM MK_kintai" +
        " WHERE staffID ='" + staffID + "' AND ymd ='" + ymd + "' AND kintaiNo ='" + KintaiNo + "'",
        function (data) {
            kintai = data;
        }
    );
    if (kintai != null) {
        return true;
    }
    return false;
}