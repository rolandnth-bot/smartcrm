<?php
/**
 * Delete Lead API
 * DELETE /api/leads/{id}
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) {
    jsonResponse(['error' => 'ID megadása kötelező'], 400);
}

$db = getDB();

// Ellenőrizzük, hogy létezik-e a lead
$checkStmt = $db->prepare("SELECT id FROM leads WHERE id = ?");
$checkStmt->execute([$id]);
if (!$checkStmt->fetch()) {
    jsonResponse(['error' => 'Lead nem található'], 404);
}

$stmt = $db->prepare("DELETE FROM leads WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(['message' => 'Lead sikeresen törölve']);
