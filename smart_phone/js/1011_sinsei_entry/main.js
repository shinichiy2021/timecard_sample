"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/18 yamazaki 欠勤届けのみ表示するようにしました。（ver.2.1.1）
//******************************************************************************
MainClass1011.prototype.event = function() {
    const self = this;
    const YM = new Date();
    let yy = YM.getFullYear();
    let mm = YM.getMonth() + 1;
    let DA = YM.getDate();
    const today = yy + "/" + addZero(mm) + "/" + addZero(DA);
    let todayHyphen = yy + "-" + addZero(mm) + "-" + addZero(DA);
    let editFlag = false;
    // 内部的な変更フラグ
    let shukinJikan = '';
    let taikinJikan = '';
    self.sel("#errorArea").hide();
    const shukin = to60(self.kintaiPaternDate[0].startWork);
    shukinJikan = addZero(shukin.hours) + ':' + addZero(shukin.minutes);
    self.shukinJikan = shukinJikan;
    const taikin = to60(self.kintaiPaternDate[0].endWork);
    taikinJikan = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
    self.taikinJikan = taikinJikan;
    self.startMarume = self.kintaiPaternDate[0].startMarume;
    self.endMarume = self.kintaiPaternDate[0].endMarume;
    //**********************************************//
    // 申請事由変更時イベント
    //**********************************************//
    $("#reason").change(function() {
        if($("#reason").val() === "0"){
            $("#shinseiJiyu").hide();
        }else{
            $("#shinseiJiyu").show();
        }
    });
    //**********************************************//
    // 残業種類チェンジイベント
    //**********************************************//
    self.ev('change', '#todokedeKubun', function() {
        const shukin = to60(self.kintaiPaternDate[0].startWork);
        const shukinJikan = addZero(shukin.hours) + ':' + addZero(shukin.minutes);
        const taikin = to60(self.kintaiPaternDate[0].endWork);
        const taikinJikan = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
        if ($(this).val() == '4') {
            self.sel("#zangyoSt").show();
            self.sel("#shukinJikan").show();
            self.sel("#shukinJikan").val("");
            self.sel("#taikinJikan").val(shukinJikan);
            // self.sel("#zangyoEnd").hide();
            // self.sel("#taikinJikan").hide();
        } else {
            // self.sel("#zangyoSt").hide();
            // self.sel("#shukinJikan").hide();
            self.sel("#shukinJikan").val(taikinJikan);
            self.sel("#zangyoEnd").show();
            self.sel("#taikinJikan").show();
            self.sel("#taikinJikan").val("");
        }
    });
    //*****************************
    // 申請項目のチェンジイベント
    //*****************************
    self.ev('change', '#sinseiKomoku', function() {
        self.sel("#dateFrom").children('h1').text('期間');
        editFlag = true;
        self.sel("#errorArea").hide();
        self.sel('#sinseiKomokuHide').show();
        self.sel("#sinseiFrom").val(todayHyphen);
        self.sel("#sinseiFrom").next('p').show();
        self.sel("#sinseiTo").val(todayHyphen);
        self.sel("#dateTo").show();
        self.sel("#dakokuSinseiDate").hide();
        self.sel(".sotaiTodoke").remove();
        self.sel(".tikokuTodoke").remove();
        self.sel("#furiKyu").remove();
        self.sel("#shoninSha").val("sentakuShitekudasai");
        self.sel("#shinseiJiyu textarea").val('');
        //=====================================
        // 欠勤届けのチェンジイベント
        //=====================================
        if ($(this).val() == '0') {
            self.sel(".sinseiDate").show();
            // 休暇種類を取得する
            const kyukaData = self.master.read(
                "SELECT" +
                "  todokedeID," +
                "  todokedeName" +
                " FROM" +
                "  MK_todokede" +
                " WHERE" +
                "  (todokedeKubun='0' OR todokedeKubun='3') AND" +
                "  companyID=N'" + self.companyID + "'"
            );
            if (false === self.exception.check(
                    kyukaData,
                    ExceptionServerOn,
                    ExceptionSystemOn,
                    "101101",
                    "休暇の種類が取得できませんでした。",
                    ExceptionParamToMenu
                )) {
                return false;
            }
            let $kyukaShuruiHtml = '';
            for (let i in kyukaData) {
                $kyukaShuruiHtml +=`
                    <option value="${kyukaData[i].todokedeID}">
                        ${kyukaData[i].todokedeName}
                    </option>
                `;
            }
            const $html =`
                <section class="kyukaTodoke">
                    <h1 class="Date">休暇種類</h1>
                    <select id="kyukaShurui">
                        ${$kyukaShuruiHtml}
                    </select>
                </section>
            `;
            self.sel("#sinseiNaiyo").html($html);
            self.ev('change', '#kyukaShurui', function() {
                self.sel("#dakokuSinseiDate").empty();
                if (self.sel("#kyukaShurui").val() == '7') {
                    self.sel("#dateFrom").children('h1').text('期間');
                    self.sel("#dakokuSinseiDate").show();
                    self.sel("#sinseiFrom").next('p').hide();
                    self.sel("#dateTo").hide();
                    self.sel("#dakokuSinseiDate").append(
                        '<h1>出勤日</h1>' +
                        '<input id="kyusitubi" type="date" value="">'
                    );
                } else {
                    self.sel("#dateFrom").children('h1').text('期間');
                    self.sel("#sinseiFrom").next('p').show();
                    self.sel("#dateTo").show();
                    self.sel("#dakokuSinseiDate").hide();
                }
            });
            $("#reason").val("0");
            $("#reason").prop('disabled', false);
            $("#shinseiJiyu").hide();
        }
        //=====================================
        // 早退届けのチェンジイベント
        //=====================================
        else if ($(this).val() == '1') {
            self.sel(".sinseiDate").show();
            self.sel("#dakokuSinseiDate").empty();
            const $html =`
                <section class="sotaiTodoke">
                    <h1 class="Date">退勤時刻</h1>
                    <input id="taikinJikan" type="time" value="${taikinJikan}">
                </section>
            `;
            self.sel("#sinseiNaiyo").empty();
            self.sel(".sinseiDate").append($html);
            //     ・本日日付の退勤データを取得する。
            const todayTaikin = self.getTaikinToday(today);
            // ◇データが取得できなかったとき（例外処理）マッピング情報1を参照
            // ・エラーメッセージを出力する「勤怠データが取得できませんでした。申請リスト画面にもどります。」
            //     ・1009_申請リスト画面に遷移する。
            const todayTaikinFlag = self.exception.check(
                todayTaikin,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101102",
                "勤怠データが取得できませんでした。",
                ExceptionParamToMenu
            );
            if (todayTaikinFlag == false) {
                return false;
            }
            if (todayTaikinFlag == null || (todayTaikin[0].outOffice == "0.0" || todayTaikin[0].outOffice == null)) {
                // ◇マッピング情報１でデータが取得できなかった場合又は本日退勤打刻が存在し無い時
                //     ・画面_1011_3（早退事前）を表示する
                self.sel("#taikinJikan").val(taikinJikan);
                self.sel("#dateFrom").children('h1').text('期間');
                self.sel("#sinseiFrom").next('p').show();
                self.sel("#dateTo").show();
            } else {
                // ◇マッピング情報１でデータが取得できた場合で、かつ退勤打刻が存在する時
                //  画面_1011_3（早退事後）を表示する
                const reTaikin = to60(todayTaikin[0].outOffice);
                const reTaikinJikan = addZero(reTaikin.hours) + ':' + addZero(reTaikin.minutes);
                self.sel("#taikinJikan").val(reTaikinJikan);
                self.sel("#taikinJikan").prop('disabled', true);
                self.sel("#sinseiFrom").next('p').hide();
                self.sel("#dateTo").hide();
            }
            self.ev('change', '#taikinJikan', function() {
                editFlag = true;
            });
            // 日付け変更時
            self.ev('change', '#sinseiFrom', function() {
                if (self.sel("#sinseiKomoku").val() == '1') {
                    let editDate = self.sel("#sinseiFrom").val();
                    if (editDate.indexOf('-') != -1) {
                        editDate = editDate.replace(/-/g, "/");
                    }
                    if (editDate != '') {
                        self.soutai(editDate, today, todayHyphen);
                        editFlag = true;
                    }
                }
            });
            $("#reason").val("0");
            $("#reason").prop('disabled', false);
            $("#shinseiJiyu").hide();
        }
        //=====================================
        // 遅刻届けのチェンジイベント
        //=====================================
        else if ($(this).val() == '2') {
            self.sel(".sinseiDate").show();
            self.sel(".sotaiTodoke").remove();
            self.sel(".tikokuTodoke").remove();
            self.sel("#dakokuSinseiDate").empty();
            const $html =`
                <section class="tikokuTodoke">
                    <h1 class="Date">出勤時刻</h1>
                    <input id="shukinJikan" type="time" value="${shukinJikan}">
                </section>
            `;
            self.sel("#sinseiNaiyo").empty();
            self.sel(".sinseiDate").append($html);
            //     ・本日日付の出勤データを取得する。
            const todayShukin = self.getSyukinToday(today);
            // ◇データが取得できなかったとき（例外処理）マッピング情報2を参照
            //     ・エラーメッセージを出力する「勤怠データが取得できませんでした。申請リスト画面にもどります。」
            //     ・1009_申請リスト画面に遷移する。
            switch (self.exception.check(
                todayShukin,
                ExceptionServerOn,
                ExceptionSystemOff,
                "101103",
                "本日日付の出勤データを取得に失敗しました。",
                ExceptionParamToMenu
            )) {
                case false:
                    return false;
                case null:
                    // ◇マッピング情報２でデータが取得できなかった場合
                    //     ・画面_1011_3（遅刻事前）を表示する
                    self.sel("#shukinJikan").val(shukinJikan);
                    self.sel("#sinseiFrom").next('p').show();
                    self.sel("#dateFrom").children('h1').text('期間');
                    self.sel("#dateTo").show();
                    break;
                case true:
                    // ◇マッピング情報２でデータが取得できた場合
                    //     ・画面_1011_3（遅刻事後）を表示する
                    const reShukin = to60(todayShukin[0].inOffice);
                    const reShukinJikan = addZero(reShukin.hours) + ':' + addZero(reShukin.minutes);
                    self.sel("#shukinJikan").val(reShukinJikan);
                    self.sel("#shukinJikan").prop('disabled', true);
                    self.sel("#dateFrom").children('h1').text('期間');
                    self.sel("#sinseiFrom").next('p').hide();
                    self.sel("#dateTo").hide();
            }
            self.ev('change', '#shukinJikan', function() {
                editFlag = true;
            });
            // 日付け変更時
            self.ev('change', '#sinseiFrom', function() {
                if (self.sel("#sinseiKomoku").val() == '2') {
                    let editDate = self.sel("#sinseiFrom").val();
                    if (editDate.indexOf("-") != -1) {
                        editDate = editDate.replace(/-/g, "/");
                    }
                    if (editDate != '') {
                        self.tikoku(editDate, today, todayHyphen);
                        editFlag = true;
                    }
                }
            });
            $("#reason").val("0");
            $("#reason").prop('disabled', false);
            $("#shinseiJiyu").hide();
        }
        //=====================================
        // 時間外勤務届けのチェンジイベント
        //=====================================
        else if ($(this).val() == '3') {
            self.sel("#dakokuSinseiDate").empty();
            self.sel("#dakokuSinseiDate").show();
            if (false == self.initJikangaiDraw()) {
                return false;
            }
            editFlag = true;
            // 普通残業届の初期表示
            const taikin = to60(self.kintaiPaternDate[0].endWork);
            const taikinJikan = addZero(taikin.hours) + ':' + addZero(taikin.minutes);
            self.sel("#zangyoSt").show();
            self.sel("#shukinJikan").show();
            self.sel("#zangyoEnd").show();
            self.sel("#taikinJikan").show();
            self.sel("#shukinJikan").val(taikinJikan);
            // 日付け変更時
            function dateChange() {
                //エラー初期化
                self.sel("#errorArea").empty();
                self.sel("#errorArea").css('display', 'none');
                let editFromDate = self.sel("#sinseiFrom").val();
                if (editFromDate.indexOf("-") != -1) {
                    editFromDate = editFromDate.replace(/-/g, "/");
                }
                let checkFromFlg = true;
                if (editFromDate < today) {
                    checkFromFlg = self.jikangaiCheck(editFromDate);
                }
                let editDate = self.sel("#sinseiTo").val();
                if (editDate.indexOf("-") != -1) {
                    editDate = editDate.replace(/-/g, "/");
                }
                let checkToFlg = true;
                if (editFromDate != editDate) {
                    if (editDate < today) {
                        checkToFlg = self.jikangaiCheck(editDate);
                    }
                }
                let errorMsg = '';
                if (checkFromFlg == false && checkToFlg == false) {
                    errorMsg = "<p>" + editFromDate + "と" + editDate + "の勤怠が存在しません。打刻修正を行ってください。</p>";
                } else if (checkFromFlg == false && checkToFlg == true) {
                    errorMsg = "<p>" + editFromDate + "の勤怠が存在しません。打刻修正を行ってください。</p>";
                } else if (checkFromFlg == true && checkToFlg == false) {
                    errorMsg = "<p>" + editDate + "の勤怠が存在しません。打刻修正を行ってください。</p>";
                }
                if (errorMsg != '') {
                    self.sel("#errorArea").append(errorMsg);
                    self.sel("#errorArea").css('display', 'block');
                }
            }
            self.ev('change', '#sinseiFrom', dateChange);
            self.ev('change', '#sinseiTo', dateChange);
            $("#reason").val("1");
            $("#reason").prop('disabled', true);
            $("#shinseiJiyu").show();
        }
        //=====================================
        // 休日出勤届けのチェンジイベント
        //=====================================
        else if ($(this).val() == '4') {
            self.sel(".sinseiDate").show();
            self.sel("#dakokuSinseiDate").empty();
            const $html =`
                <section class="kyushutuTodoke">
                    <h1>休暇タイプ</h1>
                    <select id="kyuka">
                        <option value="0">振休</option>
                        <option value="1">代休</option>
                        <option value="2">休日出勤届のみ</option>
                    </select>
                </section>
            `;
            self.sel("#sinseiNaiyo").html($html);
            self.sel("#dateFrom").children('h1').text('期間');
            self.kyushutu(self.sel("#kyuka").val(), todayHyphen);
            self.sel("#sinseiFrom").next('p').hide();
            self.sel("#dateTo").hide();
            // 休暇タイプ変更時
            self.ev('change', '#kyuka', function() {
                self.kyushutu(self.sel("#kyuka").val(), todayHyphen);
                editFlag = true;
            });
            self.ev('change', '#sinseiFrom', function() {
                if (self.sel("#sinseiKomoku").val() == '4') {
                    self.sel("#dateTo").hide();
                }
            });
            $("#reason").val("1");
            $("#reason").prop('disabled', true);
            $("#shinseiJiyu").show();
        }
        //=====================================
        //=====================================
        else if ($(this).val() == '5') {
            // self.sel("#sinseiNaiyo").empty();
            // self.sel("#sinseiFrom").next('p').hide();
            // self.sel("#dateTo").hide();
            // self.sel("#dakokuSinseiDate").empty();
            // self.sel("#dakokuSinseiDate").show();
            // self.sel("#sinseiFrom").val(todayHyphen);
            // // 本日の現在時刻を取得する
            // const h = YM.getHours();
            // const mi = YM.getMinutes();
            // const genzaiTime = to10(h + ":" + mi);
            // if (self.kintaiPaternDate[0].endWork >= genzaiTime) {
            //     const date = new Date(today);
            //     // 前日を求める
            //     date.setDate(date.getDate() - 1);
            //     yy = date.getFullYear();
            //     mm = date.getMonth() + 1;
            //     DA = date.getDate();
            //     todayHyphen = yy + "-" + addZero(mm) + "-" + addZero(DA);
            //     self.sel("#sinseiFrom").val(todayHyphen);
            // }
            // self.dataChange();
        }
        //=====================================
        // その他届けのチェンジイベント
        //=====================================
        else if ($(this).val() == '99') {
            self.sel(".sinseiDate").show();
            self.sel("#dakokuSinseiDate").empty();
            const $html =`
                <section class="kyushutuTodoke">
                    <h1>届出タイプ</h1>
                    <select id="kyuka">
                        <option value="0">打刻修正</option>
                    </select>
                </section>
            `;
            self.sel("#sinseiNaiyo").html($html);
            self.sel("#dateFrom").children('h1').text('期間');
            self.kyushutu(self.sel("#kyuka").val(), todayHyphen);
            self.sel("#sinseiFrom").next('p').hide();
            self.sel("#furiKyu").hide();
            $("#reason").val("1");
            $("#reason").prop('disabled', true);
            $("#shinseiJiyu").show();
        } else {
            self.sel("#sinseiNaiyo").empty();
            self.sel("#shoninSha").val("");
            self.sel("#sinseiFrom").val(todayHyphen);
            self.sel("#sinseiTo").val(todayHyphen);
            self.sel("#kyukeiJikan").val("");
            self.sel("#shinseiJiyu textarea").val("");
            self.sel('#sinseiKomokuHide').hide();
        }
    });
    // 届出提出ボタン押下処理
    self.ev('click', '#regist', function() {
        if (false == self.todokedeNewButton()) {
            return false;
        }
    });
    self.ev('change', '#sinseiFrom', function() {
        if ($(this).val() == '5') {
            let dakokuhi = self.sel("#sinseiFrom").val().replace(/-/g, '/');
            dakokuhi = dakokuhi.split('/');
            const dakokunen = dakokuhi[0];
            const dakokutuki = dakokuhi[1];
            const dakokubi = dakokuhi[2];
            const now = new Date(dakokuhi);
            const h = now.getHours();
            const mi = now.getMinutes();
            const genzaiTime = to10(h + ":" + mi);
            if (self.sel("#sinseiFrom").val().replace(/-/g, '/') >= today && self.kintaiPaternDate[0].endWork >= genzaiTime) {
                alert(dakokunen + "年" + addZero(dakokutuki) + "月" + addZero(dakokubi) + "日は退勤予定時刻を過ぎてから申請してください。");
                const date = new Date(today);
                // 前日を求める
                date.setDate(date.getDate() - 1);
                yy = date.getFullYear();
                mm = date.getMonth() + 1;
                DA = date.getDate();
                todayHyphen = yy + "-" + addZero(mm) + "-" + addZero(DA);
                self.sel("#sinseiFrom").val(todayHyphen);
            }
            editFlag = true;
        }
    });
    //****************************************//
    // 内部的な変更フラグ
    //****************************************//
    self.ev('change', '#shoninSha', function() {
        editFlag = true;
    });
    self.ev('click', '#sinseiFrom', function() {
        self.sinseiFromDate = $(this).val().replace(/-/g, '/');
    });
    self.ev('change', '#sinseiFrom', function() {
        editFlag = true;
        if ($('#sinseiTo').val().replace(/-/g, '/') ===  self.sinseiFromDate) {
            $('#sinseiTo').val($(this).val());
        }
    });
    self.ev('change', '#sinseiTo', function() {
        editFlag = true;
    });
    self.ev('change', '#shinseiJiyu textarea', function() {
        editFlag = true;
    });
    self.ev('change', '#kyukeiJikan', function() {
        editFlag = true;
    });
    self.ev('change', '#shukinJikan', function() {
        editFlag = true;
    });
    self.ev('change', '#taikinJikan', function() {
        editFlag = true;
    });
    //****************************************//
    // 戻るボタン押下処理
    //****************************************//
    function back() {
        if (editFlag == true || self.editFlag == true) {
            if (confirm(KAKUNIN) == true) {
                if (sessionStorage.getItem('gamenID') == '申請') {
                    spaHash('#1009', 'reverse');
                    return false;
                } else {
                    spaHash('#1012', 'reverse');
                    return false;
                }
            } else {
                return false;
            }
        } else {
            if (sessionStorage.getItem('gamenID') == '申請') {
                spaHash('#1009', 'reverse');
                return false;
            } else {
                spaHash('#1012', 'reverse');
                return false;
            }
        }
        // return false;
    }
    // addFlick()(back);
    self.ev('click', '#back', back);
};