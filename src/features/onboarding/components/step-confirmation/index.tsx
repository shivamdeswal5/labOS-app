'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Building2,
  Stethoscope,
  FlaskConical,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import type { OnboardingWizardState } from '../../types';
import { setLabIdCookie } from '@/providers/auth-provider';

interface StepConfirmationProps {
  state: OnboardingWizardState;
}

export function StepConfirmation({ state }: StepConfirmationProps) {
  const { labProfile, pathologist, catalog } = state;

  React.useEffect(() => {
    // Set presence flag so Edge Middleware recognizes onboarding completion
    setLabIdCookie(true);
  }, []);
  const seededPanels = catalog.panels.filter((p) => p.selected);

  return (
    <div>
      {/* Step header */}
      <div className="px-8 py-6 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Your lab is ready!
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Here&apos;s a summary of what was configured. You can edit everything from Settings.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Success badge */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Onboarding complete
            </p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-0.5">
              All data has been saved. Your diagnostic workstation is live.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="space-y-3">
          {/* Lab profile summary */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
            <Building2 className="w-4.5 h-4.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lab Profile
              </p>
              <p className="text-sm font-semibold text-foreground mt-1 truncate">
                {labProfile.name || '—'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {labProfile.address}
              </p>
              {labProfile.nablRegistrationId && (
                <span className="inline-flex items-center mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  NABL {labProfile.nablRegistrationId}
                </span>
              )}
            </div>
          </div>

          {/* Pathologist summary */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
            <Stethoscope className="w-4.5 h-4.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pathologist / Signatory
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {pathologist.fullName || '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pathologist.qualification}
                {pathologist.councilRegistrationNumber
                  ? ` · Reg. ${pathologist.councilRegistrationNumber}`
                  : ''}
              </p>
              {pathologist.signatureUrl && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Digital signature uploaded
                </p>
              )}
            </div>
          </div>

          {/* Catalog summary */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
            <FlaskConical className="w-4.5 h-4.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 w-full">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Test Catalog Seeded
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {seededPanels.length} panels activated
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {seededPanels.slice(0, 6).map((p) => (
                  <span
                    key={p.code}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground"
                  >
                    {p.code}
                  </span>
                ))}
                {seededPanels.length > 6 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                    +{seededPanels.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go to dashboard */}
      <div className="px-8 py-5 border-t border-border bg-muted/20 flex justify-center">
        <button
          id="ob-go-to-dashboard"
          type="button"
          onClick={() => {
            setLabIdCookie(true);
            window.location.href = '/';
          }}
          className="flex items-center gap-2.5 px-8 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <LayoutDashboard className="w-4 h-4" />
          Go to Mission Control Dashboard
        </button>
      </div>
    </div>
  );
}
