<?php
/**
 * Get Booking API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("SELECT b.*, a.name as apartment_name FROM bookings b LEFT JOIN apartments a ON b.apartment_id = a.id WHERE b.id = ?");
$stmt->execute([$id]);
$booking = $stmt->fetch();

if (!$booking) jsonResponse(['error' => 'Foglalás nem található'], 404);
jsonResponse(['booking' => $booking]);
