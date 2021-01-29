<?php

//******************************************************************************
// ファイルの変更履歴をここに記入してください。
//
// 2017/08/03 yamazaki ヘッダーに変更履歴を追加しました。
//******************************************************************************

// canvasデータがPOSTで送信されてきた場合
$canvas = $_POST["image"];
$filePass = $_POST["filePass"];
$fileName = $_POST["fileName"];

// ヘッダに「data:image/png;base64,」が付いているので、それは外す
$canvas = preg_replace("/data:[^,]+,/i","",$canvas);

// 残りのデータはbase64エンコードされているので、デコードする
$canvas = base64_decode($canvas);

$image = imagecreatefromstring($canvas);


if ($image) {
    $percent = 0.25;

    // Content type
    header('Content-Type: image/jpeg');

    $width = imagesx($image);
    $height = imagesy($image);
    $newwidth = $width * $percent;
    $newheight = $height * $percent;

    $thumb = imagecreatetruecolor($newwidth, $newheight);

    // Resize
    imagecopyresized($thumb, $image, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

    // 画像として保存（ディレクトリは任意）
    imagepng(
      $image ,
      "C://Inetpub/vhosts//httpdocs/".$filePass.$fileName.".jpeg"
    );
    imagepng(
      $thumb ,
      "C://Inetpub/vhosts//httpdocs/".$filePass.$fileName."_min.jpeg"
    );
} else {
    echo 'エラーが発生しました。';
    die('Image Update Error.');
}
?>