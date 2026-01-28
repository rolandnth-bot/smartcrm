# SmartCRM - Gyors Kezdés

**Verzió**: 1.1.0  
**Dátum**: 2026-01-23

---

## 🚀 Gyors Telepítés (5 perc)

### 1. Előfeltételek

```bash
# Node.js verzió ellenőrzése
node --version  # 18+ szükséges

# npm verzió ellenőrzése
npm --version
```

### 2. Projekt Klónozása

```bash
# Ha Git repository-ból
git clone <repository-url>
cd SmartCRM

# Vagy ha már letöltve van
cd SmartCRM
```

### 3. Függőségek Telepítése

```bash
npm install
```

### 4. Environment Változók Beállítása

```bash
# Másold a .env.example fájlt
cp .env.example .env

# Szerkeszd a .env fájlt (opcionális, ha nincs backend API)
# Minimum: VITE_API_BASE_URL üresen hagyható (lokális mód)
```

### 5. Development Szerver Indítása

```bash
npm run dev
```

A szerver elérhető lesz: `http://localhost:5173`

---

## ⚙️ Konfiguráció

### Backend API (Opcionális)

Ha van backend API-d, állítsd be a `.env` fájlban:

```env
VITE_API_BASE_URL=https://smartcrm.hu/api
```

**Megjegyzés**: Ha nincs backend API, az alkalmazás lokális módban működik (Zustand store-okkal).

### Firebase (Opcionális)

Ha Firebase-t használsz autentikációhoz:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Megjegyzés**: Firebase nélkül is működik az alkalmazás (mock auth módban).

---

## 📦 Build és Deployment

### Production Build

```bash
npm run build
```

A build kimenet a `dist/` mappában lesz.

### Build Előnézet

```bash
npm run preview
```

---

## 🎯 Főbb Funkciók

### 1. Dashboard
- Statisztikák áttekintése
- Pipeline megjelenítés
- Ma érkező foglalások
- Legutóbbi leadek

### 2. Leadek Kezelése
- CRUD műveletek
- Import/Export (CSV, Excel, JSON, PDF)
- Státusz kezelés
- Szűrés és keresés

### 3. Marketing
- Kampány kezelés
- Tartalom naptár
- Export (CSV, Excel, PDF)

### 4. Értékesítés
- Értékesítési célok
- Pipeline statisztikák
- Export (CSV, Excel, PDF)

### 5. Lakások
- CRUD műveletek
- Amenities kezelés
- iCal szinkronizálás
- Export (CSV, Excel, PDF)

### 6. Foglalások
- CRUD műveletek
- Naptár nézet
- Export (CSV, Excel, PDF)

### 7. Takarítás
- Takarítás kezelés
- Generálás foglalásokból
- Bulk műveletek
- Export (CSV, Excel, PDF)

### 8. Pénzügy
- Bevételek/Elszámolások
- Karbantartási költségek
- Export (CSV, Excel, PDF)

### 9. Karbantartás
- Bejelentések kezelése
- Szűrés és statisztikák
- Export (CSV, Excel, PDF)

### 10. Beállítások
- Felhasználók kezelése
- RBAC (Role-Based Access Control)
- Alkalmazás beállítások

---

## 🔧 Hasznos Parancsok

```bash
# Development szerver indítása
npm run dev

# Production build
npm run build

# Build előnézet
npm run preview

# Unit tesztek (ha van)
npm run test

# Linter futtatása
npm run lint

# Build méret ellenőrzése
npm run build -- --mode production
```

---

## 🐛 Hibaelhárítás

### Port már használatban van

```bash
# Vite másik porton indítása
npm run dev -- --port 3000
```

### Build hibák

```bash
# Node modules törlése és újratelepítés
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment változók nem működnek

- Ellenőrizd, hogy a `.env` fájl a projekt gyökerében van
- Indítsd újra a development szervert
- Ellenőrizd, hogy a változók `VITE_` prefix-szel kezdődnek

---

## 📚 További Dokumentáció

- [README.md](./README.md) - Teljes projekt dokumentáció
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment útmutató
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Projekt áttekintő
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Projekt státusz

---

## ✅ Következő Lépések

1. **Backend API beállítása** (ha van)
   - Lásd: `smartcrm-cpanel/README.md`

2. **Firebase beállítása** (opcionális)
   - Firebase projekt létrehozása
   - Konfigurációs értékek másolása `.env` fájlba

3. **Email service beállítása** (opcionális)
   - SendGrid vagy Resend API kulcs beállítása

4. **Production deployment**
   - Lásd: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Készen állsz!** 🎉

Az alkalmazás most már fut a development módban. Kezdj el dolgozni a projekten!
