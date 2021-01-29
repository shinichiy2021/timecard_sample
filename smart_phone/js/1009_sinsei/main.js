"use strict";
//******************************************************************************
// ファイルの変更履歴をここに記入してください。
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
// 2017/08/10 yamazaki 遷移先の新規届出画面にgamenIDの引き渡し処理を追加しました。
// 2017/08/21 yamazaki 戻るボタンを追加しました（メニューへ）
//******************************************************************************
MainClass1009.prototype.event = function() {
    let sinseiWhereFlag = 0;    // 初期表示はすべて
    let dateOrderByFlag = 1;    // 初期表示は新しい順
    //*************************************
    // ナビゲーションバーの絞り込みイベント処理
    //*************************************
    this.ev('click', '#toSinsei', () => {
        // 選択の解除
        this.sel('#slide-out li.search a').css('background', 'white');
        this.sel('#toSinsei').css('background', '#e4e7fd');
        sinseiWhereFlag = 1;
        this.listDisplay(
            sinseiWhereFlag,
            dateOrderByFlag
        );
    });
    this.ev('click', '#fromSinsei', () => {
        // 選択の解除
        this.sel('#slide-out li.search a').css('background', 'white');
        this.sel('#fromSinsei').css('background', '#e4e7fd');
        sinseiWhereFlag = 2;
        this.listDisplay(
            sinseiWhereFlag,
            dateOrderByFlag
        );
    });
    this.ev('click', '#allSinsei', () => {
        // 選択の解除
        this.sel('#slide-out li.search a').css('background', 'white');
        this.sel('#allSinsei').css('background', '#e4e7fd');
        sinseiWhereFlag = 3;
        this.listDisplay(
            sinseiWhereFlag,
            dateOrderByFlag
        );
    });
    this.ev('click', '#default', () => {
        // 選択の解除
        this.sel('#slide-out li.search a').css('background', 'white');
        this.sel('#default').css('background', '#e4e7fd');
        sinseiWhereFlag = 0;
        this.listDisplay(
            sinseiWhereFlag,
            dateOrderByFlag
        );
    });
    //***********************************************//
    // クリックイベント（新規追加画面遷移）
    //***********************************************//
    this.ev('click', '#new', () => {
        // 2017/08/10 yamazaki 遷移先の新規届出画面にgamenIDの引き渡し処理を追加しました。
        sessionStorage.setItem('gamenID', '申請');
        spaHash('#1011', 'normal');
        return false;
    });
    // 2017/08/21 yamazaki 戻るボタンを追加しました（メニューへ）
    // 戻るボタンが押された時
    function back() {
        spaHash('#1004', 'reverse');
        return false;
    }
    // addFlick()(back);
    this.ev('click', '#back', back);
    //***********************************************//
    // 確認済み表示ボタンの押下処理
    //***********************************************//
    let compFlag = false;
    this.ev('click', '#switchBtn', () => {
        // 再取得
        if (compFlag == false) {
            // 確認済みを開く
            this.sel("#compList").show();
            this.sel("#switchBtn").val("処理済みを非表示にする");
            compFlag = true;
        } else {
            // 確認済みを閉じる
            this.sel("#compList").hide();
            this.sel("#switchBtn").val("処理済みを表示する");
            compFlag = false;
        }
    });
    //***********************************************//
    // リストが選択された時（未完了、完了分の両方）
    //***********************************************//
    this.ev('click', '.list tr', function() {
        // trのクラスを取得して、申請年でなければ画面遷移する
        const className = $(this).attr('class');
        if (className != "sinseiYear") {
            // 引き継ぎ情報の引き渡し
            sessionStorage.setItem('sinseiNo', $(this).find('.kakusi').val());
            spaHash('#1010', 'normal');
            return false;
        }
        return false;
    });
};