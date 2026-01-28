<?php
/**
 * Bookings List API
 */
$db = getDB();

$apartmentId = $_GET['apartment_id'] ?? null;
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;
$status = $_GET['status'] ?? null;

$sql = "
    SELECT b.*, a.name as apartment_name
    FROM bookings b
    LEFT JOIN apartments a ON b.apartment_id = a.id
    WHERE 1=1
";
$params = [];

if ($apartmentId) {
    $sql .= " AND b.apartment_id = ?";
    $params[] = $apartmentId;
}

if ($dateFrom) {
    $sql .= " AND b.check_out >= ?";
    $params[] = $dateFrom;
}

if ($dateTo) {
    $sql .= " AND b.check_in <= ?";
    $params[] = $dateTo;
}

if ($status) {
    $sql .= " AND b.status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY b.check_in DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$bookings = $stmt->fetchAll();

jsonResponse(['bookings' => $bookings]);
