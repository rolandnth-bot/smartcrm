<?php
/**
 * Update Lead API
 * PUT /api/leads/{id}
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) {
    jsonResponse(['error' => 'ID megadása kötelező'], 400);
}

$data = getRequestBody();

$db = getDB();

// Ellenőrizzük, hogy létezik-e a lead
$checkStmt = $db->prepare("SELECT id FROM leads WHERE id = ?");
$checkStmt->execute([$id]);
if (!$checkStmt->fetch()) {
    jsonResponse(['error' => 'Lead nem található'], 404);
}

// Frissítendő mezők
$allowedFields = [
    'name', 'email', 'phone', 'source', 'status', 'rating',
    'notes', 'apartment_interest', 'budget', 'assigned_to'
];

$updates = [];
$params = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $updates[] = "`{$field}` = ?";
        $params[] = sanitize($data[$field]);
    }
}

if (empty($updates)) {
    jsonResponse(['error' => 'Nincs frissítendő mező'], 400);
}

$updates[] = "`updated_at` = NOW()";
$params[] = $id;

$query = "UPDATE leads SET " . implode(', ', $updates) . " WHERE id = ?";
$stmt = $db->prepare($query);
$stmt->execute($params);

jsonResponse(['message' => 'Lead sikeresen frissítve']);
