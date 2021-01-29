"use strict";
MainClass1019.prototype.event = function() {
    const self = this;
    // 新しいメンバーを選ぶが押された時
    self.ev('click', '#new', function() {
        if (self.modal() == false) {
            return false;
        }
        self.sel('#modal1').modal('open');
        self.newMember('00', '99', "");
    });
    // 戻るボタンが押された時
    function back() {
        if (self.gamenID == "1018") {
            // 配列をパラメータにセット
            sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
            spaHash('#1018', 'reverse');
            return false;
        } else if (self.gamenID == "1015") {
            // 配列をパラメータにセット
            if (self.arrayStaffID == "") {
                sessionStorage.setItem('arrayStaffID', 'memberNot');
            } else {
                sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
            }
            spaHash('#1015', 'reverse');
            return false;
        }
    }
    self.ev('click', '#back', back);
    self.ev('click', '#invitation', function() {
        if (self.gamenID == "1018") {
            // 配列をパラメータにセット
            sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
            sessionStorage.setItem("isChange", 'true');
            spaHash('#1018', 'reverse');
            return false;
        } else if (self.gamenID == "1015") {
            // 配列をパラメータにセット
            if (self.arrayStaffID == "") {
                sessionStorage.setItem('arrayStaffID', 'memberNot');
            } else {
                sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
            }
            spaHash('#1015', 'reverse');
            return false;
        }
    });
    //************************************************************************
    // モーダル内の処理
    //************************************************************************
    // モーダルとじるボタン押下時
    self.ev('click', '#close', function() {
        self.sel('#modal1').modal('close');
    });
    // 部署セレクトボックス変更時
    self.ev('change', '#sPost', function() {
        let postF = self.sel("#sPost").val();
        let postE = postF;
        if (postF == "") {
            postF = '00';
            postE = '99';
        }
        self.editMember(postF, postE, self.sel("#staffName").val());
    });
    // 氏名テキスト変更時
    self.ev('change', '#staffName', function() {
        let postF = self.sel("#sPost").val();
        let postE = postF;
        if (postF == "") {
            postF = '00';
            postE = '99';
        }
        self.editMember(postF, postE, $(this).val());
    });
    // メンバーを追加ボタンが押された時
    self.ev('click', '#regist', function() {
        // チェック件数の確認（0件の時エラーアラート表示）
        const check_count = self.sel('#modal_list :checked').length;
        if (check_count == 0) {
            Materialize.toast('追加したいメンバーにチェックを入れてください。', 3000);
            return false;
        }
        // staffIDの振り直し
        self.arrayStaffID = "";
        for (let j = 0; j < self.memberArray.length; j++) {
            if (j == self.memberArray.length - 1) {
                self.arrayStaffID += self.memberArray[j].staffID;
            } else {
                self.arrayStaffID += self.memberArray[j].staffID + ",";
            }
        }
        // チェックが入った行のスタッフIDを配列にセットする。
        self.sel("#modal_list tr").each(function(i) {
            if (self.sel("#modal_list > tbody > tr > td > #ent" + i).prop('checked') == true) {
                const memID = self.sel("#modal_list > tbody > tr > #memberID" + i).text();
                // メンバーの氏名
                if (self.arrayStaffID == "") {
                    self.arrayStaffID = memID;
                } else {
                    self.arrayStaffID += "," + memID;
                }
            }
        });
        // メンバーが正常に登録された時に、元の画面に戻る。
        sessionStorage.setItem('arrayStaffID', self.arrayStaffID);
        sessionStorage.setItem('gamenID', self.gamenID);
        // 配列をパラメータにセット
        sessionStorage.setItem('isChange', 'true');
        if (self.gamenID == "1018") {
            // 配列をパラメータにセット
            spaHash('#1018', 'reverse');
            return false;
        } else if (self.gamenID == "1015") {
            // 配列をパラメータにセット
            spaHash('#1015', 'reverse');
            return false;
        }
    });
    // メンバーの削除が押下された時
    self.ev('click', '#list > tbody > tr > td > .et', function () {
        const delid = $(this).attr('id').slice(3);
        if (self.gamenID == "1018") {
            if (delid == '') {
                const upDateMsg = "グループを退会すると、このグループの会話には参加できなくなります。よろしいですか？";
                if (confirm(upDateMsg) == false) {
                    return false;
                }
            }
        }
        self.sel("#memberID" + delid).parent().next().remove();
        self.sel("#memberID" + delid).parent().remove();
        if (delid == '') {
            localStorage.setItem('meDel', JSON.stringify('1'));
        }
        // 新たに配列にセットする
        self.memberArray = [];
        const listLen = self.sel("#list tbody").children().length;
        if (listLen == 0) {
            self.sel("#memberList").empty();
            $html = "";
            $html = "<tr><td class='memberNoneList'>表示するメンバーがいません。</td></tr>";
            self.sel("#allSerect #allser").html($html);
            self.sel("#midasi").empty();
            self.sel("#memberList").append($html);
        }
        let strMemberArray = "";
        self.memberArray = [];
        for (let i = 0; i < listLen; i++) {
            if (i % 2 == 0) {
                const newMemID = self.sel("#list > tbody > tr:eq(" + i + ")").find(".staffID").html();
                const newMemName = self.sel("#list > tbody > tr:eq(" + i + ")").find(".staff").html();
                if (newMemID != self.staff) {
                    self.memberArray.push({
                        "staffID": newMemID,
                        "name": newMemName
                    });
                    strMemberArray += newMemID + ",";
                }
            }
        }
        // 配列をセットし直す
        self.arrayStaffID = strMemberArray.substr(0, strMemberArray.length - 1);
        self.sel("#invitation").show();
    });
    // ポップアップ用のイベント処理の呼び出し
    self.modalEvent();
};