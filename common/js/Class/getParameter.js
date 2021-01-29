//*****************************************
// 共通変数の定義
//*****************************************
var database = new Database();
var master = new Master();
//*****************************************
// データベースの参照先
//*****************************************
var DB_ACCOUNT_NAME = "dev";
//*****************************************
// ①ログアウト時に戻る、初期画面
// ②仮登録、本登録時に必要なバージョン情報
//*****************************************
//***************************************
// エラー・コンファーム表示のメッセージ
//***************************************
var KAKUNIN = "入力中の内容が保存されていません。よろしいですか？";
//*****************************************
// GET通信でのパラメーター取得
//*****************************************
function getParameter() {
    var result = {};
    if (1 < window.location.search.length) {
        var query = window.location.search.substring(1);
        var parameters = query.split('&');
        for (var i = 0; i < parameters.length; i++) {
            var element = parameters[i].split('=');
            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);
            result[paramName] = paramValue;
        }
    }
    return result;
}
//*****************************************
// ローディングの処理
//*****************************************
function stopload() {
    var h = $(window).height();
    $('#loader-bg ,#loader').height(h).css('display', 'block');
    $('#loader-bg').delay(600).fadeOut(600);
    $('#loader').delay(400).fadeOut(200);
}
function smartPhoneLoad() {
    var h = 3000;
    $('#loader-bg').height(h).css('display', 'block');
    $('#loader-bg').delay(300).fadeOut(300);
}
function loadingHide() {
    $('#loader-bg').hide();
    $('#loader').hide();
}
function loadingShow() {
    $('#loader-bg').show();
    $('#loader').show();
}
//*************************************
// 現在時刻の取得
//*************************************
function g_getTalkTime() {
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    var day = nowDate.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    var hour = nowDate.getHours();
    if (hour < 10) {
        hour = "0" + hour;
    }
    var minute = nowDate.getMinutes();
    if (minute < 10) {
        minute = "0" + minute;
    }
    var second = nowDate.getSeconds();
    if (second < 10) {
        second = "0" + second;
    }
    var talkTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    return talkTime;
}
//*************************************
// 通知可・不可の判定処理
//*************************************
function permit(registerID) {
    var calNo = "";
    var holidayFlg = 0;
    var startPermit = "";
    var holi = "";
    // フォームロード時の日付の取得
    var YM = new Date();
    var yyyy = YM.getFullYear();
    var mm = addZero(YM.getMonth() + 1);
    var dd = addZero(YM.getDate());
    var today = yyyy + "/" + mm + "/" + dd;
    // 通知判定用の現在時刻
    var hour = YM.getHours();
    if (hour < 10) {
        hour = "0" + hour;
    }
    var minute = YM.getMinutes();
    if (minute < 10) {
        minute = "0" + minute;
    }
    var nowTime = to10(hour + ":" + minute);
    // レジスタIDから対象スタッフIDを取得
    var sendStaff = "";
    database.get(
        "SELECT staffID,companyID FROM MK_smartPhone WHERE registerID=N'" + registerID + "'",
        function (data) {
            sendStaff = data;
        }
    );
    var companyID = sendStaff[0]["companyID"];
    //カレンダーデータの取得
    var staffParam = master.read(
        "SELECT calendarID " +
        "FROM MK_staff ", ["staffID = '" + sendStaff[0]["staffID"] + "'", "companyID ='" + companyID + "'"],
        null
    );
    if (staffParam != null) {
        calNo = staffParam[0]["calendarID"];
    }
    var holidayData = master.read(
        "SELECT" +
        "    number," +
        "    calYmd," +
        "    holiday," +
        "    companyID" +
        " FROM" +
        "    MK_calendar", [
        "calYmd = '" + today + "'",
        "companyID = '" + companyID + "'",
        "number = '" + calNo + "'"
    ],
        null
    );
    if (holidayData == null) {
        holidayFlg = 0; //平日
    } else {
        holidayFlg = 1; //休日
    }
    // 該当スタッフの情報を取得する
    var kojinData = master.read(
        "SELECT" +
        " DISTINCT" +
        "    MK_staff.staffID," +
        "    MK_staff.name," +
        "    MK_staff.entDate," +
        "    MK_staff.url," +
        "    MK_post.postName," +
        "    MK_kubun.kubunName," +
        "    MK_pattern.startWork," +
        "    MK_pattern.endWork" +
        " FROM MK_staff" +
        " INNER JOIN MK_post ON" +
        "    MK_staff.postID = MK_post.postID AND" +
        "    MK_staff.companyID = MK_post.companyID" +
        " INNER JOIN MK_kubun ON" +
        "    MK_staff.kubun = MK_kubun.kubun AND" +
        "    MK_staff.companyID = MK_kubun.companyID" +
        " INNER JOIN MK_pattern ON" +
        "    MK_staff.patternNo = MK_pattern.patternNo AND" +
        "    MK_staff.companyID = MK_pattern.companyID", [
        "MK_staff.staffID ='" + sendStaff[0]["staffID"] + "'",
        "MK_staff.companyID ='" + companyID + "'"
    ],
        null
    );
    if (kojinData == null) { } else {
        startPermit = kojinData[0]["startWork"];
        endPermit = kojinData[0]["endWork"];
    }
    //通知設定の取得
    var notifyData = master.read(
        "SELECT" +
        "    startPermit," +
        "    endPermit," +
        "    holiday," +
        "    weekday" +
        " FROM MK_kojinSet", [
        "staffID ='" + sendStaff[0]["staffID"] + "'",
        "companyID ='" + companyID + "'"
    ],
        null
    );
    var weekdayFlag = 0;
    if (notifyData == null) {
        startPermit = startPermit;
        endPermit = endPermit;
        holi = "0";
    } else {
        weekdayFlag = parseInt(notifyData[0]["weekday"], 10);
        switch (weekdayFlag) {
            case 0:
                startPermit = startPermit;
                endPermit = endPermit;
                break;
            case 1:
                startPermit = "0.0";
                endPermit = "0.0";
                break;
            case 2:
                startPermit = "5.0";
                endPermit = "22.0";
                break;
        }
        holi = notifyData[0]["holiday"];
    }
    // 最終判定
    if (holidayFlg == 1) {
        //休日の時
        if (holi == "0") {
            //休日通知無し設定の時
            return false;
        } else {
            //休日通知する設定の時で現在時刻が通知可能時刻範囲の時
            if (nowTime >= startPermit && nowTime <= endPermit) {
                return true;
            } else {
                //通知可能時間を過ぎている時
                return false;
            }
        }
    } else {
        //平日の時
        if (nowTime >= startPermit && nowTime <= endPermit) {
            return true;
        } else {
            //通知可能時間を過ぎている時
            return false;
        }
    }
}
//*************************************
// 未読通知履歴の挿入
//*************************************
function newHistory(category, ymdTime, staffID, groupID, compID) {
    // データベースに登録
    var flg = master.entry(
        "MK_history",
        "", [
        "category",
        "ymdTime",
        "staffID",
        "externNo",
        "companyID",
        "flag"
    ], [
        "'" + category + "'",
        "'" + ymdTime + "'",
        "N'" + staffID + "'",
        "N'" + groupID + "'",
        "N'" + compID + "'",
        "'0'"
    ]
    );
    return flg;
}
async function fetchNewHistory(category, ymdTime, staffID, groupID, compID) {
    // データベースに登録
    database.postFetch(
        'mappingPostHistory',
        [
            compID,
            staffID,
            groupID,
            ymdTime,
            category,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
        })
        .catch(() => {
            Materialize.toast('EPARA0001 : 更新履歴をDBに挿入するに失敗しました。', 3000);
        })
}
//*************************************
// バーのアニメーション処理
//*************************************
function animation() {
    window.addEventListener("load", function (event) {
        var header = $('.but_div2');
        var touchPosY = 0;
        var touchMoveY = 0;
        var animation = false;
        $(window).scroll(function (event) {
            touchMoveY = $(this).scrollTop() - touchPosY;
            touchPosY = $(this).scrollTop();
            if (touchMoveY > 0 && animation == false) {
                animation = true;
                header.animate({
                    top: "-300px"
                },
                    500,
                    function () {
                        animation = false;
                    }
                );
            } else if (touchMoveY < 0 && animation == false) {

                animation = true;
                header.animate({
                    top: "0px"
                },
                    500,
                    function () {
                        animation = false;
                    }
                );
            }
        });
    }, false);
}
//=========================================
// 10進数の時間を分単位に変換する
//=========================================
function toMinute(value) {
    roudou = String(value);
    var roudouArray = roudou.split(".");
    var roudouT = parseInt(roudouArray[0], 10);
    var roudouM = parseFloat("0." + roudouArray[1]) * 60.0;
    roudouM = Math.round(roudouM);
    if (roudouM == 0) {
        roudouM = 0;
    } else if (roudouM == 60) {
        if (roudouT == 23) {
            roudouT = 24;
        } else {
            roudouT++;
        }
        roudouT;
        roudouM = 0;
    } else { }
    return roudouT * 60 + roudouM;
}
//**********************************************//
//   通知を送るための共通処理
//*********************************************//
async function commonPushFunc(
    idm,        //   引数１ ： idm        ： カード情報・・・使用しない時は空白を入れてください。
    registerID, //   引数２ ： registerID ： スマホ識別番号配列
    companyID,  //   引数2.5 ： staffID    ： スタッフ番号
    staffID,    //   引数３ ： staffID    ： スタッフ番号
    msg,        //   引数４ ： 通知メッセージ内容
    mode,       //   引数５ ： 通知モード（0：勤怠）
    //         ： 通知モード（1：会話）
    //         ： 通知モード（2：会話グループ一覧）
    //         ： 通知モード（3：やることリスト）
    //         ： 通知モード（4：お知らせ）
    //         ： 通知モード（5：申請）
    //         ： 通知モード（6：社長FAX機能）
    groupID,        //   引数６ ： 対象グループID・・・使用しない時は空白を入れてください。
    smartPhoneName, //   引数７ ： スマートフォンの種類配列
    silentMode      // 引数８：サイレント通知の時、バッチを更新するときに使用する
) {
    const accountName = localStorage.getItem('accountName');
    const userName = localStorage.getItem('userName');
    const pushInfo = localStorage.getItem('pushInfo');
    $.ajax({
        type: "POST",
        url: "../../common/php/common_push.php",
        cache: false,
        async: true,
        data: {
            'idm': idm,
            'registerID[]': registerID,
            'companyID': companyID,
            'staffID': staffID,
            'msg': msg,
            'mode': mode,
            'groupID': groupID,
            'smartPhoneName[]': smartPhoneName,
            'silentMode': silentMode,
            'accountName': accountName,
            'userName': userName,
            'pushInfo': pushInfo
        },
        dataType: "json",
        // 成功時の処理
        success: function () { },
        // エラー処理
        error: function () { }
    });
}
//=========================================
// バイト数文字列切り出し関数
// 第一引数：text：対象文字列
// 第二引数：len：有効バイト数
// 第三引数：truncation：末尾文字列
// 戻り値  ：text
//=========================================
function byteSubstr(text, len, truncation) {
    if (truncation === undefined) { truncation = ''; }
    var text_array = text.split('');
    var count = 0;
    var str = '';
    for (var i = 0; i < text_array.length; i++) {
        var n = escape(text_array[i]);
        if (n.length < 4) {
            count++;
        } else {
            count += 2;
        }
        if (count > len) {
            return str + truncation;
        }
        str += text.charAt(i);
    }
    return text;
}
//=========================================
// テキストエリアのリサイズ
//=========================================
function init(element) {
    var textarea = element;
    for (var i = 0; i < textarea.length; i++) {
        resize(textarea[i]);
    }
    element.bind('keyup', resize);
}

function resize(textarea) {
    if (textarea.type != "textarea") {
        return;
    }
    var $textarea = $(textarea);
    var areaH = $textarea.height();
    if (textarea.innerText == "") {
        areaH = 26 + "px";
    }
    areaH = parseInt(areaH, 10) - 30;
    if (areaH < 30) {
        areaH = 30;
    }
    $textarea.height(areaH + "px");
    $textarea.height((parseInt(textarea.scrollHeight, 10)) + "px");
}

function dateToFormatString(date, fmt, locale, pad) {
    // %fmt% を日付時刻表記に。
    // 引数
    //  date:  Dateオブジェクト
    //  fmt:   フォーマット文字列、%YYYY%年%MM%月%DD%日、など。
    //  locale:地域指定。デフォルト（入力なし）の場合はja-JP（日本）。現在他に対応しているのはen-US（英語）のみ。
    //  pad:   パディング（桁数を埋める）文字列。デフォルト（入力なし）の場合は0。
    // 例：2016年03月02日15時24分09秒
    // %YYYY%:4桁年（2016）
    // %YY%:2桁年（16）
    // %MMMM%:月の長い表記、日本語では数字のみ、英語ではMarchなど（3）
    // %MMM%:月の短い表記、日本語では数字のみ、英語ではMar.など（3）
    // %MM%:2桁月（03）
    // %M%:月（3）
    // %DD%:2桁日（02）
    // %D%:日（2）
    // %HH%:2桁で表した24時間表記の時（15）
    // %H%:24時間表記の時（15）
    // %h%:2桁で表した12時間表記の時（03）
    // %h%:12時間表記の時（3）
    // %A%:AM/PM表記（PM）
    // %A%:午前/午後表記（午後）
    // %mm%:2桁分（24）
    // %m%:分（24）
    // %ss%:2桁秒（09）
    // %s%:秒（9）
    // %W%:曜日の長い表記（水曜日）
    // %w%:曜日の短い表記（水）
    var padding = function (n, d, p) {
        p = p || '0';
        return (p.repeat(d) + n).slice(-d);
    };
    var DEFAULT_LOCALE = 'ja-JP';
    var getDataByLocale = function (locale, obj, param) {
        var array = obj[locale] || obj[DEFAULT_LOCALE];
        return array[param];
    };
    var format = {
        'YYYY': function () { return padding(date.getFullYear(), 4, pad); },
        'YY': function () { return padding(date.getFullYear() % 100, 2, pad); },
        'MMMM': function (locale) {
            var month = {
                'ja-JP': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                'en-US': ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ]
            };
            return getDataByLocale(locale, month, date.getMonth());
        },
        'MMM': function (locale) {
            var month = {
                'ja-JP': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                'en-US': ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
                    'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
                ]
            };
            return getDataByLocale(locale, month, date.getMonth());
        },
        'MM': function () { return padding(date.getMonth() + 1, 2, pad); },
        'M': function () { return date.getMonth() + 1; },
        'DD': function () { return padding(date.getDate(), 2, pad); },
        'D': function () { return date.getDate(); },
        'HH': function () { return padding(date.getHours(), 2, pad); },
        'H': function () { return date.getHours(); },
        'hh': function () { return padding(date.getHours() % 12, 2, pad); },
        'h': function () { return date.getHours() % 12; },
        'mm': function () { return padding(date.getMinutes(), 2, pad); },
        'm': function () { return date.getMinutes(); },
        'ss': function () { return padding(date.getSeconds(), 2, pad); },
        's': function () { return date.getSeconds(); },
        'A': function () {
            return date.getHours() < 12 ? 'AM' : 'PM';
        },
        'a': function (locale) {
            var ampm = {
                'ja-JP': ['午前', '午後'],
                'en-US': ['am', 'pm']
            };
            return getDataByLocale(locale, ampm, date.getHours() < 12 ? 0 : 1);
        },
        'W': function (locale) {
            var weekday = {
                'ja-JP': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            };
            return getDataByLocale(locale, weekday, date.getDay());
        },
        'w': function (locale) {
            var weekday = {
                'ja-JP': ['日', '月', '火', '水', '木', '金', '土'],
                'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
            };
            return getDataByLocale(locale, weekday, date.getDay());
        }
    };
    var fmtstr = ['']; // %%（%として出力される）用に空文字をセット。
    Object.keys(format).forEach(function (key) {
        fmtstr.push(key); // ['', 'YYYY', 'YY', 'MMMM',... 'W', 'w']のような配列が生成される。
    });
    var re = new RegExp('%(' + fmtstr.join('|') + ')%', 'g');
    // /%(|YYYY|YY|MMMM|...W|w)%/g のような正規表現が生成される。
    var replaceFn = function (match, fmt) {
        // match には%YYYY%などのマッチした文字列が、fmtにはYYYYなどの%を除くフォーマット文字列が入る。
        if (fmt === '') {
            return '%';
        }
        var func = format[fmt];
        // fmtがYYYYなら、format['YYYY']がfuncに代入される。つまり、
        // function() { return padding(date.getFullYear(), 4, pad); }という関数が代入される。
        if (func === undefined) {
            //存在しないフォーマット
            return match;
        }
        return func(locale);
    };
    return fmt.replace(re, replaceFn);
}
//=========================================
// 時間の10進化
//=========================================
function to10(value) {
    timeAll = value;
    var timeArray = timeAll.split(":");
    var timeT = parseFloat(timeArray[0]) + parseFloat(parseInt(timeArray[1], 10) / 60);
    return timeT;
}
//=========================================
// 時間の60進化
//=========================================
function to60(value) {
    var fRoudou = parseFloat(value); // 一旦値をFLOAT型に変化する
    var roudou = String(fRoudou); // 文字型に変化する
    var roudouArray = roudou.split(".");
    var roudouT = parseInt(roudouArray[0], 10);
    var roudouM = parseFloat("0." + roudouArray[1]) * 60.0;
    roudouM = addZero(Math.round(roudouM));
    if (roudouM == 0) {
        roudouM = "00";
    } else if (roudouM == 60) {
        if (roudouT == 23) {
            roudouT = 24;
        } else {
            roudouT++;
        }
        addZero(roudouT);
        roudouM = "00";
    } else {
        roudouM = roudouM.toString();
        roudouM = roudouM.substring(0, 2);
    }
    return { hours: roudouT, minutes: roudouM };
}
//=========================================
//  2桁のゼロ埋め関数
//=========================================
function addZero(num) {
    return ('0' + num).slice(-2);
}
//=========================================
//  3桁のゼロ埋め関数
//=========================================
function addZero3(num) {
    return ('00' + num).slice(-3);
}
//**********************************************//
// 日付時刻の取得
//**********************************************//
function makeDateTime() {
    var DWs = new Array("日", "月", "火", "水", "木", "金", "土");
    var Now = new Date();
    var YY = Now.getYear();
    if (YY < 2000) { YY += 1900; }
    var MM = addZero(Now.getMonth() + 1);
    var DD = addZero(Now.getDate());
    var DW = DWs[Now.getDay()];
    var hh = addZero(Now.getHours());
    var mm = addZero(Now.getMinutes());
    var ss = addZero(Now.getSeconds());
    var YMD = YY + "/" + MM + "/" + DD;
    var m1 = mm / 60;
    var hhm1 = parseFloat(hh) + parseFloat(m1); // Float型に変換して計算
    // 日付
    $("#ymd").val(YMD);
    // 時刻
    $("#time").val(hhm1);
    // 曜日
    $("#week").val(DW);
}
//**********************************************//
// 日付時刻の取得
//**********************************************//
function makeDateTimeJson() {
    var DWs = new Array("日", "月", "火", "水", "木", "金", "土");
    var Now = new Date();
    var YY = Now.getYear();
    if (YY < 2000) { YY += 1900; }
    var MM = addZero(Now.getMonth() + 1);
    var DD = addZero(Now.getDate());
    var DW = DWs[Now.getDay()];
    var hh = addZero(Now.getHours());
    var mm = addZero(Now.getMinutes());
    var ss = addZero(Now.getSeconds());
    var YMD = YY + "/" + MM + "/" + DD;
    var m1 = mm / 60;
    var hhm1 = parseFloat(hh) + parseFloat(m1); // Float型に変換して計算
    return { ymd: YMD, time: hhm1, week: DW };
}
/**
 * 与えられた日付の月末日付を返す関数。
 * @param dt 元の日付 Dateクラス
 */
function getLastDayOfMonth(dt) {
    return new Date(
        dt.getFullYear(),
        dt.getMonth() + 1, 0
    );
}

function kirisute(val, pow) {
    var value = parseFloat(val);
    return Math.floor(value * Math.pow(10, pow)) / Math.pow(10, pow);
}