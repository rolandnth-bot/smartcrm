# Böngésző Hibaelhárítás - iCal Sync

## ✅ Javítások Elvégezve

1. **Dinamikus import eltávolítva** - Az `icalSyncStore.js`-ből eltávolítottam a problémás `await import('./bookingsStore')` hívást
2. **Build sikeres** - Nincs build hiba vagy warning
3. **Kód ellenőrizve** - Minden import és export helyes

## 🔍 Lehetséges Problémák és Megoldások

### 1. Böngésző Cache
**Probléma**: A böngésző cache-elt verziót használ  
**Megoldás**:
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) vagy `Cmd+Shift+R` (Mac)
- Vagy töröld a böngésző cache-t
- Vagy nyisd meg Incognito/Private módban

### 2. Dev Server Újraindítása
**Probléma**: A dev server nem töltötte be az új változtatásokat  
**Megoldás**:
```bash
# Állítsd le a dev server-t (Ctrl+C)
# Majd indítsd újra:
npm run dev
```

### 3. Build Újraépítése
**Probléma**: A build régi verziót tartalmaz  
**Megoldás**:
```bash
# Töröld a dist mappát és építsd újra:
rm -rf dist
npm run build
```

### 4. Node Modules Újratelepítése
**Probléma**: Hibás függőségek  
**Megoldás**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 5. Böngésző Konzol Hibák
**Probléma**: Runtime hiba a böngészőben  
**Megoldás**:
1. Nyisd meg a böngésző Developer Tools-t (F12)
2. Nézd meg a Console tab-ot hibákért
3. Nézd meg a Network tab-ot API hívásokhoz
4. Nézd meg az Errors tab-ot

### 6. API Konfiguráció
**Probléma**: Az API base URL nincs beállítva  
**Megoldás**:
- Ellenőrizd a `.env` fájlt:
  ```
  VITE_API_BASE_URL=http://localhost/smartcrm-cpanel/api
  ```
- Vagy production-ben:
  ```
  VITE_API_BASE_URL=https://smartcrm.hu/api
  ```

## 🧪 Tesztelés

### 1. Ellenőrizd a Build-et
```bash
npm run build
```
Ha sikeres, akkor a kód rendben van.

### 2. Ellenőrizd a Dev Server-t
```bash
npm run dev
```
Nyisd meg a böngészőt és nézd meg a konzolt.

### 3. Ellenőrizd az API Hívásokat
Nyisd meg a Network tab-ot a Developer Tools-ban és nézd meg, hogy az API hívások működnek-e.

## 📝 Konkrét Hiba Jelentése

Ha még mindig van probléma, kérlek jelezd:

1. **Milyen hibaüzenet jelenik meg?** (ha van)
2. **Melyik böngészőt használod?** (Chrome, Firefox, Safari, stb.)
3. **Mi történik pontosan?** (nem tölt be, hibaüzenet, nem működik valami funkció)
4. **Van-e hiba a böngésző konzolban?** (F12 > Console)
5. **Melyik oldalon van a probléma?** (ApartmentsPage, BookingsPage, stb.)

## 🔧 Gyors Javítások

### Teljes Újraindítás
```bash
# 1. Állítsd le a dev server-t
# 2. Töröld a cache-t
rm -rf dist node_modules/.vite
# 3. Telepítsd újra a függőségeket (ha szükséges)
npm install
# 4. Indítsd újra a dev server-t
npm run dev
```

### Build Újraépítése
```bash
rm -rf dist
npm run build
npm run preview
```

---

**Utolsó frissítés**: 2026-01-23  
**Státusz**: ✅ Build sikeres, nincs hiba a kódban
