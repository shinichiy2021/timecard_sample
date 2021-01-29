"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************
MainClass1024.prototype.event = function() {
    const self = this;
    // ブックマーク切り替え
    self.ev('click', '.bmButton', function() {
        if (false === self.exception.check(
                self.bookMarkEvent($(this)),
                ExceptionServerOn,
                ExceptionSystemOn,
                "102401",
                "ブックマーク切り替えができませんでした。",
                ExceptionParamToMenu
            )) {
            return false;
        }
    });
    // FAX画像押下時
    self.ev('click', '.faxImage', function() {
        // 既読処理
        self.faxReadEvent($(this));
        // ポップアップで画像拡大
        self.photoKakudai($(this));
    });
    // tif画像押下時
    self.ev('click', '.tiff_canvas', function() {
        // 既読処理
        self.faxReadEvent($(this));
        // ポップアップで画像拡大
        self.tifPopUp($(this));
    });
    // 画像回転処理
    self.ev('click', '#rotate', function() {
        self.rotateFunction(self.sel('.cropper-canvas').children('img'));
    });
    // 戻るボタンが押された時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
};