<?php
/**
 * Register API (Partner regisztráció)
 */
$data = getRequestBody();

// Validáció
$required = ['email', 'password', 'name', 'phone'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        jsonResponse(['error' => "A(z) {$field} mező kötelező"], 400);
    }
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Érvénytelen email cím'], 400);
}

if (strlen($data['password']) < 6) {
    jsonResponse(['error' => 'A jelszó minimum 6 karakter'], 400);
}

$db = getDB();

// Email ellenőrzés
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'Ez az email cím már regisztrálva van'], 409);
}

// Felhasználó létrehozása
$userId = generateUUID();
$hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

$stmt = $db->prepare("
    INSERT INTO users (id, email, password, name, phone, company_name, tax_number, address, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'partner', 'pending')
");

$stmt->execute([
    $userId,
    $data['email'],
    $hashedPassword,
    sanitize($data['name']),
    sanitize($data['phone']),
    sanitize($data['company_name'] ?? ''),
    sanitize($data['tax_number'] ?? ''),
    sanitize($data['address'] ?? '')
]);

jsonResponse([
    'success' => true,
    'message' => 'Sikeres regisztráció! A fiók jóváhagyásra vár.',
    'user_id' => $userId
], 201);
