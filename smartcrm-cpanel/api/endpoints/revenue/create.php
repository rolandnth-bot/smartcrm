<?php
/**
 * Revenue Plan/Fact Create API
 * Új bevételi terv/tény adatok létrehozása
 */

require_once __DIR__ . '/../../helpers/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$db = getDB();
$data = json_decode(file_get_contents('php://input'), true);

// Validáció
$errors = [];
if (empty($data['period'])) {
    $errors[] = 'Period (year/month/week/day) kötelező';
}
if (!isset($data['plan_revenue']) || $data['plan_revenue'] < 0) {
    $errors[] = 'Plan revenue kötelező és nem lehet negatív';
}
if (!isset($data['fact_revenue']) || $data['fact_revenue'] < 0) {
    $errors[] = 'Fact revenue kötelező és nem lehet negatív';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => implode(', ', $errors)]);
    exit;
}

try {
    $stmt = $db->prepare("
        INSERT INTO revenue_plan_fact (
            period,
            period_type,
            plan_revenue,
            fact_revenue,
            completion_rate,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ");

    $periodType = $data['period']; // 'year', 'month', 'week', 'day'
    $period = $data['period_value'] ?? date('Y-m-d'); // pl. '2026-01' havi, '2026-01-28' napi
    $planRevenue = floatval($data['plan_revenue']);
    $factRevenue = floatval($data['fact_revenue']);
    $completionRate = $planRevenue > 0 ? ($factRevenue / $planRevenue) * 100 : 0;

    $stmt->execute([
        $period,
        $periodType,
        $planRevenue,
        $factRevenue,
        $completionRate
    ]);

    $id = $db->lastInsertId();

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Bevételi terv/tény sikeresen létrehozva'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
