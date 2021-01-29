"use strict";
//**************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//**************************************************************
// 関数
// 関数はこのJSファイルに記入してください
//****************************************
// 自作セレクターメソッド
//****************************************
MainClass1021.prototype.sel = function(selecter) {
    return $(".view1021 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1021.prototype.ev = function(eventName, selecter, func) {
    $(".view1021").on(eventName, selecter, func);
};
//=========================================
// ログアウト処理
//=========================================
MainClass1021.prototype.logout = async function() {
    const self = this;
    // ログインデータをログアウト状態にする。
    await self.database.putFetch(
        'mappingPutLogout',
        [
            self.companyID,
            self.staff,
            self.registerID,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
        })
        .catch(() => {
            Materialize.toast('E100103 : ログアウト処理に失敗しました。', 3000);
        })
    // ローカルストレージ  ログインフラグ削除
    localStorage.clear();
    // ログイン画面へ遷移する
    location.href = 'https:///timeCard/dev/pwa/smart_phone/view/1001_login.html?mode=pwa'
    // spaHash('#10011', 'reverse');
    return true;
};