"use strict";
//***************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki  ヘッダーに変更履歴を追加しました。
// 2017/08/10 shinya    お知らせの未読のみの抽出条件追加
//***************************************************************
MainClass1004.prototype.event = function() {
    const self = this;
    // タイムカード画面遷移処理
    self.ev('click', '#kintai', function() {
        spaHash('#1012', 'normal');
        return false;
    });
    // お知らせボタン押下時
    self.ev('click', '#detail-menu', function() {
        spaHash('#1006', 'normal');
        return false;
    });
    // チャット画面遷移処理
    self.ev('click', '#chat', function() {
        spaHash('#1016', 'normal');
        return false;
    });
    self.ev('click', '#kaiwaP', function() {
        spaHash('#1016', 'normal');
        return false;
    });
    // Todoリスト遷移処理
    self.ev('click', '#todo', function() {
        spaHash('#1013', 'normal');
        return false;
    });
    self.ev('click', '#todoP', function() {
        spaHash('#1013', 'normal');
        return false;
    });
    // 申請画面遷移処理
    self.ev('click', '#sinsei', function() {
        spaHash('#1009', 'normal');
        return false;
    });
    // FAX詳細画面遷移処理
    self.ev('click', '#fax', function() {
        spaHash('#1024', 'normal');
        return false;
    });
    // 個人設定画面遷移処理
    self.ev('click', '#settei', function() {
        spaHash('#1021', 'normal');
        return false;
    });
    // GPS打刻遷移処理
    self.ev('click', '#gps', function () {
        sessionStorage.setItem('gpsFlag', false)
        sessionStorage.setItem('latitude', '')
        sessionStorage.setItem('longitude', '')
        location.href = '1025_gps.html';
        return false;
    });
    //--------------------------------------------------------------
    // バックグラウンド処理
    // setInterval関数 ・・・ 指定した時間ごとに処理を実行する
    //--------------------------------------------------------------
    clearInterval(self.timer);
    self.timer = setInterval(function () {
        self.getBadgeTodo()
        self.getBadgeChat()
        self.getBadgeSinsei()
        self.showFaxIconBadge()
    }, 3000);
}