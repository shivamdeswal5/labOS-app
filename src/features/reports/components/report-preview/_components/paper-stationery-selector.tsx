'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  Layers,
  Printer,
  ChevronDown,
  Check,
  Sliders,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StationeryType } from '@/features/settings/types';

interface PaperStationerySelectorProps {
  stationeryType: StationeryType;
  onChange: (type: StationeryType) => void;
  headerMarginMm: number;
  footerMarginMm: number;
  simulateBlankStationery: boolean;
  onToggleSimulate: (val: boolean) => void;
}

export function PaperStationerySelector({
  stationeryType,
  onChange,
  headerMarginMm,
  footerMarginMm,
  simulateBlankStationery,
  onToggleSimulate,
}: PaperStationerySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: {
    type: StationeryType;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      type: 'PLAIN',
      label: 'Plain A4 Paper',
      sublabel: 'Prints complete digital header, logo & legal footer',
      icon: FileText,
      badge: 'Full Print',
    },
    {
      type: 'PREPRINTED_HEADER',
      label: 'Pre-Printed Letterhead',
      sublabel: `Top logo pre-printed on pad · Leaves ${headerMarginMm}mm blank margin`,
      icon: Layers,
      badge: `${headerMarginMm}mm Top`,
    },
    {
      type: 'PREPRINTED_HEADER_AND_FOOTER',
      label: 'Pre-Printed Header & Footer',
      sublabel: `Both top & bottom pre-printed · Leaves ${headerMarginMm}mm top & ${footerMarginMm}mm bottom`,
      icon: Printer,
      badge: 'Both Blank',
    },
  ];

  return (
    <div className="relative inline-flex items-center text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'h-8 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs',
          isOpen
            ? 'border-primary ring-1 ring-primary bg-primary/5 text-primary'
            : 'border-border bg-card text-foreground hover:bg-muted',
        )}
        title="Change printer paper format"
      >
        {stationeryType === 'PLAIN' ? (
          <>
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Plain Paper</span>
          </>
        ) : stationeryType === 'PREPRINTED_HEADER' ? (
          <>
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Letterhead ({headerMarginMm}mm)</span>
          </>
        ) : (
          <>
            <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Letterhead Both</span>
          </>
        )}
        <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 rounded-xl bg-card border border-border shadow-xl z-50 p-2 space-y-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold border-b border-border flex items-center justify-between">
            <span>Physical Printer Stationery</span>
            <span>Ctrl+P Format</span>
          </div>

          {/* Option List */}
          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = stationeryType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    onChange(opt.type);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full p-2 rounded-lg text-left flex items-start gap-2.5 transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/70 text-foreground',
                  )}
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs">{opt.label}</span>
                      {opt.badge && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {opt.sublabel}
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Quick Screen Preview Toggle */}
          <div className="pt-2 border-t border-border px-2 py-1.5 flex items-center justify-between">
            <label
              htmlFor="simulate-stationery-toggle"
              className="text-[11px] text-muted-foreground flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Simulate blank pad on screen</span>
            </label>
            <input
              id="simulate-stationery-toggle"
              type="checkbox"
              checked={simulateBlankStationery}
              onChange={(e) => onToggleSimulate(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
            />
          </div>

          {/* Settings Link */}
          <div className="pt-1 border-t border-border px-2 py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 py-0.5 transition-colors"
            >
              <Sliders className="w-3 h-3 text-primary" />
              <span>Calibrate Millimeter Margins in Settings →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
