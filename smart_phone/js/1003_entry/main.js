//*****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//*****************************************************************
$(document).ready(function() {
    const self = new MainClass();
    if (self.maeShori() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    if (self.checkGetData() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    if (self.initShow() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    if (self.atoShori() == false) {
        // エラーが発生した時、以下の処理を行わない
        return false;
    }
    // はてなの非表示フラグ
    let hatena1 = false;
    let hatena2 = false;
    let hatena3 = false;
    //============================================
    //会社アカウントが入力された時、ボタンを活性にする処理
    //============================================
    $("#user").keydown(function() {
        $("#entryButton").attr('disabled', false);
        $("#user").css('border', '');
    });
    //============================================
    //パスワードが入力された時、ボタンを活性にする処理
    //============================================
    $("#passWord").keydown(function() {
        $("#entryButton").attr('disabled', false);
        $("#passWord").css('border', '');
    });
    //============================================
    // アプリ登録用ID
    //============================================
    $("#appid").keydown(function() {
        $("#entryButton").attr('disabled', false);
        $("#appid").css('border', '');
    });
    //============================================
    // クリックされた時、クリアする
    //============================================
    // hatena1押下時 説明文の表示切替
    $("#hatena1").click(function() {
        if (hatena1 == false) {
            // hatena1が非表示の場合表示にする
            hatena1 = true;
            $("#exhatena1").show();
            hatena1 = true;
        } else if (hatena1 == true) {
            // hatena1が表示の場合非表示にする
            $("#exhatena1").hide();
            hatena1 = false;
        }
    });
    //============================================
    // hatena2押下時 説明文の表示切替
    //============================================
    $("#hatena2").click(function() {
        if (hatena2 == false) {
            // hatena1が非表示の場合表示にする
            hatena2 = true;
            $("#exhatena2").show();
            hatena2 = true;
        } else if (hatena2 == true) {
            // hatena1が表示の場合非表示にする
            $("#exhatena2").hide();
            hatena2 = false;
        }
    });
    //============================================
    // hatena1押下時 説明文の表示切替
    //============================================
    $("#hatena3").click(function() {
        if (hatena3 == false) {
            // hatena1が非表示の場合表示にする
            hatena3 = true;
            $("#exhatena3").show();
            hatena3 = true;
        } else if (hatena3 == true) {
            // hatena1が表示の場合非表示にする
            $("#exhatena3").hide();
            hatena3 = false;
        }
    });
    //============================================
    // 登録処理
    //============================================
    $('#entryButton').click(function() {
        self.user = $("#user").val();
        self.passWord = $("#passWord").val();
        self.appid = $("#appid").val();
        // 入力チェック
        const arr = self.FormCheck(
            self.user,
            self.passWord,
            self.appid
        );
        if (arr == false) {
            return false;
        } else {
            if (self.entry(arr) == true) {
                location.href = GAIA_URL_VERSION + 'smart_phone/view/1003_endEntry.html';
                return false;
            }
        }
    });
    //============================================
    // ※アプリ登録情報をお忘れの方はこちらクリック処理
    //============================================
    $('#entryapp').click(function() {
        location.href = "entryapp.html?registerID=" + regid;
        return false;
    });
    //============================================
    // 会社アカウント変更処理
    //============================================
    $('#user').keypress(function(event) {
        // テキストボックス枠を通常（黒）にする
        $("#user").css('border', '');
    });
    //============================================
    // パスワード変更処理
    //============================================
    $("#passWord").keypress(function(event) {
        $("#passWord").css('border', '');
    });
    //============================================
    // アプリ登録用ID変更処理
    //============================================
    $('#appid').keypress(function(event) {
        // テキストボックス枠を通常（黒）にする
        $("#appid").css('border', '');
    });
});