<?php
/**
 * Update Laundry Order API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$data = getRequestBody();
$db = getDB();

$allowedFields = ['pickup_date', 'delivery_date', 'bag_count', 'weight_kg', 'cost', 'status', 'notes'];
$fields = [];
$params = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $fields[] = "{$field} = ?";
        if (in_array($field, ['bag_count', 'cost'])) {
            $params[] = (int)$data[$field];
        } elseif ($field === 'weight_kg') {
            $params[] = (float)$data[$field];
        } else {
            $params[] = sanitize($data[$field]);
        }
    }
}

if (!empty($fields)) {
    $params[] = $id;
    $sql = "UPDATE laundry_orders SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
}

jsonResponse(['success' => true, 'message' => 'Mosodai rendelés sikeresen frissítve']);
