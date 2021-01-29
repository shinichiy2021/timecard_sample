"use strict";
//************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1013() {
    // 初期化クラスを継承する
    Init.call(this);
    this.h = $(window).height();
    this.admCD = "";
    this.shimeCD = "";
    this.sortCD = "";
    this.today = "";
    this.w = [ "日", "月", "火", "水", "木", "金", "土" ];
    // 完了済みリストの表示・非表示の切り替えフラグ（初期値）
    this.compFlag = false;
    this.beforList = null;
    this.afterList = null;
}
MainClass1013.prototype = {
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
        this.shimeCD = "";
        this.sortCD = "";
        const YM = new Date();
        const yy = YM.getFullYear();
        const mm = YM.getMonth() + 1;
        const DA = YM.getDate();
        this.today = yy + "/" + addZero(mm) + "/" + addZero(DA);
        self.sel(".button-collapse").sideNav();
        self.sel('.button-collapse').sideNav({
            menuWidth: '75vw',
            edge: 'right',
            closeOnClick: true,
            draggable: true,
            onOpen: function() {
                // bodyスクロールしない
                $(document.body).css('position', 'fixed');
            },
            onClose: function() {
                // bodyスクロールする
                $(document.body).attr({
                    style: ''
                });
                $(document.body).css('position', 'static');
            },
        });
        $(document.body).css("min-height", self.h + 'px');
        localStorage.removeItem('todoID');
        localStorage.removeItem('categoryID');
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
        // 一覧取得
        if (false === self.getYarukoto(
            self.admCD,
            self.shimeCD,
            self.sortCD
        )) {
            return false
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
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // リストの表示
        if (self.beforList == null) {
            self.sel('#myTodoList').empty();
        } else if (self.beforList.length == 0) {
            self.sel('#myTodoList').empty();
        } else {
            self.sel('#myTodoList').empty();
            self.bfListDisplay(self.beforList);
        }
        // 完了済みデータが存在しない時は、完了済みボタンを非表示にする
        if (self.afterList == null) {
            // 非表示処理
            self.sel("#switchBtn").hide();
            self.sel('#myCompList').empty();
            self.compFlag = false;
            self.aftListDisplay(self.afterList);
        } else if (self.afterList.length == 0) {
            // 非表示処理
            self.sel("#switchBtn").hide();
            self.sel('#myCompList').empty();
            self.compFlag = false;
            self.aftListDisplay(self.afterList);
        } else {
            // 表示処理
            self.sel("#switchBtn").show();
            // 完了フラグとの同期
            if (self.compFlag == true) {
                self.sel('#myCompList').empty();
                self.aftListDisplay(self.afterList);
            }
        }
        // 絞り込み条件
        // 使用者が管理権限の時、自分以外がお願いしたことは非表示
        if (self.admCD == "1") {
            self.sel("#another").css({ "display": "none" });
            // 使用者が一般権限の時、お願いしたこと。自分以外は非表示
        } else if (self.admCD == "2") {
            self.sel("#request").css({ "display": "none" });
            self.sel("#another").css({ "display": "none" });
        }
        // 使用者が全権限の時、全てが使用可能
        // 共通処理の描画
        self.sel('#naviTodo img').attr('src', '../img/todo_on.png');
        self.sel('#naviTodo p').css('color', '#00ffff');
        self.sel('#naviTodo p').css('font-weight', 'bold');
        const toast = localStorage.getItem('toast');
        if (toast != '' || toast != undefined || toast != null) {
            Materialize.toast(toast, 1500);
            localStorage.removeItem('toast');
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