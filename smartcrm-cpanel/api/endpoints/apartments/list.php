<?php
/**
 * Apartments List API
 */
$db = getDB();

$partnerId = $_GET['partner_id'] ?? null;
$status = $_GET['status'] ?? 'active';

$sql = "SELECT * FROM apartments WHERE 1=1";
$params = [];

if ($partnerId) {
    $sql .= " AND partner_id = ?";
    $params[] = $partnerId;
}

if ($status !== 'all') {
    $sql .= " AND status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY name ASC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$apartments = $stmt->fetchAll();

// Kiegészítő adatok lekérése
foreach ($apartments as &$apt) {
    // Amenities
    $stmt = $db->prepare("SELECT platform, amenity FROM apartment_amenities WHERE apartment_id = ?");
    $stmt->execute([$apt['id']]);
    $amenities = $stmt->fetchAll();
    $apt['amenities'] = [
        'airbnb' => array_column(array_filter($amenities, fn($a) => $a['platform'] === 'airbnb'), 'amenity'),
        'booking' => array_column(array_filter($amenities, fn($a) => $a['platform'] === 'booking'), 'amenity')
    ];
    
    // Inventory
    $stmt = $db->prepare("SELECT item_type, item_size, quantity, brand FROM apartment_inventory WHERE apartment_id = ?");
    $stmt->execute([$apt['id']]);
    $apt['inventory'] = $stmt->fetchAll();
}

jsonResponse(['apartments' => $apartments]);
