<?php
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'PHP работает корректно!',
    'timestamp' => time()
]);
?>