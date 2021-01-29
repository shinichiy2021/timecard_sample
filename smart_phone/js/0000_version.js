$(document).ready(function() {
    // ユーザーエージェントの取得
    var tanmatu = "";
    if (navigator.userAgent.indexOf('Android') > 0) {
        tanmatu = 'Android';
        $('#app').hide();
    } else {
        $('#google').hide();
    }
});