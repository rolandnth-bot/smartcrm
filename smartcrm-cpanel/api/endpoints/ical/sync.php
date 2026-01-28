<?php
/**
 * iCal Sync API
 * POST /api/ical/sync
 * Body: { apartmentId, feedId? }
 * 
 * Syncs iCal feed(s) for an apartment and creates/updates bookings
 */
require_once __DIR__ . '/../../helpers/icalParser.php';

$data = getRequestBody();
$apartmentId = $data['apartmentId'] ?? null;
$feedId = $data['feedId'] ?? null; // Optional: sync specific feed only

if (!$apartmentId) {
    jsonResponse(['error' => 'apartmentId megadása kötelező'], 400);
}

$db = getDB();
$startTime = microtime(true);

// Get apartment
$stmt = $db->prepare("SELECT * FROM apartments WHERE id = ?");
$stmt->execute([$apartmentId]);
$apartment = $stmt->fetch();

if (!$apartment) {
    jsonResponse(['error' => 'Apartman nem található'], 404);
}

// Collect iCal URLs from apartment
$feeds = [];
$feedMap = [
    'airbnb' => 'ical_airbnb',
    'booking' => 'ical_booking',
    'szallas' => 'ical_szallas',
    'own' => 'ical_own'
];

// Check if iCal columns exist, if not use fallback to airbnb_url/booking_url
$hasIcalColumns = false;
try {
    $testStmt = $db->query("SHOW COLUMNS FROM apartments LIKE 'ical_airbnb'");
    $hasIcalColumns = $testStmt->rowCount() > 0;
} catch (Exception $e) {
    // Columns don't exist, use fallback
}

foreach ($feedMap as $platform => $column) {
    if ($feedId && $feedId !== $platform) continue;
    
    $url = null;
    if ($hasIcalColumns) {
        $url = $apartment[$column] ?? null;
    } else {
        // Fallback to old columns
        if ($platform === 'airbnb') {
            $url = $apartment['airbnb_url'] ?? null;
        } elseif ($platform === 'booking') {
            $url = $apartment['booking_url'] ?? null;
        }
    }
    
    if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
        $feeds[] = [
            'id' => $platform,
            'platform' => $platform,
            'url' => $url
        ];
    }
}

if (empty($feeds)) {
    jsonResponse([
        'success' => false,
        'error' => 'Nincs konfigurált iCal feed ehhez a lakáshoz',
        'created' => 0,
        'updated' => 0,
        'cancelled' => 0,
        'errors' => []
    ], 400);
}

$results = [
    'created' => 0,
    'updated' => 0,
    'cancelled' => 0,
    'errors' => []
];

// Process each feed
foreach ($feeds as $feed) {
    try {
        // Fetch iCal content
        $icalContent = fetchICalFromUrl($feed['url'], 30);
        
        if ($icalContent === false) {
            $results['errors'][] = "Nem sikerült letölteni a feed-et: {$feed['platform']}";
            continue;
        }
        
        // Parse iCal
        $events = parseICalContent($icalContent);
        
        if (empty($events)) {
            continue; // No events in feed
        }
        
        // Process each event
        foreach ($events as $event) {
            $uid = $event['uid'] ?? null;
            $dtstart = $event['dtstart'] ?? null;
            $dtend = $event['dtend'] ?? null;
            
            if (!$uid || !$dtstart || !$dtend) {
                continue; // Skip invalid events
            }
            
            // Calculate nights
            $checkIn = new DateTime($dtstart);
            $checkOut = new DateTime($dtend);
            $nights = $checkIn->diff($checkOut)->days;
            
            if ($nights <= 0) {
                continue; // Skip invalid date ranges
            }
            
            // Extract guest name
            $guestName = extractGuestName($event);
            
            // Map platform
            $platform = match($feed['platform']) {
                'airbnb' => 'airbnb',
                'booking' => 'booking',
                'szallas' => 'other',
                default => 'other'
            };
            
            // Check if booking exists by external_id (UID)
            $stmt = $db->prepare("SELECT id, status FROM bookings WHERE apartment_id = ? AND external_id = ?");
            $stmt->execute([$apartmentId, $uid]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Update existing booking
                $bookingId = $existing['id'];
                $wasCancelled = $existing['status'] === 'cancelled';
                
                $updateStmt = $db->prepare("
                    UPDATE bookings SET
                        check_in = ?,
                        check_out = ?,
                        nights = ?,
                        guest_name = ?,
                        platform = ?,
                        status = 'confirmed',
                        updated_at = NOW()
                    WHERE id = ?
                ");
                
                $updateStmt->execute([
                    $dtstart,
                    $dtend,
                    $nights,
                    sanitize($guestName),
                    $platform,
                    $bookingId
                ]);
                
                if ($wasCancelled) {
                    $results['cancelled']++;
                } else {
                    $results['updated']++;
                }
            } else {
                // Create new booking
                $bookingId = generateUUID();
                
                $insertStmt = $db->prepare("
                    INSERT INTO bookings (
                        id, apartment_id, platform, guest_name, guest_count,
                        check_in, check_out, nights,
                        status, external_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, 'confirmed', ?, NOW(), NOW())
                ");
                
                $insertStmt->execute([
                    $bookingId,
                    $apartmentId,
                    $platform,
                    sanitize($guestName),
                    $dtstart,
                    $dtend,
                    $nights,
                    $uid
                ]);
                
                $results['created']++;
            }
        }
        
    } catch (Exception $e) {
        $results['errors'][] = "Hiba a {$feed['platform']} feed feldolgozása során: " . $e->getMessage();
        if (DEBUG_MODE) {
            error_log("iCal sync error: " . $e->getMessage());
        }
    }
}

$duration = round((microtime(true) - $startTime) * 1000); // ms

// Log sync (if sync_logs table exists)
try {
    $logId = generateUUID();
    $logStmt = $db->prepare("
        INSERT INTO sync_logs (
            id, apartment_id, feed_id, type, status,
            started_at, completed_at, duration,
            created_count, updated_count, cancelled_count, errors_json, triggered_by
        ) VALUES (?, ?, ?, 'ical_sync', ?, NOW(), NOW(), ?, ?, ?, ?, ?, 'user')
    ");
    
    $errorsJson = json_encode($results['errors'], JSON_UNESCAPED_UNICODE);
    $logStmt->execute([
        $logId,
        $apartmentId,
        $feedId ?? 'all',
        empty($results['errors']) ? 'success' : (count($results['errors']) < count($feeds) ? 'partial' : 'failed'),
        $duration,
        $results['created'],
        $results['updated'],
        $results['cancelled'],
        $errorsJson
    ]);
} catch (Exception $e) {
    // Table might not exist yet, ignore
    if (DEBUG_MODE) {
        error_log("Sync log error: " . $e->getMessage());
    }
}

jsonResponse([
    'success' => true,
    'created' => $results['created'],
    'updated' => $results['updated'],
    'cancelled' => $results['cancelled'],
    'errors' => $results['errors'],
    'duration' => $duration
]);
