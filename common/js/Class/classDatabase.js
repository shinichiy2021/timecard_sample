//=========================================
// Database クラス
// データベースに関する命令をまとめる
//=========================================
const DatabaseAsyncOn = true;
const DatabaseAsyncOff = false;

class Database {
    constructor() {
    }
    async getLineToken(
        code,   //	String	必須	認可コード
    ) {
        //リクエスト先URL
        const API_URL = 'https://api.line.me/oauth2/v2.1/token'
        const CALLBACK_URI = 'https:///timeCard/dev/pwa/smart_phone/view/1001_login.html'
        const CHANNEL_ID = '1654896859'
        const SECRET = '2ca0bcee2b1fc59cc53afffa77d2003f'

        const BODY = 'grant_type=authorization_code'
            + '&code=' + code
            + '&client_id=' + CHANNEL_ID
            + '&client_secret=' + SECRET
            + '&redirect_uri=' + CALLBACK_URI
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: BODY,
        }
        return await fetch(API_URL, options)
    }
    async getFetch(
        mappingName,
        sqlPrepare,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName'),
    ) {
        // ログの出力
        console.log(
            '\n\naccountName: ' + accountName +
            '\n\nuserName: ' + userName +
            '\n\nmappingName: ' + mappingName +
            '\n\nparametter: ' + sqlPrepare
        )
        const data = {
            "accountName": accountName,
            "userName": userName,
            "mappingName": mappingName,
            "prepare": sqlPrepare
        }
        return fetch(
            '../../common/php/fetchGet.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(data),
        })
    }
    async putFetch(
        mappingName,
        sqlPrepare,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName'),
    ) {
        // ログの出力
        console.log(
            '\n\naccountName: ' + accountName +
            '\n\nuserName: ' + userName +
            '\n\nmappingName: ' + mappingName +
            '\n\nparametter: ' + sqlPrepare
        )
        const data = {
            "accountName": accountName,
            "userName": userName,
            "mappingName": mappingName,
            "prepare": sqlPrepare
        }
        return fetch(
            '../../common/php/fetchPut.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(data),
        })
    }
    async postFetch(
        mappingName,
        sqlPrepare,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName'),
    ) {
        // ログの出力
        console.log(
            '\n\naccountName: ' + accountName +
            '\n\nuserName: ' + userName +
            '\n\nmappingName: ' + mappingName +
            '\n\nparametter: ' + sqlPrepare
        )
        const data = {
            "accountName": accountName,
            "userName": userName,
            "mappingName": mappingName,
            "prepare": sqlPrepare
        }
        return fetch(
            '../../common/php/fetchPost.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(data),
        })
    }
    //=========================================
    // メソッド
    // DBからSQLを使ってデータをGETする
    //=========================================
    get(
        sentSQL,
        successFunction,
        failureFunction,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        $.ajax({
            type: "POST",
            url: "../../common/php/getDB.php",
            data: {
                "accountName": accountName,
                "userName": userName,
                "sentSQL": sentSQL
            },
            dataType: "json",
            async: async,
            cache: false,
            // 成功したときの処理
            success: successFunction,
            // エラー処理
            error: failureFunction
        });
    }
    //=========================================
    // SELECT メソッド（prepareを使用したもの）
    // DBからSQLを使ってデータをGETする
    //=========================================
    getPrepare(
        mapping_FileName,
        prepare,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        var returnData = null;
        $.ajax({
            type: "POST",
            url: mapping_FileName,
            data: {
                "accountName": accountName,
                "userName": userName,
                "prepare[]": prepare
            },
            dataType: "json",
            async: async,
            cache: false,
            // 成功したときの処理
            success: function (data) {
                returnData = data;
            },
            // エラー処理
            error: function () {
                returnData = false;
            }
        });
        return returnData;
    }
    //=========================================
    // SELECT メソッド（prepareを使用したもの）
    // DBからSQLを使ってデータをGETする
    //=========================================
    getProcedures(
        mapping_Name,
        prepare,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        var returnData = null;
        $.ajax({
            type: "POST",
            url: "../../common/php/getProcedures.php",
            data: {
                "accountName": accountName,
                "userName": userName,
                "mappingName": mapping_Name,
                "prepare[]": prepare
            },
            dataType: "json",
            async: async,
            cache: false,
            // 成功したときの処理
            success: function (data) {
                returnData = data;
                console.log('\n\naccountName: ' + accountName);
                console.log('\n\nuserName: ' + userName);
                console.log('\n\nmappingName: ' + mapping_Name);
                console.log('parametter: ' + prepare);
                console.log('data: ' + data);
            },
            // エラー処理
            error: function (data) {
                returnData = false;
                console.log('\n\naccountName: ' + mapping_Name);
                console.log('\n\nuserName: ' + userName);
                console.log('\n\nmappingName: ' + mapping_Name);
                console.log('parametter: ' + prepare);
                console.log('data: ' + data);
            }
        });
        return returnData;
    }
    //=========================================
    // SELECT メソッド（prepareを使用したもの）
    // DBからSQLを使ってデータをSETする
    //=========================================
    setProcedures(
        mapping_Name,
        prepare,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        var returnData = null;
        $.ajax({
            type: "POST",
            url: "../../common/php/setProcedures.php",
            data: {
                "accountName": accountName,
                "userName": userName,
                "mappingName": mapping_Name,
                "prepare[]": prepare
            },
            dataType: "text",
            async: async,
            cache: false,
            // 成功したときの処理
            success: function (data) {
                returnData = true;
                console.log('\n\naccountName: ' + accountName);
                console.log('\n\nuserName: ' + userName);
                console.log('\n\nmappingName: ' + mapping_Name);
                console.log('parametter: ' + prepare);
                console.log('data: ' + data);
            },
            // エラー処理
            error: function (data) {
                returnData = false;
                console.log('\n\naccountName: ' + mapping_Name);
                console.log('\n\nuserName: ' + userName);
                console.log('\n\nmappingName: ' + mapping_Name);
                console.log('parametter: ' + prepare);
                console.log('data: ' + data);
            }
        });
        return returnData;
    }
    //=========================================
    // メソッド
    // ＳＱＬの１つの命令を実行する
    //=========================================
    set(
        sentSQL,
        // successFunction, 
        message,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        var flag = false; // 登録成功 ： true, 登録失敗 : flase
        if (message !== false) {
            if (false === confirm(message)) {
                return false;
            }
        }
        $.ajax({
            type: "POST",
            url: "../../common/php/setDB.php",
            data: {
                "accountName": accountName,
                "userName": userName,
                "sentSQL": sentSQL
            },
            dataType: "text",
            async: async,
            cache: false,
            // 成功したときの処理
            success: function (data) {
                flag = true;
                console.log(data);
            },
            // エラー処理
            error: function (data) {
                flag = false;
                console.log(data);
            }
        });
        return flag;
    }
    // //=========================================
    // // メソッド
    // // ＳＱＬの１つの命令を実行する
    // //=========================================
    // setAsync: function(
    //     sentSQL, 
    //     successFunction,
    //     async = DatabaseAsyncOn,
    //     accountName=localStorage.getItem('accountName'),
    //     userName=localStorage.getItem('sa')
    // ) {
    //     $.ajax({
    //         type: "POST",
    //         url: "../../common/php/setDB.php",
    //         data: {
    //             "accountName": accountName,
    //             "userName": userName,
    //             "sentSQL": sentSQL
    //         },
    //         dataType: "html",
    //         async: async,
    //         cache: false,
    //         // 成功したときの処理
    //         success: successFunction,
    //         // エラー処理
    //         error: function(XMLHttpRequest, textStatus, errorThrown) {
    //             return false;
    //         }
    //     });
    //     return true;
    // },
    //=========================================
    // クラスメソッド
    // DBからSQLを使ってXMLデータをGETする
    //=========================================
    getXML(
        sentSQL,
        successFunction,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        $.ajax({
            type: "POST",
            url: "../../common/php/getXML.php",
            data: {
                "accountName": accountName,
                "userName": userName,
                "sentSQL": sentSQL
            },
            dataType: "xml",
            async: async,
            cache: false,
            // 成功したときの処理
            success: successFunction,
            // エラー処理
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("データベースが読み込めません : " + XMLHttpRequest.status + "\ntextStatus : " +
                    textStatus + "\nerrorThrown : " + errorThrown.message);
            }
        });
    }
    //=========================================
    // メソッド
    // DBへ SQLを使って配列データを SETする
    //=========================================
    setArray(
        sentSQL,
        message,
        async = DatabaseAsyncOff,
        accountName = localStorage.getItem('accountName'),
        userName = localStorage.getItem('userName')
    ) {
        var flag = false; // 登録成功 ： true, 登録失敗 : flase
        $.ajax({
            type: "POST",
            url: "../../common/php/setDBArray.php",
            data: {
                "accountName": accountName,
                "userName": userName,
                "sentSQL[]": sentSQL
            },
            dataType: "text",
            async: async,
            cache: false,
            success: function (data) {
                if (message !== false) {
                    alert(message);
                }
                flag = true;
                console.log(data);
            },
            // エラー処理
            error: function (data) {
                flag = false;
                console.log(data);
            }
        });
        return flag;
    }
}