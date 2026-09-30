'use client';

import * as React from 'react';
import { Search, CheckSquare, Square, Clock, TestTube } from 'lucide-react';
import { usePanels } from '../../api/use-panels';
import { formatCurrency } from '@/lib/formatters';
import { DEMO_TEST_PANELS } from '@/lib/demo-data';

interface PanelSelectorSectionProps {
  selectedPanelIds: string[];
  onTogglePanel: (panelId: string) => void;
}

export function PanelSelectorSection({
  selectedPanelIds,
  onTogglePanel,
}: PanelSelectorSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const { data: serverPanels, isLoading } = usePanels();

  const panels = serverPanels && serverPanels.length > 0 ? serverPanels : DEMO_TEST_PANELS;

  // Extract unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(panels.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [panels]);

  // Filter panels
  const filteredPanels = React.useMemo(() => {
    return panels.filter((panel) => {
      const matchesCategory =
        selectedCategory === 'All' || panel.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        panel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        panel.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [panels, selectedCategory, searchQuery]);

  return (
    <section className="bg-card rounded-xl p-4 sm:p-6 border border-border elevation-flat space-y-5">
      {/* Section Header with Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            02
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Clinical Investigation Panels
            </h2>
            <p className="text-xs text-muted-foreground">
              Select profile batteries, standalone tests, and automated pathology groups
            </p>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full lg:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by panel name or organ system..."
            className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
          Department:
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count =
            cat === 'All'
              ? panels.length
              : panels.filter((p) => p.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-7 px-3 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-border text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-lg border border-border bg-muted/20 animate-pulse space-y-2.5"
            >
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPanels.map((panel) => {
            const isSelected = selectedPanelIds.includes(panel.id);

            return (
              <div
                key={panel.id}
                onClick={() => onTogglePanel(panel.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-primary bg-primary/[0.03] shadow-xs'
                    : 'border-border bg-card hover:border-border/80 hover:bg-muted/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    className="mt-0.5 text-primary shrink-0 focus:outline-hidden"
                    aria-checked={isSelected}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-primary text-primary-foreground" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground line-clamp-1">
                      {panel.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                      <TestTube className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {panel.specimenType || `${panel.category} Specimen`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{panel.tatMinutes ? `${panel.tatMinutes}m TAT` : 'Same day'}</span>
                  </div>
                  <div className="font-bold font-mono text-foreground">
                    {formatCurrency(panel.price)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
