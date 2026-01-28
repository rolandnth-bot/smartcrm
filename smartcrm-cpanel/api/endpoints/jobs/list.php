<?php
/**
 * Jobs List API
 */
$db = getDB();

$workerId = $_GET['worker_id'] ?? null;
$apartmentId = $_GET['apartment_id'] ?? null;
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;
$status = $_GET['status'] ?? null;

$sql = "
    SELECT j.*, 
           w.name as worker_name, 
           a.name as apartment_name,
           a.address as apartment_address
    FROM jobs j
    LEFT JOIN workers w ON j.worker_id = w.id
    LEFT JOIN apartments a ON j.apartment_id = a.id
    WHERE 1=1
";
$params = [];

if ($workerId) {
    $sql .= " AND j.worker_id = ?";
    $params[] = $workerId;
}

if ($apartmentId) {
    $sql .= " AND j.apartment_id = ?";
    $params[] = $apartmentId;
}

if ($dateFrom) {
    $sql .= " AND j.job_date >= ?";
    $params[] = $dateFrom;
}

if ($dateTo) {
    $sql .= " AND j.job_date <= ?";
    $params[] = $dateTo;
}

if ($status) {
    $sql .= " AND j.status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY j.job_date DESC, j.checkout_time ASC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$jobs = $stmt->fetchAll();

// Textile deliveries hozzáadása
foreach ($jobs as &$job) {
    $stmt = $db->prepare("SELECT * FROM textile_deliveries WHERE job_id = ?");
    $stmt->execute([$job['id']]);
    $job['textile_deliveries'] = $stmt->fetchAll();
}

jsonResponse(['jobs' => $jobs]);
