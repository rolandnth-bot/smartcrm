<?php
/**
 * Get Job API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("
    SELECT j.*, w.name as worker_name, a.name as apartment_name
    FROM jobs j
    LEFT JOIN workers w ON j.worker_id = w.id
    LEFT JOIN apartments a ON j.apartment_id = a.id
    WHERE j.id = ?
");
$stmt->execute([$id]);
$job = $stmt->fetch();

if (!$job) jsonResponse(['error' => 'Munka nem található'], 404);

$stmt = $db->prepare("SELECT * FROM textile_deliveries WHERE job_id = ?");
$stmt->execute([$id]);
$job['textile_deliveries'] = $stmt->fetchAll();

jsonResponse(['job' => $job]);
