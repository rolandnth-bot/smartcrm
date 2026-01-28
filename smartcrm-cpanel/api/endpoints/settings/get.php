<?php
/**
 * Get Settings API
 */
$db = getDB();

$stmt = $db->query("SELECT setting_key, setting_value FROM settings");
$rows = $stmt->fetchAll();

$settings = [];
foreach ($rows as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}

jsonResponse(['settings' => $settings]);
