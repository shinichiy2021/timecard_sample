"use strict";
//***************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2019/07/22    夜勤打刻対応
//***************************************************
MainClass.prototype.gpsEntry = async function() {
    const self = this;
    const accountName =  localStorage.getItem('accountName');
    const userName =  localStorage.getItem('userName');
    $.ajax({
        url: "../../common/php/4003_read_GPS.php",
        type: "POST",
        dataType: 'json',
        async: true,
        cache: false,
        data: {
            "staffID": self.staff,              // staffID
            "companyID": self.companyID,        // companyID
            "position": self.gpsPosition,       // 緯度・経度
            "positionAdd": self.gpsPositionAdd, // 住所
            "yakinFlag": self.yakinFlag,        // 夜勤フラグ
            "accountName": accountName, // DBの接続情報
            "userName": userName        // DBの接続情報
        },
        success: function(data) {
            const returnData = data;
            // 勤怠フラグ 0：退勤1：出勤2：外出3：戻り 以外：その他
            // 正常に打刻できた時。
            if (returnData.errorCode == "0") {
                const registerID = [];
                const nameData = [];
                const IDmData = returnData.IDmData;
                for (let i in IDmData) {
                    registerID.push(IDmData[i].registerID);
                    nameData.push(IDmData[i].name);
                }
                const dakoku = to60(returnData.dakokuTime);
                const dakokuTime = dakoku.hours + '時' + addZero(dakoku.minutes) + '分';
                const msg = dakokuTime + "に出退勤を受け付けました。";
                const mode = "0";
                const groupID = "";
                // 受け取った端末データを基に通知共通処理を実行する
                commonPushFunc(
                    '',
                    registerID,
                    self.companyID,
                    self.staff,
                    msg,
                    "mode=" + mode,
                    groupID,
                    nameData,
                    false
                );
                // メニュー画面に遷移する
                location.href = "1001_login.html#1004";
                return false;
            } else {
                // エラーコード2～7
                $(".modal-overlay").css("display", "block");
                $(".modal-overlay").css("opacity", "0.5");
                $("#dialog").css('display', 'block');
                $("#msg").text(returnData.message);
                $("#daialogOk").click(function() {
                    // ・メニュー画面に遷移する
                    location.href = "1001_login.html#1004";
                    return false;
                });
            }
        },
        error: function() {
            // 失敗時に実行する処理
            self.exception.check(
                false,
                ExceptionServerOn,
                ExceptionSystemOff,
                "102501",
                "GPS打刻ができませんでした。",
                ExceptionParamToMenu
            );
        }
    });
};
//==========================================================
// スマホ側で位置情報から住所が変換出来なかった時（空白でパラメータ渡った時）
// 位置情報から住所情報を逆ジオデコードする
// 2018/06/26 
//==========================================================
MainClass.prototype.getAddress = async function () {
    const self = this
    const latlng = new google.maps.LatLng(self.latitude, self.longitude);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng, 'language': 'ja' },
        function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                const contentString = results[0].formatted_address;
                const address = contentString.slice(13).split(' ')[0];
                $(".all").hide();
                $("#addressArea").show();
                $("#gpsAdd").text(address);
            } else {
                Materialize.toast(status + " : ジオコードに失敗しました", 3000);
            }
        });
}
//==========================================================
// 現在地の座標を取得(非同期処理)
//==========================================================
MainClass.prototype.getPositon = async function () {
    // 現在位置を取得する
    navigator.geolocation.getCurrentPosition(
        // 成功時
        position => {
            sessionStorage.setItem('gpsFlag', true)
            sessionStorage.setItem('latitude', position.coords.latitude)
            sessionStorage.setItem('longitude', position.coords.longitude)
            location.reload()
        },
        // 失敗時
        e => {
            alert('位置情報を取得できませんでした。位置情報サービスを許可してください。')
            // メニュー画面に遷移する
            location.href = "1001_login.html#1004";
            return false;
        }
    );
}