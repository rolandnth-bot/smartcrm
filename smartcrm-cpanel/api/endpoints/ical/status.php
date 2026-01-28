<?php
/**
 * iCal Status API
 * GET /api/ical/status/:apartmentId
 * 
 * Returns status of all iCal feeds for an apartment
 */
$apartmentId = $GLOBALS['routeParams']['apartmentId'] ?? null;

if (!$apartmentId) {
    jsonResponse(['error' => 'apartmentId megadása kötelező'], 400);
}

$db = getDB();

// Get apartment
$stmt = $db->prepare("SELECT * FROM apartments WHERE id = ?");
$stmt->execute([$apartmentId]);
$apartment = $stmt->fetch();

if (!$apartment) {
    jsonResponse(['error' => 'Apartman nem található'], 404);
}

// Check if iCal columns exist
$hasIcalColumns = false;
try {
    $testStmt = $db->query("SHOW COLUMNS FROM apartments LIKE 'ical_airbnb'");
    $hasIcalColumns = $testStmt->rowCount() > 0;
} catch (Exception $e) {
    // Columns don't exist
}

$feedMap = [
    'airbnb' => 'ical_airbnb',
    'booking' => 'ical_booking',
    'szallas' => 'ical_szallas',
    'own' => 'ical_own'
];

$feeds = [];

foreach ($feedMap as $platform => $column) {
    $url = null;
    if ($hasIcalColumns) {
        $url = $apartment[$column] ?? null;
    } else {
        // Fallback
        if ($platform === 'airbnb') {
            $url = $apartment['airbnb_url'] ?? null;
        } elseif ($platform === 'booking') {
            $url = $apartment['booking_url'] ?? null;
        }
    }
    
    $feed = [
        'id' => $platform,
        'platform' => $platform,
        'url' => $url,
        'isActive' => !empty($url),
        'status' => empty($url) ? 'inactive' : 'active',
        'lastSyncAt' => null,
        'lastSuccessAt' => null,
        'lastError' => null,
        'eventsCount' => 0
    ];
    
    // Get last sync info from sync_logs (if table exists)
    try {
        $logStmt = $db->prepare("
            SELECT completed_at, created_count + updated_count as events_count, errors_json
            FROM sync_logs
            WHERE apartment_id = ? AND feed_id = ? AND type = 'ical_sync'
            ORDER BY completed_at DESC
            LIMIT 1
        ");
        $logStmt->execute([$apartmentId, $platform]);
        $lastLog = $logStmt->fetch();
        
        if ($lastLog) {
            $feed['lastSyncAt'] = $lastLog['completed_at'];
            $feed['lastSuccessAt'] = empty($lastLog['errors_json']) || $lastLog['errors_json'] === '[]' 
                ? $lastLog['completed_at'] 
                : null;
            $feed['eventsCount'] = (int)($lastLog['events_count'] ?? 0);
            
            $errors = json_decode($lastLog['errors_json'] ?? '[]', true);
            if (!empty($errors) && is_array($errors)) {
                $feed['lastError'] = implode('; ', $errors);
                $feed['status'] = 'error';
            }
        }
    } catch (Exception $e) {
        // Table might not exist
    }
    
    // Count current bookings from this platform
    try {
        $countStmt = $db->prepare("
            SELECT COUNT(*) as cnt FROM bookings 
            WHERE apartment_id = ? AND platform = ?
        ");
        $countStmt->execute([$apartmentId, $platform === 'szallas' ? 'other' : $platform]);
        $countResult = $countStmt->fetch();
        if ($countResult && $feed['eventsCount'] === 0) {
            $feed['eventsCount'] = (int)$countResult['cnt'];
        }
    } catch (Exception $e) {
        // Ignore
    }
    
    $feeds[] = $feed;
}

jsonResponse([
    'feeds' => $feeds
]);
