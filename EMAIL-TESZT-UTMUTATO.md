# 📧 Email Teszt - Útmutató

## 🚀 Szerver indítása

### 1. lépés: Nyisd meg a Terminal-t

### 2. lépés: Navigálj a projekt mappába
```bash
cd ~/Desktop/SmartCRM
```

### 3. lépés: Indítsd el a PHP szervert

**A) Script használata (ajánlott):**
```bash
./start-server.sh
```

**B) Manuális indítás:**
```bash
cd smartcrm-cpanel
php -S localhost:8080
```

### 4. lépés: Nyisd meg a böngészőben

**Email teszt oldal:**
```
http://localhost:8080/test-email.php?to=SAJAT_EMAIL@example.com
```

**Vagy használd a formot:**
```
http://localhost:8080/test-email.php
```

**Teszt oldal (ellenőrzés, hogy a szerver fut-e):**
```
http://localhost:8080/index-test.php
```

## ✅ Ellenőrzés

Ha a szerver fut, látnod kell:
- A teszt oldalt a böngészőben
- Az email küldés részletes logját
- Minden SMTP parancsot és választ

## ❌ Ha nem működik

1. **Ellenőrizd, hogy a PHP telepítve van-e:**
   ```bash
   php -v
   ```

2. **Ellenőrizd, hogy a 8080 port szabad-e:**
   ```bash
   lsof -ti:8080
   ```
   Ha van kimenet, akkor a port foglalt. Használj másik portot:
   ```bash
   php -S localhost:8081
   ```

3. **Próbáld meg másik porttal:**
   ```bash
   cd smartcrm-cpanel
   php -S localhost:8081
   ```
   Majd a böngészőben: `http://localhost:8081/test-email.php`

## 📝 SMTP Beállítások

- **Host:** mail.rackhost.hu
- **Port:** 587
- **User:** registration@rackhost.hu
- **Password:** Smartregistration
- **From:** registration@rackhost.hu


