"use strict";
//*************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1006() {
    // 初期化クラスを継承する
    Init.call(this);
    this.mapping1_Data = null; //マッピング情報１で使うメンバー変数
    this.yyyymmdd = '';
}
MainClass1006.prototype = {
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
        // sessionStorage.clear();
        const Now = new Date();
        self.yyyymmdd =
            Now.getFullYear() + "/" +
            ("0" + (Now.getMonth() + 1)).slice(-2) + "/" +
            ("0" + Now.getDate()).slice(-2);
        // ローカルストレージの値を削除
        localStorage.removeItem("subTitle");
        localStorage.removeItem("title");
        localStorage.removeItem("ym");
        localStorage.removeItem("msgText");
        // セッション情報の初期化
        sessionStorage.setItem('msgID', '');
        sessionStorage.setItem('isChange', 'false');
        // 画面遷移で使用する
        // SQLで権限を取得する
        // 管理者権限が0又は1の時、追加ボタン表示かつ押下出来る。
        if (self.admCD == "0" || self.admCD == "1") {
            // 新規ボタンが押された時
            self.sel('.new').show();
        }
        // 管理者権限が２の時に追加ボタン非活性とする。
        else if (self.admCD == "2") {
            self.sel('.new').hide();
        }
        return true;
    },
    //=========================================
    // チェック＆取得
    //
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
        //----------------------------------------------
        // 2018/04/04
        // nishio
        // マッピング情報1
        // パラメータのフラグで緊急情報または新着情報を取得する。
        //----------------------------------------------
        const mapping1_Data = self.database.get(
            " SELECT" +
            "    EV.eventNo," +
            "    EV.staffID," +
            "    EV.title," +
            "    EV.subTitle," +
            "    EV.keisaiKigen," +
            "    EV.note," +
            "    ISNULL(HT.staffID, '" + self.staff + "') AS HstaffID," +
            "    ISNULL(HT.flag, '2') AS flag, ISNULL(co.name,'削除されたスタッフ') AS name," +
            "    midokuSum.unReadSum" +
            " FROM" +
            "    (SELECT" +
            "        eventNo," +
            "        staffID," +
            "        title," +
            "        subTitle," +
            "        note," +
            "        keisaiKigen" +
            "    FROM MK_event" +
            "    WHERE" +
            "        companyID=N'" + self.companyID + "' AND" +
            "        keisaiKigen>=N'" + self.today + "'" +
            "    ) AS EV" +
            " LEFT OUTER JOIN" +
            "    (SELECT" +
            "        externNo," +
            "        staffID," +
            "        flag" +
            "    FROM MK_history" +
            "    WHERE" +
            "        staffID=N'" + self.staff + "' AND" +
            "        companyID=N'" + self.companyID + "' AND" +
            "        category = '2'" +
            "    ) AS HT ON EV.eventNo=HT.externNo" +
            " LEFT OUTER JOIN" +
            "    (SELECT" +
            "        name," +
            "        staffID" +
            "    FROM MK_staff" +
            "    WHERE" +
            "        MK_staff.companyID=N'" + self.companyID + "'" +
            "    ) AS CO ON EV.staffID=CO.staffID" +
            " LEFT OUTER JOIN" +
            "    (SELECT" +
            "        COUNT(MK_event.eventNo) AS unReadSum," +
            "        MK_event.eventNo" +
            "    FROM MK_history" +
            "    INNER JOIN MK_event ON" +
            "        MK_history.externNo=MK_event.eventNo AND" +
            "        MK_history.companyID=MK_event.companyID" +
            "    INNER JOIN MK_staff ON" +
            "        MK_history.staffID=MK_staff.staffID AND" +
            "        MK_history.companyID=MK_staff.companyID" +
            "    WHERE" +
            "        MK_history.companyID=N'" + self.companyID + "' AND" +
            "        MK_history.category=2 AND" +
            "        MK_event.keisaiKigen>=N'" + self.today + "' AND" +
            "        ( (MK_staff.retireDate>N'" + self.today + "') OR (MK_staff.retireDate IS NULL) OR (MK_staff.retireDate ='') )" +
            "    GROUP BY" +
            "        MK_event.eventNo," +
            "        MK_history.flag" +
            "    HAVING (MK_history.flag=0)" +
            " ) AS midokuSum ON EV.eventNo=midokuSum.eventNo" +
            " ORDER BY" +
            "    HT.flag," +
            "    EV.keisaiKigen," +
            "    EV.title",
            function(successDate) {
                self.mapping1_Data = successDate;
                self.initShowList();
            },
            function(failureDate) {
                self.exception.check(
                    false,
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "100601",
                    "緊急情報または新着情報が出来ませんでした。",
                    ExceptionParamToMenu
                );
            },
            DatabaseAsyncOn
        );
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow: function() {
        const self = this;
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShowList: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.initShow.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        $('footer').hide();
        self.sel(".dynamic-dom").html("");
        self.sel("#new").text('追加');
        self.sel(".mainTitle h2").text('お知らせ');
        // 共通処理の描画
        let eventNO = '';
        let eventTitle = '';
        let title = '';
        let dateKigen = '';
        let Note = '';
        let name = '';
        let flag = '';
        let EstaffID = '';
        if (self.mapping1_Data != null) {
            // 緊急情報または新着情報があるだけループ
            for (const i in self.mapping1_Data) {
                eventTitle = self.mapping1_Data[i].title;
                EstaffID = self.mapping1_Data[i].staffID;
                let subTitle = self.mapping1_Data[i].subTitle;
                const strSubTitle = subTitle;
                // バイト数にて不要部分を削除
                subTitle = byteSubstr(subTitle, 24, "...");
                Note = self.mapping1_Data[i].note;
                dateKigen = new Date(self.mapping1_Data[i].keisaiKigen);
                eventNO = self.mapping1_Data[i].eventNo;
                name = self.mapping1_Data[i].name;
                flag = self.mapping1_Data[i].flag;
                // 改行コードを含む場合<br>に変換する
                if (Note.indexOf("\n") != -1) {
                    Note = Note.replace(/\n/g, "<br>");
                }
                const NoteBond = Note;
                // お知らせ未読、通知者合計を取得する。
                let unReadSum = self.mapping1_Data[i].unReadSum;
                let AllReadSum;
                if (unReadSum == null) {
                    unReadSum = 0;
                }
                AllReadSum = unReadSum + "名";
                // 権限者が0もしくは、作成スタッフの場合。
                // 未読者数が0  の場合、ラベル表示、違う場合ボタン表示する。
                let $midokuButton = null;
                let $penButton = null;
                if (self.admCD == '0' || self.staff == EstaffID) {
                    $penButton = "<a id='edit" + i + "' class='waves-effect waves-light btn grey lighten-1 edBut'>編集へ→</a>";
                    if (unReadSum != 0) {
                        $midokuButton = "<a id='midoku" + i + "' class='waves-effect waves-light btn grey lighten-1 midokuButton'>未読者へ→</a>";
                    } else {
                        $midokuButton = "<p class='midoku'>未読者</p>";
                    }
                } else {
                    $penButton = "<input type='hidden' src='../img/edit_mark.gif' value='編集' id='edit" + i + "' class='edBut'/>";
                    $midokuButton = "<p class='midoku'>未読者</p>";
                }
                // お知らせ未読の場合、赤丸にする。
                let mark;
                let strID;
                if (EstaffID == self.staff) {
                    mark = "";
                } else {
                    if (flag == "0" || flag == "2") {
                        // 赤丸表示
                        mark = "●";
                    } else {
                        mark = "";
                    }
                }
                if (flag == "1" && eventTitle == "通常情報") {
                    title = "";
                    strID = "normalEvent";
                } else if ((flag == "0" && eventTitle == "通常情報") || (flag == "2" && eventTitle == "通常情報")) {
                    title = '';
                    strID = "newEvent";
                } else {
                    title = '緊急情報';
                    strID = "emergency";
                }
                // 取得したデータの1レコードごとにタイトル、サブタイトル、本文、掲載期限付けて表示する。
                self.sel("#msgList").append(
                    _.template(self.sel("#oshirase-list").html())({
                        mark: mark,
                        strID: strID,
                        title: title,
                        penButton: $penButton,
                        subTitle: subTitle,
                        loopCounter: i,
                        flag: flag,
                        strSubTitle: strSubTitle,
                        eventNO: eventNO,
                        NoteBond: NoteBond,
                        dateString: dateToFormatString(dateKigen, '%YYYY%年%M%月%D%日'),
                        name: name,
                        midokuButton: $midokuButton,
                        AllReadSum: AllReadSum
                    })
                );
            }
        } else {
            // ◇お知らせリストが１件もない場合。
            self.sel("#msgList").append("<p class='noneOshirase'>表示するお知らせがありません。</p>");
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
        self.sel(".collapsible").collapsible();
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