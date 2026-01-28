<?php
/**
 * Get User API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("SELECT id, email, name, role, phone, company_name, tax_number, address, bank_account, status, created_at FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

if (!$user) jsonResponse(['error' => 'Felhasználó nem található'], 404);
jsonResponse(['user' => $user]);
