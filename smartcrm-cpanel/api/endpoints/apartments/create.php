<?php
/**
 * Create Apartment API
 */
$data = getRequestBody();

if (empty($data['name']) || empty($data['address'])) {
    jsonResponse(['error' => 'A név és cím megadása kötelező'], 400);
}

$db = getDB();
$apartmentId = generateUUID();

$stmt = $db->prepare("
    INSERT INTO apartments (
        id, partner_id, name, address, city, zip_code, district,
        size_sqm, rooms, bathrooms, max_guests, double_beds, single_beds,
        sofa_bed_single, sofa_bed_double, other_double_beds,
        time_frame, cleaning_fee, management_fee, monthly_fee,
        tourism_tax_type, tourism_tax_value,
        wifi_name, wifi_password, door_code, key_location,
        check_in_instructions, check_out_instructions, house_rules, parking_info,
        airbnb_url, booking_url, status, notes
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'active', ?
    )
");

$stmt->execute([
    $apartmentId,
    $data['partner_id'] ?? null,
    sanitize($data['name']),
    sanitize($data['address']),
    sanitize($data['city'] ?? ''),
    sanitize($data['zip_code'] ?? ''),
    sanitize($data['district'] ?? ''),
    (int)($data['size_sqm'] ?? 0),
    (int)($data['rooms'] ?? 1),
    (int)($data['bathrooms'] ?? 1),
    (int)($data['max_guests'] ?? 2),
    (int)($data['double_beds'] ?? 1),
    (int)($data['single_beds'] ?? 0),
    (int)($data['sofa_bed_single'] ?? 0),
    (int)($data['sofa_bed_double'] ?? 0),
    (int)($data['other_double_beds'] ?? 0),
    (float)($data['time_frame'] ?? 2.0),
    (int)($data['cleaning_fee'] ?? 0),
    (int)($data['management_fee'] ?? 25),
    (int)($data['monthly_fee'] ?? 0),
    $data['tourism_tax_type'] ?? 'percent',
    (int)($data['tourism_tax_value'] ?? 4),
    sanitize($data['wifi_name'] ?? ''),
    sanitize($data['wifi_password'] ?? ''),
    sanitize($data['door_code'] ?? ''),
    sanitize($data['key_location'] ?? ''),
    sanitize($data['check_in_instructions'] ?? ''),
    sanitize($data['check_out_instructions'] ?? ''),
    sanitize($data['house_rules'] ?? ''),
    sanitize($data['parking_info'] ?? ''),
    sanitize($data['airbnb_url'] ?? ''),
    sanitize($data['booking_url'] ?? ''),
    sanitize($data['notes'] ?? '')
]);

// Amenities mentése
if (!empty($data['amenities'])) {
    $stmtAmenity = $db->prepare("INSERT INTO apartment_amenities (apartment_id, platform, amenity) VALUES (?, ?, ?)");
    
    foreach (['airbnb', 'booking'] as $platform) {
        if (!empty($data['amenities'][$platform])) {
            foreach ($data['amenities'][$platform] as $amenity) {
                $stmtAmenity->execute([$apartmentId, $platform, $amenity]);
            }
        }
    }
}

// Inventory mentése
if (!empty($data['inventory'])) {
    $stmtInv = $db->prepare("INSERT INTO apartment_inventory (apartment_id, item_type, item_size, quantity, brand) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($data['inventory'] as $item) {
        $stmtInv->execute([
            $apartmentId,
            $item['item_type'],
            $item['item_size'] ?? null,
            (int)($item['quantity'] ?? 0),
            $item['brand'] ?? null
        ]);
    }
}

jsonResponse([
    'success' => true,
    'id' => $apartmentId,
    'message' => 'Apartman sikeresen létrehozva'
], 201);
