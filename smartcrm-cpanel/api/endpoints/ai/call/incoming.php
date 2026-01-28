<?php
/**
 * Incoming Call Webhook
 * Twilio webhook bejövő híváshoz
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Twilio webhook adatok
$callSid = $_POST['CallSid'] ?? '';
$from = $_POST['From'] ?? '';
$to = $_POST['To'] ?? '';
$status = $_POST['CallStatus'] ?? '';

// Hívás mentése DB-be
$db = getDB();
try {
    $stmt = $db->prepare("
        INSERT INTO calls (call_sid, from_number, to_number, status, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()
    ");
    $stmt->execute([$callSid, $from, $to, $status, $status]);
} catch (PDOException $e) {
    // Log error, de ne állítsuk meg a webhook-ot
    error_log('Call save error: ' . $e->getMessage());
}

// Twilio TwiML válasz (ha szükséges)
if ($status === 'ringing' || $status === 'in-progress') {
    header('Content-Type: text/xml');
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<Response>';
    echo '<Say voice="alice">Üdvözöljük a SmartProperties CRM rendszerben. Kérem várjon, kapcsoljuk a megfelelő munkatársat.</Say>';
    echo '<Dial>+36...</Dial>'; // Valós telefonszám
    echo '</Response>';
    exit;
}

echo json_encode(['success' => true]);
