"use strict";
//****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//****************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1004() {
    // 初期化クラスを継承する
    Init.call(this);
    this.timer = null
    this.todokedeCount = 0;
    this.version = '';
    this.versionData = '';
    this.dakokuCount = 0;
    this.chatMidokuCount = 0;
    this.todoMidokuCount = 0;
    this.faxCount = 0;
    this.faxAutoCount = 0;
    this.faxRec = null;
    this.faxRirekiCount = 0;
    this.nrCount = 0;
    this.gpsFlg = false;
}
MainClass1004.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function () {
        const self = this;
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        let regid = self.registerID;
        let udid = self.udid;
        const loRegid = localStorage.getItem('registerID');
        const loUdid = localStorage.getItem('udid');
        // パラメータのregisterIDがないかどうか
        if (regid == undefined || regid == 'undefined' || regid == "") {
            if (loRegid == undefined || loRegid == 'undefined' || loRegid == "") {
                // パラメータとローカルストレージのregisterIDが取得できない場合
                // アプリを終了メッセージ画面を表示する「スタッフ情報が取得出来ませんでした」
                self.exception.check(
                    ExceptionSystemError,
                    ExceptionServerOff,
                    ExceptionSystemOn,
                    "100401",
                    "端末識別IDの取得が出来ませんでした。",
                    ExceptionParamToLogin,
                    regid,
                    udid
                );
                return false;
            } else {
                // ローカルストレージのregisterIDを取得
                regid = loRegid.replace(/\s+/g, "");
            }
        } else {
            // パラメータのregisterIDを取得
            regid = regid.replace(/\s+/g, "");
        }
        // 端末情報の取得
        self.getRegisterInfo(regid)
        // パラメータのudidがないかどうか
        if (udid == undefined ||
            udid == 'undefined' ||
            udid == "" ||
            udid == null ||
            udid == "null"
        ) {
            if (loUdid == undefined ||
                loUdid == 'undefined' ||
                loUdid == "" ||
                loUdid == null ||
                loUdid == "null"
            ) {
                // パラメータとローカルストレージのudidが取得できない場合
                udid = "";
            } else {
                // ローカルストレージのudidを取得
                udid = loUdid.replace(/\s+/g, "");
            }
        }
        // セッションストレージに保存する
        localStorage.setItem("registerID", regid);
        localStorage.setItem("udid", udid);
        self.registerID = regid;
        self.udid = udid;
        // 親クラスの同メソッドを起動
        if (Init.prototype.maeShori.call(this) == false) {
            return false;
        }
        self.sel(".modal").modal({
            ready: function () { },
            complete: function () { } // Callback for Modal close
        });
        return true;
    },
    //=========================================
    // チェック＆取得
    // データベースのチェック＆取得処理を記述してください。
    //=========================================
    checkGetData: function () {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.checkGetData.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        //-------------------------------------------
        // バージョン情報の取得
        //-------------------------------------------
        self.database.getFetch(
            'mappingGetSystemInfo',
            [ self.companyID ],
            'gaia_kanri',
            'gaia_kanri',
        ).then(response => response.json())
            .then(data => {
                console.log('Success:', data)
                self.version = data[0].versionValue;
                localStorage.setItem("versionName", self.version);
                // アプリバージョン情報を表示する
                self.sel("#version").html("現在のバージョン：" + self.version + ".262");
            })
            .catch(() => {
                Materialize.toast('E100401 : バージョン情報の取得に失敗しました。', 3000);
            })
        //-------------------------------------------
        // 未読数の取得
        //-------------------------------------------
        self.getBadgeTodo()
        self.getBadgeChat()
        self.getBadgeSinsei()
        self.showFaxIconBadge()
        self.showGPSIconBadge()
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow: function () {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.initShow.call(this) == false) {
            return false;
        }
        if (Init.prototype.header.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // 初期起動時の処理
        self.sel(".dynamic-dom").html("");
        $('footer').show();
        if (navigator.userAgent.indexOf('Android') > 0) {
            $("footer").css('height', '12vw');
            self.sel(".logo").css('margin-top', '14vw');
        }
        self.showClock1();
        //////////////////////////////////////////////
        //        以下モーダルエリアの表示              //
        //////////////////////////////////////////////
        if (self.oshirasePopup() == false) {
            // エラーが発生した時、以下の処理を行わない
            return false;
        }
        return true;
    },
    //=========================================
    // 初期表示
    // FAXのバッチ描画
    //=========================================
    initShowFax: function () {
        const self = this;
        //-------------------------------------------
        // FAXボタンの表示切替
        //-------------------------------------------
        if (self.faxRec != "-1") {
            //ボタン表示
            if (self.faxRirekiCount > 0) {
                if (self.faxCount >= 100) {
                    self.faxCount = 99;
                }
                if (self.faxCount > 0) {
                    // 手動（赤）カウント表示
                    self.sel("#faxIconRed").html(
                        _.template(self.sel("#badge").html())({
                            className: "red",
                            badgeCount: self.faxCount
                        })
                    );
                }
                if (self.faxAutoCount >= 100) {
                    self.faxAutoCount = 99;
                }
                if (self.faxAutoCount > 0) {
                    //自動（青）カウント表示
                    self.sel("#faxIconBlue").html(
                        _.template(self.sel("#badge").html())({
                            className: "blue",
                            badgeCount: self.faxAutoCount
                        })
                    );
                }
            } else {
                // 非活性とする
                self.sel("#faxArea").css({
                    "background-color": "gray",
                    "opacity": "0.4"
                });
                self.sel("#fax").prop('disabled', true);
            }
        } else {
            // 非表示
            self.sel("#faxArea").remove();
            self.sel(".colorfilter-base").css("width", "100%");
        }
        return true;
    },
    //=========================================
    // 初期表示
    // やることリストのバッチ描画
    //=========================================
    initShowTodo: function () {
        const self = this;
        // やることの未読数の初期表示
        if (self.todoMidokuCount >= 100) {
            self.todoMidokuCount = 99;
        }
        if (self.todoMidokuCount > 0) {
            self.sel("#todoIcon").append(
                _.template(self.sel("#badge").html())({
                    className: "red",
                    badgeCount: self.todoMidokuCount
                })
            );
        }
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShowVersion: function (versionData) {
        const self = this;
        self.version = versionData[0].versionValue;
        localStorage.setItem("versionName", self.version);
        // アプリバージョン情報を表示する
        self.sel("#version").html("現在のバージョン：" + self.version + ".262");
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShowGps: function () {
        const self = this;
        return true;
    },
    //=========================================
    // 後処理
    // 引き渡し情報の取得処理を記述してください。
    //=========================================
    atoShori: function () {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.atoShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        self.sel(".collapsible").collapsible();
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
    }
};