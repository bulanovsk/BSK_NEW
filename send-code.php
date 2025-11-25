<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $code = $input['code'] ?? '';

    if (!$email || empty($code)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Неверные данные']);
        exit;
    }

    // Настройки email
    $to = $email;
    $subject = 'Код подтверждения для восстановления пароля';
    $message = "
        <html>
        <head>
            <title>Код подтверждения</title>
        </head>
        <body>
            <h2>Восстановление пароля</h2>
            <p>Ваш код подтверждения: <strong>$code</strong></p>
            <p>Код действителен в течение 10 минут.</p>
        </body>
        </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: no-reply@yourdomain.com',
        'Reply-To: no-reply@yourdomain.com'
    ];

    // Отправка email
    if (mail($to, $subject, $message, implode("\r\n", $headers))) {
        error_log("Код $code отправлен на $email");
        echo json_encode(['success' => true, 'message' => 'Код отправлен']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Ошибка отправки email']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
// Функция отправки кода через Node.js сервер
async function sendCode(email, code) {
    console.log('Отправка запроса на сервер...', { email, code });

    try {
        const response = await fetch('http://localhost:3000/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                code: code
            })
        });

        console.log('Статус ответа:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Ответ сервера:', result);
        
        return result;
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        throw error;
    }
}