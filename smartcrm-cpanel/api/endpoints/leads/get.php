<?php
/**
 * Get Lead API
 * GET /api/leads/{id}
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) {
    jsonResponse(['error' => 'ID megadása kötelező'], 400);
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM leads WHERE id = ?");
$stmt->execute([$id]);
$lead = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$lead) {
    jsonResponse(['error' => 'Lead nem található'], 404);
}

jsonResponse(['lead' => $lead]);
