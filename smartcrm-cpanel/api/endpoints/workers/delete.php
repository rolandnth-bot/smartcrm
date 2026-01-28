<?php
/**
 * Delete Worker API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();

// Soft delete - csak inaktiválás
$stmt = $db->prepare("UPDATE workers SET status = 'inactive' WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(['success' => true, 'message' => 'Dolgozó sikeresen törölve']);
