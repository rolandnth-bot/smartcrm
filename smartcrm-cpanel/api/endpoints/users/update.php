<?php
/**
 * Update User API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$data = getRequestBody();
$db = getDB();

$fields = []; $params = [];
$allowed = ['name', 'phone', 'company_name', 'tax_number', 'address', 'bank_account', 'status', 'role'];
foreach ($allowed as $f) { if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = sanitize($data[$f]); }}
if (!empty($data['password'])) { $fields[] = "password = ?"; $params[] = password_hash($data['password'], PASSWORD_DEFAULT); }

if ($fields) { $params[] = $id; $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params); }
jsonResponse(['success' => true]);
