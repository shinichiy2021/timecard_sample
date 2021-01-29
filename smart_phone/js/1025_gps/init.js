"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2019/07/22    夜勤打刻対応
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass() {
    // 初期化クラスを継承する
    Init.call(this);
    this.gpsFlag = null;
    this.latitude = ''
    this.longitude = ''
    this.gpsPositionAdd = null;
    this.strYakinMode = "夜勤打刻モードです。";
    //夜勤フラグ　0＝日勤モード　1＝夜勤モード
    this.yakinFlag = 0;
}
MainClass.prototype = {
    //=========================================
    // 前処理
    // ログインのチェック、引き継ぎ情報の取得処理を記述してください。
    //=========================================
    maeShori: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.maeShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        // ネイティブ側からのパラメータを引き継ぐ
        const gpsFlag = sessionStorage.getItem('gpsFlag')
        self.latitude = sessionStorage.getItem('latitude')
        self.longitude = sessionStorage.getItem('longitude')
        const gpsPositionAdd = ''
        switch (gpsFlag) {
            case undefined:
                self.gpsFlag = false;
                break;
            case 'undefined':
                self.gpsFlag = false;
                break;
            case null:
                self.gpsFlag = false;
                break;
            case 'null':
                self.gpsFlag = false;
                break;
            case '':
                self.gpsFlag = false;
                break;
            case 'false':
                self.gpsFlag = false;
                break;
            default:
                self.gpsFlag = gpsFlag;
                break;
        }
        if (self.gpsFlag == false) {
            self.getPositon()
            return true;
            // 以下の処理はしない
        } else {
            switch (gpsPositionAdd) {
                case undefined:
                    self.gpsPositionAdd = '';
                    break;
                case 'undefined':
                    self.gpsPositionAdd = '';
                    break;
                case null:
                    self.gpsPositionAdd = '';
                    break;
                case 'null':
                    self.gpsPositionAdd = '';
                    break;
                default:
                    self.gpsPositionAdd = gpsPositionAdd;
                    break;
            }
        }
        return true;
    },
    //=========================================
    // チェック＆取得
    // データベースのチェック＆取得処理を記述してください。
    //=========================================
    checkGetData: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.checkGetData.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    },
    //=========================================
    // 初期表示
    // 画面への表示処理を記述してくだい。
    //=========================================
    initShow: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.initShow.call(this) == false) {
            return false;
        }
        if (Init.prototype.header.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        if (navigator.userAgent.indexOf('Android') > 0) {
            $('body').css('margin', '12vw 0 0 0');
        }
        $("#addressArea").hide();
        if ('' === self.latitude || '' === self.longitude) {
            // ◇位置情報が取得できなかったとき
            // self.addressError();
            return false;
        } else {
            // ◇位置情報が取得できた時、地図と住所を表示する
            const address = self.gpsPositionAdd;
            const latlng = new google.maps.LatLng(self.latitude, self.longitude);
            /* 地図のオプション設定 */
            const myOptions = {
                /*初期のズーム レベル */
                zoom: 19,
                /* 地図の中心地点 */
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP, //普通の道路マップ
                disableDefaultUI: true, //全てのデフォルトUIを無効
                streetViewControl: false, //ストリートビュー使わない
                zoomControl: false, //ズームコントロール使わない
                rotateControl: false, //回転使わない
                scrollwheel: false, //マウスホイールでの拡大縮小を使わない
                disableDoubleClickZoom: true, //ダブルクリックでズームとセンターを無効
                draggable: false, //地図上でのドラックを無効
                panControl: false //移動コントロールを無効
            };
            /* 地図オブジェクト生成 */
            const map = new google.maps.Map(document.getElementById('google_map'), myOptions);
            new google.maps.Marker({
                //住所のポイントにマーカーを立てる
                position: map.getCenter(),
                map: map
            });
            if (address == "") {
                self.getAddress();
            } else {
                $(".all").hide();
                $("#addressArea").show();
                $("#gpsAdd").text(address);
            }
            // 夜勤モード切替ボタンの表示をOFFにする　2019/07/22 
            $("#yakinOn").hide();
            $("#yakinMsg").text("");
        }
        return true;
    },
    //=========================================
    // 後処理
    // 引き渡し情報の取得処理を記述してください。
    //=========================================
    atoShori: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.atoShori.call(this) == false) {
            return false;
        }
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        return true;
    },
    //=========================================
    // 利用可能期間のチェック
    //=========================================
    asyncAvailable: function () {
        const self = this;
        // 親クラスの同メソッドを起動
        if (Init.prototype.asyncAvailable.call(this) == false) {
            return false;
        }
    },
};