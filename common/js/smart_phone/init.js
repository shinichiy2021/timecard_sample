//=========================================
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function Init() {
    this._GET = getParameter();
    // パラメーター情報
    this.database = new Database();
    // データベース情報
    this.master = new Master();
    // マスタークラス
    this.exception = new Exception();
    // 例外クラス
    this.template = new Template();
    // テンプレートクラス
    this.companyID = '';
    // ログイン者の会社番号
    this.companyName = '';
    // ログイン者の会社名
    this.staff = '';
    // ログイン者のスタッフ番号
    this.staffName = '';
    // ログイン者のスタッフ名
    this.admCD = -1;
    // ログイン者の権限コード
    this.editFlag = 0;
    // 変更時のフラグ
    this.ymdA = '';
    // 出力期間の開始日
    this.ymdB = '';
    // 出力期間の終了日
    this.sime = '';
    // 会社の締め日
    this.today = '';
    // 今日の日付
    this.registerID = '';
    this.lineCode = '';
    this.udid = '';
}
Init.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        self.companyID = localStorage.getItem('companyID');
        self.staff = localStorage.getItem("staff");
        self.registerID = localStorage.getItem('registerID');
        self.database.accountName = localStorage.getItem('accountName');
        self.database.userName = localStorage.getItem('userName');
        // 今日の日付の取得
        const YM = new Date();
        const yyyy = YM.getFullYear();
        const mm = addZero(YM.getMonth() + 1);
        const dd = addZero(YM.getDate());
        self.today = yyyy + "/" + mm + "/" + dd;
        // ローディングのストップ
        smartPhoneLoad();
        // 退職者のチェックと利用可能期間のチェック
        if (false === self.asyncAvailable()) {
            self.exception.check(
                ExceptionSystemError,
                ExceptionServerOff,
                ExceptionSystemOn,
                "COMMON",
                "スマホが登録できていません。",
                ExceptionParamToLogin
            );
            return false
        }
    },
    //=========================================
    // チェック＆取得
    // データベースのチェック＆取得処理を記述してください。
    //=========================================
    checkGetData: function() {
        const self = this;
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow: function() {
        const self = this;
        $('body').show();
        // モーダル黒いバック画面の初期化処理
        if ($("#modal1").length > 0) {
            $(".modal-overlay").hide();
        }
        return true;
    },
    //=========================================
    // 後処理
    // 引き渡し情報の取得処理を記述してください。
    //=========================================
    atoShori: function() {
        const self = this;
        sessionStorage.setItem('carousel', 'reverse');
        sessionStorage.setItem('nativeSeni', 'false');
        return true;
    }
};