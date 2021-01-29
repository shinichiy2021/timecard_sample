//=========================================
// 管理PC用の共通関数
// このJSファイルに記入してください
//=========================================
// 日付の表記を＊＊月＊＊日（曜日）に最適化する
// 引数：フォーマット前の日付（例：2011/11/11）
//=========================================
Init.prototype.dateFormat = function(todoKK) {
    const dateYM = new Date();
    const yy = dateYM.getFullYear();
    const mm = dateYM.getMonth() + 1;
    const DA = dateYM.getDate();
    const today = yy + "/" + addZero(mm) + "/" + addZero(DA);
    let keisaiDate = "";
    let dispDate = "";
    let tomorrow = "";
    let yesterday = "";
    if (todoKK != "") {
        keisaiDate = new Date(todoKK);
        tomorrow = dateYM.getFullYear() + "/" + addZero(dateYM.getMonth() + 1) + "/" + addZero(dateYM.getDate() + 1);
        yesterday = dateYM.getFullYear() + "/" + addZero(dateYM.getMonth() + 1) + "/" + addZero(dateYM.getDate() - 1);
        if (todoKK == today) {
            dispDate = "今日";
        } else if (todoKK == tomorrow) {
            dispDate = "明日";
        } else if (todoKK == yesterday) {
            dispDate = "昨日";
        } else {
            dispDate += keisaiDate.getMonth() + 1;
            dispDate += "月";
            dispDate += keisaiDate.getDate();
            dispDate += "日";
            switch (keisaiDate.getDay()) {
                case 0:
                    dispDate += "(日)";
                    break;
                case 1:
                    dispDate += "(月)";
                    break;
                case 2:
                    dispDate += "(火)";
                    break;
                case 3:
                    dispDate += "(水)";
                    break;
                case 4:
                    dispDate += "(木)";
                    break;
                case 5:
                    dispDate += "(金)";
                    break;
                case 6:
                    dispDate += "(土)";
                    break;
            }
        }
        return dispDate;
    } else {
        return false;
    }
};
//=========================================
// 退職者のチェックと利用可能期間のチェック（スマホ用）
// 引数１：registerID（カード情報）
// 引数２：現在日付
// 戻り値１：TRUE（問題ないとき）
// 戻り値２：FALSE（エラーで退職者又は利用期限切れの時）
//=========================================
Init.prototype.asyncAvailable = function() {
    const self = this;
    // 会社番号とスタッフ番号を取得する
    const loginInfoData = self.database.getProcedures(
        'mappingGetLoginInfo',
        [
            self.registerID,
            self.today,
        ],
    )
    // 取得ができなかった場合
    switch (loginInfoData) {
        case false:
            Materialize.toast('ECOMMON01 : 会社番号とスタッフ番号の取得ができませんでした。', 3000);
            return false;
        case null:
            Materialize.toast('ECOMMON01 : 会社番号とスタッフ番号の取得ができませんでした。', 3000);
            return false;
        default:
            self.staff = loginInfoData[0].staffID;
            self.staffName = loginInfoData[0].name;
            self.companyID = loginInfoData[0].companyID;
            self.admCD = loginInfoData[0].admCD;
            localStorage.setItem('staff', loginInfoData[0].staffID);
            localStorage.setItem('companyID', loginInfoData[0].companyID);
    }
    // 会社IDで無料期間を経過しているか、有料会員かの判定をする
    const stopCompanyData = self.database.getProcedures(
        'mappingGetCompanyAuth',
        [
            self.companyID,
            self.today,
        ],
    )
    // 取得ができなかった場合
    switch (stopCompanyData) {
        case false:
            Materialize.toast('ECOMMON02 : 利用可能期間の取得に失敗しました。', 3000);
            return false;
        case null:
            // ライセンス問題なし
            return true
        default:
            Materialize.toast('既に利用可能期間を経過しています。', 3000);
            localStorage.clear();
            return false;
    }
}
//=========================================
// 届出詳細の表示関数
// 引数
// paraSinseiNo :申請ナンバー
// 戻り値  :なし
//=========================================
Init.prototype.sinseiShosaiDraw = function(paraSinseiNo, buttonFlag) {
    const self = this;
    self.paraSinseiNo = paraSinseiNo;
    let html = '';
    $("#listTable").html("");
    const sinseiList = self.master.read(`
    SELECT
        ISNULL(TD.labelName,'打刻修正日') AS labelName,
        SI.taishouDate,
        sinseiSub.endDate,
        SI.sinseiStaffID,
        MK_staff.name AS sinseiName,
        SI.shoninStaffID,
        kanriST.name AS shoninName,
        ISNULL(commitST.name,'') AS commitName,
        ISNULL(SI.sinseiRiyu,'') AS sinseiRiyu,
        SI.shoninFlag,
        ISNULL(SI.sinseiDate,'') AS sinseiDate,
        ISNULL(SI.shoninDate,'') AS shoninDate,
        TD.todokedeName,
        kanriST.email AS kanriMail,
        SI.todokedeID,
        ISNULL(SI.inOffice,'') AS inOffice,
        ISNULL(SI.outOffice,'') AS outOffice,
        ISNULL(SI.restTime,'')AS restTime
    FROM MK_sinsei AS SI
    INNER JOIN MK_staff ON
        SI.companyID = MK_staff.companyID AND
        SI.sinseiStaffID = MK_staff.staffID
    INNER JOIN
    (
        SELECT
            staffID,
            name,email
        FROM MK_staff AS MK_staff_1
        WHERE
            companyID = N'${self.companyID}'
    ) AS kanriST ON
        SI.shoninStaffID=kanriST.staffID
    INNER JOIN
    (
        SELECT
            sinseiNo,
            MAX(taishouDate) AS endDate
        FROM MK_sinsei
        WHERE
            companyID = N'${self.companyID}'
        GROUP BY sinseiNo
    ) AS sinseiSub ON
        SI.sinseiNo = sinseiSub.sinseiNo
    LEFT OUTER JOIN
    (
        SELECT
            staffID,name
        FROM MK_staff AS MK_staff_2
        WHERE
            companyID=N'${self.companyID}'
    ) AS commitST ON
        SI.commitStaffID = commitST.staffID
    LEFT OUTER JOIN MK_todokede AS TD ON
        SI.todokedeID = TD.todokedeID AND
        SI.companyID  = TD.companyID
    WHERE
        SI.sinseiNo ='${paraSinseiNo}' AND
        SI.companyID =N'${self.companyID}'
    ORDER BY
        SI.sinseiNo ASC
    `);
    const inTimeString = "";
    const outTimeString = "";
    const i = 0;
    if (false === self.exception.check(
            sinseiList,
            ExceptionServerOn,
            ExceptionSystemOn,
            "common04",
            "申請データが取得できませんでした。",
            ExceptionParamToMenu,
            self.registerID,
            self.udid
        )) {
        return false;
    }
    const dateLabel = '期間';
    const kaishiDate = sinseiList[i].taishouDate;
    const endDate = sinseiList[i].endDate;
    const inOffice = sinseiList[i].inOffice;
    const outOffice = sinseiList[i].outOffice;
    const restTime = sinseiList[i].restTime;
    const sinseiStaff = sinseiList[i].sinseiStaffID;
    self.nowSinseiStaff = sinseiStaff;
    const sinseiName = sinseiList[i].sinseiName;
    self.nowSinseiName = sinseiName;
    const shoninStaff = sinseiList[i].shoninStaffID;
    self.nowShoninStaff = shoninStaff;
    self.shoninName = sinseiList[i].shoninName;
    self.shoninStaffMail = sinseiList[i].kanriMail;
    const commitStaff = sinseiList[i].commitStaffID;
    let commitName;
    if (commitStaff == "delete_staff") {
        commitName = "削除されたスタッフ";
    } else {
        commitName = sinseiList[i].commitName;
    }
    let sinseiRiyu = sinseiList[i].sinseiRiyu;
    // const kintaiNo = sinseiList[i].kintaiNo;
    const sinseiKubun = sinseiList[i].sinseiKubun;
    const todokedeID = parseInt(sinseiList[i].todokedeID, 10);
    // const todokedeKubun = sinseiList[i].todokedeKubun;
    const shoninFlag = sinseiList[i].shoninFlag;
    self.nowShoninFlag = shoninFlag;
    const sinseiDate = sinseiList[i].sinseiDate;
    const shoninDate = sinseiList[i].shoninDate;
    // const hayadeFlag = sinseiList[i].hayadeFlag;
    // ヘッダータイトルのセット
    let todokedename = sinseiList[i].todokedeName;
    if (todokedename == null) {
        todokedename = "打刻修正";
    }
    self.nowTodokedeName = todokedename;
    $('#sinseiTitle').html(todokedename + '届けの詳細');
    // 確認フラグの判定
    let sinseiStatus = '';
    const todokedeIDDom = ''; // 申請区分のドム
    let tikokuSoutaiDom = ''; // 遅刻届または早退届の時刻
    let officeDom = '';       // 勤務時間のドム
    let restTimeDom = '';     // 休憩時間のドム
    let commitDom = '';       // 確認した人
    let commitDate = '';      // 確認した日付
    if (shoninFlag == '0') {
        // 確認待ちの時
        sinseiStatus = '承認待ち';
    } else if (shoninFlag == '1') {
        sinseiStatus = '承認済み';
        commitDom += `
          <section>
            <p class='labelName'>確認した人</p>
            <p class='kanriName'>${commitName}</p>
          </section>
        `;
        commitDate += `
          <section>
            <p class='labelName'>確認日付</p>
            <p class='hiduke'>
              ${dateToFormatString(new Date(shoninDate), '%M%月%D%日(%w%)')}
            </p>
          </section>
        `;
    } else if (shoninFlag == '2') {
        sinseiStatus = '不承認';
        commitDom += `
        <section>
          <p class='labelName'>確認した人</p>
          <p class='kanriName'>${commitName}</p>
        </section>
      `;
      commitDate += `
        <section>
          <p class='labelName'>確認日付</p>
          <p class='hiduke'>
            ${dateToFormatString(new Date(shoninDate), '%M%月%D%日(%w%)')}
          </p>
        </section>
      `;
    }
    // 届出の日付
    let taishouDate;
    switch(todokedeID){
        case 6:
            //休日出勤
            taishouDate = dateToFormatString(
                new Date(kaishiDate),
                '%M%月%D%日(%w%)'
            ) + "</p>";
        break;
        default :
            if (kaishiDate == endDate) {
                taishouDate = dateToFormatString(
                    new Date(kaishiDate),
                    '%M%月%D%日(%w%)'
                ) + "</p>";
            } else {
                taishouDate =
                    dateToFormatString(
                        new Date(kaishiDate),
                        '%M%月%D%日(%w%)'
                    ) + "～" +
                    dateToFormatString(
                        new Date(endDate),
                        '%M%月%D%日(%w%)'
                    ) + "</p>";
            }
        break;
    }
    
    self.nowTaishouDate = taishouDate;
    let sinseiDom = ''; // 申請した人
    let shoninDom = ''; // 確認する人
    let commandButton = ''; // コマンドボタン
    // 自分で提出した届出の時（ログイン者が申請者であるとき）
    // if (self.staff == sinseiStaff && shoninFlag != '2') {
    if (self.staff == sinseiStaff ) {
        shoninDom += `
            <section>
                <p class='labelName'>確認する人</p>
                <p class='kanriName'>${self.shoninName}</p>
            </section>
        `;
        commandButton = "<a id='torisageButton' class='waves-effect waves-light btn delButton lighten-1'>届出を取り下げる</a>";
    }
    // 自分が受け取った届出の時（ログイン者が確認者であるとき）
    else{
        // if (self.staff == shoninStaff && shoninFlag != '2') {
        if (self.staff == shoninStaff) {
            sinseiDom += `
                <section>
                    <p class='labelName'>申請した人</p>
                    <p class='kanriName'>${sinseiName}</p>
                </section>
            `;
            // commitDom = '';
        } else if (self.admCD == '0') {
            // 全権限者の時は全てを表示する
            sinseiDom += `
            <section>
                <p class='labelName'>申請した人</p>
                <p class='kanriName'>${sinseiName}</p>
            </section>
            <section>
                <p class='labelName'>確認する人</p>
                <p class='kanriName'>${self.shoninName}</p>
            </section>
            `;
        }
        switch(shoninFlag){
            case '0':
                commandButton = "<a id='kakuninButton' class='waves-effect waves-light btn delButton lighten-1'>承認する</a>";
                commandButton += "<a id='rejectButton' class='waves-effect waves-light btn delButton lighten-1'>承認しない</a>";
            break;
            case '1':
                commandButton = "<a id='waitButton' class='waves-effect waves-light btn delButton lighten-1'>確認待ちにする</a>";
                commandButton +="<a id='rejectButton' class='waves-effect waves-light btn delButton lighten-1'>承認しない</a>";
            break;
            case '2':
                commandButton = "<a id='kakuninButton' class='waves-effect waves-light btn delButton lighten-1'>承認する</a>";
                commandButton += "<a id='waitButton' class='waves-effect waves-light btn delButton lighten-1'>確認待ちにする</a>";
            break;
        }
    } 
    switch (todokedeID) {
        //早退届
        case 1:
            tikokuSoutaiDom += `
              <section>
                <p class='labelName'>退勤時刻</p>
                <p class='kanriName'>
                  ${to60(outOffice).hours}:${to60(outOffice).minutes}
                </p>
              </section>
            `;
            break;
            //遅刻届
        case 2:
            tikokuSoutaiDom += `
              <section>
                <p class='labelName'>出勤時刻</p>
                <p class='kanriName'>
                  ${to60(inOffice).hours}:${to60(inOffice).minutes}
                </p>
              </section>
            `;
            break;
            // 早出残業
        case 4:
            officeDom += `
              <section>
                <p class='labelName'>早出残業時間</p>
                <p class='kanriName'>
                  ${to60(inOffice).hours}:${to60(inOffice).minutes}
                    〜
                  ${to60(outOffice).hours}:${to60(outOffice).minutes}
                </p>
              </section>
            `;
            // restTimeDom += `
            //   <section>
            //     <p class='labelName'>時間外休憩</p>
            //     <p class='kanriName'>
            //       ${parseInt(restTime * 60)}分
            //     </p>
            //   </section>
            // `;
            break;
            //普通残業
        case 5:
            officeDom += `
              <section>
                <p class='labelName'>普通残業時間</p>
                <p class='kanriName'>
                  ${to60(inOffice).hours}:${to60(inOffice).minutes}
                    〜
                  ${to60(outOffice).hours}:${to60(outOffice).minutes}
                </p>
              </section>
            `;
            // restTimeDom += `
            //   <section>
            //     <p class='labelName'>時間外休憩</p>
            //     <p class='kanriName'>
            //         ${parseInt(restTime * 60)}分
            //     </p>
            //   </section>
            // `;
            break;
        case 6:
            //休日出勤
            officeDom += `
            <section>
                <p class='labelName'>勤務時間</p>
                <p class='kanriName'>
                ${to60(inOffice).hours}:${to60(inOffice).minutes}
                〜
                ${to60(outOffice).hours}:${to60(outOffice).minutes}
                </p>
                </section>
                `;
            if(sinseiList.length === 2){
                //代休、振休で休暇取得する時
                let holidayType = sinseiList[1].labelName;
                let holidayDate = sinseiList[1].taishouDate;
                holidayDate = dateToFormatString(
                    new Date(holidayDate),
                    '%M%月%D%日(%w%)'
                ) 
                officeDom +=`
                <section>
                    <p class='labelName'>休暇タイプ</p>
                    <p class='kanriName'>
                    ${holidayType}
                    </p>
                </section>
                <section>
                    <p class='labelName'>休暇取得日</p>
                    <p class='kanriName'>
                    ${holidayDate}
                    </p>
                </section>
                `;
            }
        break;
    }
    // 申請理由
    if (sinseiRiyu.indexOf("\n") != -1) {
        sinseiRiyu = sinseiRiyu.replace(/\n/g, "<br>");
    }
    html = `
      <div class='row event'>
      <div class='col s12 m6'>
      <div class='card blue-grey.lighten-5'>
      <div class='card-content black-text'>
      <section>
        <p class='labelName'>ステータス</p>
        <p class='kanriName'>${sinseiStatus}</p>
      </section>
      <section>
        <p class='labelName'>${dateLabel}</p>
        <p class='startEndDate'>${taishouDate}</p>
      </section>
      ${tikokuSoutaiDom}
      ${officeDom}
      ${restTimeDom}
      ${sinseiDom}
      <section>
        <p class='labelName'>提出日</p>
        <p class='hiduke'>
          ${dateToFormatString(
            new Date(sinseiDate),
            '%M%月%D%日(%w%)')
          }
        </p>
      </section>
      ${todokedeIDDom}
      ${shoninDom}
      ${commitDom}
      ${commitDate}
      <section>
        <p class='labelName'>申請の理由</p>
        <p class='kanriName'>${sinseiRiyu}</p>
      </section>
      </div>
      </div>
      </div>
    `;
    if (buttonFlag == true) {
        html += commandButton;
    }
    html += "</div>";
    $("#listTable").append(html);
    // 確認済みの打刻修正依頼の時は取り下げボタン非表示とする
    if (shoninFlag == 1 && sinseiKubun < 3) {
        $("#del" + i).hide();
    } else {
        $("#del" + i).show();
    }
};
//=========================================
// 例外処理の共通処理
// 引数
// paraSinseiNo :申請ナンバー
// exceptionMessage :例外時のメッセージ
// 戻り値  :なし
//=========================================
Init.prototype.exception = function(exceptionFlag, exceptionMessage) {
    switch (exceptionFlag) {
        case false:
            location.href = "exception.html?" +
                "param=2" +
                "&errorMessage=" + exceptionMessage +
                "&registerID=" + self.registerID +
                "&udid=" + self.udid;
            return false;
        case null:
            location.href = "exception.html?" +
                "param=2" +
                "&errorMessage=" + exceptionMessage +
                "&registerID=" + self.registerID +
                "&udid=" + self.udid;
            return false;
        default:
            return true;
    }
};
//=========================================
// バッチのサイレント　通知処理
// 引数
// 
// 
// 戻り値  :なし
//=========================================
Init.prototype.silentPush = function() {
  const self = this;
  // 自分の端末情報の取得
  const tanmatuData = self.master.read(`
      SELECT
          MK_group.groupName,
          MK_staff.staffID,
          MK_smartPhone.registerID,
          MK_smartPhone.idm,
          MK_smartPhone.name
      FROM MK_member
      INNER JOIN MK_staff ON
          MK_staff.staffID=MK_member.memberID AND
          MK_staff.companyID=MK_member.companyID
      INNER JOIN MK_smartPhone ON
          MK_member.memberID=MK_smartPhone.staffID AND
          MK_smartPhone.companyID=MK_member.companyID
      INNER JOIN MK_group ON
          MK_member.groupID=MK_group.groupID AND
          MK_member.companyID=MK_group.companyID
      WHERE
          MK_Staff.staffID=N'${self.staff}' AND
          MK_member.groupID='${self.group}' AND
          MK_member.companyID=N'${self.companyID}' AND
          MK_smartPhone.name<>N'card' AND
          MK_smartPhone.registerID<>N'' AND
          MK_smartPhone.registerID<>N'logout' AND
          MK_smartPhone. registerID IS NOT NULL
  `);
  if (false === self.exception.check(
          tanmatuData,
          ExceptionServerOn,
          ExceptionSystemOn,
          "common05",
          "自分の端末情報の取得に失敗しました。",
          ExceptionParamToMenu
      )) {
      return false;
  }
  const regData = [];
  const nameData = [];
  // 自分の通知情報を配列に入れていく
  for (let i in tanmatuData) {
      regData.push(tanmatuData[i].registerID);
      nameData.push(tanmatuData[i].name);
  }
  commonPushFunc(
      '',
      regData,
      self.companyID,
      self.staff,
      'バッチの更新',
      '',
      self.group,
      nameData,
      true
  );
}