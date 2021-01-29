"use strict";
//=========================================
// ファイルの変更履歴をここに記入してください。
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass10011() {
    // 初期化クラスを継承する
    Init.call(this);
    this.tanmatuName = '';
    this.versionValue = '';
    this.appTourokuID = '';
}
MainClass10011.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        //=========================================
        // ここから処理を記述してください
        sessionStorage.setItem('carousel', 'normal');
        self.registerID = localStorage.getItem('registerID');
        self.udid = localStorage.getItem('udid');
        sessionStorage.setItem("groupID", self._GET.groupID);
        const loLineToken = self._GET.code;
        const loRegid = self._GET.registerID;
        const loUdid = self._GET.udid;
        // 画面遷移中の描画を非表示にする
        $(".view10011").hide();
        // パラメータのregisterIDがないかどうか
        if (self.registerID === undefined ||
            self.registerID == null ||
            self.registerID === 'undefined' ||
            self.registerID === "") {
            if (undefined === self._GET.code) {
                // GET通信　スマホアプリの場合
                // self.registerID = loRegid.replace(/\s+/g, "")
            } else {
                // GET通信　ラインアプリの場合
                self.lineCode = loLineToken.replace(/\s+/g, "")
                $('#line-renkei').hide()
            }
        } else {
            // パラメータのregisterIDを取得
            self.registerID = self.registerID.replace(/\s+/g, "");
        }
        // パラメータのudidがないかどうか
        if (self.udid == undefined || self.udid == 'undefined' || self.udid == "" || self.udid == null || self.udid == "null") {
            if (loUdid == undefined || loUdid == 'undefined' || loUdid == "" || loUdid == null || loUdid == "null") {
                // パラメータとローカルストレージのudidが取得できない場合
                self.udid = "";
            } else {
                // ローカルストレージのudidを取得
                self.udid = loUdid.replace(/\s+/g, "");
            }
        }
        // udid有りの時Android
        if (self.udid != "") {
            self.tanmatuName = "Android";
        } else {
            self.tanmatuName = "iPhone";
        }
        // 通知から入った場合は、それぞれの画面に遷移させる
        let mode = self._GET.mode;
        // タイムカード画面に遷移する
        if (mode == "0") {
            mode = "0";
            spaHash('#1012', 'normal');
            return false;
        }
        // チャット画面へ遷移する
        else if (mode == "1") {
            mode = "0";
            spaHash('#1017', 'normal');
            return false;
        }
        // 仲間と会話グループへ遷移する
        else if (mode == "2") {
            mode = "0";
            spaHash('#1016', 'normal');
            return false;
        }
        // やることカテゴリーへ遷移する
        else if (mode == "3") {
            mode = "0";
            spaHash('#1013', 'normal');
            return false;
        }
        // お知らせへ遷移する
        else if (mode == "4") {
            mode = "0";
            spaHash('#1006', 'normal');
            return false;
        }
        // 申請を出した人の通知の時はタイムカード画面へ遷移させる
        else if (mode == "5") {
            mode = "0";
            spaHash('#1012', 'normal');
            return false;
        }
        // FAX詳細画面
        else if (mode == "6") {
            mode = "0";
            spaHash('#1024', 'normal');
            return false;
        }
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
        //=========================================
        // ここから処理を記述してください
        if (localStorage.getItem("loginFlg") == 'OK') {
            localStorage.setItem('registerID', self.registerID);
            localStorage.setItem('udid', self.udid);
            location.href =
                "1001_login.html" +
                "?mode=" + self.pushMode +
                "&groupID=" + self.pushGroupID +
                "&registerID=" + self.registerID +
                "&udid=" + self.udid +
                "#1004";
            return false;
        } else {
            $(".view10011").show();
            // ローカルストレージの情報をクリアする。（ログアウト状態にする）
            localStorage.clear();
            // セッションストレージに保存する
            localStorage.setItem("registerID", self.registerID);
            localStorage.setItem("udid", self.udid);
            localStorage.setItem("gamenID", '10011');
        }
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
        //=========================================
        // ここから処理を記述してください
        // 2018/11/20
        // yamazaki
        //=========================================
        $("#email").val("");
        $("#passWord").val("");
        $('footer').hide();
        if (undefined !== self._GET.code) {
            // GET通信　ラインアプリの場合
            $('.line-renkei').hide()
            $('#line-caution').hide()
        } else {
            $('.link').hide()
            $('#login').hide()
            $('#btnLogin').hide()
            $('#smartPhone').hide()
        }
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
        //=========================================
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
    }
};