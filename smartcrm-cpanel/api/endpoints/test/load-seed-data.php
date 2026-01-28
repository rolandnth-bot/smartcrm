<?php
/**
 * Load Test Data API
 * POST /api/test/load-seed-data
 * 
 * Betölti a teszt adatokat az adatbázisba
 */

// Csak development módban
if (!DEBUG_MODE) {
    jsonResponse(['error' => 'Ez a funkció csak development módban elérhető'], 403);
}

$db = getDB();

try {
    $sqlFile = __DIR__ . '/../../../sql/test_data_seed.sql';
    
    if (!file_exists($sqlFile)) {
        jsonResponse(['error' => 'A teszt adatok fájl nem található'], 404);
    }
    
    $sql = file_get_contents($sqlFile);
    
    if (empty($sql)) {
        jsonResponse(['error' => 'Az SQL fájl üres'], 400);
    }
    
    // SQL feldolgozás
    $sql = str_replace(["\r\n", "\r"], "\n", $sql);
    $sql = preg_replace('/--.*$/m', '', $sql);
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
    
    // Vágd fel statement-ekre
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt);
        }
    );
    
    $db->beginTransaction();
    
    $results = [
        'success' => 0,
        'errors' => 0,
        'messages' => []
    ];
    
    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;
        
        try {
            // SET parancsok kihagyása
            if (preg_match('/^SET\s+/i', $statement)) {
                continue;
            }
            
            $db->exec($statement);
            $results['success']++;
            
            // Tábla név kinyerése
            if (preg_match('/INSERT\s+INTO\s+`?(\w+)`?/i', $statement, $matches)) {
                $table = $matches[1];
                $results['messages'][] = "✅ $table: adatok beszúrva";
            }
        } catch (PDOException $e) {
            $results['errors']++;
            $results['messages'][] = "❌ Hiba: " . $e->getMessage();
            
            // Ha túl sok hiba, álljunk meg
            if ($results['errors'] > 50) {
                throw new Exception("Túl sok hiba történt");
            }
        }
    }
    
    $db->commit();
    
    // Ellenőrzés
    $counts = [];
    $tables = ['users', 'apartments', 'leads', 'bookings', 'cleanings', 'workers'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as cnt FROM `$table`");
            $counts[$table] = (int)$stmt->fetch()['cnt'];
        } catch (PDOException $e) {
            $counts[$table] = 0;
        }
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Teszt adatok sikeresen betöltve',
        'statistics' => $results,
        'counts' => $counts
    ]);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(['error' => $e->getMessage()], 500);
}
