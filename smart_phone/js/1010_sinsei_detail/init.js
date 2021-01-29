"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//******************************************************************************
function MainClass1010() {
    // function MainClass() {
    // 初期化クラスを継承する
    Init.call(this);
    this.nowShoninFlag = ''; // 申請フラグ
    this.nowSinseiStaff = ''; // 申請スタッフ番号
    this.nowSinseiName = ''; // 申請スタッフ氏名
    this.nowShoninStaff = ''; // 確認スタッフ番号
    this.shoninName = ''; // 確認スタッフ氏名
    this.nowTodokedeName = ''; // 届出の名称
    this.nowTaishouDate = ''; // 届出の期間
    this.shoninStaffMail = ''; // 確認者のメールアドレス
    this.paraSinseiNo = '';
    this.memberData = null;
}
MainClass1010.prototype = {
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
        // 引き継ぎ情報を取得する（パラメータ_引き継ぎを参照）
        self.paraSinseiNo = sessionStorage.getItem('sinseiNo');
        if (self.paraSinseiNo == undefined && self.paraSinseiNo == null) {
            self.exception.check(
                false,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101000",
                "引き継ぎ情報が取得来ませんでした。",
                ExceptionParamToMenu
            );
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
        // リストの表示
        if (false == self.sinseiShosaiDraw(self.paraSinseiNo, true)) {
            // 例外が発生した時に以下の処理を行わない
            return false;
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
    sinseiShosaiDraw: function(paraSinseiNo, buttonFlag) {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.sinseiShosaiDraw.call(this, paraSinseiNo, buttonFlag) == false) {
            return false;
        }
    }
};