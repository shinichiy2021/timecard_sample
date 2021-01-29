"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/04/27  ポップアップ処理を分離しました。
// 2018/05/23  回転ボタン押下時の縦横の書き出しメソッドを追加しました。
//******************************************************************************
const Target_length_px = 1024
//---------------------------------------
// 写真がタップされたときの拡大処理
//---------------------------------------
MainClass1017.prototype.photoKakudai = function(domSelf) {
    const self = this;
    const img01 = new Image();
    img01.src = domSelf.attr('src').replace('_min.', '.');
    img01.onload = function() {
        document.body.style.cursor = 'wait';
        const ctx = self.canvas.getContext('2d');
        const w = img01.width;
        const h = img01.height;
        const resize = self.resizeWidthHeight(Target_length_px, w, h);
        self.canvas.width = resize.w;
        self.canvas.height = resize.h;
        ctx.drawImage(img01, 0, 0, resize.w, resize.h);
        if (self.cropper != null) {
            self.cropper.destroy();
        }
        self.cropper = new Cropper(self.canvas, {
            ready: function() {
                this.cropper.clear();
            },
            dragMode: 'move',
            autoCrop: false,
            crop: function(e) {}
        });
        self.sel('#modal1').modal('open');
        self.sel(".preloader-wrapper").hide();
        self.sel('#send').hide();
        self.sel("#rotate").show();
    };
};
//---------------------------------------
// ファイルの読込が終了した時の処理
//---------------------------------------
MainClass1017.prototype.readImg = function() {
    const self = this;
    //ファイル読み取り後の処理
    const result_dataURL = self.reader.result;
    const img = new Image();
    img.src = result_dataURL;
    return img;
}
//---------------------------------------
// リサイズ後のwidth, heightを求める
//---------------------------------------
MainClass1017.prototype.resizeWidthHeight = function(target_length_px, w0, h0) {
    const self = this;
    // リサイズの必要がなければ元のwidth, heightを返す
    const length = Math.max(w0, h0);
    if (length <= target_length_px) {
        return {
            flag: false,
            w: w0,
            h: h0
        };
    }
    // リサイズの計算
    let w1;
    let h1;
    if (w0 >= h0) {
        w1 = target_length_px;
        h1 = h0 * target_length_px / w0;
    } else {
        w1 = w0 * target_length_px / h0;
        h1 = target_length_px;
    }
    return {
        flag: true,
        w: parseInt(w1, 10),
        h: parseInt(h1, 10)
    };
};
//---------------------------------------
//---------------------------------------
MainClass1017.prototype.readDrawImg = function() {
    const self = this;
    const img = self.readImg(self.reader);
    img.onload = function() {
        const w = img.width;
        const h = img.height;
        const resize = self.resizeWidthHeight(Target_length_px, w, h);
        self.drawImgOnCav(img, resize.w, resize.h);
    };
};
//---------------------------------------
// キャンバスにImageを表示する
//---------------------------------------
MainClass1017.prototype.drawImgOnCav = function(img, w, h) {
    const self = this;
    // 2017/08/23  画像の回転
    document.body.style.cursor = 'wait';
    const ctx = self.canvas.getContext('2d');
    self.canvas.width = w;
    self.canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    // 2017/08/12 yamazaki 画像再読みの際にcropper.jsの初期化を追加しました
    if (self.cropper != null) {
        self.cropper.destroy();
    }
    self.cropper = new Cropper(self.canvas, {
        ready: function() {
            this.cropper.clear();
        },
        dragMode: 'none',
        autoCrop: false,
        crop: function(e) {}
    });
    self.sel(".preloader-wrapper").hide();
    self.sel('#cancel').html('キャンセル');
    self.sel('#send').show();
    self.sel('#send').html('送信');
    self.sel("#rotate").hide();
};
//---------------------------------------
//---------------------------------------
MainClass1017.prototype.checkCanvas = function() {
    const self = this;
    // canvas に対応しているか
    if (self.canvas && self.canvas.getContext) {
        return true;
    }
    Materialize.toast('Not Supported Canvas.', 3000);
    return false;
};
//---------------------------------------
//---------------------------------------
MainClass1017.prototype.checkFileApi = function() {
    const self = this;
    // FileAPIに対応しているか
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
    }
    Materialize.toast('The File APIs are not fully  in this browser.', 3000);
    return false;
};
//---------------------------------------
// 画像をアップロードする
// 引数 : ファイル名
//---------------------------------------
MainClass1017.prototype.uploadFile = async function(filePass, fileName) {
    const self = this;
    const base64 = self.cropper.getCroppedCanvas().toDataURL("image/jpeg");
    // ここから画像の送信処理です（ログでは無く、サーバー上のフォルダに画像を送信する処理）
    $.ajax({
        url: "../php/upload.php",
        type: "POST",
        data: {
            "image": base64,
            "filePass": filePass,
            "fileName": fileName
        },
        cache: false,
        dataType: "html",
        async: true
    }).done(function() {
        self.chatImageAppend(fileName);
        let $img = $('.responsive-img');
        $img.originSrc = $img.src;
        $img.src = ""; // これで一旦クリアできます！
        // コールバックを設定
        $img.bind('load', function () {
            self.sel('form.chat').scrollTop(100000000)
        });
        return true;
    }).fail(function() {
        Materialize.toast('E100103 : ファイルのアップロードに失敗しました。', 3000);
    });
}
//---------------------------------------
// 画像回転ボタン押下時
// 引数 : イメージタグ
//---------------------------------------
MainClass1017.prototype.rotateFunction = function(src) {
    const self = this;
    const img01 = new Image();
    img01.src = src.attr('src');
    img01.onload = function() {
        document.body.style.cursor = 'wait';
        const ctx = self.canvas.getContext('2d');
        const w = img01.width;
        const h = img01.height;
        const resize = self.resizeWidthHeight(Target_length_px, w, h);
        self.canvas.width = resize.w;
        self.canvas.height = resize.h;
        self.canvas.setAttribute('width', resize.h);
        self.canvas.setAttribute('height', resize.w);
        ctx.rotate(Math.PI * 0.5);
        ctx.drawImage(img01, 0, 0, w, -h);
        ctx.rotate(-Math.PI * 0.5);
        if (self.cropper != null) {
            self.cropper.destroy();
        }
        self.cropper = new Cropper(self.canvas, {
            ready: function() {
                this.cropper.clear();
            },
            dragMode: 'move',
            autoCrop: false,
            crop: function(e) {}
        });
    };
};