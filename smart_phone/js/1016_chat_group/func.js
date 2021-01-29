"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// リスト書き出し関数 2018/07/25  取得するリストを変更したので書き出しも変更しました。
//=========================================
// 自作セレクターメソッド
//****************************************
MainClass1016.prototype.sel = function(selecter) {
    return $(".view1016 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1016.prototype.ev = function(eventName, selecter, func) {
    $(".view1016").on(eventName, selecter, func);
};
MainClass1016.prototype.listShow = async function() {
    const self = this;
    let history = "";
    let chatDateTime = null;
    let icon = null;
    let chatLog = null;
    let $html = "";
    let groupName = null;
    let memberCount = null;
    await self.database.getFetch(
        'mappingGetChatlist',
        [
            self.companyID,
            self.staff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            self.chatListData = data
        })
        .catch(() => {
            Materialize.toast('E101601 : 会話グループの抽出に失敗しました。', 3000);
            self.chatListData = false
        })
    // 取得ができなかった場合
    switch (self.chatListData) {
        case false:
            spaHash('#1004', 'reverse');
            return false;
        case null:
            // ◇お知らせリストが１件もない場合
            self.sel("#group").html("<p class='none'>表示するグループがありません。</p>");
            return true
        default:
    }
    self.sel('#group').empty();
    for (let i in self.chatListData) {
        groupName = self.chatListData[i].groupName;
        memberCount = self.chatListData[i].memberCount;
        history = self.chatListData[i].noRead;
        if (history >= 100) {
            history = 99;
        }
        chatDateTime = self.chatListData[i].chatDateTime;
        if (chatDateTime == null) {
            chatDateTime = "1900/01/01";
        }
        chatDateTime = dateToFormatString(new Date(chatDateTime.slice(0, 10)), '%YYYY%年%M%月%D%日');
        icon = self.chatListData[i].icon;
        chatLog = self.chatListData[i].chatLog;
        if (chatLog == null) {
            chatLog = "";
        }
        if (chatLog.length > 15) {
            chatLog = chatLog.substr(0, 15) + "...";
        }
        // バイト数にて不要部分を削除
        const nameByte = 20 - memberCount.length;
        groupName = byteSubstr(groupName, nameByte, "...");
        // グループの名前の後に人数追加
        if (groupName != "" && memberCount != "") {
            groupName = groupName + "(" + memberCount + "名)";
        }
        // 書き出し用のデータ作成
        // 未読数有の時
        if (history > 0) {
            $html +=`
            <tr>
                <td class="icon"><span class="badge red">${history}</span></td>
                <td class="member">
                    <img decoding="async" id="list${i}" class="a" src="${icon}" onerror=this.src="../../common/photo/noImage.png">
                </td>
                <td style="background:none;color:black;" class="chat" id="sns${i}">
                    <a class="waves-effect waves-light btn">
                        <p id="time${i}" class="time">${chatDateTime}</p>
                        <p id="chat${i}" class="title">${groupName}</p>
                        <p id="log${i}" class="log">${chatLog}</p>
                        <input id="groupID${i}" type="hidden" value="${self.chatListData[i].groupID}">
                        <input id="memCount${i}" type="hidden" value="${memberCount}">
                    </a>
                </td>
            </tr>
            `;
        } else {
            // 未読数無しの時
            $html +=`
            <tr>
                <td class="member">
                    <img decoding="async" id="list${i}" class="a" src="${icon}" onerror=this.src="../../common/photo/noImage.png">
                </td>
                <td class="chat" id="sns${i}">
                    <a style="background:none;color:black;" class="waves-effect waves-light btn">
                        <p id="time${i}" class="time">${chatDateTime}</p>
                        <p id="chat${i}" class="title">${groupName}</p>
                        <p id="log${i}" class="log">${chatLog}</p>
                        <input id="groupID${i}" type="hidden" value="${self.chatListData[i].groupID}">
                        <input id="memCount${i}" type="hidden" value="${memberCount}">
                    </a>
                </td>
            </tr>
            `;
        }
    }
    //書き出し
    self.sel('#group').append($html);
};