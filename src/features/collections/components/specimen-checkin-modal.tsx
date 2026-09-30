'use client';

import * as React from 'react';
import {
  X,
  CheckCircle2,
  Barcode,
  ThermometerSnowflake,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollectionRequest } from '../types';

interface SpecimenCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CollectionRequest;
  onConfirmCheckin: (temperature: string, notes: string) => void;
  isCheckingIn?: boolean;
}

export function SpecimenCheckinModal({
  isOpen,
  onClose,
  collection,
  onConfirmCheckin,
  isCheckingIn = false,
}: SpecimenCheckinModalProps) {
  const [temperature, setTemperature] = React.useState('4.2');
  const [handoverNotes, setHandoverNotes] = React.useState(
    'Cold box seal intact. Samples transferred to specimen reception rack.',
  );
  const [verifiedTubes, setVerifiedTubes] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    collection.samples.forEach((s) => {
      initial[s.id] = true;
    });
    return initial;
  });

  if (!isOpen) return null;

  const toggleTube = (id: string) => {
    setVerifiedTubes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCheckin(`${temperature}°C`, handoverNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Lab Bench Handover & Check-in</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Booking {collection.requestNumber} • Runner: {collection.assignedPhlebotomistName || 'Field Runner'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          {/* Patient summary */}
          <div className="p-3 rounded-md bg-secondary/50 border border-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">{collection.patientName}</div>
              <div className="text-muted-foreground text-[11px]">
                {collection.patientAge}Y / {collection.patientSex} • {collection.patientPhone}
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-muted-foreground">
              Collected: <span className="text-foreground font-semibold">Today</span>
            </div>
          </div>

          {/* Cold chain temperature check */}
          <div>
            <label className="block text-foreground font-medium mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-500" />
                <span>Cold Box Receiving Temperature (°C) *</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Compliant (2.0°C – 8.0°C)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                required
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                °C
              </span>
            </div>
          </div>

          {/* Tube Barcode Verification */}
          <div>
            <label className="block text-foreground font-medium mb-1.5 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-primary" />
              <span>Verify Physical Vacutainer Tubes Received ({collection.samples.length})</span>
            </label>

            {collection.samples.length === 0 ? (
              <p className="p-3 bg-muted/40 rounded border border-border text-muted-foreground">
                No individual tube barcodes pre-registered. Technician will scan during accession intake.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {collection.samples.map((sample) => {
                  const isChecked = !!verifiedTubes[sample.id];
                  return (
                    <label
                      key={sample.id}
                      className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTube(sample.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="font-mono">
                          <span className="font-bold text-foreground">{sample.barcode}</span>
                          <span className="text-muted-foreground ml-1.5">({sample.tubeType})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Physical Intact</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bench Notes */}
          <div>
            <label className="block text-foreground font-medium mb-1">
              Accession Bench Remarks & Custody Log
            </label>
            <input
              type="text"
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isCheckingIn}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCheckingIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCheckingIn ? 'Processing Handover...' : 'Confirm Bench Check-in'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
