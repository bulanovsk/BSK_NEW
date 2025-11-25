<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Функция для чтения кода из файла
function readCodeFromFile() {
    $filename = 'codes.json';
    
    if (!file_exists($filename)) {
        return ['success' => false, 'message' => 'Файл с кодами не найден'];
    }
    
    $content = file_get_contents($filename);
    if ($content === false) {
        return ['success' => false, 'message' => 'Ошибка чтения файла'];
    }
    
    $data = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['success' => false, 'message' => 'Ошибка формата файла'];
    }
    
    return ['success' => true, 'data' => $data];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';
    
    // Чтение сохраненного кода
    $result = readCodeFromFile();
    
    if (!$result['success']) {
        echo json_encode($result);
        exit;
    }
    
    $savedData = $result['data'];
    $savedEmail = $savedData['email'] ?? '';
    $savedCode = $savedData['code'] ?? '';
    $timestamp = $savedData['timestamp'] ?? 0;
    
    // Проверка времени (10 минут)
    if ((time() - $timestamp) > 600) {
        echo json_encode(['success' => false, 'message' => 'Код устарел']);
        exit;
    }
    
    if ($email === $savedEmail && $code === $savedCode) {
        echo json_encode(['success' => true, 'message' => 'Код подтвержден']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Неверный код']);
    }
}
?>