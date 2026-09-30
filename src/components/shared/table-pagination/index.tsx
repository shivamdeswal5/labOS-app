'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useURLState } from '@/hooks/use-url-state';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface TablePaginationProps {
  totalCount: number;
  pageSizeOptions?: number[];
  className?: string;
  defaultPageSize?: number;
}

function TablePaginationInner({
  totalCount,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  className,
}: TablePaginationProps) {
  const { getNumberParam, setParams } = useURLState();

  const page = Math.max(1, getNumberParam('page', 1));
  const limit = Math.max(1, getNumberParam('limit', defaultPageSize));

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const safePage = Math.min(page, totalPages);

  const startItem = totalCount === 0 ? 0 : (safePage - 1) * limit + 1;
  const endItem = Math.min(safePage * limit, totalCount);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setParams({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 });
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card/50 text-xs text-muted-foreground',
        className,
      )}
    >
      {/* Record Counter */}
      <div className="flex items-center gap-1.5">
        <span>
          Showing <strong className="text-foreground font-semibold tabular-nums">{startItem}</strong> to{' '}
          <strong className="text-foreground font-semibold tabular-nums">{endItem}</strong> of{' '}
          <strong className="text-foreground font-semibold tabular-nums">{totalCount}</strong> records
        </span>
      </div>

      {/* Page Navigation & Size Selector */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="h-7 px-2 bg-background border border-border rounded text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Page Jump Controls */}
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs mr-2">
            Page <strong className="text-foreground font-semibold">{safePage}</strong> of{' '}
            <strong className="text-foreground font-semibold">{totalPages}</strong>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={safePage <= 1}
            className="h-7 w-7 p-0"
            title="First page"
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="h-7 w-7 p-0"
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="h-7 w-7 p-0"
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={safePage >= totalPages}
            className="h-7 w-7 p-0"
            title="Last page"
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * TablePagination
 * URL-synchronized table pagination controller benchmarking residency-frontend standard.
 * Wrapped in React.Suspense to comply with Next.js App Router static prerendering.
 */
export function TablePagination(props: TablePaginationProps) {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50 text-xs text-muted-foreground h-12">
          <span>Loading pagination...</span>
        </div>
      }
    >
      <TablePaginationInner {...props} />
    </React.Suspense>
  );
}
