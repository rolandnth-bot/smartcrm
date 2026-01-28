<?php
/**
 * Laundry Orders List API
 */
$db = getDB();

$apartmentId = $_GET['apartment_id'] ?? null;
$status = $_GET['status'] ?? null;
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;

$sql = "
    SELECT l.*, a.name as apartment_name
    FROM laundry_orders l
    LEFT JOIN apartments a ON l.apartment_id = a.id
    WHERE 1=1
";
$params = [];

if ($apartmentId) {
    $sql .= " AND l.apartment_id = ?";
    $params[] = $apartmentId;
}

if ($status) {
    $sql .= " AND l.status = ?";
    $params[] = $status;
}

if ($dateFrom) {
    $sql .= " AND l.order_date >= ?";
    $params[] = $dateFrom;
}

if ($dateTo) {
    $sql .= " AND l.order_date <= ?";
    $params[] = $dateTo;
}

$sql .= " ORDER BY l.order_date DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

jsonResponse(['laundry_orders' => $orders]);
