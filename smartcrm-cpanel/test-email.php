<?php
/**
 * Email küldés teszt script
 * Használat: php test-email.php vagy böngészőben: http://localhost/smartcrm-cpanel/test-email.php
 */

require_once __DIR__ . '/config/config.php';

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

// Teszt adatok
$testEmail = $_GET['to'] ?? 'teszt@example.com';
$testSubject = 'SmartCRM Email Teszt - ' . date('Y-m-d H:i:s');
$testBody = "Ez egy teszt email a SmartCRM rendszerből.\n\nHa ezt az emailt megkaptad, az email küldési funkció helyesen működik!\n\nÜdvözlettel,\nSmartCRM";
$testHtml = "
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <h2 style='color: #2563eb;'>SmartCRM Email Teszt</h2>
    <div style='background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;'>
        <p>Ez egy teszt email a SmartCRM rendszerből.</p>
        <p>Ha ezt az emailt megkaptad, az email küldési funkció helyesen működik!</p>
    </div>
    <p style='color: #6b7280; font-size: 12px; margin-top: 30px;'>
        Küldve: " . date('Y-m-d H:i:s') . "
    </p>
</div>
";

// SMTP beállítások
$smtpUser = 'registration@rackhost.hu';
$smtpPass = 'Smartregistration';
$smtpHost = 'mail.rackhost.hu';
$smtpPort = 587;
$from = 'registration@rackhost.hu';

?>
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Teszt - Backend</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #2563eb; margin-top: 0; }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #1d4ed8; }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
        }
        .success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        .error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
        }
        .info {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #3b82f6;
        }
        pre {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 12px;
        }
        .log {
            margin-top: 20px;
            padding: 15px;
            background: #1e1e1e;
            color: #d4d4d4;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 500px;
            overflow-y: auto;
        }
        .log-entry {
            margin-bottom: 5px;
            padding: 3px 0;
            border-bottom: 1px solid #333;
        }
        .log-entry.success {
            color: #4ec9b0;
        }
        .log-entry.error {
            color: #f48771;
        }
        .log-entry.info {
            color: #569cd6;
        }
        .log-entry strong {
            color: #fff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Email Küldés Teszt (Backend)</h1>
        
        <form method="GET">
            <div class="form-group">
                <label for="to">Címzett email cím:</label>
                <input type="email" id="to" name="to" value="<?= htmlspecialchars($testEmail) ?>" required>
            </div>
            <button type="submit">Email küldése</button>
        </form>

        <?php
        if (isset($_GET['to'])) {
            echo "<div class='result info'>";
            echo "<h3>📧 Email küldés folyamatban...</h3>";
            echo "<p><strong>Címzett:</strong> " . htmlspecialchars($testEmail) . "</p>";
            echo "<p><strong>Tárgy:</strong> " . htmlspecialchars($testSubject) . "</p>";
            echo "</div>";
            
            echo "<div class='log' id='smtpLog'>";
            echo "<div class='log-entry info'><strong>[SMTP Log]</strong> Email küldés indítása...</div>";
            
            $logEntries = [];
            $startTime = microtime(true);
            
            try {
                // Socket kapcsolat létrehozása
                $logEntries[] = ['type' => 'info', 'message' => "Kapcsolódás az SMTP szerverhez: {$smtpHost}:{$smtpPort}"];
                $smtpConnection = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 30);
                
                if (!$smtpConnection) {
                    throw new Exception("SMTP kapcsolódási hiba: {$errstr} ({$errno})");
                }
                
                $logEntries[] = ['type' => 'success', 'message' => '✅ SMTP kapcsolat létrejött'];
                
                // SMTP handshake
                $response = fgets($smtpConnection, 515);
                $logEntries[] = ['type' => 'info', 'message' => "Szerver üdvözlése: " . trim($response)];
                
                if (substr($response, 0, 3) !== '220') {
                    throw new Exception("SMTP szerver nem válaszol megfelelően: {$response}");
                }
                
                // EHLO (először STARTTLS előtt)
                $ehloCmd = "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost');
                fputs($smtpConnection, $ehloCmd . "\r\n");
                $ehloResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "EHLO parancs: {$ehloCmd}"];
                $logEntries[] = ['type' => 'info', 'message' => "EHLO válasz: " . trim($ehloResponse['last'])];
                
                // STARTTLS
                $logEntries[] = ['type' => 'info', 'message' => 'STARTTLS parancs küldése...'];
                fputs($smtpConnection, "STARTTLS\r\n");
                $starttlsResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "STARTTLS válasz: " . trim($starttlsResponse['last'])];
                
                if ($starttlsResponse['code'] === '220') {
                    $logEntries[] = ['type' => 'info', 'message' => 'TLS kapcsolat létrehozása...'];
                    if (!stream_socket_enable_crypto($smtpConnection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                        throw new Exception("TLS kapcsolat létrehozása sikertelen");
                    }
                    // Újra EHLO TLS után
                    fputs($smtpConnection, $ehloCmd . "\r\n");
                    $ehloTlsResponse = readSmtpResponse($smtpConnection);
                    $logEntries[] = ['type' => 'success', 'message' => '✅ TLS kapcsolat létrejött'];
                    $logEntries[] = ['type' => 'info', 'message' => "EHLO (TLS után) válasz: " . trim($ehloTlsResponse['last'])];
                } else {
                    throw new Exception("STARTTLS hiba: {$starttlsResponse['last']}");
                }
                
                // AUTH LOGIN
                $logEntries[] = ['type' => 'info', 'message' => 'SMTP autentikáció indítása...'];
                fputs($smtpConnection, "AUTH LOGIN\r\n");
                $authResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "AUTH LOGIN válasz: " . trim($authResponse['last'])];
                
                if ($authResponse['code'] !== '334') {
                    throw new Exception("SMTP AUTH hiba: {$authResponse['last']}");
                }
                
                // Username
                $encodedUser = base64_encode($smtpUser);
                fputs($smtpConnection, $encodedUser . "\r\n");
                $usernameResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "Username küldve (base64): " . substr($encodedUser, 0, 20) . "..."];
                $logEntries[] = ['type' => 'info', 'message' => "Username válasz: " . trim($usernameResponse['last'])];
                
                if ($usernameResponse['code'] !== '334') {
                    throw new Exception("SMTP username hiba: {$usernameResponse['last']}");
                }
                
                // Password
                $encodedPass = base64_encode($smtpPass);
                fputs($smtpConnection, $encodedPass . "\r\n");
                $passwordResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "Password küldve (base64)"];
                $logEntries[] = ['type' => 'info', 'message' => "Password válasz: " . trim($passwordResponse['last'])];
                
                if ($passwordResponse['code'] !== '235') {
                    throw new Exception("SMTP authentication hiba: {$passwordResponse['last']}");
                }
                
                $logEntries[] = ['type' => 'success', 'message' => '✅ SMTP autentikáció sikeres'];
                
                // MAIL FROM
                $mailFromCmd = "MAIL FROM: <{$from}>";
                fputs($smtpConnection, $mailFromCmd . "\r\n");
                $mailFromResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "MAIL FROM parancs: {$mailFromCmd}"];
                $logEntries[] = ['type' => 'info', 'message' => "MAIL FROM válasz: " . trim($mailFromResponse['last'])];
                
                if ($mailFromResponse['code'] !== '250') {
                    throw new Exception("SMTP MAIL FROM hiba: {$mailFromResponse['last']}");
                }
                
                // RCPT TO
                $rcptToCmd = "RCPT TO: <{$testEmail}>";
                fputs($smtpConnection, $rcptToCmd . "\r\n");
                $rcptResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "RCPT TO parancs: {$rcptToCmd}"];
                $logEntries[] = ['type' => 'info', 'message' => "RCPT TO válasz: " . trim($rcptResponse['last'])];
                
                if ($rcptResponse['code'] !== '250') {
                    throw new Exception("SMTP RCPT TO hiba: {$rcptResponse['last']}");
                }
                
                // DATA
                $logEntries[] = ['type' => 'info', 'message' => 'Email tartalom küldése...'];
                fputs($smtpConnection, "DATA\r\n");
                $dataResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "DATA válasz: " . trim($dataResponse['last'])];
                
                if ($dataResponse['code'] !== '354') {
                    throw new Exception("SMTP DATA hiba: {$dataResponse['last']}");
                }
                
                // Email küldése
                $emailContent = "From: {$from}\r\n";
                $emailContent .= "To: {$testEmail}\r\n";
                $emailContent .= "Subject: =?UTF-8?B?" . base64_encode($testSubject) . "?=\r\n";
                $emailContent .= "MIME-Version: 1.0\r\n";
                $emailContent .= "Content-Type: text/html; charset=UTF-8\r\n";
                $emailContent .= "Content-Transfer-Encoding: base64\r\n";
                $emailContent .= "\r\n";
                $emailContent .= chunk_split(base64_encode($testHtml));
                $emailContent .= "\r\n.\r\n";
                
                $logEntries[] = ['type' => 'info', 'message' => 'Email tartalom küldése (' . strlen($emailContent) . ' bájt)...'];
                fputs($smtpConnection, $emailContent);
                $sendResponse = readSmtpResponse($smtpConnection);
                $logEntries[] = ['type' => 'info', 'message' => "Email küldés válasz: " . trim($sendResponse['last'])];
                
                if ($sendResponse['code'] !== '250') {
                    throw new Exception("SMTP email küldési hiba: {$sendResponse['last']}");
                }
                
                // QUIT
                fputs($smtpConnection, "QUIT\r\n");
                readSmtpResponse($smtpConnection);
                fclose($smtpConnection);
                
                $endTime = microtime(true);
                $duration = round(($endTime - $startTime) * 1000, 2);
                
                $logEntries[] = ['type' => 'success', 'message' => "✅ Email sikeresen elküldve! (Időtartam: {$duration}ms)"];
                
                // Log megjelenítése
                foreach ($logEntries as $entry) {
                    $icon = $entry['type'] === 'success' ? '✅' : ($entry['type'] === 'error' ? '❌' : 'ℹ️');
                    $class = 'log-entry ' . $entry['type'];
                    echo "<div class='{$class}'>[{$icon}] " . htmlspecialchars($entry['message']) . "</div>";
                }
                
                echo "</div>";
                
                echo "<div class='result success'>";
                echo "<h3>✅ Email sikeresen elküldve!</h3>";
                echo "<p><strong>Címzett:</strong> {$testEmail}</p>";
                echo "<p><strong>Tárgy:</strong> {$testSubject}</p>";
                echo "<p><strong>Küldés ideje:</strong> " . date('Y-m-d H:i:s') . "</p>";
                echo "<p><strong>Időtartam:</strong> {$duration}ms</p>";
                echo "<p style='margin-top: 15px; padding: 10px; background: #f0f9ff; border-radius: 4px;'>📬 Ellenőrizd a postafiókodat! Az email néhány másodpercen belül megérkezik.</p>";
                echo "</div>";
                
            } catch (Exception $e) {
                if (isset($smtpConnection) && is_resource($smtpConnection)) {
                    @fclose($smtpConnection);
                }
                
                // Log megjelenítése
                foreach ($logEntries as $entry) {
                    $icon = $entry['type'] === 'success' ? '✅' : ($entry['type'] === 'error' ? '❌' : 'ℹ️');
                    $class = 'log-entry ' . $entry['type'];
                    echo "<div class='{$class}'>[{$icon}] " . htmlspecialchars($entry['message']) . "</div>";
                }
                
                $logEntries[] = ['type' => 'error', 'message' => "Hiba: " . $e->getMessage()];
                echo "<div class='log-entry error'>[❌] " . htmlspecialchars($e->getMessage()) . "</div>";
                
                echo "</div>";
                
                echo "<div class='result error'>";
                echo "<h3>❌ Hiba történt!</h3>";
                echo "<p><strong>Hibaüzenet:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
                if (DEBUG_MODE) {
                    echo "<details style='margin-top: 10px;'>";
                    echo "<summary style='cursor: pointer; color: #991b1b;'>Részletes hiba információk (kattints a megnyitáshoz)</summary>";
                    echo "<pre style='margin-top: 10px;'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
                    echo "</details>";
                }
                echo "</div>";
            }
        }
        ?>
        
        <div style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 4px;">
            <h3>SMTP Beállítások:</h3>
            <ul>
                <li><strong>Host:</strong> <?= htmlspecialchars($smtpHost) ?></li>
                <li><strong>Port:</strong> <?= $smtpPort ?></li>
                <li><strong>User:</strong> <?= htmlspecialchars($smtpUser) ?></li>
                <li><strong>From:</strong> <?= htmlspecialchars($from) ?></li>
            </ul>
        </div>
    </div>
</body>
</html>

