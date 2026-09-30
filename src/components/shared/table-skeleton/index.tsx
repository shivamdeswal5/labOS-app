'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * TableSkeleton
 * Standard table loading skeleton state with animated pulse indicators.
 */
export function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
  return (
    <div className={cn('w-full space-y-3 p-4 bg-card rounded-lg border border-border', className)}>
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        <div className="h-8 w-28 bg-muted animate-pulse rounded" />
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center gap-4 py-3 px-2 border-b border-border/50 last:border-0"
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={cn(
                  'h-4 bg-muted animate-pulse rounded',
                  cIdx === 0 && 'w-24',
                  cIdx === 1 && 'w-36 flex-1',
                  cIdx === 2 && 'w-28',
                  cIdx === 3 && 'w-20',
                  cIdx >= 4 && 'w-16',
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
