"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
MainClass1010.prototype.event = function() {
    const self = this;
    // 戻るボタンが押された時
    function back() {
        spaHash('#1009', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
    // 自分で提出した届出の取り下げ
    self.ev('click', '#torisageButton', function() {
        self.kousinButton(self.paraSinseiNo, '3');
    });
    // 確認者又は全権限者による承認
    self.ev('click', '#kakuninButton', function() {
        self.kousinButton(self.paraSinseiNo, '1');
    });
    // 確認者又は全権限者による不承認
    self.ev('click', '#rejectButton' , function() {
        self.kousinButton(self.paraSinseiNo, '2');
    });
    // 確認者又は全権限者による確認待ちに戻す処理
    self.ev('click', '#waitButton' , function() {
        self.kousinButton(self.paraSinseiNo, '0');
    });
    // // 全権限者の時は全てを表示する
    // self.ev('click', '#deleteButton', function() {
    //     self.systemDelete(
    //         self.paraSinseiNo
    //     );
    // });
};