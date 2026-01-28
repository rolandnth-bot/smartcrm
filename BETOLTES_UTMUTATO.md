# 🚀 TESZT ADATOK BETÖLTÉSE - AZONNALI ÚTMUTATÓ

## ⚠️ FONTOS: Most már minden kész!

Létrehoztam:
1. ✅ **Leads API endpoint-ok** (list, create, update, delete, get)
2. ✅ **PHP script** a teszt adatok betöltéséhez
3. ✅ **API endpoint** a teszt adatok betöltéséhez

## 📋 HÁROM MÓDSZER A BETÖLTÉSRE

### 1️⃣ MÓDSZER: Böngészőből (LEGEGYSZERŰBB!)

Nyisd meg a böngészőben:
```
http://localhost/smartcrm-cpanel/load_test_data.php
```

VAGY ha más URL-t használsz:
```
http://localhost:8080/smartcrm-cpanel/load_test_data.php
```

Ez automatikusan betölti az összes teszt adatot!

---

### 2️⃣ MÓDSZER: API hívás (Terminálból)

```bash
curl -X POST http://localhost/smartcrm-cpanel/api/test/load-seed-data
```

---

### 3️⃣ MÓDSZER: MySQL parancs (Ha van mysql a gépeden)

```bash
mysql -u root -p smartcrm_db < sql/test_data_seed.sql
```

---

## ✅ MIT FOGSZ LÁTNI BETÖLTÉS UTÁN?

### Leadek kezelése oldal:
- **7 lead** különböző státuszokkal:
  - Új érdeklődő: 1
  - Kapcsolatfelvétel: 1
  - Találkozó egyeztetve: 1
  - Ajánlat kiküldve: 1
  - Tárgyalás: 1
  - Megnyert: 1
  - Elvesztett: 1

### Értékesítés oldal:
- Ugyanazok a 7 lead, pipeline nézetben

### Lakások oldal:
- **5 lakás**:
  - A57 Downtown (partner-001)
  - Angyalföldi Panoráma (partner-001)
  - B20 Keleti (partner-002)
  - Dunakeszi Meder (partner-002)
  - Margit-sziget Panoráma (partner-003)

### Foglalások oldal:
- **8 foglalás** különböző dátumokkal
- Naptár nézetben láthatóak

### Pénzügy oldal:
- **3 bankszámla** (Wise EUR, Revolut HUF, OTP HUF)
- **6 pénzügyi tétel** (3 bevétel + 3 kiadás)
- **8 foglalás** payout adatokkal

---

## 🔧 HA NEM MŰKÖDIK

### 1. Ellenőrizd az adatbázis konfigurációt

Nyisd meg: `smartcrm-cpanel/config/config.php`

Ellenőrizd:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'smartcrm_db');
define('DB_USER', 'smartcrm_user');
define('DB_PASS', 'your_password_here'); // <-- MÓDOSÍTSD!
```

### 2. Ellenőrizd, hogy létezik-e az adatbázis

Ha nincs, hozd létre:
```sql
CREATE DATABASE smartcrm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Ellenőrizd, hogy van-e alap séma

Ha nincs, töltsd be:
```bash
mysql -u root -p smartcrm_db < sql/database.sql
```

VAGY böngészőből:
```
http://localhost/smartcrm-cpanel/sql/database.sql
```
(De ez nem fog működni, mert SQL fájl. Használd a phpMyAdmin-t vagy mysql parancsot)

---

## 🎯 GYORS ELLENŐRZÉS

Miután betöltötted az adatokat, ellenőrizd:

1. **Frissítsd a frontend-et** (F5)
2. **Nyisd meg a Leadek kezelése oldalt**
3. **Látható kell legyen 7 lead!**

Ha még mindig 0 lead van:
- Ellenőrizd a böngésző konzolt (F12 → Console)
- Nézd meg, hogy van-e hiba az API hívásoknál
- Ellenőrizd, hogy az API URL helyes-e

---

## 📞 SEGÍTSÉG

Ha még mindig nem működik:
1. Ellenőrizd az adatbázis kapcsolatot
2. Ellenőrizd, hogy az API endpoint-ok elérhetők-e
3. Nézd meg a böngésző Network tab-ját (F12)

---

**Utolsó frissítés**: 2026-01-23  
**Státusz**: ✅ KÉSZ - Csak betölteni kell!
