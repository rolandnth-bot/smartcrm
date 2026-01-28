<?php
/**
 * Agent Start API
 * Playwright alapú böngésző automatizáció indítása
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$instruction = $data['instruction'] ?? '';

if (empty($instruction)) {
    http_response_code(400);
    echo json_encode(['error' => 'Instruction is required']);
    exit;
}

// Agent session ID generálása
$sessionId = uniqid('agent_', true);

// Playwright script futtatása háttérben
// Jelenleg mock implementáció
// Valóságban: exec("node agent-runner.js " . escapeshellarg($instruction) . " " . $sessionId);

// Session mentése (Redis vagy DB)
// Jelenleg mock

echo json_encode([
    'success' => true,
    'sessionId' => $sessionId,
    'status' => 'WORKING',
    'message' => 'Agent elindítva'
]);
