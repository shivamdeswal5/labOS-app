'use client';

import * as React from 'react';
import { Award, FileText, CheckCircle2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabProfile } from '../types';

interface BrandingLetterheadSectionProps {
  profile: LabProfile;
  onChange: (updated: Partial<LabProfile>) => void;
}

const ACCREDITED_SWATCHES = [
  { hex: '#0F766E', label: 'Teal Clinical (Recommended)' },
  { hex: '#0F172A', label: 'Slate Deep' },
  { hex: '#1E3A8A', label: 'Navy Diagnostic' },
  { hex: '#15803D', label: 'Forest Medical' },
  { hex: '#374151', label: 'Charcoal Neutral' },
];

export function BrandingLetterheadSection({ profile, onChange }: BrandingLetterheadSectionProps) {
  const [logoInput, setLogoInput] = React.useState(profile.logoUrl || '');
  const [showLogoInput, setShowLogoInput] = React.useState(false);

  const initialLetter = (profile.name || 'D').trim().charAt(0).toUpperCase();
  const accentColor = profile.accentColor || '#0f766e';

  const handleApplyLogoUrl = () => {
    onChange({ logoUrl: logoInput.trim() ? logoInput.trim() : null });
    setShowLogoInput(false);
  };

  const handleRemoveLogo = () => {
    setLogoInput('');
    onChange({ logoUrl: null });
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Section 02
          </span>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Report Header &amp; Digital Letterhead
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-foreground text-xs font-mono font-medium border border-border">
          <Award className="w-3.5 h-3.5 text-primary" />
          <span>Branding Spec</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Branded Header Preview */}
        <div className="lg:col-span-6 bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Letterhead Header Preview
            </span>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-md border border-border shadow-xs">
              <div className="flex items-center gap-3">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Lab Logo"
                    className="w-12 h-12 object-contain rounded border border-border shrink-0 bg-white"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-lg text-white flex items-center justify-center font-bold font-mono text-xl shrink-0 shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    {initialLetter}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div
                    className="font-bold text-base tracking-tight truncate uppercase"
                    style={{ color: accentColor }}
                  >
                    {profile.name || 'Your Diagnostic Laboratory'}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {profile.tagline || 'Clinical Pathology, Biochemistry & Diagnostic Center'}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/80 truncate mt-0.5">
                    {profile.address || 'Lab Location'} {profile.phoneNumbers?.length ? `· Tel: ${profile.phoneNumbers[0]}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              This typography prints at the top of <strong>Plain A4 Paper</strong> reports and PDF downloads. If you use <strong>Pre-Printed Offset Letterhead Pads</strong>, this header is automatically suppressed during physical printing to save toner.
            </p>
          </div>

          {/* Logo Actions */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            {profile.logoUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                  Custom logo active
                </span>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="h-8 px-3 text-destructive hover:bg-destructive/10 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              </div>
            ) : showLogoInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 h-8 px-2.5 bg-background border border-input rounded-md text-xs font-mono text-foreground focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleApplyLogoUrl}
                  className="h-8 px-3 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoInput(false)}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Using typographic header (No logo required)
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogoInput(true)}
                  className="h-8 px-3 bg-card hover:bg-muted text-foreground border border-border rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Attach Image Logo</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Letterhead Accent Color Swatches */}
        <div className="lg:col-span-6 bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Report Brand Accent Color
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Applied to the letterhead divider and test parameter headings on patient reports and digital dispatches.
              </p>
            </div>

            {/* Hex Input and Active Swatch */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-md border border-border shadow-xs shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={profile.accentColor || '#0f766e'}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {ACCREDITED_SWATCHES.find((s) => s.hex.toLowerCase() === accentColor.toLowerCase())?.label || 'Custom Hex'}
              </span>
            </div>

            {/* Approved Accreditation Swatches */}
            <div>
              <span className="text-[11px] font-mono text-muted-foreground uppercase block mb-1.5 font-semibold">
                Clinical Pathology Palette
              </span>
              <div className="flex items-center gap-2">
                {ACCREDITED_SWATCHES.map((swatch) => {
                  const isSelected = accentColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onChange({ accentColor: swatch.hex })}
                      className={cn(
                        'w-8 h-8 rounded-md shadow-xs transition-all duration-150',
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
              High-contrast clinical palette meets ISO 15189 print readability specifications.
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
          className="w-full h-9 px-3 bg-background border border-input rounded-md text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          placeholder="NOT VALID FOR MEDICO LEGAL PURPOSE"
        />
        <p className="text-xs font-mono text-muted-foreground">
          Mandatory legal note printed at the bottom of diagnostic report certificates.
        </p>
      </div>
    </div>
  );
}
