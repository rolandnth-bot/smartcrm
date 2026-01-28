<?php
/**
 * Create Worker API
 */
$data = getRequestBody();

if (empty($data['name'])) {
    jsonResponse(['error' => 'A név megadása kötelező'], 400);
}

$db = getDB();
$workerId = generateUUID();

$stmt = $db->prepare("
    INSERT INTO workers (id, name, phone, email, hourly_rate, textile_rate, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
");

$stmt->execute([
    $workerId,
    sanitize($data['name']),
    sanitize($data['phone'] ?? ''),
    sanitize($data['email'] ?? ''),
    (int)($data['hourly_rate'] ?? 2500),
    (int)($data['textile_rate'] ?? 600),
    sanitize($data['notes'] ?? '')
]);

jsonResponse([
    'success' => true,
    'id' => $workerId,
    'message' => 'Dolgozó sikeresen létrehozva'
], 201);
