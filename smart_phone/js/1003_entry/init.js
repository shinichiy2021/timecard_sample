//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass() {
    // 初期化クラスを継承する
    Init.call(this);
    this.regid = '';
    this.udid = '';
    this.email ='';
    this.user;
    this.passWord;
    this.appid;
    this.tanmatuName;
}
MainClass.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        smartPhoneLoad();
        self.regid = self._GET.registerID;
        self.udid = self._GET.udid;
        self.email = self._GET.email;
        self.accountName = self._GET.accountName;
        self.userName = self._GET.userName;
        // registerIDにスペースがある場合、取り除く
        if (self.regid == undefined || self.regid == 'undefined' || self.regid == "") {
            self.regid = Math.floor(Math.random() * 9999999999);
        } else {
            self.regid = self.regid.replace(/\s+/g, "");
        }
        if (self.udid == undefined || self.udid == "undefined" || self.udid == null || self.udid == "null") {
            self.udid = "";
        }
        // udid有りの時Android
        self.tanmatuName = "";
        if (self.udid != "") {
            self.tanmatuName = "Android";
        } else {
            self.tanmatuName = "iPhone";
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
        /////////////////////////////////////////////////
        // ここから処理を記述してください
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
        $('footer').hide();
        // ===================================
        // ボタンを非活性にする処理
        $("#entryButton").attr('disabled', 'disabled');
        // はてなの説明を非表示にする
        $("#exhatena1").hide();
        $("#exhatena2").hide();
        $("#exhatena3").hide();
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
    available: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.available.call(this) == false) {
            return false;
        }
    }
};