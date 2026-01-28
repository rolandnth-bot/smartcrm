<?php
/**
 * Get Apartment API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$db = getDB();
$stmt = $db->prepare("SELECT * FROM apartments WHERE id = ?");
$stmt->execute([$id]);
$apartment = $stmt->fetch();

if (!$apartment) jsonResponse(['error' => 'Apartman nem található'], 404);

// Amenities
$stmt = $db->prepare("SELECT platform, amenity FROM apartment_amenities WHERE apartment_id = ?");
$stmt->execute([$id]);
$amenities = $stmt->fetchAll();
$apartment['amenities'] = [
    'airbnb' => array_column(array_filter($amenities, fn($a) => $a['platform'] === 'airbnb'), 'amenity'),
    'booking' => array_column(array_filter($amenities, fn($a) => $a['platform'] === 'booking'), 'amenity')
];

// Inventory
$stmt = $db->prepare("SELECT * FROM apartment_inventory WHERE apartment_id = ?");
$stmt->execute([$id]);
$apartment['inventory'] = $stmt->fetchAll();

jsonResponse(['apartment' => $apartment]);
