<?php
/**
 * Delete Job API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("UPDATE jobs SET status = 'cancelled' WHERE id = ?");
$stmt->execute([$id]);

// Textile delivery törlése
$stmt = $db->prepare("UPDATE textile_deliveries SET status = 'cancelled' WHERE job_id = ?");
$stmt->execute([$id]);

jsonResponse(['success' => true, 'message' => 'Munka sikeresen törölve']);
