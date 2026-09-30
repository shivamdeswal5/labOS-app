'use client';

import * as React from 'react';
import { Check, Shield, Stethoscope, FlaskConical, Truck, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useRBAC } from '../../hooks/use-rbac';
import type { AppRole } from '../../types/rbac.types';
import { ROLE_METADATA } from '../../types/rbac.types';

interface RoleSimulatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERSONA_ICONS: Record<AppRole, React.ComponentType<{ className?: string }>> = {
  OWNER: Shield,
  PATHOLOGIST: Stethoscope,
  TECHNICIAN: FlaskConical,
  PHLEBOTOMIST: Truck,
};

export function RoleSimulatorDialog({ isOpen, onClose }: RoleSimulatorDialogProps) {
  const { currentRole, canSimulate, isSimulating, setSimulatedRole, resetRole } = useRBAC();

  const handleSelectRole = (role: AppRole) => {
    setSimulatedRole(role);
    onClose();
  };

  const handleReset = () => {
    resetRole();
    onClose();
  };

  // Defense-in-depth: if not authorized to simulate, refuse rendering
  if (!canSimulate) return null;

  const personas: AppRole[] = ['OWNER', 'PATHOLOGIST', 'TECHNICIAN', 'PHLEBOTOMIST'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Role & Persona Simulator</span>
        </div>
      }
      description="Preview LabOS through different staff perspectives to test workflow isolation and access boundaries."
    >
      {/* Enterprise Security Callout */}
      <div className="mb-3 px-3 py-2 rounded-lg bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>
          <strong>Director Access Console:</strong> Only authenticated Lab Owners can simulate viewpoints. In production, staff accounts (Technicians, Phlebotomists) are cryptographically locked to their assigned NABL roles.
        </span>
      </div>

      <div className="space-y-3 py-1">
        {personas.map((role) => {
          const meta = ROLE_METADATA[role];
          const Icon = PERSONA_ICONS[role];
          const isSelected = currentRole === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => handleSelectRole(role)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border/70 hover:border-border hover:bg-muted/50'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground group-hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {meta.simulatedName}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border font-mono ${meta.badgeColorClass}`}>
                      {meta.badgeLabel}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary font-mono shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium text-foreground/80 mt-0.5">
                  {meta.simulatedTitle}
                </div>

                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <div>
          {isSimulating && (
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-medium">
              Simulation Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSimulating && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs gap-1.5 h-8"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to My Account</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
