<?php
/**
 * Update Booking API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$data = getRequestBody();
$db = getDB();

$allowedFields = ['guest_name', 'guest_phone', 'guest_email', 'guest_count', 'check_in', 'check_out',
    'check_in_time', 'check_out_time', 'nightly_rate', 'total_amount', 'cleaning_fee', 'platform_fee',
    'tourism_tax', 'net_revenue', 'status', 'notes'];

$fields = [];
$params = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $fields[] = "{$field} = ?";
        if (in_array($field, ['guest_count', 'nightly_rate', 'total_amount', 'cleaning_fee', 'platform_fee', 'tourism_tax', 'net_revenue'])) {
            $params[] = (int)$data[$field];
        } else {
            $params[] = sanitize($data[$field]);
        }
    }
}

if (!empty($fields)) {
    $params[] = $id;
    $sql = "UPDATE bookings SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
}

jsonResponse(['success' => true, 'message' => 'Foglalás sikeresen frissítve']);
