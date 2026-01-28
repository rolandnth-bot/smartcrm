# SmartCRM

Modern React alkalmazás ingatlan kezeléshez, foglalások kezeléséhez és ügyfélkapcsolat-kezeléshez.

## 🚀 Gyors Kezdés

### Előfeltételek

- Node.js 18+ 
- npm vagy yarn

### Telepítés

```bash
# Függőségek telepítése
npm install

# Development szerver indítása
npm run dev

# Production build
npm run build

# Build előnézet
npm run preview

# Unit tesztek futtatása (Vitest)
npm run test        # watch mód
npm run test:run    # egyszeri futtatás
```

## 📁 Projekt Struktúra

```
src/
├── components/          # React komponensek
│   ├── common/          # Általános komponensek (Button, Card, Modal, Toast, Tooltip, Calendar, Skeleton, EmptyState, ErrorBoundary, QuickSearchModal, KeyboardShortcutsModal, ConfirmDialog, SkipLink)
│   ├── layout/          # Layout komponensek (Header, MainLayout)
│   ├── auth/            # Auth komponensek (ProtectedRoute)
│   └── marketing/       # Marketing komponensek (ContentCalendar)
├── pages/              # Oldal komponensek
│   ├── DashboardPage.jsx
│   ├── LeadsPage.jsx
│   ├── MarketingPage.jsx
│   ├── SalesPage.jsx
│   ├── ApartmentsPage.jsx
│   ├── BookingsPage.jsx
│   ├── CleaningPage.jsx
│   ├── FinancePage.jsx
│   ├── MaintenancePage.jsx
│   ├── SettingsPage.jsx
│   └── LoginPage.jsx
├── stores/             # Zustand state management
│   ├── authStore.js
│   ├── leadsStore.js
│   ├── salesStore.js
│   ├── apartmentsStore.js
│   ├── bookingsStore.js
│   ├── marketingStore.js
│   ├── cleaningsStore.js
│   ├── maintenanceStore.js
│   ├── icalSyncStore.js
│   └── toastStore.js
├── contexts/           # React Context API
│   ├── ThemeContext.jsx    # Dark mode kezelés
│   └── PermissionContext.jsx # RBAC jogosultságok
├── hooks/              # Custom React hooks
│   ├── useKeyboardShortcuts.js # Billentyűparancsok kezelése
│   ├── useOnlineStatus.js      # Online/offline állapot figyelés
│   ├── usePerformance.js        # Performance monitoring (dev módban)
│   ├── useDebounce.js           # Debounce hook értékekhez és callback-ekhez
│   ├── useThrottle.js           # Throttle hook callback-ekhez
│   ├── useFocusTrap.js          # Focus trap hook (accessibility)
│   ├── useDocumentTitle.js      # Dokumentum cím beállítása
│   ├── useAsync.js              # Aszinkron műveletek kezelése (API hívások)
│   ├── useClipboard.js          # Clipboard hook (vágólap kezelés)
│   ├── useFileUpload.js         # Fájl feltöltés hook (drag & drop, validáció, olvasás)
│   └── useQueryParams.js        # Query paraméterek kezelése (URL paraméterek, navigáció)
├── services/           # Külső szolgáltatások
│   ├── api.js          # Backend API integráció
│   ├── firebase.js     # Firebase konfiguráció
│   └── emailService.js # Email szolgáltatás (SendGrid/Resend)
├── config/             # Konfiguráció és konstansok
│   ├── appConfig.js    # Alkalmazás konfiguráció (toast, API, pagination, stb.)
│   └── constants.js    # Konstansok (színek, címkék, route-ok, hibaüzenetek)
├── utils/              # Segédfunkciók
│   ├── exportUtils.js  # Export funkciók (CSV, Excel, JSON, PDF)
│   ├── validation.js   # Validációs függvények
│   ├── dateUtils.js    # Dátum formázás és számítások
│   ├── numberUtils.js  # Szám és pénznem formázás
│   ├── arrayUtils.js   # Tömb manipulációs függvények
│   ├── stringUtils.js  # String manipulációs függvények
│   ├── retry.js         # API retry mechanizmus (exponential backoff)
│   ├── logger.js         # Strukturált logger utility (dev/prod mód)
│   ├── debounce.js       # Debounce és throttle utility függvények
│   ├── errorHandler.js   # Error handling utility (API hibák, validáció, hiba kategorizálás)
│   ├── storage.js        # LocalStorage/SessionStorage utility (biztonságos kezelés, error handling)
│   ├── clipboard.js      # Clipboard utility (vágólap kezelés, fallback támogatás)
│   ├── fileUtils.js      # Fájl kezelési utility (validáció, olvasás, formázás, letöltés)
│   ├── urlUtils.js       # URL kezelési utility (parsing, query paraméterek, validáció)
│   ├── objectUtils.js    # Objektum kezelési utility (deep clone, merge, pick, omit, stb.)
│   ├── numberUtils.js    # Szám formázási utility (pénznem, százalék, kerekítés, konverzió)
│   └── arrayUtils.js     # Array kezelési utility (szűrés, csoportosítás, rendezés, aggregáció)
├── App.jsx             # Fő alkalmazás komponens
└── main.jsx            # Entry point
```

## 🎯 Főbb Funkciók

### Dashboard
- Áttekintő statisztikák
- Sales pipeline
- Legutóbbi leadek
- Ma esedékes foglalások
- Naptár áttekintő widget (kattintható napok, foglalások megjelenítése)
- Pénzügyi statisztikák (bevételek, költségek, nyereség)
- Takarítási díjak összesítő

### Lead Kezelés
- Lead CRUD műveletek
- Státusz kezelés
- Import/Export (CSV, Excel, JSON)
- Szűrés és rendezés
- Welcome email küldés új leadekhez (email service integráció)

### Marketing
- Kampány kezelés
- Marketing csatornák
- Statisztikák
- Tartalom naptár (ContentCalendar komponens)

### Értékesítés
- Értékesítési célok
- Pipeline statisztikák
- Havi célok kezelése

### Lakások
- Lakás CRUD műveletek
- Lakás részletek
- Statisztikák
- Bulk műveletek (többszörös kijelölés, státusz váltás)
- **iCal sync beállítások** (Airbnb, Booking.com, Szallas.hu, Saját iCal URL-ek)
- **iCal szinkronizálás** (automatikus foglalások importálása platformokból)
- **iCal URL kezelés** (beállítások modal, URL másolás funkció)

### Foglalások
- Foglalás kezelés
- Naptár nézet
- Export funkciók (CSV, Excel, PDF)
- **Import funkciók** (CSV, JSON fájlok importálása)
  - **Drag & drop fájl feltöltés**
  - **Import előnézet táblázat** (hibás sorok piros háttérrel, tooltip hibaüzenetekkel)
  - **Import progress bar** (nagy fájloknál, százalékos megjelenítés)
  - **"Csak hibásak" szűrő** (előnézet táblázatban)
  - **Érvényes sorok előnézete** (első 5 sor zöld háttérrel)
  - **Import eredmény összefoglaló** (létrehozott/kihagyott sorok száma)
  - **Import validálás** (kötelező mezők, dátum formátum, dátum tartomány, email formátum)
- Szűrés (dátum, lakás)
- Email mező és megerősítő email küldés
- Vendég email cím kezelése

### Takarítás
- Takarítás kezelés
- Generálás foglalásokból
- Bulk státusz váltás
- Export funkciók (CSV, Excel, PDF)
- Takarító hozzárendelés

### Pénzügy
- Bevételek és költségek áttekintése
- Elszámolások kezelése
- Export funkciók (CSV, Excel, PDF)

### Karbantartás
- Karbantartási bejelentések kezelése
- Export funkciók (CSV, Excel, PDF)

## 📤 Export Funkciók

Minden modul támogatja az adatok exportálását:

- **CSV Export**: Kompatibilis Excel-lel és más táblázatkezelő programokkal
- **Excel Export**: Excel-kompatibilis formátum (.xlsx)
- **JSON Export**: Strukturált adatok exportálása (Leads, Bookings)
- **PDF Export**: Nyomtatás/PDF mentés (böngésző print funkció)

### Támogatott modulok:
- ✅ Leads (CSV, Excel, JSON, PDF)
- ✅ Bookings (CSV, Excel, PDF)
- ✅ Apartments (CSV, Excel, PDF)
- ✅ Sales (CSV, Excel, PDF)
- ✅ Marketing (CSV, Excel, PDF)
- ✅ Cleaning (CSV, Excel, PDF)
- ✅ Finance (CSV, Excel, PDF)
- ✅ Maintenance (CSV, Excel, PDF)

## 🛠️ Technológiai Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Zustand** - State management
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Firebase** - Authentication & Firestore

## 🔧 Konfiguráció

### Alkalmazás Konfiguráció

Az alkalmazás konfigurációs értékei a `src/config/appConfig.js` fájlban találhatók:
- Toast/Notification beállítások
- API timeout és retry beállítások
- Debounce/Throttle értékek
- Pagination beállítások
- Fájl feltöltés limit-ek
- Validáció szabályok
- Feature flags

Konstansok (színek, címkék, route-ok) a `src/config/constants.js` fájlban találhatók.

### Environment Variables

Hozz létre egy `.env` fájlt a projekt gyökerében:

```env
# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend API (opcionális)
VITE_API_BASE_URL=http://localhost:3000/api

# Email Service (opcionális)
VITE_SENDGRID_API_KEY=your-sendgrid-key
VITE_RESEND_API_KEY=your-resend-key
VITE_EMAIL_FROM=noreply@smartcrm.hu
```

Lásd `.env.example` fájlt példáért.

## 📦 Build

### Development

```bash
npm run dev
```

Az alkalmazás elérhető lesz: `http://localhost:5173`

### Production

```bash
npm run build
```

A build fájlok a `dist/` mappába kerülnek.

## 🧪 Tesztelés

```bash
# Unit tesztek (ha van)
npm test

# E2E tesztek (ha van)
npm run test:e2e
```

## 📝 Dokumentáció

### Főbb Dokumentumok

- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Dokumentáció index (kezdj itt!) 📚
- **[QUICK_START.md](./QUICK_START.md)** - Gyors kezdés útmutató (5 perc alatt fut)
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Részletes deployment útmutató
- **[EXPORT_FEATURES.md](./EXPORT_FEATURES.md)** - Export funkciók részletes dokumentációja ⭐
- **[WORK_SUMMARY.md](./WORK_SUMMARY.md)** - Munkavégzés összefoglaló (teljes munkavégzés)
- **[FINAL_STATUS.md](./FINAL_STATUS.md)** - Végső projekt státusz és összefoglaló
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Teljes projekt áttekintő
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Projekt státusz és statisztikák
- **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** - Befejezési jelentés
- **[VERSION_1.1.0_SUMMARY.md](./VERSION_1.1.0_SUMMARY.md)** - Verzió 1.1.0 összefoglaló

### További Dokumentáció

- **[CHANGELOG.md](./CHANGELOG.md)** - Verzió változások
- **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - Végső összefoglaló
- **[TODO_NEXT.md](./TODO_NEXT.md)** - Fejlesztési napló (146 batch)
- **[SECURITY.md](./SECURITY.md)** - Biztonsági dokumentáció
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Közreműködési útmutató

- `DEPLOYMENT.md` - Részletes deployment útmutató
- `CONTRIBUTING.md` - Közreműködési útmutató
- `CHANGELOG.md` - Verziókezelési dokumentáció
- `FINAL_SUMMARY.md` - Végső összefoglaló
- `PROJECT_STATUS.md` - Projekt státusz
- `TODO_NEXT.md` - Fejlesztési napló
- `REFINEMENTS_SUMMARY.md` - Finomhangolások
- `PROMPT_NEXT.md` - Következő lépések útmutatója
- `smartcrm-cpanel/README.md` - Backend API telepítési útmutató

## 🎨 Stílusok

A projekt Tailwind CSS-t használ. A globális stílusok az `index.css` fájlban találhatók.

### Dark Mode

- **Teljes dark mode támogatás**: Minden oldal és komponens
- **Theme toggle**: Header-ben elérhető gomb
- **System preference**: Automatikus észlelés
- **LocalStorage**: Téma preferencia mentése

### Színpaletta

- **Státusz színek**: Orange, Yellow, Blue, Purple, Cyan, Green, Red
- **Platform színek**: Pink (Airbnb), Blue (Booking), Red (Szallas), Green (Direct)

## 🔒 Biztonság

- Firebase Authentication integráció
- Backend API token alapú autentikáció
- Error boundary hibakezelés
- Input validáció (email, telefon, dátum, URL, stb.)
- XSS védelem (sanitizeInput)
- RBAC (Role-Based Access Control) - jogosultság alapú hozzáférés

## 🚀 Deployment

Lásd részletes útmutató: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Gyors telepítés

```bash
# Build
npm run build

# A dist/ mappa tartalma statikusan szolgálható ki
```

### PWA Támogatás

- **Service Worker**: Automatikusan regisztrálódik production build-ben
- **Manifest**: `public/manifest.json` - PWA konfiguráció
- **Offline Támogatás**: Network-first stratégia API hívásokhoz, cache-first statikus assetekhez
- **Online/Offline Figyelés**: Toast értesítések állapotváltozásokkor

### Vercel / Netlify / Cloudflare Pages

A `dist/` mappa tartalma statikusan szolgálható ki bármely CDN/static hosting szolgáltatón.

## 📊 Performance

- **Code Splitting**: Lazy loading minden oldalhoz
- **Memoization**: useCallback/useMemo optimalizáció
- **React.memo**: Komponensek memoizálva
- **Bundle méret**: ~473 kB (main), ~131 kB (gzipped)
- **API Retry Mechanizmus**: Exponential backoff retry logika (5xx hibák, network hibák)
- **Performance Monitoring**: Development módban render teljesítmény mérése
- **Service Worker**: Offline támogatás és cache kezelés (PWA)

## ♿ Accessibility

- **WCAG 2.1 követelmények** részleges teljesítése
- **ARIA attribútumok**: role, aria-label, aria-describedby, aria-required, aria-invalid, aria-disabled, aria-busy
- **Keyboard navigation**: Tab, Enter, Escape, billentyűparancsok
- **Screen reader kompatibilitás**: Semantic HTML, ARIA labels
- **Focus management**: 
  - Modal focus trap (`useFocusTrap` hook)
  - Auto-focus első input mezőre modal megnyitáskor
  - Focus visszaállítás modal bezárásakor
- **Skip links**: SkipLink komponens a navigáció átugrásához
- **Semantic HTML**: Megfelelő HTML5 elemek használata

## 🤝 Közreműködés

Köszönjük, hogy részt veszel a SmartCRM fejlesztésében!

Részletes útmutató: [CONTRIBUTING.md](./CONTRIBUTING.md)

### Gyors útmutató

1. Fork a projektet
2. Hozz létre egy feature branch-et (`git checkout -b feature/AmazingFeature`)
3. Commit a változtatásaidat (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a branch-re (`git push origin feature/AmazingFeature`)
5. Nyiss egy Pull Request-et

## 📄 Licenc

Ez a projekt privát használatra készült.

## 👥 Készítők

SmartCRM Development Team

## 🙏 Köszönetnyilvánítás

- React közösség
- Vite fejlesztők
- Zustand maintainerek
- Tailwind CSS csapat

---

**Verzió**: 1.1.0  
**Státusz**: Production Ready  
**Utolsó frissítés**: 2026-01-23

### Újdonságok (v1.1.0)

- ✅ **Excel Export**: Excel export funkció minden modulban (CSV, Excel, JSON, PDF)
- ✅ **Cleaning Modul Bővítések**: Excel export, generálás foglalásokból, bulk státusz váltás
- ✅ **Marketing Modul**: Excel export, tartalom naptár teljes implementáció
- ✅ **Konzisztens Export**: Minden oldal rendelkezik CSV és Excel exporttal
- ✅ **Helper Függvények**: `getExportData()` helper függvények a kód duplikáció elkerülésére

### Korábbi verziók

**v1.4.0** (2026-01-20):
- ✅ **PWA Támogatás**: Service Worker offline támogatással
- ✅ **API Retry Mechanizmus**: Exponential backoff retry logika
- ✅ **Online/Offline Figyelés**: Toast értesítések állapotváltozásokkor
- ✅ **Performance Monitoring**: Development módban render teljesítmény mérése
- ✅ **Deployment Útmutató**: Részletes telepítési dokumentáció
