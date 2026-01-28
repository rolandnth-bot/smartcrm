# File Map: Monolit → Modern Struktúra

## Elkészült fájlok

### Konfiguráció
- ✅ `package.json` - függőségek
- ✅ `vite.config.js` - Vite konfig
- ✅ `tailwind.config.js` - Tailwind konfig
- ✅ `postcss.config.js` - PostCSS konfig
- ✅ `.env.example` - Környezeti változók példa

### Checkpoint fájlok
- ✅ `MIGRATION_PLAN.md` - migrációs terv
- ✅ `FILE_MAP.md` - ez a fájl
- ✅ `TODO_NEXT.md` - következő tennivalók
- ✅ `EXTRACT_NOTES.md` - kiemelt részletek
- ✅ `PROMPT_NEXT.md` - folytatáshoz prompt
- ✅ `README.md` - projekt dokumentáció

## Elkészült fájlok

### Core
- ✅ `index.html` - HTML entry point
- ✅ `src/main.jsx` - React entry point
- ✅ `src/App.jsx` - Fő app komponens (routing)
- ✅ `src/index.css` - Globális stílusok (Tailwind)

### Services
- ✅ `src/services/firebase.js` - Firebase konfiguráció és inicializálás
- ✅ `src/services/api.js` - Backend API kliens (REST API hívások, mappers)
- ✅ `src/services/emailService.js` - Email service (SendGrid/Resend placeholder)

### Stores (Zustand)
- ✅ `src/stores/leadsStore.js` - Lead kezelés store (Zustand, CRUD, import, API integráció)
- ✅ `src/stores/authStore.js` - Auth state management (Firebase + Backend API + mock mode)
- ✅ `src/stores/salesStore.js` - Értékesítési célok store
- ✅ `src/stores/apartmentsStore.js` - Lakások kezelés store (API integráció)
- ✅ `src/stores/bookingsStore.js` - Foglalások kezelés store (API integráció)
- ✅ `src/stores/marketingStore.js` - Marketing kampányok store (API integráció)
- ✅ `src/stores/toastStore.js` - Toast/Notification store

### Components
- ✅ `src/components/layout/Header.jsx` - Header komponens
- ✅ `src/components/layout/MainLayout.jsx` - Fő layout komponens
- ✅ `src/components/common/Button.jsx` - Újrafelhasználható Button komponens
- ✅ `src/components/common/Card.jsx` - Card komponens
- ✅ `src/components/common/Modal.jsx` - Modal komponens
- ✅ `src/components/common/Toast.jsx` - Toast/Notification komponens
- ✅ `src/components/common/Calendar.jsx` - Naptár komponens
- ✅ `src/components/common/Skeleton.jsx` - Skeleton loader komponens (loading state)
- ✅ `src/components/common/Icons.jsx` - Központosított ikon komponensek (Plus, Edit2, Trash2, X)

### Pages
- ✅ `src/pages/DashboardPage.jsx` - Dashboard főoldal (statisztikák, API integráció)
- ✅ `src/pages/LeadsPage.jsx` - Leads modul oldal (teljes CRUD, import, filter, API integráció)
- ✅ `src/pages/MarketingPage.jsx` - Marketing modul oldal (kampány kezelés, API integráció)
- ✅ `src/pages/SalesPage.jsx` - Sales modul oldal (pipeline, értékesítési célok)
- ✅ `src/pages/ApartmentsPage.jsx` - Lakások kezelés oldal (CRUD, API integráció)
- ✅ `src/pages/BookingsPage.jsx` - Foglalások kezelés oldal (CRUD, szűrés, naptár, API integráció)
- ✅ `src/pages/LoginPage.jsx` - Bejelentkezési oldal (Firebase + Backend API)

## Utils
- ✅ `src/utils/exportUtils.js` - CSV/JSON/PDF export segédfüggvények

## Monolit leképezés

### Leads modul (smartcrm.jsx ~603-8227)
- State: `leads`, `leadStatuses`, `leadSources`, `showAddLead`, `editingLead`
- UI: Lead lista, hozzáadás form, szerkesztés, státusz változtatás
- → `src/stores/leadsStore.js` + `src/pages/LeadsPage.jsx`

### Marketing modul (smartcrm.jsx ~7820-7877)
- State: (jelenleg placeholder)
- UI: Marketing csatornák, kampányok, statisztikák, tartalom naptár
- → `src/pages/MarketingPage.jsx`

