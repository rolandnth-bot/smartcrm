# Következő 5 Fejlesztési Terv

## 1. Billentyűparancsok Modal Implementálása ✅
**Prioritás**: Közepes  
**Becsült idő**: 1-2 óra  
**Státusz**: ✅ Elkészült (Batch 140)

- **Cél**: Ctrl/Cmd + / billentyűparancs megjelenít egy modal-t az összes elérhető billentyűparancsokkal
- **Komponens**: `KeyboardShortcutsModal.jsx` létrehozva ✅
- **Funkciók**:
  - ✅ Összes elérhető billentyűparancs listázása
  - ✅ Kategóriák szerint csoportosítva (Navigáció, Műveletek, Keresés)
  - ✅ Vizuális megjelenítés (billentyű kombinációk ikonokkal)
  - ✅ Accessibility támogatás (ARIA attribútumok, keyboard navigáció)
- **Integráció**: ✅ `useKeyboardShortcuts.js` hook frissítve
- **UX**: ✅ Modal megnyitása Ctrl/Cmd + / billentyűvel

## 2. Dark Mode Implementáció ✅
**Prioritás**: Alacsony  
**Becsült idő**: 3-4 óra  
**Státusz**: ✅ Elkészült (Batch 147)

- **Cél**: Teljes dark mode támogatás az alkalmazásban
- **Megközelítés**:
  - ✅ Tailwind dark mode konfiguráció (`dark:` prefix)
  - ✅ Theme toggle gomb a Header-ben
  - ✅ LocalStorage mentés a preferencia
  - ✅ System preference észlelése (`prefers-color-scheme`)
- **Komponensek frissítése**:
  - ✅ Minden oldal (Dashboard, Leads, Marketing, Sales, Apartments, Bookings, Cleaning, Settings, Login, PartnerRegistration)
  - ✅ Common komponensek (Button, Card, Modal, Toast, Tooltip, FormField, Table, Pagination, EmptyState, ConfirmDialog)
  - ✅ Layout komponensek (Header, MainLayout)
- **CSS**: ✅ Dark mode színséma definiálva (index.css)
- **UX**: ✅ Smooth transition dark/light mód váltáskor

## 3. További Utility Függvények Integrálása ✅
**Prioritás**: Közepes  
**Becsült idő**: 2-3 óra  
**Státusz**: ✅ Elkészült (Batch 139)

- **Cél**: `arrayUtils.js` és `stringUtils.js` függvények használata az alkalmazásban
- **Integráció területek**:
  - ✅ **ApartmentsPage**: `sortBy`, `filterBy` használata
  - ✅ **BookingsPage**: `sortBy`, `filterBy`, `contains` használata
  - ✅ **CleaningPage**: `sortBy`, `filterBy`, `contains` használata
  - ✅ **SalesPage**: `sumBy`, `averageBy` használata statisztikákhoz
  - ✅ **Stores**: `groupBy`, `sumBy` használata aggregációkhoz
- **Előnyök**:
  - ✅ Konzisztens kód
  - ✅ Jobb karbantarthatóság
  - ✅ Újrafelhasználható függvények

## 4. Email Service Valós Implementáció
**Prioritás**: Alacsony (ha nincs szükség email küldésre)  
**Becsült idő**: 4-6 óra

- **Cél**: SendGrid vagy Resend API integráció
- **Választás**: SendGrid vagy Resend (környezeti változó alapján)
- **Implementáció**:
  - `sendViaSendGrid()` függvény implementálása
  - `sendViaResend()` függvény implementálása
  - Error handling javítása
  - Rate limiting kezelés
  - Email template rendszer bővítése
- **Tesztelés**: 
  - Development környezetben tesztelés
  - Error esetek kezelése
- **Dokumentáció**: Email service használati útmutató

## 5. Marketing Tartalom Naptár Implementálása ✅
**Prioritás**: Alacsony  
**Becsült idő**: 3-5 óra  
**Státusz**: ✅ Elkészült

- **Cél**: Marketing tartalom naptár funkció a MarketingPage-en
- **Funkciók**:
  - ✅ Tartalom hozzáadása dátumhoz
  - ✅ Tartalom típusok (blog poszt, social media, email kampány, stb.)
  - ✅ Naptár nézet a tartalmakkal
  - ✅ CRUD műveletek (létrehozás, szerkesztés, törlés)
- **Store**: ✅ `marketingStore.js` bővítve tartalom kezeléssel (contentItems, addContentItem, updateContentItem, deleteContentItem, getContentByDate)
- **UI**: ✅ `ContentCalendar.jsx` komponens létrehozva és integrálva a MarketingPage-en
- **UX**: ✅ Konzisztens design a többi oldallal, dark mode támogatással

---

## További Lehetséges Fejlesztések (Később)

### 6. Unit Tesztek Hozzáadása
- React Testing Library használata
- Komponens tesztek
- Utility függvény tesztek
- Store tesztek

### 7. Performance Monitoring
- Bundle size monitoring
- Runtime performance metrikák
- Error tracking (Sentry vagy hasonló)

### 8. További Accessibility Javítások
- Screen reader tesztelés
- Keyboard navigáció teljes lefedettség
- ARIA attribútumok audit

### 9. Dokumentáció Bővítése
- API dokumentáció
- Komponens dokumentáció (Storybook vagy hasonló)
- Használati útmutatók

### 10. Internationalization (i18n)
- Többnyelvű támogatás
- Fordítások kezelése
- Locale alapú formázás

---

## Prioritás Rangsorolás

1. ✅ **Billentyűparancsok Modal** - Elkészült (Batch 140)
2. ✅ **Utility Függvények Integrálása** - Elkészült (Batch 139)
3. ✅ **Dark Mode** - Elkészült (Batch 147)
4. ✅ **Marketing Tartalom Naptár** - Elkészült
5. **Email Service** - Rackhost SMTP integráció kész, SendGrid/Resend opcionális (alacsony prioritás)

## Következő Lehetséges Fejlesztések

### Email Service Bővítés (Opcionális)
- SendGrid API integráció implementálása
- Resend API integráció implementálása
- Email template rendszer bővítése
- Rate limiting kezelés


