import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Calculate visible page range
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {showInfo && (
        <div className="text-sm text-slate-400">
          Showing page <span className="font-bold text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-white">{totalPages}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-lg transition-all',
            'bg-white/5 border border-white/10',
            'hover:bg-white/10 hover:border-white/20',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'text-slate-400 hover:text-white'
          )}
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-lg transition-all',
            'bg-white/5 border border-white/10',
            'hover:bg-white/10 hover:border-white/20',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'text-slate-400 hover:text-white'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={clsx(
                  'min-w-[40px] h-10 px-3 rounded-lg font-bold transition-all',
                  'text-sm',
                  currentPage === page
                    ? 'bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white shadow-lg shadow-accent-900/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                )}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-2 text-slate-500">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-lg transition-all',
            'bg-white/5 border border-white/10',
            'hover:bg-white/10 hover:border-white/20',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'text-slate-400 hover:text-white'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-lg transition-all',
            'bg-white/5 border border-white/10',
            'hover:bg-white/10 hover:border-white/20',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'text-slate-400 hover:text-white'
          )}
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
