"use strict";
//=========================================
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 自作セレクターメソッド
//=========================================
MainClass10011.prototype.sel = function (selecter) {
    return $(".view10011 " + selecter);
};
//=========================================
// 自作イベントメソッド
//=========================================
MainClass10011.prototype.ev = function (eventName, selecter, func) {
    $(".view10011").on(eventName, selecter, func);
};
//=========================================
// ログインイベント
//=========================================
MainClass10011.prototype.asyncLogin = async function () {
    const self = this;
    const email = self.sel("#email").val();
    const passWord = self.sel("#passWord").val();
    //============================================
    // 入力チェック
    //============================================
    // 会社アカウントの入力チェック
    if (self.commonCheck("会社アカウント", "#loginAccount") !== true) {
        // 処理を終了する
        return false;
    }
    // メールアドレスの入力チェック
    if (self.mailErCheck(email, self.sel("#email")) !== true) {
        // 処理を終了する
        return false;
    }
    // パスワードの入力チェック
    if (self.commonCheck("パスワード", "#passWord") !== true) {
        // 処理を終了する
        return false;
    }
    //********************************************************S
    // 2019/11/13 yamazaki
    // 共通エラーチェックでカバーしきれない
    // エラーチェック分の処理
    // 将来的には、削除したい処理です
    if (passWord.length < 8 || passWord.length > 20) {
        Materialize.toast("パスワードは８桁以上２０桁までの半角英数字で入力してください。", 3000);
        self.sel("#passWord").addClass('red-error');
        // 処理を終了する
        return false;
    }
    //********************************************************E
    // ログインアカウントからDB接続情報を取得する
    let infoConnectionDB = null
    await self.database.getFetch(
        'ver_2_5_Release01',
        [
            self.sel("#loginAccount").val()
        ],
        'gaia_kanri',
        'gaia_kanri'
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            infoConnectionDB = data
        })
        .catch(() => {
            Materialize.toast('E100101 : DB接続情報の取得に失敗しました。', 3000);
            infoConnectionDB = false
        })
    // 取得ができなかった場合
    switch (infoConnectionDB) {
        case false:
            return false;
        case null:
            Materialize.toast('会社アカウントが有効ではありません。', 3000);
            self.sel("#loginAccount").addClass('red-error');
            return false;
        default:
            // ローカルストレージに取得した値を保存する
            localStorage.setItem('accountName', infoConnectionDB[0].accountName);
            localStorage.setItem('userName', infoConnectionDB[0].userName);
            localStorage.setItem('pushInfo', infoConnectionDB[0].iphone_push_file_name);
    }
    //********************************************************
    // スタッフ情報の取得
    //********************************************************
    let loginData = null
    await self.database.getFetch(
        'loginStaffInfo',
        [
            infoConnectionDB[0].companyID,
            email,
            passWord,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            loginData = data
        })
        .catch(() => {
            Materialize.toast('E100102 : スタッフ情報の取得に失敗しました。', 3000);
            loginData = false
        })
    // 取得ができなかった場合
    switch (loginData) {
        case false:
            return false;
        case null:
            Materialize.toast('メールアドレスまたはパスワードが有効ではありません。', 3000);
            self.sel("#email").addClass('red-error');
            self.sel("#passWord").addClass('red-error');
            return false;
        default:
    }
    //********************************************************
    // LINEからトークンの取得
    //********************************************************
    // スマホ情報の登録
    const companyID = loginData[0].companyID;
    const staffID = loginData[0].staffID;
    const lineCode = self._GET.code
    if (undefined !== lineCode) {
        await self.database.getLineToken(lineCode)
            .then(response => {
                response.json()
                    .then(json => {
                        // jsonを取得
                        const accessToken = json.access_token
                        // スマホ情報の登録
                        self.database.putFetch(
                            'ver_2_5_100102',
                            [
                                companyID,
                                staffID,
                                '',
                                'LINE',
                                accessToken,
                                self.udid
                            ],
                        ).then(response => response.json())
                            .then(data => {
                                console.log('Success:', data)
                            })
                            .catch(() => {
                                Materialize.toast('E100103 : ログイン情報の登録に失敗しました。', 3000);
                            })
                        // ローカルストレージにログインフラグ、メールアドレスをセットする
                        localStorage.setItem("loginFlg", "OK");
                        localStorage.setItem("email", self.sel("#email").val());
                        localStorage.setItem("registerID", accessToken);
                        spaHash('#1004', 'normal');
                        return true
                    })
                    .catch(() => {
                        Materialize.toast('E100102 : LINEとの連携に失敗しました。', 3000);
                        return false
                    })
            })
    } else {
        self.database.putFetch(
            'ver_2_5_100102',
            [
                companyID,
                staffID,
                '',
                self.tanmatuName,
                self.registerID,
                self.udid
            ],
        ).then(response => response.json())
            .then(data => {
                console.log('Success:', data)
            })
            .catch(() => {
                Materialize.toast('E100103 : ログイン情報の登録に失敗しました。', 3000);
            })
        // ローカルストレージにログインフラグ、メールアドレスをセットする
        localStorage.setItem("loginFlg", "OK");
        localStorage.setItem("email", self.sel("#email").val());
        spaHash('#1004', 'normal');
        return true
    }
}
//=========================================
// メールアドレスエラーチェック
//=========================================
MainClass10011.prototype.mailErCheck = function (email, selecter) {
    const self = this;
    // メールアドレス空白チェック
    if (email == null || email == "") {
        Materialize.toast('メールアドレスを入力してください。', 3000);
        selecter.addClass('red-error');
        // 処理を終了する
        return false;
    }
    // メールアドレス半角英数字チェック(半角英数字でない時)
    if (!email.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/)) {
        Materialize.toast('メールアドレスはメールアドレス形式で入力してください。(例:info@)', 3000);
        selecter.addClass('red-error');
        // 処理を終了する
        return false;
    }
    return true;
};
//=========================================
// 共通の入力エラーチェック
// 引数１：チェック項目の表示名称
// 引数２：チェック項目のID名
//=========================================
MainClass10011.prototype.commonCheck = function (
    showErrorName,
    checkIDName,
    currentClass = this
) {
    // const self = this;
    const passWord = currentClass.sel(checkIDName).val();
    // パスワード空白チェック
    if (passWord == "") {
        Materialize.toast(showErrorName + 'を入力してください。', 3000);
        currentClass.sel(checkIDName).addClass('red-error');
        // 処理を終了する
        return false;
    }
    for (let i = 0; i < passWord.length; i++) {
        /* 1文字ずつ文字コードをエスケープし、その長さが4文字以上なら全角 */
        const len = escape(passWord.charAt(i)).length;
        if (len >= 4) {
            Materialize.toast(showErrorName + 'は半角英数字の２０桁以内で入力してください。', 3000);
            currentClass.sel(checkIDName).addClass('red-error');
            // 処理を終了する
            return false;
        }
    }
    // パスワード半角数値チェック
    if (!passWord.match(/^[A-Za-z0-9]+/)) {
        Materialize.toast(showErrorName + 'は半角英数字の２０桁以内で入力してください。', 3000);
        currentClass.sel(checkIDName).addClass('red-error');
        // 処理を終了する
        return false;
    }
    // パスワード桁数チェック
    if (/*passWord.length < 8 ||*/ passWord.length > 20) {
        Materialize.toast(showErrorName + 'は半角英数字の２０桁以内で入力してください。', 3000);
        currentClass.sel(checkIDName).addClass('red-error');
        // 処理を終了する
        return false;
    }
    return true;
};