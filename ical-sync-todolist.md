# SmartCRM - iCal Sync & Import Fejlesztői Teendőlista

## 📋 Összefoglaló

A SmartCRM iCal szinkronizálás és CSV import funkcióinak továbbfejlesztéséhez szükséges feladatok backend és frontend bontásban.

---

## 🎨 FRONTEND FELADATOK

### 1. Új UI Elemek

#### 1.1 Naptár csempe (Dashboard)
- [x] Dashboard-ra új "Naptár áttekintő" widget ✅
- [x] Mini hónap nézet foglaltság színkódokkal (Airbnb: rózsaszín, Booking: kék, stb.) ✅
- [x] Kattintható napok → részletes foglalás modal ✅
- [x] Mai nap kiemelése + közelgő check-in/check-out badge-ek ✅
- [x] Szűrés lakásonként (dropdown vagy chip-ek) ✅

#### 1.2 iCal Blokk (Naptár tabon belül)
- [x] Feed lista kompakt kártya nézetben ✅
- [x] Státusz indikátorok vizuális frissítése (spinner sync közben) ✅
- [x] "Utolsó sync" relatív időbélyeg (pl. "5 perce") ✅
- [x] Bulk műveletek: összes aktív feed sync, összes feed letiltás ✅
- [x] Feed URL másolás gomb (clipboard) ✅
- [x] Collapsible lakás csoportok (sok lakásnál) ✅

#### 1.3 Lakáslista (iCal-hoz kapcsolt)
- [x] iCal oszlop hozzáadása: feed-ek száma + státusz ikon ✅
- [x] Quick-action: "Sync" gomb közvetlenül a listában ✅
- [x] Filter: "Csak iCal nélküli lakások" ✅
- [x] Bulk iCal hozzáadás (több lakáshoz egyszerre) ✅

#### 1.4 Import Modal (CSV + iCal)
- [x] Drag & drop fájl feltöltés ✅
- [x] Oszlop mapping UI fejlesztése:
  - [x] Auto-detect jelölés (✓ automatikusan felismert) ✅
  - [x] Minta adat preview (első 3-5 sor inline) ✅
- [x] Előnézet táblázat:
  - [x] Hibás sorok piros háttér + tooltip hibaüzenettel ✅
  - [x] Érvényes/hibás számláló ✅
  - [x] "Csak hibásak" szűrő ✅
- [x] Import progress bar (nagy fájloknál) ✅
- [x] Eredmény összefoglaló: létrehozott/frissített/kihagyott ✅

### 2. Frontend Állapotkezelés
- [x] `icalSyncStatus` state bővítése: `{ feedId, progress, startedAt }` ✅
- [x] `importState` új state: `{ step, file, mapping, preview, errors, results }` ✅
- [x] Toast üzenetek queue kezelése (több üzenet egymás után) ✅
- [x] Optimistic UI update sync indításkor ✅

---

## ⚙️ BACKEND FELADATOK

### 3. Új API Endpointok

#### 3.1 iCal Sync
```
POST /api/ical/sync
Body: { apartmentId, feedId }
Response: { success, created, updated, cancelled, errors[] }
```
- [ ] Endpoint létrehozása
- [ ] CORS proxy integráció (allorigins helyett saját)
- [ ] Rate limiting: max 10 sync/perc/lakás
- [ ] Timeout kezelés (30s)

#### 3.2 Sync Státusz
```
GET /api/ical/status/:apartmentId
Response: { feeds: [{ id, status, lastSync, eventsCount, error }] }
```
- [ ] Valós idejű státusz lekérdezés
- [ ] WebSocket opció folyamatos frissítéshez

#### 3.3 Import Előnézet
```
POST /api/import/preview
Body: { apartmentId, fileContent, mapping }
Response: { valid: [], invalid: [], warnings[] }
```
- [ ] CSV/ICS parsing backend oldalon
- [ ] Validálás: dátum formátum, duplikátum check, kötelező mezők
- [ ] Figyelmeztetések: átfedő foglalások, múltbeli dátumok

#### 3.4 Import Futtatás
```
POST /api/import/execute
Body: { apartmentId, bookings[], options: { skipDuplicates, updateExisting } }
Response: { created, updated, skipped, errors[] }
```
- [ ] Tranzakcionális mentés (Firebase batch)
- [ ] Rollback hiba esetén
- [ ] Import log létrehozása

### 4. Háttérfolyamatok
- [ ] Ütemezett sync (cron): minden 15 percben aktív feed-ek
- [ ] Retry logic: sikertelen sync újrapróbálása (max 3x)
- [ ] Értesítés: email/push ha sync tartósan sikertelen

---

## 🗄️ ADATBÁZIS MÓDOSÍTÁSOK

### 5. Apartment Dokumentum Bővítés
```javascript
apartments/{id}: {
  ...existing,
  icalFeeds: [{
    id: string,
    platform: 'airbnb' | 'booking' | 'szallas' | 'other',
    url: string,
    isActive: boolean,
    // ÚJ MEZŐK:
    syncStatus: 'active' | 'pending' | 'error' | 'inactive',
    lastSyncAt: timestamp,
    lastSuccessAt: timestamp,
    lastError: string | null,
    eventsCount: number,
    syncInterval: number, // percben (default: 15)
    createdAt: timestamp,
    updatedAt: timestamp
  }]
}
```

### 6. Új Collection: Sync Log
```javascript
syncLogs/{id}: {
  apartmentId: string,
  feedId: string,
  type: 'ical_sync' | 'csv_import' | 'manual',
  status: 'success' | 'partial' | 'failed',
  startedAt: timestamp,
  completedAt: timestamp,
  duration: number, // ms
  results: {
    created: number,
    updated: number,
    cancelled: number,
    skipped: number
  },
  errors: string[],
  triggeredBy: 'user' | 'cron' | 'system'
}
```

### 7. Booking Dokumentum Bővítés
```javascript
bookings/{id}: {
  ...existing,
  // ÚJ MEZŐK:
  source: 'manual' | 'ical_sync' | 'csv_import' | 'api',
  feedId: string | null,
  uid: string | null, // iCal UID
  syncedAt: timestamp,
  importBatchId: string | null
}
```

### 8. Új Collection: Import Batches
```javascript
importBatches/{id}: {
  apartmentId: string,
  fileName: string,
  fileType: 'csv' | 'ics',
  uploadedAt: timestamp,
  processedAt: timestamp,
  status: 'pending' | 'completed' | 'failed',
  mapping: object,
  stats: {
    totalRows: number,
    validRows: number,
    importedRows: number
  },
  userId: string
}
```

---

## ✅ VALIDÁLÁS

### 9. Input Validálás
- [ ] iCal URL: regex pattern, https kötelező
- [ ] CSV: max 10MB, max 5000 sor
- [ ] Dátum: ISO format vagy magyar format (YYYY.MM.DD)
- [ ] Platform: enum értékek ellenőrzése
- [ ] Vendég név: max 100 karakter, XSS szűrés

### 10. Üzleti Logika Validálás
- [ ] Átfedő foglalások figyelmeztetés
- [ ] Múltbeli check-in dátum figyelmeztetés
- [ ] Duplikált UID kezelés (update vs skip)
- [ ] Érvénytelen ICS formátum kezelés

---

## 📝 LOGOLÁS

### 11. Frontend Logging
- [ ] Sync események: `console.log` → strukturált log object
- [ ] Error boundary: React error logging
- [ ] Performance: sync időtartam mérése

### 12. Backend Logging
- [ ] Minden API hívás logolása (request/response)
- [ ] Sync eredmények részletes naplózása
- [ ] Error stack trace mentése
- [ ] Audit log: ki, mikor, mit importált

---

## 🔐 PERMISSION / JOGOSULTSÁGOK

### 13. Szerepkör Alapú Hozzáférés
```
Admin:
  - Összes lakás iCal kezelése
  - Sync indítás bármelyik lakáshoz
  - Import log megtekintése
  - Sync beállítások módosítása

Partner:
  - Csak saját lakásai iCal kezelése
  - Sync indítás saját lakásokhoz
  - Saját import log megtekintése

Cleaner:
  - Nincs iCal hozzáférés
  - Csak naptár megtekintés (read-only)
```

### 14. API Védelem
- [ ] Firebase Auth token ellenőrzés
- [ ] Apartment ownership check
- [ ] Rate limiting user szinten
- [ ] CORS whitelist

---

## 🧪 TESZTESETEK

### 15. Unit Tesztek

#### Frontend (Jest + React Testing Library)
```javascript
// parseICS.test.js
- [ ] "Airbnb ICS formátum helyes parse"
- [ ] "Booking.com ICS formátum helyes parse"
- [ ] "Hibás ICS graceful error"
- [ ] "Üres ICS üres tömböt ad"
- [ ] "Speciális karakterek kezelése vendég névben"

// parseCSV.test.js
- [ ] "Pontosvesszővel elválasztott CSV"
- [ ] "Tab-delimited CSV"
- [ ] "Idézőjeles mezők"
- [ ] "Üres sorok kihagyása"
- [ ] "UTF-8 BOM kezelése"

// columnMapping.test.js
- [ ] "Auto-detect checkIn oszlop"
- [ ] "Magyar fejléc nevek felismerése"
- [ ] "Ismeretlen oszlopok kihagyása"

// validation.test.js
- [ ] "Érvényes dátum formátumok"
- [ ] "Hibás URL elutasítása"
- [ ] "XSS injection szűrése"
```

#### Backend (Mocha/Jest)
```javascript
// icalSync.test.js
- [ ] "Sikeres sync létrehozza a foglalásokat"
- [ ] "Meglévő foglalás frissítése"
- [ ] "Törölt esemény soft delete"
- [ ] "Timeout kezelés"
- [ ] "CORS proxy fallback"

// importService.test.js
- [ ] "CSV import tranzakcionális"
- [ ] "Rollback hiba esetén"
- [ ] "Batch limit (max 100)"

// permissions.test.js
- [ ] "Admin hozzáfér minden lakáshoz"
- [ ] "Partner csak sajáthoz"
- [ ] "Cleaner nem fér hozzá"
```

### 16. E2E Tesztek (Cypress/Playwright)

#### Happy Path
```javascript
// ical-sync.e2e.js
- [ ] "Új iCal feed hozzáadása"
  1. Naptár tab megnyitása
  2. iCal Sync gomb kattintás
  3. Lakás kiválasztása
  4. URL beírása
  5. Mentés
  6. Sync gomb
  7. Toast üzenet ellenőrzése
  8. Foglalások megjelenése naptárban

- [ ] "Összes feed szinkronizálása"
  1. iCal panel megnyitása
  2. "Összes sync" gomb
  3. Progress indikátor
  4. Sikeres befejezés

// csv-import.e2e.js
- [ ] "CSV import végigvezetése"
  1. Foglalások tab
  2. CSV Import gomb
  3. Fájl feltöltés
  4. Oszlop mapping
  5. Előnézet ellenőrzés
  6. Import futtatás
  7. Eredmény ellenőrzés
```

#### Edge Cases
```javascript
// error-handling.e2e.js
- [ ] "Hibás URL hibaüzenet"
- [ ] "Időtúllépés kezelése"
- [ ] "Offline működés"
- [ ] "Duplikált foglalás figyelmeztetés"
- [ ] "Nagy fájl (5000+ sor) kezelése"
```

#### Permission Tests
```javascript
// permissions.e2e.js
- [ ] "Partner nem látja más lakásait"
- [ ] "Cleaner nem fér hozzá iCal-hoz"
- [ ] "Admin mindent lát"
```

---

## 📊 Prioritás & Becslés

| Feladat | Prioritás | Becsült idő |
|---------|-----------|-------------|
| API endpointok | 🔴 Kritikus | 3-4 nap |
| DB séma módosítás | 🔴 Kritikus | 1 nap |
| iCal UI fejlesztés | 🟡 Fontos | 2-3 nap |
| Import modal | 🟡 Fontos | 2 nap |
| Validálás | 🟡 Fontos | 1-2 nap |
| Jogosultságok | 🟡 Fontos | 1 nap |
| Unit tesztek | 🟢 Ajánlott | 2 nap |
| E2E tesztek | 🟢 Ajánlott | 2 nap |
| Logolás | 🟢 Ajánlott | 1 nap |
| **Összesen** | | **~15-18 nap** |

---

## 🚀 Javasolt Implementációs Sorrend

1. **Sprint 1** (5 nap): DB séma + API endpointok + alapvető validálás
2. **Sprint 2** (5 nap): Frontend UI elemek + permission rendszer
3. **Sprint 3** (5 nap): Tesztek + logolás + finomhangolás

---

*Generálva: 2026-01-20*
*SmartCRM v2.0 - HNR Smart Invest Kft.*
