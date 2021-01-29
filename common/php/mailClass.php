<?php

class Mail
{
    /**
     * メール送信
     *
     * @access public
     * @param  string $to
     * @param  string $subject
     * @param  string $message
     * @param  string $from
     * @param  string $cc
     * @return [type]        [description]
     */
    public function sent($to, $subject, $message, $from = '', $cc = '')
    {
        $headers = [];
        if (!empty($from)) {
            $headers[] = "From: {$from}";
        }
        if (!empty($cc)) {
            $headers[] = "Cc: {$cc}";
        }
        return mb_send_mail($to, $subject, $message, implode("\r\n", $headers));
    }
}
