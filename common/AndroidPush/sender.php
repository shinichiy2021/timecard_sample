<?php

$deviceToken = $_GET["registerID"];//APA91bG94SDlHjyt8wL8P4COR6vzQ3Ft_92Z6zOGxwP18wrVYyeaKniCvmqxwESF5ltNO-xaUOgMHCOh4uoltt1oWyu7BEsE_pkR_ihlSLRAVSrivBV-AxUdWf2sNU8xwNyPcvdPUxgpmyXJd2n_ip6C1yySlXu0fw";
$messageText = $_GET["IDm"];   //"勤怠管理くんからのお知らせです。";
$titleText   = $_GET["titleText"];
$mode        = $_GET["mode"];

$api_key  = "AIzaSyBMaqVhRkCiF8zQIazQy9WPFW-QOX75SLs";
$base_url = "https://fcm.googleapis.com/fcm/send";

// toに指定しているのはトピック名:testに対して一括送信するという意味
// 個別に送信したい場合はここに端末に割り振られたトークンIDを指定する
$data = array(
     "to"           => $deviceToken
    ,"priority"     => "high"
    ,"data" => array(
                             "title" => "GAIA"
                            ,"titleText" => $titleText
                            ,"mode"    => $mode
                            ,"message" => $messageText,
    )
);
$header = array(
     "Content-Type:application/json"
    ,"Authorization:key=".$api_key
);
$context = stream_context_create(array(
    "http" => array(
         'method' => 'POST'
        ,'header' => implode("\r\n",$header)
        ,'content'=> json_encode($data)
    )
));
file_get_contents($base_url,false,$context);

?>




