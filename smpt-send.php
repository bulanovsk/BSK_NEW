<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Установите PHPMailer через Composer

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? sprintf('%06d', mt_rand(1, 999999));
    
    $mail = new PHPMailer(true);
    
    try {
        // Настройки SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.yandex.ru'; // Или smtp.gmail.com и т.д.
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@yandex.ru';
        $mail->Password = 'your-password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        
        // Отправитель и получатель
        $mail->setFrom('your-email@yandex.ru', 'bsk');
        $mail->addAddress($email);
        
        // Содержание письма
        $mail->isHTML(true);
        $mail->Subject = 'Код подтверждения для bsk';
        $mail->Body = "
            <h2>Код подтверждения: <strong style='color: #ff1493;'>$code</strong></h2>
            <p>Используйте этот код для восстановления пароля.</p>
            <p><small>Код действителен 10 минут</small></p>
        ";
        
        $mail->send();
        
        // Сохраняем код
        file_put_contents('codes.json', json_encode([
            'email' => $email, 
            'code' => $code, 
            'timestamp' => time()
        ]));
        
        echo json_encode(['success' => true, 'message' => 'Код отправлен']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $mail->ErrorInfo]);
    }
}
?>