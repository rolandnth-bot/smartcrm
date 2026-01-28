<?php
/**
 * Login API
 */
$data = getRequestBody();

if (empty($data['email']) || empty($data['password'])) {
    jsonResponse(['error' => 'Email és jelszó megadása kötelező'], 400);
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND status = 'active' LIMIT 1");
$stmt->execute([$data['email']]);
$user = $stmt->fetch();

if (!$user || !password_verify($data['password'], $user['password'])) {
    jsonResponse(['error' => 'Hibás email vagy jelszó'], 401);
}

// Session indítása
session_start();
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_role'] = $user['role'];
$_SESSION['user_name'] = $user['name'];

// Token generálás
$token = bin2hex(random_bytes(32));

unset($user['password']);
jsonResponse([
    'success' => true,
    'user' => $user,
    'token' => $token
]);
