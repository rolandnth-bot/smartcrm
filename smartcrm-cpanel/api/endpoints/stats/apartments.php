<?php
/**
 * Apartments Stats API
 */
$db = getDB();
$period = $_GET['period'] ?? 'month';
$dateFrom = $_GET['date_from'] ?? date('Y-m-01');
$dateTo = $_GET['date_to'] ?? date('Y-m-t');

if ($period === 'today') { $dateFrom = $dateTo = date('Y-m-d'); }
elseif ($period === 'week') { $dateFrom = date('Y-m-d', strtotime('monday this week')); $dateTo = date('Y-m-d', strtotime('sunday this week')); }

$stmt = $db->prepare("
    SELECT a.id, a.name,
        COALESCE(SUM(b.net_revenue), 0) as revenue,
        COUNT(DISTINCT b.id) as booking_count,
        COALESCE(SUM(b.nights), 0) as total_nights
    FROM apartments a
    LEFT JOIN bookings b ON a.id = b.apartment_id AND b.check_out >= ? AND b.check_out <= ? AND b.status != 'cancelled'
    WHERE a.status = 'active'
    GROUP BY a.id, a.name ORDER BY revenue DESC
");
$stmt->execute([$dateFrom, $dateTo]);
jsonResponse(['apartments' => $stmt->fetchAll(), 'period' => $period]);
