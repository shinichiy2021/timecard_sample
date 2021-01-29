"use strict";
//****************************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/04/27  ポップアップ処理を分離しました。
//****************************************************************
// 写真がタップされたときの拡大処理
//---------------------------------------
MainClass1024.prototype.photoKakudai = function(domSelf) {
    const self = this;
    const img01 = new Image();
    img01.src = domSelf.attr('src');
    img01.onload = function() {
        const faxDateTime = domSelf.next('.hideDateTime').val();
        document.body.style.cursor = 'wait';
        const ctx = self.canvas.getContext('2d');
        const w = img01.width;
        const h = img01.height;
        const resize = self.resizeWidthHeight(1024, w, h);
        let scale = 1;
        if (/*fileType == "tif" &&*/ resize.w > resize.h) {
            // A4の横の時は縦横の倍率を反転させる
            scale = Math.sqrt(2);
        }
        self.canvas.width = resize.w / scale;
        self.canvas.height = resize.h * scale;
        ctx.scale(1 / scale, scale);
        ctx.drawImage(img01, 0, 0, resize.w, resize.h);
        ctx.scale(scale, 1 / scale);
        if (self.cropper != null) {
            self.cropper.destroy();
        }
        self.cropper = new Cropper(self.canvas, {
            ready: function() {
                this.cropper.clear();
            },
            dragMode: 'move',
            autoCrop: false,
            minCanvasWidth: self.canvas.width / 2,
            cropend: function(e) {}
        });
        self.sel('#modal1').modal('open');
        self.sel(".preloader-wrapper").hide();
        self.sel("#modalDate").text(faxDateTime);
    };
};
//---------------------------------------
// tifがタップされたときの拡大処理
//---------------------------------------
MainClass1024.prototype.tifPopUp = function(domSelf) {
    const self = this;
    const i = domSelf.attr("id").replace("tiff_canvas", "");
    const thisCanvas = self.arrayCanvas[i];
    const faxDateTime = domSelf.next('.hideDateTime').val();
    const img_jpeg_src = thisCanvas.toDataURL("image/jpeg");
    const img01 = new Image();
    img01.src = img_jpeg_src;
    img01.onload = function() {
        document.body.style.cursor = 'wait';
        const ctx = self.canvas.getContext('2d');
        const w = img01.width;
        const h = img01.height;
        const resize = self.resizeWidthHeight(1024, w, h);
        let scale = 1;
        if (resize.w > resize.h) {
            // A4の横の時は縦横の倍率を反転させる
            scale = Math.sqrt(2);
        }
        self.canvas.width = resize.w / scale;
        self.canvas.height = resize.h * scale;
        ctx.scale(1 / scale, scale);
        ctx.drawImage(img01, 0, 0, resize.w, resize.h);
        ctx.scale(scale, 1 / scale);
        if (self.cropper != null) {
            self.cropper.destroy();
        }
        self.cropper = new Cropper(self.canvas, {
            ready: function() {
                this.cropper.clear();
            },
            dragMode: 'move',
            autoCrop: false,
            minCanvasWidth: self.canvas.width / 2,
            cropend: function(e) {}
        });
        self.sel('#modal1').modal('open');
        self.sel(".preloader-wrapper").hide();
        self.sel("#modalDate").text(faxDateTime);
    };
};
//---------------------------------------
// 画像回転ボタン押下時
// 引数 : イメージタグ
//---------------------------------------
MainClass1024.prototype.rotateFunction = function(src) {
    const self = this;
    const img01 = new Image();
    img01.src = src.attr('src');
    img01.onload = function() {
        document.body.style.cursor = 'wait';
        const ctx = self.canvas.getContext('2d');
        const w = img01.width;
        const h = img01.height;
        const resize = self.resizeWidthHeight(1024, w, h);
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
            minCanvasWidth: self.canvas.width / 2,
            crop: function(e) {}
        });
    };
};
//---------------------------------------
// リサイズ後のwidth, heightを求める
//---------------------------------------
MainClass1024.prototype.resizeWidthHeight = function(target_length_px, w0, h0) {
    const self = this;
    // リサイズの必要がなければ元の width, heightを返す
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