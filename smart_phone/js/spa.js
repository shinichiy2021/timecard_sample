// 『strictモード』でJavaScriptを実行させます。
"use strict";
//********************************************************************
// ファイルの変更履歴をここに記入してください。
// 2018/08/14 yamazaki シングル・ページ・アプリケーション用のファイルを新規作成しました
//********************************************************************
function loadingOn() {
    var loader = $('.loader-wrap');
    //ページの読み込みが完了したらアニメーションを非表示
    loader.fadeIn();
}
function loadingOff() {
    var loader = $('.loader-wrap');
    //ページの読み込みが完了したらアニメーションを非表示
    loader.fadeOut();
    //ページの読み込みが完了してなくても3秒後にアニメーションを非表示にする
    setTimeout(function(){
        loader.fadeOut();
    },3000);
}
function spaHash(hashID, carousel) {
    sessionStorage.setItem('carousel', carousel);
    sessionStorage.setItem('nativeSeni', 'true');
    location.hash = hashID;
    loadingOn();
}
$(document).ready(function() {
    let viewArray = [];
    let prevViewID = ''
    function getView(views, key) {
        return views.filter(function(e) {
            return e.url == key;
        })[0] || null;
    }
    function viewDraw($nextView) {
        // テンプレートのDOMを追加する
        for (let i in $nextView.$template) {
            $nextView.$template[i].appendTo($(".view" + $nextView.url));
        }
        // ページごとの定型の処理
        if ($nextView.mainClass.maeShori() == false) {
            // エラーが発生した時、以下の処理を行わない
            return false;
        }
        if ($nextView.mainClass.checkGetData() == false) {
            // エラーが発生した時、以下の処理を行わない
            return false;
        }
        if ($nextView.mainClass.initShow() == false) {
            // エラーが発生した時、以下の処理を行わない
            return false;
        }
        if ($nextView.mainClass.atoShori() == false) {
            // エラーが発生した時、以下の処理を行わない
            return false;
        }
        if ($nextView.mainClass.event() == false) {
            // エラーが発生した時、以下の処理を行わない
            return false;
        }
    }
    function urlChangeHandler() {
        const carousel = sessionStorage.getItem('carousel');
        const viewID = parseUrl(location.hash);
        const $prevView = $("[data-role='view']").filter(":visible");
        const $nextView = getView(viewArray, viewID);
        if (0 < $prevView.length) {
            // timer処理の初期化
            const prevClass = getView(viewArray, prevViewID);
            clearInterval(prevClass.mainClass.timer)
            //
            const ua = navigator.userAgent;
            const nativeSeni = sessionStorage.getItem('nativeSeni');
            let userAgent = '';
            if (ua.indexOf('Android') > 0) {
                // 端末がAndroidの時
                userAgent = 'Android';
            } else {
                // 端末がiPhoneの時
                userAgent = 'iPhone';
            }
            if ('Android' == userAgent || 'true' == nativeSeni) {
                if ('normal' == carousel) {
                    $prevView
                        .removeClass('view-show view-show-reverse view-hide view-hide-reverse')
                        .addClass('view-hide')
                        .off().on('webkitAnimationEnd', function() {
                            $(this).detach();
                            $nextView.$el.find('#slide-out').show();
                        });
                    $prevView.find('#slide-out').hide();
                    $nextView.$el
                        .css({
                            'position': 'absolute',
                            'top': '0'
                        })
                        .removeClass('view-show view-show-reverse view-hide view-hide-reverse')
                        .appendTo('article')
                        .addClass('view-show')
                        .off().on('webkitAnimationEnd', function() {
                            loadingOff();
                        });
                } else {
                    $prevView
                        .removeClass('view-show view-show-reverse view-hide view-hide-reverse')
                        .addClass('view-hide-reverse')
                        .off().on('webkitAnimationEnd', function() {
                            $(this).detach();
                            $nextView.$el.find('#slide-out').show();
                        });
                    $prevView.find('#slide-out').hide();
                    $nextView.$el
                        .css({
                            'position': 'absolute',
                            'top': '0'
                        })
                        .removeClass('view-show view-show-reverse view-hide view-hide-reverse')
                        .appendTo('article')
                        .addClass('view-show-reverse')
                        .off().on('webkitAnimationEnd', function() {
                            loadingOff();
                        });
                }
            } else {
                $prevView
                .removeClass('view-show view-show-reverse view-hide view-hide-reverse')
                .detach();
                $prevView.find('#slide-out').hide();
                $nextView.$el
                    .css({
                        'position': 'absolute',
                        'top': '0'
                    })
                    .removeClass('view-show view-show-reverse view-hide view-hide-reverse')
                    .appendTo('article')
                    .off().on('webkitAnimationEnd', function() {
                        loadingOff();
                    });
            }
            // 次の画面の描画 
            viewDraw($nextView);
        } else {
            $nextView.$el.appendTo('article');
            viewDraw($nextView);
        }
        prevViewID = viewID
    }

    function parseUrl(url) {
        return url.slice(1) || 10011;
    }

    function start() {
        $(window)
            .on("hashchange", urlChangeHandler)
            .trigger('hashchange');
    }

    function creatShowFunc(path) {
        let $content;
        $.ajax({
            url: path,
            dataType: 'html',
            async: false,
            // cache: false,
            success: function(d) {
                $content = $(d).find("[data-role=view]");
            }
        });
        return $content;
    }

    function creatTemplate(path) {
        let $content;
        $.ajax({
            url: path,
            dataType: 'html',
            async: false,
            // cache: false,
            success: function(d) {
                $content = $(d).find("[type='text/template']");
            }
        });
        return $content;
    }

    function init() {
        // 仕様書_10011_ログイン（webview）
        viewArray.push(
            new viewFactory(
                '10011',
                creatShowFunc('1001_1_login.html', $('article')),
                [],
                new MainClass10011()
            )
        );
        // 仕様書_10012_ログイン（webview）
        viewArray.push(
            new viewFactory(
                '10012',
                creatShowFunc('1001_2_start_entry.html', $('article')),
                [],
                new MainClass10012()
            )
        );
        // 仕様書_1002_ログイン再申請
        viewArray.push(
            new viewFactory(
                '1002',
                creatShowFunc('1002_account_request.html', $('article')),
                [],
                new MainClass1002()
            )
        );
        // 仕様書_1004_メニュー
        viewArray.push(
            new viewFactory(
                '1004',
                creatShowFunc('1004_menu.html', $('article')), [
                    creatTemplate('../viewTemplate/badge.html'),
                    creatTemplate('../viewTemplate/oshirase.html')
                ],
                new MainClass1004()
            )
        );
        // 仕様書_1006_お知らせ_一覧
        viewArray.push(
            new viewFactory(
                '1006',
                creatShowFunc('1006_oshirase.html', $('article')),
                [
                    creatTemplate('../viewTemplate/oshirase_list.html')
                ],
                new MainClass1006()
            )
        );
        // 仕様書_1007_お知らせ_新規_編集
        viewArray.push(
            new viewFactory(
                '1007',
                creatShowFunc('1007_oshirase_edit.html', $('article')),
                [],
                new MainClass1007()
            )
        );
        // 仕様書_1008_お知らせ_未読者リスト
        viewArray.push(
            new viewFactory(
                '1008',
                creatShowFunc('1008_oshirase_midoku.html', $('article')),
                [],
                new MainClass1008()
            )
        );
        // 仕様書_1009_申請リスト
        viewArray.push(
            new viewFactory(
                '1009',
                creatShowFunc('1009_sinsei.html', $('article')),
                [
                    creatTemplate('../viewTemplate/sinsei_list.html')
                ],
                new MainClass1009()
            )
        );
        // 仕様書_1010_申請詳細
        viewArray.push(
            new viewFactory(
                '1010',
                creatShowFunc('1010_sinsei_detail.html', $('article')),
                [],
                new MainClass1010()
            )
        );
        // 仕様書_1011_申請_新規追加
        viewArray.push(
            new viewFactory(
                '1011',
                creatShowFunc('1011_sinsei_entry.html', $('article')),
                [],
                new MainClass1011()
            )
        );
        // 仕様書_1012_個人タイムカード
        viewArray.push(
            new viewFactory(
                '1012',
                creatShowFunc('1012_kintai_edit.html', $('article')),
                [],
                new MainClass1012()
            )
        );
        // 仕様書_1013_やることリスト
        viewArray.push(
            new viewFactory(
                '1013',
                creatShowFunc('1013_todo_list.html', $('article')),
                [],
                new MainClass1013()
            )
        );
        // 仕様書_1014_やること詳細
        viewArray.push(
            new viewFactory(
                '1014',
                creatShowFunc('1014_todo.html', $('article')),
                [],
                new MainClass1014()
            )
        );
        // 仕様書_1015_やること編集
        viewArray.push(
            new viewFactory(
                '1015',
                creatShowFunc('1015_todo_edit.html', $('article')),
                [],
                new MainClass1015()
            )
        );
        // 仕様書_1016_仲間と会話_一覧
        viewArray.push(
            new viewFactory(
                '1016',
                creatShowFunc('1016_chat_group.html', $('article')),
                [],
                new MainClass1016()
            )
        );
        // 仕様書_1017_チャットログ
        viewArray.push(
            new viewFactory(
                '1017',
                creatShowFunc('1017_chat_log.html', $('article')),
                [],
                new MainClass1017()
            )
        );
        // 仕様書_1018_仲間と会話_新規・編集
        viewArray.push(
            new viewFactory(
                '1018',
                creatShowFunc('1018_chat_group_edit.html', $('article')),
                [],
                new MainClass1018()
            )
        );
        // 仕様書_1019_メンバーリスト
        viewArray.push(
            new viewFactory(
                '1019',
                creatShowFunc('1019_member.html', $('article')),
                [],
                new MainClass1019()
            )
        );
        // 仕様書_1021_個人設定_確認
        viewArray.push(
            new viewFactory(
                '1021',
                creatShowFunc('1021_settei.html', $('article')),
                [],
                new MainClass1021()
            )
        );
        // 仕様書_1022_個人設定_修正
        viewArray.push(
            new viewFactory(
                '1022',
                creatShowFunc('1022_settei_edit.html', $('article')),
                [],
                new MainClass1022()
            )
        );
        // 仕様書_1024_社長FAX
        viewArray.push(
            new viewFactory(
                '1024',
                creatShowFunc('1024_fax_details.html', $('article')),
                [],
                new MainClass1024()
            )
        );
        start();
    }
    init();
    loadingOff();
});