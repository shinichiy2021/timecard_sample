//=========================================
// 例外処理のクラス
//=========================================
const ExceptionServerError = false;
const ExceptionServerOn = true;
const ExceptionServerOff = false;
const ExceptionSystemError = null;
const ExceptionSystemOn = true;
const ExceptionSystemOff = false;
const ExceptionParamSaiInstall = 0;
const ExceptionParamToMenu = 1;
const ExceptionParamToLogin = 2;
const ExceptionParamMailTriger = 3;
// 例外出力画面の文言定義
const SystemError = '❌️障害<br>・エラーコード:';
const WarningError = '⚠️警告<br>・エラーコード:';
// クラスの定義
class Exception {
    constructor() {}
    //=========================================
    // 例外処理の共通処理（管理PC）
    // 戻り値
    // true  ：例外が発生しなかったとき
    // false ：例外が発生したとき＆処理を【終了】するとき
    // null  ：例外が発生したとき＆処理を【継続】するとき
    //=========================================
    checkPC(
        exceptionData,
        errorCode,
        exceptionMessage,
        falseFunc = ExceptionServerOn, // 障害の時（true：エラー出力、false:何もしない）
        nullFunc = ExceptionSystemOff // 警告の時（true：エラー出力、false:何もしない）
    ) {
        switch (exceptionData) {
            case 'false':
                exceptionData = false;
            case false:
                window.onbeforeunload = null;
                location.href = "2000_network_error.html?" +
                    "errorMessage=" + SystemError + errorCode + "<br>・" + exceptionMessage;
                return false;
            case 'null':
                exceptionData = null;
            case null:
                if (nullFunc === true) {
                    window.onbeforeunload = null;
                    location.href = "2000_network_error.html?" +
                        "errorMessage=" + WarningError + errorCode + "<br>・" + exceptionMessage;
                    return false;
                }
                return null;
            default:
                return true;
        }
    }
    //=========================================
    // 例外処理の共通処理（スマホ）
    // 戻り値
    // true  ：例外が発生しなかったとき
    // false ：例外が発生したとき＆処理を【終了】するとき
    // null  ：例外が発生したとき＆処理を【継続】するとき
    //=========================================
    check(
        exceptionData,
        falseFunc, // 障害の時（true：エラー出力、false:何もしない）
        nullFunc, // 警告の時（true：エラー出力、false:何もしない）
        errorCode,
        exceptionMessage,
        exceptionFlag,
        registerID = self.registerID, // 引数省略時はクラス変数を使用する
        udid = self.udid // 引数省略時はクラス変数を使用する
    ) {
        // if (registerID === undefined) {
        //     registerID = self.registerID;
        //     udid = self.udid;
        // }
        switch (exceptionData) {
            case 'false':
                exceptionData = false;
            case false:
                if (falseFunc === true) {
                    location.href = "exception.html?" +
                        "param=" + exceptionFlag +
                        "&errorMessage=" + SystemError + errorCode + "<br><br>" + exceptionMessage +
                        "&registerID=" + registerID +
                        "&udid=" + udid;
                } else if (falseFunc === false) {
                    // 何も処理しない
                    return null;
                } else {
                    falseFunc();
                }
                return false;
            case 'null':
                exceptionData = null;
            case null:
                if (nullFunc === true) {
                    location.href = "exception.html?" +
                        "param=" + exceptionFlag +
                        "&errorMessage=" + WarningError + errorCode + "<br><br>" + exceptionMessage +
                        "&registerID=" + registerID +
                        "&udid=" + udid;
                } else if (nullFunc === false) {
                    // 何も処理しない
                    return null;
                } else {
                    nullFunc();
                }
                return false;
            default:
                return true;
        }
    }
}