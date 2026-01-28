<?php
/**
 * Workers List API
 */
$db = getDB();

$status = $_GET['status'] ?? 'active';
$search = $_GET['search'] ?? '';

$sql = "SELECT * FROM workers WHERE 1=1";
$params = [];

if ($status !== 'all') {
    $sql .= " AND status = ?";
    $params[] = $status;
}

if ($search) {
    $sql .= " AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)";
    $searchTerm = "%{$search}%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

$sql .= " ORDER BY name ASC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$workers = $stmt->fetchAll();

jsonResponse(['workers' => $workers]);
