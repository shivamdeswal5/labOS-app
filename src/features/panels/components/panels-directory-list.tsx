'use client';

import * as React from 'react';
import { Search, Clock, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import type { MasterPanel } from '../types';

interface PanelsDirectoryListProps {
  panels: MasterPanel[];
  selectedPanelId: string;
  onSelectPanel: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function PanelsDirectoryList({
  panels,
  selectedPanelId,
  onSelectPanel,
  searchQuery,
  onSearchChange,
}: PanelsDirectoryListProps) {
  const selectedRef = React.useRef<HTMLDivElement | null>(null);

  // Smoothly scroll the selected card into view within the directory pane
  React.useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedPanelId]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-card/30">
      {/* Directory Search Header - Pinned at top of directory column */}
      <div className="p-4 border-b border-border bg-card/90 backdrop-blur-xs flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>Panel Directory</span>
          </span>
          <span className="font-mono text-[11px] bg-secondary text-foreground px-2 py-0.5 rounded border border-border font-medium">
            Showing {panels.length} {panels.length === 1 ? 'Panel' : 'Panels'}
          </span>
        </div>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter panel names, shortcodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-9 pr-8 bg-muted/50 border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Panels Cards List - Independent Vertical Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        {panels.length === 0 ? (
          <div className="bg-card rounded-lg p-8 border border-dashed border-border text-center text-xs text-muted-foreground font-mono">
            No diagnostic panels match current filter.
          </div>
        ) : (
          panels.map((panel) => {
            const isSelected = selectedPanelId === panel.id;
            const paramCount = panel.sections.reduce(
              (acc, s) => acc + s.parameters.length,
              0,
            );

            return (
              <div
                key={panel.id}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelectPanel(panel.id)}
                className={cn(
                  'rounded-lg p-3.5 border transition-all cursor-pointer shadow-xs flex flex-col gap-2 relative text-left',
                  isSelected
                    ? 'bg-card border-primary/50 ring-1 ring-primary/30 shadow-sm border-l-4 border-l-primary'
                    : 'bg-card border-border hover:bg-muted/40 hover:border-muted-foreground/30',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'text-sm font-semibold tracking-tight text-foreground truncate',
                        isSelected && 'text-primary font-bold',
                      )}
                    >
                      {panel.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'font-mono text-[10px] px-2 py-0.5 rounded font-bold shrink-0',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground border border-border',
                    )}
                  >
                    {panel.code || 'PANEL'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                    {panel.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {paramCount} Parameters
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-mono text-xs">
                      TAT: {panel.tatText || (panel.tatMinutes ? `${panel.tatMinutes}m` : '45m')}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatCurrency(panel.price)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Catalog Version & Audit Bar - Pinned at bottom of directory column */}
      <div className="p-3 border-t border-border bg-card/80 backdrop-blur-xs flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">Catalog Version</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            Release Rev 2024.11-B
          </span>
        </div>
        <button
          type="button"
          className="h-7 px-2.5 bg-muted text-foreground hover:bg-muted/80 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border border-border"
        >
          <History className="w-3 h-3 text-muted-foreground" />
          <span>Audit Trail</span>
        </button>
      </div>
    </div>
  );
}
