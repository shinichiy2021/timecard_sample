"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/08 yamazaki ２回目の読み込みがおかしいため、画像の保存時に画面のリロードをしました。
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/08/22  リサイズ処理
// 2017/08/25  グループ名又はグループアイコンに変更が有った時の通知処理
// 2017/09/01  絵文字チェック追加
//******************************************************************************
MainClass1018.prototype.event = function() {
    const self = this;
    //----------------------------------------------------
    // 2018/05/29
    // yamazaki
    // データベース取得処理は編集モードの時のみ処理する様に変更しました。
    //----------------------------------------------------
    const session = true;
    const img = JSON.parse(localStorage.getItem("nowIcon"));
    let upDateUrl = img;
    let nowIconSrc = "";
    // アイコン選択時
    self.ev('click', '.iconList', function() {
        upDateUrl = $(this).attr("src");
        nowIconSrc = self.sel("#nowIcon").attr('src');
        if (nowIconSrc != upDateUrl) {
            sessionStorage.setItem('isChange', 'true');
            self.buttonChange();
        }
        self.sel(".iconTable").css("background", "none");
        $(this).parents(".iconTable").css("background", "#fa8072");
        self.sel("#nowIcon").attr("src", upDateUrl);
        localStorage.setItem("nowIcon", JSON.stringify(upDateUrl));
    });
    // メンバーボタンが押された時
    self.ev('click', '#member', function() {
        // セッションストレージへ値のセット
        if (session) {
            localStorage.setItem('title_text', JSON.stringify(self.sel("#title_text").val()));
            localStorage.setItem('nowIcon', JSON.stringify(upDateUrl));
        }
        spaHash('1019', 'normal');
        return false;
    });
    // 登録ボタン押下処理
    self.ev('click', '#regist', function() {
        // 現在時刻の取得
        const talkTime = g_getTalkTime();
        const g_arrayStaff = self.g_arrayStaff;
        const upDateUrl = JSON.parse(localStorage.getItem("nowIcon"));
        const length = g_arrayStaff.length + 1;
        // 入力チェック
        if (self.errorCheck(self.sel("#title_text").val(), length) == false) {
            return false;
        }
        if (confirm("新規グループを登録します。よろしいですか？") == false) {
            return false;
        }
        const entryFlg = self.groupEntry(talkTime, upDateUrl);
        if (entryFlg == false) {
            return false;
        }
        // セッションストレージの初期化
        localStorage.removeItem('title_text');
        localStorage.removeItem('nowIcon');
        localStorage.removeItem('meDel');
        spaHash('#1016', 'reverse');
        return false;
    });
    // 更新ボタン押下処理
    self.ev('click', '#update', function() {
        //グループの存在チェック
        const companyID = self.companyID;
        const group = self.memberIDdata;
        const g_memberArray = self.g_memberArray;
        const g_arrayStaff = self.g_arrayStaff;
        // 現在時刻の取得
        const talkTime = g_getTalkTime();
        let length = "";
        const meDel = JSON.parse(localStorage.getItem("meDel"));
        const upDateUrl = JSON.parse(localStorage.getItem("nowIcon"));
        if (g_memberArray != "") {
            if (self.arrayStaffID == "") {
                if (meDel != '1') {
                    length = g_memberArray.length + 1;
                }
            } else {
                if (meDel != '1') {
                    length = g_arrayStaff.length + 1;
                } else {
                    length = g_arrayStaff.length;
                }
            }
        } else {
            length = self.member;
        }
        // 入力チェック
        if (self.errorCheck(self.sel("#title_text").val(), length) == false) {
            return false;
        }
        let upDateMsg = "グループを更新します。よろしいですか？";
        if (meDel == 1) {
            upDateMsg = "グループを退会すると、このグループの会話には参加できなくなります。よろしいですか？";
        }
        if (confirm(upDateMsg) == false) {
            return false;
        }
        if (false === self.groupEdit(
                talkTime,
                upDateUrl,
                self.groupID,
                self.staffName,
                companyID,
                group,
                g_arrayStaff,
                g_memberArray, meDel)) {
            return false;
        }
        // セッションストレージの初期化
        localStorage.removeItem('title_text');
        localStorage.removeItem('nowIcon');
        localStorage.removeItem('meDel');
        spaHash('#1016', 'reverse');
        return false;
    });
    // 削除ボタン押下処理
    self.ev('click', '#delete', function() {
        const companyID = self.companyID;
        const staffID = self.staff;
        if (confirm("グループを削除するとメンバーの登録は解除され、会話履歴も残りません。よろしいですか？") == false) {
            return false;
        }
        if (self.groupDel(companyID, self.groupID, staffID) == false) {
            return false;
        }
        // セッションストレージの初期化
        localStorage.removeItem('title_text');
        localStorage.removeItem('nowIcon');
        localStorage.removeItem('meDel');
        spaHash('#1016', 'reverse');
        return false;
    });
    // *********************************
    // チェンジイベント
    // *********************************
    self.ev('keydown', '#title_text', function() {
        sessionStorage.setItem('isChange', 'true');
        self.buttonChange();
        const new_val = self.sel("#title_text").val();
        localStorage.setItem("title_text", JSON.stringify(new_val));
    });
    // 戻るボタンが押された時
    function back() {
        if (sessionStorage.getItem('isChange') == 'true') {
            if (!confirm(self.backMsg + "よろしいですか？")) {
                return false;
            }
        }
        self.sel("#staffID").val(self.staff);
        localStorage.removeItem('title_text');
        localStorage.removeItem('nowIcon');
        localStorage.removeItem('meDel');
        spaHash('#1016', 'reverse');
        return false;
    }
    self.ev('click', '#back', back);
    // ******************************************************
    // モーダルエリアの処理 2017/08/04 追加
    // モーダルとじるボタン押下時
    // ***************************
    self.ev('click', '#close', function() {
        self.sel('#modal1').modal('close');
    });
    // ***************************
    // 変更を保存するボタン押下時
    // ***************************
    self.ev('click', '#entry', function() {
        // ファイル名を作る
        let fileName = self.staff + self.groupID + self.companyID;
        if (self.groupID == "new") {
            // グループＩＤの最大値を取得
            const groupMAX = self.getGroupMax();
            if (false === groupMAX) {
                return false;
            }
            fileName = self.staff + groupMAX + self.companyID;
        }
        upDateUrl = '../../../../photo/group_icon/' + fileName + '.jpeg';
        localStorage.setItem("nowIcon", JSON.stringify(upDateUrl));
        // モーダルエリアを閉じる
        self.sel('#modal1').modal('close');
        setTimeout(function() {
            self.uploadFile("timeCard/photo/group_icon/", fileName);
        }, 1000);
    });
};