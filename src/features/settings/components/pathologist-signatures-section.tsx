'use client';

import * as React from 'react';
import { Upload, ShieldCheck, Check, Info } from 'lucide-react';
import type { StaffMember } from '../types';

interface PathologistSignaturesSectionProps {
  staffMembers: StaffMember[];
  onUpdateSignature?: (staffId: string, url: string) => void;
}

export function PathologistSignaturesSection({
  staffMembers,
}: PathologistSignaturesSectionProps) {
  const pathologists = staffMembers.filter(
    (s) => s.role === 'OWNER' || s.role === 'DIRECTOR' || s.role === 'PATHOLOGIST',
  );

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Statutory Signatures
            </span>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Pathologist Signatures &amp; Council Credentials
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              NABL ISO 15189 requires digital signatures of registered medical practitioners on all verified test certificates.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-foreground text-xs font-mono font-medium border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>NABL Clause 5.8 Sign-off</span>
          </div>
        </div>

        {/* Pathologist Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pathologists.map((doc, idx) => (
            <div
              key={doc.id}
              className="bg-muted/30 border border-border rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground font-bold font-mono text-sm flex items-center justify-center">
                      {doc.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        {doc.fullName}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground">
                        {doc.qualification || 'Authorized Signatory'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-secondary text-foreground border border-border">
                    {idx === 0 ? 'Chief Signatory' : 'Co-Signatory'}
                  </span>
                </div>

                <div className="bg-card p-3 rounded-md border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Council Registration:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {doc.councilRegistration || 'Not Registered / Excluded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Authorization Scope:</span>
                    <span className="font-mono text-xs text-foreground">
                      {doc.signOffScope || 'All Investigation Panels'}
                    </span>
                  </div>
                </div>

                {/* Signature Preview Canvas */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Digital Signature Stamp
                  </span>
                  <div className="h-28 bg-card rounded-md border border-dashed border-border p-3 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Visual Cursive Signature Stamp */}
                    <div className="font-serif italic text-2xl text-foreground font-bold opacity-90 select-none tracking-wide">
                      {doc.fullName.replace(/^Dr\.\s*/i, '')}
                    </div>
                    <div className="w-32 h-0.5 bg-primary/40 my-1" />
                    <div className="text-[10px] font-mono text-muted-foreground text-center">
                      Verified Digital Stamp · SHA-256 Sealed
                    </div>
                    <div className="absolute right-2 top-2 flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  className="h-8 px-3 bg-card hover:bg-muted text-foreground border border-border rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Fresh Signature (PNG/SVG)</span>
                </button>
                <button
                  type="button"
                  className="h-8 px-3 bg-secondary hover:bg-muted text-foreground border border-border rounded-md text-xs font-medium transition-colors"
                >
                  Edit Registration
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Default Interpretive Remarks Preset */}
        <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
            <Info className="w-4 h-4 text-primary" />
            <span>Standard Pathologist Advisory Template</span>
          </div>
          <textarea
            rows={2}
            defaultValue="Clinical correlation recommended. Repeat investigation advised if values do not match patient presentation. Biological reference intervals established on automated analyzers."
            className="w-full p-2.5 bg-background border border-input rounded-md text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
          />
          <p className="text-[11px] font-mono text-muted-foreground">
            Appended automatically below the final parameter group on all published report certificates.
          </p>
        </div>
      </div>
    </div>
  );
}
