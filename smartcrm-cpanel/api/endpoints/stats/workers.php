<?php
/**
 * Worker Stats API
 */
$db = getDB();

$period = $_GET['period'] ?? 'month';
$workerId = $_GET['worker_id'] ?? null;
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;

// Dátum tartomány
$today = date('Y-m-d');
switch ($period) {
    case 'today': $dateFrom = $dateTo = $today; break;
    case 'week': $dateFrom = date('Y-m-d', strtotime('monday this week')); $dateTo = date('Y-m-d', strtotime('sunday this week')); break;
    case 'month': $dateFrom = date('Y-m-01'); $dateTo = date('Y-m-t'); break;
    case 'custom': break;
}

$sql = "
    SELECT 
        w.id, w.name,
        COALESCE(SUM(j.cleaning_earnings), 0) as cleaning_earnings,
        COALESCE(SUM(j.textile_earnings), 0) as textile_earnings,
        COALESCE(SUM(j.expenses), 0) as expenses,
        COALESCE(SUM(j.cleaning_hours), 0) as total_hours,
        COUNT(j.id) as job_count
    FROM workers w
    LEFT JOIN jobs j ON w.id = j.worker_id AND j.job_date >= ? AND j.job_date <= ? AND j.status != 'cancelled'
    WHERE w.status = 'active'
";
$params = [$dateFrom, $dateTo];

if ($workerId) {
    $sql .= " AND w.id = ?";
    $params[] = $workerId;
}

$sql .= " GROUP BY w.id, w.name ORDER BY w.name";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$workers = $stmt->fetchAll();

foreach ($workers as &$worker) {
    $worker['total_earnings'] = $worker['cleaning_earnings'] + $worker['textile_earnings'];
}

jsonResponse(['workers' => $workers, 'period' => $period, 'date_from' => $dateFrom, 'date_to' => $dateTo]);
