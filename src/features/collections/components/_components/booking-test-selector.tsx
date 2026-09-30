'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import type { Phlebotomist } from '../../types';

export const COMMON_TESTS = [
  'Complete Blood Count (CBC)',
  'Lipid Profile Extended',
  'HbA1c & Fasting Blood Sugar',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (TSH/T3/T4)',
  'Urine Routine & Microscopy',
  'Vitamin D3 (25-OH)',
];

interface BookingTestSelectorProps {
  selectedTests: string[];
  onToggleTest: (test: string) => void;
  assignedPhlebotomistId: string;
  onPhlebotomistChange: (val: string) => void;
  phlebotomists: Phlebotomist[];
  specialInstructions: string;
  onSpecialInstructionsChange: (val: string) => void;
}

export function BookingTestSelector({
  selectedTests,
  onToggleTest,
  assignedPhlebotomistId,
  onPhlebotomistChange,
  phlebotomists,
  specialInstructions,
  onSpecialInstructionsChange,
}: BookingTestSelectorProps) {
  return (
    <>
      <div className="space-y-2 pt-2 border-t border-border">
        <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          04. Required Tests &amp; Specimen Tubes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_TESTS.map((test) => {
            const isChecked = selectedTests.includes(test);
            return (
              <button
                key={test}
                type="button"
                onClick={() => onToggleTest(test)}
                className={`flex items-center gap-2 p-2 rounded-md border text-left text-xs transition-colors ${
                  isChecked
                    ? 'bg-primary/5 border-primary text-foreground font-semibold'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                  }`}
                >
                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="truncate">{test}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          05. Phlebotomist Pre-Assignment (Optional)
        </h3>

        <select
          value={assignedPhlebotomistId}
          onChange={(e) => onPhlebotomistChange(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
        >
          <option value="">Leave Unassigned (Dispatch Later)</option>
          {phlebotomists.map((phleb) => (
            <option key={phleb.id} value={phleb.id}>
              {phleb.name} ({phleb.currentZone} • {phleb.status} • {phleb.activeAssignmentsCount} active)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <label className="block text-foreground font-medium">Special Instructions / Landmarks</label>
        <input
          type="text"
          value={specialInstructions}
          onChange={(e) => onSpecialInstructionsChange(e.target.value)}
          placeholder="e.g. Ring doorbell twice. Senior citizen with hard-to-find veins."
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
      </div>
    </>
  );
}
