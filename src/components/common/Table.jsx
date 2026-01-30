import { memo } from 'react';
import { ChevronUp, ChevronDown } from './Icons';

/**
 * Általános táblázat komponens
 * Támogatja a rendezést, kiválasztást, és egyedi cella renderelést
 */
const Table = memo(({
  columns = [],
  data = [],
  onSort,
  sortConfig = null,
  onRowClick,
  onRowSelect,
  selectedRows = [],
  keyField = 'id',
  className = '',
  emptyMessage = 'Nincs megjeleníthet adat',
  loading = false,
  ...props
}) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleRowSelect = (row, checked) => {
    if (onRowSelect) {
      onRowSelect(row, checked);
    }
  };

  const isRowSelected = (row) => {
    return selectedRows.includes(row[keyField]);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`} {...props}>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`} {...props}>
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {onRowSelect && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={(e) => {
                    data.forEach((row) => {
                      handleRowSelect(row, e.target.checked);
                    });
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  aria-label="Összes kijelölése"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  col.sortable && onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                }`}
                onClick={() => col.sortable && handleSort(col.field)}
                role={col.sortable ? 'button' : undefined}
                tabIndex={col.sortable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(col.field);
                  }
                }}
                aria-sort={
                  sortConfig && sortConfig.field === col.field
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && sortConfig && sortConfig.field === col.field && (
                    <span className="text-gray-400">
                      {sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] || rowIdx}
              className={`${
                onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
              } ${isRowSelected(row) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => handleRowClick(row)}
            >
              {onRowSelect && (
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isRowSelected(row)}
                    onChange={(e) => handleRowSelect(row, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    aria-label={`Sor kijelölése: ${row[columns[0]?.field] || ''}`}
                  />
                </td>
              )}
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 ${col.className || ''}`}
                >
                  {col.render ? col.render(row, rowIdx) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
