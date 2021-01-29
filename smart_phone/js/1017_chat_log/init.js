"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/08/23  画像の回転
//******************************************************************************
// 初期化クラス
// 初期化処理はこのjsファイル内に記述してください。
//=========================================
function MainClass1017() {
    // 初期化クラスを継承する
    Init.call(this);
    this.groupNameData = null;
    this.img = "";
    this.reader = null
    this.group = "";
    this.cropper = null;
    this.canvas = '';
    // 会話ログ表示件数カウント
    // this.logCount = CHAT_LOG_COUNT;
    this.logList = null;
    this.lastID = "";
}
MainClass1017.prototype = {
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
        self.sel('.modal').modal({
            endingTop: 0,
            ready: function() {},
            complete: function() {}
        });
        //================================================
        // 引き継ぎ情報 パラメータ取得（グループID)
        //================================================
        self.group = sessionStorage.getItem('groupID');
        //================================================
        // 入力途中の会話取得＆表示
        //================================================
        const inputText = sessionStorage.getItem("textarea");
        sessionStorage.removeItem('textarea');
        if (inputText != null) {
            self.sel('#text').val(inputText);
        } else {
            self.sel('#text').val('');
        }
        // クラス変数の初期
        self.lastID = '';
        self.canvas = document.getElementById('mycanvas');
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
        //================================================
        // ここから処理を記述してください
        // グループから退席したメンバーの場合グループ、一覧画面に遷移する
        //================================================
        self.database.getFetch(
            'mappingGetMemberCount',
            [
                self.companyID,
                self.staff,
                self.group,
            ],
        ).then(response => response.json())
            .then(data => {
                console.log('Success:', data)
                if (data !== null && data[0].member == 0) {
                    // 画面遷移する場合は、アラートのままで画面遷移する前に止めます。
                    Materialize.toast('既にグループから退席しています。', 3000);
                    spaHash('#1016', 'reverse');
                    return false;
                }
            })
            .catch(() => {
                Materialize.toast('E101701 : グループの取得に失敗しました。', 3000);
            })
        //================================================
        // グループ名の取得
        //================================================
        self.database.getFetch(
            'mappingGetGroupName',
            [
                self.companyID,
                self.group,
            ],
        ).then(response => response.json())
            .then(data => {
                console.log('Success:', data)
                // グループ名の初期表示
                // バイト数にて不要部分を削除
                self.groupNameData = data;
                const groupName = byteSubstr(self.groupNameData[0].groupName, 24, "...");
                self.sel("#groupName").html(groupName);
            })
            .catch(() => {
                Materialize.toast('E101702 : グループ名の取得に失敗しました。', 3000);
            })
        //================================================
        // 会話ログ全件取得 & 描画
        //================================================
        self.initShowLog(self.lastID)
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
        /////////////////////////////////////////////////
        // ここから処理を記述してください
        //**********************************
        // 画像の編集処理
        //**********************************
        if (self.checkFileApi() && self.checkCanvas()) {
            // ファイル選択
            self.ev('change', '#photo', selectReadfile);
            function selectReadfile(e) {
                // モーダルを表示する
                const fileLength = e.target.files.length;
                if (fileLength != 0) {
                    self.sel('#modal1').modal('open');
                    const file = e.target.files;
                    self.reader = new FileReader();
                    // dataURL形式でファイルを読み込む
                    self.reader.readAsDataURL(file[0]);
                    // ファイルの読込が終了した時の処理
                    self.reader.onload = function() {
                        self.readDrawImg();
                    };
                }
                // changeイベント時に該当要素のvalueを削除する。
                // この処理がない場合、同じ名前のファイルの選択を感知できない。
                $(this).val('');
            }
        }
        self.sel('#modal1').modal('close');
        // 端末かモバイルか
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
    dateFormat: function(todoKK) {
        const self = this;
        // 親クラスの同メソッドを起動
        const date = Init.prototype.dateFormat.call(this, todoKK);
        if (date == false) {
            return false;
        }
        return date;
    },
    silentPush: function() {
        const self = this;
        // 親クラスの同メソッドを起動
        const date = Init.prototype.silentPush.call(this);
        if (date == false) {
            return false;
        }
        return date;
    }
};