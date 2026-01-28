<?php
/**
 * Update Worker API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$data = getRequestBody();
$db = getDB();

$fields = [];
$params = [];

$allowedFields = ['name', 'phone', 'email', 'hourly_rate', 'textile_rate', 'status', 'notes'];
foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $fields[] = "{$field} = ?";
        $params[] = in_array($field, ['hourly_rate', 'textile_rate']) ? (int)$data[$field] : sanitize($data[$field]);
    }
}

if (empty($fields)) jsonResponse(['error' => 'Nincs frissítendő adat'], 400);

$params[] = $id;
$sql = "UPDATE workers SET " . implode(', ', $fields) . " WHERE id = ?";
$stmt = $db->prepare($sql);
$stmt->execute($params);

jsonResponse(['success' => true, 'message' => 'Dolgozó sikeresen frissítve']);
