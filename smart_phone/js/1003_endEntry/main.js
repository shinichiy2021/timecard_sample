//******************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************
$(document).ready(function() {
    var self = new MainClass();
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
});