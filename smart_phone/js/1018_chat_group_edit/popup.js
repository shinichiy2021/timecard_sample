"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/04/27  ポップアップ処理を分離しました。
// 画像の編集処理 2017/08/04 村田追記
//******************************************************************************
MainClass1018.prototype.modalPopUp = function() {
    const self = this;
    const canvas = document.getElementById('mycanvas');
    if (checkFileApi() && checkCanvas(canvas)) {
        // ファイル選択
        self.ev('change', '#photo', selectReadfile);
    }
    // canvas に対応しているか
    function checkCanvas(canvas) {
        if (canvas && canvas.getContext) {
            return true;
        }
        alert('Not Supported Canvas.');
        return false;
    }
    // FileAPIに対応しているか
    function checkFileApi() {
        // Check for the constious File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
            return true;
        }
        alert('The File APIs are not fully  in this browser.');
        return false;
    }
    self.sel('#modal1').modal('close');
    // 端末がモバイルか
    const _ua = (function(u) {
        const mobile = {
            0: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1) || u.indexOf("iphone") != -1 || u.indexOf("ipod") != -1 || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1) || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1) || u.indexOf("blackberry") != -1,
            iPhone: (u.indexOf("iphone") != -1),
            Android: (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
        };
        const tablet = (u.indexOf("windows") != -1 && u.indexOf("touch") != -1) || u.indexOf("ipad") != -1 || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1) || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1) || u.indexOf("kindle") != -1 || u.indexOf("silk") != -1 || u.indexOf("playbook") != -1;
        const pc = !mobile[0] && !tablet;
        return {
            Mobile: mobile,
            Tablet: tablet,
            PC: pc
        };
    })(window.navigator.userAgent.toLowerCase());
    // ファイルが選択されたら読み込む
    function selectReadfile(e) {
        // モーダルを表示する
        const fileLength = e.target.files.length;
        if (fileLength != 0) {
            self.sel('#modal1').modal('open');
            const file = e.target.files;
            const reader = new FileReader();
            // dataURL形式でファイルを読み込む
            reader.readAsDataURL(file[0]);
            // ファイルの読込が終了した時の処理
            reader.onload = function() {
                readDrawImg(reader, canvas, 0, 0);
            };
        }
        // changeイベント時に該当要素のvalueを削除する。
        // この処理がない場合、同じ名前のファイルの選択を感知できない。
        $(this).val('');
    }
    function readDrawImg(reader, canvas, x, y) {
        const img = readImg(reader);
        img.onload = function() {
            const w = img.width;
            const h = img.height;
            // モバイルであればリサイズ
            const resize = resizeWidthHeight(1024, w, h);
            drawImgOnCav(canvas, img, x, y, resize.w, resize.h);
        };
    }
    // ファイルの読込が終了した時の処理
    function readImg(reader) {
        //ファイル読み取り後の処理
        const result_dataURL = reader.result;
        const img = new Image();
        img.src = result_dataURL;
        return img;
    }
    // キャンバスにImageを表示
    function drawImgOnCav(canvas, img, x, y, w, h) {
        //2017/08/23  画像の回転
        document.body.style.cursor = 'wait';
        const ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const image = document.getElementById('mycanvas');
        // 2017/08/12 yamazaki 画像再読みの際にcropper.jsの初期化を追加しました
        if (self.cropper != null) {
            self.cropper.destroy();
        }
        self.cropper = new Cropper(image, {
            aspectRatio: 5 / 5,
            viewMode: 1,
            autoCropArea: 1.0,
            crop: function(e) {
                console.log(e.detail.x);
                console.log(e.detail.y);
                console.log(e.detail.width);
                console.log(e.detail.height);
                console.log(e.detail.rotate);
                console.log(e.detail.scaleX);
                console.log(e.detail.scaleY);
            }
        });
        self.sel(".preloader-wrapper").hide();
    }
    // リサイズ後のwidth, heightを求める
    function resizeWidthHeight(target_length_px, w0, h0) {
        //リサイズの必要がなければ元のwidth, heightを返す
        const length = Math.max(w0, h0);
        if (length <= target_length_px) {
            return {
                flag: false,
                w: w0,
                h: h0
            };
        }
        //リサイズの計算
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
    }
};