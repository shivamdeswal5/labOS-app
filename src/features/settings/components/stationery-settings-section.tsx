'use client';

import * as React from 'react';
import { Printer, FileText, Layers, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabProfile, LabPrintSettings } from '../types';

interface StationerySettingsSectionProps {
  profile: LabProfile;
  onChange: (updated: Partial<LabProfile>) => void;
}

const DEFAULT_SETTINGS: LabPrintSettings = {
  stationeryType: 'PLAIN',
  headerMarginMm: 48,
  footerMarginMm: 24,
};

export function StationerySettingsSection({ profile, onChange }: StationerySettingsSectionProps) {
  const currentSettings: LabPrintSettings = {
    ...DEFAULT_SETTINGS,
    ...(profile.printSettings || {}),
  };

  const handleUpdate = (updates: Partial<LabPrintSettings>) => {
    onChange({
      printSettings: {
        ...currentSettings,
        ...updates,
      },
    });
  };

  const isPreprintedHeader =
    currentSettings.stationeryType === 'PREPRINTED_HEADER' ||
    currentSettings.stationeryType === 'PREPRINTED_HEADER_AND_FOOTER';

  const isPreprintedFooter =
    currentSettings.stationeryType === 'PREPRINTED_HEADER_AND_FOOTER';

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Section 03
          </span>
          <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <span>Physical Paper &amp; Pre-Printed Letterhead Calibration</span>
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-foreground text-xs font-mono font-medium border border-border">
          <span>Physical Print Mode: {currentSettings.stationeryType}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Select your physical printer paper type. If your laboratory uses custom offset-printed paper pads with pre-printed logos from a local printing press, LabOS will leave blank margins so clinical test results print perfectly in between.
      </p>

      {/* Paper Type Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Plain A4 Paper */}
        <button
          type="button"
          onClick={() => handleUpdate({ stationeryType: 'PLAIN' })}
          className={cn(
            'p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-150',
            currentSettings.stationeryType === 'PLAIN'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-primary" />
              {currentSettings.stationeryType === 'PLAIN' && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="font-semibold text-sm text-foreground">Plain A4 Paper</div>
            <p className="text-xs text-muted-foreground">
              Standard 75–80 GSM blank copier paper. Software prints the complete header, logo, test tables, and legal footer.
            </p>
          </div>
          <span className="mt-4 font-mono text-[10px] text-muted-foreground uppercase font-semibold">
            Full Digital Print
          </span>
        </button>

        {/* Option 2: Pre-Printed Header */}
        <button
          type="button"
          onClick={() => handleUpdate({ stationeryType: 'PREPRINTED_HEADER' })}
          className={cn(
            'p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-150',
            currentSettings.stationeryType === 'PREPRINTED_HEADER'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {currentSettings.stationeryType === 'PREPRINTED_HEADER' && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="font-semibold text-sm text-foreground">Pre-Printed Header</div>
            <p className="text-xs text-muted-foreground">
              Paper pad has top logo/name already printed. Software leaves a calibrated blank top margin and prints results below.
            </p>
          </div>
          <span className="mt-4 font-mono text-[10px] text-muted-foreground uppercase font-semibold">
            Blank Header Margin
          </span>
        </button>

        {/* Option 3: Pre-Printed Header & Footer */}
        <button
          type="button"
          onClick={() => handleUpdate({ stationeryType: 'PREPRINTED_HEADER_AND_FOOTER' })}
          className={cn(
            'p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-150',
            currentSettings.stationeryType === 'PREPRINTED_HEADER_AND_FOOTER'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {currentSettings.stationeryType === 'PREPRINTED_HEADER_AND_FOOTER' && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="font-semibold text-sm text-foreground">Pre-Printed Both</div>
            <p className="text-xs text-muted-foreground">
              Stationery has both top letterhead and bottom branch/accreditation pre-printed. Software prints strictly in between.
            </p>
          </div>
          <span className="mt-4 font-mono text-[10px] text-muted-foreground uppercase font-semibold">
            Blank Header &amp; Footer
          </span>
        </button>
      </div>

      {/* Millimeter Offset Calibration (Active when using pre-printed stationery) */}
      {isPreprintedHeader && (
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Physical Millimeter Calibration
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">
              Standard Indian Letterhead: ~45–55mm
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Margin Spacer */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Top Blank Space (Header Height)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdate({ headerMarginMm: Math.max(10, currentSettings.headerMarginMm - 1) })}
                    className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                    title="Decrease 1mm"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-primary px-2.5 py-0.5 rounded bg-card border border-border min-w-[54px] text-center">
                    {currentSettings.headerMarginMm} mm
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ headerMarginMm: Math.min(80, currentSettings.headerMarginMm + 1) })}
                    className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                    title="Increase 1mm"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={1}
                value={currentSettings.headerMarginMm}
                onChange={(e) => handleUpdate({ headerMarginMm: Number(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-mono">Presets:</span>
                {[15, 30, 48, 60].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleUpdate({ headerMarginMm: preset })}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono border transition-colors',
                      currentSettings.headerMarginMm === preset
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {preset}mm
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Measure with a ruler from the top edge of your paper to the bottom of the pre-printed logo.
              </p>
            </div>

            {/* Footer Margin Spacer (if pre-printed both) */}
            {isPreprintedFooter && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Bottom Blank Space (Footer Height)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdate({ footerMarginMm: Math.max(10, currentSettings.footerMarginMm - 1) })}
                      className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                      title="Decrease 1mm"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-primary px-2.5 py-0.5 rounded bg-card border border-border min-w-[54px] text-center">
                      {currentSettings.footerMarginMm} mm
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdate({ footerMarginMm: Math.min(60, currentSettings.footerMarginMm + 1) })}
                      className="w-6 h-6 rounded border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center transition-colors"
                      title="Increase 1mm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={currentSettings.footerMarginMm}
                  onChange={(e) => handleUpdate({ footerMarginMm: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-mono">Presets:</span>
                  {[15, 24, 35, 45].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleUpdate({ footerMarginMm: preset })}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-mono border transition-colors',
                        currentSettings.footerMarginMm === preset
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {preset}mm
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Measure from the bottom edge of your sheet to the top of the pre-printed footer text.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Golden Rule Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 text-xs">
        <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Patient PDF &amp; WhatsApp Protection:</strong> When sending reports digitally via WhatsApp or PDF download, LabOS will <em>always include your full branded digital letterhead</em>, ensuring patients and consulting doctors viewing on phones receive complete laboratory identification.
        </p>
      </div>
    </div>
  );
}
