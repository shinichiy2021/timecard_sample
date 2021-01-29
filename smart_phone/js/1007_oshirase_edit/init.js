"use strict";
//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//********************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1007() {
    // 初期化クラスを継承する
    Init.call(this);
    this.mapping1_Data = null; //マッピング情報１で使うメンバー変数
    // 編集ボタンから遷移した時はパラメータを取得する
    this.msgNo = '';
    // 修正がされたかどうかのフラグ
    this.confirmMsg = 'を登録します。よろしいですか？';
    this.yyyymmdd = '';
    this.keisaiKigen;
}
MainClass1007.prototype = {
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
        self.msgNo = sessionStorage.getItem('msgID');
        // システム日付の本日の取得
        const YM = new Date();
        const Y = YM.getFullYear();
        const M = YM.getMonth() + 1;
        let DA = YM.getDate();
        let intY = parseInt(Y, 10);
        let intM = parseInt(M, 10);
        const endDate = getLastDayOfMonth(YM).getDate();
        //当月末日
        const myMonthTbl = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        if (((Y % 4) == 0 && (Y % 100) != 0) || (Y % 400) == 0) {
            // うるう年だったら...
            myMonthTbl[1] = 29;
            // ２月を２９日とする
        } else {
            myMonthTbl[1] = 28;
        }
        // 掲載期限
        if (DA == endDate) {
            // 12月の時、1月の最終日を取得する。
            if (intM == 12) {
                DA = myMonthTbl[0];
            } else {
                DA = myMonthTbl[intM];
            }
        }
        intM = intM + 1;
        //月をプラス１して翌月にする
        if (intM == 13) {
            //もし月が13になったら
            intY = intY + 1;
            //年をプラス１して翌年にする
            intM = 1;
            //さらに月を１に
        }
        self.yyyymmdd = intY + "-" + ("0" + intM).slice(-2) + "-" + ("0" + DA).slice(-2);
        // SQLで権限を取得する
        if (('localStorage' in window) && (window.localStorage !== null)) {} else {
            Materialize.toast('内容の変更時にデータの保持が出来ません。注意してください', 3000);
            session = false;
        }
        setTimeout(function() {
            self.sel("#subTitle").trigger('autoresize');
        }, 500);
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
        // 編集画面の時マッピング情報1を取得する
        if (self.msgNo != '' && self.msgNo != null) {
            //----------------------------------------------
            // 2018/04/09
            // nishio
            // マッピング情報1
            // 取得したNoのメッセージのデータを取得する
            //----------------------------------------------
            const mapping1_Data = self.master.read(
                " SELECT" +
                " EV.title," +
                " EV.subTitle," +
                " EV.keisaiKigen," +
                " EV.note," +
                " ISNULL(CO.name,'削除されたスタッフ') AS name," +
                " EV.staffID" +
                " FROM MK_event AS EV" +
                " LEFT OUTER JOIN MK_staff AS CO ON" +
                " EV.staffID = CO.staffID AND" +
                " EV.companyID = CO.companyID" +
                " WHERE" +
                " (EV.companyID = N'" + self.companyID + "') AND (EV.eventNo = '" + self.msgNo + "')"
            );
            if (false === self.exception.check(
                    mapping1_Data,
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "100701",
                    "お知らせが取得出来ませんでした。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            self.mapping1_Data = mapping1_Data;
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
        $('footer').hide();
        // 共通処理の描画
        let subTitle = "";
        let title = "";
        let editYM = "";
        let msgText = "";
        if (sessionStorage.getItem('isChange') == 'true') {
            subTitle = JSON.parse(localStorage.getItem("subTitle"));
            title = JSON.parse(localStorage.getItem("title"));
            editYM = JSON.parse(localStorage.getItem("ym"));
            msgText = JSON.parse(localStorage.getItem("msgText"));
        }
        // msgIDが取得出来た時は修正
        if (self.msgNo != '' && self.msgNo != null) {
            //---------------------------------------
            // 編集処理の場合
            // 更新画面表示処理
            //---------------------------------------
            self.sel(".mainTitle h2").text('お知らせの編集');
            const EVstaffID = self.mapping1_Data[0].staffID;
            // 権限コードが0もしくは作成者の場合修正画面にする。
            if (self.admCD == 0 || self.staff == EVstaffID) {
                if (sessionStorage.getItem('isChange') == 'true') {
                    self.sel("#delete").show();
                    self.sel("#new")
                        .html('更新')
                        .show()
                        .attr('disabled', true);
                } else {
                    // 更新ボタン初期値非活性にする
                    self.sel("#delete").show();
                    self.sel("#new")
                        .html('更新')
                        .show()
                        .attr('disabled', true);
                }
                self.confirmMsg = 'を更新します。よろしいですか？';
            } else {
                self.sel(".mainTitle").empty();
                self.sel(".mainTitle h2").text('お知らせの閲覧');
                self.sel("#new").hide();
                self.sel("#delete").hide();
                self.sel("#subTitle").prop('disabled', true);
                self.sel("#title").prop('disabled', true);
                self.sel("#ym").prop('disabled', true);
                self.sel("#msgText").prop('disabled', true);
            }
            if (sessionStorage.getItem('isChange') == 'false') {
                subTitle = self.mapping1_Data[0].subTitle;
                title = self.mapping1_Data[0].title;
                editYM = self.mapping1_Data[0].keisaiKigen.replace('/', '-');
                editYM = editYM.replace('/', '-');
                msgText = self.mapping1_Data[0].note;
            }
            self.sel("#title").val(title);
            self.sel("#ym").val(editYM);
            self.sel("#subTitle").val(subTitle);
            self.sel("#msgText").val(msgText);
            self.sel("#name").text(self.mapping1_Data[0].name);
            localStorage.setItem("subTitle", JSON.stringify(subTitle));
            localStorage.setItem("title", JSON.stringify(title));
            localStorage.setItem("ym", JSON.stringify(editYM));
            localStorage.setItem("msgText", JSON.stringify(msgText));
        } else {
            //---------------------------------------
            // 新規登録の場合
            // 新規登録画面表示処理
            //---------------------------------------
            self.sel("#new")
                .html('登録')
                .show()
                .attr('disabled', false);
            self.sel(".mainTitle h2").text('お知らせの追加');
            if (sessionStorage.getItem('isChange') == 'false') {
                subTitle = "";
                title = "選択してください";
                msgText = "";
                localStorage.setItem("title", JSON.stringify(title));
                localStorage.setItem("ym", JSON.stringify(self.yyyymmdd));
            }
            self.sel("#title").val(title);
            self.sel("#ym").val(self.yyyymmdd);
            self.sel("#subTitle").val(subTitle);
            self.sel("#msgText").val(msgText);
            self.sel("#name").text(self.staffName);
            self.sel("#delete").hide();
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