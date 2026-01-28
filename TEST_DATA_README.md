# Teszt Adatok - Használati Útmutató

## 📋 Összefoglaló

Ez a fájl (`sql/test_data_seed.sql`) tartalmazza a teljes SmartCRM rendszer teszteléséhez szükséges valósághű teszt adatokat.

## 🚀 Telepítés

### 1. Adatbázis létrehozása (ha még nincs)
```bash
mysql -u root -p
CREATE DATABASE smartcrm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartcrm_db;
```

### 2. Alap séma telepítése
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

## 📊 Teszt Adatok Tartalma

### 👥 Felhasználók
- **1 Admin**: `admin@smartcrm.hu` / `password` (vagy bármi, mert hash-elt)
- **3 Partner**: 
  - Kovács Péter (`partner-001`)
  - Nagy Mária (`partner-002`)
  - Szabó László (`partner-003`)
- **3 Dolgozó**: Tóth Anna, Horváth Zsuzsa, Kiss János

### 🏠 Lakások (5 db)
1. **A57 Downtown** (partner-001)
   - iCal: Airbnb ✅, Booking.com ✅, Saját ✅
   - Foglalások: 3 db
   
2. **Angyalföldi Panoráma** (partner-001)
   - iCal: Airbnb ✅, Booking.com ✅, Szallas.hu ✅, Saját ✅
   - Foglalások: 2 db

3. **B20 Keleti** (partner-002)
   - iCal: Saját ✅
   - Foglalások: 1 db

4. **Dunakeszi Meder** (partner-002)
   - iCal: Airbnb ✅, Saját ✅
   - Foglalások: 1 db

5. **Margit-sziget Panoráma** (partner-003)
   - iCal: Booking.com ✅, Saját ✅
   - Foglalások: 1 db

### 📝 Leadek (7 db)
- **new**: Nagy István (hot)
- **contacted**: Kovácsné Mária (warm)
- **meeting**: Szabó János (hot)
- **offer**: Tóth Anna (warm)
- **negotiation**: Horváth Péter (hot)
- **won**: Kiss Zsuzsa (hot) → **Foglalás lett belőle!**
- **lost**: Varga László (cold)

### 📅 Foglalások (8 db)
- **booking-001**: A57 Downtown, 2026-01-25 → 2026-01-30 (Airbnb, confirmed)
- **booking-002**: A57 Downtown, 2026-02-05 → 2026-02-10 (Booking.com, confirmed)
- **booking-003**: Angyalföldi, 2026-01-23 → 2026-01-28 (Airbnb, checked_in) ⭐ **MA VAN CHECK-IN!**
- **booking-004**: Angyalföldi, 2026-02-15 → 2026-02-22 (Booking.com, confirmed)
- **booking-005**: B20 Keleti, 2026-01-24 → 2026-01-27 (Direct, confirmed)
- **booking-006**: Dunakeszi Meder, 2026-02-10 → 2026-02-17 (Airbnb, confirmed)
- **booking-007**: Margit-sziget, 2026-02-20 → 2026-02-25 (Booking.com, confirmed)
- **booking-008**: A57 Downtown, 2026-02-28 → 2026-03-05 (Airbnb, confirmed)

### 🧹 Takarítások (5 db)
- **cleaning-001**: A57 Downtown, 2026-01-23 (planned)
- **cleaning-002**: Angyalföldi, 2026-01-28 (planned, textil)
- **cleaning-003**: A57 Downtown, 2026-01-30 (planned)
- **cleaning-004**: B20 Keleti, 2026-01-27 (completed)
- **cleaning-005**: Angyalföldi, 2026-02-22 (planned, textil)

### 💰 Pénzügyi Tételek
- **3 Bevétel**: Foglalási bevételek (36600, 44500, 16800 HUF)
- **3 Kiadás**: Takarítási költségek (15000, 20000, 12500 HUF)

### 🏦 Bankszámlák
- **Wise EUR**: 5000 EUR
- **Revolut HUF**: 2,500,000 HUF
- **OTP HUF**: 1,500,000 HUF

### 📄 Számlák (Accounting)
- **inv-001**: A57-2026-001 (paid, 38100 HUF)
- **inv-002**: A57-2026-002 (issued, 38100 HUF)
- **inv-003**: ANG-2026-001 (paid, 44450 HUF)

## 🎯 Tesztelési Scenáriók

### 1. Naptár Nézet
- Nyisd meg a Foglalások oldalt → Naptár nézet
- Látható: **booking-003** (Angyalföldi) **MA VAN CHECK-IN!** (2026-01-23)
- Látható: **booking-005** (B20 Keleti) holnap check-in (2026-01-24)

### 2. iCal Szinkronizálás
- Nyisd meg a Lakások oldalt
- Kattints az "iCal" gombra bármelyik lakáson
- Látható: Airbnb, Booking.com, Szallas.hu, Saját URL mezők
- Teszt: Add meg egy valós iCal URL-t és szinkronizálj

### 3. Új Lakás Hozzáadása
- Nyisd meg a Lakások oldalt
- Kattints a "+ Új lakás" gombra
- Töltsd ki az adatokat és mentsd el

### 4. Lead Pipeline
- Nyisd meg a Leadek oldalt
- Látható: 7 lead különböző státuszokkal
- Teszt: Változtasd meg egy lead státuszát

### 5. Foglalás Létrehozása
- Nyisd meg a Foglalások oldalt
- Kattints az "Új foglalás" gombra
- Válassz lakást, dátumokat, vendéget

### 6. Takarítás Kezelése
- Nyisd meg a Takarítás oldalt
- Látható: 5 takarítás különböző státuszokkal
- Teszt: Generálj takarításokat foglalásokból

### 7. Pénzügy Dashboard
- Nyisd meg a Pénzügy oldalt (ha van)
- Látható: Bevételek, kiadások, cashflow

### 8. Számlázás
- Nyisd meg a Könyvelés oldalt (ha van)
- Látható: Számlák, díjbekérők

## 🔑 Bejelentkezési Adatok

### Admin
- **Email**: `admin@smartcrm.hu`
- **Jelszó**: `password` (vagy amit beállítottál)

### Partner
- **Email**: `kovacs.peter@example.hu`
- **Jelszó**: `password` (vagy amit beállítottál)

## 📝 Megjegyzések

1. **Dátumok**: A teszt adatok 2026 január-február időszakra vonatkoznak
2. **Kapcsolatok**: Minden adat kapcsolódik egymáshoz (lakások → partnerek, foglalások → lakások, stb.)
3. **iCal URL-ek**: A teszt iCal URL-ek példa URL-ek, valós szinkronizáláshoz valós URL-eket kell megadni
4. **Pénzügyi adatok**: A bankszámla egyenlegek automatikusan frissülnek a tranzakciók alapján

## 🔄 Adatok Törlése

Ha törölni szeretnéd a teszt adatokat:

```sql
-- VIGYÁZAT: Ez törli az ÖSSZES adatot!
TRUNCATE TABLE finance_transactions;
TRUNCATE TABLE cleanings;
TRUNCATE TABLE bookings;
TRUNCATE TABLE leads;
TRUNCATE TABLE apartment_inventory;
TRUNCATE TABLE apartment_amenities;
TRUNCATE TABLE apartments;
TRUNCATE TABLE workers;
DELETE FROM users WHERE id != 'admin-001';
```

Vagy teljes újratelepítés:
```bash
mysql -u root -p -e "DROP DATABASE smartcrm_db; CREATE DATABASE smartcrm_db;"
mysql -u root -p smartcrm_db < sql/database.sql
mysql -u root -p smartcrm_db < sql/finance_accounting_schema.sql
mysql -u root -p smartcrm_db < sql/test_data_seed.sql
```

---

**Készítve**: 2026-01-23  
**Verzió**: 1.0.0
