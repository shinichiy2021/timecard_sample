"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2018/07/25  所属グループの抽出SQLを変更。グループと明細を二つに分けて取得していたのを一つにまとめました。
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1016() {
    // 初期化クラスを継承する
    Init.call(this);
    this.chatListData = null
}
MainClass1016.prototype = {
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
        // メンバー情報の初期化
        // セッション情報の初期化
        sessionStorage.setItem('arrayStaffID', '');
        sessionStorage.setItem('isChange', 'false');
        // フォームロード時の日付の取得
        localStorage.removeItem('title_text');
        localStorage.removeItem('nowIcon');
        localStorage.removeItem('gMember');
        localStorage.removeItem('meDel');
        // 権限の取得
        self.sel("#admCD").val(self.admCD);
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
        // 共通処理の描画
        if (Init.prototype.header.call(this) == false) {
            return false;
        }
        self.sel('#naviChat img').attr('src', '../img/chat_on.png');
        self.sel('#naviChat p').css('color', '#00ffff');
        self.sel('#naviChat p').css('font-weight', 'bold');
        if (false === self.listShow()) {
            return false
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
    }
};