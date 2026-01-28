<?php
/**
 * Delete Booking API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(['success' => true, 'message' => 'Foglalás sikeresen törölve']);
