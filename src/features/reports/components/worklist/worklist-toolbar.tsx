'use client';

import * as React from 'react';
import {
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReportStatus } from '../../types';

interface WorklistToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: 'ALL' | ReportStatus;
  onStatusChange: (status: 'ALL' | ReportStatus) => void;
  panicOnly: boolean;
  onPanicToggle: () => void;
  totalCount: number;
  draftCount: number;
  finalizedCount: number;
  panicCount: number;
  onResetFilters: () => void;
}

export function WorklistToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  panicOnly,
  onPanicToggle,
  totalCount,
  draftCount,
  finalizedCount,
  panicCount,
  onResetFilters,
}: WorklistToolbarProps) {
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedStatus !== 'ALL' || panicOnly;

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
      {/* Search Bar & Panic Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Universal Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Patient Name, Accession (R-XXXX), Phone (+91), or MRN..."
            className="w-full h-10 pl-9 pr-10 text-xs sm:text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Panic / Abnormal Flag Filter Toggle */}
        <button
          type="button"
          onClick={onPanicToggle}
          className={`h-10 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border shrink-0 ${
            panicOnly
              ? 'bg-red-600 text-white border-red-700 shadow-sm'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/50'
          }`}
          title="Filter only accessions with out-of-range or panic values"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Abnormal / Panic Only</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
              panicOnly ? 'bg-white text-red-700 font-bold' : 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            {panicCount}
          </span>
        </button>
      </div>

      {/* Filter Segment Tabs & Quick Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/60">
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onStatusChange('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-card text-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>All Accessions</span>
            <span className="ml-1.5 font-mono text-[11px] opacity-70">({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onStatusChange('DRAFT')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              selectedStatus === 'DRAFT'
                ? 'bg-card text-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Draft / In Entry</span>
            <span className="ml-1.5 font-mono text-[11px] opacity-70">({draftCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onStatusChange('FINALIZED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              selectedStatus === 'FINALIZED'
                ? 'bg-card text-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Finalized & Signed</span>
            <span className="ml-1.5 font-mono text-[11px] opacity-70">({finalizedCount})</span>
          </button>
        </div>

        {/* Active Filter Pill & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Filters applied</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-7 px-2 text-xs text-primary hover:underline"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
