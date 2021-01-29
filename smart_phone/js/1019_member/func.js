"use strict";
//******************************************************************************
// 関数
// 関数はこのJSファイルに記入してください
//=========================================
// 自作セレクターメソッド
//****************************************
MainClass1019.prototype.sel = function(selecter) {
    return $(".view1019 " + selecter);
};
//****************************************
// 自作イベントメソッド
//****************************************
MainClass1019.prototype.ev = function (eventName, selecter, func) {
    $(".view1019").on(eventName, selecter, func);
};
//---------------------------------------
// グループメンバーの一覧表示
//---------------------------------------
MainClass1019.prototype.setMember = async function() {
    const self = this;
    // シングルコーテンション付け
    if (null == self.arrayStaffID || '' == self.arrayStaffID) {
        // メンバーが存在しない時
        // 何も表示しない
        // ※正常処理
        self.memberArray = [];
        return true;
    }
    const splitStaff = self.arrayStaffID.split(",");
    let mojiStaff = "";
    for (let i = 0; i < splitStaff.length; i++) {
        if (splitStaff.length - 1 == i) {
            mojiStaff = mojiStaff + "N'" + splitStaff[i] + "'";
        } else {
            mojiStaff = mojiStaff + "N'" + splitStaff[i] + "',";
        }
    }
    //---------------------------------------------
    // 仕様書_1019_メンバーリスト
    // マッピング情報 1 .メンバー配列データの取得
    // 2018/03/27 yamazaki
    //---------------------------------------------
    let memberGetData = null
    await self.database.getFetch(
        'mappingGetStaffArray',
        [
            self.companyID,
            mojiStaff,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            memberGetData = data
        })
        .catch(() => {
            Materialize.toast('E102201 : メンバー配列データの取得に失敗しました。', 3000);
            memberGetData = false
        })
    // 取得ができなかった場合
    switch (memberGetData) {
        case false:
            return false
        case null:
            Materialize.toast('登録データが存在しません。', 3000);
            return true
        default:
            // return true
    }
    // 配列に入れる
    self.memberArray = []
    for (let i in memberGetData) {
        if (self.staff != memberGetData[i].staffID) {
            self.memberArray[i] = {
                "staffID": memberGetData[i].staffID,
                "name": memberGetData[i].name
            }
        }
    }
    self.sel("#memberList").empty();
    let $html = "";
    const memberLen = self.memberArray.length;
    let editTag = "";
    if (self.gamenID == "1018") {
        if (self.groupID != 'new') {
            editTag = "<input class='et' id='del' type='button' value='削除'>";
        }
        if (self.sessionChange != '1') {
            $html =`
                <tr class='member'>
                    <td id='memberID' class='staffID' style='display:none'>${self.staff}</td>
                    <td class='staff_N'>
                        <p id='stName' class='staff'>${self.staffName}</p>
                    </td>
                    <td class='ck1'>${editTag}</td>
                </tr>
                <tr class='yohaku'></tr>
            `;
        }
        for (let i = 0; i < memberLen; i++) {
            $html +=`
                <tr class='member'>
                    <td id='memberID${i}' class='staffID' style='display:none'>${self.memberArray[i].staffID}</td>
                    <td class='staff_N'>
                        <p id='stName${i}' class='staff'>${self.memberArray[i].name}</p>
                    </td>
                    <td class='ck1'>
                        <input class='et' id='del${i}' type='button'  value='削除'>
                    </td>
                </tr>
                <tr class='yohaku'></tr>
            `;
        }
    } else {
        if (memberLen == 0) {
            $html = "<tr><td class='memberNoneList'>表示するメンバーがいません。</td></tr>";
            self.sel("#allSerect #allser").html($html);
            self.sel("#midasi").empty();
        } else {
            for (let i = 0; i < memberLen; i++) {
                $html +=`
                    <tr class='member'>
                        <td id='memberID${i}' class='staffID' style='display:none'>${self.memberArray[i].staffID}</td>
                        <td class='staff_N'>
                            <p id='stName${i}' class='staff'>${self.memberArray[i].name}</p>
                        </td>
                        <td class='ck1'>
                            <input class='et' id='del${i}' type='button'  value='削除'>
                        </td>
                    </tr>
                    <tr class='yohaku'></tr>
                `;
            }
        }
    }
    self.sel("#memberList").append($html);
}