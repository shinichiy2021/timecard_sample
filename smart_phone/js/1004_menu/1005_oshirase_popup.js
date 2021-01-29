"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/04/13 yamazaki メニューのポップアップ処理を分離しました。
//******************************************************************************
MainClass1004.prototype.oshirasePopup = async function() {
    const self = this;
    //////////////////////////////////////////////
    // モーダルエリアの表示
    //////////////////////////////////////////////
    // イベントナンバー  eventNO 隠し要素として使用する
    let eventNo = 0;
    // イベント種別   緊急情報 通常情報
    let $title = '';
    // イベントタイトル
    let subTitle = '';
    // イベントの詳細
    let $mark = '';
    let detailNr = 0;
    //-------------------------------------------
    // お知らせの情報を取得する
    // 2017/08/10 新屋 お知らせの未読のみの抽出条件追加
    // マッピング情報1
    //-------------------------------------------
    let oshiraseData = null
    await self.database.getFetch(
        'mappingGetEventInfo',
        [
            self.companyID,
            self.staff,
            self.today,
        ],
    ).then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            oshiraseData = data
        })
        .catch(() => {
            Materialize.toast('E100501 : お知らせの情報の取得に失敗しました。', 3000);
            oshiraseData = false
        })
    // 取得ができなかった場合
    switch (oshiraseData) {
        case false:
            return false;
        case null:
            // お知らせリストが１件もない場合
            // ポップアップは表示しない
            break
        default:
            self.nrCount = oshiraseData.length;
            for (let i in oshiraseData) {
                eventNo = oshiraseData[i].eventNo;
                subTitle = oshiraseData[i].subTitle;
                // バイト数にて不要部分を削除
                subTitle = byteSubstr(subTitle, 24, "...");
                let note = oshiraseData[i].note;
                // 改行コードを含む場合<br>に変換する
                if (note.indexOf("\n") != -1) {
                    note = note.replace(/\n/g, "<br>");
                }
                const noteBond = note;
                // 掲載期限
                const dateKigen = new Date(oshiraseData[i].keisaiKigen);
                // 作成者
                const name = oshiraseData[i].name;
                // 既読・未読フラグ  noReadFlag  赤マルの表示で使用する
                const flag = oshiraseData[i].flag;
                if (flag == "0" || flag == "2") {
                    $mark = "<p class='redCircle'>●</p>";
                    detailNr += 1;
                } else {
                    $mark = "";
                }
                if (flag == "1" && oshiraseData[i].title == "通常情報") {
                    $title = "<p class='new'></p>";
                } else if ((flag == "0" && oshiraseData[i].title == "通常情報") || (flag == "2" && oshiraseData[i].title == "通常情報")) {
                    $title = "<p class='new'></p>";
                } else {
                    $title = "<p class='emergency'>緊急情報</p>";
                }
                const getHtml = _.template(self.sel("#popup").html())({
                    $maru: $mark + $title,
                    subTitle: subTitle,
                    eventNo: eventNo,
                    noteBond: noteBond,
                    keisaiKigen: dateToFormatString(dateKigen, '%YYYY%年%M%月%D%日'),
                    sakuseisha: name
                });
                self.sel("#info-in").append(getHtml);
            }
    }
    //-------------------------------------------
    // お知らせの未読数の初期表示
    //-------------------------------------------
    // お知らせの未読が有る時
    if (detailNr >= 100) {
        detailNr = 99;
    }
    if (detailNr > 0) {
        const getHtml = _.template(self.sel("#badge").html())({
            className: "red",
            badgeCount: detailNr
        });
        self.sel("#detailIcon").append(getHtml);
        self.sel("#modal1").modal('open');
    } else {
        self.sel("#modal1").modal('close');
    }
    //****************************************//
    // 詳しく見るクリックイベント
    //***************************************//
    self.ev('click', '.collapsible-header', function() {
        // 赤丸表示の場合、赤丸を消す。
        const maru = $(this).parents(".event").find(".redCircle").html();
        if (maru == "●") {
            // 赤丸ボタンの削除
            $(this).parents(".event").find(".redCircle").empty();
            // イベントナンバーの取得
            const eventNo = $(this).find(".eventNo").val();
            // フラグが0の時アップデート、2の時インサートする。
            //----------------------------------------------
            // 2018/04/17
            // nishio
            // マッピング情報3
            // 既読処理アップデート
            //----------------------------------------------
            self.database.putFetch(
                'mappingPutHistoryEvent',
                [
                    self.companyID,
                    self.staff,
                    '2',
                    eventNo,
                ],
            ).then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                })
                .catch(() => {
                    Materialize.toast('E100502 : 既読処理アップデートに失敗しました。', 3000);
                })
            // 未読情報を開いた時、お知らせボタンのバッジの数を減らす
            let deBadgeCount = self.nrCount;
            if (deBadgeCount >= 1) {
                deBadgeCount = parseInt(deBadgeCount, 10) - 1;
                self.nrCount = deBadgeCount;
                // 未読履歴情報の取得と画面への反映
                // お知らせの未読が有る時
                if (deBadgeCount >= 100) {
                    deBadgeCount = 99;
                } else if (deBadgeCount > 0) {
                    const getHtml = _.template(self.sel("#badge").html())({
                        className: "red",
                        badgeCount: deBadgeCount
                    });
                    self.sel("#detailIcon").append(getHtml);
                } else {
                    self.sel("#detailIcon").remove();
                }
            }
        }
        // 詳しく見るを表示しない。
        const strBrows = $(this).parents(".event").find(".brows").html();
        if (strBrows == "詳しく見る▼") {
            $(this).parents(".event").find(".brows").html("表示を戻す▲");
        } else {
            $(this).parents(".event").find(".brows").html("詳しく見る▼");
        }
    });
    return true;
};