<?php
/**
 * Update Job API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$data = getRequestBody();
$db = getDB();

$allowedFields = ['worker_id', 'apartment_id', 'job_date', 'checkout_time', 'checkin_time', 
    'status', 'cleaning_hours', 'cleaning_earnings', 'has_textile', 'textile_earnings',
    'textile_delivery_mode', 'laundry_time_slot', 'textile_worker_fee', 'laundry_cost', 'assigned_worker_count',
    'expenses', 'expense_note', 'notes'];

$fields = [];
$params = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $fields[] = "{$field} = ?";
        if (in_array($field, ['cleaning_earnings', 'textile_earnings', 'expenses', 'has_textile', 'textile_worker_fee', 'laundry_cost', 'assigned_worker_count'])) {
            $params[] = (int)$data[$field];
        } elseif ($field === 'cleaning_hours') {
            $params[] = (float)$data[$field];
        } else {
            $params[] = is_string($data[$field]) ? sanitize($data[$field]) : $data[$field];
        }
    }
}

if ($data['status'] === 'completed' && !in_array('completed_at', array_keys($data))) {
    $fields[] = "completed_at = NOW()";
}

if (!empty($fields)) {
    $params[] = $id;
    $sql = "UPDATE jobs SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
}

jsonResponse(['success' => true, 'message' => 'Munka sikeresen frissítve']);
