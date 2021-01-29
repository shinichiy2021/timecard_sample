"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/08 yamazaki ２回目の読み込みがおかしいため、画像の保存時に画面のリロードをしました。
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/09/01  絵文字チェック追加
//******************************************************************************
const Target_minilength_px_min = 256
MainClass1017.prototype.event = function() {
    const self = this;
    const h = $(window).height();
    $(document.body).css("min-height", h + 'px');
    // 読込中の会話ページの通知履歴を既読にする
    self.upDataHistory()
    //----------------------------------------
    // イメージの拡大モーダル処理
    //----------------------------------------
    self.ev('click', '.chatImage', function() {
        self.photoKakudai($(this));
    });
    // 前画面ボタン押下処理（グループリストに戻る）
    function back() {
        spaHash('#1016', 'reverse');
        return false;
    }
    self.ev('click', '#back', back);
    // モーダルエリア送信ボタン押下処理
    self.ev('click', '#send', function() {
        const img = self.readImg(self.reader);
        img.onload = function () {
            // ファイル名を作る
            const talkTime = g_getTalkTime();
            let fileTime = "";
            fileTime = talkTime.replace(/:/g, '_');
            fileTime = fileTime.replace(/-/g, '_');
            fileTime = fileTime.replace(' ', '_');
            const fileName = self.staff + fileTime + self.companyID;
            // モーダルエリアを閉じる
            self.sel('#modal1').modal('close');
            self.uploadFile("timeCard/photo/chat_photo/", fileName);
            self.sentMessage(talkTime, "", fileName);
        };
    });
    // モーダルエリアキャンセルボタン押下処理
    self.ev('click', '#cancel', function() {
        //モーダルエリアを閉じる
        self.sel('#modal1').modal('close');
    });
    // モーダルエリア「×」ボタン押下処理
    self.ev('click', '#closeTop', function() {
        //モーダルエリアを閉じる
        self.sel('#modal1').modal('close');
    });
    // 画像回転処理
    self.ev('click', '#rotate', function() {
        const src = self.sel('.cropper-canvas').children('img');
        self.rotateFunction(src);
    });
    //*************************************
    // 通知履歴を既読に更新 & サイレント通知で、バッチカウントを更新
    // チャットログ内の画像押下処理
    // 発信ボタンの処理
    //*************************************
    self.ev('click', '#entry', function () {
        const text = self.sel("#text").val();
        // テキストの空白チェック
        if (text.trim() == "") {
            Materialize.toast('発言が入力されていません', 3000);
            return false;
        } else {
            // 文字数チェック
            if (text.length > 120) {
                Materialize.toast('120文字以内で入力してください', 3000);
                return false;
            }
            // 本文に絵文字が含まれている場合。
            if (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)) {
                Materialize.toast('使用できない絵文字が含まれています。', 3000);
                return false;
            }
        }
        // 現在時刻の取得
        const talkTime = g_getTalkTime();
        if (false === self.sentMessage(talkTime, text, "")) {
            return false;
        }
        self.sel("#text").val("");
        // リストのデータ取得
        self.chatLogAppend(text);
        self.sel('form.chat').scrollTop(100000000)
        sessionStorage.removeItem('textarea');
        return true;
    });
    //*********************************************************
    // テキストエリアをリサイズする為の処理
    //*********************************************************
    const initHeight = self.sel("#text").innerHeight();
    if (navigator.userAgent.indexOf('Android') > 0) {
        self.sel('.footer').css('height', self.sel("#text").innerHeight() + initHeight * 0.35);
    }
    // 入力エリアがタップされた時
    self.ev('click', '#text', function() {
        self.sel("#entry").css("display", "block");
        $(this).css("width", "69%");
    });
    self.ev('keydown', '#text', function() {
        if (navigator.userAgent.indexOf('Android') > 0) {
            self.sel('.footer').css('height', $(this).innerHeight() + initHeight * 0.35);
        } else {
            self.sel('.footer').css('height', $(this).innerHeight() + initHeight * 1.0);
        }
    });
    // 入力エリアが外れた時
    self.ev('blur', '#text', function () {
        if (navigator.userAgent.indexOf('Android') > 0) {
        } else {
            sessionStorage.setItem('textarea', $('#text').val());
        }
    });
};