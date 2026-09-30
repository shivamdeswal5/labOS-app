'use client';

import * as React from 'react';
import { Upload, CheckCircle2, Award, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabProfile } from '../types';

interface BrandingLetterheadSectionProps {
  profile: LabProfile;
  onChange: (updated: Partial<LabProfile>) => void;
}

const ACCREDITED_SWATCHES = [
  { hex: '#0F172A', label: 'Slate Deep (Recommended)' },
  { hex: '#18181B', label: 'Zinc Neutral' },
  { hex: '#27272A', label: 'Dark Charcoal' },
  { hex: '#3F3F46', label: 'Medium Carbon' },
  { hex: '#52525B', label: 'Slate Muted' },
];

export function BrandingLetterheadSection({ profile, onChange }: BrandingLetterheadSectionProps) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Section 02
          </span>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Diagnostic Brand Identity &amp; Printed Collateral
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-foreground text-xs font-mono font-medium border border-border">
          <Award className="w-3.5 h-3.5 text-primary" />
          <span>Statutory Letterhead Spec</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logo Asset Preview */}
        <div className="lg:col-span-5 bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Official Letterhead Insignia
            </span>
            <div className="h-28 bg-card rounded-md border border-border flex items-center justify-center p-4 relative shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-lg">
                  AD
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight text-foreground">
                    APEX DIAGNOSTIC
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                    Clinical Pathology Lab
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-foreground truncate">
                apex_diagnostics_primary_vector.svg
              </span>
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                248 KB · Scalable
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 px-3.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Logo</span>
            </button>
            <button
              type="button"
              className="h-8 px-3.5 bg-card text-foreground hover:bg-muted rounded-md text-xs font-medium border border-border transition-colors"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Letterhead Accent Color Swatches */}
        <div className="lg:col-span-7 bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Hardcopy Report Accent Swatch
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Applied exclusively to the top structural header bar and perimeter divider on printed/PDF patient test certificates. System UI remains strictly clinical monochrome.
              </p>
            </div>

            {/* Hex Input and Active Swatch */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md border border-border shadow-sm shrink-0"
                style={{ backgroundColor: profile.accentColor }}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={profile.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="w-full h-10 px-3.5 bg-card border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {ACCREDITED_SWATCHES.find((s) => s.hex.toLowerCase() === profile.accentColor.toLowerCase())?.label || 'Custom Swatch'}
              </span>
            </div>

            {/* Approved Accreditation Swatches */}
            <div>
              <span className="text-[11px] font-mono text-muted-foreground uppercase block mb-1.5 font-semibold">
                Accredited Diagnostic Palette
              </span>
              <div className="flex items-center gap-2">
                {ACCREDITED_SWATCHES.map((swatch) => {
                  const isSelected = profile.accentColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onChange({ accentColor: swatch.hex })}
                      className={cn(
                        'w-8 h-8 rounded-md shadow-sm transition-all duration-150',
                        isSelected ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'hover:scale-105 opacity-85 hover:opacity-100',
                      )}
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.label}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-card p-3 rounded-md border border-border text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="font-mono text-[11px]">
              Monochrome PDF test pattern adheres to NABL clinical readability clause 5.8.3.
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Footer Disclaimer Note */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Statutory Legal Footer Disclaimer Note
          </label>
        </div>
        <input
          type="text"
          value={profile.footerNote || ''}
          onChange={(e) => onChange({ footerNote: e.target.value })}
          className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
          placeholder="NOT VALID FOR MEDICO LEGAL PURPOSE"
        />
        <p className="text-xs font-mono text-muted-foreground">
          Mandatory disclaimer printed at the bottom of all clinical pathology sheets.
        </p>
      </div>
    </div>
  );
}
