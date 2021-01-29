//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//********************************************************************
// 初期化処理
//*************************************
$(document).ready(function() {
    smartPhoneLoad();
    const _GET = getParameter();
    const regid = _GET.registerID;
    const udid = _GET.udid;
    const param = _GET.param;
    const errorMessage = _GET.errorMessage;
    //----------------------------------
    //----------------------------------
    $("#kari").html("");
    $("#kari").append(
        "<th>" +
            // "【システムエラー】<br><br>" +
            errorMessage +
        "</th>"
    );
    // ① アプリの再インストールをお願いする
    if (param == "0") {
        $("h2").append(
            "お手数ですがアプリをバックグラウンドから削除し、再度タップしてください。"
        );
        $("#login").hide();
        $("#menu").hide();
    }
    // ② メニュー画面へ遷移させる
    else if (param == "1") {
        $("h2").append(
            "お手数ですがメニュー画面へもどり、もう一度お試しください。"
        );
        $("#login").hide();
    }
    // ③ ログイン画面へ遷移させる
    else if (param == "2") {
        $("h2").append(
            "お手数ですがログイン画面へもどり、もう一度お試しください。"
        );
        $("#menu").hide();
    }
    // ④ 処理をやり直させる（メールアドレスからブラウザを立ち上げたときなど）
    else if (param == "3") {
        $("h2").append(
            "お手数ですが再度、処理をやり直してください。"
        );
        $("#login").hide();
        $("#menu").hide();
    }
    //============================================
    // メニュー遷移ボタン押下処理
    //============================================
    $("#menu").click(function() {
        location.href = "1001_login.html#1004";
        return false;
    });
    $("#login").click(function() {
        location.href = "1001_login.html?registerID=" + regid + "&udid=" + udid;
        localStorage.clear();
        return false;
    });
});