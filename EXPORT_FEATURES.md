# SmartCRM - Export Funkciók Dokumentáció

**Verzió**: 1.1.0  
**Dátum**: 2026-01-23

---

## 📊 Export Funkciók Áttekintése

A SmartCRM minden modulban támogatja az adatok exportálását több formátumban. Az export funkciók konzisztens módon vannak implementálva, és minden oldalon elérhetők.

---

## 📤 Támogatott Export Formátumok

### 1. CSV Export
- **Formátum**: CSV (Comma-Separated Values)
- **Kódolás**: UTF-8 BOM (Excel kompatibilis)
- **Használat**: Minden modulban elérhető
- **Függvény**: `exportToCSV(data, columns, filename)`

### 2. Excel Export ⭐ ÚJ v1.1.0
- **Formátum**: Excel-kompatibilis CSV (.xlsx kiterjesztés)
- **MIME Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Használat**: Minden modulban elérhető
- **Függvény**: `exportToExcel(data, columns, filename)`

### 3. JSON Export
- **Formátum**: JSON (JavaScript Object Notation)
- **Használat**: LeadsPage, BookingsPage
- **Függvény**: `exportToJSON(data, filename)`

### 4. PDF Export
- **Formátum**: PDF (Print to PDF)
- **Használat**: Minden modulban elérhető
- **Függvény**: `printToPDF(documentTitle)`

---

## 📄 Oldalak és Export Funkciók

### 1. LeadsPage (Leadek Kezelése)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ JSON Export
- ✅ PDF Export

**Exportált adatok**:
- Név, Email, Telefon
- Státusz, Forrás, Értékelés
- Dátumok (létrehozás, frissítés)
- Megjegyzések

**Funkciók**:
- Összes lead exportálása
- Kiválasztott leadek exportálása (bulk export)
- Dinamikus fájlnév (kiválasztott/összes)

**Kód példa**:
```javascript
const handleExportCSV = useCallback(() => {
  const dataToExport = getExportData();
  exportToCSV(dataToExport, leadExportColumns, filename);
}, [getExportData, leadExportColumns]);

const handleExportExcel = useCallback(() => {
  const dataToExport = getExportData();
  exportToExcel(dataToExport, leadExportColumns, filename);
}, [getExportData, leadExportColumns]);
```

---

### 2. BookingsPage (Foglalások)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Lakás, Vendég, Platform
- Check-in/Check-out dátumok
- Ár, Státusz
- Megjegyzések

**Funkciók**:
- Összes foglalás exportálása
- Kiválasztott foglalások exportálása (bulk export)
- Szűrt adatok exportálása

---

### 3. ApartmentsPage (Lakások)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Név, Cím, Típus
- Szobák száma, Férőhelyek
- Ár, Státusz
- Amenities (felszereltségek)
- Megjegyzések

---

### 4. SalesPage (Értékesítés)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Értékesítési célok (éves bontásban)
- Pipeline statisztikák
- Konverziós arányok

---

### 5. MarketingPage (Marketing)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Kampány neve, Csatorna
- Státusz, Dátumok (kezdés, vége)
- Költségvetés, Megjegyzések

**Funkciók**:
- Kampányok exportálása
- Marketing statisztikák exportálása

---

### 6. CleaningPage (Takarítás)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Dátum, Lakás
- Dolgozó, Óra
- Check-in/out idő
- Textil, Kiadás
- Megjegyzések

**Funkciók**:
- Takarítások exportálása
- Részletes adatok exportálása

---

### 7. FinancePage (Pénzügy)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Foglalások pénzügyi adatai
- Payout összesítő
- Karbantartási költségek
- Elszámolások

**Funkciók**:
- Foglalások exportálása pénzügyi adatokkal
- Időszak szerinti exportálás

---

### 8. MaintenancePage (Karbantartás)

**Export formátumok**:
- ✅ CSV Export
- ✅ Excel Export ⭐
- ✅ PDF Export

**Exportált adatok**:
- Dátum, Lakás
- Összeg, Leírás
- Megjegyzések

**Funkciók**:
- Karbantartási bejelentések exportálása
- Szűrt adatok exportálása

---

## 🛠️ Technikai Implementáció

### Export Utils (`src/utils/exportUtils.js`)

#### `exportToCSV(data, columns, filename)`
```javascript
export function exportToCSV(data, columns, filename = 'export.csv') {
  const headers = columns.map((c) => escapeCSV(c.label));
  const rows = data.map((row) =>
    columns.map((c) => escapeCSV(row[c.key])).join(CSV_SEP)
  );
  const csv = [headers.join(CSV_SEP), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  // Download trigger...
}
```

#### `exportToExcel(data, columns, filename)` ⭐ ÚJ
```javascript
export function exportToExcel(data, columns, filename = 'export.xlsx') {
  // Excel is compatible with CSV format, so we use the same CSV generation
  const headers = columns.map((c) => escapeCSV(c.label));
  const rows = data.map((row) =>
    columns.map((c) => escapeCSV(row[c.key])).join(CSV_SEP)
  );
  const csv = [headers.join(CSV_SEP), ...rows].join('\n');
  // Use Excel MIME type, but CSV content (Excel will open it correctly)
  const blob = new Blob(['\ufeff' + csv], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  // Download trigger...
}
```

#### `exportToJSON(data, filename)`
```javascript
export function exportToJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  // Download trigger...
}
```

#### `printToPDF(documentTitle)`
```javascript
export function printToPDF(documentTitle = 'SmartCRM') {
  window.print();
}
```

---

## 🎯 Helper Függvények

### `getExportData()` Pattern

A kód duplikáció elkerülésére minden oldalon használunk egy `getExportData()` helper függvényt:

```javascript
const getExportData = useCallback(() => {
  // Szűrt adatok előkészítése
  return filteredData;
}, [filteredData, dependencies]);

const handleExportCSV = useCallback(() => {
  const { columns, data } = getExportData();
  exportToCSV(data, columns, 'filename.csv');
}, [getExportData]);

const handleExportExcel = useCallback(() => {
  const { columns, data } = getExportData();
  exportToExcel(data, columns, 'filename.xlsx');
}, [getExportData]);
```

**Előnyök**:
- ✅ Kód duplikáció elkerülése
- ✅ Konzisztens export logika
- ✅ Könnyű karbantartás
- ✅ Tesztelhetőség

---

## 📋 Export Oszlopok Definíciója

Minden oldalon az export oszlopok egy konstans objektumban vannak definiálva:

```javascript
const exportColumns = useMemo(() => [
  { key: 'name', label: 'Név' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Státusz' },
  // ...
], []);
```

---

## 🎨 UI Implementáció

### Export Gombok

Minden oldalon az export gombok a fejlécben, az akciók között találhatók:

```jsx
<div className="flex gap-2">
  <Button onClick={handleExportCSV} variant="outline">
    CSV export
  </Button>
  <Button onClick={handleExportExcel} variant="outline">
    Excel export
  </Button>
  <Button onClick={handlePrintPDF} variant="outline">
    Nyomtatás / PDF
  </Button>
</div>
```

### Print Styling

A PDF export (nyomtatás) során bizonyos elemek el vannak rejtve:

```css
.no-print {
  display: none !important;
}
```

---

## ✅ Export Funkciók Checklist

### Minden oldal rendelkezik:
- [x] CSV Export
- [x] Excel Export ⭐
- [x] PDF Export (Nyomtatás)
- [x] `getExportData()` helper függvény
- [x] Konzisztens UI (export gombok)
- [x] Dinamikus fájlnév
- [x] UTF-8 BOM (Excel kompatibilitás)

### Speciális funkciók:
- [x] Bulk export (kiválasztott elemek) - LeadsPage, BookingsPage
- [x] JSON Export - LeadsPage, BookingsPage
- [x] Szűrt adatok exportálása - Minden oldal

---

## 🚀 Használati Példák

### 1. Összes adat exportálása

```javascript
// CSV export
handleExportCSV();

// Excel export
handleExportExcel();

// PDF export
handlePrintPDF();
```

### 2. Kiválasztott elemek exportálása

```javascript
// LeadsPage példa
const selectedLeads = [1, 2, 3];
const dataToExport = leads.filter(lead => 
  selectedLeads.includes(lead.id)
);
exportToCSV(dataToExport, columns, 'selected_leads.csv');
```

### 3. Szűrt adatok exportálása

```javascript
// Szűrt adatok automatikusan használódnak
const filteredData = getFilteredData();
exportToExcel(filteredData, columns, 'filtered_data.xlsx');
```

---

## 🔧 Fejlesztési Javaslatok (Opcionális)

### P1 - Fontos
- [ ] XML Export formátum
- [ ] Export előnézet modal
- [ ] Export ütemezés (automatikus export)
- [ ] Export sablonok

### P2 - Nice to Have
- [ ] Export API (szerver oldali export)
- [ ] Nagy adatmennyiség kezelése (pagination)
- [ ] Export előzmények
- [ ] Export értesítések (email)

---

## 📚 További Dokumentáció

- [README.md](./README.md) - Teljes projekt dokumentáció
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Projekt áttekintő
- [VERSION_1.1.0_SUMMARY.md](./VERSION_1.1.0_SUMMARY.md) - Verzió 1.1.0 összefoglaló

---

**Utolsó frissítés**: 2026-01-23  
**Verzió**: 1.1.0
