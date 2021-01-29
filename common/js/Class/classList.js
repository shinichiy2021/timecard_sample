//=========================================
// リストクラス
// version    : 1.00
// creater    : shinichiy
// new date   : 2015/04/30
//=========================================
// 初期化の処理
// 引数
// なし
//---------------------------------------
function List() {
    // DBからデータを取得
    this.list = null; // リストに表示するデータリスト（2次元連想配列）
    this.index = -1; // 選択された位置（数値）
    this.database = new Database();
}
//---------------------------------------
// リストの取得 : 一覧表示させる
// 引数
// sentSQL  : 実行するSQL文
// addWhere : 追加するWhere文
// orderBy  : 追加するorderBy文
//---------------------------------------
List.prototype = {
    read: function(sentSQL, addWhere, orderBy) {
        var self = this;
        // SQLの作成
        var html = sentSQL;
        // Whereの追加
        if (addWhere != null) {
            html += " where " + addWhere[0];
            for (var i = 1; i < addWhere.length; i++) {
                if (addWhere[i] != "") {
                    html += " and " + addWhere[i];
                }
            }
        }
        // Order byの追加
        if (orderBy != null) {
            html += " order by " + orderBy[0];
            for (var i = 1; i < orderBy.length; i++) {
                html += ", " + orderBy[i];
            }
        }
        // DBを参照
        self.database.get(
            html,
            function(data) {
                self.list = data;
            }
        );
    },
    //---------------------------------------
    // テーブルに書き込む
    // 引数
    // columnName : 表示するリストの項目名
    // selecter   : 表示するリストのセレクタ
    //---------------------------------------
    tableList: function(columnName, selecter) {

        var self = this;
        var html = "";
        for (var i in self.list) {
            html += "<tr>";
            for (var j in columnName) {
                if (self.list[i][columnName[j]] != null) {
                    html += "<td class='" + columnName[j] + "'>" + self.list[i][columnName[j]] + "</td>";
                } else {
                    html += "<td class='" + columnName[j] + "'></td>";
                }
            }
            html += "</tr>";
        }
        selecter.html("");
        selecter.append(html);
    },
    //---------------------------------------
    // テーブルに書き込む(ナンバリング付)
    // 引数
    // columnName : 表示するリストの項目名
    // selecter   : 表示するリストのセレクタ
    //---------------------------------------
    noList: function(columnName, selecter) {

        var self = this;
        var html = "";
        for (var i in self.list) {
            html += "<tr>";
            html += "<td class='no'>" + (parseInt(i, 10) + 1, 10) + "</td>";
            for (var j in columnName) {
                if (self.list[i][columnName[j]] != null) {
                    html += "<td class='" + columnName[j] + "'>" + self.list[i][columnName[j]] + "</td>";
                } else {
                    html += "<td class='" + columnName[j] + "'></td>";
                }
            }
            html += "</tr>";
        }
        selecter.html("");
        selecter.append(html);
    },
    //---------------------------------------
    // データリストに書き込む
    // 引数
    // columnName : 表示するリストの項目名
    // selecter   : 表示するリストのセレクタ
    // setValue   : 初期値をセットするかどうか（true:セットする, flase:セットしない）
    //---------------------------------------
    dataList: function(columnName, selecter, setValue) {
        var self = this;
        var html = "";
        for (var i in self.list) {
            html += "<option value='" + self.list[i][columnName] + "'>";
        }
        selecter.html("");
        selecter.append(html);
        if (self.list != null && setValue) {
            selecter.parent().find("[list='" + columnName + "']").val(self.list[0][columnName]);
        }
    },
    //---------------------------------------
    // データリストに書き込む(コード付き)
    // 引数
    // columnName : 表示するリストの項目名
    // selecter   : 表示するリストのセレクタ
    // setValue   : 初期値をセットするかどうか（true:セットする, flase:セットしない）
    //---------------------------------------
    dataListCD: function(columnCD, columnName, selecter, setValue) {
        var self = this;
        var html = "";
        for (var i in self.list) {
            html += "<option name='" + self.list[i][columnCD] + "' value='" + self.list[i][columnName] + "'>";
        }
        selecter.html("");
        selecter.append(html);
        if (self.list != null && setValue) {
            selecter.parent().find("[list='" + columnName + "']").val(self.list[0][columnName]);
        }
    },
    //---------------------------------------
    // 行の選択
    // 引数
    // selecter   : 追加するリストのセレクタ
    // rowTag     : 選択する行のタグ
    //---------------------------------------
    setSelect: function(selecter, rowTag) {
        var self = this;
        // 前の選択色を初期化する。
        self.index = -1;
        selecter.find(rowTag).removeClass("selected");
        // リストの選択イベント登録
        selecter.find(rowTag).unbind().click(function() {
            self.index = $(this).index();
            selecter.find(rowTag).removeClass("selected");
            $(this).addClass("selected");
        });
    },
    //---------------------------------------
    // 行の取得
    // 引数
    // selecter   : リストのセレクタ
    // 戻り値
    // 取得したデータ（1次元配列）※行が選択されていない時は、nullを返す
    //---------------------------------------
    getSelect: function(selecter) {
        var self = this;
        if (self.index == -1) {
            return null;
        } else {
            return self.list[self.index];
        }
    },
    //---------------------------------------
    // 行の追加
    // 引数
    // addData    : 追加すzるデータ（1次元配列）
    // selecter   : 追加するリストのセレクタ
    //---------------------------------------
    add: function(addData, selecter) {
        var self = this;
        var html = "<tr>";
        for (var i in addData) {
            html += "<td class='" + addData[i] + "'>" + addData[i] + "</td>";
        }
        html += "</tr>";
        selecter.append(html);
        // 選択処理の再設定
        self.setSelect(selecter);
    }
};