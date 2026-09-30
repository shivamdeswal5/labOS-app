'use client';

import * as React from 'react';
import { PlusCircle, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelsHeaderProps {
  totalCount: number;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onCreateClick: () => void;
}

const CATEGORIES = [
  'All',
  'Hematology',
  'Biochemistry',
  'Clinical Pathology',
  'Serology',
  'Endocrinology',
];

export function PanelsHeader({
  totalCount,
  selectedCategory,
  onSelectCategory,
  onCreateClick,
}: PanelsHeaderProps) {
  return (
    <section className="bg-card border-b border-border px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs shrink-0 z-10">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Test Catalog &amp; Panel Configuration
          </h1>
          <span className="font-mono text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold border border-border flex items-center gap-1">
            <Database className="w-3 h-3 text-primary" />
            <span>Master DB</span>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground font-medium">
            {totalCount} Active Panels in Master Catalog
          </span>
          <span className="text-muted-foreground font-mono text-xs">/</span>
          <span className="font-mono text-xs text-muted-foreground">
            NABL Tier-1 Diagnostic Spec
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Category Pills */}
        <div className="flex items-center bg-muted/60 rounded-lg p-1 border border-border shadow-sm">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={cn(
                  'px-3 py-1 text-xs rounded-md transition-all font-medium',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Create Panel Button */}
        <button
          type="button"
          onClick={onCreateClick}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Panel</span>
        </button>
      </div>
    </section>
  );
}
