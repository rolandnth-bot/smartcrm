# Prompt Next - Folytatáshoz használható prompt

## Kontextus
SmartCRM monolit (`smartcrm.jsx` ~10k sor) modern Vite + React struktúrába való refaktorálása folyamatban.

## Jelenlegi állapot
- ✅ Projekt alapok kész (package.json, vite.config.js, tailwind.config.js)
- ✅ Checkpoint fájlok létrehozva
- 🔄 **Folyamatban**: Leads modul + Marketing oldal implementáció

## Következő lépés
**Batch 1 folytatása**: Leads modul és Marketing oldal implementálása

### Konkrét feladatok
1. **Leads Store** (`src/stores/leadsStore.js`)
   - Zustand store létrehozása
   - Lead CRUD műveletek (create, read, update, delete)
   - Státusz kezelés
   - Filter/sort funkciók
   - Lead objektum struktúra: {id, name, email, phone, source, status, rating, notes, createdAt}

2. **LeadsPage** (`src/pages/LeadsPage.jsx`)
   - Lead lista megjelenítés (státusz színekkel)
   - Új lead hozzáadása form (név kötelező)
   - Lead szerkesztése modal
   - Lead törlése (confirm dialog)
   - Státusz változtatás dropdown
   - Import funkciók (CSV sablon letöltés, JSON import placeholder)
   - Sales pipeline statisztikák

3. **MarketingPage** (`src/pages/MarketingPage.jsx`)
   - Marketing csatornák lista (Weboldal, Instagram, Facebook, TikTok)
   - Kampány kezelés (alap struktúra, később bővíthető)
   - Marketing statisztikák (placeholder)
   - Tartalom naptár (placeholder)

### Forrás információk
- Leads modul: `smartcrm.jsx` ~603-8227 sorok
- Marketing modul: `smartcrm.jsx` ~7820-7877 sorok
- State változók és struktúrák: lásd `EXTRACT_NOTES.md`
- Stílusok: Tailwind utility classes, státusz színek (orange, yellow, blue, purple, cyan, green, red)

### Fontos
- **Limit-kezelés**: Maximum 1-3 fájl teljes tartalommal egy batch-ben
- **Működő kód**: Minden fájlnak teljesnek és működőnek kell lennie
- **Eredeti funkcionalitás**: Minden funkció megmarad, csak struktúra változik
- **90%-nál**: Checkpoint fájlok frissítése

### Technológiai stack
- React 18 + JSX
- Zustand (state management)
- Tailwind CSS 3
- React Router v6 (később)

## Fájlok helye
- Projekt root: `/Users/roli/Desktop/SmartCRM/`
- Forrás: `smartcrm.jsx`
- Checkpoint fájlok: `MIGRATION_PLAN.md`, `FILE_MAP.md`, `TODO_NEXT.md`, `EXTRACT_NOTES.md`, `PROMPT_NEXT.md`

