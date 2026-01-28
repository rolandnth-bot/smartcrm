<?php
/**
 * iCal Parser Helper
 * Parses iCal/ICS files and extracts events (bookings)
 */

/**
 * Parse iCal content and extract events
 * @param string $icalContent Raw iCal content
 * @return array Array of events with keys: uid, summary, dtstart, dtend, description
 */
function parseICalContent(string $icalContent): array {
    $events = [];
    $lines = explode("\n", $icalContent);
    $currentEvent = null;
    $inEvent = false;
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        
        // Handle line continuation (lines starting with space)
        if (preg_match('/^[ \t]/', $line)) {
            if ($currentEvent && isset($currentEvent['lastKey'])) {
                $currentEvent[$currentEvent['lastKey']] .= substr($line, 1);
            }
            continue;
        }
        
        // Start of event
        if (strpos($line, 'BEGIN:VEVENT') !== false) {
            $currentEvent = [];
            $inEvent = true;
            continue;
        }
        
        // End of event
        if (strpos($line, 'END:VEVENT') !== false) {
            if ($currentEvent && $inEvent) {
                $events[] = $currentEvent;
            }
            $currentEvent = null;
            $inEvent = false;
            continue;
        }
        
        if (!$inEvent || !$currentEvent) continue;
        
        // Parse properties
        if (preg_match('/^([^:]+):(.+)$/', $line, $matches)) {
            $key = strtoupper(trim($matches[1]));
            $value = trim($matches[2]);
            
            // Remove parameters (e.g., DTSTART;VALUE=DATE:20240101)
            $key = preg_replace('/;.*$/', '', $key);
            
            switch ($key) {
                case 'UID':
                    $currentEvent['uid'] = $value;
                    $currentEvent['lastKey'] = 'uid';
                    break;
                case 'SUMMARY':
                    $currentEvent['summary'] = $value;
                    $currentEvent['lastKey'] = 'summary';
                    break;
                case 'DTSTART':
                    $currentEvent['dtstart'] = parseICalDate($value);
                    $currentEvent['lastKey'] = 'dtstart';
                    break;
                case 'DTEND':
                    $currentEvent['dtend'] = parseICalDate($value);
                    $currentEvent['lastKey'] = 'dtend';
                    break;
                case 'DESCRIPTION':
                    $currentEvent['description'] = $value;
                    $currentEvent['lastKey'] = 'description';
                    break;
            }
        }
    }
    
    return $events;
}

/**
 * Parse iCal date format (YYYYMMDD or YYYYMMDDTHHMMSS)
 * @param string $dateStr iCal date string
 * @return string ISO date string (Y-m-d)
 */
function parseICalDate(string $dateStr): string {
    // Remove timezone info if present
    $dateStr = preg_replace('/[TZ].*$/', '', $dateStr);
    
    // Format: YYYYMMDD
    if (strlen($dateStr) === 8) {
        $year = substr($dateStr, 0, 4);
        $month = substr($dateStr, 4, 2);
        $day = substr($dateStr, 6, 2);
        return "$year-$month-$day";
    }
    
    // Try to parse as-is
    try {
        $dt = new DateTime($dateStr);
        return $dt->format('Y-m-d');
    } catch (Exception $e) {
        return date('Y-m-d');
    }
}

/**
 * Fetch iCal content from URL
 * @param string $url iCal feed URL
 * @param int $timeout Timeout in seconds (default: 30)
 * @return string|false Raw iCal content or false on error
 */
function fetchICalFromUrl(string $url, int $timeout = 30): string|false {
    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    
    // Use CORS proxy if needed (allorigins or similar)
    // For now, direct fetch
    $context = stream_context_create([
        'http' => [
            'timeout' => $timeout,
            'user_agent' => 'SmartCRM-iCal-Sync/1.0',
            'follow_location' => true,
            'max_redirects' => 5
        ]
    ]);
    
    $content = @file_get_contents($url, false, $context);
    
    if ($content === false) {
        // Try with CORS proxy fallback
        $proxyUrl = 'https://api.allorigins.win/raw?url=' . urlencode($url);
        $content = @file_get_contents($proxyUrl, false, $context);
    }
    
    return $content;
}

/**
 * Extract guest name from iCal event summary/description
 * @param array $event Parsed iCal event
 * @return string Guest name
 */
function extractGuestName(array $event): string {
    $summary = $event['summary'] ?? '';
    $description = $event['description'] ?? '';
    
    // Try to extract name from summary (common formats)
    // "John Doe - Booking" or "John Doe" or "Reservation for John Doe"
    if (preg_match('/(?:Reservation for |^)([A-Za-zÀ-ÿ\s]+?)(?:\s*[-–]\s*|$)/', $summary, $matches)) {
        return trim($matches[1]);
    }
    
    // Try description
    if (preg_match('/(?:Guest|Name|Vendég)[:\s]+([A-Za-zÀ-ÿ\s]+)/i', $description, $matches)) {
        return trim($matches[1]);
    }
    
    // Fallback to summary
    return $summary ?: 'Ismeretlen vendég';
}
