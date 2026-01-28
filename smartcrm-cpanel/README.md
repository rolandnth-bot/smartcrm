# SmartCRM - Telepítési útmutató

## Aldomainek
- **smartcrm.hu** - Admin felület (teljes rendszer)
- **cleanapp.smartcrm.hu** - Takarítók belépése (CleanApp)
- **partner.smartcrm.hu** - Partnerek belépése (Partner Portal)

## Rendszerkövetelmények
- PHP 8.1+
- MySQL 5.7+ / MariaDB 10.3+
- Apache 2.4+ mod_rewrite-tal

## Telepítés cPanel-en

### 1. Fájlok feltöltése
1. Töltsd fel az összes fájlt a `public_html` mappába
2. A mappastruktúra így nézzen ki:
```
public_html/
├── .htaccess
├── api/
│   ├── index.php
│   └── endpoints/
├── config/
│   └── config.php
├── public/
│   ├── index.html
│   └── smartcrm.jsx
├── cleanapp/
│   └── index.html
├── partner/
│   └── index.html
├── sql/
│   └── database.sql
└── uploads/
```

### 2. Aldomainek beállítása cPanel-ben
1. cPanel > Subdomains
2. Hozd létre: `cleanapp` → Document Root: `public_html/cleanapp`
3. Hozd létre: `partner` → Document Root: `public_html/partner`

### 3. Adatbázis létrehozása
1. cPanel > MySQL Databases > Create New Database
2. Adj nevet: `smartcrm_db`
3. Create New User: `smartcrm_user` + jelszó
4. Add User to Database: Minden jogosultság

### 4. SQL importálása
1. cPanel > phpMyAdmin
2. Válaszd ki a létrehozott adatbázist
3. Import > Válaszd ki a `sql/database.sql` fájlt
4. Go

### 5. Konfiguráció beállítása
Szerkeszd a `config/config.php` fájlt:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cpanel_felhasznalo_smartcrm_db');
define('DB_USER', 'cpanel_felhasznalo_smartcrm_user');
define('DB_PASS', 'a_te_jelszavad');
define('APP_URL', 'https://smartcrm.hu');
define('CLEANAPP_URL', 'https://cleanapp.smartcrm.hu');
define('PARTNER_URL', 'https://partner.smartcrm.hu');
```

### 6. Jogosultságok
```
chmod 755 uploads/
chmod 644 config/config.php
```

### 7. Alapértelmezett bejelentkezés
**Admin (smartcrm.hu):**
- Email: admin@smartcrm.hu
- Jelszó: admin123

**Partner (partner.smartcrm.hu):**
- Email: partner@test.hu
- Jelszó: partner123

⚠️ AZONNAL változtasd meg élesben!

## API Végpontok

### Autentikáció
- `POST /api/auth/login` - Bejelentkezés
- `POST /api/auth/register` - Regisztráció
- `GET /api/auth/check` - Session ellenőrzés
- `POST /api/auth/logout` - Kijelentkezés

### Felhasználók
- `GET /api/users` - Lista
- `GET /api/users/{id}` - Egy felhasználó
- `POST /api/users` - Létrehozás
- `PUT /api/users/{id}` - Frissítés
- `DELETE /api/users/{id}` - Törlés

### Dolgozók
- `GET /api/workers` - Lista
- `GET /api/workers/{id}` - Egy dolgozó
- `POST /api/workers` - Létrehozás
- `PUT /api/workers/{id}` - Frissítés
- `DELETE /api/workers/{id}` - Törlés

### Apartmanok
- `GET /api/apartments` - Lista
- `GET /api/apartments/{id}` - Egy apartman
- `POST /api/apartments` - Létrehozás
- `PUT /api/apartments/{id}` - Frissítés
- `DELETE /api/apartments/{id}` - Törlés

### Munkák
- `GET /api/jobs` - Lista (szűrhető: worker_id, apartment_id, date_from, date_to)
- `GET /api/jobs/{id}` - Egy munka
- `POST /api/jobs` - Létrehozás
- `PUT /api/jobs/{id}` - Frissítés
- `DELETE /api/jobs/{id}` - Törlés

### Foglalások
- `GET /api/bookings` - Lista
- `GET /api/bookings/{id}` - Egy foglalás
- `POST /api/bookings` - Létrehozás
- `PUT /api/bookings/{id}` - Frissítés
- `DELETE /api/bookings/{id}` - Törlés

### Mosoda
- `GET /api/laundry` - Lista
- `POST /api/laundry` - Létrehozás
- `PUT /api/laundry/{id}` - Frissítés

### Statisztikák
- `GET /api/stats/overview` - Pénzügyi összesítő
- `GET /api/stats/workers` - Dolgozók teljesítménye
- `GET /api/stats/apartments` - Apartmanok statisztikái

### Beállítások
- `GET /api/settings` - Beállítások lekérése
- `PUT /api/settings` - Beállítások mentése

## Hibaelhárítás

### "500 Internal Server Error"
1. Ellenőrizd a PHP hibákat: cPanel > Error Log
2. config.php-ban: `define('DEBUG_MODE', true);`
3. .htaccess kompatibilitás ellenőrzése

### "404 Not Found" az API-n
1. mod_rewrite engedélyezve van?
2. .htaccess megfelelő helyen van?
3. AllowOverride All beállítva?

### Adatbázis kapcsolódási hiba
1. Ellenőrizd a config.php adatokat
2. cPanel username prefix: `cpanel_user_dbname`

## Támogatás
Ha kérdésed van, lépj kapcsolatba velünk!
