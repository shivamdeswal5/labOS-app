'use client';

import { Fragment, type ReactNode } from 'react';
import { FlaskConical, Check, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/providers/auth-provider';
import { useLogout } from '@/features/auth/api/use-auth';
import type { OnboardingStep } from '../../types';

const STEPS: { step: OnboardingStep; label: string; sublabel: string }[] = [
  { step: 1, label: 'Lab Profile', sublabel: 'Facility & branding' },
  { step: 2, label: 'Pathologist', sublabel: 'Signatures & credentials' },
  { step: 3, label: 'Test Catalog', sublabel: 'Panel seeding' },
  { step: 4, label: 'Confirm', sublabel: 'All set!' },
];

interface OnboardingLayoutProps {
  currentStep: OnboardingStep;
  children: ReactNode;
}

export function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  const { user } = useAuthContext();
  const logout = useLogout();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top brand & account bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
            LO
          </div>
          <span className="font-semibold text-sm text-foreground tracking-tight">LabOS</span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            Setup Wizard
          </span>
        </div>

        {/* Authenticated account info & logout escape hatch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.email && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border max-w-[220px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors border border-border/60 min-h-[36px]"
            title="Sign out of this account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{logout.isPending ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start py-6 px-4">
        {/* Step progress rail */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center">
            {STEPS.map((s, idx) => {
              const isCompleted = s.step < currentStep;
              const isActive = s.step === currentStep;

              return (
                <Fragment key={s.step}>
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
                </Fragment>
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
