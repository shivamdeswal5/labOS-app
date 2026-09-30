'use client';

import * as React from 'react';
import { FlaskConical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingStep } from '../../types';

const STEPS: { step: OnboardingStep; label: string; sublabel: string }[] = [
  { step: 1, label: 'Lab Profile', sublabel: 'Facility & branding' },
  { step: 2, label: 'Pathologist', sublabel: 'Signatures & credentials' },
  { step: 3, label: 'Test Catalog', sublabel: 'Panel seeding' },
  { step: 4, label: 'Confirm', sublabel: 'All set!' },
];

interface OnboardingLayoutProps {
  currentStep: OnboardingStep;
  children: React.ReactNode;
}

export function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top brand bar */}
      <header className="h-14 border-b border-border flex items-center px-6 gap-3 bg-card">
        <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
          LO
        </div>
        <span className="font-semibold text-sm text-foreground tracking-tight">LabOS</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
          Setup Wizard
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start py-6 px-4">
        {/* Step progress rail */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center">
            {STEPS.map((s, idx) => {
              const isCompleted = s.step < currentStep;
              const isActive = s.step === currentStep;

              return (
                <React.Fragment key={s.step}>
                  {/* Step dot */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isActive
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted border-border text-muted-foreground',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{s.step}</span>
                      )}
                    </div>
                    <div className="text-center hidden sm:block">
                      <p
                        className={cn(
                          'text-[11px] font-semibold',
                          isActive ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {s.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {s.sublabel}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2 transition-all duration-500',
                        s.step < currentStep ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step content card */}
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>LabOS · Precision-engineered for independent diagnostic labs · India</span>
        </div>
      </div>
    </div>
  );
}
