"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*******************************************************************
const FAX_SHOW_LENGTH = 150;
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1024() {
    // 初期化クラスを継承する
    Init.call(this);
    this.faxData = null;
    this.cropper = null;
    this.canvas = '';
    this.tiffCount1 = 0;
    this.tiffCount2 = 0;
    this.arrayCanvas = [];
}
MainClass1024.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.maeShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        self.canvas = document.getElementById('mycanvas');
        self.sel('.modal').modal({
            endingTop: 0,
            ready: function(modal, trigger) {},
            complete: function() {}
            // Callback for Modal close
        });
        return true;
    },
    //=========================================
    // チェック＆取得
    // データベースのチェック＆取得処理を記述してください。
    //=========================================
    checkGetData: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.checkGetData.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // FAX情報の取得
        //------------------------------------------------
        const faxData = self.master.read(
            "SELECT TOP " + FAX_SHOW_LENGTH +
            " *" +
            " FROM" +
            "    MK_faxSend INNER JOIN" +
            "    MK_historyOption ON MK_faxSend.companyID = MK_historyOption.companyID AND" +
            "    MK_faxSend.faxID = MK_historyOption.externNo" +
            " WHERE" +
            "    MK_historyOption.category = 6 AND" +
            "    MK_faxSend.companyID = N'" + self.companyID + "' AND" +
            "    MK_historyOption.staffID = N'" + self.staff + "'" +
            " ORDER BY" +
            "    MK_faxSend.faxDateTime DESC"
        );
        if (false === self.exception.check(
                faxData,
                ExceptionServerOn,
                ExceptionSystemOn,
                "102402",
                "FAX情報の取得ができませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.faxData = faxData;
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.initShow.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        //------------------------------------------------
        // FAX一覧の表示
        //------------------------------------------------
        let tanmatu = "";
        if (navigator.userAgent.indexOf('Android') > 0) {
            tanmatu = 'Android';
        }
        let faxDateTime = ''; //受信日
        let midokuIcon = null; //未読or既読
        let faxImage = null; //イメージURL
        let okiniiri = null; //ブックマーク判定
        let faxID = null; //詳細遷移用FAXID
        let faxFlag = null; //手動、自動の判定用
        let hideDateTime = null; //隠し項目受信日時
        let hideDate = null;
        let hideTime = null;
        let html = "";
        let midokuBadge = "";
        let strBookMark = "";
        Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 });
        for (let i in self.faxData) {
            faxDateTime = self.faxData[i].faxDateTime.substring(0, 10);
            hideDateTime = ((self.faxData[i].faxDateTime.substring(0, 16)).slice(5)).split(" ");
            hideDate = hideDateTime[0].split("-");
            const hideM = parseInt(hideDate[0], 10);
            const hideD = parseInt(hideDate[1], 10);
            hideDate = hideM + "月" + hideD + "日";
            hideTime = hideDateTime[1];
            hideDateTime = hideDate + " " + hideTime;
            midokuIcon = self.faxData[i].flag;
            faxImage = self.companyID + "/" + self.faxData[i].faxKyoten + "/" + self.faxData[i].imagePass;
            const strFile = self.faxData[i].imagePass.split(".");
            let fileType = strFile[1];
            if (fileType == "PDF") {
                fileType = "pdf";
            } else if (fileType == "tiff") {
                fileType = "tif";
            }
            okiniiri = self.faxData[i].okiniFlag;
            faxID = self.faxData[i].faxID;
            faxFlag = self.faxData[i].faxFlag;
            //＜自動転送＞
            if (midokuIcon == "0" && faxFlag == "0") {
                midokuBadge = "<span class='badge blue'></span>";
            } else if (midokuIcon == "0" && faxFlag == "1") {
                // ＜手動転送＞
                midokuBadge = "<span class='badge red'></span>";
            } else {
                // 上記以外
                // バッチを表示しない
                midokuBadge = "";
            }
            // ブックマーク表示処理
            if (okiniiri == "1" && faxFlag == "0") {
                // ＜自動転送＞
                // 【黄色の星マークで、お気に入り】と表示する
                strBookMark = "<p id='bookMarkYLButton' class='material-icons'>star</p><p class='bm' id='bm'>お気に入り</p>";
            } else if (okiniiri == "1" && faxFlag == "1") {
                // ＜手動転送＞
                // 【赤色の星マークで、重要】と表示する
                strBookMark = "<p id='bookMarkRdButton' class='material-icons'>star</p><p class='bm' id='bm'>重要</p>";
            } else {
                // 上記以外
                //  【白抜きの星マーク】を表示する
                strBookMark = "<p id='bookMarkOffButton' class='material-icons'>star_border</p><p class='bm'></p>";
            }
            const stringDateTime = dateToFormatString(new Date(faxDateTime), '%YYYY%年%M%月%D%日');
            function draw(thumbnail) {
                if (i > 0) {
                    const bfFaxDate = self.faxData[i - 1].faxDateTime.substring(0, 10);
                    if (faxDateTime != bfFaxDate) {
                        //日付けが違う時、次のセクションを作る
                        html += `
                        </section>
                        <section id='date${i}'>
                            <div class='hiduke'>${stringDateTime}</div>
                            <div class='unit' id='unit${i}'>
                                <div class='icon' id='midoku${i}'>
                                    <p class='badge'>
                                        ${midokuBadge}
                                    </p>
                                </div>
                                ${thumbnail}
                                <input type='hidden' class='hideDateTime' value='${hideDateTime}'>
                                <div class='bmButton' id='fax${faxID}'>
                                    ${strBookMark}
                                    <input type='hidden' id='flag' value='${faxFlag}'>
                                </div>
                            </div>
                        `;
                    } else {
                        html += "<div class='unit' id='unit" + i + "'>" +
                            "<div class='icon' id='midoku" + i + "'>" +
                            "<p class='badge'>" +
                            midokuBadge +
                            "</p>" +
                            "</div>" +
                            thumbnail +
                            "<input type='hidden' class='hideDateTime' value='" + hideDateTime + "'>" +
                            "<div class='bmButton' id='fax" + faxID + "'>" +
                            strBookMark +
                            "<input type='hidden' id='flag' value='" + faxFlag + "'>" +
                            "</div>" +
                            "</div>";
                    }
                } else {
                    html = "<section id='date" + i + "'>" +
                        "<div class='hiduke'>" + stringDateTime + "</div>" +
                        "<div class='unit' id='unit" + i + "'>" +
                        "<div class='icon' id='midoku" + i + "'>" +
                        "<p class='badge'>" +
                        midokuBadge +
                        "</p>" +
                        "</div>" +
                        thumbnail +
                        "<input type='hidden' class='hideDateTime' value='" + hideDateTime + "'>" +
                        "<div class='bmButton' id='fax" + faxID + "'>" +
                        strBookMark +
                        "<input type='hidden' id='flag' value='" + faxFlag + "'>" +
                        "</div>" +
                        "</div>";
                }
            }
            if (fileType == "tif") {
                if (tanmatu == "Android") {
                    const loadImage = function(filename, count) {
                        const promise = new Promise(function(resolve, reject) {
                            const xhr = new XMLHttpRequest();
                            xhr.open(
                                'GET',
                                filename,
                                true
                            );
                            xhr.responseType = 'arraybuffer';
                            xhr.onload = function(data) {
                                const buffer = xhr.response;
                                const tiff = new Tiff({ buffer: buffer });
                                const canvas = tiff.toCanvas(); // TIFFをcanvasに変換
                                self.arrayCanvas[count] = canvas;
                                resolve(count);
                            };
                            xhr.send(null);
                        });
                        return promise;
                    };
                    loadImage(
                            "../../../../fax_data/send/intexk/" + faxImage,
                            self.tiffCount1++)
                        .then(
                            function(count) {
                                self.sel('#tiff_canvas' + count).append(self.arrayCanvas[count]);
                            },
                            function() {}
                        );
                    draw(
                        "<section class='tiff_canvas' id='tiff_canvas" + (self.tiffCount1 - 1) + "'>" +
                        "<input type='hidden' value='../../../../fax_data/send/intexk/" + faxImage + "'>" +
                        "</section>"
                    );
                } else {
                    draw("<img src='../../../../fax_data/send/intexk/" + faxImage + "' class='faxImage tiff'>");
                }
            } else {
                draw("<img src='../../../../fax_data/send/intexk/" + faxImage + "' class='faxImage'>");
            }
        }
        html += "</section>";
        self.sel("#faxList").append(html);
        return true;
    },
    //=========================================
    // 後処理
    // 引き渡し情報の取得処理を記述してください。
    //=========================================
    atoShori: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.atoShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    },
    //=========================================
    // 利用可能期間のチェック
    //=========================================
    asyncAvailable: function () {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.asyncAvailable.call(this) == false) {
            return false;
        }
    },
};