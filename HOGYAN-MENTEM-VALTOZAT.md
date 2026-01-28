# Verzió mentése külön mappába (pl. 1.0)

A kész projektet verzió szerint külön mappába lehet menteni (pl. **SmartCRM-1.0**), hogy a jelenlegi fejlesztéstől független archívumod legyen.

---

## 1. Scripttel (ajánlott)

A `scripts/save-version.sh` másolja a projektet egy új mappába, **node_modules** és **dist** nélkül.

### Használat

```bash
# Futtathatóság
chmod +x scripts/save-version.sh

# Verzió 1.0 mentése a projekt szülőmappájába (pl. Desktop/SmartCRM-1.0)
./scripts/save-version.sh 1.0

# Verzió 1.0 mentése konkrét mappába (pl. ~/Archívum)
./scripts/save-version.sh 1.0 ~/Archívum

# Létező mappa felülírása kérdezés nélkül
./scripts/save-version.sh -f 1.0
```

### Eredmény

- Új mappa: **SmartCRM-1.0** (vagy a megadott helyen)
- Benne: forráskód, konfigok, `package.json`, `smartcrm-cpanel`, stb.
- Kihagyva: `node_modules`, `dist`, `.git`, `.env`, cache

### A másolatban

```bash
cd /path/to/SmartCRM-1.0
npm install
npm run build
```

A **dist/** így helyben képződik; a `VERSION.txt` a verziót és a mentés időpontját tartalmazza.

---

## 2. Manuálisan

1. Másold a teljes **SmartCRM** mappát (pl. `SmartCRM-1.0` néven).
2. A másolatban töröld:
   - `node_modules/`
   - `dist/`
   - (opcionális) `.git/`
   - `.env` (ha van, ne legyen benne a másolatban)
3. A másolatban futtasd: `npm install` majd `npm run build`.

---

## 3. Git archívummal (ha git-et használsz)

```bash
git tag v1.0
git archive --format=zip --prefix=SmartCRM-1.0/ v1.0 -o ../SmartCRM-1.0.zip
```

Kibontod a zip-et ahova kell; `node_modules` és `dist` úgy sincs a repóban.

---

## Összefoglalva

| Módszer        | Gyors | node_modules/dist nélkül | Verzió + idő |
|----------------|-------|---------------------------|--------------|
| **save-version.sh** | ✓     | ✓                         | ✓ (VERSION.txt) |
| Manuális       | –     | kézi törlés               | –            |
| git archive    | ✓     | ✓                         | tag névvel   |

A **scripts/save-version.sh** a legegyszerűbb: egy parancs, és kész a verziózott másolat.
