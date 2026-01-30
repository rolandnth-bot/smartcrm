import { memo, useMemo } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from './Icons';

/**
 * Pagination komponens
 * Támogatja az oldalszámozást, oldal méret választást, és egyedi stílusokat
 */
const Pagination = memo(({
  currentPage = 1,
  totalPages = 1,
  pageSize = 20,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showPageInfo = true,
  className = '',
  ...props
}) => {
  const startItem = useMemo(() => {
    return totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize, totalItems]);

  const endItem = useMemo(() => {
    return Math.min(currentPage * pageSize, totalItems);
  }, [currentPage, pageSize, totalItems]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
    }
  };

  // Számítsuk ki a megjelenítend oldal számokat
  const visiblePages = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Ha kevés oldal van, mindet mutassuk
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Ha sok oldal van, mutassunk egy tartományt
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`} {...props}>
      {showPageInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{startItem}</span>
          {' - '}
          <span className="font-medium">{endItem}</span>
          {' / '}
          <span className="font-medium">{totalItems}</span>
          {' találat'}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Elz oldal gomb */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Elz oldal"
        >
          <ChevronLeft />
        </Button>

        {/* Oldal számok */}
        <div className="flex items-center gap-1">
          {visiblePages[0] > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                aria-label="Els oldal"
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
              )}
            </>
          )}
          
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              aria-label={`Oldal ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Button>
          ))}
          
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                aria-label="Utolsó oldal"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Következ oldal gomb */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Következ oldal"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Oldal méret választó */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-sm text-gray-700 dark:text-gray-300">
            Oldalanként:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Oldalankénti találatok száma"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
