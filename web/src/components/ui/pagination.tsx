import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }
  }

  return (
    <nav aria-label="pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {pages.map((page, i) => (
        <React.Fragment key={i}>
          {page === '...' ? (
            <span className="px-3 py-2 text-sm text-muted-foreground flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={cn(
                "min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                currentPage === page 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground hover:bg-muted"
              )}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
