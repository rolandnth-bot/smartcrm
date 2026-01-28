<?php
/**
 * Email küldés API (Rackhost SMTP)
 */
// Load config - try multiple paths
$configPaths = [
    __DIR__ . '/../../config/config.php',
    dirname(dirname(dirname(__DIR__))) . '/config/config.php',
    $_SERVER['DOCUMENT_ROOT'] . '/smartcrm-cpanel/config/config.php',
];
$configLoaded = false;
foreach ($configPaths as $configPath) {
    if (file_exists($configPath)) {
        require_once $configPath;
        $configLoaded = true;
        break;
    }
}
if (!$configLoaded) {
    die(json_encode(['error' => 'Config file not found'], JSON_PRETTY_PRINT));
}

/**
 * SMTP több soros válasz beolvasása
 */
function readSmtpResponse($connection) {
    $response = '';
    $lastLine = '';
    while ($line = fgets($connection, 515)) {
        $response .= $line;
        $lastLine = trim($line);
        // Ha a sor nem kezdődik szóközzel vagy '-' jellel, akkor ez az utolsó sor
        if (strlen($lastLine) >= 4 && $lastLine[3] !== '-' && $lastLine[3] !== ' ') {
            break;
        }
    }
    return ['full' => $response, 'last' => $lastLine, 'code' => substr($lastLine, 0, 3)];
}

$data = getRequestBody();

// Validáció
$required = ['to', 'subject', 'body'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        jsonResponse(['error' => "A(z) {$field} mező kötelező"], 400);
    }
}

$to = is_array($data['to']) ? $data['to'] : [$data['to']];
$subject = sanitize($data['subject']);
$body = $data['body'];
$html = $data['html'] ?? $body;
$from = $data['from'] ?? 'registration@rackhost.hu';

// SMTP beállítások (Rackhost)
$smtpUser = $data['smtp']['user'] ?? 'registration@rackhost.hu';
$smtpPass = $data['smtp']['password'] ?? 'Smartregistration';
$smtpHost = $data['smtp']['host'] ?? 'mail.rackhost.hu';
$smtpPort = $data['smtp']['port'] ?? 587;
$smtpSecure = $data['smtp']['secure'] ?? false; // false = TLS, 'ssl' = SSL

// SMTP email küldés socket kapcsolattal (PHPMailer nélkül is működik)
try {
    // Socket kapcsolat létrehozása az SMTP szerverrel
    $smtpConnection = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 30);
    
    if (!$smtpConnection) {
        throw new Exception("SMTP kapcsolódási hiba: {$errstr} ({$errno})");
    }
    
    // SMTP handshake
    $response = fgets($smtpConnection, 515);
    if (substr($response, 0, 3) !== '220') {
        throw new Exception("SMTP szerver nem válaszol: {$response}");
    }
    
    // EHLO (először STARTTLS előtt)
    fputs($smtpConnection, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\r\n");
    $ehloResponse = readSmtpResponse($smtpConnection);
    
    // STARTTLS (ha TLS-t használunk)
    if (!$smtpSecure && $smtpPort == 587) {
        fputs($smtpConnection, "STARTTLS\r\n");
        $starttlsResponse = readSmtpResponse($smtpConnection);
        if ($starttlsResponse['code'] === '220') {
            if (!stream_socket_enable_crypto($smtpConnection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception("TLS kapcsolat létrehozása sikertelen");
            }
            // Újra EHLO TLS után
            fputs($smtpConnection, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\r\n");
            $ehloResponse = readSmtpResponse($smtpConnection);
        } else {
            throw new Exception("STARTTLS hiba: {$starttlsResponse['last']}");
        }
    }
    
    // AUTH LOGIN
    fputs($smtpConnection, "AUTH LOGIN\r\n");
    $authResponse = readSmtpResponse($smtpConnection);
    if ($authResponse['code'] !== '334') {
        throw new Exception("SMTP AUTH hiba: {$authResponse['last']}");
    }
    
    // Username
    fputs($smtpConnection, base64_encode($smtpUser) . "\r\n");
    $usernameResponse = readSmtpResponse($smtpConnection);
    if ($usernameResponse['code'] !== '334') {
        throw new Exception("SMTP username hiba: {$usernameResponse['last']}");
    }
    
    // Password
    fputs($smtpConnection, base64_encode($smtpPass) . "\r\n");
    $passwordResponse = readSmtpResponse($smtpConnection);
    if ($passwordResponse['code'] !== '235') {
        throw new Exception("SMTP authentication hiba: {$passwordResponse['last']}");
    }
    
    // MAIL FROM
    fputs($smtpConnection, "MAIL FROM: <{$from}>\r\n");
    $mailFromResponse = readSmtpResponse($smtpConnection);
    if ($mailFromResponse['code'] !== '250') {
        throw new Exception("SMTP MAIL FROM hiba: {$mailFromResponse['last']}");
    }
    
    // RCPT TO (minden címzettnek)
    $validRecipients = [];
    foreach ($to as $email) {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fputs($smtpConnection, "RCPT TO: <{$email}>\r\n");
            $rcptResponse = readSmtpResponse($smtpConnection);
            if ($rcptResponse['code'] === '250') {
                $validRecipients[] = $email;
            }
        }
    }
    
    if (empty($validRecipients)) {
        throw new Exception("Nincs érvényes email címzett");
    }
    
    // DATA
    fputs($smtpConnection, "DATA\r\n");
    $dataResponse = readSmtpResponse($smtpConnection);
    if ($dataResponse['code'] !== '354') {
        throw new Exception("SMTP DATA hiba: {$dataResponse['last']}");
    }
    
    // Email headers és body
    $emailContent = "From: {$from}\r\n";
    $emailContent .= "To: " . implode(', ', $validRecipients) . "\r\n";
    $emailContent .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $emailContent .= "MIME-Version: 1.0\r\n";
    $emailContent .= "Content-Type: text/html; charset=UTF-8\r\n";
    $emailContent .= "Content-Transfer-Encoding: base64\r\n";
    $emailContent .= "\r\n";
    $emailContent .= chunk_split(base64_encode($html));
    $emailContent .= "\r\n.\r\n";
    
    fputs($smtpConnection, $emailContent);
    $sendResponse = readSmtpResponse($smtpConnection);
    if ($sendResponse['code'] !== '250') {
        throw new Exception("SMTP email küldési hiba: {$sendResponse['last']}");
    }
    
    // QUIT
    fputs($smtpConnection, "QUIT\r\n");
    readSmtpResponse($smtpConnection);
    fclose($smtpConnection);
    
    jsonResponse([
        'success' => true,
        'message' => 'Email sikeresen elküldve',
        'messageId' => 'smtp-' . time()
    ]);
    
} catch (Exception $e) {
    if (isset($smtpConnection) && is_resource($smtpConnection)) {
        @fclose($smtpConnection);
    }
    
    // Fallback: PHP mail() függvény (ha SMTP nem működik)
    $headers = [
        'From: ' . $from,
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    $success = true;
    $errors = [];
    
    foreach ($to as $email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Érvénytelen email cím: {$email}";
            $success = false;
            continue;
        }
        
        $result = @mail($email, $subject, $html, implode("\r\n", $headers));
        if (!$result) {
            $errors[] = "Nem sikerült elküldeni az emailt: {$email}";
            $success = false;
        }
    }
    
    if ($success) {
        jsonResponse([
            'success' => true,
            'message' => 'Email sikeresen elküldve (fallback móddal)',
            'messageId' => 'php-mail-' . time()
        ]);
    } else {
        jsonResponse([
            'error' => 'Email küldési hiba: ' . $e->getMessage() . (count($errors) > 0 ? ' | ' . implode(', ', $errors) : '')
        ], 500);
    }
}

