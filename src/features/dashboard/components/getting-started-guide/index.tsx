'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Building2,
  FileSignature,
  FilePlus2,
  Printer,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LabProfile } from '@/features/settings/types';
import type { DashboardStatsDto } from '../../types';

interface GettingStartedGuideProps {
  profile?: LabProfile;
  stats?: DashboardStatsDto;
}

export function GettingStartedGuide({ profile, stats }: GettingStartedGuideProps) {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('labos_setup_guide_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('labos_setup_guide_dismissed', 'true');
    } catch {
      // Ignored
    }
  };

  // Compute checklist milestones
  const isProfileComplete = Boolean(profile?.name && profile?.address);
  const isSignatureReady = Boolean(profile?.printSettings);
  const isFirstSampleRegistered = (stats?.todayReportsCount ?? 0) > 0;
  const isPrinterCalibrated = Boolean(profile?.printSettings?.stationeryType);

  const steps = [
    {
      id: 'profile',
      title: 'Lab Profile & NABL Identity',
      description: 'Configure legal facility name, address, and contact numbers.',
      isCompleted: isProfileComplete,
      href: '/settings',
      cta: 'Edit Profile',
      icon: Building2,
    },
    {
      id: 'signature',
      title: 'Pathologist Digital Sign-Off',
      description: 'Set doctor credentials and upload tamper-proof digital signature.',
      isCompleted: isSignatureReady,
      href: '/settings',
      cta: 'Set Signature',
      icon: FileSignature,
    },
    {
      id: 'sample',
      title: 'Register First Patient Sample',
      description: 'Intake patient demographics and allocate Code-128 accession barcode.',
      isCompleted: isFirstSampleRegistered,
      href: '/reports/new',
      cta: 'Intake Patient',
      icon: FilePlus2,
    },
    {
      id: 'printer',
      title: 'Calibrate Thermal & Letterhead Printer',
      description: 'Verify 50×25mm thermal stickers and 0.1mm pre-printed paper margins.',
      isCompleted: isPrinterCalibrated,
      href: '/settings',
      cta: 'Calibrate Margins',
      icon: Printer,
    },
  ];

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // If dismissed or lab has already registered multiple samples and completed setup, hide
  if (isDismissed || (completedCount === steps.length && (stats?.todayReportsCount ?? 0) >= 3)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06] overflow-hidden shadow-xs transition-all">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Getting Started with LabOS
              </h2>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                {completedCount} of {steps.length} Complete ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete these steps to set up your station for daily walk-in diagnostics and NABL reporting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1 transition-colors"
            title={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {isCollapsed ? (
              <>
                <span>Expand</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted/60 h-1">
        <div
          className="bg-primary h-1 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Grid (Collapsible) */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                  step.isCompleted
                    ? 'bg-background/60 border-border/70 text-muted-foreground'
                    : 'bg-card border-border shadow-xs hover:border-primary/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground font-semibold uppercase">
                      Step 0{idx + 1}
                    </span>
                    {step.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${step.isCompleted ? 'text-muted-foreground' : 'text-primary'}`} />
                    <div>
                      <h3 className={`text-xs font-semibold ${step.isCompleted ? 'text-foreground line-through opacity-75' : 'text-foreground'}`}>
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {!step.isCompleted && (
                  <Button asChild size="sm" variant="outline" className="w-full h-7 text-xs font-semibold gap-1 hover:border-primary hover:text-primary">
                    <Link href={step.href}>
                      <span>{step.cta}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
