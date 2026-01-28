<?php
/**
 * Stats Overview API
 */
$db = getDB();

$period = $_GET['period'] ?? 'month'; // today, week, month, custom
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;

// Dátum tartomány számítás
$today = date('Y-m-d');
switch ($period) {
    case 'today':
        $dateFrom = $today;
        $dateTo = $today;
        break;
    case 'week':
        $dateFrom = date('Y-m-d', strtotime('monday this week'));
        $dateTo = date('Y-m-d', strtotime('sunday this week'));
        break;
    case 'month':
        $dateFrom = date('Y-m-01');
        $dateTo = date('Y-m-t');
        break;
    case 'custom':
        if (!$dateFrom) $dateFrom = date('Y-m-01');
        if (!$dateTo) $dateTo = date('Y-m-t');
        break;
}

// Bevételek (foglalásokból)
$stmt = $db->prepare("
    SELECT COALESCE(SUM(net_revenue), 0) as revenues
    FROM bookings
    WHERE check_out >= ? AND check_out <= ? AND status IN ('confirmed', 'checked_in', 'checked_out')
");
$stmt->execute([$dateFrom, $dateTo]);
$revenues = (int)$stmt->fetch()['revenues'];

// Takarítási költségek
$stmt = $db->prepare("
    SELECT COALESCE(SUM(cleaning_earnings), 0) as cleaning_costs
    FROM jobs
    WHERE job_date >= ? AND job_date <= ? AND status != 'cancelled'
");
$stmt->execute([$dateFrom, $dateTo]);
$cleaningCosts = (int)$stmt->fetch()['cleaning_costs'];

// Textil költségek
$stmt = $db->prepare("
    SELECT COALESCE(SUM(textile_earnings), 0) as textile_costs
    FROM jobs
    WHERE job_date >= ? AND job_date <= ? AND status != 'cancelled' AND has_textile = 1
");
$stmt->execute([$dateFrom, $dateTo]);
$textileCosts = (int)$stmt->fetch()['textile_costs'];

// Mosoda költségek
$stmt = $db->prepare("
    SELECT COALESCE(SUM(cost), 0) as laundry_costs
    FROM laundry_orders
    WHERE order_date >= ? AND order_date <= ? AND status != 'cancelled'
");
$stmt->execute([$dateFrom, $dateTo]);
$laundryCosts = (int)$stmt->fetch()['laundry_costs'];

// Egyéb költségek
$stmt = $db->prepare("
    SELECT COALESCE(SUM(amount), 0) as other_expenses
    FROM expenses
    WHERE expense_date >= ? AND expense_date <= ?
");
$stmt->execute([$dateFrom, $dateTo]);
$otherExpenses = (int)$stmt->fetch()['other_expenses'];

// Munkahelyi költségek (expenses a jobs-ból)
$stmt = $db->prepare("
    SELECT COALESCE(SUM(expenses), 0) as job_expenses
    FROM jobs
    WHERE job_date >= ? AND job_date <= ? AND status != 'cancelled'
");
$stmt->execute([$dateFrom, $dateTo]);
$jobExpenses = (int)$stmt->fetch()['job_expenses'];

$totalExpenses = $otherExpenses + $jobExpenses;
$profit = $revenues - $cleaningCosts - $textileCosts - $laundryCosts - $totalExpenses;

jsonResponse([
    'period' => $period,
    'date_from' => $dateFrom,
    'date_to' => $dateTo,
    'revenues' => $revenues,
    'cleaning_costs' => $cleaningCosts,
    'textile_costs' => $textileCosts,
    'laundry_costs' => $laundryCosts,
    'expenses' => $totalExpenses,
    'profit' => $profit
]);
