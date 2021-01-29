"use strict";
//******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/04  画像変更とアップロードの処理を追加
// 2017/08/04 村田追記と変更：画像変更時とメアド、パスワード変更時で処理を切り替える
// 2017/08/08 yamazaki ２回目の読み込みがおかしいため、画像の保存時に画面のリロードをしました。
// 2017/08/21  モーダルエリア閉じた時にエラーの初期化を追加
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/08/22  モーダルエリアに登録情報を忘れた時のリンクを追加。
// 2017/09/08  ユーザーエージェントの取得
// 2017/09/08  モーダルエリアの入力領域以外を隠す処理
//******************************************************************
MainClass1022.prototype.event = function() {
    const self = this;
    const img = self.staffData[0].url;
    let upDateUrl = '';
    self.fileName = self.staffData[0].url;
    // ***************************
    // アイコン選択時のイベント処理
    // ***************************
    function iconChange() {
        self.sel("#radio1").prop("checked", true);
        self.fileName = $(this).attr("src");
        self.sel(".iconTable").css("background", "none");
        $(this).parents(".iconTable").css("background", "#fa8072");
        self.sel("#nowIcon").attr("src", self.fileName);
        if (img != self.fileName) {
            sessionStorage.setItem('isChange', 'true');
        } else {
            sessionStorage.setItem('isChange', 'false');
        }
        self.sel("#update").attr("disabled", false);
    }
    self.ev('click', '#green', iconChange);
    self.ev('click', '#pink', iconChange);
    self.ev('click', '#yellow', iconChange);
    self.ev('click', '#blue', iconChange);
    self.ev('click', '#boy', iconChange);
    self.ev('click', '#boy2', iconChange);
    self.ev('click', '#girl', iconChange);
    self.ev('click', '#girl2', iconChange);
    // ***************************
    // セレクトボックス選択時処理
    // ***************************
    self.ev('change', '#notifyTime', function() {
        self.sel("#update").attr("disabled", false);
        sessionStorage.setItem('isChange', 'true');
    });
    self.ev('change', '#holiday', function() {
        self.sel("#update").attr("disabled", false);
        sessionStorage.setItem('isChange', 'true');
    });
    // ***************************
    // メールアドレス押下時
    // ***************************
    self.ev('click', '#mail', function() {
        self.sel("#modalTitle").text('メールアドレスの変更');
        self.sel(".appidforget").css('display', 'block');
        // モーダル表示
        self.sel('#modal1').modal('open');
        self.sel(".preloader-wrapper").hide();
        // 2017/08/04 村田変更と追記
        // 表示
        self.sel("#newAddress").css('display', 'block');
        self.sel("#newAddresskakunin").css('display', 'block');
        self.sel("#passWord").css('display', 'block');
        self.sel("#newAddress").val('');
        self.sel("#newAddresskakunin").val('');
        self.sel("#passWord").val('');
        // 非表示
        self.sel("#newPass").css('display', 'none');
        self.sel("#kakunin").css('display', 'none');
        self.sel("#mycanvas").css('display', 'none');
        self.sel("#loadText").css('display', 'none');
        self.moduleFlg = 'mail';
    });
    self.ev('click', '#mailAdd', function() {
        self.sel("#modalTitle").text('メールアドレスの変更');
        self.sel(".appidforget").css('display', 'block');
        // モーダル表示
        self.sel('#modal1').modal('open');
        self.sel(".preloader-wrapper").hide();
        self.sel(".cropper-container").hide();
        // 2018/06/13 村田変更と追記
        // 表示
        self.sel("#newAddress").css('display', 'block');
        self.sel("#newAddresskakunin").css('display', 'block');
        self.sel("#passWord").css('display', 'block');
        self.sel("#newAddress").val('');
        self.sel("#newAddresskakunin").val('');
        self.sel("#passWord").val('');
        // 非表示
        self.sel("#newPass").css('display', 'none');
        self.sel("#kakunin").css('display', 'none');
        self.sel("#mycanvas").css('display', 'none');
        self.sel("#loadText").css('display', 'none');
        self.moduleFlg = 'mail';
    });
    // ***************************
    // パスワード変更押下時
    // ***************************
    self.ev('click', '#passChange', function() {
        self.sel("#modalTitle").text('パスワードの変更');
        self.sel(".appidforget").css('display', 'block');
        // モーダル表示
        self.sel('#modal1').modal('open');
        self.sel(".preloader-wrapper").hide();
        self.sel(".cropper-container").hide();
        // 表示
        self.sel("#passWord").css('display', 'block');
        self.sel("#newPass").css('display', 'block');
        self.sel("#kakunin").css('display', 'block');
        self.sel("#passWord").val('');
        self.sel("#newPass").val('');
        self.sel("#kakunin").val('');
        // 非表示
        self.sel("#newAddress").css('display', 'none');
        self.sel("#newAddresskakunin").css('display', 'none');
        self.sel("#mycanvas").css('display', 'none');
        self.sel("#loadText").css('display', 'none');
        self.moduleFlg = 'password';
    });
    // ***************************
    // 更新ボタン押下時
    // ***************************
    self.ev('click', '#update', function() {
        if (!confirm("変更内容を更新します。よろしいですか？")) {
            return false;
        }
        upDateUrl = self.fileName;
        if (false === self.exception.check(
                self.updateFunc(upDateUrl),
                ExceptionServerOn,
                ExceptionSystemOn,
                "102201",
                "個人設定の更新処理に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        // 画面のリロード
        Materialize.toast('設定を変更しました。', 1500);
        setTimeout(function() {
            spaHash('#1021', 'reverse');
        }, 1500);
    });
    // ***************************
    // 戻るボタン押下時
    // ***************************
    function back() {
        if (sessionStorage.getItem('isChange') == 'true') {
            if (!confirm("更新ボタンをタップするまで内容が確定されません。よろしいですか？")) {
                return false;
            }
        }
        spaHash('#1021', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
    // ***************************
    // モーダルのイベント処理
    // ***************************
    self.modalEvent();
    // ***************************
    // モーダルの保存するボタン押下時
    // ***************************
    self.ev('click', '#entry', function() {
        const error = 'error';
        const returnFlag = self.modalUpDate();
        if (false === self.exception.check(
                returnFlag,
                ExceptionServerOn,
                ExceptionSystemOn,
                "102202",
                "個人設定の更新処理に失敗しました。",
                ExceptionParamToMenu
            )) {
            return false;
        }
        switch (returnFlag) {
            case error:
                return false;
            case 0:
                // 画像写真から選択した時
                upDateUrl = self.fileName;
                if (false === self.exception.check(
                        self.updateIcon(upDateUrl),
                        ExceptionServerOn,
                        ExceptionSystemOn,
                        "102203",
                        "個人設定の更新処理に失敗しました。",
                        ExceptionParamToMenu
                    )) {
                    return false;
                }
                break;
            default:
        }
        // 画面のリロード
        Materialize.toast('個人情報が更新されました。', 1500);
        setTimeout(function() {
            spaHash('#1021', 'reverse');
        }, 1500);
        // モーダルエリアを閉じる
        self.sel("#passWord").css('border', '');
        self.sel("#newPass").css('border', '');
        self.sel("#kakunin").css('border', '');
        self.sel("#newAddress").css('border', '');
        self.sel("#newAddresskakunin").css('border', '');
        self.sel('#modal1').modal('close');
    });
};