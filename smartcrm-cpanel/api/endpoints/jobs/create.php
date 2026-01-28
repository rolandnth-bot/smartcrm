<?php
/**
 * Create Job API
 */
$data = getRequestBody();

if (empty($data['worker_id']) || empty($data['apartment_id']) || empty($data['job_date'])) {
    jsonResponse(['error' => 'Dolgozó, apartman és dátum megadása kötelező'], 400);
}

$db = getDB();
$jobId = generateUUID();

// Apartman időkeret lekérése
$stmt = $db->prepare("SELECT time_frame FROM apartments WHERE id = ?");
$stmt->execute([$data['apartment_id']]);
$apt = $stmt->fetch();
$timeFrame = $apt ? (float)$apt['time_frame'] : 2.0;

// Dolgozó óradíj lekérése
$stmt = $db->prepare("SELECT hourly_rate, textile_rate FROM workers WHERE id = ?");
$stmt->execute([$data['worker_id']]);
$worker = $stmt->fetch();
$hourlyRate = $worker ? (int)$worker['hourly_rate'] : 2500;
$textileRate = $worker ? (int)$worker['textile_rate'] : 600;

$cleaningEarnings = (int)($timeFrame * $hourlyRate);
$textileEarnings = !empty($data['has_textile']) ? $textileRate : 0;

// Textil szállítás mód és költségek számítása
$textileDeliveryMode = sanitize($data['textile_delivery_mode'] ?? null);
$laundryTimeSlot = sanitize($data['laundry_time_slot'] ?? null);
$assignedWorkerCount = (int)($data['assigned_worker_count'] ?? 0);
$textileWorkerFee = (int)($data['textile_worker_fee'] ?? 0);
$laundryCost = (int)($data['laundry_cost'] ?? 0);

// Ha nincs explicit megadva, számoljuk
if (!empty($data['has_textile']) && $textileDeliveryMode === 'worker' && $textileWorkerFee === 0) {
    $textileWorkerFee = $assignedWorkerCount * 1200;
    $textileEarnings = $textileWorkerFee;
} elseif (!empty($data['has_textile']) && $textileDeliveryMode === 'laundry' && $laundryCost === 0) {
    // Mosoda költség: ha van megadva, használjuk, különben 0
    $laundryCost = (int)($data['laundry_cost'] ?? 0);
    $textileEarnings = 0;
}

$stmt = $db->prepare("
    INSERT INTO jobs (
        id, worker_id, apartment_id, job_date, checkout_time, checkin_time,
        status, cleaning_hours, cleaning_earnings, has_textile, textile_earnings,
        textile_delivery_mode, laundry_time_slot, textile_worker_fee, laundry_cost, assigned_worker_count,
        expenses, expense_note, notes
    ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $jobId,
    $data['worker_id'],
    $data['apartment_id'],
    $data['job_date'],
    $data['checkout_time'] ?? null,
    $data['checkin_time'] ?? null,
    $timeFrame,
    $cleaningEarnings,
    !empty($data['has_textile']) ? 1 : 0,
    $textileEarnings,
    $textileDeliveryMode,
    $laundryTimeSlot,
    $textileWorkerFee,
    $laundryCost,
    $assignedWorkerCount,
    (int)($data['expenses'] ?? 0),
    sanitize($data['expense_note'] ?? ''),
    sanitize($data['notes'] ?? '')
]);

// Textile delivery létrehozása ha szükséges
if (!empty($data['has_textile'])) {
    $textileId = generateUUID();
    $stmt = $db->prepare("
        INSERT INTO textile_deliveries (id, job_id, worker_id, apartment_id, delivery_date, bag_count, earnings, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
    ");
    $stmt->execute([
        $textileId,
        $jobId,
        $data['worker_id'],
        $data['apartment_id'],
        $data['job_date'],
        (int)($data['bag_count'] ?? 1),
        $textileEarnings
    ]);
}

jsonResponse([
    'success' => true,
    'id' => $jobId,
    'cleaning_earnings' => $cleaningEarnings,
    'textile_earnings' => $textileEarnings,
    'message' => 'Munka sikeresen létrehozva'
], 201);
