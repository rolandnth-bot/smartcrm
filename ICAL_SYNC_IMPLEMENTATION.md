# iCal Sync Backend Implementáció - Összefoglaló

**Dátum**: 2026-01-23  
**Státusz**: ✅ Implementálva

## 📋 Összefoglaló

Az iCal szinkronizálás backend implementációja elkészült. A frontend már korábban kész volt, most a backend API endpointok és adatbázis támogatás is rendelkezésre áll.

## ✅ Elkészült Komponensek

### 1. API Endpointok

#### POST /api/ical/sync
- **Fájl**: `smartcrm-cpanel/api/endpoints/ical/sync.php`
- **Funkció**: Szinkronizálja az iCal feed-eket egy lakáshoz
- **Request Body**:
  ```json
  {
    "apartmentId": "uuid",
    "feedId": "airbnb" // opcionális, ha csak egy feed-et akarunk sync-elni
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "created": 5,
    "updated": 2,
    "cancelled": 1,
    "errors": [],
    "duration": 1234
  }
  ```

#### GET /api/ical/status/:apartmentId
- **Fájl**: `smartcrm-cpanel/api/endpoints/ical/status.php`
- **Funkció**: Lekérdezi az iCal feed-ek státuszát egy lakáshoz
- **Response**:
  ```json
  {
    "feeds": [
      {
        "id": "airbnb",
        "platform": "airbnb",
        "url": "https://...",
        "isActive": true,
        "status": "active",
        "lastSyncAt": "2026-01-23 10:00:00",
        "lastSuccessAt": "2026-01-23 10:00:00",
        "lastError": null,
        "eventsCount": 12
      }
    ]
  }
  ```

### 2. Helper Függvények

#### iCal Parser (`smartcrm-cpanel/api/helpers/icalParser.php`)
- `parseICalContent()` - Parseli az iCal tartalmat és kinyeri az eseményeket
- `parseICalDate()` - Konvertálja az iCal dátum formátumot ISO formátumra
- `fetchICalFromUrl()` - Letölti az iCal feed-et egy URL-ről (CORS proxy fallback-kel)
- `extractGuestName()` - Kinyeri a vendég nevét az iCal eseményből

### 3. Adatbázis Migráció

#### Migration fájl: `smartcrm-cpanel/sql/migration_ical_sync.sql`

**Új oszlopok az `apartments` táblában:**
- `ical_airbnb` VARCHAR(500) - Airbnb iCal feed URL
- `ical_booking` VARCHAR(500) - Booking.com iCal feed URL
- `ical_szallas` VARCHAR(500) - Szallas.hu iCal feed URL
- `ical_own` VARCHAR(500) - Saját iCal export URL

**Új oszlopok a `bookings` táblában:**
- `source` ENUM('manual', 'ical_sync', 'csv_import', 'api') - Foglalás forrása
- `feed_id` VARCHAR(50) - iCal feed azonosító
- `uid` VARCHAR(255) - iCal UID (duplikátum ellenőrzéshez)
- `synced_at` TIMESTAMP - Utolsó szinkronizálás időpontja

**Új táblák:**
- `sync_logs` - Szinkronizálási napló
- `import_batches` - Import batch-ek (CSV/ICS importokhoz)

### 4. API Router Frissítés

Az `api/index.php` fájlban hozzáadva:
- `POST:ical/sync` → `ical/sync.php`
- `GET:ical/status/{apartmentId}` → `ical/status.php`

### 5. Apartments Endpoint Frissítés

Az `apartments/update.php` endpoint mostantól támogatja az iCal mezőket:
- `ical_airbnb`
- `ical_booking`
- `ical_szallas`
- `ical_own`

## 🔧 Használat

### 1. Adatbázis migráció futtatása

```sql
-- Futtasd le a migration fájlt
SOURCE smartcrm-cpanel/sql/migration_ical_sync.sql;
```

Vagy manuálisan:
```bash
mysql -u username -p database_name < smartcrm-cpanel/sql/migration_ical_sync.sql
```

### 2. iCal URL beállítása

Az apartments update endpoint-on keresztül:
```javascript
await api.apartmentsUpdate(apartmentId, {
  ical_airbnb: 'https://airbnb.com/calendar/ical/...',
  ical_booking: 'https://booking.com/ical/...'
});
```

### 3. Szinkronizálás indítása

```javascript
// Összes feed szinkronizálása
await api.icalSync(apartmentId);

// Csak egy feed szinkronizálása
await api.icalSync(apartmentId, 'airbnb');
```

### 4. Státusz lekérdezés

```javascript
const status = await api.icalStatus(apartmentId);
console.log(status.feeds);
```

## 🎯 Főbb Funkciók

1. **Automatikus foglalás létrehozás/frissítés**: Az iCal feed-ekből automatikusan létrehozza vagy frissíti a foglalásokat
2. **Duplikátum kezelés**: Az iCal UID alapján észleli a duplikátumokat és frissíti a meglévő foglalásokat
3. **Platform mapping**: Automatikusan mapeli a platformokat (airbnb → 'airbnb', booking → 'booking', szallas → 'other')
4. **Vendég név kinyerés**: Intelligensen kinyeri a vendég nevét az iCal eseményből
5. **Hibakezelés**: Részletes hibakezelés és naplózás
6. **CORS proxy fallback**: Ha a közvetlen letöltés nem sikerül, CORS proxy-t használ

## 📝 Megjegyzések

- Az iCal parser egyszerű implementáció, de működik a legtöbb platform iCal formátummal (Airbnb, Booking.com, stb.)
- A sync_logs tábla opcionális - ha nem létezik, a sync továbbra is működik, csak nem naplóz
- A bookings táblában a `source` mező alapértelmezetten 'manual', az iCal sync során 'ical_sync'-re változik
- A `uid` mező tárolja az iCal UID-t, így a duplikátumok észlelése működik

## 🚀 Következő Lépések (Opcionális)

A `ical-sync-todolist.md` fájlban dokumentált további fejlesztések:
- [ ] Ütemezett sync (cron job)
- [ ] Retry logic sikertelen sync-ekhez
- [ ] Email értesítések sync hibák esetén
- [ ] Unit tesztek
- [ ] E2E tesztek
- [ ] Permission rendszer (jelenleg nincs auth check)

## ✅ Tesztelés

1. **Adatbázis migráció**: Futtasd le a migration SQL-t
2. **iCal URL beállítása**: Állíts be egy teszt iCal URL-t egy lakáshoz
3. **Sync indítása**: Hívd meg a POST /api/ical/sync endpointot
4. **Eredmény ellenőrzése**: Nézd meg a bookings táblát és a sync_logs táblát

---

**Implementálva**: 2026-01-23  
**Verzió**: 1.0.0
