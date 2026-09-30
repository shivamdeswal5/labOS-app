'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Ruler,
  Sliders,
  Check,
  RotateCcw,
  Loader2,
  Printer,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StationeryType } from '@/features/settings/types';

interface LetterheadCalibrationBarProps {
  stationeryType: StationeryType;
  headerMarginMm: number;
  footerMarginMm: number;
  onHeaderMarginChange: (mm: number) => void;
  onFooterMarginChange: (mm: number) => void;
  simulateBlankStationery: boolean;
  onToggleSimulate: (val: boolean) => void;
  onSaveAsDefault: () => void;
  isSavingDefault: boolean;
  isModified: boolean;
  savedHeaderMargin: number;
  savedFooterMargin: number;
  onResetToDefault: () => void;
}

const HEADER_PRESETS = [
  { label: '15mm', sublabel: 'Slim Banner', value: 15 },
  { label: '30mm', sublabel: 'Compact', value: 30 },
  { label: '48mm', sublabel: 'Standard', value: 48 },
  { label: '60mm', sublabel: 'Large Pad', value: 60 },
];

const FOOTER_PRESETS = [
  { label: '15mm', value: 15 },
  { label: '24mm', value: 24 },
  { label: '35mm', value: 35 },
];

export function LetterheadCalibrationBar({
  stationeryType,
  headerMarginMm,
  footerMarginMm,
  onHeaderMarginChange,
  onFooterMarginChange,
  simulateBlankStationery,
  onToggleSimulate,
  onSaveAsDefault,
  isSavingDefault,
  isModified,
  savedHeaderMargin,
  savedFooterMargin,
  onResetToDefault,
}: LetterheadCalibrationBarProps) {
  const isPreprintedFooter = stationeryType === 'PREPRINTED_HEADER_AND_FOOTER';

  return (
    <div className="w-full bg-card/95 backdrop-blur-md rounded-xl border border-teal-500/30 p-3 sm:p-4 shadow-sm space-y-3 print:hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Row: Title, Mode Indicator & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground">
                Pre-Printed Letterhead Live Calibration
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider">
                {stationeryType === 'PREPRINTED_HEADER' ? 'Top Pad Only' : 'Top & Bottom Pad'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Nudge millimeters and watch the document sheet adjust instantly below. 100% exact to physical paper.
            </p>
          </div>
        </div>

        {/* Right Actions: Simulate Toggle, Save As Default, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Screen Simulation */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleSimulate(!simulateBlankStationery)}
            className="h-7 text-xs gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
            title={simulateBlankStationery ? 'View with digital header' : 'View physical blank letterhead zone'}
          >
            {simulateBlankStationery ? (
              <>
                <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden md:inline">Showing Blank Pad</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden md:inline">Peeking Digital Header</span>
              </>
            )}
          </Button>

          {/* Reset if modified */}
          {isModified && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetToDefault}
              className="h-7 text-xs gap-1 px-2 text-muted-foreground hover:text-foreground"
              title="Reset to saved lab defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          {/* Save as Lab Default Button */}
          {isModified ? (
            <Button
              type="button"
              size="sm"
              onClick={onSaveAsDefault}
              disabled={isSavingDefault}
              className="h-7 text-xs font-semibold gap-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white shadow-xs animate-pulse"
              title="Persist this millimeter margin as the default for all future reports"
            >
              {isSavingDefault ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Save as Lab Default</span>
                </>
              )}
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] border border-emerald-200 dark:border-emerald-900/40">
              <Check className="w-3 h-3" />
              <span>
                Lab Default Saved ({isPreprintedFooter ? `${savedHeaderMargin}mm / ${savedFooterMargin}mm` : `${savedHeaderMargin}mm`})
              </span>
            </div>
          )}

          {/* Direct Print Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-7 text-xs gap-1.5 px-2.5 bg-card"
            title="Send test print to physical printer (Ctrl+P)"
          >
            <Printer className="w-3 h-3" />
            <span className="hidden sm:inline">Test Print</span>
          </Button>
        </div>
      </div>

      {/* Bottom Row: Nudge Steppers & Fast Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Top Header Margin Stepper */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              Top Blank Margin:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onHeaderMarginChange(Math.max(10, headerMarginMm - 5))}
                className="h-6 px-1.5 rounded border border-border bg-card hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                title="Decrease 5mm"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => onHeaderMarginChange(Math.max(10, headerMarginMm - 1))}
                className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                title="Decrease 1mm"
              >
                -
              </button>
              <span className="font-mono font-bold text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 min-w-[58px] text-center text-xs">
                {headerMarginMm} mm
              </span>
              <button
                type="button"
                onClick={() => onHeaderMarginChange(Math.min(80, headerMarginMm + 1))}
                className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                title="Increase 1mm"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => onHeaderMarginChange(Math.min(80, headerMarginMm + 5))}
                className="h-6 px-1.5 rounded border border-border bg-card hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                title="Increase 5mm"
              >
                +5
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {HEADER_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onHeaderMarginChange(p.value)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-mono border transition-colors',
                  headerMarginMm === p.value
                    ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold ring-1 ring-teal-500'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
                title={`${p.label} - ${p.sublabel}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Footer Margin Stepper (If pre-printed both) */}
        {isPreprintedFooter ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                Bottom Blank Margin:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onFooterMarginChange(Math.max(10, footerMarginMm - 5))}
                  className="h-6 px-1.5 rounded border border-border bg-card hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                  title="Decrease 5mm"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => onFooterMarginChange(Math.max(10, footerMarginMm - 1))}
                  className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                  title="Decrease 1mm"
                >
                  -
                </button>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 min-w-[58px] text-center text-xs">
                  {footerMarginMm} mm
                </span>
                <button
                  type="button"
                  onClick={() => onFooterMarginChange(Math.min(60, footerMarginMm + 1))}
                  className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                  title="Increase 1mm"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onFooterMarginChange(Math.min(60, footerMarginMm + 5))}
                  className="h-6 px-1.5 rounded border border-border bg-card hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                  title="Increase 5mm"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Footer Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FOOTER_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onFooterMarginChange(p.value)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono border transition-colors',
                    footerMarginMm === p.value
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-start md:justify-end gap-2 text-[11px] text-muted-foreground font-mono">
            <span>Ruler Guide:</span>
            <span>Measure paper top edge to bottom of printed logo</span>
            <Link
              href="/settings"
              className="text-primary hover:underline flex items-center gap-1 ml-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Full Settings</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
