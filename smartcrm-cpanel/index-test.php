<?php
/**
 * Egyszerű teszt oldal - ha a szerver fut, ez biztosan elérhető
 */
?>
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartCRM - Teszt</title>
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
        h1 { color: #2563eb; }
        .success {
            background: #d1fae5;
            color: #065f46;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .link {
            display: inline-block;
            margin: 10px 10px 10px 0;
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .link:hover {
            background: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ SmartCRM Backend Szerver</h1>
        <div class="success">
            <strong>A PHP szerver fut!</strong><br>
            Szerver idő: <?= date('Y-m-d H:i:s') ?><br>
            PHP verzió: <?= phpversion() ?>
        </div>
        
        <h2>Elérhető oldalak:</h2>
        <a href="test-email.php" class="link">📧 Email Teszt</a>
        <a href="test-email.php?to=teszt@example.com" class="link">📧 Email Teszt (példa email)</a>
        <a href="api/auth/check" class="link">🔌 API Teszt</a>
        
        <h2 style="margin-top: 30px;">Használat:</h2>
        <p>Az email teszt oldal eléréséhez:</p>
        <code style="background: #f3f4f6; padding: 10px; display: block; border-radius: 4px; margin: 10px 0;">
            http://localhost:8080/test-email.php?to=SAJAT_EMAIL@example.com
        </code>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            💡 Ha nem látod ezt az oldalt, ellenőrizd, hogy a PHP szerver fut-e:<br>
            <code style="background: #f3f4f6; padding: 5px; border-radius: 4px;">cd smartcrm-cpanel && php -S localhost:8080</code>
        </p>
    </div>
</body>
</html>


