<?php
/**
 * Update Settings API
 */
$data = getRequestBody();
$db = getDB();

$stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

foreach ($data as $key => $value) {
    $stmt->execute([sanitize($key), sanitize($value)]);
}

jsonResponse(['success' => true, 'message' => 'Beállítások sikeresen mentve']);
