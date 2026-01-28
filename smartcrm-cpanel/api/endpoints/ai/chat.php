<?php
/**
 * AI Chat API Endpoint
 * Anthropic Claude API integráció szöveges chat-hez
 */

require_once __DIR__ . '/../../helpers/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Anthropic Claude API hívás
$apiKey = getenv('ANTHROPIC_API_KEY') ?: '';
if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'Anthropic API key not configured']);
    exit;
}

try {
    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'x-api-key: ' . $apiKey,
            'anthropic-version: 2023-06-01'
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'model' => 'claude-3-5-sonnet-20241022',
            'max_tokens' => 1024,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ],
            'system' => 'Te a SmartProperties CRM rendszer AI asszisztense vagy. Segítesz a felhasználóknak a rendszer használatában, információkat adsz a dokumentumokról, és automatizálod a feladatokat.'
        ])
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception('Claude API error: ' . $response);
    }

    $result = json_decode($response, true);
    $aiResponse = $result['content'][0]['text'] ?? 'Nem sikerült választ generálni.';

    echo json_encode([
        'success' => true,
        'response' => $aiResponse,
        'message' => $aiResponse
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'AI service error: ' . $e->getMessage()
    ]);
}
