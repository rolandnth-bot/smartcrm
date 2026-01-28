<?php
/**
 * Create Lead API
 * POST /api/leads
 */
$data = getRequestBody();

$name = sanitize($data['name'] ?? '');
$email = sanitize($data['email'] ?? '');
$phone = sanitize($data['phone'] ?? '');
$source = sanitize($data['source'] ?? 'website');
$status = sanitize($data['status'] ?? 'new');
$rating = sanitize($data['rating'] ?? 'warm');
$notes = sanitize($data['notes'] ?? '');
$apartment_interest = sanitize($data['apartment_interest'] ?? '');
$budget = sanitize($data['budget'] ?? '');
$assigned_to = sanitize($data['assigned_to'] ?? '');

if (empty($name)) {
    jsonResponse(['error' => 'Név megadása kötelező'], 400);
}

$db = getDB();
$id = generateUUID();

$stmt = $db->prepare("
    INSERT INTO leads (
        id, name, email, phone, source, status, rating,
        notes, apartment_interest, budget, assigned_to, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
");

$stmt->execute([
    $id, $name, $email, $phone, $source, $status, $rating,
    $notes, $apartment_interest, $budget, $assigned_to
]);

jsonResponse(['id' => $id, 'message' => 'Lead sikeresen létrehozva'], 201);
