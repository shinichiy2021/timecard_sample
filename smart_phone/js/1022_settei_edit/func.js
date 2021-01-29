"use strict";
//****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/04  ファイルアップロード処理追加
// 2017/08/21 追記 アイコン画像が変更された時の処理 ⇒mainに移動しました。2017/08/24 
// 2017/08/21  アラートをフレームワーク統一に変更
//****************************************************************
// 自作セレクターメソッド
//****************************************
MainClass1022.prototype.sel = function(selecter) {
    return $(".view1022 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1022.prototype.ev = function(eventName, selecter, func) {
    $(".view1022").on(eventName, selecter, func);
};
//---------------------------------------
// 選択した画像をアップデートする
// 引数
//---------------------------------------
MainClass1022.prototype.uploadFile = function(filePass, fileName) {
    const self = this;
    const error = "error";
    const flg = 0;
    const base64 = self.cropper.getCroppedCanvas().toDataURL("image/jpeg");
    // 2017/08/21 追記 アイコン画像が変更された時の処理
    self.sel(".iconTable").css("background", "none");
    self.sel('#loader-bg').delay(300).fadeOut(300);
    // ここから画像の送信処理です（ログでは無く、サーバー上のフォルダに画像を送信する処理）
    $.ajax({
            url: "../php/upload.php",
            type: "POST",
            data: {
                "image": base64,
                "filePass": filePass,
                "fileName": fileName
            },
            cache: false,
            dataType: "html",
            async: false
        })
        .done(function(data, textStatus, jqXHR) {})
        .fail(function(jqXHR, textStatus, errorThrown) {
            Materialize.toast('ファイルのアップロードに失敗しました。', 3000);
            self.sel("#nowIcon").attr("src", self.fileName);
            return error;
        });
    self.fileName = '../../../../photo/staff_icon/' + fileName + '.jpeg';
    self.sel("#nowIcon").attr("src", base64);
    return flg;
};
// ***************************
//  モーダルエリア入力チェック
// ***************************
MainClass1022.prototype.moduleCheck = function() {
    const self = this;
    const email = self.sel("#newAddress").val();
    const emailkakunin = self.sel("#newAddresskakunin").val();
    const passWord = self.sel("#passWord").val();
    const newPass = self.sel("#newPass").val();
    const kakunin = self.sel("#kakunin").val();
    // メールアドレス変更処理の場合
    if (self.moduleFlg == 'mail') {
        // メールアドレス空白チェック
        if (email == null || email == "") {
            Materialize.toast('新しいメールアドレスを入力してください。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newAddress").css('border', '2px #ff0000 solid');
            return false;
        }
        // メールアドレス半角英数字チェック(半角英数字でない時)
        if (!email.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/)) {
            Materialize.toast('メールアドレスはメールアドレス形式で入力してください。(例:info@)', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newAddress").css('border', '2px #ff0000 solid');
            return false;
        }
        // 新しいと確認のパスワードチェック
        if (email != emailkakunin) {
            Materialize.toast('メールアドレスが一致しません。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newAddresskakunin").css('border', '2px #ff0000 solid');
            return false;
        }
    }
    // パスワードチェック
    if (passWord == "") {
        // 必須チェック
        Materialize.toast('現在設定されているパスワードを入力してください。', 3000);
        // テキストボックスを赤枠にする
        self.sel("#passWord").css('border', '2px #ff0000 solid');
        return false;
    }
    // パスワード半角英数字チェック
    if (!passWord.match(/^[A-Za-z0-9]+/)) {
        Materialize.toast('パスワードは８桁以上２０桁までの半角英数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        self.sel("#passWord").css('border', '2px #ff0000 solid');
        return false;
    }
    // パスワード桁数チェック
    if (passWord.length < 8 || passWord.length > 20) {
        Materialize.toast('パスワードは８桁以上２０桁までの半角英数字で入力してください。', 3000);
        // テキストボックスを赤枠にする
        self.sel("#passWord").css('border', '2px #ff0000 solid');
        return false;
    }
    // パスワード変更処理の場合
    if (self.moduleFlg == 'password') {
        // 新しいパスワードチェック
        if (newPass == '') {
            // 必須チェック
            Materialize.toast('新しく設定するパスワードを入力してください。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newPass").css('border', '2px #ff0000 solid');
            return false;
        }
        // 新しいパスワード半角英数字チェック
        if (!newPass.match(/^[A-Za-z0-9]+/)) {
            Materialize.toast('新しく設定するパスワードは８桁以上２０桁までの半角英数字で入力してください。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newPass").css('border', '2px #ff0000 solid');
            return false;
        }
        // 新しいパスワード桁数チェック
        if (newPass.length < 8 || newPass.length > 20) {
            Materialize.toast('新しく設定するパスワードは８桁以上２０桁までの半角英数字で入力してください。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newPass").css('border', '2px #ff0000 solid');
            return false;
        }
        // 新しいと確認のパスワードチェック
        if (kakunin != newPass) {
            Materialize.toast('新しいパスワードと確認のためのパスワードが一致していません。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#kakunin").css('border', '2px #ff0000 solid');
            return false;
        }
        // 新しいと確認のパスワード重複チェック
        if (passWord == newPass) {
            Materialize.toast('新しいパスワードと現在のパスワードが同じです。', 3000);
            // テキストボックスを赤枠にする
            self.sel("#newPass").css('border', '2px #ff0000 solid');
            return false;
        }
    }
};
//-------------------------------------------------
// 写真でアイコン変更した時の更新処理
//-------------------------------------------------
MainClass1022.prototype.updateIcon = function(upDateUrl) {
    const self = this;
    // アイコンの更新
    const editFlg = self.master.edit(
        "MK_staff",
        "", ["url"], ["'" + upDateUrl + "'"], [
            "MK_staff.staffID=N'" + self.staff + "'",
            "MK_staff.companyID=N'" + self.companyID + "'"
        ]
    );
    switch (editFlg) {
        case false:
            return false;
        case null:
            return null;
        default:
            return true;
    }
};
//-------------------------------------------------
// 更新ボタン押下時
//-------------------------------------------------
MainClass1022.prototype.updateFunc = function(upDateUrl) {
    const self = this;
    const retFlg = true;
    const notifyData = self.master.read(
        "SELECT" +
        "    startPermit," +
        "    endPermit," +
        "    holiday," +
        "    weekday" +
        " FROM MK_kojinSet ", [
            "staffID=N'" + self.staff + "'",
            "companyID=N'" + self.companyID + "'"
        ],
        null
    );
    if (notifyData == false) {
        return false;
    }
    // 通知許可設定のDBへのインサート又はアップデート
    if (notifyData == null) {
        //新規データの場合
        const entryFlg = self.master.entry(
            " MK_kojinSet",
            "", [
                "staffID",
                "weekday",
                "holiday",
                "companyID"
            ], [
                "N'" + self.staff + "'",
                "'" + self.sel("#notifyTime").val() + "'",
                "'" + self.sel("#holiday").val() + "'",
                "N'" + self.companyID + "'"
            ]
        );
        if (entryFlg == false) {
            return false;
        }
        if (entryFlg == null) {
            return null;
        }
    } else {
        //既にデータが存在する場合
        const editFlg = self.master.edit(
            "MK_kojinSet",
            "", [
                "weekday",
                "holiday"
            ], [
                "'" + self.sel("#notifyTime").val() + "'",
                "'" + self.sel("#holiday").val() + "'"
            ], [
                "MK_kojinSet.staffID=N'" + self.staff + "'",
                "MK_kojinSet.companyID=N'" + self.companyID + "'"
            ]
        );
        if (editFlg == false) {
            return false;
        }
        if (editFlg == null) {
            return null;
        }
    }
    // アイコンの更新
    const editFlg = self.master.edit(
        "MK_staff",
        "", ["url"], ["'" + upDateUrl + "'"], [
            "MK_staff.staffID=N'" + self.staff + "'",
            "MK_staff.companyID=N'" + self.companyID + "'"
        ]
    );
    if (editFlg == false) {
        return false;
    }
    if (editFlg == null) {
        return null;
    }
    return retFlg;
};
//-----------------------------------------------------------
// モーダルエリアの保存ボタン押下時
//-----------------------------------------------------------
MainClass1022.prototype.modalUpDate = function() {
    const self = this;
    const error = 'error';
    // 2017/08/04 村田追記と変更：画像変更時とメアド、パスワード変更時で処理を切り替える
    if (self.sel("#modalTitle").text() == '会話用アイコンの選択') {
        // ファイル名を作る
        const fileName = self.staff + self.companyID;
        // モーダルエリアを閉じる
        const fileUp = self.uploadFile("timeCard/photo/staff_icon/", fileName);
        return fileUp;
    } else {
        // 入力チェック
        if (self.moduleCheck() == false) {
            return error;
        }
        // パスワードチェック
        const passData = self.master.read(
            "SELECT" +
            "    password" +
            " FROM MK_staff" +
            " WHERE" +
            "    password=N'" + self.sel('#passWord').val() + "' AND" +
            "    staffID=N'" + self.staff + "' AND" +
            "    companyID=N'" + self.companyID + "'"
        );
        if (passData == false) {
            return false;
        }
        // メールアドレスを変更する押下の場合
        if (self.moduleFlg == 'mail') {
            // メールアドレスチェック
            const staffData = self.master.read(
                "SELECT * FROM MK_staff" +
                " WHERE" +
                "    email=N'" + self.sel('#newAddress').val() + "'"
            );
            if (staffData == false) {
                return false;
            }
            // メールアドレスが存在している場合、エラー表示
            if (staffData != null) {
                Materialize.toast('入力されたメールアドレスは既に使用されています。別のメールアドレスを入力してください。', 3000);
                self.sel("#newAddress").css('border', '2px #ff0000 solid');
                return error;
            }
            // パスワードがない場合
            if (passData == null) {
                Materialize.toast('パスワードが一致しません。', 3000);
                self.sel("#passWord").css('border', '2px #ff0000 solid');
                return error;
            }
            // メールが存在していなく、パスワードがあっている場合メールアドレスを変更保存する
            const editFlg = self.master.edit(
                "MK_staff",
                "",
                [ "email" ],
                [ "N'" + self.sel("#newAddress").val() + "'" ],
                [
                    "MK_staff.staffID=N'" + self.staff + "'",
                    "MK_staff.companyID=N'" + self.companyID + "'"
                ]
            );
            if (editFlg == false) {
                return false;
            }
            if (editFlg == null) {
                return null;
            }
            return true;
        }
        // パスワードを変更する押下の場合
        if (self.moduleFlg == 'password') {
            // パスワードがない場合
            if (passData == null) {
                Materialize.toast('以前のパスワードが一致しません。', 3000);
                // テキストボックスを赤枠にする
                self.sel("#passWord").css('border', '2px #ff0000 solid');
                return error;
            }
            // 以前のパスワードとあっていた場合、パスワードを変更保存する
            const editFlg = self.master.edit(
                "MK_staff",
                "",
                [ "password" ],
                [ "N'" + self.sel("#newPass").val() + "'" ],
                [
                    "MK_staff.staffID=N'" + self.staff + "'",
                    "MK_staff.companyID=N'" + self.companyID + "'"
                ]
            );
            if (editFlg == false) {
                return false;
            }
            if (editFlg == null) {
                return null;
            }
            // 2017/08/28 yamazaki
            // 画面遷移する場合は、アラートのままで画面遷移する前に止めます。
            return true;
        }
    }
};