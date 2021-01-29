"use strict";
//**********************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/04/27  ポップアップ処理を分離しました。
//**********************************************************
// 画像の編集処理 2017/08/04 村田追記
//**********************************
MainClass1022.prototype.modalPopUp = function() {
    const self = this;
    const canvas = document.getElementById('mycanvas');
    if (checkFileApi() && checkCanvas(canvas)) {
        //ファイル選択
        self.ev('change', '#photo', selectReadfile);
    }
    // canvas に対応しているか
    function checkCanvas(canvas) {
        if (canvas && canvas.getContext) {
            return true;
        }
        Materialize.toast('Not Supported Canvas.', 3000);
        return false;
    }
    // FileAPIに対応しているか
    function checkFileApi() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            return true;
        }
        Materialize.toast('The File APIs are not fully  in this browser.', 3000);
        return false;
    }
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
            self.sel(".preloader-wrapper").show();
            self.sel("#modalTitle").text('会話用アイコンの選択');
            // 表示
            self.sel("#loadText").show();
            // 非表示
            self.sel("#passWord").hide();
            self.sel("#newPass").hide();
            self.sel("#kakunin").hide();
            self.sel("#newAddress").hide();
            self.sel("#newAddresskakunin").hide();
            self.sel(".appidforget").hide();
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
        // モーダルを表示する
        self.sel(".preloader-wrapper").show();
    }

    function readDrawImg(reader, canvas, x, y) {
        const img = readImg(reader);
        img.onload = function() {
            const w = img.width;
            const h = img.height;
            printWidthHeight('src-width-height', true);
            const resize = resizeWidthHeight(1024, w, h);
            printWidthHeight('dst-width-height', resize.flag);
            drawImgOnCav(canvas, img, x, y, resize.w, resize.h);
        };
    }
    // ファイルの読込が終了した時の処理
    function readImg(reader) {
        // ファイル読み取り後の処理
        const result_dataURL = reader.result;
        const img = new Image();
        img.src = result_dataURL;
        return img;
    }
    // キャンバスにImageを表示
    function drawImgOnCav(canvas, img, x, y, w, h) {
        // 2017/08/23  画像の回転
        document.body.style.cursor = 'wait';
        const ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const image = document.getElementById('mycanvas');
        // 2017/08/16 yamazaki 画像再読みの際にcropper.jsの初期化を追加しました
        if (self.cropper != null) {
            self.cropper.destroy();
        }
        // 2017/08/16 yamazaki 画像再読みの際にcropper.jsの初期化を追加しました
        self.cropper = new Cropper(image, {
            aspectRatio: 5 / 5,
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
    // リサイズ後の width, heightを求める
    function resizeWidthHeight(target_length_px, w0, h0) {
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
    }
    function printWidthHeight(width_height_id, flag) {
        if (!flag) {
            return;
        }
    }
};
//---------------------------------------
// モーダルのイベント処理
// 引数
// 戻り値
//---------------------------------------
MainClass1022.prototype.modalEvent = function() {
    const self = this;
    // 2017/09/08  ユーザーエージェントの取得
    let tanmatu = "";
    if (navigator.userAgent.indexOf('Android') > 0) {
        tanmatu = 'Android';
    }
    //------------------------------------------
    // モーダルエリアの入力領域以外を隠す処理
    // 2017/09/08 
    //------------------------------------------
    function hideInput() {
        if (tanmatu == 'Android') {
            self.sel('.info-content').hide();
            self.sel('#modal1').css({
                'max-height': '100vh',
                'height': '100vh',
                'top': '0'
            });
        }
    }
    self.ev('focus', '#newAddress', hideInput);
    self.ev('focus', '#newAddresskakunin', hideInput);
    self.ev('focus', '#newPass', hideInput);
    self.ev('focus', '#kakunin', hideInput);
    self.ev('focus', '#passWord', hideInput);
    // ***************************
    // 入力項目変更処理
    // ***************************
    function changeInput() {
        // テキストボックス枠を通常（黒）にする
        $(this).css('border', '');
    }
    self.ev('keypress', '#newAddress', changeInput);
    self.ev('keypress', '#newAddresskakunin', changeInput);
    self.ev('keypress', '#passWord', changeInput);
    self.ev('keypress', '#newPass', changeInput);
    self.ev('keypress', '#kakunin', changeInput);
    self.ev('keydown', '#newAddress', changeInput);
    self.ev('keydown', '#newAddresskakunin', changeInput);
    self.ev('keydown', '#passWord', changeInput);
    self.ev('keydown', '#newPass', changeInput);
    self.ev('keydown', '#kakunin', changeInput);
    //------------------------------------------
    // 登録情報を忘れたとき押下時
    // 2017/08/22 
    //------------------------------------------
    self.ev('click', '#lostLink', function() {
        // ログイン情報忘れ確認画面を表示する。
        self.sel('#modal1').modal('close');
        spaHash('#1002', 'normal');
        return false;
    });
    //------------------------------------------
    // モーダルとじるボタン押下時
    // 2017/08/21  エラー初期化
    //------------------------------------------
    self.ev('click', '#close', function() {
        self.sel("#passWord").css('border', '');
        self.sel("#newPass").css('border', '');
        self.sel("#kakunin").css('border', '');
        self.sel("#newAddress").css('border', '');
        self.sel("#newAddresskakunin").css('border', '');
        self.sel('.info-content').show();
        self.sel('#modal1').css({
            'max-height': '80vh',
            'height': '80vh',
            'top': '10'
        });
    });
};