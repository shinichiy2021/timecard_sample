//=========================================
// マスタークラス
// version    : 1.00
// creater    : shinichiy
// new date   : 2015/05/01
//=========================================
function Master() {
    // DBからデータを取得
    this.database = new Database();
}
// メゾッドの定義
Master.prototype = {
    //---------------------------------------
    // リストの取得 : 一覧表示させる
    //【引数】
    //  sentSQL  : 実行するSQL文
    //  addWhere : 追加するWhere文       ※引数省略可能
    //  orderBy  : 追加するorderBy文     ※引数省略可能
    //【戻り値】
    //  取得成功時                 : データ（連想配列）
    //  取得なし（データなし）       : null
    //  登録失敗（ネットワークエラー） : false
    //---------------------------------------
    read: function(sentSQL, addWhere, orderBy) {
        var self = this;
        // 引数の省略処理
        if (addWhere === undefined) {
            addWhere = null;
            orderBy = null;
        }
        var returnData = null;
        // SQLの作成
        var sql = sentSQL;
        // Whereの追加
        if (addWhere != null) {
            sql += " WHERE " + addWhere[0];
            for (var i = 1; i < addWhere.length; i++) {
                if (addWhere[i] != "") {
                    sql += " AND " + addWhere[i];
                }
            }
        }
        // Order byの追加
        if (orderBy != null && orderBy != '' && orderBy != false) {
            sql += " ORDER BY " + orderBy[0];
            for (var i = 1; i < orderBy.length; i++) {
                sql += ", " + orderBy[i];
            }
        }
        // DBを参照
        this.database.get(
            sql,
            function(data) {
                returnData = data;
            },
            function() {
                returnData = false;
            }
        );
        return returnData;
    },
    //---------------------------------------
    // 登録処理
    //【引数】
    //  tableName  : テーブル名
    //  message    : メッセージ
    //  columnName : 項目名（配列）
    //  value      : 値（配列）
    //  ※項目名と値の数は同数でなければならない。
    //【戻り値】
    //  登録成功時                 : true
    //  登録失敗（楽観的排他制御）    : null
    //  登録失敗（ネットワークエラー） : false
    //---------------------------------------
    entry: function(tableName, message, columnName, values) {
        var self = this;
        var flag = false; // 登録成功 ： true, 登録失敗 : flase
        // 登録処理
        if (message != "" && message != false && message != null) {
            if (false == confirm(message)) {
                return false;
            }
        }
        //***************************
        // DB存在チェック
        //***************************
        if (columnName != "" &&
            columnName != false &&
            columnName != null &&
            values != "" &&
            values != false &&
            values != null) {
            var sql = 'SELECT * FROM ' + tableName + ' WHERE ';
            sql += columnName[0] + "=";
            sql += values[0].substring(0, values[0].indexOf("'") + 1);
            sql += values[0].substring(values[0].indexOf("'") + 1, values[0].length - 1).replace(/'/g, "''");
            sql += "'";
            for (var i = 1; i < columnName.length; i++) {
                sql += " AND " + columnName[i] + "=";
                sql += values[i].substring(0, values[i].indexOf("'") + 1);
                sql += values[i].substring(values[i].indexOf("'") + 1, values[i].length - 1).replace(/'/g, "''");
                sql += "'";
            }
            var getData = self.read(sql, null, null);
            switch (getData) {
                // ネットワークエラーの時
                case false:
                    return false;
                    // これから更新するレコードが存在しない時
                    // 正常処理をする
                case null:
                    break;
                    // これから更新するレコードが存在しない時
                    // 論理的エラーを返す
                default:
                    return null;
            }
        }
        // SQLの作成
        var sql = "INSERT INTO " + tableName;
        // 項目名の追加
        if (columnName != null) {
            sql += "(" + columnName[0];
            for (var i = 1; i < columnName.length; i++) {
                sql += ", " + columnName[i];
            }
            sql += ")";
        }
        // 値の追加
        if (values != null) {
            sql += " VALUES(";
            sql += values[0].substring(0, values[0].indexOf("'") + 1);
            sql += values[0].substring(values[0].indexOf("'") + 1, values[0].length - 1).replace(/'/g, "''");
            sql += "'";
            for (var i = 1; i < columnName.length; i++) {
                sql += ", ";
                sql += values[i].substring(0, values[i].indexOf("'") + 1);
                sql += values[i].substring(values[i].indexOf("'") + 1, values[i].length - 1).replace(/'/g, "''");
                sql += "'";
            }
            sql += ")";
        }
        // DBを参照
        flag = self.database.set(
            sql,
            // false,
            false
        );
        return flag;
    },
    //---------------------------------------
    // 修正処理
    //【引数】
    //  tableName  : テーブル名
    //  message    : メッセージ
    //  columnName : 項目名（配列）
    //  value      : 値（配列）
    //  addWhere   : 追加するWhere文
    //  ※項目名と値の数は同数でなければならない。
    //【戻り値】
    //  登録成功時                 : true
    //  登録失敗（楽観的排他制御）    : null
    //  登録失敗（ネットワークエラー） : false
    //---------------------------------------
    edit: function(tableName, message, columnName, values, addWhere) {
        var self = this;
        var flag = false; // 登録成功 ： true, 登録失敗 : flase
        // 登録処理
        if (message != "" && message != false && message != null) {
            if (false == confirm(message)) {
                return false;
            }
        }
        //***************************
        // DB存在チェック
        //***************************
        if (addWhere != "" && addWhere != false && addWhere != null) {
            var getData = self.read('SELECT * FROM ' + tableName, addWhere, null);
            switch (getData) {
                case false:
                    return false;
                case null:
                    return null;
                default:
                    break;
            }
        }
        // 初期SQLの作成
        var sql = "UPDATE " + tableName + " SET ";
        if (columnName == null) {
            sql = "UPDATE " + tableName;
        }
        // 項目名の追加
        if (columnName != null) {
            sql += columnName[0] + "=";
            sql += values[0].substring(0, values[0].indexOf("'") + 1);
            sql += values[0].substring(values[0].indexOf("'") + 1, values[0].length - 1).replace(/'/g, "''");
            sql += "'";
            for (var i = 1; i < columnName.length; i++) {
                sql += ", " + columnName[i] + "=";
                sql += values[i].substring(0, values[i].indexOf("'") + 1);
                sql += values[i].substring(values[i].indexOf("'") + 1, values[i].length - 1).replace(/'/g, "''");
                sql += "'";
            }
        }
        // Whereの追加
        if (addWhere != null) {
            sql += " WHERE " + addWhere[0];
            for (var i = 1; i < addWhere.length; i++) {
                sql += " AND " + addWhere[i];
            }
        }
        // DBを参照
        flag = self.database.set(
            sql,
            // false,
            false
        );
        return flag;
    },
    //---------------------------------------
    // 削除処理
    //【引数】
    //  tableName  : テーブル名
    //  message    : メッセージ
    //  addWhere   : 追加するWhere文
    //  ※項目名と値の数は同数でなければならない。
    //【戻り値】
    //  登録成功時                 : true
    //  登録失敗（楽観的排他制御）    : null
    //  登録失敗（ネットワークエラー） : false
    //---------------------------------------
    del: function(tableName, message, addWhere) {
        var self = this;
        var flag = false; // 登録成功 ： true, 登録失敗 : flase
        // 登録処理
        if (message != "" && message != false && message != null) {
            if (false == confirm(message)) {
                return false;
            }
        }
        //***************************
        // DB存在チェック
        //***************************
        if (addWhere != "" && addWhere != false && addWhere != null) {
            var getData = self.read('SELECT * FROM ' + tableName, addWhere, null);
            switch (getData) {
                case false:
                    return false;
                case null:
                    return null;
                default:
                    break;
            }
        }
        // 初期SQLの作成
        var sql = "DELETE FROM " + tableName;
        // Whereの追加
        if (addWhere != null) {
            sql += " WHERE " + addWhere[0];
            for (var i = 1; i < addWhere.length; i++) {
                sql += " AND " + addWhere[i];
            }
        }
        // DBを参照
        flag = self.database.set(
            sql,
            // false,
            false
        );
        return flag;
    }
};