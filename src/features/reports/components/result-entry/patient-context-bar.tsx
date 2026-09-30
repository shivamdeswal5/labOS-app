'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Clock,
  User,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import type { DetailedReport } from '../../types';

interface PatientContextBarProps {
  report: DetailedReport;
}

export function PatientContextBar({ report }: PatientContextBarProps) {
  const patient = report.patient;
  const isFinalized = report.status === 'FINALIZED';

  // Compute total panel titles
  const panelTitles = report.reportPanels
    ?.map((rp) => rp.panel?.name)
    .filter(Boolean)
    .join(', ') || 'Diagnostic Panel';

  return (
    <div className="w-full bg-card border-b border-border px-4 py-2.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Accession & Patient Metadata */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <Link
            href="/"
            className="p-1 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          {/* Accession ID Badge */}
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary text-primary-foreground tracking-wide">
            Report #{report.reportNumber}
          </span>

          <span className="text-muted-foreground hidden sm:inline">|</span>

          {/* Patient Name & Demographics */}
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-semibold">{patient?.name || 'Walk-in Patient'}</span>
            <span className="text-muted-foreground font-normal">
              ({patient?.age ? `${patient.age}Y` : 'Age N/A'} / {patient?.sex || 'Unknown'})
            </span>
          </div>

          <span className="text-muted-foreground hidden md:inline">|</span>

          {/* Referring Doctor */}
          <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>
              Ref: <strong className="text-foreground font-medium">{report.refByDoctor?.name || 'Self / Direct'}</strong>
            </span>
          </div>

          <span className="text-muted-foreground hidden lg:inline">|</span>

          {/* Panel Name */}
          <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground truncate max-w-xs xl:max-w-md">
            <FlaskConical className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate" title={panelTitles}>
              Test: <span className="text-foreground font-medium">{panelTitles}</span>
            </span>
          </div>
        </div>

        {/* Right: Telemetry & Finalization Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            <span>TAT: 45m</span>
          </div>

          {isFinalized ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              STATUS: FINALIZED & SIGNED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              STATUS: DRAFT (EDITABLE)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
