<?php
/**
 * Voice Input API
 * Hang input feldolgozása → Claude API → ElevenLabs TTS
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$audioData = $data['audio'] ?? '';

// Jelenleg mock - valóságban:
// 1. Audio → Speech-to-Text (Whisper API vagy Google Speech)
// 2. Text → Claude API (chat.php logika)
// 3. Response → ElevenLabs TTS
// 4. Audio file visszaadása

// Mock válasz
echo json_encode([
    'success' => true,
    'text' => 'Köszönöm a kérdésedet. Segíthetek a SmartCRM rendszer használatában.',
    'audioUrl' => null, // ElevenLabs generált audio URL
    'message' => 'Köszönöm a kérdésedet. Segíthetek a SmartCRM rendszer használatában.'
]);
