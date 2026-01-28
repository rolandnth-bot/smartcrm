# Teszt Adatok Telepítése - Gyors Útmutató

## ⚠️ FONTOS: Az API endpoint-ok most már működnek!

A `leads` API endpoint-ok most már létre lettek hozva és hozzáadva az API router-hez.

## 📋 Telepítési Lépések

### 1. Adatbázis ellenőrzése
```bash
# Ellenőrizd, hogy létezik-e az adatbázis
mysql -u root -p -e "SHOW DATABASES LIKE 'smartcrm_db';"
```

### 2. Alap séma telepítése (ha még nincs)
```bash
mysql -u root -p smartcrm_db < sql/database.sql
```

### 3. Finance & Accounting séma (ha kell)
```bash
mysql -u root -p smartcrm_db < sql/finance_accounting_schema.sql
```

### 4. Teszt adatok betöltése
```bash
mysql -u root -p smartcrm_db < sql/test_data_seed.sql
```

### 5. Ellenőrzés
```bash
# Lead-ek száma
mysql -u root -p smartcrm_db -e "SELECT COUNT(*) as lead_count FROM leads;"

# Foglalások száma
mysql -u root -p smartcrm_db -e "SELECT COUNT(*) as booking_count FROM bookings;"

# Lakások száma
mysql -u root -p smartcrm_db -e "SELECT COUNT(*) as apartment_count FROM apartments;"
```

## 🔧 Ha az adatok nem jelennek meg

### 1. Ellenőrizd az API konfigurációt
- Nyisd meg: `smartcrm-cpanel/config/config.php`
- Ellenőrizd: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

### 2. Ellenőrizd a frontend API URL-t
- Nyisd meg: `.env` vagy `.env.local`
- Ellenőrizd: `VITE_API_BASE_URL` értéke

### 3. Teszteld az API-t közvetlenül
```bash
# Lead-ek listázása
curl http://localhost/smartcrm-cpanel/api/leads

# Vagy ha más URL-t használsz:
curl http://localhost:8080/api/leads
```

### 4. Böngésző konzol ellenőrzése
- Nyisd meg a Developer Tools-t (F12)
- Nézd meg a Network tab-ot
- Ellenőrizd, hogy a `/api/leads` kérés sikeres-e

## ✅ Várt Eredmények

A teszt adatok betöltése után:
- **7 lead** különböző státuszokkal
- **8 foglalás** különböző dátumokkal
- **5 lakás** különböző partnerekkel
- **5 takarítás** különböző státuszokkal
- **6 pénzügyi tétel** (3 bevétel + 3 kiadás)

## 🐛 Hibaelhárítás

### "API endpoint not found" hiba
- Ellenőrizd, hogy a `smartcrm-cpanel/api/endpoints/leads/` mappa létezik-e
- Ellenőrizd, hogy a `smartcrm-cpanel/api/index.php` tartalmazza-e a leads route-okat

### "Database connection error" hiba
- Ellenőrizd az adatbázis hitelesítési adatokat
- Ellenőrizd, hogy az adatbázis fut-e

### "No data" a frontend-en
- Frissítsd az oldalt (F5)
- Ellenőrizd a böngésző konzolt hibákért
- Ellenőrizd, hogy az API válasz tartalmazza-e az adatokat

---

**Utolsó frissítés**: 2026-01-23
