<?php
/**
 * Teszt Adatok Betöltése
 * Futtasd ezt a fájlt a böngészőből: http://localhost/smartcrm-cpanel/load_test_data.php
 * VAGY futtasd terminálból: php load_test_data.php
 */

require_once __DIR__ . '/config/config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Teszt Adatok Betöltése</title></head><body>";
echo "<h1>SmartCRM - Teszt Adatok Betöltése</h1>";
echo "<pre>";

try {
    $db = getDB();
    echo "✅ Adatbázis kapcsolat sikeres!\n\n";
    
    // Olvasd be a teszt adatok SQL fájlt
    $sqlFile = __DIR__ . '/../sql/test_data_seed.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("A teszt adatok fájl nem található: $sqlFile");
    }
    
    echo "📄 SQL fájl olvasása: $sqlFile\n";
    $sql = file_get_contents($sqlFile);
    
    if (empty($sql)) {
        throw new Exception("Az SQL fájl üres!");
    }
    
    // SQL parancsok feldolgozása (több soros INSERT-ek kezelése)
    $sql = str_replace(["\r\n", "\r"], "\n", $sql);
    
    // Töröld a kommenteket és üres sorokat
    $sql = preg_replace('/--.*$/m', '', $sql);
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
    
    // Vágd fel statement-ekre
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^(SET|CREATE|ALTER|DROP)/i', $stmt);
        }
    );
    
    // Végrehajtás
    $db->beginTransaction();
    
    $successCount = 0;
    $errorCount = 0;
    $errors = [];
    
    foreach ($statements as $index => $statement) {
        if (empty(trim($statement))) continue;
        
        try {
            // INSERT INTO kezelése
            if (preg_match('/^INSERT\s+INTO\s+`?(\w+)`?/i', $statement, $matches)) {
                $table = $matches[1];
                $db->exec($statement);
                $successCount++;
                if ($successCount <= 5 || $successCount % 10 == 0) {
                    echo "✅ $table: adatok beszúrva\n";
                }
            } elseif (preg_match('/^UPDATE\s+`?(\w+)`?/i', $statement, $matches)) {
                $table = $matches[1];
                $db->exec($statement);
                echo "✅ $table: adatok frissítve\n";
            } else {
                // Egyéb SQL (CREATE, ALTER, stb.) - próbáljuk meg végrehajtani
                $db->exec($statement);
            }
        } catch (PDOException $e) {
            $errorCount++;
            $errorMsg = "❌ Hiba a statement végrehajtásakor: " . $e->getMessage();
            $errors[] = $errorMsg;
            echo $errorMsg . "\n";
            
            // Ha túl sok hiba van, álljunk meg
            if ($errorCount > 20) {
                throw new Exception("Túl sok hiba történt. Álljunk meg.");
            }
        }
    }
    
    $db->commit();
    
    echo "\n";
    echo "════════════════════════════════════════\n";
    echo "✅ SIKERESEN BETÖLTVE!\n";
    echo "════════════════════════════════════════\n";
    echo "Sikeres statement-ek: $successCount\n";
    echo "Hibás statement-ek: $errorCount\n";
    
    // Ellenőrzés: számoljuk meg az adatokat
    echo "\n📊 Adatbázis tartalom:\n";
    
    $tables = ['users', 'apartments', 'leads', 'bookings', 'cleanings', 'workers'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as cnt FROM `$table`");
            $count = $stmt->fetch()['cnt'];
            echo "  - $table: $count rekord\n";
        } catch (PDOException $e) {
            echo "  - $table: tábla nem létezik vagy hiba\n";
        }
    }
    
    if ($errorCount > 0) {
        echo "\n⚠️ Figyelem: $errorCount hiba történt. Nézd meg a fenti hibákat.\n";
    }
    
    echo "\n✅ KÉSZ! Most frissítsd a frontend-et (F5)!\n";
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo "\n❌ HIBA: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "</pre>";
echo "</body></html>";
