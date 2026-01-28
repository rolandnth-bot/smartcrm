# 🚀 PHP és Homebrew Telepítés - Részletes Útmutató

## ❌ Jelenlegi probléma:
- PHP nincs telepítve (`command not found: php`)
- Homebrew nincs telepítve (`command not found: brew`)

## ✅ MEGOLDÁS 1: Homebrew + PHP telepítése

### 1. lépés: Homebrew telepítése

Nyisd meg a Terminal-t és futtasd:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Ez 5-10 percet vesz igénybe. A telepítés végén megjelenik egy üzenet, hogy hozzá kell adni a Homebrew-t a PATH-hoz. Kövesd az utasításokat!

### 2. lépés: PATH beállítása (ha szükséges)

A telepítés után futtasd:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### 3. lépés: PHP telepítése

```bash
brew install php
```

### 4. lépés: Szerver indítása

```bash
cd ~/Desktop/SmartCRM/smartcrm-cpanel
php -S localhost:8080
```

---

## ✅ MEGOLDÁS 2: MAMP használata (egyszerűbb)

### 1. lépés: MAMP letöltése és telepítése

1. Látogasd meg: https://www.mamp.info/en/downloads/
2. Töltsd le a MAMP-ot (ingyenes verzió)
3. Telepítsd

### 2. lépés: MAMP indítása

1. Nyisd meg a MAMP alkalmazást
2. Kattints az "Start Servers" gombra
3. A szerver fut a `http://localhost:8888` címen

### 3. lépés: Fájlok másolása

Másold a `smartcrm-cpanel` mappát a MAMP webroot-ba:

```bash
cp -r ~/Desktop/SmartCRM/smartcrm-cpanel /Applications/MAMP/htdocs/
```

### 4. lépés: Böngészőben megnyitás

```
http://localhost:8888/smartcrm-cpanel/test-email.php
```

---

## ✅ MEGOLDÁS 3: XAMPP használata

### 1. lépés: XAMPP letöltése és telepítése

1. Látogasd meg: https://www.apachefriends.org/
2. Töltsd le a macOS verziót
3. Telepítsd

### 2. lépés: XAMPP indítása

1. Nyisd meg a XAMPP Control Panel-t
2. Indítsd el az Apache-t

### 3. lépés: Fájlok másolása

```bash
cp -r ~/Desktop/SmartCRM/smartcrm-cpanel /Applications/XAMPP/htdocs/
```

### 4. lépés: Böngészőben megnyitás

```
http://localhost/smartcrm-cpanel/test-email.php
```

---

## ⚡ GYORS MEGOLDÁS: Node.js szerver (ha Node.js telepítve van)

Mivel a Node.js telepítve van, használhatod a Node.js scriptet:

```bash
cd ~/Desktop/SmartCRM
node start-server-node.js
```

Ez automatikusan megkeresi a PHP-t és elindítja a szervert.

---

## 📋 AJÁNLOTT: MAMP használata

A MAMP a legegyszerűbb megoldás, mert:
- ✅ Grafikus felület
- ✅ Egy kattintással indítható
- ✅ Nincs szükség parancssor ismeretekre
- ✅ Automatikusan beállítja a PHP-t


