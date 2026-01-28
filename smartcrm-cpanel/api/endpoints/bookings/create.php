<?php
/**
 * Create Booking API
 */
$data = getRequestBody();

if (empty($data['apartment_id']) || empty($data['check_in']) || empty($data['check_out'])) {
    jsonResponse(['error' => 'Apartman, check-in és check-out dátum megadása kötelező'], 400);
}

$db = getDB();
$bookingId = generateUUID();

// Éjszakák számítása
$checkIn = new DateTime($data['check_in']);
$checkOut = new DateTime($data['check_out']);
$nights = $checkIn->diff($checkOut)->days;

// Összegek számítása
$nightlyRate = (int)($data['nightly_rate'] ?? 0);
$cleaningFee = (int)($data['cleaning_fee'] ?? 0);
$totalAmount = ($nightlyRate * $nights) + $cleaningFee;
$platformFee = (int)($data['platform_fee'] ?? 0);
$tourismTax = (int)($data['tourism_tax'] ?? 0);
$netRevenue = $totalAmount - $platformFee - $tourismTax;

$stmt = $db->prepare("
    INSERT INTO bookings (
        id, apartment_id, platform, guest_name, guest_phone, guest_email, guest_count,
        check_in, check_out, check_in_time, check_out_time, nights,
        nightly_rate, total_amount, cleaning_fee, platform_fee, tourism_tax, net_revenue,
        status, notes, external_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
");

$stmt->execute([
    $bookingId,
    $data['apartment_id'],
    $data['platform'] ?? 'airbnb',
    sanitize($data['guest_name'] ?? ''),
    sanitize($data['guest_phone'] ?? ''),
    sanitize($data['guest_email'] ?? ''),
    (int)($data['guest_count'] ?? 1),
    $data['check_in'],
    $data['check_out'],
    $data['check_in_time'] ?? '15:00',
    $data['check_out_time'] ?? '11:00',
    $nights,
    $nightlyRate,
    $totalAmount,
    $cleaningFee,
    $platformFee,
    $tourismTax,
    $netRevenue,
    sanitize($data['notes'] ?? ''),
    sanitize($data['external_id'] ?? '')
]);

jsonResponse([
    'success' => true,
    'id' => $bookingId,
    'nights' => $nights,
    'total_amount' => $totalAmount,
    'net_revenue' => $netRevenue,
    'message' => 'Foglalás sikeresen létrehozva'
], 201);
