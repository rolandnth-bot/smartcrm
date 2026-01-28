<?php
/**
 * Agent Status API
 * Agent művelet státuszának lekérdezése
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$sessionId = $_GET['sessionId'] ?? '';

// Mock status - valóságban Redis/DB-ből kellene lekérni
$status = [
    'status' => 'WORKING',
    'logs' => [
        ['type' => 'info', 'message' => 'Böngésző indítva...'],
        ['type' => 'info', 'message' => 'Booking.com betöltve'],
        ['type' => 'info', 'message' => 'Bejelentkezés...']
    ],
    'browserPreview' => [
        'url' => 'https://booking.com',
        'screenshot' => null
    ]
];

echo json_encode($status);
