<?php
/**
 * Outgoing Call API
 * Twilio API integráció kimenő hívásokhoz
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$phoneNumber = $data['phoneNumber'] ?? '';

if (empty($phoneNumber)) {
    http_response_code(400);
    echo json_encode(['error' => 'Phone number is required']);
    exit;
}

// Twilio API hívás
$accountSid = getenv('TWILIO_ACCOUNT_SID') ?: '';
$authToken = getenv('TWILIO_AUTH_TOKEN') ?: '';
$fromNumber = getenv('TWILIO_PHONE_NUMBER') ?: '';

if (empty($accountSid) || empty($authToken)) {
    http_response_code(500);
    echo json_encode(['error' => 'Twilio not configured']);
    exit;
}

try {
    $ch = curl_init("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Calls.json");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_USERPWD => "{$accountSid}:{$authToken}",
        CURLOPT_POSTFIELDS => http_build_query([
            'From' => $fromNumber,
            'To' => $phoneNumber,
            'Url' => getenv('TWILIO_WEBHOOK_URL') ?: 'https://your-domain.com/api/call/handle'
        ])
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 201) {
        throw new Exception('Twilio API error: ' . $response);
    }

    $result = json_decode($response, true);

    echo json_encode([
        'success' => true,
        'callSid' => $result['sid'] ?? '',
        'status' => $result['status'] ?? 'queued',
        'message' => 'Hívás indítva'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Twilio error: ' . $e->getMessage()
    ]);
}
