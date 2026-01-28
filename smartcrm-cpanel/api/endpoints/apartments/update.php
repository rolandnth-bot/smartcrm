<?php
/**
 * Update Apartment API
 */
$id = $GLOBALS['routeParams']['id'] ?? null;
if (!$id) jsonResponse(['error' => 'ID megadása kötelező'], 400);

$data = getRequestBody();
$db = getDB();

$allowedFields = [
    'name', 'address', 'city', 'zip_code', 'district', 'size_sqm', 'rooms', 'bathrooms',
    'max_guests', 'double_beds', 'single_beds', 'sofa_bed_single', 'sofa_bed_double', 'other_double_beds',
    'time_frame', 'cleaning_fee', 'management_fee', 'monthly_fee', 'tourism_tax_type', 'tourism_tax_value',
    'wifi_name', 'wifi_password', 'door_code', 'key_location',
    'check_in_instructions', 'check_out_instructions', 'house_rules', 'parking_info',
    'airbnb_url', 'booking_url', 'airbnb_username', 'airbnb_password', 'booking_username', 'booking_password',
    'ical_airbnb', 'ical_booking', 'ical_szallas', 'ical_own',
    'status', 'notes'
];

$fields = [];
$params = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $fields[] = "{$field} = ?";
        if (in_array($field, ['size_sqm', 'rooms', 'bathrooms', 'max_guests', 'double_beds', 'single_beds', 
            'sofa_bed_single', 'sofa_bed_double', 'other_double_beds', 'cleaning_fee', 'management_fee', 
            'monthly_fee', 'tourism_tax_value'])) {
            $params[] = (int)$data[$field];
        } elseif ($field === 'time_frame') {
            $params[] = (float)$data[$field];
        } else {
            $params[] = sanitize($data[$field]);
        }
    }
}

if (!empty($fields)) {
    $params[] = $id;
    $sql = "UPDATE apartments SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
}

// Amenities frissítése
if (isset($data['amenities'])) {
    $db->prepare("DELETE FROM apartment_amenities WHERE apartment_id = ?")->execute([$id]);
    $stmtAmenity = $db->prepare("INSERT INTO apartment_amenities (apartment_id, platform, amenity) VALUES (?, ?, ?)");
    foreach (['airbnb', 'booking'] as $platform) {
        if (!empty($data['amenities'][$platform])) {
            foreach ($data['amenities'][$platform] as $amenity) {
                $stmtAmenity->execute([$id, $platform, $amenity]);
            }
        }
    }
}

// Inventory frissítése
if (isset($data['inventory'])) {
    $db->prepare("DELETE FROM apartment_inventory WHERE apartment_id = ?")->execute([$id]);
    $stmtInv = $db->prepare("INSERT INTO apartment_inventory (apartment_id, item_type, item_size, quantity, brand) VALUES (?, ?, ?, ?, ?)");
    foreach ($data['inventory'] as $item) {
        $stmtInv->execute([$id, $item['item_type'], $item['item_size'] ?? null, (int)($item['quantity'] ?? 0), $item['brand'] ?? null]);
    }
}

jsonResponse(['success' => true, 'message' => 'Apartman sikeresen frissítve']);
