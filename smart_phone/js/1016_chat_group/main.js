"use strict";
//******************************************************************************
MainClass1016.prototype.event = function() {
    const self = this;
    // 追加・編集ボタン押下処理
    self.ev('click', '#new', function() {
        sessionStorage.setItem('groupID', "new");
        sessionStorage.setItem('arrayStaffID', self.staff);
        spaHash('#1018', 'normal');
        return false;
    });
    // チャット画面遷移処理
    self.ev('click', '.chat', function() {
        const num = $(this).attr("id").slice(3);
        // idの動的数値取得
        const group = "#groupID" + num;
        const groupVal = self.sel(group).val();
        sessionStorage.setItem('groupID', groupVal);
        // グループIDをパラメータにセット
        spaHash('#1017', 'normal');
        return false;
    });
    // グループリスト編集画面へ遷移処理
    self.ev('click', '.a', function() {
        const num = $(this).attr("id").slice(4);
        // idの動的数値取得
        const group = "#groupID" + num;
        const groupVal = self.sel(group).val();
        sessionStorage.setItem('groupID', groupVal);
        // グループIDをパラメータにセット
        spaHash('#1018', 'normal');
        return false;
    });
    // 戻るボタンが押された時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
};