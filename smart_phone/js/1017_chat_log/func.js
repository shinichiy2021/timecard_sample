"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/21  アラートをフレームワーク統一に変更
// 2017/08/23 yamazaki アイコン画像が変更された時の処理 ⇒mainに移動しました。2017/08/24 
// 2018/04/27  ポップアップ処理を分離しました。
// 2018/07/12  会話ログ書き出しを変更。ローディングして CHAT_SHOW_LENGTH 件ずつ書き足す
//******************************************************************************
const CHAT_DB_LENGTH = 50
//****************************************
// 自作セレクターメソッド
//****************************************
MainClass1017.prototype.sel = function(selecter) {
    return $(".view1017 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1017.prototype.ev = function(eventName, selecter, func) {
    $(".view1017").on(eventName, selecter, func);
}
//---------------------------------------
// 会話ログ全件取得 & 描画
//---------------------------------------
MainClass1017.prototype.initShowLog = async function (chatID) {
    const self = this;
    // リストのデータ取得
    let chatNo = ''
    if (chatID === "") {
        // 全件取得する
        chatNo = '0'
    } else {
        // 最新データのみ取得する
        chatNo = chatID
    }
    await self.database.getFetch(
        'mappingGetChatLog',
        [
            self.companyID,
            chatNo,
            self.group,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            self.chatLogData = data
        })
        .catch(() => {
            Materialize.toast('E101703 : 会話履歴が取得出来ません。グループを削除または更新してください。', 3000);
            self.chatLogData = false
        })
    // 取得ができなかった場合
    switch (self.chatLogData) {
        case false:
            return false;
        case null:
            // ログデータなし
            break
        default:
            self.sel('#li').empty();
            if (self.chatLogData != null) {
                self.chatLogShow();
                self.lastID = self.chatLogData[self.chatLogData.length - 1].id;
            }
            self.sel("#loadArea").hide();
            // メンバーの人数が3人に満たない時は閲覧のみとする
            self.database.getFetch(
                'mappingGetAllMemberCount',
                [
                    self.companyID,
                    self.group,
                ],
            ).then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                    if (data[0].memberCount < 3) {
                        self.sel("#text").attr("disabled", "disabled");
                        self.sel("#text").val("メンバーを3名以上にしてください");
                        self.sel('#camera').hide();
                        self.sel("#text").css("font-size", "4.5vw");
                    } else {
                        self.sel("#text").attr("disabled", false);
                    }
                })
                .catch(() => {
                    Materialize.toast('E101704 : グループメンバー人数の取得に失敗しました。', 3000);
                })
    }
}
//---------------------------------------
// チャットログを追加する
//---------------------------------------
MainClass1017.prototype.chatLogAppend = function (sentText) {
    const self = this;
    let $html = `
        <section class="right">
            <section class="chatTimeRight">今</section>
            <section class="font fontright ">${sentText}</section>
        <section class="noRead"></section>
    `
    self.sel("#text").css("width", "84%");
    self.sel("#text").css("height", "6.5vw");
    self.sel('.footer').css('height', '10vh');
    self.sel('form.chat').css('height', '90vh');
    self.sel("#entry").css("display", "none");
    // if (navigator.userAgent.indexOf('Android') > 0) {
    //     self.sel('.footer').css('height', self.sel("#text").innerHeight() + initHeight * 0.35);
    // }
    self.sel('#li').append($html);
}
//---------------------------------------
// チャットログを追加する
//---------------------------------------
MainClass1017.prototype.chatImageAppend = function (fileName) {
    const self = this;
    let $html = `
        <section class="right">
            <section class="chatTimeRight">今</section>
            <section class="imageChat rightImg">
                <img decoding="async" border="0" src="../../../../photo/chat_photo/${fileName}_min.jpeg" class="responsive-img chatImage">
            </section>
        <section class="noRead"></section>
    `
    self.sel('#li').append($html);
}
//---------------------------------------
// チャットログを表示する
//---------------------------------------
MainClass1017.prototype.chatLogShow = async function() {
    const self = this;
    let chatLogHTML = "";
    // 開始配列ナンバー
    const chatLogCount = self.chatLogData.length
    let endCount = CHAT_DB_LENGTH
    if (endCount === chatLogCount) {
        endCount = CHAT_DB_LENGTH
    } else {
        endCount = chatLogCount
    }
    let i = endCount - 1;
    let chatTime, chatLog, imageURL, chatUnread;
    for (; i >= 0; i--) {
        let className = '';
        const datetime = new Date(self.chatLogData[i].chatDateTime.replace(/\-/g, '/').substring(0, 10));
        const yy = datetime.getFullYear();
        const mm = datetime.getMonth() + 1;
        const DA = datetime.getDate();
        const datetimeYYMMDD = yy + "/" + addZero(mm) + "/" + addZero(DA);
        const chatDay = self.dateFormat(datetimeYYMMDD);
        let jikan = self.chatLogData[i].chatDateTime.substring(11, 16);
        if (jikan.slice(0, 1) == '0') {
            jikan = jikan.substr(1);
        }
        chatTime = chatDay + " " + jikan;
        chatLog = self.chatLogData[i].chatLog;
        imageURL = self.chatLogData[i].imageURL;
        if (chatLog.indexOf("\n") == -1) {} else {
            chatLog = chatLog.replace(/\n/g, "<br>");
        }
        if (chatLog.indexOf("http://") == -1) {} else {
            chatLog = "<a href='" + chatLog + "'>" + chatLog + "</a>";
        }
        if (chatLog.indexOf("https://") == -1) {} else {
            chatLog = "<a href='" + chatLog + "'>" + chatLog + "</a>";
        }
        if (imageURL != "") {
            className = 'imageChat';
            chatLog = "<img decoding='async' border='0' src='../../../../photo/chat_photo/" + imageURL + "_min.jpeg' class='responsive-img chatImage'>";
        }
        if (self.chatLogData[i].Unread == 0) {
            chatUnread = "全員既読";
        } else {
            chatUnread = "未読者：" + self.chatLogData[i].Unread + "名";
        }
        let logArea = "";
        if (self.chatLogData[i].memberID == self.staff) {
            if (className == 'imageChat') {
                logArea =
                    "<section class='" + className + " rightImg'>" +
                    chatLog +
                    "</section>";
            } else {
                logArea =
                    "<section class='font fontright " + className + "'>" +
                    chatLog +
                    "</section>";
            }
            chatLogHTML +=
                "<section class='right'>" +
                "<section class='chatTimeRight'>" + chatTime + "</section>" +
                logArea +
                "<section class='noRead'>" + chatUnread + "</section>" +
                "</section>";
        } else if (self.chatLogData[i].memberID == 'msg') {
            chatLogHTML +=
                "<section class='center'>" +
                "<section class='chatTime'>" + chatTime + "</section>" +
                "<section class='name'></section>" +
                "<section class='font fontcenter'>" + chatLog + "</section>" +
                "</section>";
        } else {
            if (className == 'imageChat') {
                logArea =
                    "<section class='" + className + " leftImg'>" +
                    chatLog +
                    "</section>";
            } else {
                logArea =
                    "<section class='font fontleft " + className + "'>" +
                    chatLog +
                    "</section>";
            }
            chatLogHTML +=
                "<section class='left'>" +
                    "<section class='chatTimeLeft'>" + chatTime + "</section>" +
                    "<section class='icontd'>" +
                        "<img decoding='async' src='" + self.chatLogData[i].url + "'' class='circle responsive-img icon'>" +
                    "</section>" +
                "<section class='name'>" + self.chatLogData[i].name + "</section>" +
                    logArea +
                "</section>";
        }
    }
    self.sel('#li').prepend(
        chatLogHTML
    )
        //.ready(function () {
    // self.chatImageAppend(fileName);
    let $img = $('.responsive-img');
    $img.originSrc = $img.src;
    $img.src = ""; // これで一旦クリアできます！
    // コールバックを設定
    $img.bind('load', function () {
        self.sel('form.chat').scrollTop(100000000)
        // $('#page-top').hide()
    });
};
//---------------------------------------
// 発言ボタン押下処理（会話の登録）
// 引数1 : 現在時刻
// 引数2 : 会話文
// 引数3 : 画像ファイル名
//---------------------------------------
MainClass1017.prototype.sentMessage = async function (
    talkTime,
    text,
    fileName)
{
    const self = this;
    // グループ参加のチェック
    let checkGroupData = null
    await self.database.getFetch(
        'mappingCheckGroup',
        [
            self.companyID,
            self.staff,
            self.group,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            checkGroupData = data
        })
        .catch(() => {
            Materialize.toast('E101701 : このグループに参加していません。', 3000);
        })
    switch (checkGroupData) {
        case false:
            Materialize.toast('E101701 : グループの取得に失敗しました。', 3000);
            return false;
        case null:
            Materialize.toast('このグループに参加していません。', 3000);
            spaHash('#1016', 'reverse');
            return false;
        default:
            // グループに参加している
    }
    // データベースに登録
    self.database.postFetch(
        'mappingPostChatLog',
        [
            self.companyID,
            self.staff,
            self.group,
            talkTime,
            text,
            fileName,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
        })
        .catch(() => {
            Materialize.toast('E100103 : 発言の登録処理に失敗しました。', 3000);
        })
    // 自分以外の端末情報の取得
    let pushData = null
    await self.database.getFetch(
        'mappingGetPushData',
        [
            self.companyID,
            self.staff,
            self.group,
            self.today,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            pushData = data
        })
        .catch(() => {
            Materialize.toast('E101703 : 自分以外の端末情報の取得に失敗しました。', 3000);
            pushData = false
        })
    // 取得ができなかった場合
    switch (pushData) {
        case false:
            return false;
        case null:
            // ログデータなし
            return true;
        default:
    }
    const regData = [];
    const nameData = [];
    // グループメンバーに通知
    for (let i in pushData) {
        regData.push(pushData[i].registerID);
        nameData.push(pushData[i].name);
        // 更新履歴をDBに挿入する
        if (i == 0) {
            fetchNewHistory(1, talkTime, pushData[0].staffID, self.group, self.companyID)
        } else {
            // 同じ人に２度送信されるのを防ぐため
            if (pushData[i].staffID != pushData[i - 1].staffID) {
                fetchNewHistory(1, talkTime, pushData[0].staffID, self.group, self.companyID)
            }
        }
    }
    commonPushFunc(
        pushData[0].idm,
        regData,
        self.companyID,
        self.staff,
        "会話が更新されました",
        "mode=1&groupID=" + self.group,
        self.group,
        nameData,
        false
    );
    return true;
};
//*************************************
// 通知履歴を既読に更新 & サイレント通知で、バッチカウントを更新
//*************************************
MainClass1017.prototype.upDataHistory = async function () {
    const self = this;
    self.database.putFetch(
        'mappingPutHistoryEvent',
        [
            self.companyID,
            self.staff,
            '1',
            self.group,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
        })
        .catch(() => {
            // Materialize.toast('E101705 : 通知履歴を既読にするに失敗しました。', 3000);
        })
}