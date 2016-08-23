<?php
/**
 * @Author: dabeen
 * @Date:   2016-08-12 15:27:09
 * @Last Modified by:   dabeen
 * @Last Modified time: 2016-08-12 15:30:46
 */

$token = $playerData->getToken($uid);
// $token = '10dddc1643b31d98caf0d02ad497c641';
$iv = 'qwdsgetnjiryowyx';
$message = base64_decode($_POST['gs']);
// $message = base64_decode('XAnBfcDqR8Zm6vxxxMbGNOWzlDVjvCTQ8ECylVtXYPg=');
try {
    // 解码得到返回的json
    $decode = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $token, $message, MCRYPT_MODE_CBC, $iv);
}
catch(e) {
    
}