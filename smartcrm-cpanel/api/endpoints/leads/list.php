<?php
/**
 * Get Leads List API
 * GET /api/leads
 */
$db = getDB();

// Szűrési paraméterek
$status = $_GET['status'] ?? null;
$search = $_GET['search'] ?? null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

$query = "SELECT * FROM leads WHERE 1=1";
$params = [];

if ($status && $status !== 'all') {
    $query .= " AND status = ?";
    $params[] = $status;
}

if ($search) {
    $query .= " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
    $searchTerm = "%{$search}%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

$query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;

$stmt = $db->prepare($query);
$stmt->execute($params);
$leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse(['leads' => $leads]);
