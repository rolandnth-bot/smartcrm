/**
 * Export utilities: CSV, JSON, Nyomtatás/PDF
 */

const CSV_SEP = ',';

function escapeCSV(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(CSV_SEP) || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Export array of objects to CSV and trigger download.
 * @param {Array<Object>} data
 * @param {Array<{key: string, label: string}>} columns e.g. [{key: 'name', label: 'Név'}, ...]
 * @param {string} filename
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  const headers = columns.map((c) => escapeCSV(c.label));
  const rows = data.map((row) =>
    columns.map((c) => escapeCSV(row[c.key])).join(CSV_SEP)
  );
  const csv = [headers.join(CSV_SEP), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON and trigger download.
 * @param {Object|Array} data
 * @param {string} filename
 */
export function exportToJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export array of objects to Excel (CSV format with .xlsx extension, Excel-compatible).
 * @param {Array<Object>} data
 * @param {Array<{key: string, label: string}>} columns e.g. [{key: 'name', label: 'Név'}, ...]
 * @param {string} filename
 */
export function exportToExcel(data, columns, filename = 'export.xlsx') {
  // Excel is compatible with CSV format, so we use the same CSV generation
  const headers = columns.map((c) => escapeCSV(c.label));
  const rows = data.map((row) =>
    columns.map((c) => escapeCSV(row[c.key])).join(CSV_SEP)
  );
  const csv = [headers.join(CSV_SEP), ...rows].join('\n');
  // Use Excel MIME type, but CSV content (Excel will open it correctly)
  const blob = new Blob(['\ufeff' + csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : filename.replace(/\.(csv|txt)$/, '.xlsx');
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open print dialog (user can "Save as PDF"). Optional: focus a printable container.
 * @param {string} [documentTitle]
 */
export function printToPDF(documentTitle = 'SmartCRM') {
  const prev = document.title;
  document.title = documentTitle;
  window.print();
  document.title = prev;
}

