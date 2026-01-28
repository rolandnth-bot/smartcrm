<?php
/**
 * Get Worker API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("SELECT * FROM workers WHERE id = ?");
$stmt->execute([$id]);
$worker = $stmt->fetch();

if (!$worker) jsonResponse(['error' => 'Dolgozó nem található'], 404);

jsonResponse(['worker' => $worker]);
