"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
class MainClass1009 {
    constructor() {
        // 初期化クラスを継承する
        Init.call(this);
    }
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori() {
        // 親クラスの同メソッドを起動
        if (Init.prototype.maeShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // スライドナビゲーションの初期化
        this.sel('.button-collapse').sideNav({
            menuWidth: '75vw',  // Default is 300
            edge: 'right',      // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true,    // Choose whether you can drag to open on touch screens,
            onOpen: function() {    /* Do Stuff */ }, // A function to be called when sideNav is opened
            onClose: function() {   /* Do Stuff */ }, // A function to be called when sideNav is closed
        });
        return true;
    }
    //=========================================
    // チェック＆取得
    // データベースのチェック＆取得処理を記述してください。
    //=========================================
    checkGetData() {
        // 親クラスの同メソッドを起動
        if (Init.prototype.checkGetData.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    }
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow() {
        // 親クラスの同メソッドを起動
        if (Init.prototype.initShow.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        $('footer').hide();
        // スライドナビゲーションの初期表示
        this.sel('#default').css('background', '#e4e7fd');
        this.sel('#toSinsei').css('background', 'white');
        this.sel('#fromSinsei').css('background', 'white');
        this.sel('#allSinsei').css('background', 'white');
        if (this.admCD == '1') {
            this.sel('#allSinsei').hide();
        } else if (this.admCD == '2') {
            // 一般権限者の時
            this.sel('#kugiri').hide();
            this.sel('#toSinsei').hide();
            this.sel('#fromSinsei').hide();
            this.sel('#allSinsei').hide();
            this.sel('#default').hide();
        }
        // 【リスト部】の初期表示
        const sinseiWhereFlag = 0; // 初期表示はすべて
        const dateOrderByFlag = 0; // 初期表示は対象日付の古い順
        this.listDisplay(
            sinseiWhereFlag,
            dateOrderByFlag
        );
        this.sel('#compList').hide();
        this.sel("#switchBtn").val("処理済みを表示する");
        return true;
    }
    //=========================================
    // 後処理
    // 引き渡し情報の取得処理を記述してください。
    //=========================================
    atoShori() {
        // 親クラスの同メソッドを起動
        if (Init.prototype.atoShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    }
    //=========================================
    // 利用可能期間のチェック
    //=========================================
    asyncAvailable() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.asyncAvailable.call(this) == false) {
            return false;
        }
    }
    dateFormat(todoKK) {
        // 親クラスの同メソッドを起動
        const date = Init.prototype.dateFormat.call(this, todoKK);
        if (date == false) {
            return false;
        }
        return date;
    }
}