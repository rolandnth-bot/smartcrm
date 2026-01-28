# SmartCRM Migration Plan

## Állapot: Folyamatban

### Elkészült
- ✅ Projekt alapok (package.json, vite.config.js, tailwind.config.js)
- ✅ Függőségek telepítve (React, Zustand, Firebase, React Router)
- ✅ **Batch 1**: Leads modul + Marketing oldal
  - ✅ Leads store (Zustand) - `src/stores/leadsStore.js`
  - ✅ LeadsPage komponens (CRUD) - `src/pages/LeadsPage.jsx`
  - ✅ MarketingPage komponens (alap struktúra) - `src/pages/MarketingPage.jsx`
- ✅ **Batch 2**: Routing + Layout
  - ✅ App.jsx routing (React Router) - `src/App.jsx`
  - ✅ MainLayout komponens - `src/components/layout/MainLayout.jsx`
  - ✅ Header komponens - `src/components/layout/Header.jsx`
  - ✅ DashboardPage - `src/pages/DashboardPage.jsx`
  - ✅ LoginPage - `src/pages/LoginPage.jsx`
  - ✅ main.jsx entry point - `src/main.jsx`
  - ✅ index.css globális stílusok - `src/index.css`
  - ✅ index.html - `index.html`
- ✅ **Batch 3**: Firebase + Auth
  - ✅ Firebase service - `src/services/firebase.js`
  - ✅ Auth store (Zustand) - `src/stores/authStore.js`
  - ✅ App.jsx Firebase integráció
  - ✅ LoginPage Firebase auth
  - ✅ .env.example fájl
- ✅ **Batch 4**: Sales modul
  - ✅ Sales store - `src/stores/salesStore.js`
  - ✅ SalesPage komponens - `src/pages/SalesPage.jsx`
  - ✅ App.jsx routing frissítve
- ✅ **Batch 5**: Common komponensek + Apartments modul
  - ✅ Common komponensek - `src/components/common/Button.jsx`, `Card.jsx`, `Modal.jsx`
  - ✅ Apartments store - `src/stores/apartmentsStore.js`
  - ✅ ApartmentsPage komponens - `src/pages/ApartmentsPage.jsx`
  - ✅ App.jsx routing frissítve
- ✅ **Batch 6**: Dashboard statisztikák + Bookings modul
  - ✅ DashboardPage frissítve (valós adatok)
  - ✅ Bookings store - `src/stores/bookingsStore.js`
  - ✅ BookingsPage komponens - `src/pages/BookingsPage.jsx`
  - ✅ App.jsx routing frissítve

### Következő lépések (prioritás szerint)
1. **Leads modul teljes implementáció**
   - Store létrehozása
   - LeadsPage komponens (lista, hozzáadás, szerkesztés, törlés)
   - Lead import funkciók
   - Státusz kezelés

2. **Marketing oldal implementáció**
   - Marketing csatornák kezelés
   - Kampány kezelés (placeholder → teljes)
   - Marketing statisztikák
   - Tartalom naptár

3. **Alapvető routing és layout**
   - App.jsx routing beállítása
   - MainLayout komponens
   - Header/Sidebar komponensek

4. **Firebase integráció**
   - Firebase service
   - Auth store
   - Adatbázis kapcsolat

5. **További modulok**
   - Dashboard
   - Sales modul
   - Apartments modul

## Forrás fájl
- `smartcrm.jsx` (~10k sor) - monolit forrás
- Leads modul: ~603-8227 sorok
- Marketing modul: ~7820-7877 sorok (placeholder, bővíteni kell)

## Technológiai stack
- Vite + React 18
- Zustand (state management)
- Tailwind CSS 3
- Firebase (Auth + Firestore)
- React Router v6

