<?php
/**
 * Delete Apartment API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("UPDATE apartments SET status = 'inactive' WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(['success' => true, 'message' => 'Apartman sikeresen törölve']);
