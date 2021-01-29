//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//=========================================
// 関数
// 関数はこのJSファイルに記入してください
//=========================================
MainClass.prototype.entry = function(arr) {
    const self = this;
    const companyID = arr[0];
    const staffData = arr[1];
    const staff = staffData[0].staffID;
    const staffName = staffData[0].name;
    if (confirm(staffName + 'さんの新規アカウントを作成します。よろしいですか？')) {
        const editFlg = self.database.setProcedures(
            'ver_2_5_SetStaff', [
                self.passWord,
                self.email,
                self.appid,
                companyID
            ],
            false,
            self.accountName,
            self.userName
        );
        if (false === self.exception.check(
                editFlg,
                ExceptionServerOn,
                ExceptionSystemOn,
                "100301",
                "スマホの新規登録に失敗しました。",
                ExceptionParamMailTriger,
                self.regid,
                self.udid
            )) {
            return false;
        }
        // 通知の個人設定の有無を確認
        const entryFlg = self.database.setProcedures(
            'ver_2_5_SetPersonal', [
                staff,
                companyID
            ],
            false,
            self.accountName,
            self.userName
        );
        if (false === self.exception.check(
                entryFlg,
                ExceptionServerOn,
                ExceptionSystemOn,
                "100303",
                "個人設定の登録に失敗しました。",
                ExceptionParamMailTriger,
                self.regid,
                self.udid
            )) {
            return false;
        }
    } else {
        // 何も処理をしない
        return false;
    }
    // 既に端末情報が存在しているとき
    // スマホ情報の登録をする
    const entryFlg = self.database.setProcedures(
        'ver_2_5_SetSmartPhone', [
            staff,
            companyID,
            self.regid,
            self.TodayGet()[0],
            self.tanmatuName,
            self.udid
        ],
        false,
        self.accountName,
        self.userName
    );
    if (false === self.exception.check(
            entryFlg,
            ExceptionServerOn,
            ExceptionSystemOn,
            "100305",
            "端末情報の新規登録に失敗しました。",
            ExceptionParamMailTriger,
            self.regid,
            self.udid
        )) {
        return false;
    }
    return true;
};
MainClass.prototype.TodayGet = function() {
    //本日日付の取得
    const YM = new Date();
    const yyyy = YM.getFullYear();
    const mm = addZero(YM.getMonth() + 1);
    const dd = addZero(YM.getDate());
    const hh = addZero(YM.getHours());
    const min = addZero(YM.getMinutes());
    const ss = addZero(YM.getSeconds());
    const today = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
    return [today];
};
MainClass.prototype.FormCheck = function(user, passWord, appid) {
    const self = this;
    // 会社アカウントチェック
    if (user === "") {
        // 必須チェック
        Materialize.toast('会社アカウントを入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#user").css('border', '2px #ff0000 double');
        return false;
    }
    if (!user.match(/^[A-Za-z0-9]+/)) {
        // 入力値チェック
        Materialize.toast('会社アカウントは8桁以上20桁までの半角英数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#user").css('border', '2px #ff0000 double');
        return false;
    }
    if (user.length > 20) {
        // 入力値チェック
        Materialize.toast('会社アカウントは8桁以上20桁までの半角英数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#user").css('border', '2px #ff0000 double');
        return false;
    }
    // パスワードチェック
    if (passWord === "") {
        // 必須チェック
        Materialize.toast('パスワードを入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#passWord").css('border', '2px #ff0000 double');
        return false;
    }
    // パスワード半角数値チェック
    if (!passWord.match(/^[A-Za-z0-9]+/)) {
        Materialize.toast('パスワードは８桁以上２０桁までの半角英数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#passWord").css('border', '2px #ff0000 double');
        return false;
    }
    // パスワード桁数チェック
    if (passWord.length < 8 || passWord.length > 20) {
        Materialize.toast('パスワードは８桁以上２０桁までの半角英数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#passWord").css('border', '2px #ff0000 double');
        return false;
    }
    // アプリ登録用ID空白チェック
    if (appid == "") {
        Materialize.toast('アプリ登録用IDを入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#appid").css('border', '2px #ff0000 double');
        return false;
    }
    // アプリ登録用ID半角数値チェック
    if (appid.match(/[^0-9]+/)) {
        Materialize.toast('アプリ登録用IDは半角数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        $("#appid").css('border', '2px #ff0000 double');
        return false;
    }
    // 会社アカウント存在チェックを実施する
    const comAccount = self.database.getProcedures(
        'ver_2_5_GetCompany', [
            user
        ],
        false,
        self.accountName,
        self.userName
    );
    if (false === self.exception.check(
            comAccount,
            ExceptionServerOn,
            function() {
                // ログイン情報の取得ができなかった場合
                Materialize.toast('会社アカウントが存在しません。', 3000);
                // テキストボックスを赤枠にする
                $("#user").css('border', '2px #ff0000 double');
            },
            "100306",
            "会社アカウントの取得に失敗しました。",
            ExceptionParamMailTriger,
            self.regid,
            self.udid
        )) {
        return false;
    }
    const companyID = comAccount[0].companyID;
    // スタッフ情報の取得を実施する
    const staffData = self.database.getProcedures(
        'ver_2_5_GetStaff', [
            appid,
            companyID
        ],
        false,
        self.accountName,
        self.userName
    );
    if (false === self.exception.check(
            staffData,
            ExceptionServerOn,
            function() {
                Materialize.toast('アプリ登録用IDが有効ではありません。', 3000);
                // テキストボックスを赤枠にする
                $("#appid").css('border', '2px #ff0000 double');
                return false;
            },
            "100307",
            "スタッフ情報の取得に失敗しました。",
            ExceptionParamMailTriger,
            self.regid,
            self.udid
        )) {
        return false;
    }
    return [companyID, staffData];
};