<?php
/**
 * Create User API
 */
$data = getRequestBody();
if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
    jsonResponse(['error' => 'Email, jelszó és név megadása kötelező'], 400);
}

$db = getDB();
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
if ($stmt->fetch()) jsonResponse(['error' => 'Ez az email már regisztrálva van'], 409);

$userId = generateUUID();
$stmt = $db->prepare("INSERT INTO users (id, email, password, name, role, phone, company_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
$stmt->execute([$userId, $data['email'], password_hash($data['password'], PASSWORD_DEFAULT), sanitize($data['name']), $data['role'] ?? 'partner', sanitize($data['phone'] ?? ''), sanitize($data['company_name'] ?? '')]);

jsonResponse(['success' => true, 'id' => $userId], 201);
