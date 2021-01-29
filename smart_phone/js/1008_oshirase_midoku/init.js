"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1008() {
    // 初期化クラスを継承する
    Init.call(this);
    this.msgNo = ''; // パラメータの変数の初期化
    this.mapping1_Data = null; // マッピング情報１で使うメンバー変数
    this.mapping2_Data = null; // マッピング情報2で使うメンバー変数
    this.mapping3_Data = null; // マッピング情報3で使うメンバー変数
}
MainClass1008.prototype = {
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
        self.msgNo = sessionStorage.getItem('msgID'); // パラメータの変数の初期化
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
        //----------------------------------------------
        // 2018/04/04
        // nishio
        // マッピング情報1
        // イベントナンバーから未読者を取得する
        //----------------------------------------------
        const mapping1_Data = self.master.read(
            " SELECT" +
            "    DISTINCT MK_staff.name," +
            "    MK_history.staffID" +
            " FROM MK_history" +
            " INNER JOIN MK_staff ON" +
            "    MK_history.staffID = MK_staff.staffID AND" +
            "    MK_history.companyID = MK_staff.companyID" +
            " WHERE (MK_history.companyID = N'" + self.companyID + "') AND" +
            "    (MK_history.category = N'2') AND" +
            "    (MK_history.externNo = '" + self.msgNo + "') AND" +
            "    (MK_history.flag = N'0') AND" +
            "    ((MK_staff.retireDate > N'" + self.today + "') OR" +
            "    (MK_staff.retireDate IS NULL) OR" +
            "    (MK_staff.retireDate =''))" +
            " ORDER BY" +
            " MK_history.staffID"
        );
        if (false === self.exception.check(
                mapping1_Data,
                ExceptionServerOn,
                ExceptionSystemOn,
                "100801",
                "未読者の取得に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        self.mapping1_Data = mapping1_Data;
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
        self.sel("h2").text('未読者リスト');
        if (self.mapping1_Data == null) {
            // 2017/08/28 yamazaki
            // 画面遷移する場合は、アラートのままで画面遷移する前に止めます。
            alert("未読者が存在しません。お知らせ画面に戻ります。");
            spaHash('#1006', 'reverse');
            return false;
        } else {
            // 未読者メンバーの表示
            self.sel("#midokumember").empty();
            for (const i in self.mapping1_Data) {
                let strName = self.mapping1_Data[i].name.split(" ");
                const strFname = strName[0];
                const strEname = strName[1];
                if (strFname.length == 10) {
                    strName = strFname + '</br>' + strEname;
                } else {
                    strName = self.mapping1_Data[i].name;
                }
                const html =
                    "<td class='staff_N'>" +
                    "<p id='stName" + i + "' class='staff'>" + strName + "</p>" +
                    "</td>";
                self.sel("#midokumember").append(html);
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
    // ヘッダーの初期表示
    //=========================================
    header: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.header.call(this) == false) {
            return false;
        }
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