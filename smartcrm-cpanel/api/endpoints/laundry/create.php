<?php
/**
 * Create Laundry Order API
 */
$data = getRequestBody();

if (empty($data['apartment_id'])) {
    jsonResponse(['error' => 'Apartman megadása kötelező'], 400);
}

$db = getDB();
$orderId = generateUUID();

$stmt = $db->prepare("
    INSERT INTO laundry_orders (id, apartment_id, order_date, pickup_date, bag_count, weight_kg, cost, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
");

$stmt->execute([
    $orderId,
    $data['apartment_id'],
    $data['order_date'] ?? date('Y-m-d'),
    $data['pickup_date'] ?? null,
    (int)($data['bag_count'] ?? 1),
    (float)($data['weight_kg'] ?? 0),
    (int)($data['cost'] ?? 0),
    sanitize($data['notes'] ?? '')
]);

jsonResponse([
    'success' => true,
    'id' => $orderId,
    'message' => 'Mosodai rendelés sikeresen létrehozva'
], 201);
