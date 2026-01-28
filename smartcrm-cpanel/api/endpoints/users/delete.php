<?php
/**
 * Delete User API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$db->prepare("UPDATE users SET status = 'inactive' WHERE id = ?")->execute([$id]);
jsonResponse(['success' => true]);
