"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/21  アラートをフレームワーク統一に変更
//******************************************************************************
MainClass1019.prototype.modalEvent = function() {
    const self = this;
    const tr = self.sel("#modal_memberList tr");
    // メンバーのチェックボックスが変更された時
    self.ev('change', '#modal_list > tbody > tr > td > .et', function() {
        if ($(this).is(':checked')) {
            $(this).val(1);
        } else {
            $(this).val(0);
        }
        // チェックの入った数を数えて、1件以上なら追加ボタンを活性化する
        const check_count = self.sel('#modal_list :checked').length;
        if (check_count == 0) {
            self.sel("#regist").attr('disabled', 'disabled');
        } else {
            self.sel("#regist").attr('disabled', false);
        }
    });
    self.ev('change', '#modal_allSerect > tbody > tr > td > .et', function() {
        if ($(this).is(':checked')) {
            self.sel("#modal_list > tbody > tr > td > .et").prop('checked', true);
            self.sel("#modal_list > tbody > tr > td > .et").val(1);
            self.sel("#modal_choice").html('すべて解除する');
        } else {
            self.sel("#modal_list > tbody > tr > td > .et").prop('checked', false);
            self.sel("#modal_list > tbody > tr > td > .et").val(0);
            self.sel("#modal_choice").html('すべて選択する');
        }
        const check_count = self.sel('#modal_allSerect :checked').length;
        if (check_count == 0) {
            self.sel("#regist").attr('disabled', 'disabled');
        } else {
            self.sel("#regist").attr('disabled', false);
        }
    });
    self.ev('change', '#modal_allSerect > tbody > tr > td > .et', function() {
        if ($(this).is(':checked')) {
            tr.each(function(i) {
                const trCss = tr.eq(i).css("display");
                if (trCss != 'none') {
                    self.sel("#ent" + i).prop('checked', true);
                    self.sel("#ent" + i).val(1);
                    self.sel("#modal_choice").html('すべて解除する');
                }
            });
        } else {
            tr.each(function(i) {
                const trCss = tr.eq(i).css("display");
                if (trCss != 'none') {
                    self.sel("#ent" + i).prop('checked', false);
                    self.sel("#ent" + i).val(0);
                    self.sel("#modal_choice").html('すべて選択する');
                }
            });
        }
        const check_count = self.sel('#modal_allSerect :checked').length;
        if (check_count == 0) {
            self.sel("#regist").attr('disabled', 'disabled');
        } else {
            self.sel("#regist").attr('disabled', false);
        }
    });
}
//---------------------------------------
// 新規作成の処理
//---------------------------------------
MainClass1019.prototype.modal = async function() {
    const self = this;
    const postF = '00';
    const postE = '99';
    // セレクトボックスの値をセット
    //---------------------------------------------
    // 仕様書_1020_メンバー追加（ポップアップ）
    // マッピング情報 1 .部署データの取得
    // 2018/03/27 yamazaki
    //---------------------------------------------
    // 部署
    let postInfoData = null
    await self.database.getFetch(
        'mappingGetPostInfo',
        [
            self.companyID
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            postInfoData = data
        })
        .catch(() => {
            Materialize.toast('E102201 : 部署データの取得に失敗しました。', 3000);
            postInfoData = false
        })
    // 取得ができなかった場合
    switch (postInfoData) {
        case false:
            self.sel('#modal1').modal('close');
            return false
        case null:
            Materialize.toast('部署データが存在しません。', 3000);
            return true
        default:
            let $html = "<option value=''>所属を選択する</option>";
            for (let i in postInfoData) {
                $html += "<option value='" + postInfoData[i].postID + "'>" + postInfoData[i].postName + "</option>";
            }
            self.sel("#sPost").append($html + "</select>");
            self.sel("#sPost").val('');
            self.sel("#staffName").val('');
            self.editMember(postF, postE, "");
            // 登録ボタン非活性
            self.sel("#regist").attr('disabled', 'disabled');
            return true
    }
}
//---------------------------------------
// スマホ保持者の一覧表示(グループ未登録のメンバー)
// 引数
//---------------------------------------
MainClass1019.prototype.newMember = function(postF, postE, staffName) {
    const self = this;
    self.sel("#modal_memberList").empty();
    let $html = '';
    // シングルコーテーション
    let memberMoji = "";
    for (let i = 0; i < self.memberArray.length; i++) {
        memberMoji = memberMoji + "N'" + self.memberArray[i].staffID + "',";
    }
    memberMoji += "N'" + self.staff + "',";
    memberMoji = memberMoji.slice(0, -1);
    //---------------------------------------------
    // 仕様書_1020_メンバー追加（ポップアップ）
    // マッピング情報 2 .メンバーデータの取得
    // 2018/03/27 yamazaki
    //---------------------------------------------
    self.memberData = self.master.read(
        "SELECT" +
        "    MK_smartPhone.staffID," +
        "    MK_staff.name AS staffName" +
        " FROM MK_smartPhone" +
        " INNER JOIN MK_staff ON" +
        "    MK_smartPhone.staffID=MK_staff.staffID AND" +
        "    MK_smartPhone.companyID=MK_staff.companyID" +
        " LEFT OUTER JOIN MK_member ON" +
        "    MK_staff.companyID=MK_member.companyID AND" +
        "    MK_staff.staffID=MK_member.memberID" +
        " WHERE" +
        // "    (MK_smartPhone.name=N'iPhone' OR MK_smartPhone.name=N'Android') AND" +
        "    (MK_smartPhone.name=N'iPhone' OR MK_smartPhone.name=N'Android' OR MK_smartPhone.name=N'LINE') AND" +
        "    (MK_staff.retireDate='' OR MK_staff.retireDate IS NULL) AND" +
        "    (MK_staff.companyID=N'" + self.companyID + "') AND" +
        "    (MK_staff.postID BETWEEN '" + postF + "' AND '" + postE + "') AND" +
        "    (MK_staff.name like N'%" + staffName + "%') AND" +
        "    MK_smartPhone.staffID NOT IN (" + memberMoji + ")" +
        " GROUP BY" +
        "    MK_smartPhone.staffID," +
        "    MK_staff.name"
    );
    if (false === self.exception.check(
            self.memberData,
            ExceptionServerOn,
            ExceptionSystemOff,
            "102002",
            "メンバーデータの取得に失敗しました。",
            ExceptionParamToMenu,
            self.registerID,
            self.udid
        )) {
        return false;
    }
    for (let i in self.memberData) {
        $html +=
            "<tr>" +
            "<td>" +
            "<input type='checkbox' class='et' id='ent" + i + "'>" +
            "<label for='ent" + i + "' id='stName" + i + "' class='staff'>" + self.memberData[i].staffName + "</label>" +
            "</td>" +
            "<td id='memberID" + i + "' style='display:none'>" + self.memberData[i].staffID +
            "</td>" +
            "</tr>";
    }
    self.sel("#modal_memberList").append($html);
    if (self.sel("#modal_memberList tr").length == 0) {
        $html = "<tr><td class='memberNoneAdd'>追加するメンバーがいません。</td></tr>";
        self.sel("#modal_allSerect #allser").html($html);
        return false;
    } else {
        $html =
            "<tr>" +
            "<td>" +
            "<input type='checkbox' class='et' id='modal_choice'>" +
            "<label for='modal_choice' class='staff'>すべて選択する</label>" +
            "</td>" +
            "</tr>";
        self.sel("#modal_allSerect #allser").html($html);
    }
};
//---------------------------------------
// スマホ保持者の一覧絞込み表示(グループ未登録のメンバー)
// 引数
// 戻り値
//---------------------------------------
MainClass1019.prototype.editMember = function(postF, postE, staffName) {
    const self = this;
    let $html = "";
    // シングルコーテーション
    let memberMoji = "";
    for (let i = 0; i < self.memberArray.length; i++) {
        memberMoji = memberMoji + "N'" + self.memberArray[i].staffID + "',";
    }
    memberMoji += "N'" + self.staff + "',";
    memberMoji = memberMoji.slice(0, -1);
    const editData = self.master.read(
        "SELECT" +
        "    MK_smartPhone.staffID," +
        "    MK_staff.name AS staffName" +
        " FROM MK_smartPhone" +
        " INNER JOIN MK_staff ON" +
        "    MK_smartPhone.staffID=MK_staff.staffID AND" +
        "    MK_smartPhone.companyID=MK_staff.companyID" +
        " LEFT OUTER JOIN MK_member ON" +
        "    MK_staff.companyID=MK_member.companyID AND" +
        "    MK_staff.staffID=MK_member.memberID" +
        " WHERE" +
        "    (MK_smartPhone.name=N'iPhone' OR MK_smartPhone.name=N'Android') AND" +
        "    (MK_staff.retireDate='' OR MK_staff.retireDate IS NULL) AND" +
        "    (MK_staff.companyID=N'" + self.companyID + "') AND" +
        "    (MK_staff.postID BETWEEN '" + postF + "' AND '" + postE + "') AND" +
        "    (MK_staff.name like N'%" + staffName + "%') AND" +
        "    MK_smartPhone.staffID NOT IN (" + memberMoji + ")" +
        " GROUP BY" +
        "    MK_smartPhone.staffID," +
        "    MK_staff.name"
    );
    switch (self.exception.check(
            editData,
            ExceptionServerOn,
            ExceptionSystemOff,
            "102003",
            "スマホ保持者の一覧の取得に失敗しました。",
            ExceptionParamToMenu,
            self.registerID,
            self.udid
        )) {
        case false:
            return false;
        case null:
            self.sel("#modal_list").hide();
            self.sel("#modal_allSerect #allser").empty();
            self.sel("#modal_allSerect #allser").append("<tr><td class='memberNoneAdd'>追加するメンバーがいません。</td></tr>");
            break;
        default:
            self.sel("#modal_list").show();
            self.sel("#modal_allSerect #allser").empty();
            $html =
                "<tr>" +
                "<td>" +
                "<input type='checkbox' class='et' id='modal_choice'>" +
                "<label for='modal_choice' class='staff'>すべて選択する</label>" +
                "</td>" +
                "</tr>";
            self.sel("#modal_allSerect #allser").html($html);
            const $tr = self.sel("#modal_memberList tr");
            // 初期表示と比較して絞り込んだリストと一致しない行をhideにする
            $tr.each(function(i) {
                const cells = $tr.eq(i).children();     // 1行目のtrの子要素は取得
                for (let s in editData) {
                    if (cells.eq(1).text() == editData[s].staffID) {
                        $(this).show();
                        break;
                    } else {
                        $(this).hide();
                    }
                }
            });
            break;
    }
};