# Changelog

Minden jelentős változás dokumentálva lesz ebben a fájlban.

A formátum a [Keep a Changelog](https://keepachangelog.com/hu/1.0.0/) alapján készült,
és ez a projekt a [Semantic Versioning](https://semver.org/lang/hu/) követelményeit követi.

## [1.1.0] - 2026-01-23

### Hozzáadva
- **Excel Export funkció minden modulban**
  - Excel export hozzáadva LeadsPage-hez (CSV, Excel, JSON, PDF)
  - Excel export hozzáadva BookingsPage-hez (CSV, Excel, PDF)
  - Excel export hozzáadva ApartmentsPage-hez (CSV, Excel, PDF)
  - Excel export hozzáadva SalesPage-hez (CSV, Excel, PDF)
  - Excel export hozzáadva MarketingPage-hez (CSV, Excel, PDF)
  - Excel export hozzáadva CleaningPage-hez (CSV, Excel, PDF)
  - Excel export hozzáadva FinancePage-hez (CSV, Excel, PDF)
  - Excel export hozzáadva MaintenancePage-hez (CSV, Excel, PDF)
  - `exportToExcel()` függvény az exportUtils.js-ben
  - Helper függvények (`getExportData()`) a kód duplikáció elkerülésére
- **Cleaning Modul bővítések**
  - Excel export hozzáadva
  - Generálás foglalásokból modal (már korábban implementálva)
  - Bulk státusz váltás (már korábban implementálva)
- **Marketing Modul Excel Export**
  - Excel export hozzáadva MarketingPage-hez
  - Konzisztens export funkcionalitás

### Módosítva
- **Dokumentáció frissítve**
  - README.md: Excel export funkciók dokumentálása
  - PROJECT_STATUS.md: Verzió és batch-ek száma frissítve
  - TODO_NEXT.md: Batch 144-146 dokumentálva
  - package.json: Verzió 1.1.0-ra frissítve

## [1.5.0] - 2026-01-23

### Hozzáadva
- **Amenities (Felszereltségek) integrálása ApartmentsPage-be**
  - AmenitiesEditor komponens: kategóriák szerint checkbox-ok, keresés, collapsible szekciók
  - Új/szerkesztés form-ban amenities szerkesztő (notes után)
  - Lakás kártyákon amenities megjelenítés (badge-ek, max 5 + további számláló)
  - API mappers: `apartmentFromApi` / `apartmentToApi` amenities mező (array)
- **Pénzügy (Finance)** oldal: Bevételek / Elszámolások
  - Foglalások alapján payout összesítő, lakás és időszak szűrők (Ma, Hét, Hónap, Egyéni)
  - Karbantartási költségek a kiválasztott időszakban, részletes táblázat
- **Karbantartás (Maintenance)** oldal: bejelentések kezelése
  - Dátum, lakás, összeg, leírás, megjegyzés; lokális store (localStorage)
  - Szűrők (lakás, év, hónap, keresés), stat kártyák, törlés megerősítéssel
- **Takarítás részletesebb**: óra, textil, kiadás, check-in/out idő
  - Új mezők: Óra, Check-in/out idő, Textil (checkbox + díj), Kiadás, Kiadás megjegyzés
  - Új/szerkesztés form „Részletes adatok” szekció, listában megjelenítés, CSV export bővítve
- **Amenities config** (`src/config/amenities.js`): AIRBNB_AMENITIES, BOOKING_FELSZERELTSEG
  - Kategóriák szerint (Szobafelszereltség, Fürdőszoba, Média, Étkezés, stb.), flat lista
- **Elszámolások bővítése**: lakás szerinti részletezés, extra tételek, jutalék számítás
  - Lakás és hónap/év szerinti szűrés, foglalások részletezése (platform, dátum, vendég, payout)
  - Díjbekérő: havi díj, takarítási díjak, jutalék (management fee %), karbantartás
  - Extra tételek kezelése (kedvezmények, egyéb költségek), összesített elszámolás (partner felé utalandó)
- **Bank számla kezelés**: SettingsPage-ben user szerkesztésnél
  - Bank számlaszám mező hozzáadása, API frissítés (bank_account), user lista megjelenítés
- **Dashboard finomhangolás**: költségek részletes megjelenítése
  - Költségek kártya: takarítás, textil, mosoda, egyéb költségek külön sorokban
- **Takarítás részletek bővítése**: check-in/out idő megjelenítés listában
- **SalesPage konverziós arányok**: win rate, konverziós arány számítás és megjelenítés
  - Win rate (megnyert / lezárt), konverziós arány (megnyert / összes), aktív lead szám
- **LeadsPage konverziós statisztikák**: pipeline mellett konverziós arányok kártya
  - Összes lead, aktív lead, win rate, konverziós arány megjelenítése
- **FinancePage extra tételek localStorage**: extra tételek mentése localStorage-ba
  - Extra tételek (kedvezmények, egyéb költségek) perzisztálása böngészőben
- **MaintenancePage export funkciók**: CSV és PDF export hozzáadása
  - Karbantartás bejelentések exportálása CSV és PDF formátumban
- **Dokumentáció frissítés**: README.md bővítése új oldalakkal és store-okkal
  - FinancePage, MaintenancePage, maintenanceStore, amenities.js hozzáadása a dokumentációhoz
- **Workers API integráció**: workers API függvények hozzáadása
  - workersList, workersCreate, workersUpdate, workersDelete, workersGet
  - workerFromApi / workerToApi mappers
  - CleaningPage frissítve: workers API használata a dolgozók listázásához (fallback usersList-re)
- **Laundry API integráció**: mosoda rendelések API függvények hozzáadása
  - laundryList, laundryCreate, laundryUpdate, laundryDelete, laundryGet
  - laundryFromApi / laundryToApi mappers (snake_case ↔ camelCase)
  - Mosoda rendelések kezelése: dátum, lakás, táska szám, súly, költség, státusz
- **FinancePage export funkciók**: CSV és PDF export hozzáadása
  - Overview export: foglalások és bevételek CSV export
  - Settlements export: elszámolás részletek CSV export (lakás és hónap szerint)
  - PDF export: nyomtatás/PDF generálás
- **Dashboard értékesítési célok bővítése**: tervezett és tényleges bevétel megjelenítése
  - Értékesítési célok kártya: tervezett/tényleges egységek és bevétel, teljesítési arány
- **ApartmentsPage inventory kezelés**: lakások készletkezelése (raktárkészlet)
  - InventoryEditor komponens: tétel típus, méret, mennyiség, márka, megjegyzés kezelése
  - API mappers frissítve: apartmentFromApi és apartmentToApi inventory támogatással
  - Új lakás és szerkesztés modal-ban inventory szerkesztés lehetőség
  - Gyakori tétel típusok: Ágynemű, Törölköző, Konyharuha, Párna, Takaró, stb.
- **SettingsPage alkalmazás beállítások**: alkalmazás szintű beállítások kezelése
  - Settings API függvények: settingsGet, settingsUpdate
  - EUR árfolyam kezelés (MNB frissítés gomb)
  - Alapértelmezett értékek: óradíj, textil díj, mosoda ár/kg, management fee, takarítási díj
  - Céginformációk: név, email, telefon
  - Beállítások mentése és betöltése az API-ból
- **DashboardPage navigáció bővítése**: gyors navigációs menü fejlesztése
  - Navigációs kártyák: minden modul elérhető (Leads, Marketing, Sales, Apartments, Bookings, Cleaning, Finance, Maintenance, Settings)
  - Responsive grid layout: 2 oszlop mobilon, 3 tablet-en, 4 desktop-on
  - Jogosultság alapú megjelenítés: csak az elérhető modulok láthatók
- **Stats API bővítése**: további statisztikai API függvények hozzáadása
  - statsOverview: params támogatás (period, date_from, date_to)
  - statsWorkers: dolgozók teljesítmény statisztikák
  - statsApartments: lakások statisztikák
- **CleaningPage bulk műveletek bővítése**: "Select All" és bulk törlés funkciók hozzáadása
  - handleSelectAllCleanings: összes takarítás kijelölése/kijelölés törlése
  - handleBulkDelete: kiválasztott takarítások tömeges törlése megerősítéssel
  - Lista fejléc "Összes kijelölése" gomb, bulk műveletek közé törlés gomb
  - Konzisztens UX az ApartmentsPage, BookingsPage és LeadsPage oldalakkal
- **CleaningPage automatikus textil díj számítás**: UX fejlesztés textil kezeléshez
  - Automatikus textil díj beállítása amikor bekapcsolják a "Textil" checkbox-ot
  - Alapértelmezett textil díj betöltése az alkalmazás beállításokból (SettingsPage)
  - Új és szerkesztés modal-ban is működik az automatikus számítás
  - Textil díj törlése amikor kikapcsolják a checkbox-ot
  - Tooltip hozzáadása a textil díj mezőhöz, amely elmagyarázza az automatikus számítás működését
- **SettingsPage copy funkciók**: Email, telefonszám és bank számlaszám másolása
  - Copy gombok hozzáadása a céginformációk mezőkhöz (email, telefon)
  - Copy gombok a felhasználók listában (email, telefon, bank számlaszám)
  - Clipboard utility használata toast üzenetekkel
  - Gyors hozzáférés a fontos információkhoz
- **LeadsPage oszlop rendezés**: Interaktív rendezési funkciók hozzáadása
  - Rendezési gombok: Név, Státusz, Dátum szerint
  - Növekvő/csökkenő rendezés váltás kattintással
  - Vizuális indikátorok (ChevronUp/ChevronDown) az aktív rendezési mezőhöz
  - Rendezési állapot megjelenítése (kiválasztott mező és irány)
- **Unsaved Changes Warning**: Nem mentett változások figyelmeztetése
  - Új `useUnsavedChanges` hook implementálása
  - Figyelmeztetés navigáció előtt (React Router `useBlocker`)
  - Browser `beforeunload` event kezelése (oldal bezárása)
  - Integráció a LeadsPage-be (új lead form és szerkesztés)
  - Toast üzenetek a figyelmeztetésekhez
- **Oszlop rendezés bővítése**: További oldalakon is elérhető
  - BookingsPage oszlop rendezés: Érkezési dátum, Vendég név, Platform, Összeg szerint
  - ApartmentsPage oszlop rendezés: Név, Város, Státusz szerint
  - CleaningPage oszlop rendezés: Dátum, Összeg, Státusz szerint
  - Konzisztens UI és funkcionalitás minden listázó oldalon
  - Vizuális indikátorok (ChevronUp/ChevronDown) az aktív rendezési mezőhöz
  - Dátum és szám mezők helyes kezelése a rendezésben
- **Billentyűparancsok integráció**: Globális billentyűparancsok támogatás
  - KeyboardShortcutsModal komponens létrehozása
  - Billentyűparancsok listája és megjelenítése (Ctrl/Cmd + /)
  - Gyors keresés (Ctrl/Cmd + K) integráció
  - Navigációs billentyűparancsok (Ctrl/Cmd + 1-7) támogatása
  - Beállítások gyors elérése (Ctrl/Cmd + ,)
  - Mac kompatibilitás (Cmd billentyű támogatás)
- **Table és Pagination komponensek**: Újrahasznosítható UI komponensek
  - Table komponens: rendezhető oszlopok, sor kiválasztás, egyedi cella renderelés
  - Pagination komponens: oldalszámozás, oldal méret választás, oldal információ
  - Loading state támogatás (skeleton rows)
  - Empty state támogatás
  - Accessibility (ARIA attribútumok, keyboard navigation)
  - Dark mode támogatás
- **FormField komponens**: Újrahasznosítható form mező komponens
  - Inline error üzenetek megjelenítése
  - Required mező jelölés
  - Help text támogatás
  - Accessibility (ARIA attribútumok, error description)
  - Integráció a LeadsPage új lead formjába
  - Real-time error clearing (amikor a felhasználó javítja a hibát)
- **DashboardPage gyors műveletek**: Gyors hozzáférés a leggyakoribb műveletekhez
  - Gyors műveletek szekció hozzáadása
  - Gombok: Új lead, Új foglalás, Új lakás, Új takarítás
  - Permission alapú megjelenítés (csak az engedélyezett műveletek látszanak)
  - Gyors navigáció a megfelelő oldalakra
- **Refresh gombok**: Manuális adatfrissítés minden listázó oldalon
  - Refresh gomb hozzáadása: LeadsPage, BookingsPage, ApartmentsPage, CleaningPage
  - Loading state megjelenítése a refresh gombon
  - Disabled állapot betöltés közben
  - Accessibility (ARIA attribútumok, tooltip)
  - Konzisztens elhelyezés minden oldalon (első gombként)
- **Relatív idő megjelenítés**: Felhasználóbarát dátum formázás
  - `formatTimeAgo` függvény használata a LeadsPage-en
  - Relatív idő megjelenítése a lead létrehozási dátumhoz (pl. "2 napja", "3 órája")
  - Jobb UX: könnyebben érthető, mikor jöttek létre a leadek
- **Tooltip-ek a rendezési gombokhoz**: Jobb UX és hozzáférhetőség
  - Tooltip-ek hozzáadása a rendezési gombokhoz a LeadsPage-en és BookingsPage-en
  - Dinamikus tooltip szöveg: mutatja a jelenlegi rendezési irányt (növekvő/csökkenő)
  - Segíti a felhasználókat megérteni a rendezési funkciót
- **Bulk műveletek implementálása**: Tömeges műveletek a LeadsPage-en és BookingsPage-en
  - `handleBulkStatusChange` függvény a LeadsPage-en: tömeges státusz változtatás
  - `handleBulkDelete` függvény a LeadsPage-en és BookingsPage-en: tömeges törlés
  - Konfirmációs dialógusok a tömeges törléshez
  - Toast üzenetek sikeres/hibás műveletek után
  - Loading state a műveletek közben
- **Kiválasztott elemek exportálása**: Export funkciók bővítése
  - Ha van kiválasztott elem, akkor csak azokat exportálja (CSV, JSON)
  - Ha nincs kiválasztott elem, akkor az összes szűrt elemet exportálja
  - Export gombok a bulk műveletek sávban (LeadsPage, BookingsPage)
  - Dinamikus fájlnév: `_kivalasztott_` prefix, ha csak kiválasztott elemek vannak
  - Toast üzenetek az exportálás után (kiválasztott elemek esetén)
- **ConfirmDialog használata bulk törléshez**: Jobb UX a megerősítésekhez
  - `window.confirm` lecserélése `ConfirmDialog` komponenssel minden oldalon
  - Konzisztens megerősítési dialógusok a bulk törléshez (LeadsPage, BookingsPage, CleaningPage, ApartmentsPage)
  - Jobb UX: az alkalmazás stílusához illeszkedő megerősítési dialógusok
  - Accessibility: ARIA attribútumok és billentyű támogatás (Escape bezáráshoz)
- **Billentyűparancsok a formokhoz**: Gyorsabb form kezelés
  - Enter billentyű: form submit (LeadsPage új lead és szerkesztés form)
  - Ctrl/Cmd + S: form mentés (LeadsPage új lead és szerkesztés form)
  - Escape billentyű: form bezárása (LeadsPage új lead form)
  - Form tag használata a megfelelő submit kezeléshez
  - Jobb UX: gyorsabb munkafolyamat a billentyűparancsokkal
- **Dashboard bővítése**: További aktivitás információk
  - Legutóbbi foglalások lista hozzáadása a Dashboard-hoz
  - 3 oszlopos layout: Ma érkező foglalások, Legutóbbi leadek, Legutóbbi foglalások
  - Relatív idő megjelenítés a legutóbbi leadek és foglalások esetén (tooltip-tel teljes dátum)
  - Jobb áttekintés: a felhasználók gyorsan láthatják a legfrissebb aktivitásokat
- **Billentyűparancsok bővítése**: Form billentyűparancsok további oldalakon
  - BookingsPage: Enter (submit), Ctrl/Cmd+S (mentés), Escape (bezárás új foglalás form)
  - ApartmentsPage: Enter (submit), Ctrl/Cmd+S (mentés), Escape (bezárás új lakás form)
  - CleaningPage: Enter (submit), Ctrl/Cmd+S (mentés), Escape (bezárás új takarítás form)
  - Form tag használata a megfelelő submit kezeléshez
  - Konzisztens UX: ugyanazok a billentyűparancsok minden formon
- **Jogosultságok**: `maintenance.view`, `maintenance.edit` (manager); `maintenance.view` (accountant, readonly)
- **Navigáció**: Dashboard linkek Pénzügyre és Karbantartásra, Header címek, `/finance`, `/maintenance` route-ok

### Módosítva
- API `cleaningFromApi` / `cleaningToApi`: cleaningHours, hasTextile, textileEarnings, expenses, expenseNote, checkinTime, checkoutTime
- ROUTES: `finance`, `maintenance`; PermissionContext bővítve maintenance jogokkal

## [1.4.0] - 2026-01-23

### Hozzáadva
- **PWA Támogatás**: Service Worker offline támogatással
  - Network-first stratégia API hívásokhoz
  - Cache-first stratégia statikus assetekhez
  - Automatikus cache kezelés
- **API Retry Mechanizmus**: Exponential backoff retry logika
  - Intelligens retry (5xx és network hibák újrapróbálása)
  - Opcionális használat az API hívásokban
- **Online/Offline Figyelés**: Toast értesítések állapotváltozásokkor
  - `useOnlineStatus` hook
  - Header-ben offline badge megjelenítés
- **Performance Monitoring**: Development módban render teljesítmény mérése
  - `usePerformance` hook
  - Re-render figyelmeztetések
- **Strukturált Logger Utility**: Development/production mód logolás
  - Kontextus-alapú logger factory
  - API request/response logolás
  - Performance logolás
- **Debounce/Throttle Utilities**: React hook-ok és utility függvények
  - `useDebounce` hook értékekhez
  - `useDebouncedCallback` hook callback-ekhez
  - `useThrottle` hook callback-ekhez
- **Object Utilities**: Objektum manipulációs segédfüggvények
  - `deepClone`, `deepMerge` - Mély másolás és egyesítés
  - `pick`, `omit` - Kulcsok kiválasztása/kihagyása
  - `renameKeys`, `mapKeys`, `mapValues` - Kulcs/érték transzformációk
  - `get`, `set` - Nested objektum elérés ponttal elválasztott útvonallal
  - `isEqual`, `isEmpty`, `filterObject` - Objektum ellenőrzések és szűrés
  - `toPairs`, `fromPairs`, `invert` - Objektum-tömb konverziók
- **Deployment Dokumentáció**: Részletes telepítési útmutató
- **Build Optimalizációk**: Vite konfiguráció fejlesztések
  - Manual chunk splitting
  - CSS code splitting
  - Terser opciók

### Módosítva
- README.md frissítve az új funkciókkal
- Vite build konfiguráció optimalizálva

### Javítva
- Service Worker regisztráció production build-ben
- API retry logika finomhangolása
- TODO_NEXT „Később” szekció frissítve (elavult elemek eltávolítva)

### Tesztek
- **Vitest** unit teszt framework hozzáadva
- **objectUtils.test.js**: 36 unit teszt (deepClone, deepMerge, pick, omit, renameKeys, isEmpty, isEqual, filterObject, mapValues, mapKeys, toPairs, fromPairs, invert, getDepth, get, set, stringify)
- `npm run test` (watch), `npm run test:run` (egyszeri futtatás)

## [1.3.0] - 2026-01-20

### Hozzáadva
- Partner regisztrációs űrlap (11 lépéses)
- iCal sync funkcionalitás
- Cleaning modul teljes implementáció
- RBAC (Role-Based Access Control) rendszer
- Permission rendszer API integrációval
- Export funkciók (CSV, JSON, PDF)
- Dark mode teljes támogatás
- Keyboard shortcuts modal

### Módosítva
- Dashboard statisztikák valós adatokkal
- API integráció minden modulhoz
- Settings oldal roles API-val

## [1.2.0] - 2026-01-15

### Hozzáadva
- Bookings modul (naptár nézet)
- Apartments modul (iCal beállítások)
- Marketing modul (kampány kezelés)
- Sales modul (pipeline, célok)

### Módosítva
- Code splitting (React.lazy + Suspense)
- Backend API kliens integráció

## [1.1.0] - 2026-01-10

### Hozzáadva
- Leads modul (CRUD, import/export)
- Dashboard statisztikák
- Firebase Authentication
- Zustand state management

## [1.0.0] - 2026-01-05

### Hozzáadva
- Projekt inicializálás
- React + Vite setup
- Tailwind CSS konfiguráció
- Alap routing és layout

---

## Típusok

- **Hozzáadva**: Új funkciók
- **Módosítva**: Meglévő funkciók változásai
- **Elavult**: Hamarosan eltávolítandó funkciók
- **Eltávolítva**: Eltávolított funkciók
- **Javítva**: Hibajavítások
- **Biztonság**: Biztonsági javítások
