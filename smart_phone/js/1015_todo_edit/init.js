"use strict";
//*******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1015() {
    // 初期化クラスを継承する
    Init.call(this);
    this.g_memberArray = [];
    this.g_arrayStaff = '';
    this.g_startYmd = '';
    this.g_endYmd = '';
    this.todoID = '';
    this.arrayStaffID = '';
    this.category = '';
    this.backMsg = '';
    this.newFlag = false;
    this.iraiCheck = '';
    this.today = '';
    this.session = true;
    this.sessionChange = null;
    this.bfMember = null;
    this.array = '';
    this.todo = '';
    this.staffData = '';
    this.sendBook = '';
}
MainClass1015.prototype = {
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
        // パラメータ取得
        sessionStorage.setItem('gamenID', '1015');
        self.todoID = localStorage.getItem("todoID");
        self.arrayStaffID = sessionStorage.getItem('arrayStaffID');
        self.category = JSON.parse(localStorage.getItem("categoryID"));
        localStorage.setItem('category', JSON.stringify(self.category));
        self.sendBook = JSON.parse(localStorage.getItem("sendBook"));
        localStorage.setItem('sendBook', JSON.stringify(self.sendBook));
        self.iraiCheck = JSON.parse(localStorage.getItem("iraiCheck"));
        // フォームロード時の日付の取得
        const YM = new Date();
        const yyyy = YM.getFullYear();
        const mm = addZero(YM.getMonth() + 1);
        const dd = addZero(YM.getDate());
        self.today = yyyy + "/" + mm + "/" + dd;
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
        // 明細内容絞り込み
        self.todo = self.master.read(
            "SELECT * " +
            " FROM MK_todo " +
            " WHERE" +
            "    todoID = '" + self.todoID + "' AND" +
            "    companyID = '" + self.companyID + "'"
        );
        if (false === self.exception.check(
                self.todo,
                ExceptionServerOn,
                ExceptionSystemOn,
                "101501",
                "やる事が取得出来ませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.staffData = self.master.read(
            "SELECT" +
            "    staffID" +
            " FROM" +
            "    MK_category" +
            " WHERE" +
            "    (companyID = N'" + self.companyID + "')  AND" +
            "    (todoID = " + self.todo[0].todoID + ") AND" +
            "    (statusCD > 0)"
        );
        switch (self.exception.check(
                self.staffData,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101502",
                "やる事が取得出来ませんでした。",
                ExceptionParamToMenu
            )) {
            case false:
                return false;
            case null:
                self.staffData = [];
                break;
            default:
                break;
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
        self.sel("#editMsg").empty();
        const category = self.category;
        let todoID = self.todoID;
        const admCD = self.admCD;
        const staff = self.staff;
        const staffData = self.staffData;
        if (self.arrayStaffID == undefined) {
            self.arrayStaffID = '';
            self.newFlag = true;
        } else {
            self.g_arrayStaff = self.arrayStaffID.split(',');
        }
        if (todoID == undefined) {
            todoID = '';
        }
        if (('localStorage' in window) && (window.localStorage !== null)) {} else {
            Materialize.toast('メンバーの変更時にデータの保持が出来ません。注意してください', 3000);
            self.session = false;
        }
        if (self.session) {
            self.bfMember = JSON.parse(localStorage.getItem("bfMember"));
        }
        if (self.bfMember == null) {
            self.bfMember = "";
        }
        if (todoID == "") {
            localStorage.setItem('bfMember', JSON.stringify(self.arrayStaffID));
            // 新規登録
            // タイトルの変更
            self.sel(".mainTitle h2").text('やることリスト追加');
            // ボタンの制御
            self.sel("#update").remove();
            self.sel("#delete").remove();
            self.backMsg = "登録ボタンを押すまで「やること」は追加されません。";
            if (self.arrayStaffID == "memberNot" || self.arrayStaffID == '') {
                sessionStorage.setItem('isChange', 'false');
            } else if (self.bfMember != self.arrayStaffID) {
                sessionStorage.setItem('isChange', 'true');
                self.sel("#editMsg").append("<p>登録ボタンを押すまでメンバーは確定されません。</p>");
            } else if (self.g_arrayStaff.length > 0) {
                sessionStorage.setItem('isChange', 'true');
                self.sel("#editMsg").append("<p>登録ボタンを押すまでメンバーは確定されません。</p>");
            }
            // やる人の人数を表示
            self.sel('#member').empty();
            if (self.g_arrayStaff == "memberNot") {
                self.sel("#member").append("<div>0名</div>");
            } else {
                self.sel("#member").append("<div>" + self.g_arrayStaff.length + "名</div>");
            }
            let title = null;
            let meisai = null;
            let ym1 = null;
            let ym2 = null;
            // セッション情報の取得
            if (self.session) {
                title = JSON.parse(localStorage.getItem("title"));
                meisai = JSON.parse(localStorage.getItem("meisai"));
                ym1 = JSON.parse(localStorage.getItem("ym1"));
                ym2 = JSON.parse(localStorage.getItem("ym2"));
            }
            // タイトル・本文の初期化
            if (title == null) {
                self.sel('#title').val('');
            } else {
                self.sel('#title').val(title);
            }
            // 2017/08/23  リサイズ処理
            setTimeout(function() {
                self.sel('#title').trigger('autoresize');
            }, 500);
            if (meisai == null) {
                self.sel('#meisai').val('');
            } else {
                self.sel('#meisai').val(meisai);
            }
            if (ym1 == null && ym2 == null) {
                // いつから いつまで編集
                newDate();
            } else {
                self.sel("#ym1").val(ym1);
                self.sel("#ym2").val(ym2);
            }
        } else {
            // グループ編集
            // タイトルの変更
            self.sel(".mainTitle h2").text('やること編集');
            // ボタンの制御
            self.sel("#regist").remove();
            self.sel("#delete").attr('disabled', false);
            self.backMsg = "更新ボタンを押すまで編集内容は更新されません。";
            if (self.bfMember != self.arrayStaffID) {
                sessionStorage.setItem('isChange', 'true');
                self.g_arrayStaff = self.arrayStaffID.split(",");
            }
            if (sessionStorage.getItem('isChange') == 'true') {
                self.sel("#editMsg").append("<p>更新ボタンを押すまでメンバーは確定されません。</p>");
                self.sel("#update").attr('disabled', false);
            } else {
                self.sel("#update").attr('disabled', true);
            }
            const todo = self.todo;
            let title = '';
            let meisai = '';
            let ym1 = '';
            let ym2 = '';
            // セッション情報の取得
            if (self.session) {
                title = JSON.parse(localStorage.getItem("title"));
                meisai = JSON.parse(localStorage.getItem("meisai"));
                ym1 = JSON.parse(localStorage.getItem("ym1"));
                ym2 = JSON.parse(localStorage.getItem("ym2"));
            }
            // 日付の表示
            if (ym1 == null) {
                if (todo[0].todoDate != "") {
                    const hiduke = todo[0].todoDate.split("/");
                    const hidukeY = parseInt(hiduke[0], 10);
                    let hidukeM = parseInt(hiduke[1], 10);
                    let hidukeD = parseInt(hiduke[2], 10);
                    const str = hiduke[1].substr(0, 1);
                    const strD = hiduke[2].substr(0, 1);
                    if (str == 0) {
                        hidukeM = parseInt(hiduke[1].substr(1, 1), 10);
                    }
                    if (strD == 0) {
                        hidukeD = parseInt(hiduke[2].substr(1, 1), 10);
                    }
                    self.sel("#ym1").val(hidukeY + "-" + addZero(hidukeM) + "-" + addZero(hidukeD));
                } else {
                    self.sel("#ym1").val("");
                }
            } else {
                self.sel("#ym1").val(ym1);
            }
            if (ym2 == null) {
                if (todo[0].keisaiKigen != "") {
                    const kigen = todo[0].keisaiKigen.split("/");
                    const kigenY = parseInt(kigen[0], 10);
                    let kigenM = parseInt(kigen[1], 10);
                    let kigenD = parseInt(kigen[2], 10);
                    const str = kigen[1].substr(0, 1);
                    const strD = kigen[2].substr(0, 1);
                    if (str == 0) {
                        kigenM = parseInt(kigen[1].substr(1, 1), 10);
                    }
                    if (strD == 0) {
                        kigenD = parseInt(kigen[2].substr(1, 1), 10);
                    }
                    self.sel("#ym2").val(kigenY + "-" + addZero(kigenM) + "-" + addZero(kigenD));
                } else {
                    self.sel("#ym2").val("");
                }
            } else {
                self.sel("#ym2").val(ym2);
            }
            // タイトルの表示
            if (title == null) {
                self.sel("#title").val(todo[0].todoTitle);
            } else {
                self.sel("#title").val(title);
            }
            // 2017/08/23  リサイズ処理
            setTimeout(function() {
                self.sel('#title').trigger('autoresize');
            }, 500);
            // 明細の表示
            if (meisai == null) {
                self.sel("#meisai").val(todo[0].todo);
            } else {
                self.sel("#meisai").val(meisai);
            }
            self.sel('#member').empty();
            // やる人の追加
            if (self.arrayStaffID == "" || self.arrayStaffID == undefined) {
                self.sel("#member").append("<div>" + staffData.length + "名</div>");
                let j = 0;
                self.g_memberArray = [];
                // DBから取得したデータの取得
                for (let i in staffData) {
                    if (staffData[i].staffID != staff) {
                        const item = {
                            "staffID": staffData[i].staffID
                        };
                        self.g_memberArray[j] = item;
                        j++;
                    }
                }
                // セションに保存するための加工処理
                self.arrayStaffID = "";
                for (let j = 0; j < self.g_memberArray.length; j++) {
                    if (j == self.g_memberArray.length - 1) {
                        self.arrayStaffID += self.g_memberArray[j].staffID;
                    } else {
                        self.arrayStaffID += self.g_memberArray[j].staffID + ",";
                    }
                }
                sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
            } else {
                if (self.g_arrayStaff == "memberNot") {
                    self.sel("#member").append("<div>0名</div>");
                } else {
                    self.sel("#member").append("<div>" + self.g_arrayStaff.length + "名</div>");
                }
            }
            if (self.g_arrayStaff == "memberNot" || self.arrayStaffID == '') {
                self.sel('#irai').prop('checked', false);
                self.sel("#irai").val(0);
                self.sel("#memberArea").hide();
            } else {
                self.sel("#memberArea").show();
                self.sel('#irai').prop('checked', true);
                self.sel("#irai").val(1);
            }
            if (category == "1" && self.g_arrayStaff.length < 1) {
                self.sel("#member").empty();
                self.sel("#member").append("<div>0名</div>");
                if (self.iraiCheck == "1") {
                    self.sel("#memberArea").show();
                    self.sel('#irai').prop('checked', true);
                    self.sel("#irai").val(1);
                } else {
                    self.sel('#irai').prop('checked', false);
                    self.sel("#irai").val(0);
                    self.sel("#memberArea").hide();
                }
            }
            if (admCD == "2") {
                self.sel("#member").empty();
                self.sel("#member").append("<div>0名</div>");
                self.sel('#irai').prop('checked', false);
                self.sel("#irai").val(0);
                self.sel("#memberArea").hide();
                self.sel("#memberCheck").hide();
            }
            // お願いする人
            if (staff != todo[0].staffID) {
                Materialize.toast('お願いする人が異なっている為、編集できません', 3000);
                // ローカルストレージの値を削除
                localStorage.removeItem("title");
                localStorage.removeItem("priority");
                localStorage.removeItem("ym1");
                localStorage.removeItem("ym2");
                localStorage.removeItem("meisai");
                localStorage.removeItem("bfMember");
                localStorage.removeItem("category");
                localStorage.removeItem("iraiCheck");
                spaHash('#1014', 'reverse');
                return false;
            }
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